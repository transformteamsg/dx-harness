---
name: dx-design
description: 'Front door for design work when the ask is unclear, mixed, or dimensionless — "improve my app", "where do I start?", several issues at once, or brainstorming directions. Grills to find intent, with a five-mode menu as fallback, then routes: a named change to dx-design-execute, a whole-page graded review to dx-design-critique, one of the five pass dimensions to that pass, git-shaped asks to dx-design-git, missing DESIGN.md to dx-design-language. In improve mode it runs light triage and propose-only passes, merges findings into one ranked plan behind one plan approval, then hands the build to dx-design-execute. Also answers control-catalogue rule and waiver questions ("can I waive TOK-1?", "does CMP-3 apply here?") and offers the next step that fits: record the waiver, promote a standing override, or start a rule proposal. A sharp ask that already names its skill or dimension routes there directly and skips this.'
---

# Orchestrate a design run

You are the front door for design work whose ask is unclear, mixed, or dimensionless.
Your job is to find what the person actually wants, then route them to the one skill
that does the work. You never edit product files: the only skill that edits the
product is dx-design-execute, and every fix you broker goes through it. Brand essence
is **Kind Utility**: useful first, kind at the surface. Keep turns short.

A sharp ask never belongs here. When the person has already named a skill or a single
pass dimension ("polish the spacing on /marks"), that specialist handles it directly;
if such an ask still reaches you, hand it straight over without an interview.

## 1. Entry context check

These checks gate product-shaping work only. Classify the ask before you apply them:
rule and waiver questions (section 6), git-shaped asks, harness feedback, and tool
problems need no capture and no design language, so answer or route those first,
without either gate. A sharp ask that already names its skill or dimension skips you
entirely, gates included.

For an ask that shapes the product, confirm the machine and repo are ready:

- Run `agent-browser --help` once. If it fails, capture is not set up: say so in one
  line and route to **dx-design-setup** before anything that needs a capture. Never
  attempt a capture without it.
- Look in the product repo root for `DESIGN.md` (and its generated twin
  `.dx/design.json`). If it is missing, route to **dx-design-language**, not setup: a
  repo with portfolio defaults only is valid, not broken, but a person shaping a
  product deserves the offer to define its design language first.

If both check out, move straight to the grill.

## 2. Grill first

Open with targeted questions, one at a time. Follow the vendored grilling procedure in
`grilling.md` (beside this file, with its provenance header): map the ask as a design
tree, ask only frontier questions, recommend an answer with each question, and look up
facts yourself instead of asking for them. Pace it one question per turn; this person
is mid-task, not in a plan review. Stop grilling the moment the intent is sharp enough
to route: two or three questions usually suffice. Re-invoke the grill mid-flow
whenever a gap appears (a triage finding that could mean two different things, a
brainstorm direction that hides an assumption).

Never show a skill name in a question. The person describes their problem in their own
words; the first skill name they see is at the moment of handoff.

### Fallback: the five-mode menu

