# Versioning

## Purpose

How the API evolves without breaking existing clients.

## Approach

`/api/v1/*` from day one (per REST Standards), even with only one client (SellVia's own frontend) — costs nothing now, avoids a painful retrofit if a public API or third-party integration (e.g. the deferred Shopify webhook integration) is added later.

## When v2 Would Be Needed

- A breaking change to an existing resource shape that existing clients depend on
- Not anticipated for MVP — this doc exists mainly to record the convention, not because a v2 is imminent

## Open Questions

- None blocking.
