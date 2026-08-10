# Authentication

## Purpose

How users prove who they are, and how that identity maps onto Merchant/Creator/Admin roles.

## Decision (2026-08-04, superseding earlier Clerk choice): Ory Kratos

**Switched from Clerk to Ory Kratos** — a self-hosted, language-agnostic, API-first identity system. This resolves a real compatibility gap: Clerk worked fine from Python via JWKS verification, but the underlying architectural question (own the identity layer vs. rent it) is now decided in favor of ownership, given cost-at-scale and vendor lock-in were already flagged as real long-term concerns in the original Clerk migration-path doc.

**Why Kratos over Authentik** (the other option considered): Kratos is purpose-built for consumer-facing identity (signup, login, sessions, MFA, password reset) — exactly SellVia's Merchant/Creator/Admin use case. Authentik leans toward enterprise internal SSO (a self-hosted Okta alternative) — heavier than needed here.

**Why this doesn't repeat the Better Auth problem:** Kratos is a pure REST/JSON API, not a language-specific library. The FastAPI backend calls it over HTTP like any other external service (Paddle, Supabase) — no TypeScript coupling, no separate Node service required.

## Deployment: Ory Network First, Self-Hosted Later

Same staged pattern already used for the database (Supabase → Neon):

- **MVP: Ory Network** — Ory's managed hosting of Kratos. Gets the managed-service simplicity (no patching, no uptime ownership) while staying on the portable, open Kratos API.
- **Scale trigger: self-hosted Kratos** — revisit once cost or a specific control requirement makes managed hosting the wrong fit, same reasoning as the Supabase→Neon trigger. Migration is operational (stand up self-hosted Kratos, point the same API calls at it), not architectural, since it's the same API either way.

## Role Mapping

- Kratos identities carry `traits` (its term for user profile/metadata) — role (Merchant/Creator/Admin) stored there, read from the verified session on every request, same principle as before: never trust a client-supplied role claim.
- A dual-role user (Merchant + Creator) still has two separate contexts per the existing User Roles doc — unaffected by this provider change.

## What Kratos Handlesn- Registration, login, session issuance and verificationn- Password reset / email verification flows (routed through the transactional email domain, 06. Infrastructure → Email Infrastructure — the earlier "Clerk boundary" question about who sends auth emails is now moot: Kratos sends them, configured against `mail.wesellvia.com`)n- MFA (04. Security → Password Policy's existing MFA stance carries over unchanged)n- Session lifecycle — see Session Management for the specific parameters, largely unchanged in substance, re-implemented on Kratos instead of Clerknn## Open Questionsn- Exact self-host trigger conditions (cost threshold, specific missing capability) — not yet quantified, same open-ended trigger pattern as the Supabase→Neon decisionn- Social login provider configuration in Kratos (Google, etc.) — needs setup, not yet detailed