Only when the person cannot engage with open questions (short answers, "just show me
the options", visible frustration) fall back to a plain menu of exactly five modes:

1. Make something new
2. Improve what exists
3. Brainstorm
4. Define your design language
5. Set up or fix my tools

The menu stays five modes and carries no skill names. Git-shaped asks and rule or
waiver questions are handled off-menu: never add them as entries.

## 3. Route

Route by what the grill (or menu) surfaced, and name the skill only now, at handoff.
Every skill you dispatch runs in **return-to-caller mode**: pass the token
`mode:return-to-caller` plus the context payload, so the routed skill skips its own
interview and nobody answers the same question twice. The payload is what you already
hold: the settled intent, and for **dx-design-execute** the sprint contract (or the
one-line intent for a modification), the approved plan or accepted findings list (with
any granted waivers and the L1 approver) or the explicit build ask verbatim, and the
surface's design ticket reference. In this mode a routed skill also leaves the design
review to you: whoever started the run spawns the reviewer once.

The routes:

- **A named change, or make something new** (a page, screen, form, or flow): hand to
  **dx-design-execute**, the full loop.
- **A whole-page graded review** ("what's wrong with this?", no dimension named): hand
  to **dx-design-critique**.
- **One pass dimension**: hand to that pass. Wording and tone is **dx-design-copy**;
  spacing, type, and colour is **dx-design-polish**; transitions and easing is
  **dx-design-motion**; the multi-step journey is **dx-design-flow**; structure,
  density, and pattern fit is **dx-design-pattern**.
- **Git-shaped asks** (branches, commits, an unpushed mess): hand to **dx-design-git**,
  off-menu.
- **Missing DESIGN.md, or "define our design language"**: hand to
  **dx-design-language**.
- **Tool problems** (capture broken, tracker unwired, onboarding): hand to
  **dx-design-setup**.
- **Feedback about the harness itself** (a confusing gate, a check that misfired):
  hand to **dx-design-feedback**.
- **Rule and waiver questions**: answer them yourself; see section 6.

<<<<<<< HEAD
Improve-what-exists and brainstorm asks stay with you first; sections 4 and 5 say how.
=======
### Issue-initiated intake

When the ask is "design issue #123" (or a pasted issue body) instead of a described
goal, read `issue-intake.md` (beside this skill) now — it covers fetch/parse, the
who-implements question, resume detection, the AC→E2E mapping, and the
reviewer-routing table. The rest of Phase 1 (teacher-and-moment, product/page type,
done-criteria, component inventory) runs unchanged; the issue just supplies the raw
material Phase 1 would otherwise pull from a conversation.

### Clarify the ask before you scope it
>>>>>>> 6f9e8fd (feat(design): port issue-initiated intake and hand-off flow into tfx:design)

## 4. Improve what exists: light triage

When the intent is "improve this" across an existing surface:

1. **Capture the page** (agent-browser), then skim it.
2. **Name the standout issues** in plain words. Do not grade: scored audits stay with
   dx-design-critique, and triage never attaches a score.
3. **Route by what the person accepts:**
   - One accepted issue in one dimension: dispatch that pass alone as a propose-only
     subagent, with `mode:return-to-caller` and the accepted issue as its payload; it
     returns its ranked findings to you and never re-interviews the person.
   - Several accepted issues across dimensions: dispatch the relevant passes as
     parallel propose-only subagents, one per pass, each with `mode:return-to-caller`
     and its accepted issues, so nobody is interviewed twice. Each pass proposes; none
     of them edits the product or talks to the person.
4. **Merge the proposals into one ranked plan** and run the shared gate in
   `../../../procedures/plan-approval.md`: one plan approval per run, asked by you,
   because you started the run.
5. **Hand the accepted fixes to dx-design-execute**, the single frontend-only
   implementer, per `../../../procedures/implement.md`. Dispatch it with
   `mode:return-to-caller` and the full context payload from section 3: the sprint
   contract, the approved plan or accepted findings list (with any granted waivers and
   the L1 approver), and the surface's design ticket reference. It then skips its own
   interview and plan-approval stop, returns its run record to you, and does not spawn
   its own reviewer. You never apply a fix yourself.
6. **One review of the full result**: dispatch the design reviewer once over the
   combined outcome, per `../../../procedures/design-review.md`.

When more than one credible approach exists, render the options as HTML artifacts
first and build only the one the person chooses.

## 5. Brainstorm

<<<<<<< HEAD
Brainstorm mode lives here, inside the orchestrator:
=======
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
6. **Who implements**: will you (the person running this loop) carry it through to
   Phase 4 yourself, or is this a plan for someone else to build? Infer it when the
   framing already answers this; ask only when genuinely unclear. See
   `issue-intake.md` for how the answer shapes Phase 3's gate.
>>>>>>> 6f9e8fd (feat(design): port issue-initiated intake and hand-off flow into tfx:design)

- **Ground first**: capture the surface and read DESIGN.md (or note the portfolio
  defaults) before proposing anything.
- **Explore 2 to 3 directions**, each with its trade-offs stated plainly.
- **Route when the person picks one**: a chosen direction becomes a named change
  (dx-design-execute) or a pass, through the same handoff rules as section 3.

## 6. Rule and waiver questions

"Can I waive TOK-1?", "who approves?", "does CMP-3 apply here?": these are yours to
answer, off-menu, and you never build in response to one.

- **Read before you answer, every time**: `../../../standards/README.md` and
  `../../../procedures/catalogue-mechanics.md`. Never answer a waiver question from
  memory or from a summary.
- **Name rules plain-title first**: plain words, then the id in brackets, then the
  website link, per catalogue-mechanics.
- **Offer exactly one next step**, the one that fits:
  - Record the approved waiver on the surface's design ticket
    (`../../../procedures/design-tickets.md`).
  - Promote a repeated waiver into DESIGN.md's Overrides.
  - Start a rule proposal (`../../../procedures/rule-proposal.md`).
- **Act only on an explicit yes.** Silence, hedging, or a new question is not consent;
  do nothing until the yes arrives.

## Shared back half

You join the shared back half of the run at plan approval. The procedure docs live in
`../../../procedures/` (relative to this file): `plan-approval.md`, `implement.md`,
`design-review.md`, `rule-proposal.md`, `catalogue-mechanics.md`, and
`design-tickets.md`. The catalogue itself is `../../../standards/catalog.yaml`; its
tier table and waiver syntax are in `../../../standards/README.md`. Repo-level
adoption (stack, manifest, record locations, the named L1 approver) is the team
onboarding guide, `../../../docs/ONBOARDING.md`.

<<<<<<< HEAD
Second person, plain language, Singapore English, no AI-writing tells; SLP-9 binds
this prose too.
=======
Expand the chosen option into a plan:

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
- **AC scenario → E2E test mapping** (issue-initiated surfaces only): for each
  acceptance-criteria scenario, the E2E test that will verify it — what it navigates
  to, what it interacts with, what observable outcome it asserts. See
  `issue-intake.md`.
- **Reviewer-routing** (issue-initiated surfaces only): per AC scenario, whether it
  needs a human designer's review before merge (new pattern, new flow, destructive
  action → strongly recommended; scoped modification with clear AC → can defer). See
  `issue-intake.md`'s table; carry the result into the decision record and, later,
  the PR body.
