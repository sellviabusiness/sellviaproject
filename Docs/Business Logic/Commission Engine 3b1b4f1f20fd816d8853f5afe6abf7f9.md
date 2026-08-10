# Commission Engine

## Purpose

The exact math and timing of how a sale becomes a commission owed — plus the platform fee.

## REVERSED 2026-08-07: No Live Split, Recorded as Owed

Previously described an instant Paddle split at time of sale. **Superseded** — SellVia no longer processes the payment (01. Money Flow, reversed 2026-08-07), so there is no live transaction to split. Commission and platform fee are now **calculated and recorded as owed** the moment a merchant-reported sale is accepted, then collected via periodic billing.

## The Three-Way Math (unchanged arithmetic, changed mechanism)

```text
Sale.amount (as reported by the merchant)
  → Creator commission = Sale.amount × locked commission rate
  → Platform fee = Sale.amount × 2%
  → Merchant owes SellVia = Creator commission + Platform fee
    (billed periodically, per 01. Money Flow)
```

Worked example, same reference numbers as before:

- Reported sale: $68.00
- Creator commission (20%, locked at approval — confirmed 2026-08-07): $13.60
- Platform fee (2%): $1.36
- **Merchant owes SellVia $14.96 total** at next billing cycle (not an instant deduction from a live transaction — merchant keeps the full $68.00 from their own checkout, then gets billed separately)

## Commission Rate

- Merchant-set, no bargaining, **locked at creator approval** (resolved 2026-08-07) — unchanged by this reversal.

## Platform Fee

- **2% flat** — unchanged. Collection mechanism changed (periodic billing, not live split), the rate itself did not.

## Refund Clawback — Still Applies, Different Mechanism

Creator commission is never clawed back (confirmed 2026-08-07) — still true. A reported refund now adjusts what's billed to the merchant in a future cycle, rather than reversing a Paddle transfer that no longer exists.

## What's Genuinely Harder Now

**Accepting a merchant-reported sale as real** is the new hard problem this doc depends on — under hosted checkout, "the sale happened" was a fact SellVia witnessed directly. Now it's a claim SellVia is trusting, with real fraud/under-reporting risk (04. Fraud Prevention needs new rules for this). The math above is unchanged; the confidence in the input to that math is lower than it was.

## Open Questions

- Verification/acceptance criteria for a merchant-reported sale before it's added to the billing ledger — not yet designed, a real gap this reversal creates
- See 01. Money Flow for the broader open questions (billing cycle length, card-failure handling, creator payout sequencing)

## Update (2026-08-07): Sale Report Acceptance Criteria RESOLVED — Auto-Accept With Baseline Integrity Checks

**Founder-confirmed direction: light automated validation, not manual review of every sale.** A reported sale is auto-accepted unless it fails a basic integrity check:

- **Duplicate `external_order_id`** for the same merchant — rejected automatically (prevents double-counting from page reloads/re-fires)
- **Signed request check** — each merchant's snippet includes a per-merchant secret in its report call, so a report can't come from anywhere except that merchant's own installed snippet (basic anti-spoofing, doesn't require a full webhook signature scheme)

Only **pattern-level anomalies** (not individual sales) route to Admin review — via 04. Fraud Prevention's existing rule-based checks (reported-sale volume vs. click volume, sudden reporting-pattern changes). Auto-accept is the default; manual review is the exception for suspicious patterns, not a per-sale gate.

This resolves 05. Payment Flow's open "sale-report acceptance criteria" question.
