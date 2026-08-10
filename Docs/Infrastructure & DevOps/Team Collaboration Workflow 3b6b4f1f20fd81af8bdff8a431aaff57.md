# Team Collaboration Workflow

## Purpose

How a two-person team (Backend/complex logic + Frontend/testing) actually works day to day on this codebase — the practical layer on top of Git Repository Strategy, which already designed the repo structure with exactly this split in mind.

## Team Split

- **Backend + complex logic** — FastAPI, database, business logic, payments/billing, security
- **Frontend + testing** — Next.js, UI, QA against Staging, running the automated test suites (Cross-Tenant Isolation Testing, Error-Path Testing)

## What's Already Built For This Split

- **Monorepo** (`apps/frontend`, `apps/backend`) — one repo, no coordination overhead of syncing two separate repos
- **Service-prefixed branch naming** (`feature/frontend/...`, `feature/backend/...`) — always clear who's touching what at a glance
- **Path-scoped CI** — a frontend PR doesn't wait on backend tests and vice versa; neither person blocks the other
- **Independent deploy paths** — frontend (Vercel) and backend (VPS) ship separately

## Task Tracking

**GitHub Issues/Projects** — no third tool. One board: To Do / In Progress / In Review / Done, each person in their own lane. Avoids fragmenting work-tracking away from where the code already lives.

## PR Review

**Different rules for different stakes, not one blanket policy:**

- Routine, low-stakes changes (styling, copy, non-critical fixes): self-merge once CI passes — deep cross-specialty review isn't realistic and shouldn't be required for everything
- Anything touching money, checkout, or the financial chain: **the other person reviews before merge**, even without deep backend expertise — a second pair of eyes catches obvious mistakes and keeps both people aware of what's changing in the highest-stakes part of the product. Ties directly to 06. Feature Flags Strategy's existing "extra scrutiny for financial-chain changes" rule.

## Local Development — Docker (resolved 2026-08-07)

Use Docker for local dev, specifically to avoid environment drift between two different machines — see 06. Docker Strategy for the resolved decision. Production/VPS deployment is unaffected, this is local-only.

## Environments

- **Testing happens against Staging, never directly against Production** — unchanged from 06. Environment Strategy, now has a concrete owner (the frontend/testing half of the team runs QA passes here before anything promotes)
- Local → Staging → Production flow is unchanged; both people work the same way through it

## Testing Ownership

The frontend/testing half of the team owns:

- Manual QA pass on Staging before each Production promotion
- Running and verifying 04. Cross-Tenant Isolation Testing and 06. Error Handling & Logging Pipeline's error-path test suite — doesn't require writing the backend logic being tested, just verifying it catches what it should

## Access Checklist for Onboarding a Second Person

- [ ]  GitHub repo, write access
- [ ]  Notion workspace (full documentation)
- [ ]  Staging environment credentials
- [ ]  Design files (Figma or equivalent), if applicable
- [ ]  **Never** Production secrets or live Paddle keys unless specifically needed for their role

## Communication

Not prescribing a specific tool here — a lightweight daily or weekly check-in habit matters more than which app it happens in. Worth agreeing on a cadence explicitly rather than assuming it'll happen organically.

## Open Questions

- None blocking — this is a practical operating doc, revise as the team's actual working rhythm reveals what works.