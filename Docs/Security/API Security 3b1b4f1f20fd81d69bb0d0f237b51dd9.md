# API Security

## Purpose

Securing the API surface beyond authentication/authorization — covers the request/response layer itself.

## Practices

- HTTPS-only, enforced at the Cloudflare/Nginx layer (see 06. Infrastructure)
- Input validation on every endpoint (reject malformed payloads before they reach business logic)
- CORS restricted to SellVia's own frontend origin(s) — no wildcard origins, especially given authenticated financial data flows through this API
- No sensitive data (Paddle secret keys, full card numbers — which SellVia never sees anyway per Encryption) ever appears in API responses or logs

## Open Questions

- None blocking — standard practice given the stack already chosen (Next.js API routes behind Cloudflare).

## Update (2026-08-04): Full CORS/CSP/Headers Spec Written

The CORS line above is now fully specified, alongside CSP and the standard security header set, in 04. Security → CORS, CSP & Security Headers — including the specific Paddle CSP allowances required to avoid silently breaking checkout.
