# Background Jobs

## Purpose

What runs outside the request/response cycle, and why.

## Jobs

1. **Webhook processing** — as described in Event-Driven Architecture, webhook handlers enqueue work rather than processing inline
2. **Notification delivery** — sending emails/push notifications per 01. Business Logic → Notification Logic's triggers; should never block the request that caused them
3. **Payout batching** — even though the Paddle *split* is instant, checking which creators have crossed the $50 threshold and triggering their bank payout is a natural periodic job (e.g. runs every few hours) rather than a real-time check on every single sale
4. **Refund clawback processing** — when a `charge.refunded` webhook arrives, calculating and applying the 14-day-window clawback rule
5. **Attribution window expiry cleanup** — marking AttributionEvents outside the 30-day window as no longer eligible for a Sale, if a click's window lapses without a purchase

## Stack

Redis-backed queue (e.g. BullMQ, given the Node/Next.js stack) — lightweight, well-supported, doesn't require a heavier system like Kafka/RabbitMQ at this scale.

## Reliability Considerations

- Jobs that touch money (payout batching, refund clawback) need retry-with-backoff and dead-letter handling — a silently failed payout job is a real trust problem given the product's whole positioning
- Idempotency keys carried through from the triggering webhook/event, so retries don't double-process

## Open Questions

- Exact payout batch frequency (hourly? every 15 min? daily?) — more frequent is closer to "instant," but adds Paddle payout costs and complexity; recommend starting with a few-times-daily batch and tightening later if needed

## Update (2026-08-03): Celery replaces BullMQ

Following the FastAPI switch, **Celery (with Redis as the broker)** is the background job system, not BullMQ — BullMQ is Node-specific and no longer applies. Same Redis instance, same job list (webhook processing, notification delivery, payout batching, refund clawback, attribution-window expiry cleanup), same reliability requirements (retry-with-backoff, dead-letter handling on money-touching jobs). RQ (Redis Queue) is a lighter-weight Python alternative to Celery worth considering if Celery's operational overhead feels like more than this stage needs — either is a reasonable choice, Celery is more common/battle-tested, RQ is simpler to run.
