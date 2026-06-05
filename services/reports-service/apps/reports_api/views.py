import json
import os
from urllib import error, request as urllib_request
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Report, ReportLine
from .serializers import CreateReportSerializer, ReportSerializer


ASSIGNMENTS_SERVICE_URL = os.getenv('ASSIGNMENTS_SERVICE_URL', 'http://127.0.0.1:4004').rstrip('/')
TEAMS_SERVICE_URL = os.getenv('TEAMS_SERVICE_URL', 'http://127.0.0.1:4003').rstrip('/')


def fetch_collection(url: str, unavailable_message: str) -> tuple[list | None, Response | None]:
    req = urllib_request.Request(url=url, method='GET')

    try:
        with urllib_request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode('utf-8')), None
    except error.HTTPError as http_error:
        return None, Response({'message': unavailable_message}, status=http_error.code)
    except Exception:
        return None, Response({'message': unavailable_message}, status=status.HTTP_502_BAD_GATEWAY)


def parse_performed_score(value: str) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def get_existing_performed_total(assignment_id: str) -> float:
    total = 0.0
    for work_done in ReportLine.objects.filter(assignment_id=assignment_id).values_list('work_done', flat=True):
        performed_score = parse_performed_score(work_done)
        if performed_score is not None:
            total += performed_score

    return total


def update_assignment_progress(assignment_id: str, objective: float, performed_total: float) -> Response | None:
    progress = 100 if objective <= 0 else min(100, round((performed_total / objective) * 100))
    payload = {
        'progress': progress,
        'status': 'COMPLETED' if progress >= 100 else 'IN_PROGRESS',
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib_request.Request(
        url=f'{ASSIGNMENTS_SERVICE_URL}/api/assignments/{assignment_id}',
        data=data,
        headers={'Content-Type': 'application/json'},
        method='PUT',
    )

    try:
        with urllib_request.urlopen(req, timeout=5):
            return None
    except error.HTTPError as http_error:
        return Response({'message': 'Failed to update assignment progress.'}, status=http_error.code)
    except Exception:
        return Response({'message': 'Assignments service unavailable.'}, status=status.HTTP_502_BAD_GATEWAY)


def sync_assignment_progress(lines: list[dict]) -> Response | None:
    if not lines:
        return None

    assignments, error_response = fetch_collection(
        f'{ASSIGNMENTS_SERVICE_URL}/api/assignments',
        'Assignments service unavailable.',
    )
    if error_response:
        return error_response

    assignment_by_id = {str(assignment.get('id')): assignment for assignment in assignments}
    synced_ids = {str(line['assignmentId']) for line in lines}

    for assignment_id in synced_ids:
        assignment = assignment_by_id.get(assignment_id)
        if not assignment:
            return Response({'message': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        objective = float(assignment.get('objective') or 0)
        performed_total = get_existing_performed_total(assignment_id)
        sync_error = update_assignment_progress(assignment_id, objective, performed_total)
        if sync_error:
            return sync_error

    return None


def validate_team(team_id: str) -> Response | None:
    teams, error_response = fetch_collection(f'{TEAMS_SERVICE_URL}/api/teams', 'Teams service unavailable.')
    if error_response:
        return error_response

    if any(str(team.get('id')) == team_id for team in teams):
        return None

    return Response({'message': 'Team not found.'}, status=status.HTTP_404_NOT_FOUND)


def validate_assignments(lines: list[dict], team_id: str) -> Response | None:
    if not lines:
        return None

    assignments, error_response = fetch_collection(
        f'{ASSIGNMENTS_SERVICE_URL}/api/assignments',
        'Assignments service unavailable.',
    )
    if error_response:
        return error_response

    assignment_by_id = {str(assignment.get('id')): assignment for assignment in assignments}
    submitted_totals: dict[str, float] = {}

    for line in lines:
        assignment = assignment_by_id.get(str(line['assignmentId']))
        if not assignment:
            return Response({'message': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)
        if str(assignment.get('teamId')) != team_id:
            return Response({'message': 'Assignment does not belong to selected team.'}, status=status.HTTP_400_BAD_REQUEST)

        performed_score = parse_performed_score(line['workDone'])
        if performed_score is None:
            return Response({'message': 'Performed score must be numeric.'}, status=status.HTTP_400_BAD_REQUEST)

        objective = float(assignment.get('objective') or 0)
        assignment_id = str(line['assignmentId'])
        existing_total = get_existing_performed_total(assignment_id)
        submitted_total = submitted_totals.get(assignment_id, 0.0) + performed_score
        remaining_score = max(objective - existing_total, 0.0)

        if performed_score < 0 or submitted_total > remaining_score:
            return Response(
                {'message': f'Performed score for {line["assignmentTitle"]} must be between 0 and {remaining_score:g}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        submitted_totals[assignment_id] = submitted_total

    return None


class ReportsCollectionView(APIView):
    def get(self, request):
        reports = Report.objects.prefetch_related('lines').all()
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CreateReportSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'message': 'Invalid report payload.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = serializer.validated_data
        team_id = payload['teamId'].strip()
        team_name = payload['teamName'].strip()
        note = payload.get('note', '').strip()
        lines = [
            {
                'assignmentId': line['assignmentId'].strip(),
                'assignmentTitle': line['assignmentTitle'].strip(),
                'workDone': line['workDone'].strip(),
            }
            for line in payload['lines']
            if line['workDone'].strip()
        ]

        if not team_id or not team_name:
            return Response({'message': 'Team is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not lines and not note:
            return Response({'message': 'Write at least one task update or note.'}, status=status.HTTP_400_BAD_REQUEST)

        team_error = validate_team(team_id)
        if team_error:
            return team_error

        assignment_error = validate_assignments(lines, team_id)
        if assignment_error:
            return assignment_error

        report = Report.objects.create(
            date=payload['date'],
            team_id=team_id,
            team_name=team_name,
            note=note,
        )

        ReportLine.objects.bulk_create(
            [
                ReportLine(
                    report=report,
                    assignment_id=line['assignmentId'],
                    assignment_title=line['assignmentTitle'],
                    work_done=line['workDone'],
                )
                for line in lines
            ]
        )

        sync_error = sync_assignment_progress(lines)
        if sync_error:
            return sync_error

        report = Report.objects.prefetch_related('lines').get(id=report.id)
        return Response(ReportSerializer(report).data, status=status.HTTP_201_CREATED)
