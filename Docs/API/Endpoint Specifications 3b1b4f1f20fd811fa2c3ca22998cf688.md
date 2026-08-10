# Endpoint Specifications

## Purpose

The concrete endpoint list — direct implementation of 03. Database's tables and 01. Business Logic's state machines.

## Campaigns

- `GET /campaigns` — public, browsable, filterable (category, commission range, niche — per 02. Search Strategy)
- `POST /campaigns` — Merchant only
- `PATCH /campaigns/:id` — Merchant (own only); rate changes follow the "locked at approval" rule (State Machines)
- `PATCH /campaigns/:id/status` — draft→live→paused→ended transitions per State Machines

## Applications

- `POST /campaigns/:id/applications` — Creator only
- `GET /campaigns/:id/applications` — Merchant (own campaigns only)
- `PATCH /applications/:id` — approve/reject, Merchant only, triggers AffiliateLink creation on approval

## Affiliate Links

- `GET /affiliate-links/:slug` — public; this is the endpoint a creator's shared link actually resolves to, which then redirects into the hosted checkout for that campaign's Offer

## Checkout / Sales

- `GET /go/:slug` — the redirect endpoint an AffiliateLink resolves to (public, no auth) — logs the click, redirects to the merchant's product page with attribution reference attached
- `GET /sales` — Merchant/Creator, scoped to their own
- Sale status transitions happen via the Stripe webhook handler, not a direct client-facing endpoint (per 02. Event-Driven Architecture)

## Payouts

- `GET /payouts` — Merchant/Creator, scoped to their own
- No client-facing "trigger payout" endpoint for creators (threshold-based, automatic per Payout Process) — though see Wallet Design's open question on manual below-threshold payout on account closure

## Admin

- `GET /admin/flagged` — fraud/moderation queue
- `POST /admin/campaigns/:id/vet` — approve/reject high-commission campaign vetting
- `POST /admin/users/:id/suspend`

## Open Questions

- None blocking — this list will grow as features are built, but the shape is fully derived from already-settled business logic and schema.

## Update (2026-08-04): Why Each Group Exists

The routes above are the "what" — here's the "why" per group, so a route's purpose is never guessed at from its name alone:

**Campaigns endpoints** exist because the merchant-side "core transaction" (01. Business Logic → User Flows) starts with listing a product for creators to discover — without this group, there's nothing for a creator to apply to.

**Applications endpoints** exist to implement the "creators apply, not the other way around" principle (01. Business Rules) as an actual enforced flow, not just a stated intention — the approve/reject action here is what triggers AffiliateLink creation, the single most consequential state transition on the creator side.

**Affiliate Links (`GET /affiliate-links/:slug`)** exists as the literal mechanism the product's whole trust story depends on — this is the endpoint a shared link actually resolves to, tying a click back to exactly one creator and campaign (01. Business Rules → Attribution Rules).

**Redirect and sale-report endpoints** exist because SellVia tracks sales via external-site attribution, not hosted checkout (reversed 2026-08-07, see 02. Architecture Decision Log) — `GET /go/:slug` logs the click and redirects to the merchant's own site; `POST /webhooks/merchant-sales` receives the onboarding snippet's report. Without this group, there'd be no way to attribute a sale happening entirely outside SellVia's infrastructure.

**Payouts endpoints** are read-only by design (no client-facing "trigger payout" endpoint) — they exist to let users see their own payout history, not to let anyone manually control payout timing, which stays automatic per 05. Payout Process.

**Admin endpoints (`/admin/*`)** exist as the enforcement surface for everything 04. Security → Fraud Prevention and 10. Operations → Moderation need to actually act on — without this group, flagging suspicious activity would have no corresponding action to take.

**`POST /jobs/export` and friends** exist specifically so heavy operations never block a request cycle (02. Async Job Pattern & Idempotency) — this group's entire reason for existing is UX and reliability, not new business logic.

## Open Questions

None — rationale is now explicit per group rather than implied by the route list alone.

## Update (2026-08-07): Checkout Endpoints Replaced with Redirect + Sale-Report Endpoints

`POST /checkout/:slug/session` no longer exists — SellVia doesn't host checkout (01. Money Flow, reversed). Replaced with:

- `GET /go/:slug` — the redirect endpoint an AffiliateLink resolves to; logs the click, redirects to the merchant's product page with a tracking reference attached
- `POST /webhooks/merchant-sales` — receives the onboarding snippet's sale report (05. Payment Flow) — authenticated per-merchant, not open/public
- `GET /billing-cycles` — Merchant, scoped to their own — view billing history
- `GET /sales` — unchanged in spirit, now shows `acceptance_status` (accepted/rejected) instead of the old verified/pending framing