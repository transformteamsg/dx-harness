# Plan approval (shared procedure)

The plan gate is the cheapest place for human judgment: a structural mistake caught
here costs a conversation, not a rebuild. Every run that changes the product passes
through this gate, whether it started in the builder, the orchestrator, a pass, or
critique.

## The stop-once protocol

- **Plan approval occurs one time per run.** Whoever started the run asks it. A
  routed-to skill runs in return-to-caller mode and skips its own interview, so no
  person is asked twice.
- **An explicit build ask counts as approval.** When the person asked to build a
  specific plan or a chosen direction, the run just builds; do not stop again to ask
  for permission they already gave.
- In every other case the run stops exactly once, at this gate, before any edit to
  the product.

## The three stages

Run the gate in order. Never collapse the stages on your own initiative; only the
human's clear early approval shortens it.

1. **Expose the plan.** The full plan goes in your message body, ending with a
   compact plan summary table (one row per plan dimension, each cell a tight phrase).
   Close with a plain-text line that you will grill the plan next. Never put a
   modal or option dialog in the same turn as the plan; that forces a decision
   before the reader has read what they are deciding on.
2. **Grill the plan.** Interrogate the exposed plan one question at a time, each
   with a recommended answer. Look up facts from context, put every open decision to
   the human, and fold every answer back into the plan before the next question.
   Grilling sharpens only: a question whose answer changes the chosen structure
   sends the run back to diverge, and grilling never relaxes a control. (The
   builder's `grill.md` carries the full grilling procedure.)
3. **The structured ask.** Once the grill is spent, ask for sign-off on the
   sharpened plan with a structured Approve / Adjust question. "Approve" proceeds to
   implement; "Adjust" sends you back to revise. A structural adjustment returns to
   diverge; anything else is re-exposed and re-asked. A free-text approval is
   accepted; a vague "continue" is not. Confirm what they are approving.

## L1 waiver approval happens here

Waivers are decided at the plan gate, not improvised during implementation. An L1
waiver needs a named human approver, granted here and recorded in the decision
record and on the surface's design ticket (see `design-tickets.md`, beside this
file). L0 is never waived; an impossible L0 is a blocking question for the person,
not a judgment call. An L2 deviation needs a specific, real reason. For the tier
table and the `dx-waive` syntax read `../standards/README.md`; never answer a waiver
question from memory (mechanics: `catalogue-mechanics.md`, beside this file).

## Unattended runs

With no human reachable, proxy approval is permitted only when the operator
authorized it up front. Record it verbatim as "approved by operator proxy —
unattended run" in the decision record, never as if a human approved. Proxy approval
is not a substitute for review: still emit a compact, reviewable plan plus
intended-diff summary (files to touch, the specific visual and structural changes,
and what is preserved), route it to the async reviewer, and record that it was sent.

## Record it

Write the approved plan to the decision record and to the surface's design ticket
run record (`design-tickets.md`). The approved plan is the artifact the design
review grades against, so it must be fixed, not whatever you last proposed. Any L1
waiver granted here records its named approver.
