# Users Service

Responsibilities:

- User listing
- User creation
- User deletion

Target routes:

- `GET /api/users`
- `POST /api/users`
- `DELETE /api/users/:userId`

Preparation checklist:

- [x] Define user schema and uniqueness constraints.
- [x] Implement create validation and conflict errors.
- [ ] Add pagination strategy if needed.
- [x] Add `GET /health`.

## Implemented Routes

- `GET /api/users`
- `POST /api/users`
- `DELETE /api/users/:userId`
- `GET /health`

## Local Run

1. `Set-Location Backend/services/users-service`
2. `.\.venv\Scripts\Activate.ps1`
3. `python manage.py migrate`
4. `python manage.py runserver 0.0.0.0:4002`

## Environment

- Uses `USERS_DATABASE_URL` first.
- Falls back to `DATABASE_URL`.
- Falls back to local SQLite if neither is set.

### PostgreSQL Local Setup (Current Default)

1. Create `users-service/.env` with:
	- `USERS_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bluesky_users`
2. Create database (if missing):
	- `psql -h localhost -U postgres -d postgres -c "CREATE DATABASE bluesky_users;"`
3. Run migrations:
	- `python manage.py migrate`
4. Verify connection:
	- `python manage.py shell -c "from django.db import connection; print(connection.vendor, connection.settings_dict['NAME'])"`

## Cross-Service Sync

- On user creation, this service provisions login credentials in `auth-service`.
- On user deletion, this service deprovisions login credentials in `auth-service`.
- Requires `AUTH_SERVICE_URL` (default: `http://127.0.0.1:4001`).

### Repair Command for Existing Legacy Users

If users existed before sync logic was added, run:

- `python manage.py sync_auth_accounts`

This provisions all current `users-service` users into `auth-service`.
