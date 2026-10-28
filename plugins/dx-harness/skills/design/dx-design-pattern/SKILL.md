---
name: dx-design-pattern
description: 'Use when the ask names page structure: visual hierarchy (what draws the eye), density, alignment, grouping, or which named UI pattern fits (master-detail, wizard, empty state), including a pattern swap ("these cards should be a list"). Judges structure against the pattern inventory and may propose a same-content rebuild. Propose-only: records up to five ranked findings for dx-design-execute to build. NOT for type/weight hierarchy, step behaviour, wording, or a whole-page review.'
---

# Judge the pattern and structure of an existing surface

A focused pass on the **pattern** dimension: how the page is composed (regions,
hierarchy, density, alignment, how grouping is encoded) and whether each region uses
the right named pattern. You judge structure and pattern fit only; token/type/colour
craft is a dx-design-polish matter, empty-state wording is a dx-design-copy matter,
and both get NOTED and routed.

**When the ask belongs to another skill:**

- A pattern swap, such as "these cards should be a list", stays here even when it is stated as an edit. Other stated structural edits, such as "move the sidebar", go to `dx-design-execute`.
- A bare "hierarchy" ask stays here. Type and weight hierarchy goes to `dx-design-polish`.
- How the steps of a task behave goes to `dx-design-flow`.
- Wording goes to `dx-design-copy`.
- A review of the whole page with no dimension named goes to `dx-design-critique`.

**Dimension controls** (the subset for this pass; procedure and loading rules:
../dx-design-critique/pass.md):

- **LAY-1** — the declared column grid and gutter scale (N/A where no grid is
  declared). **LAY-2** — reflow to one column at 320px, no loss. **LAY-3** — fits a
  known page template. **LAY-4** — body measure, judged under Measure. **LAY-5** —
  density suits the task. **LAY-6** — shared edges align (optical where geometry
  misleads). **LAY-7** — one primary focal region; reading order matches task
  priority (squint test).
- **Measure** covers **TYP-6** alongside LAY-4: running prose sits in 45–75
  characters per line, with a target of about 66, capped with a `max-width` in `ch`.
  Judge the two together against this one range, and hold headings, table cells, data
  grids, and short labels out of both. A cap under 45ch is display type, not prose.
- **Structural anti-slop** — SLP-4 (no nested cards; flatten with space/type/dividers),
  SLP-5 (no identical-card grids as default), SLP-11 (a card is only for an interactive
  unit; group static content with space and dividers).

**Named-pattern fit.** Beyond the structural controls, judge each region against the
pattern inventory: diagnose a wrong pattern and propose the swap (cards to list,
table to cards, list to master-detail, add an empty state), up to a whole-page rebuild to
a different pattern when the page shows the same information and functionality after
the change. A change that adds or removes information, features, or screens is never
a pattern finding; it is a dx-design-execute intent.

**Reference:** the pattern inventory at `../../../standards/layout-patterns.md`: the
regions, squint-test, alignment, density, and grouping read, plus the named patterns
(list vs cards, master-detail, wizard presentation, empty-state structure). When the
product ships one, `.dx/design.json` `layout_system` declares its column grid.

**Procedure:** follow `../dx-design-critique/pass.md` with the subset above, in either entry
mode (called directly, or dispatched by the orchestrator with the `return-to-caller`
token; pass.md defines both and what the token suppresses). Catalogue mechanics
(filtering, tiers, plain-title naming): `../../../procedures/catalogue-mechanics.md`.
The pass is propose-only: it records findings on the surface's design ticket per
`../../../procedures/design-tickets.md` and hands accepted ones to dx-design-execute,
which owns plan approval, implement, design review, and verify
(`../../../procedures/plan-approval.md`, `../../../procedures/implement.md`,
`../../../procedures/design-review.md`). Uncovered gaps become rule proposals per
`../../../procedures/rule-proposal.md`.
