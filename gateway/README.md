# API Gateway

Purpose:

- Expose stable frontend routes under `/api/*`.
- Forward requests to internal services.
- Apply shared concerns (auth guard, logging, rate limit, error mapping).

Preparation checklist:

- [ ] Add service registry config from environment.
- [ ] Add reverse-proxy routes by domain.
- [ ] Preserve HTTP status and JSON body from services.
- [ ] Normalize error shape with `message` field.
- [ ] Add `GET /health` endpoint.
