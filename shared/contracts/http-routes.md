# HTTP Route Contract (Frontend-Compatible)

These are the route groups currently used by the frontend and should remain stable.

## Auth Service

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

## Users Service

- `GET /api/users`
- `POST /api/users`
- `DELETE /api/users/:userId`

## Teams Service

- `GET /api/teams`
- `POST /api/teams`
- `POST /api/teams/:teamId/members`
- `PUT /api/teams/:teamId`
- `DELETE /api/teams/:teamId`

## Assignments Service

- `GET /api/assignments`
- `POST /api/assignments`
- `PUT /api/assignments/:assignmentId`

## Reports Service

- `GET /api/reports`
- `POST /api/reports`

## Daily Reports Service

- `GET /api/daily-reports`
- `POST /api/daily-reports`
- `PUT /api/daily-reports/:reportId`
- `DELETE /api/daily-reports/:reportId`

## Dashboard Service

- `GET /api/dashboard`

## Notes

- Return JSON consistently.
- Use proper status codes (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `500`).
- Error body shape should include a `message` field, because frontend reads it.