- **Plan summary table**: end the plan with a compact table the reader can scan in one
  pass — one row per plan dimension (structure; components; interaction & motion; async
  states + each one's A11Y-11 channel; controls in scope; waivers; tradeoffs; AC scenario
  → E2E test mapping and reviewer-routing when issue-initiated; evidence
  to capture), each cell a tight phrase, not prose. It is a summary the grill and the
  approver read first, never a substitute for the plan above it.

**Stop. The user approves the plan before any implementation.** This is the cheapest
place for human judgment — structural mistakes caught here cost a conversation, not a
rebuild. The gate runs across **three stages**, in order — never collapsed on your own
initiative; only the human's clear early approval shortens it (`grill.md`'s
early-approval rule):

- **Stage 1 — expose the plan.** The full plan goes in your message body, ending with
  the plan summary table. Close with a plain-text line that you will grill the plan
  next — **never a modal/option dialog in the same turn as the plan**, which forces a
  decision before the reader has read what they're deciding on. Do not ask for
  approval yet.
- **Stage 2 — grill the plan.** Read `grill.md` (beside this skill) now and run it:
  interrogate the exposed plan one question at a time, each with a recommended answer,
  looking up facts from context and putting every open decision to the human, and
  folding every answer back into the plan before the next question. This is where hidden assumptions and
  ducked decisions get resolved, so the human approves a sharpened plan rather than a
  first draft. Grilling sharpens only: a question whose answer changes the chosen
  structure sends you back to Phase 2, and grilling never relaxes a control.
