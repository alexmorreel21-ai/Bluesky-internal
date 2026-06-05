# Services Bootstrap Plan (Django)

Each folder under `services/` will become an independent Django project.

Folders:

- `auth-service/`
- `users-service/`
- `teams-service/`
- `assignments-service/`
- `reports-service/`
- `daily-reports-service/`
- `dashboard-service/`

## Bootstrap Pattern (run later)

From each service folder:

1. Create virtual environment.
2. Install dependencies from backend `requirements.txt`.
3. Start Django project named `config`.
4. Add domain app(s) under `apps/`.

Example command pattern (PowerShell):

- `python -m venv .venv`
- `.\.venv\Scripts\Activate.ps1`
- `pip install -r ..\..\requirements.txt`
- `django-admin startproject config .`
- `python manage.py startapp apps_core`

Keep service URL namespace aligned to `shared/contracts/http-routes.md`.
