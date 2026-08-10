# Permission Matrix

## Purpose

Who can see and do what. This is the source of truth 04. Security → Authorization (RBAC) will implement directly.

## Matrix

| Action | Merchant | Creator | Admin |
| --- | --- | --- | --- |
| Create Offer/Campaign | ✓ (own) | ✗ | ✓ (any, for moderation) |
| Set commission rate | ✓ (own campaigns) | ✗ | ✓ (override, e.g. vetting high-commission campaigns) |
| Apply to campaign | ✗ | ✓ | ✗ |
| Approve/reject application | ✓ (own campaigns) | ✗ | ✓ (moderation override) |
| View own dashboard (clicks/sales) | ✓ (own) | ✓ (own) | ✓ (any) |
| View other users' full data | ✗ | ✗ | ✓ |
| Flag suspicious activity | ✗ (can report) | ✗ (can report) | ✓ (can act) |
| Approve high-commission/high-risk campaign | ✗ | ✗ | ✓ |
| Process/reverse a payout | ✗ | ✗ | ✓ (exception handling only) |
| Manage waitlist → beta invitations | ✗ | ✗ | ✓ |

## Notes

- Admin role and its full scope is inferred, not sourced — see User Roles → Open Questions. This matrix should be revisited once that's resolved.
- Whether a single account can hold both Merchant and Creator permissions simultaneously is unresolved (see User Roles) and affects how this matrix is actually implemented (per-role permissions vs. per-account permissions).

## Open Questions

- Should merchants see aggregate creator performance across the whole platform (for choosing who to approve) or only the applicant's own submitted stats?
- Does Admin need tiered access (e.g. junior moderator vs. full admin) or is it a single flat role at this stage?