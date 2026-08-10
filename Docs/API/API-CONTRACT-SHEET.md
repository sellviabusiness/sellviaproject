# API Contract Sheet — Backend ↔ Frontend Sync

Purpose: single source of truth so backend (Hamza) and frontend dev don't collide.
Rule: **nobody assumes a shape, everybody checks/updates this file first.**

---

## 1. Base rules

- Base URL: `http://localhost:8000` (local), path prefix `/api/v1/...` for all real endpoints. `/health` is the only unprefixed route.
- All request/response bodies: JSON, `camelCase` keys (frontend-friendly; backend converts from Python `snake_case` at the schema layer).
- Dates: ISO 8601 UTC strings (`2026-08-10T14:30:00Z`).
- Auth: `Authorization: Bearer <token>` header once auth lands. Until then, no auth required — note it in the table below.

## 2. Standard response envelope

Success:

```json
{ "data": { ... }, "error": null }
```

Error:

```json
{ "data": null, "error": { "code": "NOT_FOUND", "message": "Product not found" } }
```

HTTP status still reflects the outcome (200/201/400/401/404/422/500) — the envelope is for the frontend to branch on `error` without parsing status text.

## 3. Endpoint registry

Backend adds a row **before or the same day** it starts an endpoint (status `planned`), updates it when the shape is final (status `ready`) and when it's actually deployed to local/dev (status `live`). Frontend only builds against `ready`/`live` rows — anything `planned` is not stable yet, ask first.

| Endpoint | Method | Status | Request | Response | Owner | Notes |
|---|---|---|---|---|---|---|
| `/health` | GET | live | — | `{status, env}` | backend | no envelope, infra check only |

*(Add rows as endpoints are built. Keep it append-only — don't delete old rows, mark `deprecated` instead.)*

## 4. Who owns what

- **Backend**: endpoint contracts, DB schema, validation rules, error codes.
- **Frontend**: UI state, client-side validation, loading/error UX.
- **Shared / must-agree-together**: field names, enum values, pagination shape, auth flow.

## 5. Avoiding conflicts in practice

1. **Branch naming**: `feature/backend/<thing>` / `feature/frontend/<thing>` (already the pattern in use). Never both touch the same top-level folder (`apps/backend` vs `apps/frontend`) in one branch.
2. **Breaking change to a `live`/`ready` endpoint**: post in the shared channel + update the row's Notes column with the change *before* merging, not after.
3. **New endpoint needed by frontend but backend hasn't built it**: frontend adds a `planned` row itself with the shape it needs, backend reviews/adjusts, doesn't just build in silence.
4. **Mocking while backend isn't ready**: frontend builds against a static JSON fixture matching the agreed `planned` shape — do not block on backend being live. Swap the fetch URL when status flips to `live`.
5. **Env vars**: each side keeps its own `.env` (see `apps/backend/.env.example`); never commit real secrets. Add a matching `.env.example` entry when you add a new required var.
6. **CORS**: backend allowlists the frontend dev origin explicitly — ping backend when frontend's local port changes.

## 6. Error codes (append as they're introduced)

| Code | Meaning |
| --- | --- |
| `NOT_FOUND` | resource doesn't exist |
| `VALIDATION_ERROR` | bad request body/params |
| `UNAUTHORIZED` | missing/invalid token |
