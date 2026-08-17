# Docker Strategy

## Purpose

Whether/how containerization is used — flagged as an open decision in the original conversation ("if we decide to use it"), still open now.

## Considerations

- **For:** consistent environment across Local/Staging/Production, easier onboarding for a future second developer, cleaner dependency isolation
- **Against:** adds a layer of operational complexity (image builds, registry, orchestration) that may not be justified for a single-VPS MVP deployment

## Recommendation

Given the current scale (single VPS, small team), Docker is a **reasonable but not required** addition — the CI/CD Pipeline and VPS Setup docs work fine without it (direct Node process managed by PM2, for example). Consider adopting Docker if/when the team grows, or if moving toward multiple VPS instances / container orchestration becomes necessary.

## Open Questions

- Final yes/no on Docker for MVP — explicitly left open in the original conversation and still genuinely undecided; not something to default silently given it affects the whole deployment pipeline design

## Update (2026-08-07): RESOLVED — Yes, for Local Dev

**Founder confirmed a second team member joining** (frontend/testing), which is exactly the trigger condition this doc named for reconsidering Docker — "a future second developer" needing consistent onboarding. **Decided: use Docker for local development**, specifically to avoid "works on my machine" drift between two different machines/OSes now that there genuinely are two. Production/VPS deployment stays as already designed (direct process, not containerized) — this is a local-dev-only decision, not a change to hosting.
