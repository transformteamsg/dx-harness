---
name: dx-design-execute
description: 'Build product UI — a new page, screen, form, flow, or component, or a stated change to an existing one ("add a field", "restyle the header", "set the padding to 16px"). The only skill that edits the product: it also builds accepted findings handed over by the passes and dx-design-critique. Runs intent → diverge (2–3 directions) → plan approval → implement → design review; an explicit ask to build a specific plan or chosen direction counts as plan approval. NOT for a review with no change named — that is dx-design-critique; NOT for an open-ended improvement ask naming one pass dimension (copy, flow, pattern, motion, polish) with no edit stated — that is the matching pass.'
---

# Design UI

You are designing UI for the Teacher & School portfolio (Teacher Workspace, CaseSync,
Glow, and TW surfaces). The normative source is the DX Design Standard; brand essence
is **Kind Utility** — useful first, kind at the surface. Standards compliance is not a
final check — it shapes every phase. The run is: intent, diverge, plan approval,
implement, design review. Work through the phases in order; do not skip a gate even
if the request seems simple. This is the ONLY skill that edits the product: the
passes and dx-design-critique propose only, and their accepted findings are built
here. Intent and diverge live in this file; the back half of the run (plan approval,
implement, design review, rule proposal) is shared procedure, loaded from
`../../../procedures/` and never restated here.

The harness's one promise: **intent without loss**. What the builder means is written
down as a contract in Phase 1; every later phase is graded against that contract;
drift from it is a defect.

<!-- dx-sync:L0 source=catalog -->
**Non-negotiables (L0), binding even outside the loop:** AA contrast (A11Y-1); keyboard
reach with visible focus (A11Y-2); a visible label on every field (A11Y-3); destructive
actions show consequences and offer undo or confirm (CMP-2).
<!-- /dx-sync:L0 -->
These never bend — if one
seems impossible, that is a blocking question for the user, not a judgment call. (The
catalog carries the rest; these four are restated here because this SKILL.md travels in
the plugin while the harness's CLAUDE.md does not.)

**Load first:** the control catalog at `standards/catalog.yaml`. **Locating it:** the
catalog ships with this harness, not with the product repo — resolve it relative to
this SKILL.md file, three levels up: `<this-skill-dir>/../../../standards/catalog.yaml`
(the same path works in the harness dev repo and when installed as the
`dx-harness` plugin; do not expect `standards/` in the project cwd). Filter
controls by `phase` and scope (`products`/`audiences` — absent = global) as you
go; read a control's `detail` file (same `standards/`
directory) before applying it. Also read the product's `DESIGN.md` (repo root)
if present — per-product parameters only; on conflict with implemented code
conventions, the code wins and you flag the drift. Spec: the harness's
`docs/DESIGN-CONTEXT.md`. Also read `../../../procedures/catalogue-mechanics.md`
for the catalog mechanics: filtering, tier behaviour for agents, detail files, the
waiver protocol, and plain-title rule naming. For any waiver or applicability
question read `../../../standards/README.md` — never answer from memory. The shared
back half of the run lives beside it: `../../../procedures/plan-approval.md`,
`../../../procedures/implement.md`, `../../../procedures/design-review.md`,
`../../../procedures/rule-proposal.md`, and `../../../procedures/design-tickets.md`.

**The stack** (deliberately boring, AI-legible): Base UI components, Radix Colors
scales, shadcn/ui default tokens for spacing/radius/type. Plus Jakarta Sans (600) for
display, Inter (400/500/600) for body/UI. Each product anchors primary actions and
brand moments in its **own** primary (Teacher Workspace → Teacher & School Blue
`#0064FF`; Glow → orange; CaseSync → indigo — see COL-1's detail file for the
table). Build from these by default.

**Judgment lens.** Where no control decides and Kind Utility alone is too coarse,
weigh trade-offs against Apple's HIG design principles (Purpose, Agency,
Responsibility, Familiarity, Flexibility, Simplicity, Craft, Delight —
developer.apple.com/design/human-interface-guidelines/design-principles). A
reference point like SGDS and GOV.UK, never a checkable standard: principles settle
trade-offs; they are not used to "check" work. The phase notes below name the ones
that recur in this portfolio.

