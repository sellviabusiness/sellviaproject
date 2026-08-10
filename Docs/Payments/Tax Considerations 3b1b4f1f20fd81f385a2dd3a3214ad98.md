# Tax Considerations

## Purpose

What SellVia needs to handle for tax compliance — largely offloaded to Stripe, but worth documenting what isn't.

## Handled by Stripe Connect

- 1099 generation (US) for creators/merchants earning above IRS thresholds, since Stripe Connect Express accounts (02. Backend Architecture) handle this natively for platforms
- W-8/W-9 style tax form collection during Stripe's own onboarding flow

## What SellVia Still Needs to Think About

- **Sales tax / VAT on the underlying product sale itself** — not addressed anywhere in prior docs. This is a genuinely open, non-trivial question: does SellVia's checkout need to calculate and collect sales tax/VAT depending on the customer's location and the product type? This is a real compliance requirement in many jurisdictions and is currently unaddressed.
- SellVia's own platform fee (2%) as taxable revenue — standard business tax matter, not specific to this product, but worth a real accountant's input before launch, not something to guess here.

## Open Questions (genuinely unresolved, not defaults — recommend real professional input)

- Sales tax/VAT collection on checkout — significant enough that it may need dedicated tooling (e.g. Stripe Tax) rather than a simple internal calculation
- Multi-jurisdiction tax obligations given USD/EUR/GBP support across potentially US/EU/UK customers

## Deferred (2026-08-04): Jurisdiction-Specific Compliance

Founder has explicitly deferred legal/compliance review to later, not blocking MVP build. Flagging what's outstanding here so it isn't lost by the time this comes back up:

- **Sales tax / VAT** across USD/EUR/GBP jurisdictions (already flagged above)
- **India's IT Rules Amendment 2026 (SGI/deepfake regulation)** — relevance depends on whether SellVia ever has an India-based user nexus, not yet determined. If relevant: content takedown timelines, grievance redressal process, periodic user advisories, and SGI labeling would need review. Source: Khaitan & Co advisory, Feb 2026.
- General intermediary/platform liability obligations, jurisdiction TBD, once target markets are firmer

**Recommend revisiting before Public Launch, not before Private Beta** — real legal counsel input needed here, not something to resolve by documentation alone.

## Update (2026-08-04): Stripe Tax — Direction Chosen, Not Yet Implemented

**Decided: Stripe Tax**, not a Merchant-of-Record provider (Lemon Squeezy/Paddle were considered and explicitly rejected — those require becoming the legal seller of every transaction, which is structurally incompatible with the three-way Stripe Connect split — Merchant share, Creator commission, SellVia platform fee — already built throughout 01. Business Logic and 05. Payments).

**Why Stripe Tax fits without disrupting anything already built:** it plugs directly into the existing Stripe Connect setup rather than replacing it — calculates and collects the correct sales tax/VAT per transaction, per jurisdiction, without touching the split logic in Commission Engine or Money Flow.

**Still genuinely open, not resolved by this choice alone:**n- **US marketplace facilitator laws** — many states can make SellVia itself (as the platform) legally responsible for collecting/remitting sales tax on facilitated transactions, not each Merchant individually. Stripe Tax can handle the calculation/collection mechanics, but *whether SellVia or each Merchant is the liable party* is a legal question, not a tooling question.n- This remains part of the compliance review the founder has explicitly deferred to end of build (see the deferred-compliance note already on this page, and MVP Scope) — Stripe Tax is now the planned mechanism, but implementation and the liability question both wait for that review, not built speculatively now.

## Update (2026-08-04): Data Retention Added to Deferred List

- **Data Retention Policy Engine** (04. Security) — the enforcement mechanism and audit trail are built, but most retention periods are placeholder defaults explicitly marked unconfirmed, pending this same compliance review

## Update (2026-08-04): GDPR / EU Data Residency Added to Deferred List

- **EU user data residency (GDPR-adjacent)** — the driver behind a proposed region-based user partitioning strategy (06. Infrastructure → Scaling Strategy). Real, legitimate concern given EUR currency support implies EU users — but the correct technical mechanism (regional database deployment vs. full sharding vs. something simpler) depends on confirmed legal requirements, not yet determined. Documented as a real driver, not built until the compliance review clarifies exactly what's required.