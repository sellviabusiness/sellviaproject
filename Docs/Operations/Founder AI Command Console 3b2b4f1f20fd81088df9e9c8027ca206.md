# Founder AI Command Console

## Purpose

A founder-only, natural-language command interface over the Admin Panel — type what you want ("show me this week's sales," "suspend this account," "why did this payout fail") and get an answer or an action, without navigating through screens. Distinct from 10. Operations → Admin Panel, which is the click-through UI this sits on top of and drives.

## Who This Is For

Founder/Admin only — not a Merchant or Creator-facing feature. This matters for risk profile: it's single-user and high-trust, which removes external-attacker concerns, but does NOT remove the risk of an AI agent misinterpreting a command and taking the wrong real-world action. Trust in the user doesn't mean trust in the AI's interpretation of the user — guardrails below exist for that reason specifically.

## Architecture: Tools Over Existing Audited Endpoints, Never Raw Access

The console is an LLM with function-calling/tool-use, where **every tool wraps an already-existing, already-permission-checked Admin API endpoint** (07. API → Endpoint Specifications' `/admin/*` routes) — it never queries the database directly and never bypasses the Permission Matrix (01. Business Logic) or Tenant Isolation (04. Security). The AI agent has exactly the access the Admin role already has, no more — it's a new interface onto existing, audited capability, not a new capability with fewer checks.

Example tools: `get_user(id)`, `get_sales(filters)`, `get_pnl(month)` (11. Analytics → Automated Monthly P&L), `suspend_user(id)`, `approve_campaign(id)`, `trigger_refund(sale_id)`.

## Two Categories of Command, Handled Differently

### Read/query commands — execute directly

"How many active creators this month" / "show me flagged sales" — no side effects, answered immediately from existing Admin/Analytics endpoints.

### Write/action commands — require explicit confirmation, no exceptions

"Suspend this user" / "refund this sale" / "approve this campaign" — the console states exactly what it's about to do ("I'm about to suspend user X and this will cancel their 2 active campaigns — confirm?") and **waits for explicit confirmation before executing**, every time, regardless of how confident the interpretation seems. This is the same principle as 04. Security → Session Management's existing re-auth-for-sensitive-actions rule, applied to AI-interpreted commands specifically — an AI agent restating its plan before acting is the equivalent safeguard to a human re-entering their password before a sensitive change.

## Fail-Closed on Ambiguity

If the console can't confidently map a natural-language command to a known tool, **it says so and asks for clarification — it never guesses and takes a "best effort" action.** Same fail-closed principle already established in 04. Security → Tenant Isolation Audit, applied here to command interpretation instead of tenant context: not knowing exactly what to do is a reason to stop, not a reason to proceed with a guess.

## Code-Change Requests: Draft-Only, Never Executed

When a command is really "change how the product works" rather than a data operation ("make the payout threshold $75 instead of $50"), the console **does not touch code or deploy anything.** It generates a structured, human-readable spec — referencing the relevant existing docs and what would need to change — that you copy and hand to Claude Code (or another dev) yourself. This preserves every safeguard already built: CI/CD Pipeline, Feature Flags Strategy for financial-chain changes, Feature Capacity Readiness Check, and Release Process all stay fully in the loop, exactly as if you'd typed the request yourself. The console is a drafting assistant for that handoff, not a bypass around it.

## Audit Trail

Every AI-agent-initiated action is logged in the Audit Log (03. Database → Audit Log Design) with an added `initiated_via` field (`dashboard` / `ai_console` / `api`) distinguishing agent-initiated actions from direct human clicks — so a later investigation can always tell whether a given change came through the natural-language console or the standard UI.

## Open Questions

- Exact LLM/tool-calling provider — not decided, reasonable to pick once ready to build, consistent with 02. AI Services' existing "API calls, not custom models" approach
- Whether this ships as MVP or Post-MVP — given it's a founder-productivity tool rather than something end users need, reasonable to treat as a fast-follow after core Merchant/Creator flows are solid, not a launch blocker — worth an explicit call from you rather than assumed

## Update (2026-08-04): Extended for Support Use

This console is also the mechanism behind 10. Operations → Live Production Access for Support, Support Tiers, and Automated Resolution & Assisted Triage — same console, same guardrails, applied to support tickets in addition to general admin tasks. No new trust boundary was introduced; support tooling reuses this design exactly.