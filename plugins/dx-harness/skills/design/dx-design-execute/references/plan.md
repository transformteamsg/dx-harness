# Phase 3: Plan (human gate)

Plan approval binds as "Gates" in `../SKILL.md` states it. Read
`../../../../procedures/plan-approval.md` now and run it: it holds the three gate
stages, L1 waiver approval, the unattended-run proxy rules, and where the approved
plan is recorded. The grilling procedure its stage 2 runs is `../grill.md`.

Expand the chosen direction into a plan:

- Page/step structure and the component for each region.
- Tokens/patterns used; any **missing component** surfaced explicitly with options
  (extend an existing Base UI component / request from the design system — never
  improvise a one-off without a CMP-1 waiver).
- **Interaction plan**: name the 2–3 specific motions the chosen option uses — one
  entrance, one state transition, one hover/reveal — described concretely (what moves,
  from what to what), not "add animations". Reuse the product's existing motion
  conventions; every motion is bound by MOT-1 (100–300ms, standard easing, none on
  critical paths beyond functional feedback), SLP-8 (no bounce/elastic), and A11Y-5
  (a reduced-motion variant). Motion that improves neither hierarchy nor feedback is cut.
- The controls in scope for this page (filtered catalog), with any proposed waivers
  and their rationale — waivers are decided here, not improvised during implementation.
- Content outline: headings, key copy, names checked against CNT-2, error states
  (CMP-3: enumerate loading/success/error states per async action — and for each
  state, its A11Y-11 announcement channel: live region or focus move; CMP-2: every
  destructive action's consequence + undo/confirm, decided now).
- **Flow map** (when the surface is a flow or hosts a multi-step interaction, from `flow.md`): entry
  points, done state, every exit, and the edge cases — interruption, partial
  completion, resume — each with what happens to the teacher's work. A plan that covers the steps but not the journey between them is
  incomplete.
- **Tradeoffs, named**: what this design sacrifices and why that's acceptable.
- **Plan summary table**: end the plan with a compact table the reader can scan in one
  pass — one row per plan dimension (structure; components; interaction & motion; async
  states + each one's A11Y-11 channel; controls in scope; waivers; tradeoffs; evidence
  to capture), each cell a tight phrase, not prose. It is a summary the grill and the
  approver read first, never a substitute for the plan above it.

Skill-specific notes on the gate:

- The structured Approve / Adjust question is the default at the Phase 2 direction
  pick and at continuation gates too, but the three-stage split lives only at this
  gate. At the Phase 2 pick the dialog may be same-turn, because the summaries are
  short enough to read inside it.
- The decision record this repo writes the approved plan to is
  `docs/decisions/<page>.md` in the **product repo**. If `docs/decisions/TEMPLATE.md`
  does not yet exist there, copy it from the plugin first; it ships at
  `<this-skill-dir>/../../../docs/decisions/TEMPLATE.md` (resolved from the harness
  root, as in the Load-first note of `../SKILL.md`) so records conform to `audit-record.py` by
  default.
