# Domain Model

## Purpose

The core entities and how they relate — this is the schema that 03. Database and 07. API will implement directly.

## Entities

### User

- id, email, role(s): merchant / creator / admin
- profile fields differ by role (see below)

### MerchantProfile

- belongs to User
- business name, category (digital/physical seller)

### CreatorProfile

- belongs to User
- audience size, niche/category, engagement rate (conversion %, per the live site's creator card example: "18k audience, skincare & routines, 4.8% conversion")

### Offer (Product)

- belongs to Merchant
- name, price, category (digital/physical)
- example from live site: Glow Serum, Lumen Skincare, physical, $68.00

### Campaign

- belongs to Offer + Merchant
- commission_rate (%, merchant-set, e.g. 20% in the live example, range 10–40% shown on the commission slider)
- status: draft / live / paused / ended (see State Machines)

### Application

- belongs to Creator + Campaign
- status: pending / approved / rejected (see State Machines)
- audience snippet submitted with application (per live site creator cards)

### AffiliateLink

- created on Application approval
- belongs to Creator + Campaign
- unique URL (e.g. `sellvia.link/mia-glow`)

### AttributionEvent (Click)

- belongs to AffiliateLink
- type: click / add_to_cart / purchase
- timestamp
- per the live site's traced example: post published → click → add to cart → purchase verified, each timestamped

### Sale (Order)

- belongs to AffiliateLink (→ Creator + Campaign + Merchant)
- amount, status: pending / verified / disputed
- triggers Commission calculation on verification

### Commission

- belongs to Sale
- amount = Sale.amount × Campaign.commission_rate
- example: $68.00 sale × 20% = $13.60 creator commission, $54.40 merchant retains

### Payout

- belongs to Creator (aggregates one or more Commissions)
- status: pending / processing / paid / failed
- triggered automatically on Sale verification per the "money splits itself" model on the live site

### Notification

- belongs to User
- type: sale_made, payout_threshold_reached, new_affiliate_joined, milestone_reached (per raw data doc's Notification/Alerts feature)

## Relationships (summary)

```
User 1--1 MerchantProfile (optional)
User 1--1 CreatorProfile (optional)
MerchantProfile 1--N Offer
Offer 1--N Campaign
Campaign 1--N Application
Application 1--1 AffiliateLink (on approval)
AffiliateLink 1--N AttributionEvent
AttributionEvent 1--1 Sale (on purchase-type event)
Sale 1--1 Commission
Commission N--1 Payout (aggregated)
```

## Open Questions

- Does an Offer need its own entity separate from Campaign, or can a merchant only ever have one active campaign per offer (simplifying the model)?
- Is CreatorProfile.engagement_rate self-reported (as shown on the live site mockup) or platform-calculated from tracked data? This has real fraud implications — see 04. Security.

## Update (2026-08-07): REVISED for External-Site Tracking + Periodic Billing

Reverses 01. Money Flow's earlier hosted-checkout model — the entities below change accordingly:

**Sale** — now represents a *merchant-reported* sale, not a payment SellVia processed directly. New fields needed: `external_order_id` (the merchant's own order reference), `reported_at`, `acceptance_status` (accepted/rejected, per 04. Fraud Prevention's new merchant-reporting checks). No longer has a direct `stripe_payment_intent_id` for the underlying sale — SellVia never processes that transaction.

**New entity: BillingCycle** — belongs to a Merchant, aggregates all `accepted` Sales in a period, has a status (open/pending_charge/charged/failed), and a `stripe_charge_id` once successfully billed (this is where Stripe actually re-enters the picture — not for the original sale, but for charging the merchant's card on file).

**New relationship:** `Merchant 1--N BillingCycle`, `BillingCycle 1--N Sale` (which sales were included in which cycle).

**AttributionEvent** — unchanged in concept (still tracks click/cart/purchase against an AffiliateLink), but the "purchase" event now comes from the merchant's onboarding snippet report (05. Payment Flow), not from SellVia's own checkout completing.

**Commission, PlatformFee** — still calculated per Sale (unchanged math), but now marked "owed" until their BillingCycle reaches `charged`, at which point they become available for creator payout.

See 01. Money Flow, 01. Commission Engine, 01. State Machines, and 05. Payment Flow (all revised 2026-08-07) for the full reasoning.

## Update (2026-08-07): Discount Code Field Added

**AffiliateLink** now also carries a unique `discount_code` (e.g. `MIA10`), created in the merchant's store during campaign setup — the attribution fallback when cross-domain cookie tracking fails (05. Payment Flow). Not a separate entity, just a new field on the existing AffiliateLink.