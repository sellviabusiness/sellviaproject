# Unit Economics (Revenue vs. Cost per User)

## Purpose

What SellVia actually earns and spends per user — the number that tells you whether the business model works at the unit level, not just in aggregate.

## Revenue Per User (asymmetric by role — important distinction)

- **Merchant revenue** = sum of `platform_fees.amount_cents` (2% of their sales) over a period — this is real SellVia revenue attributable to that merchant
- **Creator revenue = $0, by design.** Creators never pay SellVia anything (05. Payments → Platform Business Model & Pricing). Reporting "revenue per creator" as a number would be misleading — track **GMV driven per creator** instead (total verified Sale amount attributed to their links), which is the real measure of a creator's value to the platform, even though it isn't SellVia revenue directly.

## Cost Per User

Two components, kept distinct rather than blended into one fuzzy number:

**Directly attributable** (precise, per-user):

- Paddle processing fees on their transactions (see Monthly P&L — this is a newly-tracked cost, not previously accounted for anywhere)
- AI/token costs tied to that user (from AI / Token Usage Tracking, filtered by `related_user_id`)

**Allocated** (shared costs, split evenly — simple starting model):

- Hosting/infra cost ÷ active users for the period. Deliberately simple (even split, not usage-weighted) for MVP — refine only if a specific user segment's actual infra load turns out to be meaningfully disproportionate, not guessed at upfront.

## Net Contribution (Merchants Only)

```
Net contribution per merchant = Merchant revenue − (Paddle fees + AI costs + allocated infra share)
```

For Creators, there's no revenue side to net against — cost-per-creator is tracked as a standalone number, evaluated against GMV driven, not against a revenue figure that doesn't exist.

## Open Questions

- Whether allocated infra cost should eventually be split Merchant vs. Creator differently (e.g. checkout/payment processing load is more merchant-transaction-driven than creator-driven) — reasonable to defer until there's real usage data suggesting the even split is meaningfully wrong