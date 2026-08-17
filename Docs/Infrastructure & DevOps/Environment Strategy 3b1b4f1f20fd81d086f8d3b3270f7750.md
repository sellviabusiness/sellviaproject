# Environment Strategy

## Purpose

Separating local development, staging, and production — directly from the earlier environment-strategy conversation, now the confirmed approach.

## Environments

| Environment | Domain | Database | Paddle mode | Purpose |
| --- | --- | --- | --- | --- |
| Local | [localhost:3000](http://localhost:3000) | sellvia_local | Test | Individual development |
| Staging | [staging.wesellvia.com](http://staging.wesellvia.com) | sellvia_stage | Test | Pre-production testing, near-exact copy of prod |
| Production | [wesellvia.com](http://wesellvia.com) | sellvia_prod | Live | Real users, real money |

## Separation Rules (all from the original conversation, all still binding)

- Never share a database between environments
- Separate file storage buckets per environment
- Paddle test mode for Local/Staging, live mode only for Production — this is especially critical now that SellVia is a real hosted-checkout payments system, not just a tracking tool; a test/live mixup here would mean real cards charged in a test environment or vice versa
- Separate email sending (no risk of emailing real customers during staging tests)

## Deployment Flow

```text
feature/* branch → develop branch → Staging → main branch → Production
```

Nothing goes straight to Production. Every release passes through Staging first, which mirrors Production closely enough (per the original conversation) that a Staging pass is meaningful signal.

## Configuration

Environment variables control all environment-specific behavior (`DATABASE_URL`, `PADDLE_API_KEY`, `CLERK_SECRET_KEY`, `PAYMENT_MODE`, etc.) — code itself never branches on environment name.

## Open Questions

- None blocking — this section is essentially a direct transcription of already-agreed environment strategy into the permanent documentation.
