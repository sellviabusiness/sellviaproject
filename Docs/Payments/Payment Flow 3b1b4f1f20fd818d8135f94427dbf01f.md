# Payment Flow

## Purpose

The technical narrative of how a sale gets reported, billed, and paid out — complements 01. Money Flow's business-level description.

## REVERSED 2026-08-07

This doc previously described a Paddle transaction created by SellVia at checkout. **Superseded** — SellVia no longer processes the original sale (01. Money Flow). This doc now covers: (1) how a merchant's sale report is received and accepted, (2) how periodic billing actually charges the merchant, (3) how creator payouts are released.

## Flow

**1. Attribution & sale reporting**

```
Follower clicks AffiliateLink → SellVia logs the click, redirects to merchant's own site
  with tracking parameters
Merchant's integration (webhook, pixel, or manual) reports the sale back to SellVia:
  POST /webhooks/merchant-sales (07. Webhooks — this is now an active MVP endpoint,
  not the deferred v2 item it previously was)
```

**2. Acceptance**

```
Reported sale checked against 04. Fraud Prevention's rules (velocity, plausibility
  against the attribution window, merchant reporting pattern)
Accepted → commission + platform fee calculated (01. Commission Engine), added to
  the merchant's open Billing Cycle ledger
Rejected → flagged for Admin review, not silently dropped
```

**3. Periodic billing**

```
Scheduled Celery job (02. Background Jobs) closes each merchant's Billing Cycle
  on schedule
Paddle charges the merchant's card on file for the cycle total
  (commissions + platform fee owed)
On success → Billing Cycle marked "charged"
On failure → retry per policy (01. State Machines' Billing Cycle open question)
```

**4. Creator payout**

```
Once a Billing Cycle reaches "charged," the commissions within it become available
  in each creator's wallet
Standard $50 threshold → bank payout, unchanged from the original design
```

## Failure Handling

- **Merchant integration fails to report a sale at all:** invisible to SellVia entirely — this is a real, structural weakness of external-site tracking (unlike hosted checkout, there's no webhook SellVia controls end-to-end). Reconciliation (05. Payments) becomes more important, not less, though it now has less to reconcile against (SellVia has no independent record of the underlying sale, only what it was told).
- **Merchant card fails at billing time:** per the new Billing Cycle state machine, retried, then likely campaign suspension if unresolved — exact policy still open.

## Open Questions

- Exact merchant integration mechanism to build first — a generic webhook spec, or a specific platform integration (e.g. Shopify) as the priority — not yet decided
- Whether a tracking pixel fallback is needed for merchants who can't/won't implement a webhook

## Update (2026-08-07): Merchant Integration Mechanism RESOLVED — Universal Onboarding Snippet

**Resolved, replacing both options this doc left open:** not a bespoke per-merchant webhook, not a platform-specific integration (Shopify app) built first. Instead: **a universal tracking snippet the merchant installs once during onboarding** (one script tag, on their order-confirmation page — works identically across Shopify, WooCommerce, or a custom site).

**How it connects to the redirect:** the SellVia redirect (customer clicks creator's link → SellVia logs the click → bounces to the merchant's real product page) still happens and still sets an attribution reference — this is what makes click-level tracking (and the click-to-sale conversion KPI) possible at all, not just sale-level reporting. The onboarding snippet reads that reference when a purchase completes and reports the sale back automatically.

**Why this is better than a bespoke integration:** zero custom integration work per merchant, works across any e-commerce platform without SellVia building platform-specific adapters, and it's a one-time onboarding step rather than an ongoing technical dependency the merchant has to maintain correctly.

**Known limitation, unchanged by this mechanism:** still relies on a cookie/reference surviving from the SellVia redirect to the merchant's confirmation page — same cookie-blocking exposure (Safari ITP, etc.) already flagged for any cross-domain tracking approach. This mechanism doesn't fix that; nothing fully does.

## Update (2026-08-07): Reliability — Snippet Is Universal, Webhooks Are NOT

**Clarifying, since this matters for what gets built:** the universal onboarding snippet is the mechanism that works for every merchant — Shopify, WordPress, custom sites, anything that can run JavaScript, with zero platform-specific engineering. **Server-side webhooks do not generalize the same way** — each platform (Shopify, WooCommerce, Magento, etc.) has its own webhook format and setup process, meaning a webhook integration would need to be built and maintained separately per platform. A genuinely custom/bespoke site has no webhook option at all unless that merchant's own developer builds one.

**Correct framing:** the snippet is the universal default for every merchant, not a fallback. If a platform-specific webhook integration is ever built (Shopify would be the obvious first candidate, given its native webhook support), it's an **optional reliability upgrade for merchants on that specific platform** — more resistant to ad blockers since it fires server-side, not a broader or more general solution than the snippet.

**Additional reliability idea, still worth considering, doesn't depend on webhooks:** unique per-creator discount codes as a secondary attribution signal — works even if the snippet fails to fire for a given purchase (ad blocker, JS error), since it doesn't depend on any cross-domain tracking surviving at all. Not yet decided whether to build this for MVP or treat as v2.

## Open Questions

- Whether to build the unique-discount-code fallback for MVP, given it doesn't depend on this doc's snippet-reliability limitations at all
- Whether a Shopify-specific webhook upgrade is worth building given actual merchant platform distribution, once there's real data on what platforms merchants are actually using

## Update (2026-08-07): Discount Code Fallback — LOCKED FOR MVP

**Confirmed: every AffiliateLink also gets a unique discount code** (e.g. derived from the creator's handle — `MIA10`), created in the merchant's own store discount system during campaign setup. This is a genuinely low-friction ask for merchants — creating a discount code is something every e-commerce platform supports natively and merchants already know how to do, unlike building a custom webhook.

**How it strengthens attribution, not just as backup:**

- **Primary path (unchanged):** click → redirect sets attribution reference → snippet reports the sale, tagged with that reference
- **Fallback path (new):** if the snippet fails to fire for a given purchase (ad blocker, JS error, cookie blocked) but the reported order still shows the discount code was used, the discount code alone is enough to attribute the sale correctly — no dependency on cross-domain cookie survival at all
- **Corroboration, when both are present:** if a sale report includes both a valid attribution reference AND the matching discount code, that's a stronger signal for 04. Fraud Prevention's plausibility checks than either alone

**Bonus, not the main point:** the discount code can also function as a real incentive shown to the customer ("10% off with MIA10"), which may help conversion — a side benefit, not the reason it was built.

**Schema addition:** `affiliate_links.discount_code` (unique, generated at link creation), and the merchant sale-report payload (05. Payment Flow) gains an optional `discount_code_used` field alongside the existing attribution reference.

## Open Questions (unchanged, still deferred)

- Shopify-specific webhook upgrade — still deferred, not built for MVP; the discount code fallback covers the reliability gap without needing it

## Update (2026-08-07): Acceptance Criteria RESOLVED

Sale-report acceptance is now defined: auto-accept by default, rejected only on duplicate order ID or a failed signed-request check; suspicious *patterns* (not individual sales) route to Admin review via 04. Fraud Prevention. Full detail in 01. Commission Engine.