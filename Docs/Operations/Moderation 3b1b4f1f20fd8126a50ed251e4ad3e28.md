# Moderation

## Purpose

How flagged content/behavior actually gets resolved — the human process behind Fraud Prevention's automated detection (04. Security).

## Process

1. Fraud Prevention's rules flag a Sale, Application, or account into the moderation queue (Admin Panel)
2. Admin reviews the flagged item against the specific rule that triggered it (velocity, self-referral, conversion outlier, device fingerprinting — 04. Security → Fraud Prevention)
3. Admin action: clear the flag (false positive), or act (suspend account, reverse a Sale, ban)
4. Every moderation action is captured in the Audit Log (03. Database) — who acted, on what, and the outcome

## Escalation

- Suspected fraud involving real financial loss (not just a flagged pattern) should escalate beyond routine moderation — ties into Incident Response below for anything beyond a single bad actor

## Open Questions

- Formal appeals process for a suspended account — not designed yet; reasonable to handle case-by-case through Customer Support Flows at current scale rather than building a formal process prematurely
