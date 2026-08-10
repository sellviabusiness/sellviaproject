# Webhook Security

## Purpose

Securing the Stripe webhook endpoint specifically — this is one of the highest-value attack surfaces in the whole system, since a forged webhook could fake a "sale" or "payout" event.

## Non-Negotiable Practices

- **Verify Stripe's webhook signature on every single request**, using Stripe's signing secret — reject anything that doesn't verify, no exceptions, regardless of how urgent or legitimate a request might look
- Webhook endpoint is not authenticated via Clerk (Stripe isn't a logged-in user) — signature verification is the entire trust mechanism here, which is exactly why it can't be skipped or relaxed
- Idempotent processing (see 02. Event-Driven Architecture) — a replayed or duplicated webhook must never double-credit a wallet or double-trigger a payout

## Why This Is Called Out Separately From API Security

Because this endpoint is deliberately unauthenticated (it has to be, since it's called by Stripe, not a logged-in user), it's a fundamentally different threat model than the rest of the API — worth its own explicit doc rather than being buried inside general API Security.

## Open Questions

- None blocking — this is a well-established pattern (Stripe's own documentation covers this exact setup); the requirement here is discipline in implementation, not a design decision.