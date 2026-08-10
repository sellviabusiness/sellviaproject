# Tenant Isolation Audit

## Purpose

Audit every layer shared across Merchants and Creators for tenant isolation — and establish the governing principle: **if a layer doesn't know which tenant it's serving, it must not serve anything at all, rather than guessing or defaulting to "serve it anyway."**

## Tenant Definition

`MerchantProfile.id` or `CreatorProfile.id` (see 02. Caching Strategy's update for full reasoning). Admin is intentionally cross-tenant by design.

## Audit: Every Shared Layer

| Layer | Tenant-aware? | Isolation mechanism | Status |
| --- | --- | --- | --- |
| **PostgreSQL (shared DB, all tenants in same tables)** | Yes, required | Row-level scoping (04. Security → Authorization: `WHERE merchant_profile_id = current_user...`) | **Risk flagged below** — currently convention-based, not structurally enforced |
| **Redis cache** | Yes, required for private data | Mandatory tenant-prefixed keys (02. Caching Strategy, updated 2026-08-04) | Addressed |
| **Redis/Celery job queue** | Yes, required | Job payloads must carry tenant context explicitly — **gap identified below**, not previously specified | **Gap — needs fixing** |
| **AI Services (embeddings/matching)** | Mixed — see below | Matching is intentionally cross-tenant (discovery); screening/copy-assist are tenant-private | Needs explicit split, see below |
| **File storage (S3)** | Yes, required | Per-tenant object key prefixes — **gap identified below**, not previously specified | **Gap — needs fixing** |
| **Logging** | Yes, required | Logs must be tenant-tagged for scoped incident investigation | **Gap — needs fixing** |
| **Notifications** | Yes, required | Already scoped to `user_id` per recipient (03. Database → notifications table) | Addressed |
| **Analytics dashboards** | Yes, required | Per-merchant/per-creator dashboards already scoped by design (01. Business Logic → User Flows) | Addressed |

## Gap 1: Database Row-Level Scoping Is Convention, Not Structurally Enforced

1. Security → Authorization already states queries "are automatically scoped" — but as written, this relies on every query being written correctly by hand. **Recommend a repository-pattern enforcement layer**: every data-access function for tenant-owned tables requires a tenant ID parameter to even compile/run, making an unscoped query structurally awkward to write rather than just a convention to remember. This is the single highest-value fix in this audit, since a missed `WHERE` clause here is a direct cross-tenant data leak, not a performance issue.

## Gap 2: Background Job Payloads Don't Currently Carry Tenant Context

1. Background Jobs lists job types (payout batching, refund clawback, etc.) but never specified that job payloads must carry the tenant ID explicitly rather than a bare entity ID a worker then has to resolve. **Fix:** every job payload includes the owning tenant ID directly, and worker code fails closed (refuses to process) if a job arrives without one — exactly the "doesn't know which tenant, doesn't serve" principle applied to background processing, not just live requests.

## Gap 3: File Storage Has No Per-Tenant Key Scoping Yet

1. Database → File Storage currently separates by environment (prod/staging/local) but never specified per-tenant object key structure. **Fix:** object keys prefixed by owning tenant (`merchant/{merchant_profile_id}/product-images/{file_id}`), and access checks verify the requesting user's tenant matches the key prefix before generating any signed URL — prevents one merchant from guessing/accessing another's uploaded file by URL manipulation.

## Gap 4: Logs Aren't Currently Tenant-Tagged

1. Infrastructure → Logging specifies what's logged but not tenant tagging. **Fix:** every log line touching tenant data includes the tenant ID as a structured field, so an incident investigation (10. Operations → Incident Response) can be scoped to exactly the affected tenant(s) rather than searching unstructured logs.

## AI Services: The Split That Matters

- **Matching (creator ↔ campaign discovery):** intentionally cross-tenant — a Creator's embedding is deliberately compared against all Merchants' campaign embeddings. This is correct, not a leak, same reasoning as public campaign discovery.
- **Screening (application fit summaries) and copy-assist (campaign description drafts):** tenant-private — a screening summary is for one specific Merchant reviewing one specific Application, and must never be visible to any other Merchant. AI / Token Usage Tracking's `related_user_id` field already supports scoping this correctly; worth explicitly confirming the screening/copy-assist code paths enforce it, not just log it after the fact.

## Fail-Closed Principle (governing rule for all of the above)

Any layer that cannot determine the current tenant context — a cache lookup with no tenant ID, a job with no tenant payload, a query with no scoping filter — **must refuse to serve/process rather than fall back to an unscoped or "serve everything" default.** This is a deliberate trade: occasional false "access denied" failures during development are far cheaper than a single real cross-tenant data leak in production.

## Open Questions

- None blocking the audit itself — the four gaps above are concrete, scoped fixes to implement, not open decisions requiring more input.

## Update (2026-08-04): Gap 4 Closed

1. Infrastructure → Logging now specifies structured, JSON-object logging with a mandatory `tenant_id` field on every log line touching tenant data, plus `request_id`/`correlation_id` for cross-boundary tracing. This is the concrete implementation of Gap 4's fix — no longer an open gap.
