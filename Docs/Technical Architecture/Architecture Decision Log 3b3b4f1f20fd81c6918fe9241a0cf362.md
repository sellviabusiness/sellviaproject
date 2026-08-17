# Architecture Decision Log

## Purpose

A single chronological record of every major architecture decision, why it was made, what alternatives were considered, and where the full detail lives. This doesn't replace the detailed docs — it's the index that answers "why is it this way" without searching through 100+ pages.

## Format

Each entry: Decision — Alternatives considered — Reasoning — Status — Full detail link.

---

### Backend language: FastAPI (Python)

**Alternatives considered:** Node.js via Next.js API routes (original choice)

**Reasoning:** Founder preference for Python/FastAPI over the original Node-unified approach. Real trade-off accepted: two languages, two deploy paths, CORS between services, instead of one unified app.

**Status:** Confirmed. **Detail:** 02. Backend Architecture

### Application structure: Modular monolith, not microservices

**Alternatives considered:** Full microservices (separate Payments/Campaigns/Notifications services)

**Reasoning:** Team size (solo founder) doesn't justify microservices' organizational benefit; financial-chain transaction consistency is simpler within one service boundary. Built with clean internal module boundaries so extraction is possible later without a rewrite.

**Status:** Confirmed. **Revisit trigger:** a specific module demonstrably needs independent scaling/failure isolation under real load. **Detail:** 02. System Architecture, 02. Backend Architecture

### Database: Supabase (MVP) → Neon (production/scale)

**Alternatives considered:** Self-managed Postgres, RDS

**Reasoning:** Supabase for MVP ease (pgvector + built-in pooling out of the box); Neon confirmed as the actual production target for database branching (pairs with Environment Strategy/Git Strategy) and serverless scale-to-zero. Both vanilla Postgres — migration is a data move, not a rearchitecture.

**Status:** Confirmed, staged. **Revisit trigger:** Supabase pricing/connection limits become a real bottleneck. **Detail:** 06. Hosting Strategy

### Auth: Clerk → Ory Kratos

**Alternatives considered:** Clerk (original), Better Auth (rejected — TypeScript-only, incompatible with FastAPI), Authentik (rejected — built for enterprise internal SSO, not consumer CIAM)

**Reasoning:** Cost-at-scale and vendor lock-in were real long-term concerns; Kratos is language-agnostic (pure REST API, no FastAPI friction) and purpose-built for consumer identity. Ory Network (managed) for MVP, self-hosted later — same staged pattern as the database.

**Status:** Confirmed, staged. **Detail:** 04. Authentication

### Checkout: SellVia-hosted only for MVP

**Alternatives considered:** External-site checkout (redirect + webhook/pixel tracking, Shopify-style)

**Reasoning:** Dual-mode roughly doubles MVP engineering surface and reintroduces attribution ambiguity (cookie blocking, webhook reliability, self-reported sales) the product's trust positioning is built to eliminate.

**Status:** Confirmed for MVP. **Deferred:** external-site tracking is a named v2 item. **Detail:** 01. Money Flow

### Payments processor: Stripe Connect (superseded 2026-08-10 — see reversal below)

**Alternatives considered:** Lemon Squeezy / Paddle (Merchant of Record model — rejected at the time)

**Reasoning (original, 2026-08-03):** MoR providers assume a single seller; structurally incompatible with the three-way Merchant/Creator/Platform split this business model requires. Stripe Connect's `application_fee_amount` + `transfer_data` natively supports the split.

**Status:** Superseded. **Detail:** 01. Commission Engine, 05. Payment Flow

### Tax handling: Stripe Tax (superseded 2026-08-10 — see reversal below)

**Alternatives considered:** Merchant of Record (rejected, see above), no tooling (rejected — insufficient for multi-jurisdiction VAT/sales tax)

**Reasoning (original, 2026-08-03):** Plugs into existing Stripe Connect setup without disrupting the split architecture. Marketplace-facilitator-law liability question remains separately open pending real legal review.

**Status:** Superseded. **Detail:** 05. Tax Considerations

### Pricing model: flat 2% fee, no subscription

**Alternatives considered:** $49/mo subscription tier (original idea, dropped)

**Reasoning:** Simpler to explain ("we only make money when you do"), no billing infrastructure needed, consistent with the platform's "$0 owed until something sells" positioning.

**Status:** Confirmed. **Detail:** 05. Platform Business Model & Pricing

### Currency support: USD/EUR/GBP only, PKR dropped

**Reasoning:** Paddle doesn't support direct PKR payouts to connected accounts; would have required a separate local payout partner. Revisit only with real demand.

**Status:** Confirmed. **Detail:** 01. Business Rules

### Data consistency: Event sourcing (financial chain only) + last-write-wins (everything else)

**Alternatives considered:** Universal event sourcing (rejected — over-engineering for low-stakes data), CRDTs/Operational Transformation (rejected — no concurrent-editing feature exists in the product to justify them)

**Reasoning:** Event sourcing's audit/replay value is highest specifically for money; applying it everywhere adds complexity without payoff. LWW is sufficient for single-owner-edited data like Campaigns.

**Status:** Confirmed. **Detail:** 03. Event Sourcing (Financial Chain), 03. Database Design

