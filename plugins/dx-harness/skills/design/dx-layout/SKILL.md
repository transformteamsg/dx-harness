---
name: dx-design-pattern
description: 'Use when the ask names page structure — visual hierarchy (what draws the eye — emphasis, size, position, grouping), density, alignment, grouping, or which named UI pattern fits (master-detail, wizard, empty state). Judges structure and pattern fit against the pattern inventory and may propose up to a whole-page same-content rebuild. Propose-only: records up to five ranked findings on the surface''s design ticket; dx-design-execute builds accepted ones — rebuilds stop at plan approval. A pattern swap ask ("these cards should be a list") is pattern''s even when stated as an edit; other stated structural edits ("move the sidebar") are dx-design-execute''s. Bare "hierarchy" is pattern''s; type/weight hierarchy is dx-design-polish''s; how steps behave is dx-design-flow. NOT for a whole-page review with no dimension named — that is dx-design-critique; wording goes to dx-design-copy.'
---

# Judge the pattern and structure of an existing surface

A focused pass on the **pattern** dimension: how the page is composed (regions,
hierarchy, density, alignment, how grouping is encoded) and whether each region uses
the right named pattern. You judge structure and pattern fit only; token/type/colour
craft is a dx-design-polish matter, empty-state wording is a dx-design-copy matter,
and both get NOTED and routed.

**Dimension controls** (the subset for this pass; procedure and loading rules:
../dx-critique/pass.md):

<!-- dx-sync:lay-controls -->
- **LAY-1** — the declared column grid and gutter scale (N/A where no grid is
  declared). **LAY-2** — reflow to one column at 320px, no loss. **LAY-3** — fits a
  known page template. **LAY-4** — body measure ≤ 80ch (~66ch target). **LAY-5** —
  density suits the task. **LAY-6** — shared edges align (optical where geometry
  misleads). **LAY-7** — one primary focal region; reading order matches task
  priority (squint test).
<!-- /dx-sync:lay-controls -->
- **Structural anti-slop** — SLP-4 (no nested cards; flatten with space/type/dividers),
  SLP-5 (no identical-card grids as default), SLP-11 (a card is only for an interactive
  unit; group static content with space and dividers).

**Named-pattern fit.** Beyond the structural controls, judge each region against the
pattern inventory: diagnose a wrong pattern and propose the swap (cards to list,
table to cards, tabs to accordion, add an empty state), up to a whole-page rebuild to
a different pattern when the page shows the same information and functionality after
the change. A whole-page rebuild always stops at plan approval before
dx-design-execute builds it; a smaller accepted finding counts as approved and
proceeds without a second stop. A change that adds or removes information, features,
or screens is never a pattern finding; it is a dx-design-execute intent. A pattern
swap ask stays with this pass even when stated as an edit ("these cards should be a
list"); other stated structural edits go to dx-design-execute.

**Reference:** the pattern inventory at `../../../standards/layout-patterns.md`: the
regions, squint-test, alignment, density, and grouping read, plus the named patterns
(list vs cards, master-detail, wizard presentation, empty-state structure). The
inventory is guidance, not controls; a control always wins on conflict. When the
product ships one, `.dx/design.json` `layout_system` declares its column grid; where
declared, LAY-1 makes the grid checkable; treat it as layout context otherwise.

**Procedure:** follow `../dx-critique/pass.md` with the subset above, in either entry
mode (called directly, or dispatched by the orchestrator with the `return-to-caller`
token; pass.md defines both and what the token suppresses). Catalogue mechanics
(filtering, tiers, plain-title naming): `../../../procedures/catalogue-mechanics.md`.
The pass is propose-only: it records findings on the surface's design ticket per
`../../../procedures/design-tickets.md` and hands accepted ones to dx-design-execute,
which owns plan approval, implement, design review, and verify
(`../../../procedures/plan-approval.md`, `../../../procedures/implement.md`,
`../../../procedures/design-review.md`). Uncovered gaps become rule proposals per
`../../../procedures/rule-proposal.md`.
