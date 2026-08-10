# SellVia — Frontend Site Map

## Purpose

Hierarchical navigation structure for the SellVia frontend, derived from `/Docs`. Cross-references `FEATURE_LIST.md` (what each area does) and `SCREEN_INVENTORY.md` (per-screen detail).

## How to Read the Route Labels

Every route below is tagged:

- **[Explicit]** — a route or navigation grouping the documentation names directly (e.g., `UX/Navigation`'s Merchant nav items, `API/Endpoint Specifications`'s resource paths, `/admin/*`).
- **[Inferred]** — a route this document proposes to implement an explicitly-described feature/screen, following the app's own naming conventions (plural nouns, resource-based) and REST Standards (`/api/v1/*` is API-only, not a frontend route pattern — frontend routes below are conventional Next.js App Router paths, not literally specified anywhere in the docs).

No routes are invented beyond what's needed to reach a feature already documented in `FEATURE_LIST.md`.

## Two Frontend Surfaces

Per `Technical Architecture/Frontend Architecture`, SellVia's frontend has two logically distinct parts sharing one Next.js codebase:

1. **Public marketing/discovery site** — `wesellvia.com`, unauthenticated.
2. **Authenticated application** — Merchant dashboard, Creator dashboard, Admin panel — role-gated, separate navigation per role per `UX/Navigation` ("role-based, not a single shared nav").

---

## 1. Public Site

```text
/                                          [Explicit — wesellvia.com home: hero, concept walkthrough,
                                             roadmap, FAQ, waitlist form]
├── /how-it-works                          [Inferred — nav link named "How It Works" in design.md/Navigation]
├── /for-businesses                        [Inferred — nav link named "For Businesses"]
├── /for-creators                          [Inferred — nav link named "For Creators"]
├── /waitlist                              [Inferred — "Join Waitlist" CTA target; may instead be an
                                             in-page form on "/" rather than a separate route — Needs
                                             clarification]
├── /campaigns                             [Inferred — public campaign discovery/browse list;
                                             GET /campaigns is explicitly public per API docs]
│   └── /campaigns/:slug                   [Inferred — public Campaign/Offer detail page carrying
                                             schema.org Product/Offer JSON-LD, per UX/AI Agent doc]
├── /go/:slug                              [Explicit — GET /go/:slug, the AffiliateLink redirect
                                             endpoint; logs the click, bounces to the merchant's own
                                             site. Not a rendered page a user lingers on.]
├── /llms.txt                              [Explicit — plain-markdown file for LLM consumption]
├── /robots.txt                            [Explicit — deliberately allows known AI crawlers on public
                                             pages, disallows authenticated routes]
└── /legal (privacy, terms)                [Inferred — required by Data Inventory & Disclosure's
                                             disclosure principle; exact legal pages/copy not specified
                                             — Needs clarification]
```

**Note on the removed checkout route:** earlier documentation versions describe `POST /checkout/:slug/session` and a SellVia-hosted checkout page. This is **superseded** (2026-08-07 reversal) — there is no SellVia-hosted checkout route. A shared link goes `/go/:slug` → redirect to the merchant's own external site.

---

## 2. Authentication Routes (Shared Shell, Pre-Role)

```text
/login                                     [Inferred — conventional route; Ory Kratos-driven]
/register                                  [Inferred — unified signup form, role selection inside]
/forgot-password                           [Inferred]
/reset-password                            [Inferred]
/verify-email                              [Inferred]
/mfa (setup / challenge)                   [Inferred — MFA policy exists (optional for Creators,
                                             recommended for Merchants, mandatory-under-consideration
                                             for Admin) but no route/screen name is specified]
/logout                                    [Inferred — action, not necessarily a standalone page]
```

**Source:** `Security/Authentication`, `Security/Session Management`, `Security/Password Policy`, `API/API Authentication`.

---

## 3. Onboarding (Post-Signup, Pre-Dashboard)

```text
/onboarding/role                           [Inferred — if role selection isn't inline on /register]
/onboarding/merchant/paddle                [Inferred — Paddle card-on-file / billing setup step,
                                             gates Campaign draft→live]
/onboarding/merchant/tracking-snippet      [Inferred — snippet install + verification step, gates
                                             Campaign draft→live]
/onboarding/creator/payout                 [Inferred — Paddle seller onboarding, gates
                                             AffiliateLink activation]
```

