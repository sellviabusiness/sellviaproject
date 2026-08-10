# Table Specifications

## Purpose

Field-by-field schema for every table — the literal thing a migration file would implement.

## users

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| clerk_id | text, unique | maps to Clerk's user ID |
| email | text, unique |  |
| created_at / updated_at | timestamptz |  |

## merchant_profiles

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| user_id | uuid, FK → users |  |
| business_name | text |  |
| stripe_connect_account_id | text | Stripe Express account ID |

## creator_profiles

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| user_id | uuid, FK → users |  |
| niche | text | fixed taxonomy per 02. Search Strategy |
| audience_size | integer |  |
| engagement_rate | numeric | see Domain Model's open question on self-reported vs. platform-calculated |
| stripe_connect_account_id | text |  |
| wallet_balance_cents | integer | running accrued balance toward the $50 threshold |

## offers

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| merchant_profile_id | uuid, FK → merchant_profiles |  |
| name | text |  |
| price_cents | integer |  |
| currency | text | USD / EUR / GBP |
| category | enum | digital / physical |

## campaigns

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| offer_id | uuid, FK → offers |  |
| commission_rate | numeric | merchant-set, no platform bounds |
| status | enum | draft / live / paused / ended |

## applications

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| campaign_id | uuid, FK → campaigns |  |
| creator_profile_id | uuid, FK → creator_profiles |  |
| status | enum | pending / approved / rejected |
| locked_commission_rate | numeric | snapshot of campaign.commission_rate at approval time (see State Machines' flagged reconciliation note — this field assumes "locked at approval" wins; revisit once that's settled) |

## affiliate_links

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| application_id | uuid, FK → applications, unique | one link per approved application |
| slug | text, unique | e.g. "mia-glow" |

## attribution_events

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| affiliate_link_id | uuid, FK → affiliate_links |  |
| type | enum | click / add_to_cart / purchase |
| occurred_at | timestamptz | used against the 30-day attribution window |

## sales

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| attribution_event_id | uuid, FK → attribution_events | the purchase-type event |
| amount_cents | integer |  |
| currency | text |  |
| status | enum | pending / verified / refunded / disputed |
| stripe_payment_intent_id | text |  |

## commissions

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| sale_id | uuid, FK → sales, unique |  |
| creator_profile_id | uuid, FK → creator_profiles |  |
| amount_cents | integer |  |
| clawed_back | boolean, default false | set true if refund clawback applied (see Commission Engine) |

## platform_fees

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| sale_id | uuid, FK → sales, unique |  |
| amount_cents | integer | 2% of sale amount |

## payouts

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| recipient_type | enum | creator / merchant |
| recipient_id | uuid | polymorphic — references creator_profiles or merchant_profiles depending on recipient_type |
| amount_cents | integer |  |
| status | enum | pending / processing / paid / failed |
| stripe_payout_id | text |  |

## payout_commissions (join table)

| Field | Type | Notes |
| --- | --- | --- |
| payout_id | uuid, FK → payouts |  |
| commission_id | uuid, FK → commissions | represents which sales are bundled into a given creator payout |

## notifications

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| user_id | uuid, FK → users |  |
| type | text | sale_made / payout_threshold_reached / application_approved / etc. |
| read_at | timestamptz, nullable |  |

## Open Questions

- Whether merchant payouts (not threshold-gated, per Money Flow) need their own join table like `payout_commissions`, or can reference `platform_fees`/`sales` directly since they're not batched the same way as creator payouts

## Update (2026-08-04): New Tables for Cost/Revenue Tracking

## ai_usage_events

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| feature | enum | matching / screening / copy_assist |
| tokens_in | integer |  |
| tokens_out | integer |  |
| cost_cents | integer | 0 for cache hits, per 11. Analytics → AI / Token Usage Tracking |
| related_user_id | uuid, nullable | FK → users |
| related_entity_type | text, nullable | e.g. "application", "campaign" |
| created_at | timestamptz |  |

## infra_costs (manual-entry fallback for non-API-able costs)

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| category | text | e.g. "hosting", "clerk_subscription", "monitoring" |
| amount_cents | integer |  |
| period_month | date | first-of-month, identifies which period this cost belongs to |
| source | enum | api / manual |
| entered_by | uuid, nullable | Admin user, if manually entered |
| created_at | timestamptz |  |

