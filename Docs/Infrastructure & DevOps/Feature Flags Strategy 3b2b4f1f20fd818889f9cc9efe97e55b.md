# Feature Flags Strategy

## Purpose

Decouple *deploying* code from *releasing* it — the actual highest-leverage risk reduction for payments-critical changes, more so than any branch strategy. A bad change sitting behind a flag that's off does nothing; the same change merged and live for everyone does real damage.

## Mandatory Use Case: The Financial Chain

**Any change touching Sales, Commissions, Payouts, or Refunds must ship behind a feature flag**, defaulting to off in Production. This isn't optional for payments-adjacent work — it's the concrete mechanism behind Release Process's existing "extra scrutiny for financial-chain changes" rule, which previously named the principle without a real implementation.

## Mechanism (deliberately lightweight, not a third-party service)

Given team size, a simple database-backed flags table is the right call over a paid service (LaunchDarkly, etc.) — same reasoning as every other "don't add a vendor before you need one" call made throughout this build:

```
feature_flags
  id
  key                 (e.g. "new_refund_clawback_logic")
  enabled             (boolean, default false)
  rollout_percentage  (0-100, for gradual rollout)
  enabled_for_admin   (boolean — lets Admin/founder test in production before wider rollout)
  updated_at
```

Checked at request time in the FastAPI backend; cheap enough to not need heavy caching at current scale, though it can sit behind the same Redis cache layer (02. Caching Strategy) if it ever needs to.

## Rollout Pattern

1. New logic built behind a flag, deployed to Production, flag off for everyone
2. Flip on for Admin only (`enabled_for_admin`) — founder tests the real thing in the real environment before any real user sees it
3. Gradual `rollout_percentage` increase (e.g. 10% → 50% → 100%) if the change is significant enough to want a staged rollout
4. Once fully rolled out and stable, **remove the flag and the old code path** — flags are not meant to live forever; an accumulating pile of stale flags is its own kind of technical debt

## Why This Beats Branch Tuning for Risk Reduction

A branch naming convention affects nothing about production risk once code is merged and deployed. A feature flag means a bad financial-chain change can be **turned off in seconds, without a redeploy** — directly useful for 10. Operations → Incident Response, which currently recommends "pause checkout" for money-critical incidents as a deploy-time action; with flags in place, pausing a specific broken feature (not the entire checkout) becomes a flag flip, which is faster and more targeted than the blunt instrument of pausing checkout entirely.

## Relationship to Other Docs

- **10. Operations → Release Process:** the "extra scrutiny for payments changes" step now concretely means "is this behind a flag, and has it been Admin-tested before wider rollout"
- **10. Operations → Incident Response:** a flag flip is now the first response option for a financial-chain bug, tried before the more drastic "pause checkout entirely"
- **06. Infrastructure → Git Repository Strategy:** this is the actual risk-reduction mechanism the earlier branch-strategy conversation was reaching for — branches control code review, flags control production exposure; they solve different problems

## Open Questions

- None blocking — straightforward to build once there's a first financial-chain change to ship behind it.

## Update (2026-08-04): Beta Cohort Tier Added

Extends the rollout pattern with an explicit beta-user tier between Admin-testing and percentage rollout:

```
enabled_for_admin \u2192 enabled_for_beta_cohort \u2192 rollout_percentage (5 \u2192 100)
```

`enabled_for_beta_cohort` targets users from the Private Beta invitation list (00. Product Roadmap's waitlist → beta invitation flow), added as a new column on `feature_flags`. This sits between Admin-only testing and general percentage rollout — beta users see it before the wider 5% slice does, consistent with their "founding terms" early-access status.

## Update (2026-08-04): Composes With Canary Deployment

This system gates *feature* exposure on a stable codebase. 06. Canary Deployment & Automated Rollback gates *build* exposure across two code versions — a different, complementary concern. For a financial-chain change: canary-deploy the build first (validates the code), then use this flag system's tiers to progressively enable the actual behavior once the build itself is fully promoted.