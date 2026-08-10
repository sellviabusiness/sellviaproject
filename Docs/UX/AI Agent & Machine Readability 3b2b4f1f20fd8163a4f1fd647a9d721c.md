# AI Agent & Machine Readability

## Purpose

Make SellVia's public-facing content and API legible to AI agents — shopping/browsing agents acting on a user's behalf, LLM crawlers indexing for AI search, and third parties integrating programmatically — not just human visitors and screen readers (09. UX → Accessibility covers that adjacent but distinct concern).

## 1. Structured Data ([schema.org](http://schema.org) JSON-LD)

Every public Campaign/checkout page gets `Product` and `Offer` [schema.org](http://schema.org) markup embedded as JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Glow Serum",
  "offers": {
    "@type": "Offer",
    "price": "68.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
}
```

This is what lets an AI shopping agent (or a search engine's AI answer) correctly understand price, availability, and product identity without guessing from rendered text — directly relevant given SellVia's whole checkout now lives on SellVia's own hosted page (01. Business Logic → Money Flow) rather than the merchant's site, so SellVia's markup is the *only* structured signal available for these products.

## 2. Semantic HTML — Shared Payoff With Accessibility

Proper landmark elements (`<nav>`, `<main>`, `<article>`, correct heading hierarchy) and meaningful element structure benefit screen readers (09. UX → Accessibility) and AI agents/crawlers identically — both are parsing structure, not just rendered pixels. This isn't duplicate work; building it once correctly serves both audiences.

## 3. OpenAPI Spec — Already Free With FastAPI, Just Needs Using

FastAPI auto-generates an OpenAPI/Swagger spec (`/openapi.json`, human-viewable at `/docs`) from the route definitions in 07. API → Endpoint Specifications, with zero extra work beyond writing clean type hints and docstrings on route handlers. This is exactly the machine-readable contract an AI agent needs to understand and call SellVia's API programmatically — worth treating route documentation quality as a real requirement, not an afterthought, specifically because it's this cheap to get right.

## 4. llms.txt for the Public Marketing Site

An emerging convention: a plain-markdown `/llms.txt` file at the site root, summarizing what SellVia is and linking to key pages, written for an LLM to parse quickly rather than crawl the full rendered site. Low effort, direct benefit for AI-search visibility (ties to the earlier GEO/AEO conversation, if that skill gets used later) — recommend adding this alongside the marketing site, not the authenticated app.

## 5. Metadata: Open Graph, Twitter Cards, Canonical URLs

Standard social/SEO meta tags on every public page (title, description, `og:image`, canonical URL) — also consumed by AI agents previewing or summarizing a link, not just social platforms. Low effort, should be part of the base page template, not per-page manual work.

## 6. robots.txt — Deliberate, Not Default-Blocked

Explicitly allow known AI crawler user-agents (e.g. GPTBot, ClaudeBot, and similar) on public marketing/campaign-discovery pages — blocking them by default (a common template default) would defeat the entire point of this doc. **Authenticated dashboard routes stay disallowed**, same as any crawler — this only applies to intentionally public content, consistent with 02. Caching Strategy's public/private namespace distinction.

## What Does NOT Get This Treatment

Authenticated Merchant/Creator dashboards, checkout session details, anything tenant-private (04. Security → Tenant Isolation Audit) — machine-readability applies only to intentionally public content and the documented API surface, never to private data. An AI agent should be able to understand what a product is and how to call the public API; it should have zero visibility into any tenant's private data, same boundary as a human without credentials.

## Open Questions

- Whether llms.txt is worth maintaining before Public Launch or is a Private-Beta-era nice-to-have — reasonable to add cheaply now alongside the marketing site rather than as a separate future task, given how little effort it takes
