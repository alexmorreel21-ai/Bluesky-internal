# Suggested Implementation Order

## Phase 1: Authentication and Identity

1. Implement `auth-service` login/logout/me.
2. Establish cookie or token policy.
3. Add basic auth middleware pattern for downstream services.

## Phase 2: User and Team Core

1. Implement `users-service` list/create/delete.
2. Implement `teams-service` list/create/update/delete and member assignment.

## Phase 3: Work Domain

1. Implement `assignments-service` list/create/update.
2. Implement `reports-service` list/create.
3. Implement `daily-reports-service` list/create/update/delete.

## Phase 4: Gateway and Cross-Cutting

1. Route all `/api/*` through gateway.
2. Add request ID, centralized logging, and error normalization.
3. Add CORS and security headers.
4. Add health checks per service and gateway.

## Done Criteria

- Frontend works with mock fallback disabled.
- All endpoints in `shared/contracts/http-routes.md` are implemented.
- Service health endpoints are available.
