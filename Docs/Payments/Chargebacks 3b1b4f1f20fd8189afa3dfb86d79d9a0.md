# Chargebacks

## Purpose

When a customer disputes a charge directly with their bank/card issuer, rather than requesting a refund through SellVia.

## Why This Is Different From a Refund

A chargeback is initiated by the customer's bank, not by the merchant or SellVia — it comes with its own Stripe dispute flow, evidence-submission window, and a chargeback fee charged by Stripe regardless of outcome. This is a distinct process from Refund Handling and needs its own handling, not just a variant of it.

## Process

1. Stripe notifies SellVia of a dispute via webhook
2. Funds are held/reversed by Stripe pending resolution
3. Merchant (or SellVia on their behalf) can submit evidence to contest it within Stripe's window
4. If lost: treated the same as a refund for clawback purposes (per Commission Engine's 14-day rule) — plus the Stripe dispute fee itself, which isn't currently allocated to anyone in the split model

## Open Questions (genuinely unresolved, not defaults)

- **Who absorbs the Stripe dispute fee** — SellVia, the merchant, or split? Not addressed anywhere in prior docs and needs a real decision, since disputes are effectively guaranteed to happen at some volume.
- Whether SellVia or the merchant is responsible for submitting dispute evidence — affects whether this needs to be a merchant-facing feature or an Admin-handled process

## Update (2026-08-07): Clawback Reference Superseded

The "14-day rule" referenced above no longer exists — creator commission is never clawed back (01. Commission Engine). A lost chargeback still costs the merchant the sale amount plus the Stripe dispute fee (allocation still unresolved, see this page's Open Questions), but creator commission is unaffected regardless of chargeback outcome.

## Update (2026-08-07): RESOLVED — 5-Dispute Grace Allowance Per Merchant

**Founder-confirmed:** SellVia absorbs the Stripe dispute fee for a merchant's **first 5 lost chargebacks** (lifetime counter, working assumption — flag if this should reset periodically instead). From the **6th lost dispute onward**, the dispute fee is passed to the merchant, deducted from their balance.

**Mechanics:**

```
merchant_profiles.lifetime_disputes_lost  (counter, increments on each lost dispute)

On chargeback lost:
  if lifetime_disputes_lost < 5:
    SellVia absorbs the Stripe dispute fee, counter increments
  else:
    Dispute fee deducted from merchant's Connect balance
```

This is a trust/onboarding allowance — protects early-stage merchants from a bad-luck chargeback while they're building trust with the platform, while ensuring a merchant with a genuine pattern of disputes bears the cost themselves rather than SellVia absorbing it indefinitely.

## Open Questions

- Whether the counter is truly lifetime or resets on a period (e.g. annually) — implemented as lifetime as the simpler default; flag if a reset was intended