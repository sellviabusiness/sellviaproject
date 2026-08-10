# Full Product Vision (Post-MVP)

## Purpose

Where SellVia goes beyond MVP — everything deliberately deferred, and the eventual full vision. This doc exists so "we're not doing X yet" doesn't quietly become "we forgot about X." Updated whenever a new post-MVP decision or deferral is made.

## Checkout & Merchant Reach

- **External-site checkout tracking** — redirect link + webhook/pixel attribution for merchants who want to keep their own checkout (e.g. Shopify). Highest-priority version: a Shopify app integration. Deferred because it roughly doubles MVP engineering surface and reintroduces attribution ambiguity MVP is designed to avoid.
- Public API for merchants (their own reporting/integrations) — not needed until there's demand beyond SellVia's own frontend

## Payments & Currency

- **PKR support** — dropped for MVP due to Stripe Connect payout limitations; revisit with a proper local payout partner (e.g. Payoneer) if there's real demand
- **Subscription/tiered pricing** — the earlier $49/mo idea was dropped in favor of a flat 2% fee; could return as a decoupled paid tier for extra features (analytics, priority placement) later, not as a fee discount
- Volume-based fee reduction for high-performing merchants, if retention data justifies it

## AI & Fraud

- **AI-based fraud/anomaly detection** — stays rules-based until there's real transaction volume to train against; layering an anomaly-scoring model on top of the rules is the planned evolution, not a replacement for them
- Audience verification for creators (connected social account) — flagged as a real gap in Creator Edge Cases, deferred rather than solved with self-reported data indefinitely

## Architecture

- **Service extraction from the modular monolith** — Payments is the most likely first candidate if a specific module ever needs independent scaling or failure isolation. Only pursued once there's real evidence, not preemptively.
- **Database migration off Supabase** — to Neon, RDS, or self-managed, once connection limits, compute ceiling, or cost make it a real bottleneck (Hosting Strategy's revisit trigger)
- Horizontal scaling / read replicas (Scaling Strategy) once vertical scaling on a single VPS stops being enough

## Product Surface

- **Mobile apps** — raw data doc's original vision included dedicated tracking apps; MVP is responsive web only
- Complex analytics/BI dashboards beyond the current KPIs/Funnel Tracking/Dashboards scope
- Referral program — explicitly undesigned; not even confirmed as wanted yet, let alone specified (01. Business Logic → Referral Logic)
- Tiered Admin roles (junior/senior moderator) if the team grows enough to need separation of duties
- "Request a different rate" — single counter-offer negotiation feature, if flat take-it-or-leave-it commission proves to be real friction

## Compliance (explicitly deferred by founder, not forgotten)

- Sales tax / VAT across USD/EUR/GBP jurisdictions
- T Rules Amendment 2026 (SGI/deepfake regulation) — relevance depends on whether SellVia ever has an India-based user nexus
- General intermediary/platform liability obligations, jurisdiction TBD

## Rollout Alignment (from Product Roadmap)

This doc's contents map to the **Private Beta → Public Launch** transition and beyond — MVP Scope covers up through Private Beta readiness; most of what's listed here is Public-Launch-or-later territory, not a fixed timeline.

## Auth & Enterprise Features

- **SAML/SSO** — deferred, contingent on an actual enterprise customer requiring it, not built speculatively. Clerk supports this on higher tiers already, so this is a plan upgrade when needed, not a migration or new engineering effort (04. Security → Authentication).

## Update (2026-08-07): No Longer Deferred — Now Core MVP

The "External-site checkout tracking" item above is **no longer post-MVP** — it's the current MVP model (01. Money Flow, reversed 2026-08-07). Remove from this deferred list; SellVia-hosted checkout is now the thing that's NOT built, rather than the reverse.