# Events

## Purpose

What gets tracked as a discrete event — the raw material every KPI, funnel, and dashboard in this section is built from.

## Product Events

- `waitlist_joined` (role: business/creator)
- `campaign_created`, `campaign_published`, `campaign_paused`, `campaign_ended`
- `application_submitted`, `application_approved`, `application_rejected`
- `affiliate_link_generated`
- `attribution_click`, `attribution_cart_add`, `attribution_purchase` (per 03. Database → attribution_events, reused directly rather than duplicated)
- `sale_verified`, `sale_refunded`
- `payout_triggered`, `payout_paid`, `payout_failed`
- `creator_wallet_threshold_reached` (the $50 crossing moment)

## Where These Come From

Most of these map directly onto state transitions already defined in 01. Business Logic → State Machines and 03. Database's tables — this doc doesn't invent new tracking, it specifies that those same transitions should also emit an analytics event, not just update a database row.

## Open Questions

- Whether a dedicated analytics event pipeline (e.g. a lightweight events table, or a third-party product-analytics tool) is used, or whether KPIs/Funnel Tracking are computed via direct queries against the core tables for MVP — recommend direct queries for MVP (no extra infrastructure), revisit only if the query load becomes a real burden on the primary database (ties to 02. Caching Strategy and 03. Indexing Strategy's stated "revisit if it becomes a bottleneck" philosophy)