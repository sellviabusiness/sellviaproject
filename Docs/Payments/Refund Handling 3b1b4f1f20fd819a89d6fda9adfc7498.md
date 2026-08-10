# Refund Handling

## Purpose

What happens when a merchant's customer wants a refund, and what that means for SellVia's billing.

## REVISED 2026-08-07: This Is a Billing Credit Request, Not a Stripe Refund SellVia Processes

The process below previously assumed SellVia held the original Stripe charge and could reverse it directly. **That's no longer true** — the customer paid the merchant directly, on the merchant's own site (01. Money Flow, reversed). SellVia was never part of that transaction and has no charge to refund.

## Process (corrected)

1. Customer requests a refund **directly from the merchant** — SellVia is never involved in this conversation
2. Merchant processes the actual refund on their own site/payment processor — entirely outside SellVia
3. If the sale had already been tracked and billed to the merchant (commission already paid out to the creator), the merchant can **request a billing credit from SellVia**
4. **Capped at 5 credits per calendar month** (confirmed 2026-08-07, same reasoning as 05. Chargebacks' dispute-fee allowance): SellVia absorbs the loss for the first 5 requests each month (creator commission is already paid and non-recoverable — 01. Commission Engine), since the credit comes entirely out of SellVia's own margin, not the creator's
5. Beyond 5 in a given month: no further credit — the merchant already paid SellVia for that sale and it stands, regardless of what they did with their own customer

## Partial Refunds

**Confirmed 2026-08-07: proportional.** If a merchant's customer returns part of an order, the billing credit reduces proportionally to the returned portion — not a full credit for a partial return.

## Open Questions

- UI/API for how a merchant actually submits a credit request — not yet designed, low urgency given the small monthly cap