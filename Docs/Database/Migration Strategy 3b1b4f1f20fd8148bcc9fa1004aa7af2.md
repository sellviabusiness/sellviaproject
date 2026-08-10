# Migration Strategy

## Purpose

How schema changes are made safely, especially given production will hold real financial data.

## Approach

- Migrations are version-controlled files (e.g. via Prisma Migrate, consistent with the ORM choice in Database Design), never manual schema edits against production
- Every migration runs against staging first (per the earlier environment-strategy conversation — [staging.wesellvia.com](http://staging.wesellvia.com) is described as "an almost exact copy of production")
- Additive-first philosophy: prefer adding a nullable column and backfilling over destructive changes (dropping/renaming columns) wherever possible, to avoid downtime or data loss on a live payments system

## Rollback Strategy

- Every migration should have a corresponding down-migration where feasible
- For genuinely irreversible changes (e.g. a backfill that computes derived data), take a database snapshot immediately before running in production — ties into the nightly-backup practice already established in the infra conversation

## Sequencing With Deploys

- Migrations run as a distinct step before the new application code deploys (not bundled into app startup), so a failed migration doesn't leave the app running against a schema it doesn't expect

## Open Questions

- None blocking — this is a standard, conservative approach appropriate given the earlier-stated environment-separation priorities.

## Update (2026-08-03): Alembic replaces Prisma Migrate

Following the FastAPI/SQLAlchemy switch, **Alembic** is the migration tool, not Prisma Migrate. All the principles above (staging-first, additive-first, down-migrations where feasible, snapshot before irreversible changes, migrations run as a distinct pre-deploy step) carry over unchanged — only the specific tool changes.
