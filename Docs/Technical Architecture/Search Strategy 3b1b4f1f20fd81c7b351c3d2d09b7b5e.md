# Search Strategy

## Purpose

How creators find campaigns to promote, and how merchants find/review creators.

## MVP: Structured Filtering, Not Full-Text Search

Given the raw data doc's original design ("browse/join campaigns by category: digital vs physical") and the case study's emphasis on reducing complexity, MVP search doesn't need a dedicated search engine (e.g. Elasticsearch) — simple database filtering/sorting on structured fields covers it:

- Filter by category (digital/physical), commission rate range, niche tag
- Sort by newest, highest commission, most applications (popularity signal)

## Post-MVP: AI-Assisted Matching

As discussed in the AI integration conversation, semantic creator↔campaign matching (matching a creator's niche/audience against product category/description, not just exact category filters) is a strong post-MVP candidate — see AI Services (this section) for how that would layer on top of this basic filtering rather than replace it.

## Open Questions

- Whether tags/niches are a fixed taxonomy (simpler, easier to filter) or free-text (more flexible, harder to search cleanly) — recommend a fixed taxonomy of niches for MVP, expand as real usage reveals gaps
