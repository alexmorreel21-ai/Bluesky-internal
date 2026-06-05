# Backend Microservices Preparation

This folder is prepared for a microservices backend that matches the existing frontend API usage.

## Stack

- Language: Python
- Framework: Django + Django REST Framework
- Dependencies: `requirements.txt`
- Database: PostgreSQL

## Target Architecture

- `gateway/`: API gateway or BFF layer that exposes `/api/*` routes to the frontend.
- `services/auth-service/`: authentication and session endpoints.
- `services/users-service/`: user account endpoints.
- `services/teams-service/`: team and membership endpoints.
- `services/assignments-service/`: assignment management endpoints.
- `services/reports-service/`: report submission/list endpoints.
- `services/daily-reports-service/`: daily report endpoints.
- `services/dashboard-service/`: dashboard summary aggregation endpoint.
- `shared/contracts/`: route contracts and shared DTO notes.
- `shared/config/`: shared config conventions.
- `docs/`: implementation order and architecture notes.

## Frontend Compatibility Rule

Keep frontend endpoints stable:

- `/api/auth/*`
- `/api/users*`
- `/api/teams*`
- `/api/assignments*`
- `/api/reports*`
- `/api/daily-reports*`
- `/api/dashboard`

The frontend is already prepared to call either:

- same-origin gateway (`/api/...`), or
- direct service base URLs via Vite env variables.

## Recommended First Build Order

1. `auth-service`
2. `users-service`
3. `teams-service`
4. `assignments-service`
5. `reports-service`
6. `daily-reports-service`
7. `dashboard-service`
8. `gateway` integration and auth policy hardening

See `docs/implementation-order.md` and `shared/contracts/http-routes.md`.
For Django-specific setup guidance, see `docs/django-microservices.md`.

## Optional Bootstrap Script

When you are ready to initialize all service projects, run:

- `powershell -ExecutionPolicy Bypass -File scripts/bootstrap_django_services.ps1`

This creates per-service virtual environments, installs `requirements.txt`, and initializes Django `config` projects.
