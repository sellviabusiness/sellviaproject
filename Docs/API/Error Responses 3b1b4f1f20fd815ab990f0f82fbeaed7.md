# Error Responses

## Purpose

Consistent error shape across every endpoint, so the frontend can handle failures predictably.

## Standard Error Shape

```json
{
  "error": {
    "code": "application_already_exists",
    "message": "You've already applied to this campaign.",
    "status": 409
  }
}
```

## Status Code Conventions

| Code | Meaning |
| --- | --- |
| 400 | Malformed request / validation failure |
| 401 | Missing or invalid auth token |
| 403 | Authenticated, but not permitted (role/ownership check failed) |
| 404 | Resource doesn't exist (or is soft-deleted — treated the same as not existing to the caller) |
| 409 | Conflict (duplicate application, campaign state doesn't allow this action) |
| 422 | Valid request shape, but violates a business rule (e.g. commission_rate outside the sanity-check constraint in 03. Database) |
| 500 | Unhandled server error |

## Payments-Specific Errors

Stripe errors (declined card, etc.) are translated into this same shape rather than passing Stripe's raw error format straight through to the frontend — keeps the client-side error handling consistent regardless of which underlying service failed.

## Open Questions

- None blocking — standard, low-risk convention.

## Update (2026-08-04): Two-Layer Enforcement

The shape above is Layer 1 (user-facing) of a formal two-layer system — see 06. Infrastructure → Error Handling & Logging Pipeline for Layer 2 (full private logging), the boundary-by-boundary catching rules (API routes, background jobs, webhooks, payment callbacks), and the error-path test suite that verifies neither layer ever fails silently.