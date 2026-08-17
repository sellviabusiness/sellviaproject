# Interaction Patterns

## Purpose

How the two dashboards behave, not just how they look — [design.md](http://design.md) is visual-only, this doc covers interaction.

## Core Interaction Principle (from Mission & Principles)

"Reduce complexity relentlessly" — applies to interaction, not just layout: contextually hide irrelevant fields/actions rather than showing everyone everything with some parts disabled. A digital-goods Merchant never sees a shipping-related field at all, rather than seeing it grayed out.

## Key Interaction Moments

- **Campaign creation → live:** should feel like very few steps (per the raw data doc's original "minimize form fields, add defaults" goal) — commission rate, product info, publish. No multi-page wizard for MVP.
- **Application → approval → link generation:** the approval action should immediately surface the generated AffiliateLink to the Creator (real-time or near-real-time notification, not a delayed email only) — this is one of the product's core "trust moments" and shouldn't feel like a black box.
- **Checkout:** per [design.md](http://design.md)'s restrained-animation rule, the hosted checkout page should feel calm and fast, not gamified — consistent with 02. Frontend Architecture's recommendation to use Paddle Checkout within SellVia's own branded shell rather than building novel checkout UI patterns.

## Loading/Transition States

- Per [design.md](http://design.md)'s animation restraint ("fade in, slight opacity transitions... nothing beyond that"), loading states should be simple and quiet — skeleton screens or fades, not spinners with playful copy.

## Open Questions

- None blocking — this doc translates already-stated design and product principles into interaction guidance; specific micro-interactions get refined during actual screen design.
