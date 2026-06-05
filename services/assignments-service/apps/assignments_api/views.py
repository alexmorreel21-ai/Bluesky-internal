import json
import os
from urllib import error, request as urllib_request
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Assignment
from .serializers import AssignmentSerializer, CreateAssignmentSerializer, UpdateAssignmentSerializer


TEAMS_SERVICE_URL = os.getenv('TEAMS_SERVICE_URL', 'http://127.0.0.1:4003').rstrip('/')


def fetch_team(team_id: str) -> tuple[dict | None, Response | None]:
    if team_id.startswith('manual-'):
        return {'id': team_id}, None

    req = urllib_request.Request(url=f'{TEAMS_SERVICE_URL}/api/teams', method='GET')

    try:
        with urllib_request.urlopen(req, timeout=5) as response:
            teams = json.loads(response.read().decode('utf-8'))
    except error.HTTPError as http_error:
        return None, Response({'message': 'Failed to load teams.'}, status=http_error.code)
    except Exception:
        return None, Response({'message': 'Teams service unavailable.'}, status=status.HTTP_502_BAD_GATEWAY)

    for team in teams:
        if str(team.get('id')) == team_id:
            return team, None

    return None, Response({'message': 'Team not found.'}, status=status.HTTP_404_NOT_FOUND)


class AssignmentsCollectionView(APIView):
    def get(self, request):
        assignments = Assignment.objects.all()
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CreateAssignmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'message': 'Invalid assignment payload.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = serializer.validated_data
        team_id = payload['teamId'].strip()
        team_name = payload['teamName'].strip()

        if not team_id or not team_name:
            return Response({'message': 'Team is required.'}, status=status.HTTP_400_BAD_REQUEST)

        _, team_error = fetch_team(team_id)
        if team_error:
            return team_error

        assignment = Assignment.objects.create(
            team_id=team_id,
            team_name=team_name,
            task_name=payload['taskName'].strip(),
            content=payload['content'].strip(),
            deadline=payload['deadline'],
            objective=payload['objective'],
            progress=0,
            status=Assignment.Status.IN_PROGRESS,
        )

        return Response(AssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)


class AssignmentDetailView(APIView):
    def put(self, request, assignment_id: str):
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({'message': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateAssignmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'message': 'Invalid assignment update payload.', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payload = serializer.validated_data
        field_map = {
            'taskName': 'task_name',
            'content': 'content',
            'deadline': 'deadline',
            'objective': 'objective',
            'progress': 'progress',
            'status': 'status',
        }

        for payload_field, model_field in field_map.items():
            if payload_field in payload:
                value = payload[payload_field]
                if isinstance(value, str):
                    value = value.strip()
                setattr(assignment, model_field, value)

        assignment.save()
        return Response(AssignmentSerializer(assignment).data, status=status.HTTP_200_OK)
