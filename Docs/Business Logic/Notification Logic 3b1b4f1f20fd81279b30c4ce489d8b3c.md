# Notification Logic

## Purpose

What triggers a notification, to whom, and why — sourced directly from the raw data doc's "Notification/Alerts" feature, expanded into concrete rules.

## Creator Notifications

| Trigger | Notification |
| --- | --- |
| Sale made on their link | "You earned $X commission on [product]" |
| Payout threshold reached | "Your balance is ready for payout" — **implies accumulation before payout; conflicts with "instant payout" positioning, see Money Flow open question** |
| Application approved | "You're in — here's your link" |
| Application rejected | (not specified in source — decide whether/how to notify) |

## Merchant Notifications

| Trigger | Notification |
| --- | --- |
| New creator applies | "New application for [campaign]" |
| New affiliate joins (approved) | Per raw data doc, explicit trigger |
| Milestone reached | e.g. "10 sales this month" — milestone thresholds not yet defined |
| Sale made | Real-time or digest? Not specified. |

## Design Constraint

Per [design.md](http://design.md)'s Animations section ("very restrained") and overall philosophy ("clarity over excitement"), notifications should be informational and quiet — not gamified with badges/confetti/growth-hacking patterns, even though this is common in creator-economy products.

## Open Questions

- Real-time push vs. digest/batched notifications — not specified anywhere
- What happens on rejection — silent, or notified with reason?
- Exact milestone thresholds for merchant "milestone reached" alerts

## Update (2026-08-04): job_completed Trigger Added

| Trigger | Notification |
| --- | --- |
| Async job completed (export, report — 02. Async Job Pattern & Idempotency) | "Your export is ready" with a link to the result, sent regardless of success/failure so the user is never left silently waiting on something that already finished or failed |

This is the completion mechanism for any heavy operation — users don't poll or watch a spinner, they get this notification.

## Update (2026-08-04): Activation & Churn Nudge Triggers Added

| Trigger | Notification |
| --- | --- |
| 24h since signup, core activation action not completed (11. Analytics → Activation, Aha Moment & Churn Signals) | Nudge toward the specific action — publish first campaign (Merchant) or submit first application (Creator) |
| 48h since signup, still not completed | Churn follow-up, stronger nudge; also flags the user as at-risk for Admin visibility |

Both sent via the marketing email domain (06. Email Infrastructure), not transactional — these are lifecycle/growth messages.