# Product Roadmap

## Purpose

Reconcile the two roadmap framings that already exist — the public-facing 4-stage roadmap on [wesellvia.com](http://wesellvia.com), and the internal 7-phase implementation plan from the raw data doc — into one sequence.

## Public Roadmap ([wesellvia.com](http://wesellvia.com))

1. **Research** — months of conversations with brands and creators about why partnerships die. (Complete / ongoing)
2. **Validation** — *you are here.* Landing page live, waitlist open. Signups move the line to Private Beta.
3. **Private Beta** — first cohort invited from the waitlist, in join order, on founding terms.
4. **Public Launch** — the open marketplace.

## Internal Implementation Phases (raw data doc), mapped onto the public roadmap

| Public stage | Internal phase(s) |
| --- | --- |
| Validation (current) | MVP Definition, Rapid Prototyping |
| → Private Beta | Usability Testing, Design System, Backend & Tracking |
| Private Beta | Beta Launch & Feedback |
| → Public Launch | Iterate and Expand |

## MVP Definition (must-have for Private Beta)

From the raw data doc, confirmed as still current:

- User auth (merchant + creator roles)
- Product/campaign listing
- Affiliate link generation + click tracking
- Basic sales tracking and attribution
- Simple dashboards (merchant + creator)
- Payout mechanism (PayPal / bank transfer named in source doc — **needs confirming against the Paddle option raised in the infra conversation**)

**Explicitly deferred post-MVP:** complex analytics, AI-based matching/screening (see 02. Technical Architecture → AI Services, once written), and **external-site checkout tracking** (redirect + webhook/pixel attribution for merchants who want to keep their own checkout — decided 2026-08-03, see Money Flow). MVP is SellVia Checkout only — every sale happens on SellVia's hosted checkout, no exceptions.

## Open Questions

- Target date/size for Private Beta cohort ("in join order" — is there a cap?)
- Confirmed beachhead niche/category (referenced as open in Product Vision doc)
- Whether AI matching (creator↔campaign) ships in Private Beta or is deferred to Public Launch

## Update (2026-08-07): RESOLVED — 10-25 Merchants/Creators

**Founder-confirmed:** Private Beta cohort is capped at **10-25** merchants/creators combined for the first invited group — small and intentional, matching "in join order, on founding terms" rather than a mass invitation. Waitlist → beta invitation (10. Admin Panel) stops issuing invites once this cap is reached, reassessed once this initial cohort is running smoothly.

## Update (2026-08-07): Invitation Process RESOLVED — Curated First Cohort, Automatic After

**Founder-confirmed:** the first Private Beta cohort (10–25 merchants/creators) is **manually curated**, not strict signup-order — chosen specifically to build a coherent cluster around the eventual beachhead niche (still open, per Product Vision) rather than a scattered group of unrelated signups. This is a deliberate, one-time exception to the "automate everything" principle applied everywhere else in this build (04. Fraud Prevention, 05. Payment Flow, etc.) — justified because it's a single small decision, not a repeating operational burden, and directly supports niche-fit strategy.

**After the first cohort is seated: fully automatic, strict signup order**, zero curation — matches the general automation-first approach for everything that scales beyond a one-time decision.