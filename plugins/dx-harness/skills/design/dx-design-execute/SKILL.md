---
name: dx-design-execute
description: 'Build product UI: a new page, screen, form, flow, or component, or a stated change to an existing one ("add a field", "restyle the header", "set the padding to 16px"). The only design skill that edits the product, including accepted findings from the passes and dx-design-critique. Runs intent, 2–3 directions, plan approval, implement, and design review. NOT for a review with no change named, or an open-ended ask about one pass dimension.'
---

# Design UI

You are designing UI for the Teacher & School portfolio (Teacher Workspace, CaseSync,
Glow, and TW surfaces). The normative source is the DX Design Standard; brand essence
is **Kind Utility** — useful first, kind at the surface. Standards compliance is not a
final check — it shapes every phase. The run is: intent, diverge, plan approval,
implement, design review. This is the ONLY skill that edits the product: the
passes and dx-design-critique propose only, and their accepted findings are built
here. This file holds the entry rules, the gates, and the run order. Each phase body
lives in its own file, named in "Run order".

**When the ask belongs to another skill:**

- A review with no change named goes to `dx-design-critique`.
- An open-ended improvement ask that names one pass dimension (copy, flow, pattern, motion, or polish) and states no edit goes to the matching pass.


**The L0 floor binds even outside the loop**, per the L0 tier in
`../../../procedures/catalogue-mechanics.md`.

**Load first:** `../../../procedures/catalogue-mechanics.md`. Once Phase 1 settles
the product and audience, get the build's in-scope list with
`python3 <harness>/scripts/in-scope-rules.py <repo-root> --product <product>
--audience <audience>`, where `<harness>` is the absolute path three levels above
this file. Pass no `--phase` or `--surface`: a build runs every phase, and a page
with an async or destructive action also takes the flow rules. Report the
`Selection:` line to the person. When the command exits with an error, stop before
you plan or build, and show the error. Before you apply a listed rule, read its
build part with `python3 <harness>/scripts/rule-detail.py <detail path> --for
build`. A rule with `Covered by:` needs no detail when its check runs clean. Also read the product's `DESIGN.md` (repo root)
if present — per-product parameters only; on conflict with implemented code
conventions, the code wins and you flag the drift. Spec: the harness's
`docs/DESIGN-CONTEXT.md`. The catalogue mechanics also hold tier behaviour for
agents, the waiver protocol, and plain-title rule naming. When someone asks about or proposes a
waiver, read `../../../standards/README.md` in that turn — never answer from memory. The shared
back half of the run lives beside it: `../../../procedures/plan-approval.md`,
`../../../procedures/implement.md`, `../../../procedures/design-review.md`,
`../../../procedures/rule-proposal.md`, and `../../../procedures/design-tickets.md`.

**The stack**: Base UI components, Radix Colors
scales, shadcn/ui default tokens for spacing/radius/type. Plus Jakarta Sans (600) for
display, Inter (400/500/600) for body/UI. Each product anchors primary actions and
brand moments in its **own** primary (Teacher Workspace → Teacher & School Blue
`#0064FF`; Glow → orange; CaseSync → indigo — see COL-1's build part for the
table). Build from these by default.

**Judgment lens.** Where no control decides and Kind Utility alone is too coarse,
weigh trade-offs against Apple's HIG design principles (Purpose, Agency,
Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight —
developer.apple.com/design/human-interface-guidelines/design-principles). A
reference point like SGDS and GOV.UK, never a checkable standard: principles settle
trade-offs; they are not used to "check" work.

## Two ways in: standalone and return-to-caller

A caller (normally the `dx-design` orchestrator) can dispatch this skill with the
token `mode:return-to-caller` plus the build input in
`../../../procedures/return-to-caller.md`.

In this mode, skip the Phase 1 interview, and take plan approval as "Gates" states
it. Do not spawn the design reviewer in this mode; whoever started the run spawns
it, exactly once, per `../../../procedures/design-review.md`. Instead, return the
full review bundle in `../../../procedures/return-to-caller.md` to the caller.

