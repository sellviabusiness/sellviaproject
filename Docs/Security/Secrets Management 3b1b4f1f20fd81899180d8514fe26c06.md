# Secrets Management

## Purpose

How API keys and credentials are stored and rotated.

## Approach

- Environment variables per environment (Local / Staging / Production), never hardcoded — directly continues the pattern from the earlier infrastructure conversation (`DATABASE_URL`, `API_KEY`, `PADDLE_API_KEY`, `CLERK_SECRET_KEY`, etc.)
- **Production secrets never exist in a developer's local `.env` file** — managed through the hosting provider's secret storage or a dedicated secrets manager, not passed around manually
- Paddle and Clerk both provide separate test/live key pairs — test keys in Local/Staging, live keys only in Production, matching the existing environment-separation principle

## Rotation

- Recommended default: rotate Paddle/Clerk API keys if a leak is ever suspected, and periodically (e.g. annually) as routine hygiene — not a pressing MVP concern but worth documenting the expectation now rather than never

## Open Questions

- None blocking for MVP — revisit if the team grows beyond a size where informal secret-sharing practices still work safely.

## Update (2026-08-04): Clerk → Ory Kratos

Wherever "Clerk" appears above (API keys, dispute-fee-style periodic rotation), read as **Ory Network / Ory Kratos** — provider switched in 04. Security → Authentication. Same rotation discipline applies to Kratos's API credentials.
