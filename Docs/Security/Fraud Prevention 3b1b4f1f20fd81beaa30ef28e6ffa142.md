# Fraud Prevention

## Purpose

How SellVia detects and prevents affiliate fraud — directly addresses the risk named repeatedly across the raw data doc and Success Metrics (fake clicks, cookie stuffing).

## MVP: Rules-Based, Not ML (deliberate choice)

Per Mission & Principles ("rules before AI"), fraud detection starts with deterministic rules and thresholds, not a trained model — there isn't enough real transaction data yet to train anything meaningful, and a black-box decision on money during MVP is the wrong place to introduce ML uncertainty.

## Rules to Implement

- **Velocity checks:** flag an AffiliateLink or IP generating an abnormal number of clicks in a short window
- **Self-referral detection:** flag if a Creator's own payment method/IP matches the buyer on a sale attributed to their own link
- **Conversion-rate outliers:** flag a Creator whose click-to-sale rate is statistically far above their historical norm or the campaign's average — possible sign of fake/bot clicks or self-purchases
- **Duplicate device/session fingerprinting:** flag repeated "purchases" from what looks like the same device across supposedly different customers on the same link

## Where This Feeds

- Flagged sales/applications route to the Admin moderation queue (per 01. Business Logic → Permission Matrix's "flag suspicious activity" admin action)
- High-commission campaigns get the vetting step already described in the raw data doc ("admin approval of products or content")

## Post-MVP

Once there's real transaction volume, an anomaly-scoring model can layer on top of these rules (per the earlier AI-integration conversation) — rules stay as a fast first-pass filter even after a model exists, since a wrong ML call on someone's real earnings is a worse failure mode than an over-cautious rule.

## Open Questions

- Exact thresholds for each rule (e.g. what counts as "abnormal" click velocity) — reasonable to start conservative and tune based on real early data rather than guessing precise numbers now

## Update (2026-08-07): New Rule — Merchant Under-Reporting Risk

**A new fraud vector, created by the checkout reversal (01. Money Flow), that didn't exist under hosted checkout:** a merchant could under-report sales to avoid owing commission — SellVia has no independent record of the underlying sale to catch this against (05. Reconciliation now says this plainly). Rule-based mitigations, consistent with this doc's existing "rules before AI" approach:

- **Reported-sale plausibility check:** compare a merchant's reported sale volume against their campaign's click volume (from 01. Endpoint Specifications' `GET /go/:slug` redirect logs) — a campaign with high clicks and suspiciously low reported sales is a signal worth flagging, not proof of wrongdoing
- **Reporting consistency:** flag merchants whose reporting pattern changes suddenly (e.g. sale volume drops right after a high-commission campaign goes live)
- **Escalation:** flagged merchants route to the Admin moderation queue (10. Moderation) for manual review, same pattern as existing fraud flags — not an automatic penalty, since a legitimate drop in sales looks identical to under-reporting without more context

**Honest limitation:** none of this proves a specific sale was hidden — it can only flag patterns worth a human looking at. This is a real, structural trust gap the checkout reversal introduced, not something rules alone fully close.
