# Financial Ledger

## Purpose

The authoritative internal record of every financial movement — what an accountant or auditor would actually look at.

## What It Is

Effectively the union of `sales`, `commissions`, `platform_fees`, and `payouts` tables (03. Database), read in sequence, plus the Audit Log (03. Database → Audit Log Design) for any manual adjustments (refund clawbacks, Admin overrides).

## Principle

Every dollar that enters SellVia (via a Sale) must be traceable to exactly where it went: creator commission, merchant share, or platform fee — with no unaccounted difference. This ledger view is what makes that traceable, rather than having to reconstruct it ad hoc from raw tables during a dispute.

## Reconciliation Against Stripe

See Reconciliation (below) for how this internal ledger is checked against Stripe's own records, which are the ultimate source of truth for actual money movement.

## Open Questions

- Whether a dedicated `ledger_entries` table (double-entry style: every transaction recorded as a debit and credit) is worth building for MVP, or whether deriving the ledger view from existing tables is sufficient — double-entry is more rigorous but more engineering effort; reasonable to defer true double-entry bookkeeping until transaction volume justifies it, as long as Reconciliation (below) catches discrepancies in the meantime

## Update (2026-08-07): Ledger Now Spans Billing Cycles, Not Live Splits

The ledger's job changed: it previously traced a Stripe split at time of sale; now it traces a Sale → its BillingCycle → the Stripe charge that collected it → the payout that distributed it. Every dollar's path is longer (more steps) but each step is independently auditable — the union of `sales`, `billing_cycles`, `commissions`, `platform_fees`, and `payouts` (03. Table Specifications, revised 2026-08-07).