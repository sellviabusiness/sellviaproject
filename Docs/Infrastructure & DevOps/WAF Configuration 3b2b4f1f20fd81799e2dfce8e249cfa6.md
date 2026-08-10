# WAF Configuration

## Purpose

Block common attack patterns (SQLi, XSS, malicious bots) at the edge, before they reach the FastAPI backend at all.

## Decision: Cloudflare WAF, not a separate service

Cloudflare is already the DNS/CDN/DDoS layer in front of everything (06. Infrastructure → Hosting Strategy, CDN Strategy) — enabling **Cloudflare's WAF** is the lowest-friction choice: no new vendor, no new integration point, no new place for a misconfiguration to hide. A separate WAF service would mean routing traffic through yet another hop for no clear benefit at this scale.

## Configuration

- **Managed ruleset:** Cloudflare's OWASP Core Ruleset enabled, covering common injection/XSS/known-exploit patterns out of the box
- **Bot Fight Mode / Super Bot Fight Mode:** enabled to challenge or block automated non-browser traffic before it reaches the app
- **Custom rate-based rules** on the highest-value targets specifically:
    - `/checkout/*` — the single most attractive target for card-testing fraud (04. Security → Fraud Prevention already names this risk; WAF is the first line of defense before it ever reaches that application-level fraud logic)
    - `/auth/*` (Clerk-fronted, but still worth edge-level brute-force protection)
    - Public campaign discovery/search endpoints (scraping protection, per 02. Search Strategy)

## Critical Exception: Paddle Webhooks Must Be Allowlisted

**The WAF must not block Paddle's webhook calls to `/webhooks/paddle`.** Aggressive bot-fighting or rate-based rules could otherwise treat Paddle's legitimate, high-frequency webhook deliveries as abuse — which would silently break Sale/Payout state updates (04. Security → Webhook Security already establishes signature verification as the trust mechanism there; the WAF shouldn't add a second, uncoordinated layer that can reject legitimate Paddle traffic before signature verification even runs). Allowlist Paddle's published webhook IP ranges explicitly for this endpoint.

## Logging

WAF block/challenge events feed into Monitoring (06. Infrastructure) — a spike in WAF blocks is itself a signal worth alerting on, not just silently absorbed.

## Open Questions

- Exact custom rule thresholds (requests/minute per rule) — reasonable to start with Cloudflare's recommended defaults and tighten based on real traffic patterns rather than guessing precise numbers now