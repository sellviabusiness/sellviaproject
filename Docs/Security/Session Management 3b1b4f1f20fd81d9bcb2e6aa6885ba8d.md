# Session Management

## Purpose

How a logged-in session stays valid, and how it ends.

## Approach

Handled by Clerk (per 04. Security → Authentication) rather than custom-built — Clerk issues and manages session tokens, refresh, and expiry.

## Session Rules

- Session tokens are short-lived and auto-refreshed by Clerk's SDK — SellVia's backend never needs to manage refresh logic itself
- Logout invalidates the session immediately on Clerk's side
- **Sensitive actions get a re-auth prompt (recommended default, please confirm):** actions like changing payout bank details or triggering a manual payout should require a fresh session check, not just an existing valid token, given they touch real money

## Open Questions

- Whether "remember me" / long-lived sessions are offered, or every session expires on a shorter fixed window — reasonable default is Clerk's standard session length unless there's a specific reason to shorten it for a financial app

## Update (2026-08-04): Concrete Session Parameters

**Session expiration: 14-day maximum lifetime**, configured directly in Clerk's session settings — after 14 days a session expires absolutely, regardless of activity, forcing re-login. Clerk's auto-refresh (already noted above) operates within this ceiling, not around it.

**Concurrent session limit: 5 sessions per account** (working default, please confirm) — e.g. phone, laptop, tablet, plus headroom, without being unlimited. Applies to Merchant and Creator accounts; **Admin may reasonably need a higher limit** given 10. Operations → Founder AI Command Console likely running alongside a standard dashboard session — worth deciding as a distinct Admin-specific value rather than assuming the same cap fits both, but not yet set.

**Instant session revocation** — triggers:

- User-initiated "log out all other devices"
- Automatic on password change (standard practice: changing a password should kill every other existing session, not just the one making the change)
- Admin-initiated on account suspension (10. Operations → Moderation)
- Automatic when 04. Security → IP Anomaly Detection & Escalation's risk score crosses the ban threshold for a session's associated IP

## The Honest Nuance on "Instant"

Worth knowing before assuming this is free: Clerk issues short-lived session JWTs that refresh periodically (commonly on the order of ~60 seconds by default) rather than being re-verified against Clerk's backend on every single request — this keeps most requests fast, but it means a revoked session's cached token could still work for up to that refresh window, not truly zero-latency.

**Resolution: tiered verification, not one-size-fits-all.** Standard routes rely on the cached JWT (near-instant, refresh-window-bound revocation — acceptable for browsing campaigns or viewing a dashboard). **Sensitive actions — anything touching the financial chain, Admin actions, and anything already covered by this doc's existing re-auth-for-sensitive-actions rule — verify the session live against Clerk's backend instead of trusting the cached token**, giving genuinely instant revocation exactly where a delay would actually matter, without paying that latency cost on every request across the whole app.

## Update (2026-08-04): Re-Platformed on Ory Kratos

Auth provider switched from Clerk to Ory Kratos (04. Security → Authentication) — the parameters below carry over in substance, re-implemented on Kratos:

- **14-day session expiration** — configured as Kratos's session lifespan setting, same ceiling as before.
- **5-session concurrent limit** — Kratos exposes an admin API to list a user's active sessions; the app enforces the cap itself (revoking the oldest session when a 6th is created), since this isn't a single built-in toggle the way it might be elsewhere — straightforward to implement, just application-level logic rather than a provider setting.
- **Instant revocation — actually simpler on Kratos than it was on Clerk.** Kratos's default session model is server-validated (checked against the Kratos service on each request), not a cached JWT with a refresh window. Revoking a session via Kratos's admin API takes effect immediately, without the "near-instant vs. truly-instant" tiering the Clerk setup needed. The same triggers apply (password change, Admin suspension, IP anomaly escalation), just simpler to guarantee now.
