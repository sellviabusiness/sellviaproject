# Rate Limiting

## Purpose

Preventing abuse of the API through sheer volume of requests.

## Where It Matters Most

- **Checkout endpoint:** rate-limit per IP/session to prevent card-testing fraud (a well-known attack where stolen card numbers are tested via a merchant's checkout flow) — this is a real, common attack pattern against any hosted checkout, not a theoretical concern
- **Application submission:** rate-limit per Creator account to prevent spam-applying to every campaign on the platform
- **Public campaign discovery/search:** basic rate limiting to prevent scraping

## Approach

Redis-backed rate limiting (same Redis instance as caching/queues, per 02. Caching Strategy) — sliding-window or token-bucket per IP and per authenticated user.

## Open Questions

- Exact thresholds per endpoint — reasonable to start conservative and loosen based on real usage patterns rather than guessing precisely now