# Phase 1: Intent (sprint contract)

Read this file when the run enters Phase 1. A modification still writes a one-line
intent and a scoped contract from it.

### Clarify the ask before you scope it

A request like "apply the standards", "improve this", "polish it", or "make it
better" names *no dimension of change* — and you cannot infer one, so do not try.
"Apply the standards" in particular reads by default as a **compliance + anti-slop
pass**: on a surface that is already decent, that can finish with the visuals looking
almost unchanged. The fix is not to guess bigger;
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
too. Write the answer into the done-criteria so the design reviewer grades against the
dimension the builder wanted, not the one the phrase defaulted to.

Establish the rest, asking the user only what you cannot infer:

> For an **existing** surface, the contract's done-criteria target the critique's
> findings *through the dimensions chosen above*, not a blanket redesign and not a
> compliance-only pass when the builder asked for more.

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
   sets tone calibration per `copy`; a repo outside the portfolio answers
   **other** and names the actual product — a true answer always exists, and
   "closest fit" is never recorded as the product), and what kind of surface:
   workspace view, form, flow step, dashboard, settings, empty state, onboarding.
   Page type selects controls via `applies_to`. For **other**, every
   `products:`-scoped control (e.g. IDN-4) is recorded in the decision record as
   **deliberately out of scope — product outside the portfolio**, a decision, not
   a silent drop. **Audience**: who does this surface serve —
   teachers (the default; assume it when unstated), students (ask which band:
   primary, or secondary and up), or parents? Record it in the sprint contract;
   it scopes `audiences:`-scoped controls for the rest of the loop. If the product
   repo has a `DESIGN.md`, load it now — it calibrates colour/tone/motion for
   everything downstream. **Any
   surface with an async or destructive
   action inherits the `[flow]` controls** (CMP-2, CMP-3) even when it is a single
   page — do not let the page/flow split scope them out.
4. **Done-criteria**: write a short sprint contract — the 3–6 statements the design reviewer
   will later grade against. State the **dimension(s) and ambition** chosen in "Clarify
   the ask" as explicit criteria (e.g. "the surface visibly carries Glow's warmth", not
   just "passes the standards") — otherwise the design reviewer has no way to catch a run that
   delivered compliance when the builder wanted a visual redesign. Include the
   `intent`-phase controls (CNT-2 naming applies here: name the feature in plain
   language now, before a placeholder name spreads).
5. **Component inventory**: list the surface as a coverage checklist — the route,
   every component it renders (by import name), and every **interactive control**
   on it (buttons, inputs, dropdowns/combobox, toggles, tabs, links, menus). For
   each interactive control, name the states to exercise later: open, keyboard-tab
   (focus visible?), screen-read (role + accessible name + state?). This is the
   list Phase 5 checks off and the design reviewer independently verifies — coverage is
   a provable checklist, not a vibe.

Output: the sprint contract, shown to the user.
