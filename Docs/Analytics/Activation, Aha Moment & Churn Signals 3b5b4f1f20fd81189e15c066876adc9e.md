# Activation, Aha Moment & Churn Signals

## Purpose

Three related but distinct things, worth keeping separate rather than blurred together: the **activation action** (self-directed, trackable in a fixed window), the **aha moment** (real value experienced, often depends on someone else acting too), and **churn signals** (automated follow-up when neither happens in time).

## Core Activation Action, Per Role

**Merchant: publish first campaign** (not just create an Offer — a draft with nothing live hasn't activated). Maps to the existing `campaign_published` event (11. Analytics → Events).

**Creator: submit first application.** Maps to `application_submitted`. Deliberately not "get approved" — approval depends on a Merchant's decision, outside the Creator's own control, so it's not a fair activation measure for the Creator's own behavior.

Both are chosen specifically because they're **entirely within the user's own control** — a fair activation metric shouldn't depend on another party acting first.

## The Aha Moment — Deliberately Separate From Activation

**Merchant: first sale happens through their campaign** — proof a creator actually converted a real buyer, not just that the campaign is technically live.

**Creator: first commission earned** — proof the model works for them personally, not just that they applied.

Both naturally take longer than activation, since both depend on someone else's action (a Creator applying and converting, or a buyer purchasing). **Measuring time-to-aha as its own metric matters because it can be long even when activation is fast** — a Merchant can publish a campaign in minutes and still wait days for a real sale; conflating the two would hide that gap.

## Detection — Rule-Based, Not AI

Consistent with "rules before AI" (00. Mission & Principles, 04. Fraud Prevention): whether a user has completed their core action is a deterministic query against existing events (11. Analytics → Events), not something requiring AI judgment. A scheduled Celery job (02. Background Jobs) checks, on a recurring basis, which users crossed the 24h/48h thresholds without the relevant event:

```text
Every hour:
  Find users created 24-25h ago with no campaign_published/application_submitted event
    AND no 24h nudge already sent → trigger 24h nudge
  Find users created 48-49h ago with no core action completed
    AND no 48h follow-up already sent → trigger 48h churn follow-up, flag as at-risk
```

## Nudge Delivery — Three Channels, One Underlying Signal

All three read from the same "has this user completed their core action" flag — no separate logic per channel:

- **Email:** new Notification Logic trigger, `activation_nudge_24h` and `churn_followup_48h` — sent via the marketing domain (`news.wesellvia.com`, 06. Email Infrastructure), since this is a lifecycle/growth message, not a transactional receipt
- **In-app notification:** same trigger, delivered through existing notification infrastructure (03. Database → notifications table)
- **Tooltip:** purely frontend — the dashboard reads the same "core action completed" flag and conditionally renders a contextual prompt pointing at the relevant UI element. No backend push needed; this is a read, not an event.

**AI's role here is optional, not load-bearing:** the *decision* to nudge is the rule-based query above. The nudge's *wording* could optionally use the existing copy-assist AI feature (02. AI Services) for personalization later — not required for MVP, and never the thing deciding whether a nudge fires.

## Churn Signal Tracking

```text
activation_nudges
  id
  user_id
  tier            (24h_nudge / 48h_churn_followup)
  sent_at
  core_action     (which action they were nudged toward)
```

Prevents duplicate nudges, and the 48h tier doubles as a churn-risk flag — surfaced in 10. Admin Panel / Founder AI Command Console as an "at-risk new users" view, not just an outbound email with no internal visibility.

## Metrics This Feeds

Extends 11. Analytics → KPIs and Funnel Tracking with two new explicit measures: **activation rate within 24h** (per role) and **time-to-aha-moment** (median days from signup to first sale/first commission) — both currently absent from the existing funnel definitions, which stopped at "first sale verified" without distinguishing activation from aha.

## Open Questions

- Exact nudge copy/tooltip content — not written here, a 09. UX → Copy Guidelines task once ready to build the actual screens
- Whether a 72h+ tier is worth adding beyond the 48h churn follow-up — reasonable to hold off until there's real data on how much the 48h nudge actually recovers
