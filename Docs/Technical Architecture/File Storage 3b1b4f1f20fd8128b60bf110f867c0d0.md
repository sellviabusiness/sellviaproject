# File Storage

## Purpose

Where uploaded assets (product images, profile photos, logos) live.

## Approach

S3-compatible object storage (matches the earlier infrastructure conversation's recommendation) — not stored in the database, not stored on the app server's local disk (which wouldn't survive redeploys/scaling anyway).

## Separation by Environment

Per the earlier environment-strategy conversation: separate buckets (or bucket prefixes) for production, staging, and local — so test uploads in staging never appear in production and vice versa.

## What's Stored Here

- Product images (uploaded by merchants when creating an Offer)
- Merchant logos / business branding
- Creator profile photos
- **Not** anything related to Paddle/KYC documents — those stay inside Paddle's own onboarding flow (Paddle seller account for merchants/creators handles this directly, per Backend Architecture), so SellVia never needs to store sensitive identity documents itself

## Open Questions

- Whether product images are fetched/scraped automatically from a merchant's existing website URL (as discussed in the "owner fetched product from website directly" conversation) or always manually uploaded — auto-fetch is a nice-to-have that reduces merchant friction but adds scraping/parsing complexity; recommend manual upload for MVP with auto-fetch as a v2 convenience feature