**Source:** `Business Logic/State Machines`, `Payments/Payment Flow`, `Edge Cases/User Edge Cases`, `Technical Architecture/Frontend Architecture`.

**Needs clarification:** whether onboarding is a dedicated route sequence or embedded as steps inside the Merchant/Creator dashboard's first-run state — not specified in the docs.

---

## 4. Merchant Dashboard (Authenticated, Role = Merchant)

Per `UX/Navigation`: **Campaigns / Applications / Sales / Payouts** are the named top-level nav sections for the Merchant role. Flat, no deep nesting, no mega-menus.

```text
/dashboard                                 [Inferred — Merchant home/overview if role = merchant;
                                             see §7 for dual-role landing behavior]
├── /offers                                [Inferred — Offer list; Offers aren't a named nav item in
                                             UX/Navigation but are a distinct entity per Domain Model —
                                             may be folded into Campaign creation instead of a separate
                                             nav section — Needs clarification]
│   ├── /offers/new
│   └── /offers/:id/edit
├── /campaigns                             [Explicit — named nav section]
│   ├── /campaigns/new
│   ├── /campaigns/:id
│   └── /campaigns/:id/edit
├── /applications                          [Explicit — named nav section]
│   └── /applications/:id                  [Inferred — application review detail, or inline expansion]
├── /sales                                 [Explicit — named nav section; GET /sales]
│   └── /sales/:id                         [Inferred — sale/receipt detail]
├── /payouts                               [Explicit — named nav section — for Merchant this now
                                             surfaces Billing Cycles, not a live-split payout log,
                                             per the 2026-08-07 reversal; may be relabeled
                                             "Billing" in the actual UI — Needs clarification]
│   └── /payouts/:id  (or /billing/:id)    [Inferred — billing cycle detail]
├── /settings
│   ├── /settings/business                 [Inferred — MerchantProfile edit]
│   ├── /settings/billing                  [Inferred — Paddle card-on-file management]
│   └── /settings/security                 [Inferred — sessions, MFA, password]
└── /notifications                         [Inferred — shared notification feed]
```

**Source:** `UX/Navigation`, `API/Endpoint Specifications`, `Business Logic/User Flows`, `Payments/Payment Flow`.

---

## 5. Creator Dashboard (Authenticated, Role = Creator)

Per `UX/Navigation`: **Discover / My Links / Earnings** are the named top-level nav sections for the Creator role.

```text
/dashboard                                 [Inferred — Creator home/overview if role = creator]
├── /discover                              [Explicit — named nav section; campaign browse/apply,
                                             authenticated version of the public /campaigns list]
│   └── /discover/:slug                    [Inferred — campaign detail + Apply action]
├── /applications                          [Inferred — "My Applications" status list; not named
                                             explicitly in Navigation but required by the Application
                                             state machine + Notification Logic]
├── /links                                 [Explicit — "My Links" nav section]
│   └── /links/:id                         [Inferred — link detail: click/cart/purchase timeline]
├── /earnings                              [Explicit — "Earnings" nav section — wallet balance,
                                             $50-threshold progress, payout history]
├── /settings
│   ├── /settings/profile                  [Inferred — CreatorProfile edit: niche, audience, rate]
│   ├── /settings/payout                   [Inferred — Paddle seller management]
│   └── /settings/security                 [Inferred]
└── /notifications                         [Inferred — shared component]
```

**Source:** `UX/Navigation`, `Business Logic/User Flows`, `Payments/Wallet Design`.

---

## 6. Admin Panel (Authenticated, Role = Admin)

Per `UX/Navigation`: "**Admin nav is entirely separate (`/admin/*`), not exposed to regular Merchant/Creator navigation at all.**" — [Explicit] namespace, [Inferred] sub-routes based on `Operations/Admin Panel`'s named screens.

