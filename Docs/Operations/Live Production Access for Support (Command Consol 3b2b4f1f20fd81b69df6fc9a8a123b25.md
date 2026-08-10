# Live Production Access for Support (Command Console)

## Purpose

Defines how the Founder AI Command Console (10. Operations) connects to production data for support purposes — read access in real time, write access strictly gated, exactly as already designed there.

## This Is Not a New Trust Boundary

Confirmed with the founder directly: this is the **same console** built earlier, used for support tasks in addition to general admin tasks — not a separate agent with its own access model. Every guardrail already established there applies here without exception:

- Every action routes through existing, already-permission-checked Admin API endpoints (07. API) — never raw database access
- Read/query support tasks ("why did this payout fail," "show me this user's recent sales") execute directly
- Write/action support tasks (issuing a refund, resending a notification, unlocking an account) require explicit confirmation every time, per the console's existing rule
- Fail-closed on ambiguity — an unclear support request gets clarified, never guessed at
- Every console-initiated action is logged with `initiated_via: ai_console` (03. Database → Audit Log Design)

## What "Real Time" Means Here Specifically

The console queries live production data at the moment of the support request — not a cached or batch-synced copy — so an answer like "has this payout gone out" reflects the actual current state (05. Payments → Payout Process), not a snapshot from an hour ago. This matters specifically for support, where a stale answer ("it hasn't been sent" when it actually just went out) is worse than no answer.

## Support-Specific Tool Additions

Extends the console's existing tool set (`get_user`, `get_sales`, `suspend_user`, etc. — already defined in Founder AI Command Console) with support-oriented read tools:

- `get_ticket_context(user_id)` — pulls the user's recent activity across Sales, Applications, Payouts in one call, so a responder isn't manually cross-referencing four screens per ticket
- `get_playbook(feature_name)` — retrieves the relevant Per-Feature Support Playbook so a resolution path is suggested with the actual answer, not just raw data

## Open Questions

- None new — this doc is an application of the Command Console's existing design to the support use case, not a new set of decisions.