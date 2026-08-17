# Failure Scenarios

## Purpose

Broader failure scenarios that cut across multiple systems — the "what's the actual blast radius" doc.

## Scenarios

- **Paddle itself has an outage** — billing cycles can't be charged and creator payouts pause, since both depend on Paddle. Sales themselves are unaffected — checkout happens on the merchant's own site, outside SellVia's dependency chain entirely (reversed 2026-08-07, see 01. Money Flow). A real resilience improvement over the original hosted-checkout design, though it trades in the merchant-reporting trust gap documented in 04. Fraud Prevention and 05. Reconciliation.
- **Ory Network/Kratos has an outage** — no one can log in; public campaign browsing (unauthenticated) would still work, but no new applications/campaigns could be created.
- **A bad deploy reaches Production** — mitigated by the Staging step in CI/CD Pipeline (06. Infrastructure), but if something still slips through, rollback process needs to be fast; tied to Disaster Recovery's point-in-time recovery and the Migration Strategy's rollback guidance (03. Database).
- **Reconciliation (05. Payments) finds a persistent, unexplained mismatch** — the actual incident-response process for this (who's alerted, what's the escalation, does checkout get paused) isn't designed yet — belongs in 10. Operations → Incident Response, not yet written.

## Open Questions

- Full incident response process (see last scenario) — explicitly deferred to 10. Operations, not solved here
