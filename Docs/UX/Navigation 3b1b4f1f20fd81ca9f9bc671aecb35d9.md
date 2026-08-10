# Navigation

## Purpose

How someone moves around the authenticated app — [design.md](http://design.md)'s Navigation section covers the public marketing site only; this doc covers the dashboard.

## Marketing Site Nav (from [design.md](http://design.md), unchanged)

Logo left, links center/right ("How It Works," "For Businesses," "For Creators"), single "Join Waitlist" CTA. No dropdowns, no mega menus.

## Dashboard Navigation (new — not covered by [design.md](http://design.md))

- **Role-based, not a single shared nav:** a Merchant sees Campaigns / Applications / Sales / Payouts; a Creator sees Discover / My Links / Earnings. A user with both roles (per User Roles' default) needs a way to switch context — recommend a role switcher rather than merging both role's navigation into one confusing menu, consistent with "don't favor one side" but also don't blend the two experiences into one.
- **Admin nav** is entirely separate (`/admin/*`), not exposed to regular Merchant/Creator navigation at all.

## Minimalism Carries Over

[Design.md](http://Design.md)'s "avoid dropdowns, avoid mega menus" principle should extend to the dashboard — flat, few top-level sections per role, not deep nested menus.

## Open Questions

- Exact mechanism for switching between Merchant/Creator context on a dual-role account — not designed yet, reasonable to resolve during actual screen design rather than guess here