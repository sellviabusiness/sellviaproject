# Customer Support Flows

## Purpose

How a Merchant or Creator gets help when something goes wrong — not addressed in any prior doc.

## Channels

- Email support (ties to the same infrastructure discussed for transactional email — 06. Infrastructure, Environment Strategy's separate-email-per-environment principle applies to support email too, so staging tests never reach real support queues)
- In-app support link/contact form as the primary channel for logged-in users

## Common Flows (derived from what's already been designed)

- **"My payout hasn't arrived"** — support checks Payout status (05. Payments) and Paddle's own payout timeline before assuming something's broken; most cases will be explained by the normal 2–7 day bank transfer window (Money Flow) rather than an actual failure
- **"My application was rejected, why?"** — per 01. Business Logic → Notification Logic's still-open question on whether rejections include a reason; support needs a clear answer here regardless of what ships in-product
- **"I think I was charged twice"** — support checks for genuine duplicate Sales vs. a Paddle pending-then-settled display artifact; ties to Reconciliation (05. Payments) as the authoritative check
- **Disputing a commission clawback** — escalates to Admin review of the specific Refund Handling case

## Open Questions

- Support tooling/ticketing system choice — not decided, reasonable to pick a standard tool once ready rather than build one
- Whether support is staffed directly by the founder at this stage or needs a dedicated flow — reasonable to stay founder-handled through Private Beta given current scale, revisit at Public Launch
