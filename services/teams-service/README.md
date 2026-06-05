# Teams Service

Responsibilities:

- Team CRUD
- Team membership changes

Target routes:

- `GET /api/teams`
- `POST /api/teams`
- `POST /api/teams/:teamId/members`
- `PUT /api/teams/:teamId`
- `DELETE /api/teams/:teamId`

Preparation checklist:

- [x] Define team schema and member relation rules.
- [x] Validate leader/member assignments.
- [x] Decide cross-service user validation policy.
- [x] Add `GET /health`.

## Implemented Routes

- `GET /api/teams`
- `POST /api/teams`
- `POST /api/teams/:teamId/members`
- `PUT /api/teams/:teamId`
- `DELETE /api/teams/:teamId`
- `GET /health`

## Local Run

1. `Set-Location Backend/services/teams-service`
2. Create or activate a Python environment with `Backend/requirements.txt` installed.
3. `python manage.py migrate`
4. `python manage.py runserver 0.0.0.0:4003`

## Environment

- Uses `TEAMS_DATABASE_URL` first.
- Falls back to `DATABASE_URL`.
- Falls back to local SQLite if neither is set.
- Uses `USERS_SERVICE_URL` for leader/member validation, defaulting to `http://127.0.0.1:4002`.

## Assignment Rules

- Team leaders must be existing users with `TeamLeader` permission.
- Team members must be existing users with `TeamMember` permission.
- A user can only be added once to the same team.