### Git: Monorepo, short-lived service-prefixed feature branches

**Alternatives considered:** Two separate repos (frontend/backend), long-lived per-service branches (both rejected)

**Reasoning:** Cross-cutting changes (new endpoint + the frontend calling it) stay atomic in one PR. Long-lived branches increase risk via drift, contrary to the actual goal of minimizing risk — short branches + path-scoped CI is the safer pattern.

**Status:** Confirmed. **Detail:** 06. Git Repository Strategy

### Risk mitigation for financial-chain changes: Feature flags, not just branch strategy

**Reasoning:** Branch naming affects code review, not production exposure. A feature flag can be killed in seconds without a redeploy — the actual highest-leverage risk reduction for payments-critical changes.

**Status:** Confirmed, mandatory for any Sales/Commissions/Payouts/Refunds change. **Detail:** 06. Feature Flags Strategy

### Status page: separate domain, separate infrastructure (reversed from earlier "not needed" stance)

**Reasoning:** A status page hosted on the same infrastructure it reports on fails exactly when it's needed most. Managed tool (Instatus/Better Uptime-style), not self-hosted — same "use managed services for undifferentiated infra" pattern as Paddle/Clerk/Supabase.

**Status:** Confirmed, explicit reversal of an earlier deferral. **Detail:** 10. Status Page & Incident Communication

### AI features: API-based only, no custom training; fraud detection stays rules-based

**Reasoning:** No training data exists yet for fraud ML; a wrong ML call on real earnings is a worse failure than an over-cautious rule. All AI features (matching, screening, copy-assist) are embeddings/LLM API calls, not custom models.

**Status:** Confirmed for MVP. **Detail:** 02. AI Services

## Open Questions

None — this log is descriptive, not decision-making. Add a new entry whenever a future prompt resolves or reverses an architectural choice.

## Update (2026-08-07): MAJOR REVERSAL — Checkout Model

### Checkout: External-site tracking (REVERSES the SellVia-hosted-only decision above)

**Alternatives considered:** SellVia-hosted checkout (original MVP decision, now reversed)

**Reasoning:** Founder decided to switch to the affiliate-network model (customer buys on merchant's own site, SellVia tracks via redirect + merchant-reported sales) rather than processing payment directly. This reopens the exact trust/attribution-reliability trade-offs the original hosted-checkout decision was built to avoid (cookie blocking, merchant under-reporting risk, no direct payment witness) — a deliberate, informed trade the founder chose to make.

**New problem this created:** since SellVia never touches the payment, it needed a new money-collection mechanism. **Resolved: periodic billing** (merchant's card on file charged on a recurring cycle for accumulated commissions + platform fee), with creator payouts sequenced *after* successful billing (bill-first-then-pay, lower risk than fronting the money).

**Status:** Confirmed 2026-08-07, supersedes the earlier "SellVia Checkout only for MVP" entry above. **Detail:** 01. Money Flow, 01. Commission Engine, 01. State Machines, 05. Payment Flow — all rewritten same date.

**Still open:** merchant integration mechanism (webhook spec vs. platform-specific like Shopify first), billing cycle length, card-failure retry policy, sale-report acceptance criteria.

## Update (2026-08-10): Payments processor reversed — Paddle replaces Stripe

### Payments processor: Paddle (REVERSES the Stripe Connect / Stripe Tax decisions above)

**Alternatives considered:** Stripe Connect (original choice, now reversed), staying split (Paddle for merchant billing only + Stripe Connect for creator payouts — rejected in favor of one processor)

**Reasoning:** Founder decision to consolidate on Paddle. Under the current external-site-tracking model (reversed 2026-08-07), Stripe was already doing two jobs, not the original one it was chosen for: (1) periodically billing the merchant's card on file for accumulated commissions + platform fee, and (2) paying out individual creators. Paddle covers job (1) natively and well — it's a Merchant of Record, built exactly for billing/subscribing a customer, and Paddle Tax replaces Stripe Tax for the same multi-jurisdiction VAT/sales-tax handling this doc's original Tax entry called for.

**The open gap this creates:** job (2), paying out many independent third-party creators with their own KYC/tax-form collection, is what Stripe Connect specifically solved and what the original 2026-08-03 entry above correctly identified MoR providers as *not* built for. Paddle's marketplace/payout product ("Paddle for Platforms") is the closest fit, but it has not been evaluated against Commission Engine's payout requirements ($50 threshold, bill-first-then-pay sequencing, per-creator bank payout) — this is real, unresolved risk this reversal introduces, not a solved problem. Flagging explicitly rather than assuming parity with what Stripe Connect provided.

**Status:** Confirmed 2026-08-10, supersedes the "Payments processor: Stripe Connect" and "Tax handling: Stripe Tax" entries above. **Detail:** 01. Commission Engine, 01. Money Flow, 05. Payment Flow, 05. Wallet Design, 05. Payout Process, 05. Tax Considerations — all updated same date.

**Open question this reversal creates:** does Paddle for Platforms actually support per-creator payout the way this doc's Payout Process/Wallet Design assume Stripe Connect did — needs real evaluation before this is build-ready, not just a documentation find-and-replace.
