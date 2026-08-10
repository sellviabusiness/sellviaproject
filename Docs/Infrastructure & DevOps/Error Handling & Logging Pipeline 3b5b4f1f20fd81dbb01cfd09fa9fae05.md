# Error Handling & Logging Pipeline

## Purpose

Two-layer error handling — clean, safe messages to users; full technical detail to a private, searchable log — enforced at every boundary where an unhandled exception could otherwise leak internals or fail silently.

## The Two-Layer Principle (non-negotiable)

**Layer 1 — what the user sees:** a sanitized message + error code (07. API → Error Responses' existing shape: `{"error": {"code", "message", "status"}}`), never a raw exception message, never a stack trace, never an internal file path or query fragment.

**Layer 2 — what gets logged privately:** the full picture — stack trace, request context, timestamps — visible only to Admin, never exposed through any user-facing surface.

**Rule: the mapping from internal exception to user-facing message is explicit and centralized, never ad hoc per route.** A route handler doesn't decide in the moment what to tell the user — it raises/logs the real error, and a single global handler translates it to the safe, pre-defined message for that error class. This is what prevents the "someone forgot to sanitize this one endpoint" leak.

## Catching at Every Boundary

Every boundary gets its own catch-all, because an error that escapes one silently is either a leaked stack trace or a silently lost failure — both bad in different ways:

| Boundary | What "uncaught" would mean | Handling |
| --- | --- | --- |
| **API routes** | Raw exception serialized straight into the HTTP response — the classic stack-trace leak | Global FastAPI exception handler catches everything, logs full detail (Layer 2), returns the mapped safe message (Layer 1) |
| **Background jobs** (Celery) | A task fails silently, work is just... not done, with no visibility | Every task wrapped with logging + the existing retry-with-backoff/dead-letter handling (02. Background Jobs) — a failed job is now visible, not silent |
| **Webhook receivers** (Paddle) | An exception mid-processing means a Sale never gets marked verified, and nothing tells anyone | Full try/catch around webhook handler logic; a failure here gets logged AND alerted (not just logged) since it directly risks 05. Payments → Reconciliation catching a real discrepancy later instead of it being caught immediately |
| **Payment callbacks** (payment confirmation flow) | Worst case: Paddle charge succeeds, but the DB write recording it fails — money moved, system doesn't know | Highest-scrutiny boundary in the whole list. Logged with full context AND immediately alerted, not batched — this is exactly the scenario 05. Payments → Reconciliation exists to catch as a backstop, but the goal here is catching it in real time, before reconciliation ever needs to |

## The Logging Pipeline

**Recommend Sentry** (or equivalent), not a custom-built log store — consistent with the pattern used throughout this build (Paddle, Ory Kratos, Supabase, the status page tool): use a managed service for a problem that's already been solved well, rather than building searchable log infrastructure from scratch.

**Captured per error (all private, Admin-only access):**

- Timestamp
- User session context (which user, which role — tied to 03. Database → Audit Log Design's `initiated_via` concept, so an error can be traced to whether it came from a human, the AI Console, or a webhook)
- Route/endpoint
- Input payload — **scrubbed before logging**, not raw: never log passwords, session tokens, or full card data (moot for cards specifically since Paddle Checkout means SellVia never sees raw card data at all, per 04. Security → Encryption) — email addresses and other PII get scrubbed or hashed depending on what's actually needed for debugging
- Full stack trace
- Release/deploy version — ties directly to 06. Git Repository Strategy's semantic version tags on every Production deploy, so an error can be pinned to exactly which release introduced it

**Retention:** same 30–90 day window as other operational logs (06. Logging, 04. Data Retention Policy Engine's "operational/application logs" category) — diagnostic value, not a compliance record, no need for longer retention.

**Alerting tier:** most errors log and wait to be reviewed; **webhook and payment-callback failures alert immediately** (06. Monitoring), matching the higher scrutiny already established for anything in the financial chain.

## Automated Testing — Catching These Before Users Do

A dedicated **error-path test suite**, run in CI (06. CI/CD Pipeline) alongside the existing Cross-Tenant Isolation Testing suite — same spirit, different target: deliberately trigger failure conditions (malformed input, a mocked third-party API failure, a DB write failure mid-transaction) and assert two things every time:

1. The user-facing response is the safe, mapped message — never a raw exception
2. The full error was actually logged to the pipeline above — a test that only checks #1 could pass while errors silently vanish, which is its own failure mode

## Open Questions

- Exact Sentry (or equivalent) plan/tier — not decided, reasonable to pick once ready to set this up
- Whether payment-callback alerts go to the same channel as general Monitoring alerts or a distinct higher-priority channel — reasonable default is a distinct channel given how much higher the stakes are, not yet formally decided
