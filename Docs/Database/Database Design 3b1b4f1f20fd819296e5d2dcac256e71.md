# Database Design

## Purpose

The overall approach to schema design — this doc is the summary; ER Diagram and Table Specifications go deeper on structure, this one covers philosophy and conventions.

## Engine

PostgreSQL — relational, ACID-compliant, which matters here because this is a payments system (commissions, balances, payouts) where partial writes or race conditions are unacceptable. Matches the earlier infrastructure conversation's recommendation of managed Postgres (e.g. Neon, Supabase, or a managed offering) over self-hosting it on the VPS.

## Conventions

- All monetary amounts stored as **integers in the smallest currency unit** (cents), never floats — standard practice to avoid floating-point rounding errors on money
- Every table has `id` (UUID), `created_at`, `updated_at`
- Currency is stored alongside every monetary amount (not assumed globally), since SellVia supports USD/EUR/GBP
- Foreign keys enforced at the database level, not just in application code — given the entity relationships in 01. Business Logic → Domain Model are fairly rigid (a Sale must belong to a real AffiliateLink, etc.), this is worth enforcing at the DB layer

## Source of Truth

The entities and relationships here map directly onto 01. Business Logic → Domain Model — this doc doesn't redefine them, it specifies how they're actually stored. See Table Specifications for the field-by-field schema.

## Open Questions

- ORM choice (Prisma proposed in 02. Backend Architecture) vs. raw SQL/query builder — Prisma recommended for type safety given the team's stated preference to understand every layer while still moving fast

## Update (2026-08-03): ORM changed to SQLAlchemy

Following the backend switch to FastAPI (Python), **SQLAlchemy replaces Prisma** as the ORM. The schema/conventions above (integer cents, UUIDs, currency-alongside-amount, DB-level foreign keys) are unchanged — this is a tooling swap, not a schema redesign. See Migration Strategy for the corresponding Alembic update.

## Update (2026-08-04): Conflict Resolution Strategy

**Two-tier approach, scoped by data type:**

- **Financial chain (Sales, Commissions, Payouts, Refunds):** event-sourced — the immutable `financial_events` log is the source of truth, current-state tables are derived projections. Full reasoning in 03. Database → Event Sourcing (Financial Chain).
- **Everything else** (Campaigns, Offers, CreatorProfile/MerchantProfile, and other low-collaboration, single-owner-edited data): **last-write-wins by timestamp** — every mutable row carries `updated_at`, writes include an optimistic check, most recent write wins on conflict. Simple, sufficient, no event sourcing or CRDT machinery needed for data nobody co-edits in real time.

**CRDTs/Operational Transformation — explicitly not adopted.** These solve real-time collaborative multi-user editing of the same document (Google Docs-style), which nothing currently in SellVia's scope requires. Revisit only if a genuine concurrent-editing feature is designed — not built speculatively ahead of a real use case.
