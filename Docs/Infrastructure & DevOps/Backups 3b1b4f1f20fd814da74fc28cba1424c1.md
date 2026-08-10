# Backups

## Purpose

Protecting against data loss — directly from the original conversation's stated approach, now the confirmed policy.

## Policy (from the original conversation)

```
Every night
  ↓
Dump PostgreSQL
  ↓
Upload to S3
  ↓
Keep 30 days
```

## Why This Matters More Now

Given SellVia now holds real financial records (Sales, Commissions, Payouts — 03. Database), backup integrity is materially higher-stakes than in the original conversation's more generic framing. The 30-day retention should be treated as a floor, not necessarily sufficient on its own — see Disaster Recovery for point-in-time recovery, which matters more for financial data than a nightly dump alone provides.

## What's Backed Up

- PostgreSQL (nightly dump, per above)
- Object storage (S3-compatible, typically versioned/redundant by the provider itself rather than needing a separate backup job)

## Open Questions

- Whether 30-day retention is sufficient for financial/audit purposes, or whether longer-term archival (e.g. yearly snapshots kept indefinitely) is needed alongside the rolling 30-day operational backups — worth a real decision given potential future tax/legal need to reconstruct history (echoes 03. Database → Audit Log Design's same open question)

## Update (2026-08-04): Current State vs. Contingency

**Current state — already automatic, nothing to build:** Supabase (06. Hosting Strategy's confirmed MVP database) runs automated backups by default. Neon, the confirmed production target, does as well. Neither requires this doc's manual backup job while on managed hosting.

**Worth flagging directly:** the database itself was deliberately kept OFF the VPS — Hosting Strategy chose managed Postgres (Supabase → Neon) specifically because self-managing a database is "the hardest thing to manage well" (the original infra reasoning this whole project started from). There's currently no plan to move the database itself onto the VPS — the VPS hosts the application (frontend/backend/workers) only.

**Contingency, documented in case this ever changes** (e.g. if Tier 3 of 06. Scaling Strategy's escalation ladder is ever reached and self-hosted Postgres+Citus becomes necessary at genuine hyperscale — explicitly not the current plan): a scheduled job (`pg_dump` nightly) uploading to S3-compatible cloud storage, 30-day rolling retention as a floor, matching this doc's existing policy. Same pattern already used for the operational backup approach described above — nothing new to design if this contingency is ever triggered, just a matter of activating it.