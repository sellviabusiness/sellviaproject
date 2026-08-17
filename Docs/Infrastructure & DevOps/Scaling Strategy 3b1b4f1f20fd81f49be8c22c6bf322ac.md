# Scaling Strategy

## Purpose

How SellVia grows beyond a single VPS, if/when it needs to.

## Current Stance (per the original conversation)

"One VPS can comfortably serve thousands of users if the app is well-built" — this remains the honest MVP-through-early-growth stance. Scaling infrastructure prematurely is a bigger risk than needing to scale later.

## What Scales Independently Already

Because managed Postgres, managed/self-hosted Redis, and S3-compatible storage are already separate from the VPS itself (per Hosting Strategy), the app server is the main thing that would need scaling — not the whole stack at once.

## Natural Next Steps, When Needed

- Vertical scaling (bigger VPS) first — simplest, no architecture change
- Horizontal scaling (multiple app instances behind a load balancer) once vertical scaling isn't enough — requires background workers to be safely run across multiple instances (already designed for this via Redis-backed queues, per 02. Background Jobs, so this isn't a redesign, just an infrastructure addition)
- Read replicas for Postgres if read load (dashboards, analytics) becomes the bottleneck rather than writes

## Open Questions

- None blocking — deliberately deferred until real usage data shows where the actual bottleneck is, rather than guessing and over-building now.

## Update (2026-08-04): Formal Escalation Ladder — Index → Partition → Shard

Sharpens the existing "vertical first, horizontal later" stance above into a concrete three-tier ladder, each tier only reached after the previous one is genuinely exhausted, not skipped ahead of on speculation:

### Tier 1: Indexing & Query Optimization (default, exhaust first)

Standard practice — 03. Indexing Strategy already covers this. The overwhelming majority of real performance problems at SellVia's likely scale for the foreseeable future are solved here, not by anything below.

### Tier 2: Partitioning (Postgres-native, low-risk, no new infrastructure)

**Adopted now for `financial_events` (03. Event Sourcing — Financial Chain): partitioned by month.** This table is append-only and grows unboundedly by design; native Postgres declarative partitioning keeps individual partitions manageable and gives the Data Retention Policy Engine's "archive to cold storage" action a natural boundary to archive along. Works identically on Supabase or Neon — no new infrastructure, no vendor dependency, low risk.

Other tables get partitioned only if/when they show the same unbounded-growth-plus-time-range-query pattern (e.g. `attribution_events` is a plausible future candidate) — not applied speculatively across the whole schema.

### Tier 3: Sharding (deferred — not built, documented for the future only)

**Tenant-based sharding via Citus** (or similar), with small tenants pooled on a shared instance and the application layer routing by organization/tenant ID, is the defined strategy **if and only if** Tier 1 and Tier 2 are genuinely exhausted under real production load — not before. Two things worth being explicit about now, so this doesn't get built prematurely later either:n- **This is hyperscale-tier architecture** — appropriate at a scale (hundreds of thousands of tenants, real single-node Postgres limits) far beyond anything SellVia is likely to hit for a long time. Building it now would repeat the exact mistake this doc already warns against ("scaling infrastructure prematurely is a bigger risk than needing to scale later").n- **Citus isn't natively available on Supabase or Neon** — reaching this tier would mean another database platform decision (Azure Cosmos DB for PostgreSQL, or self-hosting Postgres+Citus), on top of the Supabase→Neon path already planned. This is a real, known cost of this tier, not a detail to discover later.

## Revisit Trigger (unchanged in spirit)

Move up a tier only on real evidence — slow-query logs pointing at Tier 1 exhaustion before considering Tier 2; genuine single-node Postgres limits under real load before considering Tier 3. Never on speculation.

## Update (2026-08-04): Confirmed Current State — Nothing New Needed

Checked against an explicit request for load balancing, connection pooling, and job queuing — all three were already decided:

- **Connection pooling:** already on (Hosting Strategy — Supavisor Session mode + SQLAlchemy engine pool)
- **Queue for expensive operations:** already on (02. Background Jobs — webhook processing, payout batching, notification/email delivery, refund clawback all run via Celery, never inline in a request)
- **Load balancing:** correctly NOT yet active — this doc's existing horizontal-scaling tier is the plan, deliberately not turned on for a pre-launch, single-instance app. Background jobs were built Redis-queue-based from day one specifically so this tier activates cleanly when real load justifies it.

**Clarifying note:** this app-level ladder (vertical → horizontal → read replicas) is separate from 03. Database's Index → Partition → Shard ladder added the same day — they address different bottlenecks (app compute vs. database) and don't conflict or overlap.

## Update (2026-08-04): Load Balancing Activated (Worker-Level)

**Decided: multi-worker load balancing is now active**, at the process level on the single VPS — Nginx (06. Reverse Proxy) distributes requests across multiple FastAPI worker processes (via gunicorn managing multiple uvicorn workers), rather than a single process handling every request.

**Why this tier specifically, not multi-VPS:** this gives real load balancing benefits — better concurrency, and critically, **one worker crashing no longer takes the whole app down** (directly improves on the single-point-of-failure noted in 08. Failure Modes Registry: "FastAPI process itself crashes → everything goes down together") — without the cost of running multiple VPS instances, which isn't yet justified by real traffic.

**Configuration approach:** worker count sized to the VPS's CPU cores (a common starting formula is `2 \u00d7 cores + 1`, tuned down if memory-constrained — verify against actual VPS spec once provisioned). Workers are stateless by design already (sessions live in Ory Kratos, not in-process; Redis holds shared cache/queue state) — so this required no application changes, just process/Nginx configuration.

## Multi-VPS Horizontal Scaling — Explicitly Separate, Not Activated

**Still NOT active, and deliberately flagged rather than assumed:** running multiple full VPS instances behind a load balancer (Cloudflare Load Balancing or similar) is a distinct, bigger commitment — real recurring cost for 2+ servers instead of 1, before real traffic demands it. This remains the next tier up, triggered by actual evidence (per this doc's existing revisit-trigger philosophy), not activated by default alongside the worker-level change above. Confirm explicitly if this is actually wanted now rather than at the traffic-justified trigger point.
