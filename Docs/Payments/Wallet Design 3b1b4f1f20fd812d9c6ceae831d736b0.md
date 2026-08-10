# Wallet Design

## Purpose

How a creator's or merchant's running balance is represented — the technical counterpart to `creator_profiles.wallet_balance_cents` in 03. Database.

## Model

- The "wallet" is not a separate ledger system — it's a running balance derived from summing unpaid Commissions (see Table Specifications), mirrored by the actual balance sitting in the user's Paddle account
- Paddle is the actual source of truth for available funds; SellVia's `wallet_balance_cents` is a convenience read-model for fast dashboard display, kept in sync via webhook events

## Creator Wallet

- Accrues per verified Sale (instant, per Money Flow)
- Triggers a bank payout once balance crosses $50

## Merchant Wallet

- Also accrues per verified Sale, but is **not** threshold-gated (per Money Flow's working default) — pays out on Paddle's regular rolling schedule regardless of amount

## Open Questions

- Whether creators can view/withdraw below the $50 threshold voluntarily (e.g. closing their account) — reasonable default: allow a manual below-threshold payout only on account closure, not as a standing feature, to avoid undermining the batching efficiency the threshold exists for

## Update (2026-08-07): Wallet Now Gated by Billing Cycle Status

"Accrues per verified Sale (instant, per Money Flow)" above is superseded — a creator's wallet balance now only includes commissions whose BillingCycle has reached `charged` (01. Money Flow, State Machines). Pre-billing commission is "owed" but not yet in the spendable wallet balance — this is the data-layer enforcement of bill-first-then-pay.