```text
/admin
├── /admin/dashboard                       [Inferred — marketplace health, funnels, time-to-payout]
├── /admin/moderation                      [Inferred — flagged Sales/Applications queue;
                                             GET /admin/flagged]
│   └── /admin/moderation/:id
├── /admin/campaigns/vetting               [Inferred — high-commission/high-risk campaign approval;
                                             POST /admin/campaigns/:id/vet]
├── /admin/users                           [Inferred — user management list]
│   └── /admin/users/:id                   [Inferred — user detail, suspend action;
                                             POST /admin/users/:id/suspend]
├── /admin/refunds-disputes                [Inferred — refund credit review + chargeback evidence]
├── /admin/reconciliation                  [Inferred — Paddle-vs-internal-records mismatch review]
├── /admin/waitlist                        [Inferred — waitlist → beta invitation management]
├── /admin/at-risk-users                   [Inferred — 48h churn-signal view]
├── /admin/console                         [Inferred — Founder AI Command Console, chat-style
                                             natural-language interface]
├── /admin/analytics
│   ├── /admin/analytics/pnl               [Inferred — Automated Monthly P&L report]
│   ├── /admin/analytics/unit-economics    [Inferred]
│   └── /admin/analytics/ai-costs          [Inferred — AI/Token Usage Tracking]
└── /admin/settings                        [Inferred — feature flags visibility, etc. — not detailed
                                             in the docs as a screen; flagged for completeness only]
```

**Source:** `UX/Navigation`, `Operations/Admin Panel`, `Operations/Founder AI Command Console`, `Analytics/Dashboards`, `Analytics/Automated Monthly P&L`.

**Note:** The Admin role is single/flat for MVP — no sub-navigation for tiered admin permissions.

---

## 7. Dual-Role Navigation Behavior

For an account holding both Merchant and Creator roles, `UX/Navigation` recommends **"a role switcher rather than merging both role's navigation into one confusing menu."** No specific route pattern is given. Two reasonable implementations, neither confirmed in the docs — **Needs clarification**:

- **Option A [Inferred]:** Shared base path with a context switch, e.g. `/dashboard?as=merchant` / `/dashboard?as=creator`, swapping the entire nav/shell.
- **Option B [Inferred]:** Fully separate path namespaces, e.g. `/merchant/*` and `/creator/*`, with a switcher link between them.

This site map does not prescribe which; `SCREEN_INVENTORY.md` treats Merchant and Creator dashboards as separate screen sets regardless of final URL structure.

---

## 8. Full Hierarchy (Condensed Tree)

```text
/
├── / (marketing home)
├── /how-it-works
├── /for-businesses
├── /for-creators
├── /waitlist
├── /campaigns (public browse)
│   └── /campaigns/:slug (public detail)
├── /go/:slug (redirect, not a page)
├── /legal/*
│
├── /login
├── /register
├── /forgot-password
├── /reset-password
├── /verify-email
├── /mfa
│
├── /onboarding/*
│
├── /dashboard  (role-resolved landing: Merchant or Creator shell)
│
├── Merchant shell
│   ├── /offers[/new|/:id/edit]
│   ├── /campaigns[/new|/:id|/:id/edit]
│   ├── /applications[/:id]
│   ├── /sales[/:id]
│   ├── /payouts (billing cycles)[/:id]
│   ├── /settings/{business,billing,security}
│   └── /notifications
│
├── Creator shell
│   ├── /discover[/:slug]
│   ├── /applications
│   ├── /links[/:id]
│   ├── /earnings
│   ├── /settings/{profile,payout,security}
│   └── /notifications
│
└── /admin/*
    ├── /admin/dashboard
    ├── /admin/moderation[/:id]
    ├── /admin/campaigns/vetting
    ├── /admin/users[/:id]
    ├── /admin/refunds-disputes
    ├── /admin/reconciliation
    ├── /admin/waitlist
    ├── /admin/at-risk-users
    ├── /admin/console
    ├── /admin/analytics/{pnl,unit-economics,ai-costs}
    └── /admin/settings
```

---

## What This Site Map Deliberately Excludes

- **A SellVia-hosted checkout route** — removed by the 2026-08-07 reversal; do not build one.
- **A public API developer portal** — explicitly not needed until there's demand beyond SellVia's own frontend (deferred, post-MVP).
- **Mobile app navigation** — MVP is responsive web only; native app nav is out of scope (`Product Foundation/Full Product Vision (Post-MVP)`).
- **Status page** — lives on a separate domain/infrastructure by design, not part of this app's route tree at all.

## Cross-References

- What each route's screen actually contains: `SCREEN_INVENTORY.md`
- What feature each route serves: `FEATURE_LIST.md`