Standalone invocation (no token) takes a plain ask and owns the whole run: the full
front half, the plan-approval stop, and spawning the reviewer.

## New page vs. modification

This loop covers both. Choose the entry depth by change size, never skip the gates:

- **New page or flow** — run all six phases in "Run order".
- **Modification** (add a field, change a layout region, restyle a component) — run a
  scoped loop: a one-line intent, skip diverge if the structure is fixed, a short plan
  naming the controls the *changed surface* pulls in, then implement and verify the
  changed surface. A modification still binds its controls — adding a field still
  triggers A11Y-3, restyling still triggers TOK-1..3, touching an async action still
  triggers CMP-3. The common failure is treating "just add a field" as outside the
  harness; it is not.
- **Catalog update re-audit** — when controls are ADDED to the catalog, existing
  shipped surfaces are silently out of date until re-audited. Run each affected
  surface through the modification loop: the "change" is the catalog delta, the
  scoped plan is the audit findings against the new controls only.

### Existing surfaces: critique before you polish

Whenever the surface **already exists** and the ask is broader than a narrowly
scoped named change (a restyle, an "improve / polish this", or a catalog
re-audit), the evaluate step belongs to the `dx-design-critique` skill — **invoke
`dx-design-critique` first** and continue here once the user approves its suggestions. Do
not propose changes before the current state has been captured and judged. The
critique returns ranked suggestions whose "what underperforms" list sets the scope
of the polish; the procedure lives in `../dx-design-critique/critique.md`. **Preserved is not waived** — a "preserve" call still
has to pass its controls, it only means don't restyle a deliberate choice.

## Gates

These rules bind in every phase, including a phase whose file the run has not read:

- Work through the phases in order. Do not skip a gate, even when the request seems simple.
- Edit no product file before plan approval. Plan approval occurs one time per run, per `../../../procedures/plan-approval.md`, so never stop twice.
- In return-to-caller mode, skip the plan-approval stop only when the payload carries a real approval. Only these forms count as approval:
  - An approved plan.
  - An accepted-findings list from a pass or `dx-design-critique`, for a smaller finding. A whole-page rebuild always stops once at plan approval before any edit, per the pattern pass rules.
  - A verbatim ask that names a specific plan or chosen direction.

  A generic named change such as "add a field" is NOT approval: no one has seen a plan yet. Write the scoped plan, return it to the caller for approval, and edit no product file until the approval comes back.
- Run the branch guard in `../../../procedures/implement.md` before the first product edit, in both modes. When it trips, hand off to `dx-design-git`.
- Never report a `checks/`-backed control as "passed" when no script ran. Say "verified manually" or "could not verify mechanically", and list what a human should re-check. Every built script covers only a static subset of its control. `checks/COVERAGE.md` names what each script does not cover.
- Do not present output to the user while a verify step fails. The `dx-design-review` agent writes the verdict, never you.

## Run order

Read each phase file when the run enters that phase, and not before. Check the run against the entry depth in "New page vs. modification", and run these phases in order:

1. **Intent**: read [references/intent.md](references/intent.md). When the surface is a flow, or a single page hosts a multi-step interaction, also read [references/flow.md](references/flow.md).
2. **Diverge**: read [references/diverge.md](references/diverge.md). Skip this phase, and do not read its file, when the structure is fixed or the ask names a chosen direction.
3. **Plan**: read [references/plan.md](references/plan.md). It stops at the plan-approval gate.
4. **Implement**: read [references/implement.md](references/implement.md) after plan approval.
5. **Design review**: read [verify.md](verify.md). In standalone mode, run all of its steps in order. In return-to-caller mode, run steps 1 to 3 only, and return the review bundle from "Two ways in". The caller dispatches the reviewer. When findings come back, address them and re-run from step 1.
6. **Rule proposal**: after the user accepts the result, read [references/rule-proposal.md](references/rule-proposal.md).
