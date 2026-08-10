# Relationships

## Purpose

Explicit documentation of every foreign key relationship and what happens on delete — companion to Table Specifications, focused specifically on referential integrity.

## Relationships and Delete Behavior

| Relationship | On parent delete |
| --- | --- |
| merchant_profiles.user_id → users | Restrict — a user with an active merchant profile can't be hard-deleted (use Soft Delete Policy instead) |
| creator_profiles.user_id → users | Restrict, same reasoning |
| offers.merchant_profile_id → merchant_profiles | Restrict — an offer with live campaigns shouldn't vanish if somehow the merchant profile were removed |
| campaigns.offer_id → offers | Restrict |
| applications.campaign_id → campaigns | Restrict — historical applications must survive even if a campaign is later ended |
| affiliate_links.application_id → applications | Restrict — a link must always trace back to the application that created it, for fraud/audit purposes |
| attribution_events.affiliate_link_id → affiliate_links | Restrict |
| sales.attribution_event_id → attribution_events | Restrict — financial records must never lose their attribution trail |
| [commissions.sale](http://commissions.sale)_id → sales | Restrict |
| platform_[fees.sale](http://fees.sale)_id → sales | Restrict |
| payout_commissions.payout_id / commission_id | Restrict on both sides — this join table is itself a financial audit record |

## Principle

Nothing in the financial chain (Sale → Commission → Payout) is ever hard-deleted or cascaded away. This is a payments system; every row in that chain is effectively an accounting record, and accounting records don't get deleted, they get corrected (see Soft Delete Policy, Audit Log Design).

## Open Questions

- None blocking — this doc's stance (restrict everywhere in the financial chain) is a deliberate, conservative default appropriate for a payments system, not something requiring further input.