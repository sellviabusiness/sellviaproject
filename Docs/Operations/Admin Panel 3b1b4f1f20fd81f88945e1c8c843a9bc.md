# Admin Panel

## Purpose

What the Admin role's actual working surface looks like — implementation of the admin permissions already defined in 01. Business Logic → Permission Matrix and User Roles.

## Core Screens

- **Moderation queue** — flagged Sales/Applications from Fraud Prevention's rule-based detection (04. Security), pending Admin review
- **Campaign vetting** — high-commission or high-risk campaigns awaiting approval before going live (per the raw data doc's original "vetting step" concept, and Business Rules)
- **User management** — view/suspend Merchant or Creator accounts; view a user's history for support purposes only, not general browsing (per Permission Matrix's scoping)
- **Refund/dispute handling** — manual refund initiation and chargeback evidence submission (05. Payments → Refund Handling, Chargebacks)
- **Reconciliation review** — surfacing any mismatch flagged by the Reconciliation job (05. Payments) for manual investigation
- **Waitlist → beta invitation management** — per the Product Roadmap's "in join order" Private Beta process

## Open Questions

- Single flat Admin role for MVP (per User Roles' default) means one person/team has access to all of the above — fine at current team size, revisit tiering only if the team grows enough to need separation of duties

## Update (2026-08-04): Natural-Language Access Layer

All the screens above (moderation queue, campaign vetting, user management, refund handling, reconciliation review) also become accessible via a natural-language command interface — see 10. Operations → Founder AI Command Console. That console calls the exact same underlying Admin API endpoints as these screens; it's a second interface onto identical, equally-audited capability, not a separate or less-checked path.

## Update (2026-08-04): At-Risk New Users View Added

New screen: **at-risk new users** — accounts that hit the 48h churn threshold (11. Analytics → Activation, Aha Moment & Churn Signals) without completing their core activation action. Distinct from the fraud/moderation queue — this is a growth signal, not a trust/safety one, but lives in the same Admin surface since it's the same audience (founder) checking it.