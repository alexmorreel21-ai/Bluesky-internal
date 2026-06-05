# Assignments Service

Responsibilities:

- Assignment listing
- Assignment creation
- Assignment updates

Target routes:

- `GET /api/assignments`
- `POST /api/assignments`
- `PUT /api/assignments/:assignmentId`

Preparation checklist:

- [x] Define assignment schema and status rules.
- [x] Validate team association.
- [x] Add progress/objective invariants.
- [x] Add `GET /health`.

## Implemented Routes

- `GET /api/assignments`
- `POST /api/assignments`
- `PUT /api/assignments/:assignmentId`
- `GET /health`

## Local Run

1. `Set-Location Backend/services/assignments-service`
2. Create or activate a Python environment with `Backend/requirements.txt` installed.
3. `python manage.py migrate`
4. `python manage.py runserver 0.0.0.0:4004`

## Environment

- Uses `ASSIGNMENTS_DATABASE_URL` first.
- Falls back to `DATABASE_URL`.
- Falls back to local SQLite if neither is set.
- Uses `TEAMS_SERVICE_URL` for team validation, defaulting to `http://127.0.0.1:4003`.

## Assignment Rules

- Objective must be between `1` and `100`.
- Progress must be between `0` and `100`.
- Progress at `100` automatically marks an assignment as `COMPLETED`.
- Progress below `100` keeps an assignment `IN_PROGRESS`, unless explicitly completed.
- Real team IDs are validated against `teams-service`; `manual-*` IDs are allowed for the frontend fallback state.
