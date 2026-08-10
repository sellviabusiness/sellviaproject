# API Design

## Purpose

The contract between frontend and backend — detailed endpoint specs live in 07. API; this doc covers the design conventions.

## Style

REST over GraphQL for MVP — simpler to reason about, easier to secure per-endpoint with role checks, and the data shapes here (campaigns, applications, sales) are not deeply nested/graph-like enough to need GraphQL's flexibility.

## Conventions

- Resource-based URLs: `/campaigns`, `/applications`, `/sales`, `/payouts`
- Role-scoped by default: a Merchant's `/campaigns` only returns their own; Admin has a separate `/admin/*` namespace with elevated access, matching the Permission Matrix (01. Business Logic)
- Pagination on all list endpoints (campaigns, applications, sales) — these will grow unbounded over time
- Idempotency keys required on any endpoint that touches Paddle (checkout creation, payout triggers) to avoid double-charging on retry — critical given this is a payments system, not optional

## Versioning

- Not needed at MVP (single client, single version) — revisit once there's a public API or third-party integrations (e.g. the deferred Shopify webhook integration from v2)

## Authentication

- Every request carries a Clerk session token; backend verifies it and attaches the resolved User + role(s) to the request context before any business logic runs

## Open Questions

- Whether a public, documented API is ever exposed to merchants directly (e.g. for their own reporting), or if the API stays purely internal to SellVia's own frontend — not needed for MVP either way
