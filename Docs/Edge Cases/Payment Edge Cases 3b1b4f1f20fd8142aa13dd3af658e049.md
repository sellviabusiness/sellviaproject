# Payment Edge Cases

## Purpose

Money-specific edge cases beyond the core Refund/Chargeback docs (05. Payments).

## Cases

- **Partial refund** — flagged as a genuine open gap in Refund Handling (05. Payments): proportional commission reduction recommended but not confirmed.
- **Sale in one currency, creator's payout account set up for another** — e.g. a Creator based in the EU promoting a merchant's GBP-priced offer. Handled by Stripe's cross-currency payout support (per Money Flow's FX default), but the exact rate/timing shown to the Creator on their dashboard needs to be clear about conversion, or it will look like a discrepancy/bug to them.
- **Refund happens after a creator has already withdrawn below the $50 remaining balance** — the clawback (Commission Engine's 14-day rule) has nothing left to deduct from. This is the "real loss" scenario already flagged in Money Flow as something the platform needs to accept and size, not solve away.
- **Duplicate/replayed Stripe webhook causes a double-credit attempt** — prevented by idempotent processing (02. Event-Driven Architecture), but worth calling out here as the specific financial edge case that requirement exists to prevent.
- **Chargeback dispute fee** — flagged as unresolved in Chargebacks (05. Payments): who absorbs it isn't decided.

## Open Questions

- Partial refund handling and chargeback fee allocation are both genuinely unresolved (carried over from 05. Payments, not new) — restating here since Edge Cases is where they'll actually get tested against real scenarios first

## Update (2026-08-07): Resolved — No Creator Clawback, Ever

The "insufficient balance to absorb clawback" scenario above no longer applies to creators — there is no creator clawback at all (01. Commission Engine, reversed from the earlier 14-day rule). The real risk moved to the merchant instead: their Connect balance can go negative if they've already withdrawn funds before a refund is issued. That's the scenario worth monitoring now, not a creator-side edge case.

## Update (2026-08-07): RESOLVED

Dispute fee allocation is resolved: SellVia absorbs it for a merchant's first 5 lost disputes, merchant pays from the 6th onward. See 05. Chargebacks for the full rule.