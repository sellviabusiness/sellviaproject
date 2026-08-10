# SellVia — Frontend Feature List

## Purpose

Every product feature the frontend needs to support, derived exclusively from the documentation in `/Docs`. Grouped by product area. Each feature lists: description, user goal, main actions, expected frontend behavior, important states, relevant screens (see `SCREEN_INVENTORY.md`), backend/API dependencies, permissions, edge cases, and source docs.

**How to read this document:** SellVia's docs record decisions chronologically, with later "Update" sections superseding earlier text in the same file. This list reflects the **latest resolved state** as of the most recent updates (through 2026-08-07), not the original/superseded framing. Where a doc contains stale, unresolved, or contradictory statements, this is marked **"Needs clarification"** rather than guessed at. See `SITE_MAP.md` and `SCREEN_INVENTORY.md` for the navigation and screen-level counterparts to this list.

**Critical context for every feature below:** SellVia reversed its checkout model on 2026-08-07. It is now an **external-site tracking / affiliate-network model** — the customer buys on the **merchant's own website**, not on SellVia. SellVia tracks the transaction via a redirect + a tracking snippet the merchant installs + a discount-code fallback, and bills the merchant periodically (monthly) for commissions + platform fee owed, then pays creators after that billing succeeds. There is **no SellVia-hosted checkout page** and no follower-facing payment UI. Several older docs (System Architecture, Frontend Architecture, AI Agent & Machine Readability, early Backend Architecture/API Design/Session Management text) still describe the earlier hosted-checkout, Clerk-auth model and were not fully rewritten after the reversal — treat any mention of "SellVia checkout," "Clerk," or an instant per-sale Paddle split as **superseded**. Current auth provider is **Ory Kratos** (switched from Clerk 2026-08-04).

---

## 0. Cross-Cutting Platform Features

These apply across every module rather than belonging to one screen.

### 0.1 Unified Authentication (Sign Up / Log In / Session)

- **Description:** Single sign-up form; user selects Merchant or Creator role (a user may hold both roles on one account). Auth handled by Ory Kratos.
- **User goal:** Get into the product with minimal friction, on the correct role-specific path.
- **Main user actions:** Register (email/password, optionally social login — provider TBD), verify email, log in, log out, log out of all other devices, reset password.
- **Expected frontend behavior:** Ory Kratos SDK/components drive the sign-in/sign-up/session UI. Role selection branches the post-signup flow (Merchant onboarding vs. Creator onboarding). Session is server-validated (not a cached JWT) — sensitive actions re-verify live.
- **Important states:** loading (session check), unauthenticated, authenticated (role-resolved), email-unverified (gated), error (invalid credentials, account locked), MFA-challenge (if enabled).
- **Relevant screens:** Login, Register, Forgot/Reset Password, Verify Email, MFA setup/challenge.
- **API/backend dependencies:** Ory Kratos REST API (session issuance, verification, password reset, email verification); backend resolves role(s) from Kratos identity `traits`, never trusts a client-supplied role.
- **Permissions/roles:** N/A (pre-role-gating layer); role is attached to session after auth.
- **Edge cases:** Session expires at 14-day ceiling forcing re-login; 5 concurrent sessions per account (Admin may need a higher cap — unresolved); instant revocation on password change, Admin suspension, or IP-anomaly ban escalation.
- **Source:** [Security/Authentication], [Security/Session Management], [API/API Authentication], [Business Logic/User Roles].

### 0.2 Dual-Role Context Switching

- **Description:** A single account can be both Merchant and Creator. Each role has its own separate profile, data, and nav.
- **User goal:** Operate as either "hat" without the two experiences bleeding together.
- **Main user actions:** Switch active context (Merchant ↔ Creator).
- **Expected frontend behavior:** Explicit role switcher (mechanism not yet designed in docs) rather than a merged nav — Merchant nav (Campaigns/Applications/Sales/Payouts) and Creator nav (Discover/My Links/Earnings) never combine into one menu.
- **Important states:** active-context indicator; empty state if the user hasn't set up the other role yet.
- **Relevant screens:** Present in the global app shell/header of both dashboards.
- **API/backend dependencies:** Role(s) resolved server-side per request; a Merchant-context request never leaks Creator-context data and vice versa (tested explicitly per Cross-Tenant Isolation Testing).
- **Permissions/roles:** Merchant, Creator (same user, two contexts).
- **Edge cases:** Self-dealing block — a dual-role user's CreatorProfile can never apply to a Campaign owned by their own MerchantProfile (hard-blocked server-side, not just hidden in UI).
- **Source:** [Business Logic/User Roles], [UX/Navigation], [Edge Cases/User Edge Cases], [Business Logic/Business Rules].

### 0.3 Notifications

- **Description:** In-app + email notifications for key lifecycle events, kept quiet/informational (no gamification, per design philosophy).
- **User goal:** Know when something requiring attention or worth celebrating has happened, without checking manually.
- **Main user actions:** View notification feed, mark as read, click through to the relevant screen.
- **Expected frontend behavior:** Real-time or near-real-time delivery for high-trust moments (e.g., application approved → link issued) — this is one of the product's "trust moments" and should not feel delayed/black-box. Quiet visual treatment (no confetti/badges).
- **Important states:** unread/read, empty ("no notifications yet"), loading.
- **Relevant screens:** Notification center/feed (shared component across Merchant/Creator/Admin shells).
- **API/backend dependencies:** `notifications` table; triggers per Notification Logic; async job completion also notifies (`job_completed`).
- **Permissions/roles:** Scoped to the recipient `user_id` only.
- **Edge cases:** Application-rejected notification content unspecified (open question — **Needs clarification**); real-time vs. digest cadence for "sale made" unspecified (**Needs clarification**); exact merchant "milestone reached" thresholds undefined (**Needs clarification**).
- **Source:** [Business Logic/Notification Logic], [Technical Architecture/Async Job Pattern & Idempotency], [UX/Interaction Patterns].

