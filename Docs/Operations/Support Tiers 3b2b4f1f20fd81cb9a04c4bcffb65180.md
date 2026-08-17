# Support Tiers

## Purpose

What counts as a tier, and how a request routes between them — not a formal SLA-backed enterprise support org, but a real triage structure so "support" isn't one undifferentiated queue.

## Tiers

### Tier 0 — Self-Serve / Automated

Handled without a human touch: FAQ-style answers, status-page-visible incidents (10. Operations → Status Page & Incident Communication), and anything the AI Command Console can resolve directly per its confirmation-gated rules (e.g. "resend my verification email," a straightforward read-only "where's my payout" answer).

### Tier 1 — AI-Assisted, Founder-Confirmed

The Command Console identifies the issue, matches it to a Per-Feature Support Playbook, and proposes a specific resolution — but a write action still requires the founder's explicit confirmation (per the console's existing rule). This is the bulk of expected support volume at current scale: fast to diagnose, still human-approved before anything changes.

### Tier 2 — Founder-Handled, No Playbook Match

The request doesn't match a known playbook, or involves judgment calls the console correctly refuses to guess at (fail-closed) — e.g. a genuinely novel bug, a dispute requiring discretion, anything touching the financial-chain clawback edge cases already flagged as unresolved (partial refunds, chargeback fee allocation). Founder-handled directly, using the console as a data-lookup tool rather than an action-taker.

### Tier 3 — Escalation / Incident

The request is actually a symptom of a broader problem — routes into 10. Operations → Incident Response rather than being handled as an individual ticket. The triage step below is what catches this distinction.

## Why Not a Formal SLA Structure

At current team size (founder-handled, per 10. Operations → Customer Support Flows' existing stance), promising tiered response-time SLAs would be a commitment the team can't reliably back. This tier structure is about **routing and resolution path**, not response-time guarantees — revisit if/when the team grows enough to staff dedicated support.

## Open Questions

- None blocking — revisit tier definitions once real ticket volume shows whether the Tier 0/1 split is catching what it should.
