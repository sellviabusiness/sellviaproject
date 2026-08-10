# Logging

## Purpose

What's logged, in what format, and for how long — distinct from the Audit Log (03. Database, a permanent financial/business record) and from 06. Error Handling & Logging Pipeline (which is specifically about error capture and alerting). This doc covers the general logging discipline everything else builds on.

## Structured Logging — Objects, Not Sentences

**Every log entry is a structured object, never a free-text sentence.** A sentence like `"User 123 failed to approve application 456"` can't be filtered, aggregated, or queried reliably; a structured object can:

```json
{
  "timestamp": "2026-08-04T14:32:01Z",
  "severity": "WARNING",
  "request_id": "req_9f2a...",
  "correlation_id": "corr_7b1c...",
  "user_id": "usr_abc...",
  "tenant_id": "merchant_xyz...",
  "action": "application.approve",
  "route": "/api/v1/applications/456",
  "message": "Approval failed: campaign already ended",
  "metadata": { "campaign_id": "camp_...", "application_id": "app_456" }
}
```

This is what makes "searchable, filterable, queryable" actually true — query by `severity=ERROR AND tenant_id=X`, or `correlation_id=Y` to see every log line tied to one logical operation, rather than grepping free text.

**Closes an existing gap:** 04. Security → Tenant Isolation Audit flagged "logs aren't tenant-tagged" as an unresolved gap. The `tenant_id` field above closes it directly — every log line touching tenant-owned data now carries the tenant context structurally, not as an afterthought.

## Correlation IDs — Tracing Across Boundaries

Two distinct IDs, not one, because they answer different questions:

- **`request_id`** — unique per single HTTP request. Answers "what happened during this one API call."
- **`correlation_id`** — unique per logical operation, generated once at the entry point and **propagated through every subsequent step**, even across service and process boundaries. Answers "show me everything that happened as a result of this one user action."

**Example: a checkout.** A correlation ID is generated when the checkout session starts. It's carried through: the checkout API request → the Stripe PaymentIntent creation → the Celery job payload when the webhook enqueues background work (02. Background Jobs' job payloads now carry `correlation_id` alongside the `tenant_id` already required per Tenant Isolation Audit's Gap 2) → the webhook processing itself → the notification that gets sent. One correlation ID, one complete story, queryable as a single trace even though it spans the FastAPI backend, Celery, and an external Stripe webhook callback.

**Where it can't be generated at the true origin:** for a Stripe webhook (which doesn't know SellVia's correlation ID scheme), map it back via the PaymentIntent or Sale ID already stored — the correlation ID is attached the moment the webhook handler resolves which internal operation it belongs to.

## Log Level Discipline — Not Everything Is ERROR, Not Everything Is INFO

Concrete criteria, so severity is a meaningful filter rather than noise:

| Level | Use for | Example |
| --- | --- | --- |
| **DEBUG** | Verbose internal state, useful only during active debugging | Variable values during a specific code path — filtered out by default in Production |
| **INFO** | Normal, expected operations — the routine narrative of the system working correctly | "Sale verified," "Payout triggered," "Application approved" |
| **WARNING** | Something unexpected but handled/recovered automatically, no action needed yet | "Retry attempt 2 of 3," "approaching rate limit threshold" |
| **ERROR** | Something failed and needs attention, but the system continues operating | A single background job failed after all retries, a single webhook processing error (06. Error Handling & Logging Pipeline) |
| **CRITICAL** | System integrity is threatened, or immediate human intervention is needed | Payment callback failure with money in an inconsistent state, reconciliation mismatch found — matches the "alert immediately" tier already established in Error Handling & Logging Pipeline |

**The discipline that matters most: a routine expected client error (a 404 for a resource that legitimately doesn't exist, a 401 from an invalid token) is not an ERROR** — it's normal system behavior responding correctly to normal conditions, logged at INFO or not logged as a failure at all. Reserve ERROR for things that are actually wrong. Logging every expected 4xx as ERROR trains everyone to ignore the error log, which defeats its entire purpose.

## Retention

Unchanged: 30–90 days (04. Data Retention Policy Engine's "operational/application logs" category) — diagnostic value, not a compliance record.

## Where This Data Lives

Same structured pipeline as 06. Error Handling & Logging Pipeline (Sentry or equivalent, or a structured log aggregator) — this doc's structured format is what makes that pipeline's search/filter/query capability actually work, rather than being aspirational.

## Open Questions

- Specific log aggregation/query tool — not decided, doesn't block adopting the structured format itself, which is tool-independent