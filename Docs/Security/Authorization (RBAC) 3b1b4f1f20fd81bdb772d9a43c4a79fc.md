# Authorization (RBAC)

## Purpose

Who can do what, enforced in code — direct implementation of 01. Business Logic → Permission Matrix.

## Model

Role-based (RBAC), not attribute-based — three roles (Merchant, Creator, Admin), matching User Roles. A single User can hold both Merchant and Creator roles simultaneously (decided default, 01. Business Logic → User Roles).

## Enforcement Points

- **API layer:** every endpoint checks the caller's role(s) against the Permission Matrix before executing — e.g. only a Campaign's owning Merchant can approve/reject its Applications
- **Row-level scoping:** a Merchant's queries are automatically scoped to `WHERE merchant_profile_id = current_user.merchant_profile_id` — never trust a client-supplied ID alone
- **Admin namespace:** `/admin/*` routes require the Admin role explicitly; no endpoint silently grants admin-level access based on other conditions

## Clerk Integration

Role is stored in Clerk's user metadata (or via Clerk Organizations, per 04. Security → Authentication) and read from the verified session token — never trust a role claim sent directly by the client in a request body.

## Open Questions

- None blocking — this is a direct implementation of already-decided rules (Permission Matrix); revisit only if new roles are introduced later.

## Update (2026-08-04): Re-Platformed on Ory Kratos

Role is now stored in Kratos identity `traits` (its metadata concept), not "Clerk's user metadata or Organizations" as previously written — read from the verified Kratos session on every request. The core rule is unchanged: never trust a client-supplied role claim, always resolve it from the verified session server-side.

## Update (2026-08-04): UI Is Not a Trust Boundary — Explicit Rule

Stating this as a hard rule, not just an implication of the design above: **hiding a button, disabling a form field, or not rendering a screen in the frontend provides zero security.** The frontend may do this for UX reasons (don't show a Creator a "suspend user" button they'd never be allowed to use anyway), but **every single API route independently re-checks the caller's role against the Permission Matrix, with no exceptions** — the frontend's UI state is never trusted as a substitute for that check, and no endpoint is ever implemented on the assumption "the UI wouldn't let them get here."

**Concretely:** if a Creator's browser is manipulated to call a Merchant-only endpoint directly (dev tools, a modified request, a scripted call), the API must reject it exactly as it would from any other unauthorized caller — regardless of what the UI does or doesn't show. This applies uniformly to every route in 07. API → Endpoint Specifications, not just the obviously sensitive ones — a route that looks harmless today can become a real vulnerability the moment someone assumes the UI already handled it.

This is exactly the class of check 04. Cross-Tenant Isolation Testing already exercises (direct ID/endpoint manipulation, bypassing the UI entirely) — that test suite is the concrete verification that this rule actually holds, not just documented.
