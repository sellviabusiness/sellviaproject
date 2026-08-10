# Caching Strategy

## Purpose

What gets cached, why, and for how long — kept deliberately light for MVP given the scale involved.

## What NOT to Cache

- Anything related to balances, payouts, or commission amounts — these must always be read live from the database (or Paddle directly), never from a cache, given they're financial figures a user might act on
- Sale/Application state — same reasoning; staleness here is a trust problem, not just a UX inconvenience

## What's Reasonable to Cache

- **Public campaign discovery listings** (what a creator browses) — short TTL (e.g. 60 seconds) is fine, since a few seconds of staleness on "which campaigns are live" isn't a correctness problem
- **Merchant/Creator public profile data** shown on campaign/application cards (niche, audience size) — similarly low-stakes to cache briefly
- **Static design-system assets** — handled by CDN (see CDN Strategy), not application-level caching

## Mechanism

Redis, same instance used for background job queues (see Background Jobs) — no need for a separate caching layer at this scale.

## Open Questions

- None blocking — this doc is intentionally conservative (cache little, cache short) given how much of the app is financial data that shouldn't be served stale. Revisit if a specific endpoint becomes a real performance bottleneck under real traffic.

## Update (2026-08-04): Mandatory Tenant Scoping — No Exceptions for Tenant-Private Data

**Tenant definition:** `MerchantProfile.id` or `CreatorProfile.id` (not `User.id`) — matches the actual data-owning boundary in Domain Model. A dual-role user has two separate tenant contexts, not one.

**Rule: every cached query, cache fragment, and cached API response that touches tenant-private data must include the tenant ID in its cache key, with no exceptions.** Examples of correct keying:

```
merchant:{merchant_profile_id}:campaigns
creator:{creator_profile_id}:earnings_summary
merchant:{merchant_profile_id}:sales:2026-08
```

A cache key that omits tenant context for private data is a bug, full stop — not a performance shortcut to consider.

## The One Deliberate Exception: Public Data Gets Its Own Explicit Namespace

Public campaign discovery listings (visible identically to every Creator, by design — see 01. Business Logic → User Flows) are **not** tenant-private data — there's no tenant boundary being crossed by sharing them. These get a separate, explicitly-named `public:` namespace:

```
public:campaigns:discovery:page-1
```

**The point isn't "skip tenant scoping here" — it's that every key must be unambiguous about which bucket it's in.** A key must never be constructed in a way where it's unclear whether it's tenant-scoped or public; `public:` and `merchant:{id}:` / `creator:{id}:` prefixes must never collide or be reused for the wrong purpose. This distinction gets audited explicitly in 04. Security → Tenant Isolation Audit.

## Enforcement, Not Just Convention

Relying on every developer remembering to add the tenant prefix by hand is exactly how this kind of bug slips through. Recommend a thin caching helper/wrapper that **requires** a tenant ID (or an explicit `public` marker) as a parameter to construct any cache key — making it structurally awkward to write an unscoped cache call, rather than just documenting the convention and hoping it's followed.