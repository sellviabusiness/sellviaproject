# Monitoring

## Purpose

Knowing when something's wrong before a user reports it — especially important given SellVia now processes real payments.

## What Gets Monitored (per the original conversation, plus payments-specific additions)

- CPU / memory / disk usage on the VPS
- Application crashes / process restarts
- Database connection health (managed Postgres provider's own monitoring, plus app-level health checks)
- **Paddle webhook failures** — new addition given the payments architecture: repeated webhook signature failures or processing errors should alert immediately, since this is the mechanism that keeps Sale/Payout state accurate
- **Reconciliation mismatches** (05. Payments → Reconciliation) — any discrepancy between internal records and Paddle should trigger an alert, not just get logged

## Approach

A hosted monitoring/alerting service (e.g. a standard APM/uptime tool) rather than building custom dashboards from scratch at this stage — consistent with the broader principle of using managed services for undifferentiated infrastructure work.

## Open Questions

- Specific monitoring tool choice — not decided, reasonable to pick based on budget/familiarity when ready to implement

## Update (2026-08-04): Uptime Monitoring Tool — Better Uptime

**Recommended: Better Uptime**, specifically because it does both jobs already needed — uptime monitoring AND the status page tool (10. Status Page & Incident Communication already named "Instatus or Better Uptime-style" as the direction; picking Better Uptime specifically consolidates two needs into one vendor instead of two separate tools).

**Configuration matching what was asked:**

- Ping interval: **5 minutes** (checks the app's `/health` endpoint, per 06. Infrastructure's health-check pattern, plus the public marketing site)
- Alerting: **SMS/call**, not just email — Better Uptime supports this directly, which matters specifically because an email alert can sit unread while an outage continues; a text/call is what actually wakes someone up
- Runs on Better Uptime's own infrastructure, separate from SellVia's stack entirely — same reasoning already established for the status page (a monitoring tool hosted on the thing it's monitoring is useless exactly when needed most)

**What it monitors:** application health endpoint, public marketing site, and can be extended to check Paddle/Ory Kratos/Supabase reachability specifically if a more granular "what exactly is down" signal is wanted later — starting with the core health check is sufficient for MVP.

## Open Questions (Update)

- None blocking — tool choice made; account setup is an implementation step, not a design decision.
