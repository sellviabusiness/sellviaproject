# Infrastructure Edge Cases

## Purpose

What happens when the infrastructure itself misbehaves, not the business logic.

## Cases

- **Stripe webhook delivery fails or is delayed** — Stripe retries automatically; SellVia's Reconciliation job (05. Payments) is the backstop that catches anything a retry still misses.
- **VPS goes down** — covered by Disaster Recovery (06. Infrastructure): data lives in managed Postgres/S3, not on the VPS itself, so a new VPS can be provisioned without data loss; there will be app downtime until it's back up, which needs a status-communication plan (10. Operations, not yet written).
- **Database connection pool exhausted under load** — not addressed in any prior doc; standard mitigation is connection pooling limits + graceful degradation (returning a clear "try again" error) rather than the app crashing outright. Worth a real decision on pool size once there's load-testing data, not guessed now.
- **Background job queue backs up** (e.g. payout batching job falls behind) — monitoring (06. Infrastructure) should alert on queue depth, since a backed-up payout queue directly undermines the "fast payout" trust story.

## Open Questions

- Database connection pool sizing — genuinely needs real load data, not a number to guess here

## Update (2026-08-04): Connection Pool Question Resolved

The "database connection pool exhausted under load — not addressed" gap above is closed: Supabase (06. Infrastructure → Hosting Strategy, confirmed for MVP) includes built-in PgBouncer connection pooling, which handles this directly rather than requiring custom pool-sizing decisions at this stage. Worth re-verifying pool limits specifically if/when Supabase is outgrown per Hosting Strategy's revisit trigger.