## monthly_pnl_reports

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| period_month | date, unique |  |
| revenue_cents | integer | sum of platform_fees for the period |
| stripe_fees_cents | integer | pulled from Stripe Balance Transactions |
| hosting_cost_cents | integer | from infra_costs |
| ai_cost_cents | integer | sum of ai_usage_events.cost_cents |
| other_cost_cents | integer | from infra_costs, other categories |
| net_pnl_cents | integer | computed: revenue − all cost fields |
| finalized | boolean, default false | per 11. Analytics → Automated Monthly P&L's locking recommendation |
| generated_at | timestamptz |  |

See 11. Analytics → AI / Token Usage Tracking, Unit Economics, and Automated Monthly P&L for the full reasoning behind these tables.

## Update (2026-08-04): users.clerk_id → users.kratos_identity_id

The `users` table's `clerk_id` field (text, unique, mapping to the auth provider's user ID) is renamed `kratos_identity_id`, mapping to Ory Kratos's identity ID instead — reflects the 04. Security → Authentication switch from Clerk to Ory Kratos. No other schema change.

## Update (2026-08-04): jobs Table Added

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| type | text | e.g. "export_sales_report" |
| status | enum | pending / processing / completed / failed |
| idempotency_key | text, unique | client-generated, prevents duplicate job creation on double-click/retry |
| user_id | uuid, FK → users |  |
| tenant_id | uuid | scoped per 04. Security → Tenant Isolation Audit |
| params | jsonb | what was requested |
| result_url | text, nullable | signed URL once complete |
| error_message | text, nullable |  |
| created_at / completed_at | timestamptz |  |

See 02. Technical Architecture → Async Job Pattern & Idempotency for the full flow this table supports.

## Update (2026-08-07): Schema Changes for External-Site Tracking + Billing

## sales — REVISED

| Field | Type | Notes |
| --- | --- | --- |
| external_order_id | text | the merchant's own order reference — NEW |
| reported_at | timestamptz | when the merchant's snippet reported it — NEW |
| acceptance_status | enum | accepted / rejected — NEW, replaces the old "verified" framing |
| billing_cycle_id | uuid, FK → billing_cycles, nullable | NEW, set once included in a cycle |
| ~~stripe_payment_intent_id~~ | — | REMOVED — SellVia never processes the underlying sale |

## billing_cycles — NEW TABLE

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| merchant_profile_id | uuid, FK → merchant_profiles |  |
| period_start / period_end | timestamptz |  |
| status | enum | open / pending_charge / charged / failed |
| total_owed_cents | integer | sum of commissions + platform fees for included sales |
| stripe_charge_id | text, nullable | set once successfully charged |
| retry_count | integer, default 0 |  |

## merchant_profiles — UPDATED

Add: `stripe_customer_id` (for the card-on-file billing charge — distinct from `stripe_connect_account_id`, which now exists only for merchants who also want to *receive* payouts through SellVia for something else, not for the sale itself).

## payouts — UPDATED

`payout_commissions` join table (already existed) now only includes commissions whose `billing_cycle_id` has reached `charged` — enforces the bill-first-then-pay sequencing (01. Money Flow) at the data layer, not just as a business rule someone has to remember.

See 01. Domain Model for the corresponding entity-level changes.

## Update (2026-08-07): affiliate_[links.discount](http://links.discount)_code Added

| Field | Type | Notes |
| --- | --- | --- |
| discount_code | text, unique | e.g. "MIA10" — fallback attribution signal per 05. Payment Flow, created in the merchant's own store discount system at link creation |

Also: sale-report payloads (received at `POST /webhooks/merchant-sales`, 07. Endpoint Specifications) gain an optional `discount_code_used` field alongside the primary attribution reference.

## Update (2026-08-07): Refund Credit Field Added

| Field | Type | Notes |
| --- | --- | --- |
| monthly_refund_credits_used | integer, default 0 | resets each calendar month — 05. Refund Handling's 5-credit monthly cap |

Added to `merchant_profiles`.