import json
import os
from collections import defaultdict
from datetime import date, datetime, timedelta
from urllib import error, request as urllib_request
from rest_framework.response import Response
from rest_framework.views import APIView


SERVICE_URLS = {
    'users': os.getenv('USERS_SERVICE_URL', 'http://127.0.0.1:4002').rstrip('/'),
    'teams': os.getenv('TEAMS_SERVICE_URL', 'http://127.0.0.1:4003').rstrip('/'),
    'assignments': os.getenv('ASSIGNMENTS_SERVICE_URL', 'http://127.0.0.1:4004').rstrip('/'),
    'reports': os.getenv('REPORTS_SERVICE_URL', 'http://127.0.0.1:4005').rstrip('/'),
    'dailyReports': os.getenv('DAILY_REPORTS_SERVICE_URL', 'http://127.0.0.1:4006').rstrip('/'),
}


def fetch_json(service_key: str, path: str) -> tuple[list, str | None]:
    req = urllib_request.Request(url=f'{SERVICE_URLS[service_key]}{path}', method='GET')

    try:
        with urllib_request.urlopen(req, timeout=4) as response:
            payload = json.loads(response.read().decode('utf-8'))
            return payload if isinstance(payload, list) else [], None
    except error.HTTPError as http_error:
        return [], f'{service_key} service returned {http_error.code}.'
    except Exception:
        return [], f'{service_key} service unavailable.'


def parse_date(value: str | None) -> date | None:
    if not value:
        return None

    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except ValueError:
        return None


def week_start_for(value: date) -> date:
    return value - timedelta(days=value.weekday())


def week_label(week_start: date) -> str:
    week_end = week_start + timedelta(days=6)
    return f'{week_start.strftime("%b %d")} - {week_end.strftime("%b %d")}'


def month_label(value: date) -> str:
    return value.strftime('%b %Y')


def finalize_performance_bucket(item: dict) -> dict:
    item['averageProgress'] = round(item['_progressTotal'] / item['total']) if item['total'] else 0
    item['completionRate'] = round((item['completed'] / item['total']) * 100) if item['total'] else 0
    item.pop('_progressTotal', None)
    return item


