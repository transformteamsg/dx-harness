# Focused pass — shared procedure

The five focused passes (dx-design-copy, dx-design-flow, dx-design-pattern,
dx-design-motion, dx-design-polish) run this one procedure, each scoped to its own
dimension. A pass is propose-only: it captures the surface, judges it inside its
dimension, and records up to five ranked findings on the surface's design ticket. A
pass NEVER edits the product, and it never runs verify. Only `dx-design-execute`
edits the product; it owns build, design review, and verify through the shared
back-half procedures. The pass SKILL.md that sent you here names the dimension's
control-id subset and its reference files; read those first. Everything below is the
shared shape.

The product's essence comes from its own `DESIGN.md`, read per
`../../../procedures/design-essence.md`. Dispatched, you cannot ask for a missing one,
so name the gap and judge on the controls alone. You never propose a change before you
have seen and judged the current state, and you never restyle a deliberate choice
without asking.

## Two entries, one mode token

A pass keeps two entries:

- **Direct.** A person calls the pass with a sharp ask that names its dimension. Run
  all five steps below, including the accept/decline exchange in step 4.
- **Dispatched.** The orchestrator (`dx-design`) dispatches the pass as a
  propose-only subagent in its improve-what-exists fan-out. The dispatch prompt
  carries the mode token `return-to-caller`. The token suppresses the pass's own
  interview (no clarifying questions back to the human) and the pass's own
  accept/decline exchange (step 4's ask and marks): the pass captures, judges, and
  returns its ranked findings to the caller. The orchestrator merges findings from
  every dispatched pass into one ranked plan with one plan approval, and it owns the
  design-ticket record for that run.

## Run it

1. **Capture the surface.** Same mechanism order as `critique.md` (beside this file) —
   read its step 1 and follow it; do not fabricate what the page looks like. A pass that
   judges responsive behaviour captures 360 too. No capture mechanism available: route
   to setup rather than judging an unseen surface.
2. **Load only your slice.** Load the pass's control-id subset (named in the SKILL.md
   that sent you here) from `../../../standards/catalog.yaml`, read each control's
   `detail` file when it has one, and load the pass's named reference files — nothing
   wider. The dimension is the boundary; the catalog ids are the rules. Mechanics
   (filtering, tiers, plain-title naming): `../../../procedures/catalogue-mechanics.md`.
3. **Up to five ranked findings, inside the dimension only.** Ground each finding in
   the captured surface. Rank by impact on the teacher's task. Name each finding
   plain-title-first where a control applies, with its cost (S/M) and the control or
   pattern it serves. Findings are proposals; you change nothing. Anything you notice
   **outside** the dimension is NOTED and routed, never fixed here: "the spacing
   rhythm is a dx-design-pattern matter", "that wording is a dx-design-copy matter".
4. **Record on the ticket, then ask.** Find or create the surface's design ticket and
   record the findings as a Findings comment, format and conventions per
   `../../../procedures/design-tickets.md` (no tracker wired: use its local-markdown
   fallback). Ask the human to accept or decline each finding, then mark each one
   `accepted` or `not accepted` on the comment. Declined findings stay recorded;
   nothing is silently dropped. In return-to-caller mode, skip the ask: return the
   ranked findings to the caller, which merges them and runs the one plan approval.
5. **Hand off; never build.** Hand the accepted findings to `dx-design-execute` as a
   specified-change run in `return-to-caller` mode: the handoff carries the mode
   token, the accepted findings, and the design-ticket reference. The token makes
   execute skip its own intent interview; the person already accepted each finding in
   step 4, and that acceptance is the approval context execute works from. Execute
   owns plan approval, implement, design review, and verify, through
   `../../../procedures/plan-approval.md`, `../../../procedures/implement.md`, and
   `../../../procedures/design-review.md`. A
   smaller accepted finding counts as plan approval and proceeds without a second
   stop; a whole-page rebuild always stops at plan approval before any edit. When the
   human declines every finding, the run ends here: the Findings comment stands, with
   every finding marked not accepted, and no product file changes.

## L0 is never scoped out

The four non-negotiables — AA contrast (A11Y-1), keyboard reach with visible focus
(A11Y-2), a visible label on every field (A11Y-3), destructive actions show consequences
and offer undo or confirm (CMP-2) — bind every pass regardless of dimension. A contrast
failure surfaces even in a motion pass. A pass cannot fix anything itself, so when you
hit one, either record it as a finding (say so when it exceeds strict dimension scope)
or route it explicitly to the right skill. You may never let an L0 failure pass
unrecorded because it sat outside the dimension you were asked to work in; a silent
drop is never an option.

Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds this
prose too.