- **Stage 3 — the structured ask.** Once the grill is spent, ask for sign-off on the
  sharpened plan with a structured `AskUserQuestion` — the documented Phase-3 default.
  In **solo** mode (Phase 1's "who implements") the options are **Approve / Adjust**,
  as before: "Approve" proceeds to implement; "Adjust" sends you back to revise the
  plan — a structural adjustment returns to Phase 2 (the grill's own rule), anything
  else is re-exposed and re-asked. In **hand-off** mode the options are
  **Approve-and-hand-off / Adjust**: approval creates the branch and the hand-off
  artifact (below) instead of proceeding to Phase 4. A free-text approval is still
  accepted; a vague "continue" is not — confirm what they are approving.

**Branch and hand-off.** On either approval outcome, create the branch now — never
before this gate, since nothing durable happens ahead of human sign-off. Naming and
procedure: `issue-intake.md`'s "Branch", "On hand-off approval", and "On solo
approval" sections.

This structured sign-off question (Approve/Adjust, or the hand-off variant) is the
default at the Phase 2 option pick and at continuation/verify gates too — but the
three-stage split above is Phase 3 only. At the Phase 2 pick the dialog may be
same-turn, because the options are short enough to read inside it. In an unattended
run the grill has no human to answer it — grill yourself and record it, per
`grill.md`.

In an **unattended run** with no human reachable, proxy approval is
permitted only when the operator authorized it up front — record it verbatim as
"approved by operator proxy — unattended run" in the decision record, never as if a
human approved.

Proxy approval is not a substitute for review. In an unattended run, still emit a
**compact, reviewable plan + intended-diff summary** for async sign-off: the files
to be touched, the specific visual/structural changes, and — explicitly — what is
being **preserved**. Route it to the async reviewer (the portfolio designer) and
record that it was sent; do not treat "operator proxy" as equivalent to a human
having read the diff.

On a team with no dedicated designer, this gate (and the verify gate) is reviewed
async by a portfolio designer — route the plan to them rather than treating the gate
as optional. Write the approved plan to a decision record at `docs/decisions/<page>.md` in
the **product repo**. If `docs/decisions/TEMPLATE.md` does not yet exist there,
copy it from the plugin first — it ships at
`<this-skill-dir>/../../../docs/decisions/TEMPLATE.md` (resolved the same way as
the catalog in the Load-first note, three levels up) — so records conform to
`audit-record.py` by default. Base the new record on that template. The approved
plan is the artifact the verify phase grades against, so it must be fixed, not
whatever you last proposed. Any L1 waiver granted here records its named approver
in that file.

## Phase 4 — Implement

Build exactly the approved plan. Constraints, non-negotiable:

- **Conservative, reversible defaults — do not restyle what is already
  deliberate.** Established iconography, corner radius, layout structure, and
  settled copy are presumed intentional: do not change them as a side effect of a
  scoped task. If a change to one is genuinely warranted, flag it explicitly as a
  *proposed* change with its rationale and a one-line revert note in the plan/diff
  summary — never silently. Default to the smallest reversible change that meets
  the contract. **But preserved is not waived:** "deliberate" protects an element's
  *look* from restyling, never its *compliance* from verification. A preserved avatar,
  badge, or icon still must pass A11Y-1 (contrast), A11Y-2/-3, and every in-scope
  control; if it fails one, fixing it is in scope — flag the fix as above rather than
  leave the failure standing because the element was "established". (Example:
  per-section semantic colour-coded icons that are decorative `aria-hidden` wayfinding
  are **not** SLP-1 "rainbow slop" — preserve them; neutralising them is a restyle to
  flag, not a default.)
- Compose only manifest components (`status: "stable"` from `.dx/component-manifest.json`
  if the product has one; CMP-1); semantic shadcn tokens only — no raw
  colour, off-scale spacing, or off-scale radii (TOK-1..3); Plus Jakarta Sans /
  Inter only, on-scale sizes (TYP-1..3).
- Functional colours come from the Radix scales (COL-2); **small functional-colour
  text (≤12px) on a tint uses step-12, not step-11** — step-11 on a tint dips below
  the 4.5:1 AA floor (A11Y-1).
- Visible label on every field (A11Y-3); keyboard reach + focus states (A11Y-2);
  AA contrast (A11Y-1); targets ≥ 24px, 44px on mobile (A11Y-4); respect reduced
  motion (A11Y-5).
- Anti-slop is standard (SLP-1..11) — the default AI aesthetic is a defect. The
  rules live in the catalog you loaded first; re-read the SLP block before
  styling anything. Highest-frequency traps: purple/violet gradients (SLP-1),
  nested cards (SLP-4), identical-card grids (SLP-5), bounce easing (SLP-8).
- Accessibility structure (A11Y-6..10, GovTech Essential tier) — apply from
  the catalog; every image/icon, heading, custom control, page title, and
  landmark is in scope.
- Every async state change picks ONE announcement channel (A11Y-11): transient →
  live region, no focus steal; context replacement → focus moves to the revealed
  surface, no `role="alert"` on the focus target. Declare the channel per state in
  the Phase 3 plan alongside CMP-3's state enumeration.
- Destructive actions: consequence + undo/confirm before execution (CMP-2, L0).
  Build forgiveness beyond CMP-2's minimum (HIG: Agency): recovering from the
  unexpected should not cost the teacher time or work — preserve drafts, keep
  back-navigation safe, make reversal cheap.
- Consistency is a feature (HIG: Familiarity, Flexibility): once an element's
  behaviour or appearance is established, reuse it across the surface, and keep
  content and controls in predictable positions across the three widths — people
  learn faster when new interactions work the way the last one did. **Use
  design-system components at their defaults and the way sibling pages use them
  (CMP-7): an override that changes a default's colour/contrast/shape, or a control
  group whose members don't share a resting affordance, is a finding unless recorded
  with a reason — re-check any colour/contrast override under A11Y-1.**
- **Action hierarchy** (CMP-5): one primary (filled) action per view — secondary steps
  down to outline/tonal, tertiary to ghost/link; a destructive action takes its own
  variant, never the primary style (CMP-2). The primary's colour is the product's own
  brand primary (COL-1). Make the next step obvious without a label.
- **Tables** (CMP-6): for tabular data — gradebooks, rosters, attendance — use a real
  `<table>` with `<th>` headers (A11Y-7); right-align numeric columns in tabular figures
  (TYP-5) and left-align text; keep the header visible while scrolling; design the empty
  and loading states (CMP-3); set density to the task (LAY-5); separate rows with spacing
  or hairline dividers, not nested-card chrome (SLP-4). If records are not compared across
  shared columns, a list or cards may fit better than a table (SLP-11).
- **Empty states** (CMP-4): whatever the surface, an empty state's heading and subtext
  must read as "nothing here yet" — never as still loading or as a permissions error —
  and no skeleton row, shimmer, or spinner may render alongside that heading.
- **Cross-user content** (CMP-9): where content authored by one user renders to a
  different user (a teacher's comment shown to a parent, a message shown to another
  staff member), sanitise it at the render boundary — an allowlist sanitiser
  immediately before render. A "schema-constrained editor" claim at author time is not
  sufficient on its own; the guarantee must hold where the HTML actually reaches the
  other user's screen.
- **Identity**: product icons come only from the approved product-icon family (IDN-2,
  L1); copy carries the product's calibrated tone register (IDN-3, L2); on CaseSync
  surfaces, casework is treated as sensitive — no celebration/gamification around case
  data (IDN-4, L1, CaseSync-scoped).
- **Interface craft** (HIG: Craft) — the small details that read as care: tabular
  figures, concentric radius, property-scoped interruptible transitions, press
  feedback, hit-area expansion, feels-instant loading, layered shadows, type polish,
  image edges, and disciplined `will-change`. Each refines the controls above, none
  replaces them, and the evaluator grades Craft on them. Apply the ones the surface
  calls for **from `implement-craft.md`** (beside this skill) as you build — the
  specifics live there so this list stays scannable; don't defer them to a cleanup pass.
- Copy follows the `copy` skill as you write it, not as a cleanup pass
  (it ships with this harness: `../dx-copy/SKILL.md` relative to this skill).
  That includes the anti-slop copy rule (SLP-9): no AI-writing tells — buzzwords,
  em-dash chains, filler, chatbot artifacts, structural tells (negative
  parallelism, forced triads, copula avoidance), or label/helper pairs that
  restate each other. Canonical lists and calibration:
  `standards/controls/slp-9.md` — resolved relative to this SKILL.md (three levels up),
  as in the Load-first note above.
- **Make every asserted state reachable for evidence.** If a hybrid control claims
  loading/success/error states, the verify phase must photograph them — build a
  clearly-marked demo-only hook where needed (e.g. a `?fail=1` query param to force
  the error state) and note it in the decision record. A state that can't be
  demonstrated can't be verified.
- **Before evidence** (issue-initiated modification of an existing surface): before
  making any change, capture the current live state — same widths and capture
  mechanism as Phase 5's evidence set. This is the "before" half of Phase 6's
  before/after PR screenshots and cannot be reconstructed once the change is made.
- **AC scenario tests** (issue-initiated surfaces): each acceptance-criteria scenario
  gets its own E2E test asserting user-observable outcomes — never implementation
  details — committed together with the UI change for that scenario, per the Phase 3
  AC→E2E mapping. Not batched at the end.
- **Resuming a hand-off**: if this run is resuming an approved plan (Phase 1's
  explicit-framing resume rule in `issue-intake.md`), the decision record's approved
  plan is fixed — do not re-derive Intent/Diverge/Plan.
- Structure drift from the approved plan is a defect — if implementation reveals the
  plan was wrong, go back to the user, don't silently improvise.

## Phase 5 — Verify

Run the four steps in `verify.md` (beside this skill) IN ORDER — read it now,
before verifying anything. Do not present output to the user while a step is
failing.

- Deterministic controls run first; an L0 failure blocks everything, an L1
  failure sends you back to Phase 4 — see "What actually runs today" above for
  what the scripts do and don't cover.
- Evidence sets are required: widths, states, journey (with a recovery path),
  the Phase-1 inventory checkoff, and the dark-mode N/A rule when the product
  has no dark mode.
- The evaluator verdict is written by the spawned `dx-evaluator` agent, never by
  you, and is pasted verbatim into the decision record.

## Phase 6 — Ratchet

After the user accepts the result, finish the decision record started in Phase 3
(`docs/decisions/<page>.md`): chosen option, rejected options and why, waivers granted
and by whom, and the verify verdict. Then:

- Any failure the evaluator or user caught that no control covered → propose a new
  control or anti-pattern entry for `standards/`. Follow the "Growing the catalog"
  section of the `standards` skill — it is the single authoritative description
  of the proposal format.
- Harness friction the run surfaced that is **not** a control gap — a confusing step, a
  missing/unbuilt check, a process or onboarding nit — is filed as a GitHub issue via the
  `feedback` skill (it carries the procedure; `docs/harness-feedback.md` is the spec).
- A pre-existing violation fixed only on the lines this run touched, with the same
  defect plausibly present in untouched sibling surfaces (a design-system default that
  needs an `min-w-0`/label/scale fix elsewhere too) → file a follow-up issue via the
  `feedback` skill (category `a11y` or `standards`) so the root cause gets tracked
  once, not re-discovered by the next run that happens to touch a different sibling.
  Same for a pre-existing E2E baseline flake confirmed unrelated to this change: file
  it once; a later run can then dedupe against it via the `feedback` skill's own
  `gh issue list --search` step instead of re-investigating from scratch.

### PR body (issue-initiated surfaces)

When the run started from an issue, open the PR with a body that carries the
evidence forward rather than a summary of it:

- **Acceptance criteria table** — one row per AC scenario: scenario name, E2E test
  file path, pass/fail from the Phase 5 run.
- **Designer-review checklist** — only when the reviewer-routing table (Phase 3)
  flagged a scenario "strongly recommended": a step-by-step list the human reviewer
  works through in order — read the decision record and plan before touching code;
  open the app; walk each flagged AC scenario against the plan; then the in-scope
  catalog controls and the evaluator verdict already pasted into the decision record
  (the checklist points at it, it doesn't repeat it), plus anything the evaluator's
  shared-limit caveat (`verify.md`) flags as needing a human.
- **Screenshots** — a before/after pair at each captured width for every changed
  region on a modification (same viewport, same state, so the two are directly
  comparable — not an "after" shot the reviewer has to compare from memory);
  inline screenshots per scenario, in journey order, for a new page or flow.
  Caption each pair or frame with what changed and what to check (the control or
  AC scenario it's evidence for), so a designer or engineer can tell from the PR
  alone what changed and what to verify. Reuse Phase 5's evidence set; do not
  build a second, simpler one.
- **Designer walkthrough** — a ready-to-paste environment-setup prompt (repo,
  branch, and route filled in) plus a plain-language step-by-step test plan, so a
  reviewer with no engineering background can see the change running, not just in
  screenshots. See `issue-intake.md`.
>>>>>>> 6f9e8fd (feat(design): port issue-initiated intake and hand-off flow into tfx:design)
