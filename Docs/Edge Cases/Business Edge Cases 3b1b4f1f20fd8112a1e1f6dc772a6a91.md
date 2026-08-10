# Business Edge Cases

## Purpose

Situations specific to the Merchant side that fall outside the happy path.

## Cases

- **Merchant changes commission rate mid-campaign** — resolved default (State Machines): existing approved creators keep their locked-in rate, new applicants get the new rate. No re-consent flow needed as a result.
- **Merchant pauses or ends a campaign with active creators** — resolved default (State Machines): paused campaigns keep honoring in-flight attribution within the 30-day window; ended campaigns stop attributing new clicks immediately but honor pre-end clicks within the window.
- **Merchant's Stripe Connect account gets restricted/flagged by Stripe** (e.g. Stripe's own risk systems flag unusual activity) — not addressed in any prior doc. Needs a defined SellVia-side response: likely auto-pause all of that merchant's live campaigns until resolved, to avoid creators promoting a merchant who currently can't receive funds.
- **Merchant never completes Stripe onboarding after creating campaigns** — campaigns should not be able to go live (draft → live transition) until Stripe onboarding is verified complete; this should be an explicit gate in the Campaign State Machine.

## Open Questions

- Merchant Stripe-restriction handling (see above) — genuinely unaddressed until now, worth a real decision before launch given it's not a rare edge case for any platform processing real payments at scale

## Update (2026-08-07): RESOLVED — Auto-Pause Immediately

**Founder-confirmed:** on `account.updated` webhook indicating a Stripe Connect restriction (04. Event-Driven Architecture already tracks this event type), all of that merchant's live Campaigns transition to `paused` automatically — no manual Admin step required to trigger it. Existing creators keep their in-flight attribution honored within the 30-day window per the standard "paused" behavior already defined in 01. State Machines; no new applications accepted while restricted. Merchant is notified (01. Notification Logic) explaining why, and campaigns can resume once Stripe lifts the restriction (detected via a subsequent `account.updated` event).