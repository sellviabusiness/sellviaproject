# Cross-Tenant Isolation Testing

## Purpose

An automated test suite that actively attempts cross-tenant access and asserts every attempt fails — built **after the product exists**, since it needs real endpoints and real data to test against. This upgrades 04. Security → Security Checklist's existing manual "try to access another Merchant's data by ID manipulation" bullet into a real, repeatable, automated suite.

## When This Gets Built

After MVP is functionally complete, before Private Beta — not a parallel-track item during initial build, and not something to defer past launch either. Referenced from 04. Security → Security Checklist as a required pre-launch gate.

## Test Categories

### Direct ID manipulation

- Authenticated as Merchant A, attempt to `GET`/`PATCH` Merchant B's Campaigns, Applications, Sales, Payouts by guessing/enumerating IDs — every attempt must return 403/404, never real data
- Same pattern for Creator A attempting Creator B's earnings, links, applications

### Cache poisoning / key collision

- Attempt to construct a request that could cause one tenant's data to be cached under a key another tenant's request would hit — directly tests 02. Caching Strategy's mandatory tenant-prefixed keys and the public/private namespace separation

### Cross-role leakage (dual-role accounts)

- For a User holding both Merchant and Creator roles, verify their Merchant-context requests never surface Creator-context data and vice versa — tests the "two tenant contexts, not one" rule from Tenant Isolation Audit

### Background job isolation

- Verify a payout batch job, refund clawback job, etc. only ever touches the tenant it was scoped to — directly tests Tenant Isolation Audit's Gap 2 fix (tenant ID required in job payloads)

### File storage access

- Attempt to access another tenant's uploaded file via direct URL guessing/manipulation — tests Tenant Isolation Audit's Gap 3 fix

### AI Services boundary

- Verify a Merchant can never retrieve another Merchant's application-screening summary, and that matching results never leak private data beyond what's already intentionally public (campaign details a Creator could see anyway)

### Fail-closed verification

- Deliberately send a malformed/missing-tenant-context request to each shared layer (cache, queue, file storage) and assert it's **rejected**, not silently served with a default/fallback — directly tests the fail-closed principle from Tenant Isolation Audit

## Where This Runs

Part of the CI/CD Pipeline (06. Infrastructure) test suite — run on every PR into `develop`, not just before major releases, so a regression is caught immediately rather than discovered at the pre-launch gate.

## Open Questions

- None blocking — this is a concrete test plan to implement once there's a working product to run it against, not a design decision needing more input now.