# Disaster Recovery

## Purpose

What happens if the VPS or database is lost entirely — goes beyond routine backups into actual recovery process.

## Approach

- **Point-in-time recovery** for the managed Postgres provider (most managed offerings support this natively — recovering to a specific moment, not just the last nightly dump) — this matters specifically because a financial system needs to be able to answer "what did the database look like right before this bug/incident," not just "what did it look like last night"
- **Test restores periodically**, not just create backups and assume they work — directly from the original conversation's stated principle ("test restoring backups periodically — not just creating them")
- Infrastructure-as-config (environment variables, deployment scripts) means a new VPS can be provisioned and configured relatively quickly if the current one is lost — the actual state that matters (data) lives in managed Postgres/S3, not on the VPS itself

## Incident Response (tie-in to 10. Operations, not yet written)

A disaster recovery process needs a human process alongside the technical one — who gets alerted, who has authority to restore from backup, how users are communicated with during an outage. That operational/communication side belongs in 10. Operations once written; this doc covers the technical recovery mechanics only.

## Open Questions

- How often "periodic" test restores actually happen (monthly? quarterly?) — reasonable default is quarterly, tightened if the team has bandwidth for more
