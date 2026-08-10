# Feature Capacity Readiness Check

## Purpose

A required check **before starting the build of any new feature**, not before shipping it — the question is whether everything the feature will lean on (database, cache, queues, third-party APIs, hosting) has headroom for the extra weight, not whether the feature itself works.

## Why This Is a Separate Gate From Release Process

1. Operations → Release Process governs how a finished change ships safely. This doc governs an earlier decision: **whether to build the feature the way it's currently scoped at all**, before any code is written — catching a capacity problem at design time is far cheaper than catching it after launch when real usage exposes it.

## The Checklist (run before build starts)

For any new feature, walk through what it actually adds load to:

- [ ]  **Database:** Does this add new queries to already-hot tables (`sales`, `attribution_events`, `applications`)? Any risk of N+1 queries? Does it need a new index (03. Database → Indexing Strategy), and if so, has that been planned rather than discovered via a slow-query alert later?
- [ ]  **Cache/Redis:** Does this add new cache keys at meaningful volume? Are they tenant-scoped correctly (02. Caching Strategy)? Does it compete for the same Redis instance already serving rate limiting, job queues, and existing caches (04. Security → Rate Limiting, 02. Background Jobs)?
- [ ]  **Background jobs:** Does this add new Celery job types or meaningfully increase volume on existing ones? Could it push queue depth into the territory Monitoring already watches for (06. Infrastructure → Monitoring's "backed-up payout queue" alert)?
- [ ]  **Third-party API limits:** Does this add new Paddle, Clerk, or AI/embeddings API calls in a user-facing (synchronous) path? Is there a rate-limit or cost ceiling on that provider this could approach (11. Analytics → AI / Token Usage Tracking is where AI cost would first show strain)?
- [ ]  **Financial-chain proximity:** Does this touch Sales, Commissions, Payouts, or the Ledger? If yes, this gets the extra-scrutiny treatment already established in Release Process for payments-adjacent changes — this checklist doesn't replace that, it runs in addition to it.
- [ ]  **VPS resources:** Is there a reason to expect this feature meaningfully increases CPU/memory/connection-pool usage on the single VPS (06. Infrastructure → Hosting Strategy)? Check current headroom via Monitoring's dashboards before assuming there's room — don't guess.

## What "Can It Hold the Weight" Actually Means Here

Not a formal load-testing requirement for every feature (that would be disproportionate at current scale) — it means: **look at what's already being watched (Monitoring) before adding load, and have an honest answer for each checklist item above**, even if the honest answer is "this is small enough not to matter." The failure mode this prevents isn't "nobody thought about it" — it's "nobody looked at current headroom before assuming there was some."

## If a Feature Would Exceed Headroom

Two honest options, decided deliberately rather than by default:

1. **Redesign the feature** to reduce its load footprint (batch instead of per-request, cache more aggressively, move a sync call to async) — usually the right first move
2. **Scale the underlying layer first**, deliberately, before building the feature on top of it — per 06. Infrastructure → Scaling Strategy's existing "vertical first, horizontal later" progression, not as a rushed reaction after the feature ships and something breaks

## Open Questions

- None blocking — this is a process discipline to apply going forward, not a design decision requiring further input. Its effectiveness depends on actually being run before each new feature, not on anything further being specified here.