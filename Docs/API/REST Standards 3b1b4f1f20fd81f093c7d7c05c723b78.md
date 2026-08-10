# REST Standards

## Purpose

Baseline conventions every endpoint follows — companion to 02. API Design's higher-level philosophy.

## Base

- REST, JSON request/response bodies
- Base path: `/api/v1/*` (versioned from day one, even if v2 isn't needed yet — cheap to add now, costly to retrofit)

## Resource Naming

- Plural nouns: `/campaigns`, `/applications`, `/sales`, `/payouts`, `/offers`
- Nested where the relationship is owned: `/campaigns/:id/applications` (applications belonging to a specific campaign)

## Standard Response Shape

```json
{
  "data": { ... },
  "meta": { "page": 1, "per_page": 20, "total": 143 }
}
```

`meta` only appears on paginated list endpoints.

## HTTP Methods

- GET (read), POST (create), PATCH (partial update), DELETE (soft-delete, per 03. Database → Soft Delete Policy — never a hard delete)

## Open Questions

- None blocking — standard REST conventions, low-risk to lock in now.
