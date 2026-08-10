# SellVia — Frontend Screen Inventory

## Purpose

Every screen the frontend needs to design/implement, derived from `/Docs`. Cross-references `FEATURE_LIST.md` (feature detail) and `SITE_MAP.md` (route source/[Explicit] vs. [Inferred] status — routes are not repeated in full here, see that doc).

## Global Notes That Apply to Every Screen Below

- **Design system (binding):** black `#000000` background, lime `#BFFF13` accent used sparingly (primary CTA/highlights/focus only, never large blocks), white/gray text hierarchy, Outfit (headlines/CTAs) + Figtree (body/labels), no gradients/glassmorphism/glow, thin borders not shadows, 10–12px radii, restrained animation (fades/opacity/2–4px movement only). Source: `UX/Design System`.
- **Responsive:** Web-responsive only for MVP (no native mobile app). 12-column desktop grid per `Technical Architecture/Frontend Architecture`; specific breakpoints not documented — **Needs clarification**.
- **Accessibility (every screen):** full keyboard operability, visible focus rings (lime), proper form labels + ARIA, `aria-live` on async status changes, verified WCAG AA contrast. See `FEATURE_LIST.md` §0.5.
- **Loading states:** simple fades/skeletons, never a playful spinner.
- **Error states:** structured, specific, actionable copy; never a raw stack trace or generic "something went wrong."
- **Empty states:** calm and expected-looking, consistent with the product's own "0 creators, 0 sales, $0" honesty device — never look broken.
- **UI is not a trust boundary:** every action shown/hidden per role in these screens is a UX convenience only — the backend independently re-checks permissions on every request regardless of what a screen renders.

---

## A. Public Marketing & Discovery

### A1. Public Home (Marketing Landing)

- **Purpose:** Explain SellVia, show radical-transparency positioning (zeroed real metrics), collect waitlist signups.
- **Route:** `/` — [Explicit]
- **Access:** Public.
- **Entry points:** Direct visit, all external links/ads, nav logo click from anywhere.
- **Main UI sections:** Hero, concept walkthrough ("One Arrow, Two Wins"), zeroed live-metrics display, roadmap-stage indicator, FAQ, waitlist form, nav (logo, How It Works / For Businesses / For Creators, Join Waitlist CTA), footer.
- **Primary actions:** Submit waitlist form (role: business/creator).
- **Secondary actions:** Navigate to How It Works / For Businesses / For Creators.
- **Data required:** Live counts for the zeroed-metrics device (0 until real, per design intent — must genuinely reflect real numbers once non-zero, never fabricated).
- **API dependencies:** Waitlist submission endpoint — **Needs clarification** (not explicitly named in `API/Endpoint Specifications`).
- **Loading/Empty/Error/Success states:** Success = waitlist confirmation message/state; Error = form validation.
- **Responsive:** Primary public-facing page — must work well on mobile.
- **Related features:** §1.1 Marketing Site.
- **Related docs:** `Product Foundation/Product Vision`, `Product Foundation/Product Roadmap`, `UX/Design System`, `UX/Navigation`, `UX/Copy Guidelines`.

### A2. How It Works / For Businesses / For Creators (Informational Pages)

- **Purpose:** Explain the value proposition per audience.
- **Route:** `/how-it-works`, `/for-businesses`, `/for-creators` — [Inferred]
- **Access:** Public.
- **Entry points:** Top nav from any public page.
- **Main UI sections:** Explainer content, CTA to waitlist or discovery.
- **Primary actions:** Navigate to waitlist/discovery.
- **Related features:** §1.1.
- **Related docs:** `Product Foundation/Product Vision`, `UX/Navigation`.

### A3. Public Campaign Discovery / Browse

