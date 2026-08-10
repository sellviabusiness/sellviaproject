# User Edge Cases

## Purpose

Account-level edge cases not covered by the happy-path User Flows (01. Business Logic).

## Cases

- **Account holds both Merchant and Creator roles** (allowed per User Roles' default) — what happens if this same user applies to their own campaign? Should be blocked explicitly; self-dealing undermines the whole attribution/trust model.
- **Merchant or Creator deletes their account mid-active-campaign/application** — handled via Soft Delete (03. Database); existing Sales/Commissions must remain intact and resolvable even after the account is soft-deleted.
- **Duplicate application attempt** — blocked at the database level via the unique constraint on (campaign_id, creator_profile_id) per 03. Database → Constraints; API should return a clear 409 (per 07. API → Error Responses), not a generic failure.
- **Creator's Paddle onboarding incomplete** — if a Creator is approved for a campaign but hasn't finished Paddle seller onboarding, they shouldn't be able to generate a live AffiliateLink yet (a link with no way to receive payout is a trust problem, not just an inconvenience). Needs an explicit "onboarding incomplete" gate before link activation.

## Open Questions

- Exact UX for the Paddle-onboarding-incomplete gate (blocked entirely vs. link works but payout is held) — recommend blocking link activation entirely rather than accruing unpayable commission, to avoid a confusing backlog

## Update (2026-08-07): RESOLVED — Hard Block

**Founder-confirmed: blocked outright, no exceptions.** A CreatorProfile cannot submit an Application to a Campaign owned by the same User's MerchantProfile. Enforced at the database constraint level where possible (matching `creator_profile.user_id` against the campaign's owning `merchant_profile.user_id` at application-creation time) and re-checked at the API layer (04. Security → Authorization's "UI is not a trust boundary" rule applies here too — this check runs server-side regardless of what the UI shows).