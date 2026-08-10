# AI Services

## Purpose

How AI/LLM features are actually implemented at initial scale — referenced from several other docs as "not yet written" until now.

## Principle

Nothing here requires custom-trained models or ML infrastructure. "AI" at this stage means calling an embeddings/LLM API from a self-contained module inside the FastAPI monolith (per Backend Architecture's modular-monolith discipline) — extractable into its own service later if it ever needs independent scaling, but not built that way now.

## Module Structure

```text
ai_services/
  embeddings.py   → generates + stores embeddings (pgvector)
  matching.py     → creator↔campaign similarity ranking
  screening.py    → LLM application-fit summaries
  copy_assist.py  → LLM campaign description drafts
```

## Feature 1: Creator ↔ Campaign Matching

- Embed each CreatorProfile's niche/bio and each Campaign's product description (one embeddings API call each)
- Store vectors in Postgres via the **pgvector** extension — no separate vector database needed
- Campaign discovery (02. Search Strategy) ranks by cosine similarity, layered on top of existing category/commission filters, not replacing them
- Recomputed via a Celery background job on Campaign/CreatorProfile create or update — never computed synchronously on a page load

## Feature 2: Application Screening Assist

- One LLM call per application generates a plain-language fit summary for the Merchant reviewing it (audience niche, conversion rate, alignment with the campaign)
- Synchronous call, but result is cached per application — never regenerated on repeat views

## Feature 3: Campaign Copy Assist

- Merchant provides minimal input (product name, price); LLM drafts an editable campaign description
- Directly addresses the original raw data doc's goal of reducing friction for non-marketer merchants

## Feature 4: Disclosure Nudge — Deliberately Templated, Not Generative

- FTC-required affiliate disclosure text is legally sensitive; **this stays a fixed, reviewed template** inserted at link-generation time, not LLM-generated fresh each time. Consistency and legal review matter more than personalization here.

## Explicitly Out of Scope for "Initial Level"

- **Fraud/anomaly detection stays rules-based** (04. Security → Fraud Prevention, Mission & Principles → "rules before AI") — no training data exists yet, and a wrong ML call on someone's real earnings is a worse failure mode than an over-cautious deterministic rule. Revisit only once there's real transaction volume to train against.
- No custom-trained models of any kind at this stage — every feature above is an API call to an existing embeddings/LLM provider, not something SellVia trains itself.

## Cost & Caching Discipline

LLM/embedding API calls cost money per call — every feature above is designed to cache results and only recompute on actual data changes (new/updated Campaign or CreatorProfile), not on every request, to keep this affordable at MVP scale.

## Open Questions

- Specific embeddings/LLM provider choice — not decided, reasonable to pick based on cost/quality once ready to implement
- Whether screening summaries and copy drafts need a human-editable "regenerate" option in the UI, or are one-shot suggestions — a UX decision for 09. UX, not blocking this doc
