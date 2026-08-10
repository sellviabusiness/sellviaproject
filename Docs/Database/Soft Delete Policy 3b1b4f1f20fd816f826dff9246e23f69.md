# Soft Delete Policy

## Purpose

What happens when a user, offer, or campaign is "deleted" — given the Relationships doc's stance that nothing in the financial chain is ever hard-deleted.

## Policy

Every core table gets a `deleted_at` (nullable timestamptz) column. "Deleting" a row sets this field rather than removing the row. All application queries filter `WHERE deleted_at IS NULL` by default.

## Why This Matters More Here Than in a Typical App

Because Sales, Commissions, and Payouts are financial records, and because Applications/AffiliateLinks are part of the fraud/audit trail (01. Business Logic → Domain Model notes CreatorProfile.engagement_rate has open fraud implications), hard-deleting any of this data would destroy the ability to investigate a dispute or a fraud case later. Soft delete preserves the full history.

## Applies To

- `users` (e.g. account closure/ban) — soft-deleted, not removed, so historical sales/commissions still resolve correctly
- `offers`, `campaigns` — a merchant removing a listing soft-deletes it; historical Applications/Sales tied to it remain intact
- Does NOT apply to `sales`, `commissions`, `platform_fees`, `payouts` — these are never deleted at all, soft or otherwise (per Relationships doc); they can only transition status (e.g. to `refunded`)

## Open Questions

- Whether a soft-deleted Campaign's still-active AffiliateLinks should keep tracking (relevant if a merchant deletes a campaign that still has approved creators) — recommend treating merchant-initiated delete the same as "ended" per State Machines, rather than inventing a new behavior