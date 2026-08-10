# Audit Log Design

## Purpose

What gets logged for accountability/dispute-resolution purposes, separate from application error logging.

## What Gets an Audit Log Entry

- Every Campaign commission_rate change (who changed it, from what, to what, when) — directly relevant to the still-open re-consent question in State Machines
- Every Application status change (pending → approved/rejected) — who acted, when
- Every Sale status change, especially `verified → refunded` — needed to resolve any dispute about whether/when a clawback should have applied
- Every Admin action (campaign vetting override, account suspension, manual refund) — Admin actions carry the most "why did this happen" risk and need the clearest trail
- Every Payout status change, including failures and retries

## Schema (proposed)

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid, PK | |
| actor_user_id | uuid, nullable | null for system/webhook-triggered changes |
| entity_type | text | e.g. "campaign", "sale", "payout" |
| entity_id | uuid | |
| action | text | e.g. "commission_rate_changed", "status_changed" |
| before | jsonb | |
| after | jsonb | |
| created_at | timestamptz | |

## Why a Separate Table, Not Just `updated_at`

A single `updated_at` timestamp tells you *that* something changed, not *what* changed, *who* changed it, or *why* — all of which matter the moment a merchant or creator disputes a commission amount or a payout. This is standard practice for any system moving real money, not SellVia-specific over-engineering.

## Open Questions

- Retention period for audit logs — recommend indefinite retention for anything in the financial chain (Sale/Commission/Payout/refund-related entries), given potential future tax/legal need to reconstruct history

## Update (2026-08-04): initiated_via Field Added

| Field | Type | Notes |
| --- | --- | --- |
| initiated_via | text | "dashboard" / "ai_console" / "api" — distinguishes standard Admin UI actions from 10. Operations → Founder AI Command Console actions, so an investigation can always tell how a given change was triggered |

Every action taken through the AI Command Console logs here identically to a direct Admin UI action, just with this field set to `ai_console` — same audit rigor, distinguishable origin.
