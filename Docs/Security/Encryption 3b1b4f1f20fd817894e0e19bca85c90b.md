# Encryption

## Purpose

What's encrypted, and where responsibility for that encryption actually sits.

## What SellVia Does NOT Need to Handle Directly

- **Card details (the original sale):** never touch SellVia's servers or infrastructure at all — the purchase happens entirely on the merchant's own website, outside SellVia's systems (reversed 2026-08-07, 01. Money Flow). SellVia has zero exposure to this transaction, stronger than the original hosted-checkout design.
- **Card details (merchant billing):** the one place SellVia does touch payment card data — collecting the merchant's card on file for periodic billing (05. Payment Flow) uses Paddle Checkout (saved payment method), keeping SellVia out of full PCI-DSS scope for this too (per 02. Backend Architecture)
- **Identity/KYC documents:** handled entirely within Paddle's own onboarding flow for Merchants and Creators (per 02. Backend Architecture) — SellVia's database never stores these

## What SellVia Does Need to Handle

- **Data at rest:** standard database encryption at rest (provided by the managed Postgres provider, per 06. Infrastructure)
- **Data in transit:** HTTPS everywhere, enforced at the Cloudflare/Nginx layer (per 06. Infrastructure)
- **Secrets:** API keys (Paddle, Ory Kratos) never committed to source control — see Secrets Management

## Open Questions

- None blocking — by design, most of the hardest encryption/compliance burden is offloaded to Paddle and Clerk rather than built in-house, which is the right call at this stage.