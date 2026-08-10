# Accessibility

## Purpose

WCAG-level considerations — not covered at all in [design.md](http://design.md), a genuine gap this doc fills.

## Color Contrast

- **Flagging a real tension:** [design.md](http://design.md)'s black background + lime accent is striking, but lime-on-black and lime-on-white both need actual contrast-ratio verification against WCAG AA (4.5:1 for body text, 3:1 for large text/UI components) before this ships broadly — not verified anywhere yet, and lime green in particular can have contrast issues depending on exact shade and text size. This should be checked with a real contrast tool against the specific hex values in [design.md](http://design.md), not assumed fine because it looks fine.
- White-on-black body text should be comfortably compliant — the main risk is specifically the lime accent used for text (vs. just borders/backgrounds), per [design.md](http://design.md)'s own guidance that lime should be "used sparingly."

## Other Baseline Requirements (not in [design.md](http://design.md), standard practice)

- Keyboard navigability for all interactive elements (forms, buttons, campaign discovery filters)
- Focus states visible or use the lime accent, and lime accent doubling here fits [design.md](http://design.md)'s "active states" allowance
- Alt text on all product images (03. Database → File Storage doesn't currently include an alt-text field — worth adding)
- Form labels properly associated with inputs, not just placeholder text (placeholder-only labels are a common accessibility failure and an easy one to avoid from the start)

## Open Questions

- Actual contrast ratio verification against the specific hex values in [design.md](http://design.md) — genuinely not done, should happen before broad launch, not guessed at here

## Update (2026-08-04): Three Binding Requirements — Not Aspirational, Enforced

These upgrade the earlier "flagged, not verified" contrast note into three concrete, testable requirements for every screen shipped.

### 1. Full Keyboard Navigation — No Exceptions

Every interactive element in the application must be reachable and operable by keyboard alone — no mouse-only interactions anywhere, across both dashboards, the hosted checkout, and the public marketing site.

- Logical tab order following visual layout (not DOM-order accidents from CSS positioning)
- All shadcn/ui components (09. UX → Design System) come with reasonable keyboard support by default — but every **custom** interactive element built on top (campaign discovery filters, the "Get Link" component, status badges with actions) must be explicitly verified, not assumedn- Visible focus indicators on every focusable element — use the lime accent for focus rings, consistent with [design.md](http://design.md)'s existing "active states" allowance for lime, so this reinforces the design system rather than fighting itn- Modals/dialogs trap focus correctly and return focus to the triggering element on closen- **Especially the checkout flow:** since this is Paddle Checkout embedded in a SellVia-branded shell (02. Frontend Architecture), verify keyboard operability end-to-end through an actual purchase, not just assume Paddle's components handle it — the surrounding page chrome is still SellVia's responsibilitynn### 2. Screen Reader Compatibilityn- **All form fields** have properly associated labels (already required per this doc's earlier "no placeholder-only labels" note) plus correct ARIA attributes where native HTML semantics aren't enough (e.g. `aria-describedby` linking a field to its error message, `aria-invalid` on validation failure)n- **All images** have meaningful alt text — product images (03. Database → File Storage doesn't currently have an alt-text field; add one), profile photos, any icons that convey meaning rather than being purely decorative (decorative icons get `alt=\"\"` / `aria-hidden`, not a missing attribute)n- **All buttons and icon-only controls** have accessible labels (`aria-label` where there's no visible text) — particularly relevant given [design.md](http://design.md)'s "no icons above headings" minimalism (09. UX → Components) often means icon-only actions in compact UI (status badges, table row actions)n- **Status/state changes** (e.g. "application approved," "payout sent" per 09. UX → Copy Guidelines) use `aria-live` regions where they update without a page reload, so a screen reader user isn't left unaware something changednn### 3. WCAG AA Color Contrast — Verified, Not AssumednThis closes the exact gap flagged above ("not verified anywhere yet"): every text/background combination in [design.md](http://design.md)'s palette must be checked against a real contrast tool before broad rollout, specifically:n- White (#FFFFFF) on black (#000000): comfortably compliant, low riskn- **Lime (#BFFF13) as text color: the actual risk.** Must hit 4.5:1 for body text / 3:1 for large text (18pt+/14pt+bold) or UI components. If lime-as-text fails on either background, the fix is restricting lime to backgrounds/borders/icons only (never body copy) rather than changing the brand color itself — preserves [design.md](http://design.md)'s "used sparingly" intent while staying compliantn- Gray 01 (#A1A1AA) and Gray 02 (#71717A) on black: both need verification, since muted text is exactly where contrast tends to quietly failnn## Where This Gets EnforcednAdd to 04. Security → Security Checklist as a pre-launch gate item, alongside the existing tenant-isolation and payments-testing requirements — accessibility shouldn't be the one category that's "nice to have" while everything else is a hard gate.