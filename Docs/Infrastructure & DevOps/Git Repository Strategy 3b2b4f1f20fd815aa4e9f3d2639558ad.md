# Git Repository Strategy

## Purpose

How the codebase is organized in version control, and how changes flow through branches — resolves the open question left in CI/CD Pipeline ("monorepo vs. two separate repos — not yet decided").

## Decision: Monorepo

**One repository, not two.** Given the team size (solo founder, possibly small team later) and that frontend (Next.js) and backend (FastAPI) changes often need to move together — a new API endpoint and the frontend code calling it, a schema change and the frontend types that reflect it — a monorepo keeps those changes atomic and reviewable in one PR instead of coordinating two separate PRs across two repos. Same reasoning as the earlier monolith-vs-microservices call: fewer moving parts for the current team size, not a permanent architectural commitment.

## Structure

```
sellvia/
  apps/
    frontend/     — Next.js + shadcn/ui + Tailwind
    backend/      — FastAPI + SQLAlchemy
  packages/
    shared-types/ — if/when frontend and backend need a shared contract (e.g. generated from the OpenAPI spec, 09. UX → AI Agent & Machine Readability already notes FastAPI generates this for free)
  .github/workflows/  — separate CI jobs per app, triggered by path (see below)
```

## CI Runs Only What Changed

GitHub Actions jobs scoped by path filters — a frontend-only change doesn't trigger backend tests/deploy and vice versa (06. Infrastructure → CI/CD Pipeline's "two independent deploy paths" already established this at the deploy level; this doc extends the same principle to CI itself, so a small frontend fix isn't blocked waiting on unrelated backend test runs).

## Branching Strategy

- **`main`** — production. Protected: no direct pushes, requires a passing PR with required checks green.
- **`develop`** — staging. Same protection, slightly lower bar (still requires checks, doesn't require the manual-approval step `main` does per CI/CD Pipeline).
- **`feature/*`** — short-lived, one per feature/fix, branched from `develop`, PR'd back into `develop`. Deleted after merge — no long-lived feature branches accumulating drift.

## Commit Convention

Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, etc.) — low-cost to adopt, enables auto-generated changelogs later, and makes `git log` actually scannable once the repo has real history.

## Tagging

Every Production deploy gets a semantic version tag (`v0.3.1`) on `main` — ties a specific commit to a specific point-in-time production state, which matters directly for 06. Infrastructure → Disaster Recovery ("what did the system look like right before this incident") and for correlating a bug report with the exact code that shipped it.

## Secrets Never Enter Git

Direct continuation of 04. Security → Secrets Management — `.env` files gitignored everywhere, no exceptions, in both `apps/frontend` and `apps/backend`.

## Revisit When

If the team grows enough that Frontend and Backend become separately-owned by different people/teams needing independent release cadences and access control, splitting into two repos becomes worth the coordination overhead it currently isn't — not before then.

## Open Questions

- None blocking — this closes the open question from CI/CD Pipeline; revisit only under the "team grows" condition above.

## Update (2026-08-04): Service-Scoped Feature Branch Naming

**Every feature branch is named with its service prefix**, so it's immediately clear what a branch touches without opening it:

```
feature/frontend/checkout-page-redesign
feature/backend/payout-batching-job
feature/backend/refund-clawback
feature/frontend/creator-dashboard-earnings
```

For a change that genuinely spans both (e.g. a new API endpoint + the frontend code calling it — the exact case that justified the monorepo decision), name it without a service prefix: `feature/campaign-commission-locking`. The naming convention is a clarity aid, not a hard rule that forces artificially splitting a cross-cutting change into two branches/PRs.

**Explicitly not adopted:** long-lived standing branches per service. That was considered and rejected — long-lived branches increase risk (drift, larger/harder-to-review merges) rather than reducing it. The actual mechanism protecting each service from the other's changes is path-scoped CI and independent deploy paths (already established above and in CI/CD Pipeline), not branch longevity. Feature branches stay short-lived regardless of the service-prefix naming.