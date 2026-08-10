# Funnel Tracking

## Purpose

The step-by-step conversion paths worth watching closely — built directly from 01. Business Logic → User Flows.

## Merchant Funnel

```text
Waitlist joined → Account activated → Offer created → Campaign published
  → First application received → First application approved → First sale verified
```

## Creator Funnel

```text
Waitlist joined → Account activated → First application submitted
  → First application approved → Link generated → Link shared (proxy: first click received)
  → First sale attributed → First payout received
```

## Why Track Funnels, Not Just Point Metrics

A point metric like "total sales" can look healthy while masking a specific broken step (e.g. plenty of campaigns published, but very few ever get an approved application — signaling a matching/discovery problem, not a checkout problem). Funnel tracking is what actually tells you *where* to intervene, consistent with the case study doc's original emphasis on identifying "failure modes" through usability testing — this is the same idea applied to live product data instead of a usability test session.

## Open Questions

- None blocking — direct implementation of already-defined user flows; specific drop-off thresholds worth investigating will emerge once there's real usage data.
