# Payout Process

## Purpose

The mechanics of actually getting money out of Paddle and into a real bank account — implementation detail behind Money Flow's "Instant Split vs. Bank Payout Timing."

## Creator Payout

1. Background job (02. Background Jobs) periodically checks which creators have `wallet_balance_cents >= 5000` ($50)
2. For each, trigger a Paddle payout to their linked bank account (**mechanism unconfirmed** — depends on Paddle for Platforms actually supporting per-creator payout the way Stripe Connect did; flagged as an open item in 02. Architecture Decision Log, not yet resolved)
3. On the payout-completed webhook, mark the Payout row as `paid` and notify the creator (01. Business Logic → Notification Logic)
4. On payout failure, retry per the Payout State Machine, and alert Admin if failures repeat

## Merchant Payout

- Rides Paddle's own standard payout schedule (not a custom SellVia job) — simplest implementation, consistent with the "not threshold-gated" decision in Money Flow

## Open Questions

- Exact batch frequency for the creator payout job (already flagged as open in 02. Background Jobs — not duplicating here, just noting the dependency)
