# Per-Feature Support Playbooks

## Purpose

Every feature that gets built generates its own support playbook alongside it — not written after launch when support tickets start arriving, but as a required output of the build itself, while the person who built the feature still has full context.

## The Rule

**No feature is considered "done" until its support playbook exists.** This is now a gate in the build process, alongside 10. Operations → Feature Capacity Readiness Check (which runs before build) and 10. Operations → Release Process (which runs at ship time) — this one runs at completion, before the feature is considered closed.

## Playbook Template (one per feature)

Each feature's playbook is a short, structured doc answering:

- **What does this feature do**, in plain language a support responder (human or the AI console) can act on without re-reading the technical spec
- **What can go wrong** — the failure modes specific to this feature (pulled directly from 08. Edge Cases entries where they exist, or newly identified if this feature predates that doc)
- **What does a user see when it breaks** — the actual error message/state, so a responder can pattern-match a user's description to the right playbook without guessing
- **What's the fix** — step by step, distinguishing what's safe to resolve automatically (see Automated Resolution & Assisted Triage) from what requires human/founder judgment
- **What data to pull first** — which tables/logs/dashboards actually explain what happened (ties to 03. Database and 11. Analytics — named directly, not "check the logs" vagueness)

## Where Playbooks Live

One playbook per feature, stored alongside 10. Operations → Customer Support Flows (which covers the general categories); feature-specific playbooks are the detailed layer underneath those general flows, referenced by name when a ticket matches a known feature.

## Why This Matters More Here Than Usual

Given 10. Operations → Founder AI Command Console will eventually handle some support tasks directly, these playbooks are also the **source material the console draws from** for automated/assisted resolution — a playbook that only exists in one person's head can't be used by an AI agent acting on production data. Writing it down is what makes the automation in this doc's companion piece (Automated Resolution & Assisted Triage) possible at all.

## Open Questions

- None blocking — this is a process discipline to apply from here forward. Retroactively backfilling playbooks for already-built features (Authentication, Checkout, Payouts, etc.) is real work worth scheduling deliberately, not assumed to happen automatically.