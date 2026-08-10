# Money Flow

## Purpose

Track the full lifecycle of a dollar from a sale to a creator's bank account.

## REVERSED 2026-08-07: External-Site Tracking, Not SellVia-Hosted Checkout

**This entire doc previously described SellVia-hosted checkout. That model is superseded.** The founder made a deliberate, informed decision to switch to external-site attribution (customer buys on the merchant's own website), which reopens the money-collection problem the hosted-checkout model was specifically built to avoid. See 02. Architecture Decision Log for the full history of this reversal.

## Confirmed Flow (2026-08-07)

```
Follower clicks creator's link
  ↓
SellVia records the click, redirects to the merchant's own website
  (tracking parameters attached, UTM-style)
  ↓
Customer completes purchase on the MERCHANT's own checkout —
  SellVia is not involved in this transaction at all
  ↓
Merchant's site reports the sale back to SellVia
  (webhook, tracking pixel, or integration — merchant-side dependency)
  ↓
Sale recorded as "reported" — NOT "verified" the way hosted checkout meant it.
  SellVia is trusting the merchant's report, not witnessing a payment directly.
  ↓
Commission + platform fee calculated and recorded as OWED, not split live
  (no live transaction exists for Stripe to split)
  ↓
Accumulates in a running ledger per merchant until the next billing cycle
  ↓
Periodically (weekly/monthly): SellVia charges the merchant's card on file
  for everything owed that cycle (commissions + platform fee, bundled)
  ↓
On successful charge: SellVia pays creators out of its own collected funds
  (creators still need Stripe Connect accounts to receive payouts,
  just funded by SellVia's billing collection, not a live per-sale split)
  ↓
Receipt generated — shown to both parties, though it now reflects
  "reported and billed," not "instantly verified"
```

## Why This Reopens the Trust Problem Hosted Checkout Was Built to Avoid

Worth being direct about this, since it's the actual cost of the decision: when SellVia processed payment directly, "verified" meant SellVia *witnessed* the payment succeed — no ambiguity, no trusting anyone's word. Now, SellVia is dependent on the merchant's own site correctly and honestly reporting sales. This reintroduces:

- **Cookie/tracking reliability issues** — Safari/Chrome increasingly block third-party tracking, which can break UTM/pixel-based attribution matching
- **Merchant under-reporting risk** — a merchant could (accidentally or deliberately) fail to report a sale to avoid owing commission; see 04. Fraud Prevention, which needs new rules for this specific risk that didn't exist under hosted checkout
- **Integration dependency** — attribution now depends on the merchant correctly implementing a webhook/pixel, not something SellVia fully controls end-to-end

## Money Collection Mechanism: Billed Periodically (confirmed 2026-08-07)

**Merchant's card on file is charged on a recurring cycle** for all commissions + platform fee accumulated since the last billing cycle — not per-transaction, not pre-funded balance.

## Creator Payout Sequencing: Bill First, Then Pay (working default, please confirm)

Between billing cycles, SellVia would technically owe creators commission on sales not yet billed to the merchant. **Default: SellVia does NOT front this money** — creators are paid only after the corresponding merchant billing charge succeeds. This is the lower-risk choice (SellVia never carries uncollected float), at the cost of creators waiting slightly longer for sales near the end of a billing cycle. The alternative (pay creators immediately, collect from merchant after) would mean SellVia absorbing real collection risk if a merchant's card fails or they dispute the charge — not chosen as the default, flag if this should be reconsidered.

## Refunds Under This Model

A refund now has to be reported by the merchant too (SellVia has no direct visibility into the merchant's own checkout). The existing rule (creator never loses commission, per 01. Commission Engine) still applies — a reported refund reduces what's billed to the merchant in future cycles, or if already billed, becomes a credit adjustment on the next cycle rather than an instant Stripe transfer reversal (which no longer applies, since there's no Connect transfer to reverse).

## Payout Threshold (creator side)

**$50 still applies** — creator balance accrues from successfully-billed commission, bank payout triggers once it crosses $50. Unchanged in principle, changed in what "accrues" means (post-billing, not per-sale-instant).

## Open Questions

- Who can initiate a refund — merchant self-service, Admin-only, or both — still genuinely open

## Update (2026-08-07): Merchant Integration Question RESOLVED

The "merchant integration mechanism" open question above is resolved: a universal onboarding tracking snippet (one script, installed once on the merchant's confirmation page), not a bespoke webhook or platform-specific integration. Full detail in 05. Payment Flow.

## Update (2026-08-07): Billing Cycle Length RESOLVED — Monthly

**Founder-confirmed: monthly billing cycles.** Each BillingCycle spans one calendar month (or a rolling 30-day period from signup — exact anchor still to be decided during implementation, doesn't block the design). Removes this item from Open Questions.

## Update (2026-08-07): CORRECTED — Refund Is a Billing Credit Request, Capped at 5/Month

**Founder-confirmed, replaces the earlier "unlimited automatic refund reporting" framing above, which was wrong.** The customer's actual refund happens entirely on the merchant's own site — SellVia is never involved in that. What "refund" means on SellVia's side is specifically: **the merchant requesting a billing credit** for a sale that was already tracked, billed, and paid out to the creator.

**Same underlying reasoning as 05. Chargebacks' 5-dispute grace allowance:** once a creator has been paid their commission, SellVia cannot claw it back (already locked in, 01. Commission Engine). So every credit SellVia grants a merchant for an already-paid-out sale is a direct loss SellVia absorbs itself — not something that can be passed back to the creator.

**Rule:**

```
merchant_profiles.monthly_refund_credits_used  (counter, resets each calendar month)

On refund credit request:
  if monthly_refund_credits_used < 5:
    SellVia issues a credit on the merchant's next billing cycle
    (SellVia absorbs the loss \u2014 creator commission already paid, non-recoverable)
    counter increments
  else:
    No credit issued \u2014 merchant already paid SellVia for this sale, that stands
    (merchant's own refund to their customer is unaffected either way \u2014
    this only controls what merchant owes SellVia, not what happened on their site)
```

**Why monthly, not lifetime like the chargeback allowance:** founder specified "5 times monthly" explicitly here, distinct from Chargebacks' lifetime counter — refunds are a more routine, expected part of running any e-commerce business (unlike chargebacks, which are adversarial), so a resetting monthly allowance fits better than a one-time lifetime grace.

## What This Replaces

The earlier "automatic snippet-based refund reporting, unlimited" framing on this page is superseded — there's no automatic refund event to hook into in the way sale reporting works, because SellVia was never part of the refund transaction to begin with. This is a merchant-initiated billing credit request, capped, not an automated pass-through.

## Open Questions

None — refund handling is resolved as a capped billing credit request (05. Refund Handling), not an automated pass-through.