- **Purpose:** Let anyone (and AI shopping agents/crawlers) browse live campaigns.
- **Route:** `/campaigns` — [Inferred]
- **Access:** Public read; Apply action requires Creator auth (redirects to login/register).
- **Entry points:** Marketing nav, direct link, search-engine/AI-agent discovery.
- **Main UI sections:** Filter bar (category: digital/physical, commission range, niche), sort control (newest, highest commission, most applications), campaign card grid.
- **Primary actions:** Filter, sort, open a campaign.
- **Secondary actions:** (if authenticated as Creator) Apply directly from the card.
- **Data required:** `GET /campaigns` (public, filterable, paginated).
- **Loading state:** skeleton grid. **Empty state:** "no live campaigns match these filters." **Error state:** standard error shape. **Success state:** N/A (list view).
- **Responsive:** Card grid reflows to single column on mobile.
- **Related features:** §1.2 Public Campaign Discovery.
- **Related docs:** `Technical Architecture/Search Strategy`, `API/Endpoint Specifications`, `Technical Architecture/Caching Strategy` (public campaigns cached under a `public:` namespace, short TTL).

### A4. Public Campaign / Offer Detail

- **Purpose:** Show one campaign/product's details; the page an AffiliateLink's `schema.org` markup lives on.
- **Route:** `/campaigns/:slug` — [Inferred]
- **Access:** Public.
- **Entry points:** Discovery grid, direct link, AI-agent/search preview.
- **Main UI sections:** Product name/price/currency, commission rate, merchant name, `Product`/`Offer` JSON-LD (non-visual), Apply CTA (Creator-gated).
- **Primary actions:** Apply (if authenticated Creator, not self-owned campaign).
- **Secondary actions:** Share.
- **Data required:** Campaign + Offer + Merchant public fields.
- **States:** loading; not-found/ended (campaign no longer live — still show honestly rather than 404 if within attribution-relevant history); error.
- **Related features:** §1.3.
- **Related docs:** `UX/AI Agent & Machine Readability`, `API/Endpoint Specifications`, `Business Logic/State Machines`.

---

## B. Authentication

### B1. Login

- **Purpose:** Authenticate an existing user.
- **Route:** `/login` — [Inferred]
- **Access:** Public (unauthenticated only — redirect away if already logged in).
- **Entry points:** Nav "Log In," expired-session redirect, direct link.
- **Main UI sections:** Ory Kratos-driven login form (email/password, optional social login), "forgot password" link, MFA challenge step if enabled.
- **Primary actions:** Submit credentials.
- **Data required:** N/A (delegated to Kratos).
- **States:** loading (session check), error (invalid credentials, locked account), MFA-challenge.
- **Related features:** §0.1 Unified Authentication.
- **Related docs:** `Security/Authentication`, `Security/Session Management`, `API/API Authentication`.

### B2. Register (with Role Selection)

