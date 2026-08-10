# Product Vision

## Purpose

This document defines what SellVia is, who it's for, and what "winning" looks like, so every downstream decision — business logic, architecture, UX — can be checked against a single source of truth instead of re-litigated per feature.

## Vision Statement

**SellVia gives every product a sales force that only gets paid when it sells.**

Brands list products with a commission attached. Creators pick what fits their audience and apply. Every sale is traced to the exact creator and post, and payout fires automatically the moment a sale is verified — no invoices, no net-60, no spreadsheets.

## The Problem (as validated on [wesellvia.com](http://wesellvia.com))

Two groups have complementary, currently-unsolved problems:

| Side | Current reality |
| --- | --- |
| Small/early-stage brands | Cold DMs with a media kit and a prayer. Campaign tracking across five spreadsheets. "Exposure" offered as payment. No affiliate manager, no ad budget. |
| Early-career creators | Chasing invoices for 60+ days. No proof a post "worked." No structured way to find brands that fit their audience without cold outreach. |

Existing affiliate networks (Amazon Associates, ShareASale, Rakuten, Impact, CJ Affiliate) exist, but are **built for enterprises with dedicated affiliate managers** — not for a small brand and a 9k-follower creator who'd be a perfect match. That gap is the whole opportunity.

## Target Users

**(A) Business Owners / Brands** — e-commerce retailers, SaaS founders, brick-and-mortar stores wanting performance-based marketing (pay-per-sale) with no upfront cost and no contracts.

**(B) Content Creators** — bloggers, YouTubers, Instagram/TikTok creators, affiliate publishers, and anyone monetizing an audience, including small/niche creators (e.g. 9k followers) who are underserved by enterprise-grade networks.

## Value Proposition

- **For brands:** $0 owed until something sells. No ad budget, no sales team, no contract. Set a commission, go live, review applicants, done.
- **For creators:** Discover campaigns instead of cold-pitching. Every click/cart/purchase attributed to the exact creator and post. Commission is agreed *before* anyone posts — no "exposure" as payment.
- **For both:** One shared receipt per sale. Payout fires automatically on verified sale — no invoicing, no chasing, no 60-day wait.

## What Makes This Different

1. **Radical transparency as a trust device.** The current landing page explicitly states "SellVia doesn't exist yet," shows zeroed-out metrics ("0 creators approved, 0 sales, $0 tracked revenue"), and frames signups as votes to build the product. This is a deliberate positioning choice, not a placeholder — it should persist into early product messaging ("you are literally here" / roadmap stage visibility).
2. **Creators apply, brands approve** — not cold outreach in either direction. Everyone in a deal chose to be there.
3. **Attribution is automatic and mutual.** Both sides see the same receipt for the same sale at the same time. No "did this post actually work?" ambiguity.
4. **Niche-first go-to-market**, not "all products, all creators" from day one — addresses the two-sided chicken-and-egg problem directly (see Business Rules / GTM notes in 01. Business Logic).

## Success Metrics (from raw data + case study docs)

- Number of active merchants and active affiliates (both sides of liquidity)
- Click-to-sale conversion rate
- Time from campaign listing → first creator approved
- Time from sale → payout settled (target: near-instant, not net-60)
- User satisfaction / usability scores on both dashboards
- Waitlist → activated user conversion (current validation-stage KPI)

## Guiding Principles

- **Reduce complexity relentlessly.** Contextually hide irrelevant fields (e.g. a digital-goods seller never sees a shipping field). Progressive disclosure over feature-front-loading.
- **Don't favor one side.** Every business rule and UX decision gets checked against both the merchant flow and the creator flow.
- **No fake momentum.** No fabricated testimonials, no invented metrics, no "trusted by 1000+ brands" until it's real — this is a stated design constraint ([design.md](http://design.md) § Section Design), not just a nice-to-have.
- **Design system discipline.** Black/lime, Outfit/Figtree, no gradients, no glassmorphism — see [design.md](http://design.md) and 09. UX for the full system.

## Non-Goals (for MVP)

- Multi-currency support
- Complex analytics/BI dashboards
- Enterprise/large-brand tooling (dedicated affiliate managers, bulk campaign management)
- International tax handling beyond basic W-8/W-9

## Open Questions

- What's the actual niche/category for the "beachhead" cohort mentioned in the chicken-and-egg strategy (indie software? a specific retail vertical?) — needs a decision before Private Beta.
- What follower/audience-size floor (if any) applies to creator eligibility? The FAQ on [wesellvia.com](http://wesellvia.com) implies "no," but this needs an explicit rule for moderation/quality control.
- Payout rails at launch: PayPal + bank transfer are named in the raw data doc — confirm this holds for MVP or if Stripe Connect (per the infra conversation) changes this.
- How does "private beta, in join order, on founding terms" (from the roadmap) map to concrete product rules — is there a cap on beta cohort size?

## Related Docs

- 
    1. Business Logic → User Roles, Domain Model, Commission Engine
- 
    1. UX → Design System ([design.md](http://design.md))
- 
    1. Infrastructure & DevOps → Environment Strategy