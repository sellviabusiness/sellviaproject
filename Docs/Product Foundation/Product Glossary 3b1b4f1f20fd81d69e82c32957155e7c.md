# Product Glossary

## Purpose

Shared vocabulary so "campaign," "commission," and "payout" mean the same thing in every doc, in code, and in conversations with users.

| Term | Definition |
| --- | --- |
| **Merchant / Brand / Business Owner** | A user selling a product (digital or physical) who lists it with a commission attached. |
| **Creator** | A user with an audience who promotes a merchant's product in exchange for commission. |
| **Offer / Product** | The thing being sold. Has a price and belongs to a merchant. Category: digital or physical. |
| **Campaign** | A merchant's listing of an offer with a commission rate attached, open for creators to apply to. |
| **Application** | A creator's request to promote a specific campaign. States: pending, approved, rejected (see State Machines). |
| **Affiliate Link** | The unique, trackable URL generated for an approved creator–campaign pair (e.g. `sellvia.link/mia-glow` per the live site example). Carries the creator's attribution "fingerprint." |
| **Click / Attribution Event** | A tracked interaction (click, cart add, purchase) tied to a specific affiliate link, timestamped, visible to both merchant and creator. |
| **Sale / Order** | A verified purchase attributed to an affiliate link. Triggers commission calculation. |
| **Commission** | The creator's share of a sale, set as a percentage by the merchant at campaign creation (10–50% typical, per raw data doc; 20% shown in the live site's Glow Serum example). |
| **Payout** | The transfer of a creator's earned commission to them, triggered automatically by a verified sale. |
| **Wallet / Balance** | A creator's running total of earned-but-not-yet-paid-out commission. |
| **Receipt** | The shared, identical record of a sale shown to both merchant and creator (amount, commission split, timestamps). |
| **Waitlist** | Pre-launch signup; current validation-stage entry point. |

## Notes

Terms here should be treated as the canonical names used in the database schema (03. Database) and API (07. API) — avoid renaming these mid-build.