### 0.4 Empty / Loading / Error States (Design System Requirement)

- **Description:** A calm, intentional empty-state pattern reused throughout the product, echoing the public site's own "0 creators, 0 sales, $0" zeroed-dashboard honesty device.
- **User goal:** Never mistake "nothing here yet" for "something is broken."
- **Expected frontend behavior:** Empty states read as expected/calm, not broken (e.g., "link generated, zero clicks yet"). Loading states are simple fades/skeletons, never playful spinner copy (restrained-animation design rule). Errors are specific and actionable ("You've already applied to this campaign," never "Something went wrong").
- **Relevant screens:** Every list/table view across the app (campaigns, applications, sales, payouts, links).
- **API/backend dependencies:** Structured error shape `{ "error": { "code", "message", "status" } }` from every endpoint; two-layer error handling (safe message to user, full detail to private log) — no raw stack traces ever reach the UI.
- **Source:** [UX/Components], [UX/Copy Guidelines], [API/Error Responses], [Infrastructure/Error Handling & Logging Pipeline].

### 0.5 Accessibility (Binding, Not Aspirational)

- **Description:** Full keyboard navigation, screen-reader compatibility, and verified WCAG AA color contrast across the entire product — explicitly called out as enforced pre-launch gates, not nice-to-haves.
- **Expected frontend behavior:** Logical tab order; visible focus rings (lime accent, consistent with the design system's "active state" use of lime); all custom interactive components (campaign filters, the "Get Link" component, status badges with actions) independently verified for keyboard operability — shadcn/ui defaults aren't assumed sufficient; all form fields have real associated labels (no placeholder-only labels); `aria-describedby`/`aria-invalid` on validation errors; all meaningful images have alt text (including product images — schema currently lacks an alt-text field, flagged as a gap); icon-only controls get `aria-label`; async status changes use `aria-live`.
- **Important open risk:** Lime (#BFFF13) as **text** color has not been contrast-verified against WCAG AA (4.5:1 body / 3:1 large-text) — if it fails, lime must be restricted to backgrounds/borders/icons only, never body copy. Gray 01/02 muted text also unverified. **Needs clarification/verification before broad launch.**
- **Source:** [UX/Accessibility], [Security/Security Checklist].

### 0.6 Machine-Readability of Public Content (SEO / AI-Agent Legibility)

- **Description:** Public Campaign/Offer pages carry `schema.org` `Product`/`Offer` JSON-LD; semantic HTML landmarks; OpenAPI spec auto-generated from the backend; `llms.txt` at the marketing site root; deliberate `robots.txt` allowing known AI crawlers on public pages only.
- **User goal (indirect):** Let AI shopping agents, search AI answers, and link-preview tools understand SellVia's public campaigns correctly.
- **Expected frontend behavior:** Every public Campaign/Offer detail page renders JSON-LD with accurate price/currency/availability. Standard OG/Twitter-card/canonical-URL meta tags on all public pages, generated from the base page template.
- **What does NOT get this treatment:** Authenticated dashboards, any tenant-private data — same boundary as accessibility, but for machines instead of humans.
- **Note:** This doc's own phrasing ("SellVia's whole checkout now lives on SellVia's own hosted page") is **stale** — checkout no longer happens on SellVia at all post-reversal; the *public campaign detail page* is what carries this markup now, not a checkout page.
- **Source:** [UX/AI Agent & Machine Readability].

### 0.7 AI-Assisted Features

| Feature | What it does | User-facing surface | Notes |
| --- | --- | --- | --- |
| Creator↔Campaign matching | Ranks campaign discovery results by embedding similarity on top of existing category/commission filters | Creator discovery/browse screen | Post-MVP per some docs, but described as an "initial AI level" item elsewhere — **Needs clarification on MVP vs. post-MVP timing** |
| Application screening assist | One LLM-generated plain-language fit summary per application, cached, shown to the reviewing Merchant | Merchant application review screen | Never shown to any other Merchant (tenant-private) |
| Campaign copy assist | Merchant provides product name + price; LLM drafts an editable campaign description | Merchant campaign creation form | Draft is editable, not final |
| Disclosure nudge | Fixed, legally-reviewed FTC disclosure template shown at link-generation time | Creator "Get Link" moment | Deliberately templated, NOT LLM-generated (legal text) |

- **Source:** [Technical Architecture/AI Services], [Product Foundation/MVP Scope], [Security/Tenant Isolation Audit].

---

## 1. Public Marketing & Discovery

### 1.1 Marketing Site (wesellvia.com)

- **Description:** The existing live public site — hero, concept walkthrough, roadmap-stage visibility, FAQ, waitlist form. Deliberately shows zeroed real metrics ("0 creators approved, 0 sales, $0 tracked revenue") as a radical-transparency positioning device, not a placeholder.
- **User goal:** Understand what SellVia is, see it's early/honest, and join the waitlist.
- **Main user actions:** Read hero/roadmap/FAQ, submit waitlist form (business or creator, "why do you want to join").
- **Expected frontend behavior:** Nav: logo left, links center/right ("How It Works," "For Businesses," "For Creators"), single "Join Waitlist" CTA — no dropdowns, no mega menus. Zeroed-metric device persists into early product messaging.
- **Important states:** waitlist form submitted (confirmation), roadmap stage indicator ("you are literally here" — currently Stage 02: Validation).
- **Relevant screens:** Public Home / Landing.
- **API/backend dependencies:** Waitlist signup endpoint (implied, not explicitly specified in Endpoint Specifications — **Needs clarification**).
- **Permissions/roles:** Public, unauthenticated.
- **Edge cases:** None documented beyond standard form validation.
- **Source:** [Product Foundation/Product Vision], [Product Foundation/Product Roadmap], [UX/Design System], [UX/Navigation].

### 1.2 Public Campaign Discovery / Browse

- **Description:** Browsable, filterable list of live campaigns — the entry point for creators (and, per the AI-agent doc, for machine consumption of public product data).
- **User goal:** Find a campaign/product worth promoting.
- **Main user actions:** Filter by category (digital/physical), commission-rate range, niche; sort by newest, highest commission, most applications (popularity proxy).
- **Expected frontend behavior:** No dedicated search engine for MVP — structured DB filtering/sorting only. Public, no auth required to view.
- **Important states:** loading, empty ("no live campaigns match these filters"), error.
- **Relevant screens:** Public/Creator Campaign Discovery list, Public Campaign/Offer detail page.
- **API/backend dependencies:** `GET /campaigns` (public, filterable).
- **Permissions/roles:** Public read; apply action requires Creator auth.
- **Edge cases:** Post-MVP AI-assisted semantic matching layers on top of this same filtering, doesn't replace it.
- **Source:** [Technical Architecture/Search Strategy], [API/Endpoint Specifications], [Business Logic/User Flows].

### 1.3 Public Campaign / Offer Detail Page

- **Description:** The public page for a single campaign/product — name, price, commission rate, merchant, `schema.org` markup.
- **User goal (creator):** Decide whether to apply. **User goal (buyer via a shared link):** Land here or get redirected onward to the merchant's own product page.
- **Main user actions:** View details; (creator, authenticated) apply.
- **Expected frontend behavior:** Carries `Product`/`Offer` JSON-LD. **Note:** since checkout no longer lives on SellVia, this page is informational/discovery, not a checkout entry point — a shared AffiliateLink resolves through `GET /go/:slug`, which redirects to the **merchant's own site**, not to this page's checkout.
- **Important states:** loading, not-found/ended campaign.
- **Relevant screens:** Public Campaign/Offer detail.
- **API/backend dependencies:** `GET /affiliate-links/:slug` (public), `GET /go/:slug` (public redirect + click logging).
- **Permissions/roles:** Public.
- **Edge cases:** Campaign ended — clicks after end date attribute nothing; clicks before end date still honored within the 30-day window.
- **Source:** [UX/AI Agent & Machine Readability], [API/Endpoint Specifications], [Business Logic/State Machines].

---

## 2. Onboarding & Account Setup

### 2.1 Role Selection & Signup Branching

- **Description:** After the unified signup form, the flow branches based on chosen role(s).
- **User goal:** Get to the correct next step (Offer creation vs. campaign browsing) without extra clicks.
- **Main user actions:** Choose Merchant, Creator, or both.
- **Expected frontend behavior:** Minimal-field, low-friction form; contextual hiding of irrelevant fields per role (a digital-goods Merchant never sees a shipping field).
- **Relevant screens:** Register, Role Selection (may be same screen).
- **Edge cases:** No follower-count floor for Creator eligibility (merit/fit-based, decided).
- **Source:** [Business Logic/User Flows], [Business Logic/User Roles], [UX/Interaction Patterns].

### 2.2 Merchant Onboarding: Paddle Setup

- **Description:** Merchant connects payment infrastructure before any campaign can go live.
- **User goal:** Get campaigns able to bill/receive funds correctly.
- **Main user actions:** Complete Paddle onboarding step (add card on file via Paddle Checkout (saved payment method) for periodic billing).
- **Expected frontend behavior:** This is the **only remaining Paddle Checkout surface on SellVia's own frontend** (post-reversal) — there is no follower-facing checkout to build. Gate: a Campaign cannot go `draft → live` until this is complete.
- **Important states:** not started, in progress, complete, Paddle-restricted (auto-pauses all live campaigns, merchant notified with reason + link to update card).
- **Relevant screens:** Merchant Billing Card Setup / Settings.
- **API/backend dependencies:** Paddle Checkout flow; `merchant_profiles.paddle_customer_id`.
- **Permissions/roles:** Merchant only, own account.
- **Edge cases:** **Needs clarification** — docs are internally inconsistent on whether merchants still need full Paddle **Connect** (KYC/Express) onboarding post-reversal, or only a card-on-file SetupIntent for billing. `merchant_profiles` retains both `paddle_customer_id` (billing) and a seemingly-vestigial `paddle_seller_id` ("for merchants who also want to receive payouts through SellVia for something else, not for the sale itself") — the actual merchant onboarding UI requirement should be confirmed before building this screen. Card failure → 3 failed billing attempts over 3 days → auto-suspend live campaigns.
- **Source:** [Product Foundation/MVP Scope], [Business Logic/State Machines], [Database/Table Specifications], [Edge Cases/Business Edge Cases], [Technical Architecture/Frontend Architecture].

### 2.3 Merchant Onboarding: Tracking Snippet Install

- **Description:** Merchant installs a universal tracking snippet (one script tag) on their order-confirmation page — this is what reports sales back to SellVia.
- **User goal:** Get attribution working so sales are tracked and commissions calculated.
- **Main user actions:** Copy snippet, paste into their site, trigger verification.
- **Expected frontend behavior:** Campaign cannot go `draft → live` until SellVia verifies the snippet is installed (test ping/handshake). Also: creating a unique discount code in the merchant's own store during campaign setup (fallback attribution signal).
- **Important states:** not installed, verifying, verified, failed-verification.
- **Relevant screens:** Merchant Campaign Setup (snippet install step), possibly a dedicated onboarding screen.
- **API/backend dependencies:** Snippet verification ping endpoint (not explicitly named in Endpoint Specifications — **Needs clarification**); `POST /webhooks/merchant-sales`.
- **Permissions/roles:** Merchant only, own campaigns.
- **Edge cases:** Exact UX for this step (copy-paste instructions vs. guided setup vs. automated verification ping) is explicitly **undesigned** — **Needs clarification**.
- **Source:** [Payments/Payment Flow], [Business Logic/State Machines], [Technical Architecture/Frontend Architecture], [Business Logic/Domain Model].

### 2.4 Creator Onboarding: Paddle

- **Description:** Creator connects a Paddle seller account to receive payouts.
- **User goal:** Be able to actually get paid once commissions accrue.
- **Main user actions:** Complete Paddle seller onboarding (KYC, bank details).
- **Expected frontend behavior:** A Creator approved for a campaign but with incomplete Paddle onboarding must **not** get an active AffiliateLink yet — block link activation entirely rather than accruing unpayable commission.
- **Important states:** not started, in progress, complete, incomplete-blocking-link.
- **Relevant screens:** Creator Payout Setup / Settings.
- **API/backend dependencies:** Paddle seller onboarding; `creator_profiles.paddle_seller_id`; `seller.updated` webhook.
- **Permissions/roles:** Creator only, own account.
- **Edge cases:** Onboarding-incomplete gate is resolved as hard-block (not "link works but payout held").
- **Source:** [Edge Cases/User Edge Cases], [Technical Architecture/Backend Architecture], [Payments/Tax Considerations].

---

## 3. Merchant Module

### 3.1 Offer Management

- **Description:** A Merchant's product listing — name, price, currency, category (digital/physical).
- **User goal:** List a product so a campaign can be built around it.
- **Main user actions:** Create Offer, edit Offer, (implicitly) archive/delete via soft delete.
- **Expected frontend behavior:** Minimal required fields; category selection hides irrelevant fields (e.g., no shipping field for digital). No multi-page wizard.
- **Important states:** empty ("no offers yet"), loading, error, success (created).
- **Relevant screens:** Offers list, Create/Edit Offer.
- **API/backend dependencies:** `offers` table; no dedicated Offer endpoints explicitly listed in Endpoint Specifications beyond what Campaigns imply — **Needs clarification** (Domain Model flags an open question: does Offer need its own entity separate from Campaign, or one active campaign per offer?).
- **Permissions/roles:** Merchant (own only); Admin (any, for moderation).
- **Edge cases:** Product image auto-fetch from a URL is a deferred v2 convenience — manual upload only for MVP.
- **Source:** [Business Logic/Domain Model], [Business Logic/User Flows], [Database/Table Specifications], [Technical Architecture/File Storage].

### 3.2 Campaign Creation & Management

- **Description:** A listing of an Offer with a commission rate attached, open for creators to apply to.
- **User goal:** Get a product in front of creators with a clear commission offer.
- **Main user actions:** Set commission rate (merchant-set freely, no platform min/max, no bargaining), publish, pause, resume, end.
- **Expected frontend behavior:** Very few steps to go live (commission rate, product info, publish — no wizard). `draft → live` blocked until **both** gates pass: Paddle onboarding complete AND tracking snippet verified. Editing commission rate mid-flight does not require re-consent from already-approved creators (they keep their locked rate); new applicants see the new rate.
- **Important states:** draft, live, paused, ended; each gate's pass/fail state visible before publish is attempted.
- **Relevant screens:** Campaigns list, Create/Edit Campaign, Campaign detail.
- **API/backend dependencies:** `POST /campaigns`, `PATCH /campaigns/:id`, `PATCH /campaigns/:id/status`.
- **Permissions/roles:** Merchant (own campaigns only); Admin (any, moderation/vetting override).
- **Edge cases:** Paused campaigns keep honoring in-flight attribution within the 30-day window, accept no new applications; ended campaigns stop attributing new clicks immediately but honor pre-end clicks within the window; high-commission/high-risk campaigns require Admin vetting before going live (raw-data-doc concept, thresholds undefined — **Needs clarification**); Paddle-restriction auto-pauses all live campaigns.
- **Source:** [Business Logic/State Machines], [Business Logic/Business Rules], [UX/Interaction Patterns], [Operations/Admin Panel].

### 3.3 Application Review

- **Description:** Merchant reviews creator applications to their campaigns and approves/rejects.
- **User goal:** Choose the right creators for the campaign.
- **Main user actions:** View applicant's audience/niche/engagement data (+ AI-generated fit summary), approve, reject.
- **Expected frontend behavior:** Approval **immediately** surfaces the generated AffiliateLink to the Creator (real-time-feeling, not delayed-email-only) — described as one of the product's core "trust moments."
- **Important states:** pending, approved, rejected; empty ("no applications yet"); pending-count indicator.
- **Relevant screens:** Applications list (per campaign), Application review card/detail.
- **API/backend dependencies:** `POST /campaigns/:id/applications` (creator-initiated), `GET /campaigns/:id/applications`, `PATCH /applications/:id` (approve/reject, triggers AffiliateLink creation).
- **Permissions/roles:** Merchant (own campaigns only); Admin (moderation override).
- **Edge cases:** Rejected applicants cannot resurrect the old application, only submit a new one; whether merchants see aggregate creator performance platform-wide or only the applicant's own submitted stats is unresolved (**Needs clarification**); self-dealing applications blocked server-side before reaching this queue.
- **Source:** [Business Logic/State Machines], [Business Logic/Permission Matrix], [UX/Components], [Business Logic/Business Rules].

### 3.4 Sales Visibility

- **Description:** Merchant's view of sales reported and attributed to their campaigns.
- **User goal:** See what's selling and confirm commissions are calculating correctly.
- **Main user actions:** View sale list, filter/sort, view acceptance status.
- **Expected frontend behavior:** Shows `acceptance_status` (accepted/rejected) rather than the old verified/pending framing. Never served from cache — always live.
- **Important states:** accepted, rejected (flagged for Admin review, not silently dropped), empty, loading.
- **Relevant screens:** Sales list (Merchant), Sale detail/receipt.
- **API/backend dependencies:** `GET /sales` (scoped to own).
- **Permissions/roles:** Merchant (own only); Admin (any).
- **Edge cases:** A merchant under-reporting sales is a fraud vector the reversal introduced — flagged/reconciled at the platform level, not something the merchant UI directly exposes.
- **Source:** [API/Endpoint Specifications], [Security/Fraud Prevention], [Technical Architecture/Caching Strategy].

### 3.5 Billing (Periodic Merchant Billing)

- **Description:** Merchant's billing-cycle history and card-on-file management — replaces the old idea of a live per-sale split.
- **User goal:** Understand what's owed and confirm the right card is on file.
- **Main user actions:** View billing cycle history/totals, update card on file.
- **Expected frontend behavior:** Monthly billing cycles; on 3 consecutive failed charge attempts (immediate, +24h, +48h), campaigns auto-pause and merchant is shown a clear reason + path to update the card.
- **Important states:** open, pending_charge, charged, failed (with retry count visible), card-update-needed.
- **Relevant screens:** Billing Cycles / Billing History, Billing Card Settings.
- **API/backend dependencies:** `GET /billing-cycles` (scoped to own).
- **Permissions/roles:** Merchant (own only).
- **Edge cases:** Failed billing accumulates rather than losing sales; creator commission for that cycle stays unpaid until resolved (bill-first-then-pay).
- **Source:** [Payments/Payment Flow], [Business Logic/State Machines], [Database/Table Specifications].

### 3.6 Refund Credit Request

- **Description:** Merchant requests a billing credit for a sale that was already tracked/billed/paid out, when their own customer got a refund on the merchant's site.
- **User goal:** Not be billed for a sale that was refunded to the end customer.
- **Main user actions:** Submit a credit request for a specific sale, optionally partial.
- **Expected frontend behavior:** Capped at 5 credits/calendar month; proportional credit for partial refunds; beyond the cap, no further credit (clear messaging why).
- **Important states:** credits-remaining-this-month counter, submitted, applied-to-next-cycle, cap-reached (disabled state with explanation).
- **Relevant screens:** Sale detail (Merchant) → Request Refund Credit action; possibly a dedicated Refund Requests list.
- **API/backend dependencies:** No explicit endpoint named in Endpoint Specifications — **Needs clarification** ("UI/API for how a merchant actually submits a credit request — not yet designed").
- **Permissions/roles:** Merchant (own sales only).
- **Edge cases:** Creator commission is never clawed back regardless — SellVia absorbs the cost within the cap.
- **Source:** [Payments/Refund Handling].

### 3.7 Merchant Profile / Business Settings

- **Description:** Business name, category, and account-level settings.
- **User goal:** Keep business info accurate.
- **Main user actions:** Edit business name/profile fields.
- **Relevant screens:** Merchant Settings / Business Profile.
- **API/backend dependencies:** `merchant_profiles` table (last-write-wins conflict resolution, not event-sourced).
- **Permissions/roles:** Merchant, own profile only.
- **Source:** [Business Logic/Domain Model], [Database/Database Design].

---

## 4. Creator Module

### 4.1 Campaign Discovery (Authenticated)

- **Description:** Same underlying discovery/filter system as the public browse page, in-app for logged-in creators applying.
- **User goal:** Find campaigns that fit their audience/niche.
- **Main user actions:** Filter (category, commission range, niche), sort, apply.
- **Expected frontend behavior:** Post-MVP: AI similarity ranking layered on top of filters (timing unresolved — **Needs clarification**).
- **Important states:** loading, empty, already-applied indicator per campaign.
- **Relevant screens:** Creator Discovery/Browse.
- **API/backend dependencies:** `GET /campaigns` (public endpoint, same as marketing-site browse, called in an authenticated context here).
- **Permissions/roles:** Creator (apply action); public (browse).
- **Source:** [Business Logic/User Flows], [Technical Architecture/Search Strategy].

### 4.2 Application Submission

- **Description:** Creator applies to a specific campaign, with audience info attached.
- **User goal:** Get approved to promote a product.
- **Main user actions:** Submit application (audience snippet — niche, audience size, engagement rate).
- **Expected frontend behavior:** One application per (campaign, creator) pair — duplicate attempt returns a clear 409 error, not a generic failure. Rate-limited per Creator account to prevent spam-applying.
- **Important states:** submitting, submitted/pending, error (duplicate, self-dealing block, rate-limited).
- **Relevant screens:** Campaign detail (Apply action), My Applications list.
- **API/backend dependencies:** `POST /campaigns/:id/applications`.
- **Permissions/roles:** Creator only.
- **Edge cases:** Self-dealing block (own campaign, if dual-role); audience/niche data is self-reported and currently unverifiable (open fraud-implication question).
- **Source:** [Business Logic/Business Rules], [Database/Constraints], [Security/Rate Limiting], [Edge Cases/Creator Edge Cases].

### 4.3 My Applications

- **Description:** Creator's view of their own application statuses.
- **User goal:** Track where each application stands.
- **Expected frontend behavior:** pending / approved / rejected states clearly shown; whether/how a rejection reason is communicated is unresolved (**Needs clarification**).
- **Relevant screens:** My Applications list.
- **API/backend dependencies:** Scoped read of `applications` (no dedicated endpoint explicitly named beyond the campaign-scoped one — **Needs clarification** on a creator-facing "my applications across all campaigns" endpoint).
- **Permissions/roles:** Creator, own only.
- **Source:** [Business Logic/State Machines], [Business Logic/Notification Logic].

### 4.4 My Links (AffiliateLinks)

- **Description:** The unique trackable link (+ discount code) issued on approval.
- **User goal:** Get and share the promotional link/code.
- **Main user actions:** Copy link, copy discount code, share.
- **Expected frontend behavior:** The "Get Link" moment should feel like a small, clear payoff, given how central it is to the product's trust story. Disclosure-nudge template shown at this moment (fixed legal text, not AI-generated). Only one link per approved application (no regenerating to obscure attribution).
- **Important states:** link generated/zero clicks yet (calm empty state, not "broken"), active, campaign-ended (link stops attributing new activity).
- **Relevant screens:** My Links list, Link detail (click/cart/purchase timeline).
- **API/backend dependencies:** `GET /affiliate-links/:slug` (public resolution endpoint); link data scoped to the owning creator for the dashboard view.
- **Permissions/roles:** Creator, own links only.
- **Source:** [UX/Components], [Business Logic/Domain Model], [Business Logic/Business Rules], [Payments/Payment Flow].

### 4.5 Earnings / Wallet

- **Description:** Running balance of accrued-but-not-yet-paid-out commission, plus payout history.
- **User goal:** Know how much they've earned and when they'll get paid.
- **Main user actions:** View balance, view progress toward the $50 payout threshold, view payout history.
- **Expected frontend behavior:** Balance only includes commissions whose BillingCycle has reached `charged` — pre-billing commission is "owed" but not yet in the spendable/displayed wallet balance. Never cached — always live. Currency conversion shown clearly if creator's payout currency differs from the sale's (to avoid looking like a bug).
- **Important states:** accruing (below $50), threshold-crossed (payout pending), processing, paid, failed-retrying.
- **Relevant screens:** Earnings/Wallet dashboard, Payout history detail.
- **API/backend dependencies:** `GET /payouts` (scoped to own); `creator_profiles.wallet_balance_cents` (read-model synced via webhook).
- **Permissions/roles:** Creator, own only.
- **Edge cases:** No client-facing "trigger payout" action (fully automatic/threshold-based); one-time manual below-threshold payout allowed only on account closure (proposed default); a refund after a creator has already been paid is a real, accepted platform loss, never clawed back from the creator.
- **Source:** [Payments/Wallet Design], [Payments/Payout Process], [Business Logic/State Machines], [Edge Cases/Payment Edge Cases].

### 4.6 Creator Profile Settings

- **Description:** Niche, audience size, engagement rate, and payout account status.
- **User goal:** Keep profile accurate so merchants can evaluate fit.
- **Main user actions:** Edit niche/audience info.
- **Relevant screens:** Creator Settings / Profile.
- **API/backend dependencies:** `creator_profiles` table.
- **Permissions/roles:** Creator, own profile only.
- **Edge cases:** Whether engagement_rate is self-reported vs. platform-calculated is an open fraud-relevant question — **Needs clarification** before deciding if this field is editable or read-only/derived.
- **Source:** [Business Logic/Domain Model], [Edge Cases/Creator Edge Cases].

---

## 5. Admin Module

*All Admin screens live under a fully separate `/admin/*` namespace, never exposed in regular Merchant/Creator navigation. Single flat Admin role for MVP (no tiering).*

### 5.1 Moderation Queue

- **Description:** Flagged sales/applications/accounts from rules-based fraud detection, awaiting human review.
- **User goal (Admin):** Resolve flags — clear false positives, act on real fraud.
- **Main user actions:** Review flag reason (velocity, self-referral, conversion outlier, device fingerprinting, merchant under-reporting pattern), clear or act (suspend, reverse a sale, ban).
- **Expected frontend behavior:** Every action logged to the Audit Log (who, what, outcome).
- **Important states:** flagged/unreviewed, cleared, actioned.
- **Relevant screens:** Moderation Queue, Flagged Item detail.
- **API/backend dependencies:** `GET /admin/flagged`.
- **Permissions/roles:** Admin only.
- **Source:** [Operations/Moderation], [Security/Fraud Prevention], [Business Logic/Permission Matrix].

### 5.2 Campaign Vetting

- **Description:** High-commission or high-risk campaigns awaiting approval before going live.
- **User goal:** Approve/reject before a risky campaign reaches creators.
- **Main user actions:** Approve, reject.
- **Relevant screens:** Campaign Vetting Queue.
- **API/backend dependencies:** `POST /admin/campaigns/:id/vet`.
- **Permissions/roles:** Admin only.
- **Edge cases:** Exact vetting trigger thresholds undefined — **Needs clarification**.
- **Source:** [Operations/Admin Panel], [Business Logic/Business Rules].

### 5.3 User Management

- **Description:** View/suspend Merchant or Creator accounts; view a user's history for support/moderation purposes only.
- **Main user actions:** View user detail, suspend/ban.
- **Expected frontend behavior:** Suspension instantly revokes the user's sessions.
- **Relevant screens:** User Management list, User detail.
- **API/backend dependencies:** `POST /admin/users/:id/suspend`.
- **Permissions/roles:** Admin only.
- **Edge cases:** No formal appeals process designed yet (handled case-by-case via support) — **Needs clarification**.
- **Source:** [Operations/Admin Panel], [Operations/Moderation], [Security/Session Management].

### 5.4 Refund / Dispute (Chargeback) Handling

- **Description:** Manual refund-credit review and chargeback evidence submission.
- **Main user actions:** Approve/deny refund credit requests, submit chargeback evidence to Paddle.
- **Important states:** SellVia absorbs a merchant's first 5 lost disputes (lifetime counter); merchant pays from the 6th onward.
- **Relevant screens:** Refund/Dispute Handling queue.
- **API/backend dependencies:** Not explicitly named in Endpoint Specifications — **Needs clarification**.
- **Permissions/roles:** Admin only.
- **Edge cases:** Who submits chargeback evidence (SellVia vs. merchant) is unresolved — **Needs clarification**.
- **Source:** [Payments/Chargebacks], [Payments/Refund Handling], [Operations/Admin Panel].

### 5.5 Reconciliation Review

- **Description:** Surfaces mismatches between internal records and Paddle for manual investigation.
- **Main user actions:** Review flagged mismatch, investigate, resolve.
- **Important caveat:** Under the external-tracking model, reconciliation can verify the billing/payout legs against Paddle, but can no longer independently confirm the underlying sale happened as reported — that trust now rests entirely on Fraud Prevention's merchant-reporting checks.
- **Relevant screens:** Reconciliation Review queue.
- **API/backend dependencies:** Daily automated reconciliation job surfaces results here; endpoint not explicitly named — **Needs clarification**.
- **Permissions/roles:** Admin only.
- **Source:** [Payments/Reconciliation], [Operations/Admin Panel].

### 5.6 Waitlist → Beta Invitation Management

- **Description:** Manages the Private Beta cohort (currently capped 10–25, manually curated for the first cohort, fully automatic/signup-order after).
- **Main user actions:** Review waitlist, curate/invite first cohort, monitor automatic invitations thereafter.
- **Relevant screens:** Waitlist Management.
- **Permissions/roles:** Admin only.
- **Edge cases:** Beachhead niche/vertical for the first cohort still undecided — **Needs clarification**.
- **Source:** [Product Foundation/Product Roadmap], [Operations/Admin Panel].

### 5.7 At-Risk New Users View

- **Description:** Accounts that hit the 48-hour churn threshold without completing their core activation action (Merchant: publish first campaign; Creator: submit first application).
- **User goal:** Give the founder/Admin visibility into who's stalling, distinct from the fraud queue.
- **Relevant screens:** At-Risk Users view (within Admin Panel).
- **API/backend dependencies:** `activation_nudges` table.
- **Permissions/roles:** Admin only.
- **Source:** [Analytics/Activation, Aha Moment & Churn Signals], [Operations/Admin Panel].

### 5.8 Founder AI Command Console

- **Description:** Founder-only natural-language interface over the entire Admin surface — every tool wraps an existing, already-permission-checked Admin API endpoint; never raw DB access.
- **User goal:** Query/act on admin data without navigating multiple screens.
- **Main user actions:** Ask a question (read, executes directly), issue a write command (requires explicit confirmation, every time, no exceptions), request a product-change spec (drafted only, never auto-executed/deployed).
- **Expected frontend behavior:** Fail-closed on ambiguity — asks for clarification rather than guessing. Every AI-console action logged with `initiated_via: ai_console`.
- **Important states:** answering, awaiting-confirmation (for write actions), executed, clarification-needed.
- **Relevant screens:** AI Command Console (chat-style interface).
- **Permissions/roles:** Admin/Founder only.
- **Edge cases:** Whether this ships MVP or post-MVP is an explicit open call — **Needs clarification**.
- **Source:** [Operations/Founder AI Command Console], [Operations/Live Production Access for Support], [Database/Audit Log Design].

### 5.9 Support Tooling (Console-Assisted)

- **Description:** Ticket context lookup and per-feature playbook retrieval, used by the founder/Admin when handling support requests.
- **Main user actions:** Pull a user's recent activity in one view, retrieve the relevant support playbook.
- **Relevant screens:** Likely part of User Management detail or the AI Command Console, not necessarily a separate screen — **Needs clarification** on whether this needs dedicated UI.
- **Permissions/roles:** Admin only.
- **Source:** [Operations/Live Production Access for Support], [Operations/Per-Feature Support Playbooks], [Operations/Support Tiers].

### 5.10 Admin Analytics (Marketplace Health, P&L, Unit Economics)

- **Description:** Founder/Admin dashboards for marketplace health, funnels, time-to-payout, monthly P&L, unit economics, AI/token cost.
- **Main user actions:** View KPI trends, review the automated monthly P&L report, review per-feature AI cost.
- **Important states:** finalized vs. draft P&L report (recommend a "finalized" flag so historical reports don't silently change).
- **Relevant screens:** Admin/Founder Dashboard (marketplace health + funnels), Monthly P&L report, Unit Economics view.
- **API/backend dependencies:** `monthly_pnl_reports`, `ai_usage_events`, `infra_costs` tables; `get_pnl(month)` console tool.
- **Permissions/roles:** Admin only.
- **Source:** [Analytics/Dashboards], [Analytics/KPIs], [Analytics/Automated Monthly P&L], [Analytics/Unit Economics], [Analytics/AI Token Usage Tracking].

---

## 6. Shared Dashboard Analytics (Merchant & Creator)

### 6.1 Merchant Analytics

- **Description:** Per-merchant campaign performance: clicks, conversion, sales, spend; exportable reports.
- **Expected frontend behavior:** Simple charts, no data-viz flourishes ("clarity over excitement"); heavy/slow exports run as async jobs (notification on completion, not a spinner).
- **Relevant screens:** Merchant Dashboard home, Campaign performance detail, Export flow.
- **API/backend dependencies:** `POST /jobs/export`, `GET /jobs/:id`.
- **Permissions/roles:** Merchant, own data only.
- **Source:** [Analytics/Dashboards], [Technical Architecture/Async Job Pattern & Idempotency].

### 6.2 Creator Analytics

- **Description:** Per-creator link performance: impressions/clicks/sales, earnings trend toward the $50 threshold.
- **Relevant screens:** Creator Dashboard home.
- **Permissions/roles:** Creator, own data only.
- **Source:** [Analytics/Dashboards].

---

## 7. Customer Support (User-Facing)

### 7.1 Support Contact

- **Description:** In-app support link/contact form for logged-in Merchants/Creators; email support otherwise.
- **User goal:** Get help when something's wrong (payout delay, rejected application, suspected double charge, disputed clawback).
- **Expected frontend behavior:** Clear, specific error/status copy so common cases (e.g., normal 2–7 day bank transfer window) don't look like failures.
- **Relevant screens:** Support/Help contact form or link (likely footer/nav-level, not a full dashboard section).
- **Permissions/roles:** Any authenticated user.
- **Edge cases:** No formal SLA — founder-handled through Private Beta.
- **Source:** [Operations/Customer Support Flows], [Operations/Support Tiers].

### 7.2 Account Deletion Request

- **Description:** User-initiated account deletion with a 14-day cancellable grace period.
- **User goal:** Delete their account/data.
- **Main user actions:** Request deletion, cancel within grace period.
- **Expected frontend behavior:** Clear confirmation step naming what happens (PII anonymized, financial-chain skeleton retained, sessions revoked, product images removed immediately with placeholders shown on any referencing campaign).
- **Important states:** requested/counting-down, cancelled, processing, completed.
- **Relevant screens:** Account Settings → Delete Account flow.
- **API/backend dependencies:** Async deletion job (Async Job Pattern).
- **Permissions/roles:** Any authenticated user, own account only.
- **Source:** [Security/Data Retention Policy Engine].

### 7.3 Data Disclosure Notices

- **Description:** Plain-language notices at the point of data collection (signup, before Paddle connection, before AI-matching use of profile data) — not buried in a ToS.
- **Expected frontend behavior:** Short, contextual, timed notices woven into the relevant flow (signup form, Paddle-connect step, profile-completion step for creators).
- **Relevant screens:** Embedded in Signup, Paddle Onboarding, Creator Profile Settings — not a standalone screen.
- **Source:** [Security/Data Inventory & Disclosure].

---

## Feature-Level "Needs Clarification" Summary

For quick reference, every open item flagged above:

1. Admin role's full formal scope (used broadly throughout but never explicitly ratified).
2. Waitlist signup endpoint not explicitly specified.
3. Whether Offer needs its own entity vs. one-campaign-per-offer.
4. Merchant Paddle requirement post-reversal: full Connect/KYC onboarding vs. card-on-file SetupIntent only.
5. Exact UX for the tracking-snippet install step (copy-paste vs. guided vs. auto-verify).
6. Application-rejection notification content/whether a reason is shown.
7. Real-time vs. digest cadence for "sale made" / merchant notifications.
8. Exact merchant "milestone reached" thresholds.
9. Whether merchants see platform-wide aggregate creator performance or only per-applicant stats.
10. High-commission/high-risk campaign vetting thresholds.
11. UI/API for merchant refund-credit request submission.
12. Who submits chargeback dispute evidence (SellVia vs. merchant).
13. Formal account-suspension appeals process.
14. Timing of AI-based creator↔campaign matching (MVP vs. post-MVP).
15. Whether engagement_rate is self-reported or platform-calculated.
16. Whether Founder AI Command Console ships MVP or post-MVP.
17. Whether support-ticket-context tooling needs dedicated UI or lives inside User Management/AI Console.
18. Lime-as-text WCAG AA contrast — unverified, real risk.
19. Alt-text field missing from product image schema.
20. Beachhead niche/vertical for the first Private Beta cohort.

---

## Cross-References

- Screens implementing these features: `SCREEN_INVENTORY.md`
- Navigation/routes these features live at: `SITE_MAP.md`
