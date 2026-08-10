# Reconciliation

## Purpose

How SellVia confirms its internal records match what Paddle actually processed — catches bugs, webhook failures, or fraud before they become undetected discrepancies.

## Process

- Periodic (e.g. daily) automated job compares SellVia's internal Sale/Commission/PlatformFee/Payout records against Paddle's own transaction records (via the Paddle API or Paddle's payout/balance reports)
- Any mismatch (a Sale marked verified in SellVia's DB with no matching successful Paddle charge, or vice versa) gets flagged for Admin review

## Why This Matters More Here

Because webhooks can theoretically be missed (network issues, a temporary outage) even with retry logic, reconciliation is the safety net that catches anything Event-Driven Architecture's webhook handling might have missed — it shouldn't be the primary mechanism, but it's the backstop that prevents silent, permanent discrepancies.

## Open Questions

- Reconciliation frequency (daily recommended default) and who's alerted on a mismatch — reasonable to start with Admin-only alerts and tighten as needed

## Update (2026-08-07): What Reconciliation Can and Can't Verify Now

**Real, structural change worth being honest about:** under hosted checkout, Reconciliation checked SellVia's internal records against Paddle's independent record of the *same underlying sale* — a genuine cross-check. **Under external-site tracking, SellVia has no independent record of the underlying sale at all** — only what the merchant's snippet reported. Reconciliation can still verify the *billing and payout legs* against Paddle (did the merchant's card actually get charged, did creators actually get paid the right amounts) — but it can no longer independently confirm the original sale happened as reported. That trust now sits entirely on 04. Fraud Prevention's merchant-reporting checks, not on an independent Paddle cross-check. Worth flagging to the founder as a real trade-off of the checkout reversal, not something this doc can quietly compensate for.