- **Purpose:** Create an account and choose Merchant/Creator (or both).
- **Route:** `/register` — [Inferred]
- **Access:** Public.
- **Entry points:** Nav "Join," waitlist-invitation email link, direct link.
- **Main UI sections:** Signup form, role selector, plain-language data-disclosure notice (what's collected/why, per Disclosure Principle).
- **Primary actions:** Submit, select role(s).
- **Secondary actions:** Switch to login.
- **States:** loading, error (email taken, weak password), success → routes into onboarding.
- **Related features:** §2.1 Role Selection & Signup Branching, §7.3 Data Disclosure Notices.
- **Related docs:** `Business Logic/User Flows`, `Security/Data Inventory & Disclosure`.

### B3. Forgot / Reset Password

- **Purpose:** Recover account access.
- **Route:** `/forgot-password`, `/reset-password` — [Inferred]
- **Access:** Public.
- **Main UI sections:** Email entry, reset-token form.
- **States:** submitted, error (invalid/expired token), success.
- **Note:** Password change should trigger instant revocation of all other sessions (security requirement, worth surfacing to the user as "you've been logged out everywhere else").
- **Related docs:** `Security/Password Policy`, `Security/Session Management`.

### B4. Verify Email

- **Purpose:** Confirm email ownership.
- **Route:** `/verify-email` — [Inferred]
- **Access:** Authenticated-but-unverified.
- **States:** pending, verified, expired-link (resend action).
- **Related docs:** `Security/Authentication`.

### B5. MFA Setup / Challenge

- **Purpose:** Optional (Creator) / recommended (Merchant) / possibly mandatory (Admin) multi-factor auth.
- **Route:** `/mfa` — [Inferred]
- **Access:** Authenticated.
- **States:** not-enabled, setup-in-progress, enabled, challenge-on-login.
- **Related docs:** `Security/Password Policy` (open question: mandatory for Merchants before launch — **Needs clarification**).

---

## C. Onboarding

### C1. Role Selection (if separate from Register)

- **Purpose:** Confirm/adjust role after signup.
- **Route:** `/onboarding/role` — [Inferred]
- **Access:** Authenticated, first-run.
- **Related docs:** `Business Logic/User Roles`.

### C2. Merchant Onboarding — Billing Card Setup

- **Purpose:** Collect card on file for periodic billing before any campaign can go live.
- **Route:** `/onboarding/merchant/paddle` (also reachable from `/settings/billing`) — [Inferred]
- **Access:** Merchant only.
- **Entry points:** Post-role-selection first-run flow; blocked-publish prompt from Campaign creation.
- **Main UI sections:** Paddle Checkout SetupIntent form, gate-status indicator.
- **Primary actions:** Add/update card.
- **Data required:** Paddle Checkout client secret from backend.
- **States:** not-started, in-progress, complete, Paddle-restricted (with reason + resolution link), 3x-failed-billing warning.
- **API dependencies:** Paddle Checkout; `merchant_profiles.paddle_customer_id`.
- **Related features:** §2.2, §3.5 Billing.
- **Related docs:** `Product Foundation/MVP Scope`, `Business Logic/State Machines`, `Security/CORS, CSP & Security Headers` (CSP must allow `js.paddle.com`).
- **Open item:** Whether full Paddle (KYC) onboarding is also required for merchants post-reversal, beyond the card-on-file SetupIntent — **Needs clarification** (see `FEATURE_LIST.md` item 4).

### C3. Merchant Onboarding — Tracking Snippet Install

- **Purpose:** Install and verify the sale-tracking snippet before a campaign can go live.
- **Route:** `/onboarding/merchant/tracking-snippet` (likely also embedded in Campaign creation) — [Inferred]
- **Access:** Merchant only.
- **Main UI sections:** Copyable snippet code block, install instructions, "Verify Installation" action, discount-code creation guidance.
- **Primary actions:** Copy snippet, trigger verification ping.
- **States:** not-installed, verifying, verified, failed (with troubleshooting copy).
- **Related features:** §2.3.
- **Related docs:** `Payments/Payment Flow`, `Business Logic/State Machines` (second required gate on draft→live).
- **Open item:** Exact UX (guided vs. copy-paste vs. auto-verify) undesigned — **Needs clarification**.

### C4. Creator Onboarding — Payout Setup (Paddle)

- **Purpose:** Complete Paddle seller onboarding so approved links can activate.
- **Route:** `/onboarding/creator/payout` (also `/settings/payout`) — [Inferred]
- **Access:** Creator only.
- **Main UI sections:** Paddle seller onboarding embed/redirect, completion status.
- **States:** not-started, in-progress, complete, blocking-link-activation (explicit message: "finish this to activate your link").
- **Related features:** §2.4.
- **Related docs:** `Edge Cases/User Edge Cases`, `Payments/Tax Considerations` (Paddle collects 1099/W-8/W-9 here natively).

---

## D. Merchant Dashboard

### D1. Merchant Dashboard Home / Overview

- **Purpose:** At-a-glance campaign performance across all the merchant's campaigns.
- **Route:** `/dashboard` (Merchant context) — [Inferred]
- **Access:** Merchant.
- **Entry points:** Post-login landing (if single-role Merchant), nav.
- **Main UI sections:** Stat cards (clicks, conversion, sales, spend), recent activity, pending-applications count, onboarding-gate status banner if incomplete.
- **Primary actions:** Navigate to Campaigns/Applications/Sales/Payouts.
- **Data required:** Aggregate campaign metrics, own only.
- **States:** loading, empty ("no campaigns yet" — with a clear "create your first campaign" CTA), error.
- **Related features:** §6.1 Merchant Analytics.
- **Related docs:** `Analytics/Dashboards`, `Analytics/KPIs`.

### D2. Offers List

- **Purpose:** Manage the merchant's product listings.
- **Route:** `/offers` — [Inferred]
- **Access:** Merchant, own only.
- **Main UI sections:** List/table (name, price, category, currency), create action.
- **Primary actions:** Create Offer.
- **Secondary actions:** Edit, soft-delete (archive) an Offer.
- **States:** loading, empty ("no offers yet"), error.
- **Related features:** §3.1 Offer Management.
- **Related docs:** `Business Logic/Domain Model`, `Database/Table Specifications`.
- **Open item:** Whether Offer needs a dedicated list separate from Campaign creation — **Needs clarification**.

### D3. Create / Edit Offer

- **Purpose:** Add or edit a product listing.
- **Route:** `/offers/new`, `/offers/:id/edit` — [Inferred]
- **Access:** Merchant, own only.
- **Main UI sections:** Name, price, currency (USD/EUR/GBP), category (digital/physical — contextually hides shipping-relevant fields when digital), product image upload.
- **Primary actions:** Save.
- **States:** editing, saving, error (validation), success.
- **Related docs:** `Business Logic/Business Rules`, `Technical Architecture/File Storage`, `Database/Constraints`.

### D4. Campaigns List

- **Purpose:** Manage all campaigns.
- **Route:** `/campaigns` (Merchant context) — [Explicit nav section]
- **Access:** Merchant, own only.
- **Main UI sections:** List/table (status badge: draft/live/paused/ended, commission rate, applications count, sales count), create action, filter by status.
- **Primary actions:** Create Campaign.
- **Secondary actions:** Pause/resume/end a live campaign inline.
- **States:** loading, empty ("no campaigns yet"), error.
- **Related features:** §3.2 Campaign Creation & Management.
- **Related docs:** `UX/Navigation`, `Business Logic/State Machines`.

### D5. Create / Edit Campaign

- **Purpose:** Build a campaign around an Offer.
- **Route:** `/campaigns/new`, `/campaigns/:id/edit` — [Inferred]
- **Access:** Merchant, own only.
- **Main UI sections:** Offer selector, commission rate input (no platform bounds, sanity-checked 0–100%), AI copy-assist draft-description action, publish gate checklist (Paddle onboarding ✓/✗, tracking snippet ✓/✗).
- **Primary actions:** Save as draft, Publish (only enabled once both gates pass).
- **Secondary actions:** Request AI-drafted description.
- **States:** draft, gate-incomplete (publish disabled with explanation), live, error.
- **Related features:** §3.2, §0.7 AI-Assisted Features (copy assist).
- **Related docs:** `Business Logic/Business Rules`, `Business Logic/State Machines`, `Technical Architecture/AI Services`.

### D6. Campaign Detail

- **Purpose:** Single campaign's status, performance, and management actions.
- **Route:** `/campaigns/:id` — [Inferred]
- **Access:** Merchant, own only.
- **Main UI sections:** Status + commission rate, performance stats, applications summary (link to full list), sales summary, pause/resume/end actions.
- **Primary actions:** Pause, resume, end, edit.
- **States:** per Campaign state machine (draft/live/paused/ended); Paddle-restricted-auto-paused banner if applicable.
- **Related docs:** `Business Logic/State Machines`, `Edge Cases/Business Edge Cases`.

### D7. Applications List (per Campaign or All)

- **Purpose:** Review incoming creator applications.
- **Route:** `/applications` (all) or `/campaigns/:id` → applications tab — [Explicit nav section, exact structure Inferred]
- **Access:** Merchant, own campaigns only.
- **Main UI sections:** List (creator name, niche, audience size, engagement rate, AI fit-summary snippet, status), filter by status/campaign.
- **Primary actions:** Open an application to review.
- **States:** loading, empty ("no applications yet"), error.
- **Related features:** §3.3 Application Review.
- **Related docs:** `Business Logic/Permission Matrix`, `Technical Architecture/AI Services`.

### D8. Application Review Detail

- **Purpose:** Approve or reject one application.
- **Route:** `/applications/:id` — [Inferred]
- **Access:** Merchant, own campaign's applications only.
- **Main UI sections:** Creator audience/niche/engagement data, AI-generated fit summary, Approve / Reject actions.
- **Primary actions:** Approve (triggers AffiliateLink creation + immediate Creator notification), Reject.
- **States:** pending, approved (link-issued confirmation), rejected, error.
- **Related docs:** `Business Logic/State Machines`, `UX/Interaction Patterns` (approval is a "trust moment," must feel immediate).

### D9. Sales List

- **Purpose:** See sales attributed to the merchant's campaigns.
- **Route:** `/sales` — [Explicit nav section]
- **Access:** Merchant, own only.
- **Main UI sections:** List (date, campaign, creator, amount, `acceptance_status`: accepted/rejected), filter/sort, export action.
- **Primary actions:** Export report (async job).
- **Secondary actions:** Open a sale detail, request refund credit.
- **States:** loading, empty, error.
- **Related features:** §3.4 Sales Visibility, §6.1 Merchant Analytics (export).
- **Related docs:** `API/Endpoint Specifications`, `Technical Architecture/Async Job Pattern & Idempotency`.

### D10. Sale Detail / Receipt

- **Purpose:** Single sale's shared receipt (identical to what the creator sees).
- **Route:** `/sales/:id` — [Inferred]
- **Access:** Merchant, own only.
- **Main UI sections:** Amount, commission split, platform fee, timestamps, billing-cycle link, "Request Refund Credit" action.
- **Primary actions:** Request refund credit (if within monthly cap).
- **States:** accepted, rejected, credit-requested, credit-cap-reached (disabled with explanation).
- **Related features:** §3.6 Refund Credit Request.
- **Related docs:** `Payments/Refund Handling`, `Business Logic/Business Rules` (symmetric receipt is a trust mechanism).

### D11. Billing / Payouts (Billing Cycles)

- **Purpose:** View billing-cycle history and totals owed/charged.
- **Route:** `/payouts` or `/billing` (Merchant context) — [Explicit nav section, exact label Inferred]
- **Access:** Merchant, own only.
- **Main UI sections:** List of billing cycles (period, status: open/pending_charge/charged/failed, total owed, retry count).
- **States:** open (accruing), pending_charge, charged, failed (with retry status + card-update CTA).
- **Related features:** §3.5.
- **Related docs:** `Payments/Payment Flow`, `Business Logic/State Machines`.

### D12. Merchant Settings — Business Profile

- **Route:** `/settings/business` — [Inferred]
- **Access:** Merchant, own only.
- **Main UI sections:** Business name, category.
- **Related docs:** `Business Logic/Domain Model`.

### D13. Merchant Settings — Billing Card

- **Route:** `/settings/billing` — [Inferred] (same as C2, reachable post-onboarding too)
- **Access:** Merchant, own only.
- **Related docs:** `Payments/Payment Flow`.

### D14. Merchant Settings — Security

- **Route:** `/settings/security` — [Inferred]
- **Access:** Merchant, own only.
- **Main UI sections:** Active sessions list (+ "log out all other devices"), MFA setup, password change.
- **Related docs:** `Security/Session Management`.

---

## E. Creator Dashboard

### E1. Creator Dashboard Home / Overview

- **Purpose:** At-a-glance earnings/links performance.
- **Route:** `/dashboard` (Creator context) — [Inferred]
- **Access:** Creator.
- **Main UI sections:** Stat cards (clicks, sales, earnings trend toward $50), recent activity, application-status summary.
- **States:** loading, empty ("apply to your first campaign" CTA), error.
- **Related features:** §6.2 Creator Analytics.
- **Related docs:** `Analytics/Dashboards`.

### E2. Discover / Browse Campaigns

- **Purpose:** Authenticated campaign discovery + apply.
- **Route:** `/discover` — [Explicit nav section]
- **Access:** Creator.
- **Main UI sections:** Same filter/sort as public discovery, plus "already applied" indicators and (post-MVP) AI-matched ranking.
- **Primary actions:** Apply.
- **States:** loading, empty, error.
- **Related features:** §4.1.
- **Related docs:** `UX/Navigation`, `Technical Architecture/Search Strategy`.

### E3. Campaign Detail (Creator View) / Apply

- **Purpose:** View a campaign and submit an application.
- **Route:** `/discover/:slug` — [Inferred]
- **Access:** Creator.
- **Main UI sections:** Product/commission info, application form (audience snippet), disclosure-requirement note.
- **Primary actions:** Submit application.
- **States:** not-applied, submitting, submitted/pending, error (duplicate — 409, self-dealing block, rate-limited).
- **Related features:** §4.2 Application Submission.
- **Related docs:** `Database/Constraints`, `Security/Rate Limiting`.

### E4. My Applications

- **Purpose:** Track application statuses.
- **Route:** `/applications` (Creator context) — [Inferred]
- **Access:** Creator, own only.
- **Main UI sections:** List (campaign, status: pending/approved/rejected, date).
- **States:** loading, empty, error.
- **Related features:** §4.3.
- **Related docs:** `Business Logic/State Machines`.
- **Open item:** Rejection-reason display — **Needs clarification**.

### E5. My Links

- **Purpose:** Manage and view performance of issued AffiliateLinks.
- **Route:** `/links` — [Explicit nav section]
- **Access:** Creator, own only.
- **Main UI sections:** List (campaign, slug/URL, discount code, clicks/sales summary), copy actions.
- **Primary actions:** Copy link, copy discount code.
- **States:** loading, empty ("no links yet — apply to a campaign to get started"), zero-clicks-yet (calm, not broken), error.
- **Related features:** §4.4.
- **Related docs:** `UX/Components` ("Get Link" moment), `Business Logic/Domain Model`.

### E6. Link Detail

- **Purpose:** One link's full attribution timeline.
- **Route:** `/links/:id` — [Inferred]
- **Access:** Creator, own only.
- **Main UI sections:** Click/cart-add/purchase timeline (per the traced live-site example: post → click → cart → purchase), commission earned from this link.
- **States:** loading, empty (zero clicks), error.
- **Related docs:** `Business Logic/User Flows` (traced example, good QA basis).

### E7. Earnings / Wallet

- **Purpose:** View balance, threshold progress, payout history.
- **Route:** `/earnings` — [Explicit nav section]
- **Access:** Creator, own only.
- **Main UI sections:** Current balance (billed-and-charged commissions only), progress bar/indicator toward $50, payout history list.
- **States:** accruing, threshold-crossed, processing, paid, failed-retrying, empty (no earnings yet).
- **Related features:** §4.5.
- **Related docs:** `Payments/Wallet Design`, `Payments/Payout Process`.

### E8. Creator Settings — Profile

- **Route:** `/settings/profile` — [Inferred]
- **Access:** Creator, own only.
- **Main UI sections:** Niche, audience size, engagement rate (editability depends on self-reported-vs-calculated resolution — **Needs clarification**).
- **Related docs:** `Business Logic/Domain Model`, `Edge Cases/Creator Edge Cases`.

### E9. Creator Settings — Payout

- **Route:** `/settings/payout` — [Inferred] (same as C4, reachable post-onboarding)
- **Access:** Creator, own only.
- **Related docs:** `Payments/Payout Process`.

### E10. Creator Settings — Security

- **Route:** `/settings/security` — [Inferred]
- **Access:** Creator, own only.
- **Related docs:** `Security/Session Management`.

---

## F. Shared Cross-Role Screens

### F1. Notification Center

- **Purpose:** View all notifications.
- **Route:** `/notifications` — [Inferred]
- **Access:** Any authenticated user, own only.
- **Main UI sections:** Feed (read/unread), type-based icon/label, click-through to relevant screen.
- **States:** loading, empty ("no notifications yet"), error.
- **Related features:** §0.3.
- **Related docs:** `Business Logic/Notification Logic`.

### F2. Account Deletion Flow

- **Purpose:** Request/cancel account deletion.
- **Route:** Inside `/settings/security` or a dedicated `/settings/delete-account` — [Inferred]
- **Access:** Any authenticated user, own account only.
- **Main UI sections:** Confirmation dialog explaining consequences, 14-day countdown, cancel action.
- **States:** requested/counting-down, cancelled, processing, completed.
- **Related features:** §7.2.
- **Related docs:** `Security/Data Retention Policy Engine`.

### F3. Support / Help Contact

- **Purpose:** Reach support.
- **Route:** Footer/nav link or `/support` — [Inferred]
- **Access:** Any user (authenticated context adds account-specific info).
- **Main UI sections:** Contact form or email link.
- **Related features:** §7.1.
- **Related docs:** `Operations/Customer Support Flows`.

---

## G. Admin Panel

*All screens below: Access = Admin only, `/admin/*` namespace, fully separate nav.*

### G1. Admin Dashboard

- **Route:** `/admin/dashboard` — [Inferred]
- **Purpose:** Marketplace health at a glance (the most important view during Validation/Private Beta).
- **Main UI sections:** Active merchants/creators, liquidity ratio, time-to-payout trend, funnel views (Merchant + Creator).
- **Data required:** KPI aggregates.
- **Related docs:** `Analytics/Dashboards`, `Analytics/KPIs`, `Product Foundation/Success Metrics`.

### G2. Moderation Queue

- **Route:** `/admin/moderation` — [Inferred]
- **Purpose:** Review flagged sales/applications/accounts.
- **Main UI sections:** Flag list (trigger rule, entity, date), detail view with clear/act actions.
- **Data required:** `GET /admin/flagged`.
- **States:** unreviewed, cleared, actioned.
- **Related docs:** `Operations/Moderation`, `Security/Fraud Prevention`.

### G3. Campaign Vetting Queue

- **Route:** `/admin/campaigns/vetting` — [Inferred]
- **Purpose:** Approve/reject high-commission or high-risk campaigns before they go live.
- **Data required:** `POST /admin/campaigns/:id/vet`.
- **Related docs:** `Operations/Admin Panel`.

### G4. User Management

- **Route:** `/admin/users`, `/admin/users/:id` — [Inferred]
- **Purpose:** View/suspend accounts; support-purpose data lookup.
- **Main UI sections:** Search/list, user detail (activity, roles, suspend action), `get_ticket_context`-style aggregated view.
- **Data required:** `POST /admin/users/:id/suspend`.
- **Related docs:** `Operations/Admin Panel`, `Operations/Live Production Access for Support`.

### G5. Refund / Dispute Handling

- **Route:** `/admin/refunds-disputes` — [Inferred]
- **Purpose:** Review refund-credit requests, handle chargeback evidence.
- **Main UI sections:** Request list, cap-counter per merchant, evidence-submission form.
- **Related docs:** `Payments/Refund Handling`, `Payments/Chargebacks`.

### G6. Reconciliation Review

- **Route:** `/admin/reconciliation` — [Inferred]
- **Purpose:** Investigate Paddle-vs-internal mismatches.
- **Related docs:** `Payments/Reconciliation`.

### G7. Waitlist / Beta Invitation Management

- **Route:** `/admin/waitlist` — [Inferred]
- **Purpose:** Curate/invite the Private Beta cohort (10–25, manual first cohort, automatic thereafter).
- **Related docs:** `Product Foundation/Product Roadmap`.

### G8. At-Risk New Users

- **Route:** `/admin/at-risk-users` — [Inferred]
- **Purpose:** Surface 48h churn-signal accounts.
- **Related docs:** `Analytics/Activation, Aha Moment & Churn Signals`.

### G9. Founder AI Command Console

- **Route:** `/admin/console` — [Inferred]
- **Purpose:** Natural-language admin interface.
- **Main UI sections:** Chat input, response stream, confirmation prompts for write actions, clarification prompts on ambiguity.
- **States:** answering (read), awaiting-confirmation (write), executed, clarification-needed.
- **Related docs:** `Operations/Founder AI Command Console`.

### G10. Admin Analytics (P&L, Unit Economics, AI Costs)

- **Route:** `/admin/analytics/*` — [Inferred]
- **Purpose:** Monthly P&L, per-user unit economics, AI/token cost dashboards.
- **Data required:** `monthly_pnl_reports`, `ai_usage_events`.
- **States:** finalized vs. draft report.
- **Related docs:** `Analytics/Automated Monthly P&L`, `Analytics/Unit Economics`, `Analytics/AI Token Usage Tracking`.

---

## Screen Count Summary

| Module | Screens |
| --- | --- |
| Public Marketing & Discovery | 4 |
| Authentication | 5 |
| Onboarding | 4 |
| Merchant Dashboard | 14 |
| Creator Dashboard | 10 |
| Shared Cross-Role | 3 |
| Admin Panel | 10 |
| **Total** | **~50** |

## What This Inventory Deliberately Excludes

- A checkout/payment screen for buyers — no longer exists (external-site tracking model).
- Native mobile screens — responsive web only for MVP.
- A public API developer portal — post-MVP.

## Cross-References

- Feature detail per screen's function: `FEATURE_LIST.md`
- Route hierarchy and [Explicit]/[Inferred] source basis: `SITE_MAP.md`
