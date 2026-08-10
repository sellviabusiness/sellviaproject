# Security Checklist

## Purpose

A single pre-launch checklist pulling together every security decision made across this section, so nothing gets missed before Private Beta.

## Checklist

- [ ]  Clerk auth configured for all three roles, MFA policy decided (Password Policy)
- [ ]  Stripe webhook signature verification implemented and tested against replay/forgery (Webhook Security)
- [ ]  Rate limiting live on checkout, application submission, and public discovery endpoints (Rate Limiting)
- [ ]  CORS restricted to production frontend origin only, `allow_credentials` paired with exact origin never wildcard (API Security, CORS/CSP & Security Headers)
- [ ]  CSP tested in Report-Only mode first, verified merchant billing card updates still work before enforcing (CORS, CSP & Security Headers)
- [ ]  Standard security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) live at the Nginx/Cloudflare layer
- [ ]  No secrets committed to source control; production secrets isolated from local/staging (Secrets Management)
- [ ]  HTTPS enforced everywhere, no mixed content (Encryption)
- [ ]  Row-level scoping verified on every Merchant/Creator-facing endpoint — manually test that one Merchant cannot view another Merchant's data by ID manipulation (Authorization)
- [ ]  Fraud rule thresholds set and monitored from day one, even if conservative (Fraud Prevention)
- [ ]  Audit log (03. Database) capturing all commission-rate changes, status changes, and Admin actions
- [ ]  Two-layer error handling verified: no raw stack traces/exceptions ever reach a user-facing response; every boundary (API routes, background jobs, webhooks, payment callbacks) has explicit catch-and-log (Error Handling & Logging Pipeline)
- [ ]  Error-path test suite passing in CI — deliberately triggered failures return safe messages AND are confirmed logged, not just one or the other

## Open Questions

- None — this checklist should be revisited and re-run before every major release, not just once before launch.

## Update (2026-08-04): Tenant Isolation Gate Added

- [ ]  Tenant Isolation Audit's four identified gaps closed: DB row-level scoping structurally enforced (not just convention), background job payloads carry tenant context, file storage per-tenant key scoping, tenant-tagged logging
- [ ]  Cross-Tenant Isolation Testing suite passing in CI — built after MVP is functionally complete, required to pass before Private Beta, not just before Public Launch
- [ ]  Cache keys audited against 02. Caching Strategy's mandatory tenant-prefix rule — no unscoped keys for tenant-private data, public/private namespaces never collide

## Update (2026-08-04): Accessibility Gate Added

- [ ]  Full keyboard navigation verified across both dashboards, hosted checkout, and public site — including custom components built on top of shadcn/ui, not just the library defaults
- [ ]  Screen reader pass complete: form ARIA attributes, image alt text (including product images — requires the alt-text field added to File Storage's schema), labeled icon-only buttons, `aria-live` on async status updates
- [ ]  WCAG AA contrast verified with a real tool against [design.md](http://design.md)'s actual hex values — lime-as-text specifically resolved (background/border/icon use only if it fails as body text)
- [ ]  Refund/chargeback clawback logic tested against a real Stripe test-mode refund