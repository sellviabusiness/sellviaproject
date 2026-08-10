# CDN Strategy

## Purpose

How static assets and the public marketing site are served quickly and reliably.

## Approach

Cloudflare in front of everything (per the earlier infrastructure conversation) — handles DNS, CDN caching of static assets, HTTPS/SSL, and basic DDoS protection. This was already the recommended setup before any of the payments/checkout decisions were made, and nothing since has changed that.

## What Goes Through the CDN

- Static frontend assets (JS/CSS bundles, fonts — Outfit/Figtree per [design.md](http://design.md), images)
- The public marketing site content ([wesellvia.com](http://wesellvia.com))

## What Does NOT Go Through a Cache Layer

- Authenticated dashboard requests, checkout pages, anything involving live balances/state — these must hit the application directly, not a cached edge response

## Open Questions

- None blocking — this is a fairly standard, low-risk setup already aligned with the earlier infra conversation.