def build_weekly_analysis(assignments: list[dict]) -> tuple[list[dict], list[dict], list[dict], list[dict]]:
    weekly: dict[date, dict] = {}
    team_weekly: dict[date, dict[str, dict]] = defaultdict(dict)
    team_weekly_performance: dict[str, dict] = {}
    monthly_team_performance: dict[str, dict] = {}

    for assignment in assignments:
        deadline = parse_date(assignment.get('deadline'))
        if not deadline:
            continue

        week_start = week_start_for(deadline)
        month_start = deadline.replace(day=1)
        week_bucket = weekly.setdefault(
            week_start,
            {
                'weekStart': week_start.isoformat(),
                'weekLabel': week_label(week_start),
                'total': 0,
                'completed': 0,
                'inProgress': 0,
                'averageProgress': 0,
                'objectiveTotal': 0,
                '_progressTotal': 0,
            },
        )

        progress = int(assignment.get('progress') or 0)
        objective = int(assignment.get('objective') or 0)
        is_completed = assignment.get('status') == 'COMPLETED'

        week_bucket['total'] += 1
        week_bucket['completed'] += 1 if is_completed else 0
        week_bucket['inProgress'] += 0 if is_completed else 1
        week_bucket['objectiveTotal'] += objective
        week_bucket['_progressTotal'] += progress

        team_id = str(assignment.get('teamId') or '')
        if not team_id:
            continue

        team_name = assignment.get('teamName') or team_id

        team_bucket = team_weekly[week_start].setdefault(
            team_id,
            {
                'teamId': team_id,
                'teamName': team_name,
                'total': 0,
                'completed': 0,
                'assignments': [],
            },
        )
        team_bucket['total'] += 1
        team_bucket['completed'] += 1 if is_completed else 0
        team_bucket['assignments'].append(
            {
                'id': assignment.get('id'),
                'taskName': assignment.get('taskName'),
                'status': assignment.get('status'),
                'progress': progress,
                'objective': objective,
            }
        )

        team_weekly_bucket = team_weekly_performance.setdefault(
            team_id,
            {
                'teamId': team_id,
                'teamName': team_name,
                'weeks': {},
            },
        )['weeks'].setdefault(
            week_start,
            {
                'weekStart': week_start.isoformat(),
                'weekLabel': week_label(week_start),
                'total': 0,
                'completed': 0,
                'inProgress': 0,
                'averageProgress': 0,
                'completionRate': 0,
                '_progressTotal': 0,
            },
        )
        team_weekly_bucket['total'] += 1
        team_weekly_bucket['completed'] += 1 if is_completed else 0
        team_weekly_bucket['inProgress'] += 0 if is_completed else 1
        team_weekly_bucket['_progressTotal'] += progress

        monthly_bucket = monthly_team_performance.setdefault(
            f'{month_start.isoformat()}::{team_id}',
            {
                'monthStart': month_start.isoformat(),
                'monthLabel': month_label(month_start),
                'teamId': team_id,
                'teamName': team_name,
                'total': 0,
                'completed': 0,
                'inProgress': 0,
                'averageProgress': 0,
                'completionRate': 0,
                'objectiveTotal': 0,
                '_progressTotal': 0,
            },
        )
        monthly_bucket['total'] += 1
        monthly_bucket['completed'] += 1 if is_completed else 0
        monthly_bucket['inProgress'] += 0 if is_completed else 1
        monthly_bucket['objectiveTotal'] += objective
        monthly_bucket['_progressTotal'] += progress

    weekly_performance = []
    for week_start in sorted(weekly):
        weekly_performance.append(finalize_performance_bucket(weekly[week_start]))

    weekly_team_assignments = []
    for week_start in sorted(team_weekly):
        weekly_team_assignments.append(
            {
                'weekStart': week_start.isoformat(),
                'weekLabel': week_label(week_start),
                'teams': sorted(team_weekly[week_start].values(), key=lambda item: item['total'], reverse=True),
            }
        )

    team_weekly_series = []
    for team_id, team_bucket in sorted(team_weekly_performance.items(), key=lambda item: item[1]['teamName']):
        weeks = [finalize_performance_bucket(team_bucket['weeks'][week_start]) for week_start in sorted(team_bucket['weeks'])]
        team_weekly_series.append(
            {
                'teamId': team_id,
                'teamName': team_bucket['teamName'],
                'weeks': weeks[-8:],
            }
        )

    monthly_team_series = [
        finalize_performance_bucket(item)
        for item in sorted(monthly_team_performance.values(), key=lambda item: (item['monthStart'], item['teamName']))
    ]

    return weekly_performance[-8:], weekly_team_assignments[-8:], team_weekly_series, monthly_team_series[-12:]


class DashboardSummaryView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        users, users_error = fetch_json('users', '/api/users')
        teams, teams_error = fetch_json('teams', '/api/teams')
        assignments, assignments_error = fetch_json('assignments', '/api/assignments')
        reports, reports_error = fetch_json('reports', '/api/reports')
        daily_reports, daily_reports_error = fetch_json('dailyReports', '/api/daily-reports')

        completed_assignments = sum(1 for item in assignments if item.get('status') == 'COMPLETED')
        in_progress_assignments = max(len(assignments) - completed_assignments, 0)
        weekly_performance, weekly_team_assignments, team_weekly_performance, monthly_team_performance = build_weekly_analysis(assignments)

        team_load_by_id: dict[str, dict] = {}
        for assignment in assignments:
            team_id = str(assignment.get('teamId') or '')
            if not team_id:
                continue

            team_load = team_load_by_id.setdefault(
                team_id,
                {
                    'teamId': team_id,
                    'teamName': assignment.get('teamName') or team_id,
                    'count': 0,
                },
            )
            team_load['count'] += 1

        team_load = sorted(team_load_by_id.values(), key=lambda item: item['count'], reverse=True)[:5]

        errors = [
            error_message
            for error_message in [users_error, teams_error, assignments_error, reports_error]
            if error_message
        ]

        return Response(
            {
                'totals': {
                    'users': len(users),
                    'teams': len(teams),
                    'assignments': len(assignments),
                    'reports': len(reports),
                    'dailyReports': len(daily_reports),
                },
                'assignmentStatus': {
                    'inProgress': in_progress_assignments,
                    'completed': completed_assignments,
                },
                'teamLoad': team_load,
                'weeklyPerformance': weekly_performance,
                'weeklyTeamAssignments': weekly_team_assignments,
                'teamWeeklyPerformance': team_weekly_performance,
                'monthlyTeamPerformance': monthly_team_performance,
                'errors': errors,
            }
        )
