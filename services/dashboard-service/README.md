# Dashboard Service

Responsibilities:

- Aggregate dashboard summary data from backend services.
- Keep the frontend dashboard on one stable endpoint.

## Implemented Routes

- `GET /api/dashboard`
- `GET /health`

## Local Run

1. `Set-Location Backend/services/dashboard-service`
2. Create or activate a Python environment with `Backend/requirements.txt` installed.
3. `python manage.py runserver 0.0.0.0:4007`

## Environment

- Uses `USERS_SERVICE_URL`, `TEAMS_SERVICE_URL`, `ASSIGNMENTS_SERVICE_URL`, `REPORTS_SERVICE_URL`, and `DAILY_REPORTS_SERVICE_URL`.
- Defaults to local service ports `4002` through `4006`.
- Downstream failures are returned in the `errors` array while available totals still render.
