# Automated Monthly P&L

## Purpose

An automatically-generated monthly profit & loss statement, reconciling internal records against Stripe and hosting costs — not just a dashboard number, an actual reconciled report.

## Formula

```
Revenue:  Platform fees collected (from internal platform_fees table)
Costs:    Stripe processing fees
        + Hosting/infra costs
        + AI/token costs (AI / Token Usage Tracking)
        + Other SaaS costs (Clerk, monitoring, etc.)

P&L = Revenue − Costs
```

## New Cost Line: Stripe's Own Processing Fees (gap closed 2026-08-04)

Every prior split-math example (Commission Engine, Money Flow) modeled only SellVia's 2% platform fee — **Stripe's own processing fee (roughly 2.9% + $0.30 per charge, varies by card/region) was never accounted for anywhere until now.** This comes out of SellVia's revenue, not the customer's or merchant's side of the split — actual margin per sale is thinner than the 2% figure alone suggests. This report is where that gets made visible and tracked properly.

## Data Sources and Automation Level

| Source | Pulled via | Automation |
| --- | --- | --- |
| Platform fee revenue | Internal `platform_fees` table | Fully automatic |
| Stripe processing fees | Stripe's Balance Transactions API (`fee` field per transaction) | Fully automatic |
| Hosting costs | Hosting provider's billing API, where available (e.g. DigitalOcean exposes one; a bare Hetzner box may not cleanly) | Automatic where supported, manual entry fallback otherwise |
| AI/token costs | Internal `ai_usage_events` table | Fully automatic |
| Other SaaS (Clerk, monitoring, etc.) | Most providers don't expose billing APIs | **Manual monthly entry** — realistic limitation, not a gap to pretend away |

## Process (Celery scheduled job, monthly)

1. On the 1st of each month, job runs for the prior month
2. Pull Stripe Balance Transactions for the period (revenue + Stripe's fees)
3. **Reconcile against internal `sales`/`platform_fees` records first** (extends 05. Payments → Reconciliation — the existing fraud/discrepancy check now also feeds this report) — the P&L should never be built on unreconciled numbers
4. Pull hosting costs (API where available, manual entry table otherwise)
5. Sum AI/token costs from `ai_usage_events`
6. Compute and store the P&L as a row in a new `monthly_pnl_reports` table
7. Surface in the Admin dashboard (10. Operations → Admin Panel, 11. Analytics → Dashboards)

## Manual Cost Entry (for the non-API-able sources)

A simple Admin-only form/table for entering monthly costs that can't be pulled automatically (Clerk subscription, monitoring tools, etc.) — not full automation, but keeps the P&L complete rather than silently missing real costs just because they're harder to fetch programmatically.

## Open Questions

- Exact hosting provider choice (Hetzner vs. DigitalOcean, still open per 06. Infrastructure → Hosting Strategy) determines how much of the hosting line can actually be automated — worth weighing billing-API support as a real factor in that decision, not just price/region
- Whether the report needs to be finalized/locked once generated (so historical P&L doesn't silently change if a late-arriving Stripe adjustment comes in) — recommend a "finalized" flag with a separate adjustment entry for anything discovered after the fact, rather than editing a closed month in place