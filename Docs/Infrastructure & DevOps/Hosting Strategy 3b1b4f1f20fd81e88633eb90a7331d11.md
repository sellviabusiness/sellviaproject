# Hosting Strategy

## Purpose

Where SellVia actually runs — synthesized from the earlier VPS/hosting conversation, now formalized.

## Decided Approach

```
Cloudflare (DNS, CDN, HTTPS, DDoS protection)
        │
        ▼
VPS (Hetzner or DigitalOcean, Ubuntu)
        ├── Next.js app
        ├── Nginx (reverse proxy)
        └── Background workers

Managed PostgreSQL (Neon / Supabase / managed offering)
Managed Redis (or self-hosted depending on budget)
S3-compatible object storage (03. Database references this via 02. File Storage)
```

## Why Managed Postgres, Not Self-Hosted

Directly from the earlier conversation's reasoning: databases are the hardest thing to manage well (backups, replication, failover). Given SellVia is now a real payments system (not just a tracking tool), this reasoning applies even more strongly than originally discussed — a database failure here means lost financial records, not just lost content.

## What Runs on the VPS vs. Managed Services

| Component | Where |
| --- | --- |
| Next.js app + API | VPS |
| Nginx reverse proxy | VPS |
| Background workers | VPS (same box for MVP; separate box only if load justifies it — per 02. System Architecture's open question) |
| PostgreSQL | Managed (not VPS) |
| Redis | Managed or self-hosted on VPS, budget-dependent |
| File storage | S3-compatible object storage (not VPS) |
| Paddle, Clerk | Third-party, not self-hosted at all |

## Open Questions

- Final choice between Hetzner and DigitalOcean — both were named as options in the original conversation; either is reasonable, pick based on pricing/region needs once ready to provision

## Update (2026-08-04): Supabase Confirmed for MVP Postgres

**Decided: Supabase, for MVP specifically, with an explicit plan to reassess at scale** — not a permanent commitment.

**Why it was picked from the two options already listed above:**

- Native pgvector support — satisfies 02. AI Services' embedding-storage requirement without extra setup
- Built-in connection pooling (PgBouncer) — directly resolves the previously-open question in 08. Edge Cases → Infrastructure Edge Cases ("database connection pool exhausted under load — not addressed in any prior doc")
- Standard Postgres underneath — fully compatible with SQLAlchemy + Alembic, no vendor-specific ORM lock-in

**Portability discipline (so "change it later for big level" is actually easy when the time comes):** stick to vanilla Postgres features only — avoid building deep dependencies on Supabase-specific tooling beyond the database itself. This keeps a future migration to Neon, RDS, or self-managed Postgres a standard pg_dump/restore, not a rearchitecture.

**Explicitly NOT decided by this:** Supabase Auth is not used — Clerk remains the auth provider (04. Security → Authentication), unchanged. Whether to use Supabase Storage (vs. a separate S3-compatible provider, per 03. Database → File Storage) is a **separate, still-open decision** — not assumed by this choice.

**Known trade-offs to watch, not blocking:** free-tier project pausing after inactivity (worth confirming current policy before relying on it pre-launch) and Pro-tier cost scaling with usage — feeds directly into 11. Analytics → Automated Monthly P&L's hosting cost line once that's running.

## Revisit Trigger

Reassess (likely toward Neon, RDS, or self-managed) once real production load makes Supabase's pricing or specific limits (connection limits beyond the pooler, compute tier ceilings) an actual bottleneck — not on a fixed timeline, on real evidence.

## Update (2026-08-04): Supavisor Connection Configuration

**Enable Supavisor, but in Session mode, not Transaction mode.** Transaction mode is designed for serverless/edge functions with no persistent connection pool of their own — the FastAPI backend is a persistent, long-running process (Backend Architecture) that already maintains its own SQLAlchemy connection pool, so Session mode is the correct fit. Transaction mode would also conflict with SQLAlchemy's default use of prepared statements, a known incompatibility. Transaction mode becomes relevant only if a genuinely serverless component (e.g. a Supabase Edge Function for an isolated task) is added later — not for the main backend.

**Connection limits, set at every layer, not just one:**

- SQLAlchemy engine pool: `pool_size=10, max_overflow=5` per app instance (MVP starting point, tune with real load data)
- Supavisor's own pool size (configured in Supabase dashboard): set with headroom above the app-side pool, scaled to expected instance count
- Both must stay comfortably under the hard Postgres connection ceiling for the current Supabase plan tier

**Timeout: kept, not eliminated.** A reasonable `pool_timeout` (e.g. a few seconds) stays in place as a safety valve — an exhausted pool should fail fast with a clear "try again" error (per 08. Edge Cases → Infrastructure Edge Cases' existing standard mitigation), not hang indefinitely. Eliminating timeouts entirely trades a visible, debuggable error for a silent request pile-up, which is worse during an actual incident, not safer.

## Update (2026-08-04): Neon Confirmed as the Production/Scale Target

The earlier "likely toward Neon, RDS, or self-managed" hedge above is resolved: **Neon is the confirmed database for the actual product**, not just one option among several. Supabase remains the deliberate MVP-only choice (unchanged, see above); Neon is where the production database migrates to once MVP validation is done and Supabase's revisit trigger is hit — not a hedge anymore, an actual plan.

**Why Neon specifically, beyond "managed Postgres":**

- **Database branching** — Neon can branch the database itself (not just the schema) the same way Git branches code. This pairs directly with 06. Infrastructure → Environment Strategy and Git Repository Strategy: a feature branch could get its own database branch, seeded from production data instantly (copy-on-write, not a slow restore), rather than sharing a single Staging database across all in-flight work. Worth revisiting Environment Strategy once this migration happens — branch-per-feature database previews are a real upgrade over the current Local/Staging/Production three-tier model.
- **Serverless/autoscaling compute with scale-to-zero** — relevant for cost control if usage is spiky (e.g. traffic concentrated around specific campaign launches) rather than flat.
- **Standard Postgres underneath** — same portability guarantee already established for Supabase (vanilla Postgres features only, no deep vendor-specific dependencies) applies identically here.

## Migration Path (Supabase → Neon, when the time comes)

Standard `pg_dump`/restore or Neon's own migration tooling, since both are vanilla Postgres — this is exactly why the portability discipline was established from day one. Not a rearchitecture, a data migration.

## Revised Revisit Trigger

Unchanged in substance: migrate once real production load makes Supabase's pricing or connection/compute limits an actual bottleneck. The difference now is the destination is decided (Neon), not still an open menu of options.

## Update (2026-08-07): Frontend on Vercel for MVP, VPS Later

**Decided: Next.js frontend deploys on Vercel for MVP**, FastAPI backend stays on the VPS as already designed — confirmed as a clean split, no conflict with Session-mode Supavisor, Celery workers, or multi-worker load balancing, all of which correctly assume the backend specifically, not the frontend.

**Staged plan, same pattern as Supabase→Neon and Clerk→Ory Kratos:** frontend moves to the VPS later, consolidating both services onto one deployment surface once there's a reason to (e.g. simplifying CORS to same-origin, reducing vendor count, cost at scale). Not urgent, no defined trigger yet — revisit when it's actually worth the migration effort, not on a fixed timeline.

**What this means for 06. CI/CD Pipeline's "two independent deploy paths":** for now, three deploy surfaces in practice — Vercel (frontend, its own git-integrated deploy), VPS (backend), same backend deploy mechanics as already documented. Nothing else changes.