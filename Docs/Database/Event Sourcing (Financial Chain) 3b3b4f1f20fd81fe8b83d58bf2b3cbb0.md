# Event Sourcing (Financial Chain)

## Purpose

The financial chain (Sales, Commissions, Payouts, Refunds) is event-sourced: the source of truth is an immutable, append-only log of every change, not a mutable "current state" row. This is a deliberate, narrow scope decision — not applied to the rest of the schema.

## Why Scoped to the Financial Chain Only

Event sourcing is a real complexity commitment: every read needs a projection instead of a simple query, every change is an event instead of an UPDATE. That cost is worth paying specifically where the payoff is highest — money. A Campaign's description or a CreatorProfile's bio doesn't need a perfect replayable history; a Sale's lifecycle absolutely benefits from one, especially given a dispute or reconciliation mismatch (05. Payments → Reconciliation) might need to answer "what did this Sale's state look like, and why, at each step." Applying this pattern universally would be solving a problem most of the schema doesn't have — consistent with every other "don't add complexity before there's a real need" call made throughout this build.

## The Event Log (source of truth)

```text
financial_events
  id
  event_type       (SaleCreated, SaleVerified, CommissionCalculated, PlatformFeeCalculated,
                     PayoutTriggered, PayoutCompleted, PayoutFailed, RefundIssued, ClawbackApplied,
                     ChargebackReceived, ChargebackResolved)
  aggregate_type    (Sale / Payout)
  aggregate_id      (which Sale or Payout this event belongs to)
  payload           (jsonb — event-specific data, e.g. amount, rate, currency)
  occurred_at
  actor             (system / webhook / admin — same initiated_via concept already used in 03. Database → Audit Log Design)
```

Never updated, never deleted — append-only, matching the "never hard-delete the financial chain" principle already established in Soft Delete Policy, taken to its natural conclusion.

## Current-State Tables Become Projections, Not Sources of Truth

**This changes the role of the existing `sales`, `commissions`, `payouts`, `platform_fees` tables (03. Database → Table Specifications) — they're now read-optimized projections, rebuilt from `financial_events`, not directly mutated by application code.** A background process (or synchronous projection update within the same transaction as the event append, for MVP simplicity) updates these tables whenever a new event lands. The tables themselves remain exactly as already specified — nothing about their columns changes, only where their data comes from.

## Why Not Pure Event Sourcing (No Projection Tables at All)

A "replay every event on every read" approach would be correct but slow at any real scale — checking a Sale's status would mean replaying its full event history every time. The projection tables solve this: fast reads from a normal table, provable correctness because that table is always derived from (and regenerable from) the immutable event log, never the other way around.

## What This Gives You, Concretely

- **True point-in-time reconstruction** — replay events up to any timestamp to see exactly what a Sale's state was at that moment, directly strengthens 06. Infrastructure → Disaster Recovery's point-in-time recovery goal for financial data specifically
- **Reconciliation gets stronger** — 05. Payments → Reconciliation can verify a projection table is correct by replaying its events and comparing, not just trust that no bug ever mutated it incorrectly
- **Dispute resolution has a real answer** — "why does this Commission show this amount" is answered by the exact sequence of events that produced it, not just a final number with a separate audit log entry

## Relationship to Audit Log Design

This **subsumes** what Audit Log Design was doing specifically for Sale/Commission/Payout status changes — those now live in `financial_events` instead of the generic `audit_log` table. Audit Log Design remains the right mechanism for Campaign changes, Application status changes, and Admin actions, which don't need full event-sourced replay — the two systems now have a clear boundary: money goes through `financial_events`, everything else through `audit_log`.

## Conflict Resolution for the Rest of the Schema

For everything NOT in the financial chain (Campaigns, Offers, CreatorProfile/MerchantProfile edits) — **last-write-wins by timestamp**, the simpler default appropriate for low-collaboration, single-owner-edits-their-own-data scenarios. Every mutable row carries `updated_at`; a write includes an optimistic check against the timestamp it last read, and the most recent write wins on conflict. No event sourcing, no CRDTs — this data doesn't have concurrent-editing needs that would justify either.

## Open Questions

- Whether projection updates happen synchronously (within the same DB transaction as the event append — simpler, MVP-appropriate) or asynchronously via a background job (more scalable, more moving parts) — recommend synchronous for MVP given current scale, revisit if event volume ever makes it a bottleneck

## Update (2026-08-04): Monthly Partitioning Adopted

**`financial_events` is partitioned by month** (native Postgres declarative partitioning), per 06. Infrastructure → Scaling Strategy's Tier 2 — low-risk, no new infrastructure, works identically on Supabase or Neon. Directly useful for two reasons: keeps individual partitions from growing unbounded as the append-only log accumulates, and gives 04. Data Retention Policy Engine's "archive to cold storage" action a clean, natural boundary to archive along (whole months at a time) rather than needing a more complex row-level archival query.
