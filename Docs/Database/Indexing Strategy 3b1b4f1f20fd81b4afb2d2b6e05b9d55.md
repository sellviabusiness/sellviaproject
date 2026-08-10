# Indexing Strategy

## Purpose

Which fields need indexes, and why — kept honest about what's a real MVP need vs. premature optimization.

## High-Value Indexes (needed from day one)

- `affiliate_links.slug` — every click hits this lookup; must be fast, and it's already unique so this comes near-free
- `attribution_events.affiliate_link_id, occurred_at` — composite index, since attribution-window checks ("is this click within 30 days") filter on both
- `sales.status` — dashboards and background jobs (payout batching) filter heavily on `status = 'verified'`
- `applications.campaign_id, status` — merchant dashboard's "pending applications" view filters on exactly this
- `payouts.status` — background payout-batching job queries pending/processing payouts constantly
- `users.clerk_id` — every authenticated request resolves this

## Deliberately NOT Indexed Yet

- Free-text fields (niche, business_name) — no full-text search planned for MVP per 02. Search Strategy; adding an index here now would be premature
- Analytics-style aggregate queries (e.g. "total sales this month per campaign") — fine to run unindexed at MVP scale; revisit if/when 11. Analytics needs real dashboards over meaningful data volume

## Open Questions

- None blocking — revisit this doc once there's real production query-performance data (e.g. via Postgres's own slow-query logging) rather than guessing further indexes speculatively.