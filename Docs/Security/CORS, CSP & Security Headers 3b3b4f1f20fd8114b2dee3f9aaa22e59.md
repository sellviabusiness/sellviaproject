# CORS, CSP & Security Headers

## Purpose

CORS, Content-Security-Policy, and the rest of the standard security header set — real gaps, not previously addressed beyond a one-line CORS mention in 04. Security → API Security.

## CORS — Why It Matters Here Specifically

Since the FastAPI switch (Architecture Decision Log), frontend (Next.js) and backend (FastAPI) are genuinely separate origins — likely different subdomains (e.g. `app.wesellvia.com` and `api.wesellvia.com`). The browser blocks cross-origin requests by default; CORS is what explicitly permits the frontend to call the backend at all.

**Configuration, per environment (ties to 06. Environment Setup Guide):**

```python
CORSMiddleware(
    allow_origins=[FRONTEND_ORIGIN],   # exact origin per environment, never "*"
    allow_credentials=True,            # required since Ory Kratos sessions use cookies
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
```

**Critical detail:** `allow_credentials=True` legally cannot be paired with a wildcard origin per the CORS spec itself — the exact origin must be listed explicitly. This isn't optional given Ory Kratos's cookie-based sessions (04. Security → Authentication); a wildcard would silently break login rather than just being a lesser security practice.

**Public read endpoints** (campaign discovery, per 07. API → Endpoint Specifications) are a separate question from browser CORS — CORS governs cross-origin browser JavaScript, not server-to-server calls or crawler access (09. UX → AI Agent & Machine Readability's robots.txt is a different, unrelated mechanism). If these endpoints are only ever called from SellVia's own frontend, they follow the same restricted-origin rule above; only widen this if a genuine third-party browser-based integration is planned.

## Content-Security-Policy — The Paddle Constraint (narrower surface after 2026-08-07 reversal)

**Getting this wrong breaks merchant billing card updates, not customer checkout** — since checkout moved to the merchant's own site (01. Money Flow, reversed 2026-08-07), Paddle Checkout now only appears on SellVia's merchant billing settings page (02. Frontend Architecture), not on any follower-facing surface. Still a real failure mode worth guarding against — a merchant unable to update their card on file is a real problem — just a smaller blast radius than before. Required allowances (same as before, now scoped to a narrower page rather than the whole public app):

```text
script-src 'self' https://js.paddle.com
frame-src https://js.paddle.com
connect-src 'self' https://api.paddle.com
style-src 'self' 'unsafe-inline'   (Tailwind/shadcn may need this — verify, prefer nonces if avoidable)
font-src 'self'                    (self-hosted via next/font, per 09. UX → Design System — avoids third-party font CSP complexity entirely)
img-src 'self' data: https:        (product images, per 03. Database → File Storage)
```

**Rollout approach:** start with `Content-Security-Policy-Report-Only` (logs violations without blocking anything) before switching to enforcing `Content-Security-Policy` — CSP misconfiguration is a real way to silently break merchant card updates in production; report-only mode catches this before it's user-facing, not after.

**Prefer nonces over `unsafe-inline` for scripts** where Next.js supports it (via middleware-generated nonces) — `unsafe-inline` on `script-src` specifically defeats a large part of what CSP protects against (XSS).

## Standard Security Headers

| Header | Value | Purpose |
| --- | --- | --- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Forces HTTPS, extends the "HTTPS enforced everywhere" principle already established (04. Security → Encryption) into an enforced browser-level guarantee |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-sniffing attacks |
| `X-Frame-Options` | `DENY` | Clickjacking protection (belt-and-suspenders alongside CSP's `frame-ancestors`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Reasonable default, doesn't leak full URLs to third parties |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | SellVia doesn't need any of these browser features — explicitly deny by default |

## Where These Get Set

**Split by what each layer actually knows:**

- **CORS:** FastAPI backend itself (needs to know its own allowed frontend origin per environment)
- **CSP:** Next.js frontend (needs to know its own actual script/style/asset sources — setting this generically at the edge would be guesswork)
- **Standard headers (HSTS, X-Content-Type-Options, etc.):** Nginx (06. Reverse Proxy) or Cloudflare, applied uniformly across everything behind it — no reason for every service to redundantly set these itself

## Open Questions

- Whether Tailwind/shadcn in practice requires `unsafe-inline` on `style-src` or can run cleanly without it — verify empirically once the frontend is far enough along to test against a real CSP in report-only mode