<!-- dx-sync:lay-controls -->
**Layout controls.** Layout has seven controls: LAY-1 (the product's declared
column grid and gutter scale — N/A where no grid is declared in `.dx/design.json`
`layout_system`; L2), LAY-2 (reflow at 320 px — WCAG 2.2 SC 1.4.10, L1), LAY-3
(page-template fit, L2), LAY-4 (body-text measure ≤ 80ch, target ~66ch — L2),
LAY-5 (density fits the task, L2), LAY-6 (edge / optical alignment, L2), and
LAY-7 (one primary focal region; visual reading order matches the task's
priority order — L2).
<!-- /dx-sync:lay-controls -->

## Two ways in: standalone and return-to-caller

A caller (normally the `dx-design` orchestrator) can dispatch this skill with the
token `mode:return-to-caller` plus a context payload:

- the sprint contract, or the one-line intent for a modification, so Phase 1 is not
  re-interviewed;
- the approved plan or the accepted findings list (with any granted waivers and the
  L1 approver), or the verbatim ask when it names a specific plan or chosen
  direction, so plan approval is not re-asked;
- the surface's design ticket reference (issue number or local markdown path).

In this mode, skip the Phase 1 interview. Skip the plan-approval stop only when the
payload carries a real approval: an approved plan; an accepted-findings list from a
pass or critique, which counts as approval for a smaller finding (a whole-page
rebuild always stops once at plan approval before any edit, per the pattern pass
rules); or a verbatim ask that names a specific plan or chosen direction (only
these forms count as approval per `../../../procedures/plan-approval.md`). A
generic named change such as "add a field" is NOT approval: no one has seen a plan
yet. In that case write the scoped
plan and return it to the caller for approval; do not edit the product until the
approval comes back. Do not spawn the design reviewer in this mode; whoever
started the run spawns it, exactly once, per
`../../../procedures/design-review.md`. Instead, return the full review bundle to
the caller: the built changes, the sprint contract (or the one-line intent), the
approved plan, the component inventory, the in-scope judgment and hybrid controls,
the waivers applied, and the evidence captured. This is every input reviewer
dispatch in `../../../procedures/design-review.md` requires; a return of changes
and evidence alone leaves the caller unable to dispatch the reviewer.

Standalone invocation (no token) takes a plain ask and owns the whole run: the full
front half, exactly one stop at plan approval, and spawning the reviewer. In BOTH
modes the branch guard from `../../../procedures/implement.md` runs before any edit,
and it hands off to `dx-design-git` when it trips.

## New page vs. modification

This loop covers both. Choose the entry depth by change size, never skip the gates:

- **New page or flow** — run all six phases.
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
re-audit), the evaluate step belongs to the `critique` skill — **invoke
`critique` first** and continue here once the user approves its suggestions. Do
not propose changes before the current state has been captured and judged. The
critique captures the live page, runs a structured layout read (against the
pattern inventory, `../../../standards/layout-patterns.md`), grades it against the in-scope catalog
controls and Kind Utility, and returns ranked suggestions whose "what
underperforms" list sets the scope of the polish; the procedure lives in
`../dx-design-critique/critique.md`. **Preserved is not waived** — a "preserve" call still
has to pass its controls, it only means don't restyle a deliberate choice.

## A flow is not a stack of pages

The page is the unit of evidence, but the design is the journey. When the surface is
a flow — or a single page hosts a multi-step interaction — design the journey, not
just each screen:

- **Map it in Phase 1**: entry points (where does the teacher arrive from, and with
  what already known?), the done state, and every exit — back, cancel, abandon. A
  flow with only its happy path mapped is a demo, not a design.
