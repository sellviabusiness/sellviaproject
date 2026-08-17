# Creator Edge Cases

## Purpose

Situations specific to the Creator side that fall outside the happy path.

## Cases

- **Creator's audience/niche data is self-reported and unverifiable** — flagged as an open fraud implication in Domain Model. Edge case: a Creator inflates their audience size to get approved for higher-value campaigns. Mitigated partially by Fraud Prevention's conversion-rate-outlier rule (a mismatch between claimed audience and actual click/sale volume is itself a signal), but not fully solved — worth an explicit "verify audience via connected social account" feature in a later version.
- **Creator shares their link in a way that violates disclosure requirements** (e.g. no FTC-required affiliate disclosure on the post) — raw data doc names this as a goal ("easy disclosure") but no enforcement mechanism exists yet. SellVia can't control what a Creator posts externally; recommend a required disclosure-language prompt/reminder at link-generation time as the practical MVP mitigation, not true enforcement.
- **Creator below the $50 payout threshold closes their account** — per Wallet Design's proposed default, allow a one-time manual below-threshold payout on account closure rather than forfeiting the balance.
- **Creator generates a link but never shares it / gets zero clicks** — not a failure case, just an empty state; dashboard should show this clearly rather than looking broken (09. UX concern).

## Open Questions

- Audience verification (see above) — flagged as a real gap, reasonable to defer to v2 rather than block MVP on it, but shouldn't be silently forgotten
