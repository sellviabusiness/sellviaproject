# Constraints

## Purpose

What rules the database itself enforces, beyond what the application layer checks — defense in depth for a system handling real money.

## Enforced Constraints

- **Non-negative amounts:** `CHECK (amount_cents >= 0)` on offers.price_cents, commissions.amount_cents, platform_fees.amount_cents, payouts.amount_cents — catches bugs before they become financial discrepancies
- **Commission rate bounds:** even though there's no platform-enforced business range (01. Business Logic → Business Rules), a sanity-check constraint like `CHECK (commission_rate > 0 AND commission_rate <= 1)` still belongs at the DB level, to catch obvious data-entry bugs (e.g. someone accidentally storing "20" instead of "0.20") — this is a data-integrity constraint, not a business-rule constraint, and the two shouldn't be confused
- **Currency enum:** `CHECK (currency IN ('USD','EUR','GBP'))` on every monetary table — hard-blocks accidentally supporting a currency (like the removed PKR) without a deliberate schema change
- **Unique constraints:** `affiliate_links.slug` (globally unique, since it's part of a public URL), `applications` unique on (campaign_id, creator_profile_id) so a creator can't submit duplicate applications to the same campaign
- **Status enums:** all `status` fields (campaigns, applications, sales, payouts) use Postgres enums, not free-text — matches the State Machines doc's defined transitions and makes an invalid status a schema-level impossibility, not just an application bug

## Open Questions

- None blocking — straightforward given the business rules are already settled in 01. Business Logic.
