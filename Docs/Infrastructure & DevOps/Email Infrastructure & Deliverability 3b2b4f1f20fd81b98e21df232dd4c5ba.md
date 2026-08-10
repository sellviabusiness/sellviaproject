# Email Infrastructure & Deliverability

## Purpose

How email is organized, authenticated, monitored, and what actually gets sent — a full email system, not just a "send email" afterthought.

## Domain Strategy: Dedicated Subdomains, Not Unrelated Domains

**Decided: separate sending subdomains of [wesellvia.com](http://wesellvia.com), not fully unrelated domains** — gets the requested reputation isolation between email types without losing brand recognition in the "From" address, which unrelated domains can actually cost you (an email from a domain that doesn't match your brand can itself look more suspicious to spam filters and recipients, working against the goal rather than for it).

```
mail.wesellvia.com     → transactional (receipts, payouts, password/security)
news.wesellvia.com     → marketing (waitlist updates, product news)
```

Each subdomain gets its own SPF, DKIM, and DMARC records, and its own sending reputation — a marketing email with a high spam-complaint rate does not damage the deliverability of a "your payout was sent" email, which needs the highest possible reliability.

## The Clerk Boundary — A Real Decision Point

Clerk sends some transactional email itself by default (email verification, password reset/change — directly relevant given "pass change" was named explicitly). Two options:

1. **Use Clerk's default sending** — simplest, but means auth emails live on Clerk's shared reputation, separate from and unmonitored by SellVia's own deliverability setup below
2. **Configure Clerk with custom SMTP** through `mail.wesellvia.com` — all transactional email, including auth, shares one consistently monitored sending domain

**Recommend option 2** for consistency with the monitoring setup below, but this depends on Clerk's plan supporting custom SMTP — needs verifying against your actual Clerk tier before assuming it's available.

## ESP Choice: Separate Providers, Not Just Separate Domains

For real reputation isolation, not just cosmetic domain separation: **a transactional-focused ESP** (e.g. Postmark, chosen specifically for transactional deliverability and built-in bounce/complaint tracking — Postmark explicitly discourages bulk/marketing mail on its transactional infrastructure) for `mail.wesellvia.com`, and **a separate marketing-focused ESP** for `news.wesellvia.com`. Two providers, two domains — a marketing sending spike or complaint rate never touches the infrastructure sending "payout sent" emails.

## Full Email List ("all necessary email to send")

**Transactional — `mail.wesellvia.com`**

- Email verification, password reset/change (via Clerk, per the boundary above)
- Application approved / rejected (01. Business Logic → Notification Logic)
- New application received (Merchant)
- AffiliateLink generated / ready
- Sale made / commission earned
- Payout threshold reached, payout sent (receipt)
- Refund processed
- New affiliate joined / campaign milestone reached
- Chargeback/dispute notice
- Fraud flag / moderation alerts (Admin-facing)
- Incident/maintenance notices (may instead route through the status page tool's own subscriber system per 10. Operations → Status Page & Incident Communication — avoid building this twice, pick one system as the source)

**Marketing — `news.wesellvia.com`**

- Waitlist confirmation and "you're in Private Beta" invitation
- Product updates / changelog
- Re-engagement ("new campaigns match your niche" — could later be powered by 02. AI Services' matching, but starts as a simple digest)

## Deliverability Monitoring — Where It Actually Lands, Not Just "Sent"

- **SPF, DKIM, DMARC** configured correctly per subdomain — the baseline without which inbox placement is unreliable regardless of ESP quality
- **Bounce and complaint webhooks** from each ESP, processed the same way Paddle webhooks are (signature-verified, enqueued, processed idempotently — 02. Event-Driven Architecture's pattern reused here, not reinvented)
- **DMARC aggregate reports (rua)** — shows actual pass/fail rates and catches any spoofing attempts using your domain, monitored on an ongoing basis, not just checked once at setup
- **Periodic inbox-placement testing** (tools like GlockApps or mail-tester) — actually verifies landing in Gmail/Outlook/etc. inbox vs. spam, run before launch and periodically after, not assumed to stay correct forever once configured

## Environment Separation Still Applies

This is a second axis on top of the existing Local/Staging/Production separation (06. Infrastructure → Environment Strategy, which already established "separate email sending" per environment) — Staging never sends to real inboxes regardless of transactional/marketing split; both streams get their own sandboxed staging configuration.

## Open Questions

- Whether Clerk's plan supports custom SMTP (blocks the "option 2" recommendation above until confirmed)
- Specific ESP choices — Postmark named as a reasonable transactional default; marketing ESP not yet chosen, reasonable to pick based on feature needs (segmentation, automation) once ready