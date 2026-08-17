# Release Process

## Purpose

How a change actually goes out the door — the process wrapper around the technical CI/CD Pipeline (06. Infrastructure).

## Process

1. Feature built and tested against Staging (per Environment Strategy)
2. Merchant/Creator-facing changes: sanity-checked against [design.md](http://design.md) and 09. UX's established patterns before merge, so the product doesn't visually drift release over release
3. Anything touching payments/commission logic gets extra scrutiny — a manual review checklist referencing 05. Payments and 03. Database's constraints, not just automated tests, given how much of this system was built around "verified" and "instant" claims that need to keep being true
4. Production deploy (per CI/CD Pipeline's recommended manual-approval step for Production specifically)
5. Post-deploy check: Monitoring dashboards reviewed briefly after any Production release, not just left to alert passively

## Open Questions

- None blocking — this is a process wrapper around already-decided technical steps (06. Infrastructure → CI/CD Pipeline), formalized here mainly so it isn't skipped under time pressure once real users depend on the product.

## Update (2026-08-04): Capacity Check Now Precedes This Process

Before this Release Process even begins for a **new feature** (not a bug fix or small iteration), run 10. Operations → Feature Capacity Readiness Check first — that doc governs whether the underlying systems (DB, cache, queues, third-party APIs, VPS) can absorb the feature's added load *before* any code is written, which is a separate, earlier question than this doc's "how does a finished change ship safely."

## Update (2026-08-04): Feature Flags Now Required for Financial-Chain Changes

The "extra scrutiny for payments-adjacent changes" step above now has a concrete mechanism: any change touching Sales, Commissions, Payouts, or Refunds ships behind a feature flag (06. Infrastructure → Feature Flags Strategy), Admin-tested in Production before wider rollout, gradually rolled out rather than merged straight to 100% of users.

## Update (2026-08-04): Support Playbook Gate Added

No feature is considered complete until its 10. Operations → Per-Feature Support Playbook exists — this check happens at feature completion, after Release Process's deploy steps, closing the loop between "shipped" and "supportable."
