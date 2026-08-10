# Failure Modes Registry

## Purpose

One table: every external dependency and internal component, what breaks if it fails, blast radius, and where the mitigation lives. Consolidates what's scattered across the six Edge Cases docs, Failure Scenarios, and component-specific notes in Hosting Strategy, Authentication, etc. — doesn't replace those, indexes them.

## External Dependencies

| Component | If it fails | Blast radius | Mitigation | Detail |
| --- | --- | --- | --- | --- |
| **Paddle** | No billing cycles or creator payouts possible — checkout itself is unaffected since it happens on the merchant's own site | Commissions accrue normally, payouts delay until Paddle recovers | Managed provider reliability | 08. Failure Scenarios |
| **Ory Kratos / Ory Network** | No login/signup | No new sessions; existing sessions continue until expiry; public campaign browsing unaffected | Ory Network managed reliability; self-host migration path exists if needed | 04. Authentication |
| **Supabase (MVP) / Neon (later)** | Full outage — database is the source of truth for everything | Total app outage | Managed provider reliability; Disaster Recovery point-in-time restore; Neon migration path if Supabase specifically becomes the bottleneck | 06. Disaster Recovery, 06. Hosting Strategy |
| **Cloudflare** | DNS/CDN/WAF down | Total app unreachable (everything sits behind it) | This is the single largest concentration of risk in the stack — worth knowing plainly, not just accepted silently | 06. Hosting Strategy, 06. WAF Configuration |
| **Redis** | Celery jobs stop processing, rate limiting fails open or closed depending on implementation, caching unavailable | Payouts delay (queued, not lost); checkout itself likely still works if not directly dependent on cache | Monitoring alerts on queue depth | 02. Background Jobs, 02. Caching Strategy |
| **Email ESP (transactional)** | Payout/sale/security notifications stop sending | Users don't get notified, but underlying data/money movement is unaffected — a UX/trust gap, not a data-integrity one | Bounce/complaint monitoring catches this quickly | 06. Email Infrastructure |
| **AI/embeddings provider** | Matching, screening, copy-assist unavailable | Degrades to manual category filtering (matching was always layered on top of it, per 02. Search Strategy) — not a hard failure | Graceful fallback already built into the design | 02. AI Services |

## Internal Single Points of Failure

| Component | If it fails | Blast radius | Mitigation | Detail |
| --- | --- | --- | --- | --- |
| **FastAPI process itself crashes** | Everything it directly serves goes down together (it's one monolithic process) | Full app outage until restart | Fast detection + auto-restart (process manager); modular monolith structure allows future extraction if a specific module needs isolation | 02. Backend Architecture |
| **VPS itself goes down** | Frontend + backend unreachable | Full outage; data safe (lives in managed Postgres/S3, not on the VPS) | Disaster Recovery: new VPS can be provisioned without data loss | 06. Disaster Recovery |
| **A single bad financial-chain deploy** | Incorrect commission/payout calculations could propagate across many sales before caught | High — direct financial/trust damage | Feature flags (kill in seconds, no redeploy needed), Staging-first, manual Production approval | 06. Feature Flags Strategy |

## Data-Integrity Failure Modes (from Edge Cases, indexed here)

- Partial refund commission handling — unresolved (05. Refund Handling)
- Chargeback dispute fee allocation — RESOLVED 2026-08-07: SellVia absorbs it for a merchant's first 5 lost disputes, merchant pays from the 6th onward (05. Chargebacks)
- Self-dealing (dual-role account applying to own campaign) — RESOLVED 2026-08-07: blocked outright (08. User Edge Cases)
- Merchant Paddle account restricted mid-campaign — RESOLVED 2026-08-07: auto-pause all live campaigns immediately (08. Business Edge Cases)
- Refund clawback with insufficient future creator balance to absorb it — accepted as a real cost of doing business, not solved away (08. Payment Edge Cases)

## Reading This Table

This is a map, not a fix-it list — several rows above point to genuinely open items (already flagged in their source docs) rather than resolved mitigations. Treat a blank/weak "Mitigation" cell as a prioritization signal, not an oversight in this registry specifically.

## Open Questions

- None new — this doc surfaces existing open items in one place rather than introducing new ones. Update this table whenever a new failure mode is identified anywhere else in the documentation.

## Update (2026-08-04): FastAPI Single-Process Risk Reduced

The "FastAPI process itself crashes" row above is improved, not fully eliminated: 06. Scaling Strategy now has multi-worker load balancing active on the VPS — a single worker crashing no longer takes the whole app down, Nginx routes around it. Full VPS-level failure (the machine itself, not just one process) is unchanged and still covered by the row below (Disaster Recovery).
