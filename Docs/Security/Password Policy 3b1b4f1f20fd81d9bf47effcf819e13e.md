# Password Policy

## Purpose

Covers password rules — largely inherited from Clerk rather than custom-built.

## Approach

Clerk enforces its own password policy (minimum length, breach-database checking against known leaked passwords) out of the box — SellVia doesn't need to build or maintain custom password rules.

## What SellVia Still Controls

- Whether social login (Google, etc.) is offered alongside email/password — open question already flagged in 04. Security → Authentication
- Whether MFA is required for any role — **recommended default (please confirm): optional for Creators, and consider requiring it for Merchants and mandatory for Admin**, since Merchant/Admin accounts have more financial and moderation power respectively

## Open Questions

- Whether MFA becomes mandatory (not just optional) for Merchants before launch, given they're connected to real payout accounts