- **Edge cases are structure, not polish.** Decide in Phase 3, not during build:
  interruption (timeout, network loss mid-flow), partial completion and resume, the
  teacher who left at step 2 and returns tomorrow, data that already exists
  elsewhere. For each, the plan says what happens to the teacher's work — "your
  draft is saved" must be a designed behaviour before it can be honest copy.
- **Interactions carry the flow.** Transitions preserve context — content and
  controls stay in predictable positions across steps (HIG: Flexibility); keyboard
  traversal works across the whole journey, not just within each screen (A11Y-2 at
  flow scope); focus lands somewhere sensible after every step change (A11Y-11
  applies at each transition, not only at async states).
- **Escapability is part of the structure** (HIG: Agency): the teacher can leave at
  any step without losing work, and the route out is visible, not discovered.

## What actually runs today

Not every deterministic control has a script yet, and every built script covers only a
**static subset** of its control — never assume a control is mechanically enforced.
**Never report a `checks/`-backed control as "passed" when no script ran** — say
"verified manually" or "could not verify mechanically", and list what a human should
re-check. Which scripts exist and exactly what each does *not* cover: `checks/README.md`
(read it before the verify phase).

## Phase 1 — Intent (sprint contract)

### Clarify the ask before you scope it

A request like "apply the standards", "improve this", "polish it", or "make it
better" names *no dimension of change* — and you cannot infer one, so do not try.
"Apply the standards" in particular reads by default as a **compliance + anti-slop
pass**: on a surface that is already decent, that can finish with the visuals looking
almost unchanged. That is exactly what disappointed the Glow pilot — the builder
wanted a brand-forward visual redesign, said "apply the standards", and got a run that
tightened UX the surface had mostly got right already. The fix is not to guess bigger;
it is to **ask**. When the request is open-ended, use a structured `AskUserQuestion`
to pin down which **dimension(s)** are in scope:

- **Visual & brand expression** — colour, type expression, imagery, the surface's
  energy, and how strongly it carries the product's brand (Glow's warmth, TW's blue,
  CaseSync's indigo). This is the dimension "apply the standards" silently drops.
- **Layout & structure** — hierarchy, composition, page template, density.
- **UX & flow** — the teacher's path, the steps, the states, the friction.
- **Copy** — headings, labels, microcopy, error states.
- **Compliance & anti-slop only** — fix control violations, change nothing that is
  deliberate. This is the *narrowest* ask; confirm it is what the builder meant
  rather than the default they fell into.

