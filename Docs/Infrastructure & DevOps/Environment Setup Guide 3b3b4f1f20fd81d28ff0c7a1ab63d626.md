# Environment Setup Guide

## Purpose

A practical, actionable checklist for standing up each environment — companion to 06. Environment Strategy's principles, this is the runbook: what actually needs to be configured, per environment, for the full current stack.

## Full Service Inventory (as of 2026-08-04)

Every environment needs its own instance/config of:

- **Frontend:** Next.js + shadcn/ui + Tailwind
- **Backend:** FastAPI (Python), SQLAlchemy + Alembic
- **Database:** Supabase (MVP) — Session-mode Supavisor pooling, pgvector enabled
- **Auth:** Ory Kratos — Ory Network project (MVP) or self-hosted instance
- **Payments:** Paddle (test mode for Local/Staging, live for Production)
- **Cache/Queue:** Redis (Celery broker + rate limiting + caching)
- **CDN/WAF:** Cloudflare
- **Transactional email:** `mail.wesellvia.com` (Postmark-style ESP)
- **Marketing email:** `news.wesellvia.com` (separate ESP)
- **Object storage:** S3-compatible (or Supabase Storage, still open per 03. Database → File Storage)
- **Status page:** separate domain, separate managed tool — not environment-specific, but worth noting it's outside this entire stack by design

## Local

```text
DATABASE_URL=<local Postgres or Supabase dev branch>
ORY_KRATOS_URL=<local Kratos instance or Ory Network dev project>
PADDLE_API_KEY=<test mode>
PADDLE_WEBHOOK_SECRET=<test mode, via Paddle CLI forwarding>
REDIS_URL=<local Redis>
MAIL_FROM_DOMAIN=<sandboxed — never real inboxes>
PAYMENT_MODE=test
```

**Checklist:**

- [ ]  Fake/test users, fake payments (Paddle test cards), no real emails sent
- [ ]  Local Redis running for Celery + rate limiting to function at all
- [ ]  Paddle CLI forwarding webhooks to `localhost` for end-to-end checkout testing

## Staging

```text
DATABASE_URL=<separate Supabase project/branch — sellvia_stage>
ORY_KRATOS_URL=<separate Ory project>
PADDLE_API_KEY=<test mode>
MAIL_FROM_DOMAIN=<sandboxed per Environment Strategy — never real inboxes>
PAYMENT_MODE=test
```

**Checklist:**

- [ ]  Confirmed separate database from Production (03. Database, never shared)
- [ ]  Confirmed separate file storage bucket/prefix from Production
- [ ]  Every migration runs here first, before Production (03. Migration Strategy)
- [ ]  Near-exact mirror of Production configuration otherwise — this is what makes a Staging pass meaningful signal

## Production

```text
DATABASE_URL=<Supabase prod, migrating to Neon per Architecture Decision Log>
ORY_KRATOS_URL=<Ory Network prod project>
PADDLE_API_KEY=<live mode>
PADDLE_WEBHOOK_SECRET=<live mode>
MAIL_FROM_DOMAIN=mail.wesellvia.com
PAYMENT_MODE=live
```

**Checklist:**

- [ ]  Live Paddle keys confirmed, test keys confirmed absent
- [ ]  WAF (Cloudflare) and IP anomaly detection active (04. Security)
- [ ]  Feature flags default OFF for any new financial-chain feature (06. Feature Flags Strategy)
- [ ]  Status page live and pointing to correct domain (10. Status Page & Incident Communication)
- [ ]  Manual approval gate confirmed active on deploy (06. CI/CD Pipeline)
- [ ]  Backups running (06. Backups), Disaster Recovery tested

## Common Setup Failure Modes (see also 08. Failure Modes Registry)

- **Env var scoped to build time but not runtime** (or vice versa) — a real, easy-to-miss gap on some hosting platforms; verify explicitly, don't assume
- **Test/live Paddle key mixup** — the single most damaging possible misconfiguration given this is a live payments system; treat key verification as a hard pre-deploy gate, not a one-time check
- **Staging accidentally emailing real addresses** — verify the email sandbox is actually configured, don't assume the "separate domain" principle alone prevents this

## Open Questions

- Exact secrets manager/vault tool for Production credential storage — not yet chosen, low urgency until team grows beyond founder-managed secrets (04. Secrets Management)

## Update (2026-08-04): Actual Commands and Known Workarounds

## Local Setup — Actual Commands

```bash
# Backend
cd apps/backend
uv sync                          # or pip install -r requirements.txt
alembic upgrade head             # run migrations
uvicorn main:app --reload        # dev server

# Frontend
cd apps/frontend
npm install
npm run dev

# Background workers
celery -A worker worker --loglevel=info

# Paddle webhook forwarding (required for local checkout testing)
paddle listen --forward-to localhost:8000/webhooks/paddle
```

## Known Workarounds — Gotchas Already Surfaced in This Build

Compiling these in one place so they aren't rediscovered the hard way later:

- **Supavisor must be Session mode, not Transaction mode** (06. Hosting Strategy) — Transaction mode conflicts with SQLAlchemy's default prepared statements. Easy default to get wrong if following generic Supabase docs without this context.
- **CORS `allow_credentials=True` cannot pair with a wildcard origin** (04. CORS, CSP & Security Headers) — must list the exact frontend origin per environment; this is a hard CORS spec requirement, not a preference, and Ory Kratos's cookie-based sessions depend on it.
- **CSP must explicitly allow `js.paddle.com` and `api.paddle.com`** (04. CORS, CSP & Security Headers) — an overly strict default CSP silently breaks checkout with no obvious error.
- **Middleware/Edge Runtime:** if any Edge-run code (Next.js middleware) ever imports a module with native Node bindings (the bcrypt/Edge Runtime class of bug, encountered directly in a related project this session), it fails in a way that's easy to lose in build logs — keep Edge-run code importing only Edge-safe dependencies.
- **Env vars scoped to build time vs. runtime** — verify explicitly per hosting platform; this has been a repeat source of "works in build, fails at runtime" confusion in adjacent projects this session.

## Update (2026-08-04): Detailed Failure Walkthroughs

Two specific scenarios, expanded beyond the summary table in 08. Failure Modes Registry:

**Database goes down (Supabase/Neon):**

1. Health check (06. Monitoring) fails within seconds
2. Every request touching the DB fails — per 06. Error Handling & Logging Pipeline, this returns the safe mapped error message (never a raw connection-string or driver error), logged as CRITICAL
3. Celery jobs queue up rather than fail silently (Redis holds them) — they process once the DB recovers, nothing is lost, but payouts/notifications are delayed during the outage
4. Status page (10. Status Page & Incident Communication) gets an Investigating post
5. Recovery: Supabase/Neon's own reliability handles most cases; 06. Disaster Recovery's point-in-time restore is the fallback for genuine data loss, not routine downtime

**Rate limit hit (a user or IP exceeds a threshold):**

1. Request rejected with `429 Too Many Requests`, part of the standard error shape (07. Error Responses), never a silent hang
2. This is logged at WARNING, not ERROR (06. Logging's level discipline) — a rate limit doing its job correctly is expected behavior, not a system failure
3. For 04. IP Anomaly Detection & Escalation specifically: repeated rate-limit hits from the same IP feed into that system's risk score — a single 429 is normal; a pattern of them is what escalates toward throttling/temporary ban
4. The user-facing message is generic and safe ("too many requests, try again shortly") — never reveals the exact threshold or window, which would help someone probe around the limit
