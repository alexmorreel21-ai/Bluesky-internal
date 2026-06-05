# Reports Service

Responsibilities:

- Report listing
- Report creation

Target routes:

- `GET /api/reports`
- `POST /api/reports`

Preparation checklist:

- [x] Define report schema and line-item structure.
- [x] Validate assignment references policy.
- [x] Add date/team validation rules.
- [x] Add `GET /health`.

## Implemented Routes

- `GET /api/reports`
- `POST /api/reports`
- `GET /health`

## Local Run

1. `Set-Location Backend/services/reports-service`
2. Create or activate a Python environment with `Backend/requirements.txt` installed.
3. `python manage.py migrate`
4. `python manage.py runserver 0.0.0.0:4005`

## Environment

- Uses `REPORTS_DATABASE_URL` first.
- Falls back to `DATABASE_URL`.
- Falls back to local SQLite if neither is set.
- Uses `TEAMS_SERVICE_URL` for team validation, defaulting to `http://127.0.0.1:4003`.
- Uses `ASSIGNMENTS_SERVICE_URL` for assignment line validation, defaulting to `http://127.0.0.1:4004`.

## Report Rules

- A report must have a valid team.
- A report must include at least one task update or a note.
- Report lines are validated against existing assignments.
- Assignment lines must belong to the selected team.