Pair the dimensions with an **ambition level** — the smallest reversible change that
meets the contract (Phase 4's standing default), a targeted lift of the
underperforming parts, or a bold reimagining *within the product's existing system*
(never an invented aesthetic — COL-1, TYP-1, SLP-1 still bind). Standards compliance
is the floor in every case; this question decides whether the ceiling is in scope
too. Write the answer into the done-criteria so the evaluator grades against the
dimension the builder wanted, not the one the phrase defaulted to.

Establish the rest, asking the user only what you cannot infer:

> For an **existing** surface, run "Existing surfaces: critique before you polish"
> (above) before writing the contract — the contract's done-criteria should target the
> critique's findings *through the dimensions chosen above*, not a blanket redesign and
> not a compliance-only pass when the builder asked for more. ("Critique the current
> state first".)

1. **Purpose**: what must the teacher accomplish on this page? One sentence. Apply
   the one test: *does this help teachers work faster with less stress?* If not,
   raise that before designing anything. Keep the scope focused (HIG: Purpose):
   prioritise the few things this moment actually needs and make those truly good —
   a page with a clear use beats one that does everything.
2. **The teacher and the moment**: anchor in a specific teacher's real workflow, not
   an abstract "user" — can you name the teacher and the moment this serves? ("Ms.
   Lim, P5 Math, entering marks the week before reports are due.") Design for the
   stressed week, not the average one.
3. **Product and page type**: which product (TW / CaseSync / Glow / TW surface — this
   sets tone calibration per `copy`), and what kind of surface: workspace
   view, form, flow step, dashboard, settings, empty state, onboarding. Page type
   selects controls via `applies_to`. **Audience**: who does this surface serve —
   teachers (the default; assume it when unstated), students (ask which band:
   primary, or secondary and up), or parents? Record it in the sprint contract;
   it scopes `audiences:`-scoped controls for the rest of the loop. If the product
   repo has a `DESIGN.md`, load it now — it calibrates colour/tone/motion for
   everything downstream. **Any
   surface with an async or destructive
   action inherits the `[flow]` controls** (CMP-2, CMP-3) even when it is a single
   page — do not let the page/flow split scope them out.
4. **Done-criteria**: write a short sprint contract — the 3–6 statements the evaluator
   will later grade against. State the **dimension(s) and ambition** chosen in "Clarify
   the ask" as explicit criteria (e.g. "the surface visibly carries Glow's warmth", not
   just "passes the standards") — otherwise the evaluator has no way to catch a run that
   delivered compliance when the builder wanted a visual redesign. Include the
   `intent`-phase controls (CNT-2 naming applies here: name the feature in plain
   language now, before a placeholder name spreads).
5. **Component inventory**: list the surface as a coverage checklist — the route,
   every component it renders (by import name), and every **interactive control**
   on it (buttons, inputs, dropdowns/combobox, toggles, tabs, links, menus). For
   each interactive control, name the states to exercise later: open, keyboard-tab
   (focus visible?), screen-read (role + accessible name + state?). This is the
   list Phase 5 checks off and the evaluator independently verifies — coverage is
   a provable checklist, not a vibe. (For an existing surface, build this during
   "Existing surfaces: critique before you polish".)

Output: the sprint contract, shown to the user.

## Phase 2 — Diverge

Produce 2–3 clearly different directions and render each one as a real,
self-contained HTML page, so the person picks between things they can see, not
descriptions. Skip diverge only when the structure is fixed (the modification path
above) or the ask names a chosen direction.

**Rendering and hosting.** Each direction is one self-contained HTML file: inline
CSS, no external requests, honest content (the real headings and copy from Phase 1,
not lorem ipsum). In Claude Code, publish the pages as Claude Artifacts; they open
in the browser automatically. In a harness without artifact publishing, write the
HTML files locally and open them in the browser (`open <file>` on macOS, or the
platform equivalent). In a headless or unattended run where no browser can open,
print the file paths or artifact URLs and ask for the pick; NEVER silently choose a
direction yourself.

**The accompanying summary.** Beside the rendered pages, give each direction a short
text summary: layout structure, which existing components it composes, how the flow
splits across steps, a one-line **visual thesis** (the mood and energy it carries,
stated as an extension of the product's existing system, never an invented new
aesthetic), and one sentence on the trade-off.

**The pick is the contract.** Record the chosen direction on the surface's design
ticket run record (`../../../procedures/design-tickets.md`); the design review
audits the built result against it.

Use the product's component manifest
(`.dx/component-manifest.json`, filtered to `status: "stable"` entries) —
options may only compose components that exist in the manifest (CMP-1 applies from
here on). If the product has no manifest yet, fall back to the v0-limit procedure
in `standards/controls/cmp-1.md` and note "asserted, no manifest".
Progressive disclosure is the default pattern: show the core path, reveal complexity
on demand. Three anti-slop controls bind at this altitude: a complex multi-section
task gets a page, never a modal (SLP-10) — if an option puts tabs, columns, or its
own scrolling inside a dialog, it is not an option; a grid of identical cards is
not a default layout (SLP-5) — structure should come from the task's hierarchy, not
a template; and a card is only for an interactive unit (SLP-11) — if an option boxes
static content in card chrome where spacing, type, and a divider would group it, that
is a finding, not a layout. Two lenses bind here too: simplicity is not minimalism (HIG: Simplicity) —
keep the important things close and let the rest fall away, never hide what the task
needs; and keep the teacher free to move (HIG: Agency) — an option that locks people
into a guided flow or mode must make it easy to skip or escape.

**Compose, don't fill.** Treat the first screen as a composition, not a container to
pack: one clear focal point — the teacher's primary task and its single primary action
(CMP-5) — with related content grouped by proximity and a shared region rather than
boxed in cards (SLP-11), and everything else stepped down so hierarchy does the
explaining (SLP-6). Each option's layout is graded at verify against LAY-3 (does it fit
a known page template for its type?), LAY-5 (does its density fit the task?), LAY-6
(do shared edges align?), and LAY-7 (one primary focal region; does the visual reading
order match the task's priority order — the squint test) — design to them now, not as
a cleanup pass. When diverging on an existing surface, the critique's layout
suggestions seed the options.

Output: the rendered direction pages plus their summaries, with a recommendation.
The user picks; the pick becomes the contract above.

## Phase 3 — Plan (human gate)

The gate protocol is shared: read `../../../procedures/plan-approval.md` now and
run it. It holds the stop-once rule (plan approval occurs one time per run; an
explicit ask to build a specific plan or chosen direction counts as approval), the
three gate stages, L1 waiver approval, the unattended-run proxy rules, and where
the approved plan is recorded. The grilling procedure its stage 2 runs is
`grill.md`, beside this skill. In return-to-caller mode the gate is satisfied only
when the payload carries an approval; without one, return the plan to the caller
per "Two ways in" above, and never stop twice in one run.

What the plan itself covers is this skill's job. Expand the chosen direction into a
plan:

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
- **Flow map** (when the surface is a flow or hosts a multi-step interaction): entry
  points, done state, every exit, and the edge cases from "A flow is not a stack of
  pages" — interruption, partial completion, resume — each with what happens to the
  teacher's work. A plan that covers the steps but not the journey between them is
  incomplete.
- **Tradeoffs, named**: what this design sacrifices and why that's acceptable. A plan
  without a tradeoffs section is incomplete.
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
  `<this-skill-dir>/../../../docs/decisions/TEMPLATE.md` (resolved the same way as
  the catalog in the Load-first note) so records conform to `audit-record.py` by
  default.

## Phase 4 — Implement

The implement procedure is shared: read `../../../procedures/implement.md` now. It
holds the **branch guard** (run it before any edit, in both modes; when it trips,
hand off to `dx-design-git`), the frontend-only boundary, and the non-negotiable
build constraints. Build exactly the approved plan under them.

Skill-specific notes while building:

- **Interface craft** (HIG: Craft): the small details that read as care. Apply the
  ones the surface calls for from `implement-craft.md` (beside this skill) as you
  build, not as a cleanup pass; each refines the shared constraints, none replaces
  them, and the design reviewer grades Craft on them.
- The copy pass skill the shared constraints defer to ships with this harness:
  `../dx-design-copy/SKILL.md`, relative to this skill.

## Phase 5: Design review

In standalone mode, run the four steps in `verify.md` (beside this skill) IN
ORDER: read it now, before verifying anything, and do not present output to the
user while a step is failing. It carries the deterministic checks and the evidence
sets, then hands off to the shared procedure
`../../../procedures/design-review.md` for reviewer dispatch, the verbatim-verdict
rule, and the verdict re-check from new screenshots. The verdict is written by the
`dx-design-review` agent, never by you.

In return-to-caller mode, run only steps 1 and 2 of `verify.md`: the deterministic
checks and the evidence capture. Never run step 3 yourself; reviewer dispatch
belongs to whoever started the run, exactly once. Return the review bundle from
"Two ways in" to the caller, who dispatches the reviewer and routes the verdict
back; when findings come back, address them and re-run from step 1 (step 4).

## Phase 6: Rule proposal

After the user accepts the result, finish the decision record started in Phase 3
(`docs/decisions/<page>.md`): chosen direction, rejected directions and why, waivers
granted and by whom, and the review verdict verbatim. Then follow
`../../../procedures/rule-proposal.md` for any failure the review or the user caught
that no control covered (it also routes harness friction to the feedback skill,
which carries that procedure), and record the run on the surface's design ticket per
`../../../procedures/design-tickets.md`.
