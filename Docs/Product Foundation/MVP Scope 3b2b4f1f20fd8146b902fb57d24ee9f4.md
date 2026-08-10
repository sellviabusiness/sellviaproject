# MVP Scope

## Purpose

The single source of truth for what's actually being built right now — every decision below has already been made elsewhere in this documentation; this doc exists so scope doesn't have to be reconstructed by scanning 100+ pages. Updated every time a new MVP-scoping decision is made.

## Checkout & Payments

- **SellVia Checkout REMOVED (reversed 2026-08-07)** — external-site tracking is now the model: customer buys on the merchant's own site, SellVia tracks via redirect + universal onboarding snippet + discount-code fallback. See 02. Architecture Decision Log.
- **Processor: Paddle** (reversed 2026-08-10 from Stripe Connect — see 02. Architecture Decision Log). Handles periodic merchant billing; creator payout mechanism not yet confirmed against Paddle's platform/marketplace product — flagged as an open item below, not solved.
- **Currencies:** USD, EUR, GBP only (PKR dropped for now)
- **Commission:** merchant-set freely, no platform range, no bargaining
- **Platform fee: 2% flat**, no subscription tier
- **Payout:** commission accrues to creator balance after merchant billing succeeds (not instant/live-split, per the Checkout & Payments reversal below); creator bank payout gated at **$50 threshold**; merchant payout NOT threshold-gated
- **Attribution window:** 30 days
- Refund clawback: RESOLVED 2026-08-07 — creator commission is never clawed back; merchant absorbs full refund cost

## Stack

- **Backend:** FastAPI (Python), single **monolithic** service (modular monolith — extractable later, not built as microservices)
- **Frontend:** Next.js + shadcn/ui + Tailwind
- **Database:** **Supabase** (Postgres + pgvector + built-in pooling) — explicit MVP choice, revisit at scale
- **Auth:** Ory Kratos (Ory Network managed hosting for MVP, self-hosted later — updated 2026-08-04, was Clerk)
- **Background jobs:** Celery (Redis broker)
- **Hosting:** VPS (Hetzner vs. DigitalOcean — still open) + Cloudflare (DNS/CDN/WAF)
- **Git:** Monorepo, short-lived service-prefixed feature branches, no long-lived per-service branches

## AI Features (initial level, no training/ML infra)

- Creator ↔ Campaign matching (embeddings + pgvector)
- Application screening summaries (LLM, cached per application)
- Campaign copy assist (LLM draft)
- Disclosure nudge: templated, NOT LLM-generated (legal text)
- Fraud detection stays **rules-based**, not AI, for MVP

## Security & Resilience

- WAF (Cloudflare), IP anomaly detection with throttle→ban escalation, documented DDoS response plan
- Tenant isolation enforced across cache, DB, background jobs, file storage, and logs — fail-closed principle
- Cross-tenant automated test suite (built after MVP functionally complete, required before Private Beta)
- Feature flags **mandatory** for any change touching Sales/Commissions/Payouts/Refunds

## Accessibility & Machine-Readability (binding gates, not aspirational)

- Full keyboard navigation, screen reader/ARIA compliance, WCAG AA contrast (verification pending)
- Structured data ([schema.org](http://schema.org)), semantic HTML, OpenAPI spec, llms.txt, deliberate robots.txt

## Cost & Financial Tracking

- AI/token usage tracking per feature
- Unit economics (revenue vs. cost per user, asymmetric by role)
- Automated monthly P&L (Paddle reconciliation + hosting costs + AI costs)

## Roles & Access

- Merchant, Creator, Admin (single flat role, no tiering)
- Dual-role accounts (Merchant + Creator) allowed
- No follower-count floor for creator eligibility

## Explicitly Deferred to Post-MVP

See **Full Product Vision (Post-MVP)** for the complete list — notably: external-site checkout tracking, PKR support, subscription pricing, AI-based fraud detection, microservices extraction, mobile apps.

## Still-Open Items Blocking MVP Completion (not deferred — need a real decision)

- Commission-rate lock timing: "at approval" (State Machines) vs. "at time of sale" (Business Rules) — genuine conflict, unresolved
- Partial refund commission handling
- Chargeback dispute fee allocation — RESOLVED 2026-08-07: SellVia absorbs first 5 lost disputes per merchant, merchant pays from 6th onward
- Sales tax / VAT (founder has deferred this explicitly to end of build)
- Self-dealing block (dual-role account applying to own campaign) — RESOLVED 2026-08-07: blocked outright
- Merchant Paddle-restriction handling
- Beachhead niche/vertical for go-to-market
- Private Beta cohort size/cap
- Supabase Storage vs. separate S3-compatible provider
- VPS provider: Hetzner vs. DigitalOcean
- India IT Rules relevance (founder has deferred this explicitly to end of build)
- **Paddle creator-payout evaluation (added 2026-08-10)** — does Paddle for Platforms actually support per-creator payout (KYC, bank transfer, $50 threshold) the way Stripe Connect did — needs real evaluation before build, see Architecture Decision Log

## Status & Incident Communication (added 2026-08-04, upgraded from earlier "deferred")

- Public status page on a **separate domain, separate infrastructure** from the main SellVia stack — managed status page tool (Instatus/Better Uptime-style), not self-hosted
- Scheduled maintenance announcements with subscriber notifications
- Formal incident communication workflow (Investigating → Identified → Monitoring → Resolved), tied to checkout-pause incidents specifically

## Update (2026-08-07): RESOLVED

Commission-rate lock timing is resolved — locked at approval, confirmed by founder. No longer an open item. See 01. Business Rules and 01. Commission Engine for the correction.

## Update (2026-08-07): MAJOR REVISION — Checkout & Payments Model Reversed

**This section's original "SellVia Checkout only" bullets are superseded.** Current model:

- **External-site tracking** — customer buys on the merchant's own site; SellVia redirect logs the click, a universal onboarding tracking snippet on the merchant's confirmation page reports the sale
- **Paddle** used for periodic merchant billing and creator payouts, not a live per-sale split
- **Money collection: billed periodically** (merchant's card on file, recurring cycle)
- **Creator payout: bill-first-then-pay** (working default) — SellVia doesn't front commission before billing succeeds
- **Refund clawback: creator commission is NEVER clawed back** (RESOLVED) — merchant absorbs full cost via billing-cycle credit adjustment
- **Commission rate: locked at creator approval** (RESOLVED), never changes after
- **Self-dealing: blocked outright** (RESOLVED) — dual-role account cannot apply to own campaign
- **Chargeback dispute fee: SellVia absorbs first 5 lost disputes per merchant, merchant pays from 6th onward** (RESOLVED)
- **Merchant Paddle restriction: auto-pauses all live campaigns immediately** (RESOLVED)
- Currencies, platform fee (2% flat), attribution window (30 days) unchanged

Full detail: 01. Money Flow, 01. Commission Engine, 01. State Machines, 05. Payment Flow, 02. Architecture Decision Log (all updated 2026-08-07).

## Update (2026-08-10): Payments Processor Reversed — Paddle Replaces Stripe

**Founder decision: Paddle instead of Stripe, across the board** (merchant billing, tax, and creator payouts). See 02. Architecture Decision Log for full reasoning. Every doc referencing Stripe/Stripe Connect/Stripe Tax has been updated to Paddle. One real open item this creates, not yet resolved: Paddle's per-creator payout capability (KYC collection, bank transfer, threshold-gated payout) hasn't been evaluated the way Stripe Connect's was — added to Still-Open Items above.