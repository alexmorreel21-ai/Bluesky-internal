# Django Microservices Notes

This backend is planned as multiple Django services, each owning a domain.

## Database Choice

- Selected database: PostgreSQL
- Recommendation: one PostgreSQL database per service in local and production setups.
- Fallback option for quick start: a single shared database with separate schemas.

## Service Ownership

- auth-service: authentication and session identity (`/api/auth/*`)
- users-service: user CRUD (`/api/users*`)
- teams-service: team and membership (`/api/teams*`)
- assignments-service: assignment CRUD (`/api/assignments*`)
- reports-service: report CRUD (`/api/reports*`)
- daily-reports-service: daily report CRUD (`/api/daily-reports*`)

## Suggested Django Stack per Service

- Django + Django REST Framework for APIs
- django-cors-headers where direct frontend access is needed
- PostgreSQL via psycopg
- Gunicorn for runtime

## Recommended App Layout (per service)

- `<service>/manage.py`
- `<service>/config/` (Django project settings, urls, wsgi/asgi)
- `<service>/apps/` (domain apps)

## Cross-Service Rules

- Keep response body JSON.
- Error payload should include `message` field for frontend compatibility.
- Keep URL contracts in `shared/contracts/http-routes.md`.
- Add `/health` endpoint in each service.

## Gateway/BFF Options

- Django gateway service with proxy views/middleware, or
- Nginx/Traefik API gateway in front of Django services.

Use whichever you prefer; frontend route contract remains `/api/*`.
