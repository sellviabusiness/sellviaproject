# Business Rules

## Purpose

The rules that govern valid state transitions and actions — the things that must always be true regardless of which screen a user is on.

**Decided (2026-08-03):** commission rate is set entirely by the business owner, with no platform-enforced range and no bargaining at launch. See Commission Engine for the full rationale.

## Campaign Rules

- Merchant sets the commission % freely at campaign creation — no platform min/max.
- **No negotiation/bargaining at launch.** Commission is take-it-or-leave-it: merchant sets it, creator applies at that rate or doesn't apply. A single "request a different rate" counter-offer feature is a candidate for v2, not MVP — open haggling reintroduces the exact friction ("no contracts," per the live product positioning) the product is designed to remove.
- $0 owed by merchant until a sale is verified — no upfront fee, no ad spend required.
- A campaign cannot be edited (commission rate changed) while it has active, approved creators without a defined re-consent flow (not yet specified — see Edge Cases).

## Application Rules

- Creators apply to campaigns; merchants do not solicit creators directly ("creators apply — not the other way around"). Cold-outreach features should not be built.
- Merchant sees the creator's audience/niche/conversion data attached to the application before approving.
- Only one AffiliateLink is generated per approved Application (one creator, one campaign, one link).

## Attribution Rules

- Every click, cart-add, and purchase is attributed to the specific AffiliateLink that generated it — no shared/generic links per campaign.
- **Attribution window: 30 days** (decided 2026-08-03). Matches the long-standing affiliate-industry default (Amazon Associates, ShareASale) and protects creators when a follower clicks today but buys later, which is common above impulse-buy price points. Can be shortened per-campaign in a later version if data shows shorter windows work better for cheap/impulse items.
- Attribution data is visible identically to both merchant and creator.

## Sale & Commission Rules

- Commission = Sale.amount × Campaign.commission_rate at the time of the sale (locked at time of sale, not retroactively affected by later rate changes).
- **"Verified" = payment completed successfully** (decided 2026-08-03) — i.e. the customer's payment has cleared, not gated behind a return-window expiry. See Money Flow for the refund/chargeback exposure this creates and the proposed clawback rule.

## Payout Rules

- **Payout threshold: $50** (decided 2026-08-03). Commission is credited to the creator's balance instantly per sale (via Paddle split); the actual bank payout is triggered once the balance crosses $50 — see Money Flow for the instant-split vs. bank-payout-timing distinction.
- Both parties see the same receipt for every payout (amount, commission split, platform fee, timestamps) — this symmetry is a trust mechanism and should not be broken by showing merchants and creators different numbers.

## Multi-Currency (updated 2026-08-03: PKR removed)

- Supported currencies: **USD, EUR, GBP.**
- Merchant lists a product in their preferred currency.
- All three are well-supported by standard processors (Paddle handles payouts in USD/EUR/GBP cleanly) — no special payout-rail workaround needed for MVP.
- PKR was considered and dropped for now — most processors, including Paddle, don't support direct PKR payouts to connected accounts, which would have required a separate local payout partner. Can be revisited post-MVP if there's real demand from Pakistani creators/merchants.

## Open Questions

- Re-consent flow (if any) when a merchant changes a campaign's commission rate mid-flight with active creators
- Chargeback/refund clawback window and mechanism (see Money Flow)
- Whether "request a different rate" (single counter-offer) ships in v2

## Update (2026-08-07): Commission Lock Timing — RESOLVED

**Resolved: locked at approval, not at time of sale.** A creator's commission rate is fixed the moment they're approved for a campaign and never changes afterward, even if the merchant edits the campaign's commission rate later. This corrects the "at time of sale" language elsewhere on this page — that was the wrong side of a contradiction with State Machines and Table Specifications, both of which already correctly said "at approval" (`applications.locked_commission_rate`, snapshotted at approval time). All three docs now agree.

## Update (2026-08-07): Self-Dealing Block Added

**A dual-role account (Merchant + Creator) cannot apply to their own campaign — blocked outright, confirmed 2026-08-07.** Added as a hard Application Rule: the CreatorProfile submitting an application can never share a `user_id` with the Campaign's owning MerchantProfile. Full detail in 08. User Edge Cases.
