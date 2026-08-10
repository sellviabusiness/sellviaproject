# API Authentication

## Purpose

How every request proves who's calling — implementation detail behind 04. Security → Authorization.

## Mechanism

- Every request includes a Clerk session token (as a bearer token or cookie, depending on client)
- Backend middleware verifies the token with Clerk on every request before any route handler runs
- Verified identity + role(s) attached to the request context; route handlers never re-derive identity themselves

## Role Enforcement

- Middleware checks the caller's role against the Permission Matrix (01. Business Logic) before allowing the request to proceed — e.g. `/admin/*` routes reject anything without the Admin role before touching business logic

## Public vs. Authenticated Endpoints

- Public: campaign discovery/browse (no auth required to view live campaigns)
- Authenticated: everything involving a specific Merchant's or Creator's own data
- The Stripe webhook endpoint is a special case — deliberately NOT Clerk-authenticated, secured instead via Stripe signature verification (04. Security → Webhook Security)

## Open Questions

- None blocking — direct implementation of already-decided Authentication/Authorization docs.

## Update (2026-08-04): Re-Platformed on Ory Kratos

Every request now carries a Kratos session token/cookie (as before, bearer token or cookie depending on client); backend verifies it against Kratos (server-validated, per 04. Security → Session Management's update) and attaches the resolved User + role(s) to the request context. Same principle, different provider — Kratos's REST API is called directly from FastAPI, no SDK dependency the way a Clerk Python integration might have needed.