# Backend Architecture

## Purpose

How the server-side logic, payments processing, and business rules are implemented.

## Stack (decided 2026-08-03: FastAPI)

- **Framework: FastAPI (Python)** — a separate backend service, not Next.js API routes. This means SellVia is now a **two-service architecture**: Next.js frontend + FastAPI backend, talking over HTTP, rather than one unified Next.js app (see System Architecture for the updated diagram).
- **Database access:** SQLAlchemy (ORM) + Alembic for migrations — replaces the earlier Prisma recommendation (see 03. Database → Database Design, Migration Strategy, both updated accordingly)
- **Async:** FastAPI's native async support is a good fit here given how much of this backend is I/O-bound (Paddle API calls, webhook processing, database queries) — worth actually using `async def` route handlers and an async database driver (e.g. `asyncpg` via SQLAlchemy's async engine) rather than defaulting to sync
- **Payments:** Paddle, repurposed for periodic merchant billing and creator payouts (reversed 2026-08-07, 01. Money Flow) — not a live per-sale split anymore. Paddle's Python SDK, not the Node SDK.

## Why This Is a Real Architectural Fork, Not Just a Swap

Next.js API routes meant the frontend and backend were one deployable unit. FastAPI as a separate service means:

- Two codebases, two languages (TypeScript frontend, Python backend) instead of one
- Frontend calls the backend over HTTP/REST (per 07. API) rather than same-process function calls
- Two separate deploy pipelines, two sets of environment variables, two processes to run and monitor on the VPS (see 06. Infrastructure — CI/CD Pipeline and VPS Setup both need updating for this, flagged separately)
- CORS becomes a real concern between frontend and backend origins (04. Security → API Security already covers this in principle, now it actually applies day one, not just for a hypothetical future public API)

## Core Backend Responsibilities (unchanged from before — implementation language changed, not the logic)

1. **Auth verification** — validate Ory Kratos session tokens on every request, map to Merchant/Creator/Admin role
2. **Campaign/Application lifecycle** — implement the state machines from 01. Business Logic → State Machines
3. **Sale report acceptance** — receive and validate merchant-reported sales from the onboarding snippet (05. Payment Flow, reversed 2026-08-07), run 04. Fraud Prevention's plausibility checks, add accepted sales to the merchant's open Billing Cycle
4. **Periodic billing** — scheduled job charges each merchant's card on file for their Billing Cycle total (05. Payment Flow)
5. **Webhook handling** — FastAPI route receiving Paddle webhooks, verifying signature, enqueuing background work (see Background Jobs — also updated for Python)
6. **Attribution tracking** — record AttributionEvents against the correct AffiliateLink within the 30-day window
7. **Notification triggers** — fire events consumed by the notification worker

## Why Paddle (unchanged reasoning)

Same as before — managed KYC/tax-form collection and money movement via Paddle seller accounts is far less engineering/compliance surface than a custom ledger + manual payouts, regardless of backend language.

## Open Questions

- **Paddle account type:** still recommend Express for MVP (unchanged from before — this decision doesn't depend on backend language)
- Whether frontend and backend deploy independently or are still coordinated as one release (see 06. Infrastructure → CI/CD Pipeline, needs updating for the two-service split)

## Update (2026-08-03): Confirmed monolithic

To be explicit given the question came up directly: this FastAPI backend is **one monolithic service** internally organized into modules (campaigns, applications, payments, notifications), not split into microservices. See System Architecture for the full reasoning. The "Core Backend Responsibilities" listed above (auth, campaign lifecycle, checkout, webhooks, attribution, notifications) all live in this single service, not distributed across separate ones.

## Update (2026-08-03): Built as a Modular Monolith — Extractable Later

Confirmed monolithic for now (see above), but built with a specific discipline so it can evolve into microservices later without a rewrite: **each internal module (campaigns, applications, payments, notifications) is self-contained** — owns its own data access, doesn't reach directly into another module's internals, communicates through clearly-defined internal interfaces rather than shared global state. This is the "modular monolith" pattern — if a specific module (most likely Payments, given it's the most load- and correctness-sensitive) ever needs to become its own service, that boundary already exists and the extraction is a scoped migration, not a redesign.

## Fault Isolation — What's Already True Without Microservices

The concern "if one part breaks, the rest should keep working" is already mostly addressed by the current architecture, independent of the monolith/microservices question:

- **Per-request isolation is automatic in FastAPI:** an unhandled error in one endpoint returns a 500 to that caller only — it does not crash the process or affect other requests.
- **Workers (Celery) already run as a separate process from the API** — if the API crashes, queued jobs keep draining; if a worker crashes, the API keeps serving requests.
- **Database, Redis, Paddle, and Ory Kratos are already separate, independently-managed services** — none of them go down because of a bug in SellVia's own code.

**The real remaining single point of failure:** if the FastAPI process itself crashes entirely (not a single bad request, but a full process crash — e.g. out-of-memory), everything it directly serves goes down together, since it's one process. At current scale, the right mitigation is fast detection and restart (06. Infrastructure → Monitoring, plus a process manager that auto-restarts on crash) rather than splitting into microservices — genuine microservices fault isolation requires deliberate patterns (async messaging, circuit breakers, timeouts) that add real complexity, and naively splitting without them can make things less resilient, not more, by turning function calls into network calls that can also fail.

**Bottom line:** revisit true service extraction only when a specific module demonstrably needs independent scaling or failure isolation under real load — the modular structure means that's a scoped decision when the time comes, not a foundational one to make now.
