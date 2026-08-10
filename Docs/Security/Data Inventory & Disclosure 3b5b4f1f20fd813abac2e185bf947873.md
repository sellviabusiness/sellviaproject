# Data Inventory & Disclosure

## Purpose

A complete, accurate inventory of what SellVia actually collects, why, and where it goes — the factual foundation a real privacy policy would be built on. **This doc is technically accurate, not legally reviewed** — same status as the tax/VAT and India IT Rules items already deferred to end-of-build compliance review. The inventory itself doesn't need a lawyer to be correct; the legal disclosure language built from it does.

## What's Actually Collected, By Category

| Category | Fields | Why | Where it lives |
| --- | --- | --- | --- |
| **Account identity** | Email, `kratos_identity_id` | Login, account identification | Ory Kratos (identity), `users` table (03. Database) |
| **Merchant profile** | Business name, Paddle account ID | Operating a campaign, receiving payouts | `merchant_profiles` |
| **Creator profile** | Niche, audience size, engagement rate, Paddle account ID | Campaign matching/discovery, receiving payouts | `creator_profiles` — note: engagement rate is currently self-reported (01. Domain Model's open fraud-implication question) |
| **Transaction data** | Every Sale, Commission, Payout, refund | The product's core function — can't operate without this | `financial_events`  • projections (03. Event Sourcing) |
| **Attribution data** | Click/cart/purchase events tied to affiliate links | Commission calculation, fraud detection | `attribution_events` |
| **Payment details** | **Never stored by SellVia at all** — card data goes directly to Paddle via Elements | N/A | Paddle only (04. Security → Encryption) |
| **IP address** | Per-request, used transiently | Fraud/anomaly detection (04. IP Anomaly Detection), rate limiting | Redis (short-lived), not permanently stored |
| **Session data** | Login sessions, device info | Auth, security (multi-session limits) | Ory Kratos |
| **AI feature usage** | Which features used, token counts | Cost tracking (11. AI/Token Usage Tracking) — **not** the content of embeddings/prompts themselves beyond what's operationally necessary | `ai_usage_events` |
| **Email engagement** | Opens/bounces/unsubscribes | Deliverability (06. Email Infrastructure), suppression list compliance | Transactional/marketing ESP |
| **Uploaded files** | Product images, profile photos | Product listings, profile display | S3-compatible storage (03. File Storage) |

## Third Parties Data Is Shared With

**Being explicit here matters — "we share data with third parties" is vague; this is the actual list:**

- **Paddle** — payment/financial data, KYC information (via Paddle's own onboarding, never touching SellVia's servers)
- **Ory Network/Kratos** — identity and session data
- **Supabase/Neon** — all structured data (the database itself)
- **Cloudflare** — traffic metadata (as any CDN/WAF necessarily sees)
- **Email ESPs** (transactional + marketing, 06. Email Infrastructure) — email address, engagement data
- **AI/embeddings provider** (02. AI Services) — profile/campaign text content for matching and screening
- **Status page tool** (10. Status Page) — no user data, operational only

## The Disclosure Principle — Before, Not After

**Decided: users are told in plain language what's collected and where it goes at the point of collection, not buried in a ToS they're assumed to have read.** Concretely:

- At signup: a clear, short summary of what's collected and why — not just a link to a long legal document
- Before connecting Paddle (KYC/financial onboarding): explicit notice that this information goes to Paddle specifically, not "a payment processor"
- Before a Creator's profile feeds AI matching: notice that their profile data is used for this purpose

**This is a UX/architecture principle I can build** — disclosure happens at the right moment in the flow, in plain language, not just once at the bottom of a signup form. **The exact legal wording of what's disclosed still needs real legal review** (same deferred bucket as tax/VAT/India IT Rules) — the mechanism and timing are a design decision; the precise legal language is not something to write here.

## Open Questions

- Exact legal disclosure text — deferred to end-of-build compliance review, consistent with every other legal-language item in this documentation
- Whether a formal consent-logging mechanism (recording that a user saw and acknowledged a specific disclosure at a specific time) is needed — real question once legal counsel reviews what's actually required