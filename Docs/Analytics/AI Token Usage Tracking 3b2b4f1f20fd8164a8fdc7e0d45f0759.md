# AI / Token Usage Tracking

## Purpose

Per-feature cost visibility for every AI/LLM call — extends 02. Technical Architecture → AI Services, which didn't originally track cost.

## Mechanism

Every call inside the `ai_services` module (matching/embeddings, screening, copy_assist) logs a row to a new `ai_usage_events` table:

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK |  |
| feature | enum | matching / screening / copy_assist |
| tokens_in | integer |  |
| tokens_out | integer |  |
| cost_cents | integer | computed from provider's per-token pricing at call time |
| related_user_id | uuid, nullable | which Merchant/Creator this call was for, if applicable |
| related_entity_type | text, nullable | e.g. "application", "campaign" — what triggered the call |
| created_at | timestamptz |  |

## Why Per-Call, Not Aggregated at Write Time

Logging every individual call (not just a running total) means cost-per-feature, cost-per-user, and cost trends over time can all be computed later from the same raw data, rather than needing to decide upfront exactly which aggregations matter — consistent with 03. Database's general preference for auditable, granular financial-adjacent records over pre-aggregated numbers.

## What This Feeds

- **Per-feature dashboards** (11. Analytics → Dashboards): "matching cost $X this month, screening cost $Y" — directly answers whether a specific AI feature is worth its cost
- **Unit Economics** (11. Analytics): AI cost is one component of cost-per-user, summed from this table filtered by `related_user_id`
- **Monthly P&L** (11. Analytics): total AI/token cost line item

## Open Questions

- Whether caching (already recommended in AI Services — e.g. cached screening summaries) means a cache-hit should still log a $0-cost event for completeness, or simply not log anything — recommend logging a $0 event so usage volume is still visible even when cost is avoided