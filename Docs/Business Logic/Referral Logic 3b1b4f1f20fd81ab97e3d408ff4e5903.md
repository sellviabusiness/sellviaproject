# Referral Logic

## Purpose

How one user brings in another — whether that's a creator inviting other creators, a merchant inviting other merchants, or the waitlist's implicit referral mechanics.

## Current State: Not Defined in Source Material

Neither the raw data doc, the case study doc, nor the live [wesellvia.com](http://wesellvia.com) copy describe a referral program. This doc is a placeholder for a decision, not a spec of an existing feature — don't build against it yet.

## Relevant Existing Mechanics (adjacent, not referral per se)

- The waitlist itself functions as a soft viral loop: "reply with what you'd need it to do" invites engagement, and "your signup is what moves the line" frames each signup as contributing to a shared goal — but there's no tracked referral link or incentive structure currently.
- The "private beta, in join order" roadmap mechanic creates a natural incentive to invite others only insofar as it doesn't currently reward the referrer.

## Questions to Resolve Before Writing This Doc for Real

- Is a referral program even wanted for MVP, or is it explicitly out of scope (given the stated principle of solving chicken-and-egg via niche focus, not virality)?
- If built: does a creator get a commission bonus or queue-priority for referring another creator? Does a merchant get anything for referring another merchant?
- Referral tracking would reuse the same AffiliateLink/attribution infrastructure (see Domain Model) — worth deciding if that's a deliberate reuse or a separate system.
