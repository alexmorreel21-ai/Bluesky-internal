# Auth Service

Responsibilities:

- Login
- Logout
- Current session/user identity

Target routes:

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Preparation checklist:

- [x] Define auth model and session/token strategy.
- [x] Implement credential validation flow.
- [x] Return user identity payload expected by frontend.
- [x] Add `GET /health`.

## Implemented Routes

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /health`

### Internal Sync Routes

- `POST /api/auth/provision`
- `POST /api/auth/deprovision`

These are used by `users-service` to keep login credentials aligned with user-management records.

## Local Run

1. `Set-Location Backend/services/auth-service`
2. `.\.venv\Scripts\Activate.ps1`
3. `python manage.py migrate`
4. `python manage.py runserver 0.0.0.0:4001`

## Environment

- Uses `AUTH_DATABASE_URL` first.
- Falls back to `DATABASE_URL`.
- Falls back to local SQLite if neither is set.

### PostgreSQL Local Setup (Current Default)

1. Create `auth-service/.env` with:
	- `AUTH_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bluesky_auth`
2. Create database (if missing):
	- `psql -h localhost -U postgres -d postgres -c "CREATE DATABASE bluesky_auth;"`
3. Run migrations:
	- `python manage.py migrate`
4. Verify connection:
	- `python manage.py shell -c "from django.db import connection; print(connection.vendor, connection.settings_dict['NAME'])"`
