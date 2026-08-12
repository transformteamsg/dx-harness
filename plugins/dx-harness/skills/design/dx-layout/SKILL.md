---
name: dx-design-pattern
description: 'Use when the ask names page structure — visual hierarchy (what draws the eye — emphasis, size, position, grouping), density, alignment, grouping, or which named UI pattern fits (master-detail, wizard, empty state). Judges structure and pattern fit against the pattern inventory and may propose up to a whole-page same-content rebuild. Propose-only: records up to five ranked findings on the surface''s design ticket; dx-design-execute builds accepted ones — rebuilds stop at plan approval. A pattern swap ask ("these cards should be a list") is pattern''s even when stated as an edit; other stated structural edits ("move the sidebar") are dx-design-execute''s. Bare "hierarchy" is pattern''s; type/weight hierarchy is dx-design-polish''s; how steps behave is dx-design-flow. NOT for a whole-page review with no dimension named — that is dx-design-critique; wording goes to dx-design-copy.'
---

# Tighten the layout of an existing surface

A focused pass on the **layout** dimension: how the page is composed — regions,
hierarchy, density, alignment, and how grouping is encoded. You judge structure and
space only; token/type/colour craft is a `polish` matter and gets NOTED and routed.

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

**Reference:** `../dx-critique/layout-patterns.md` (the regions → squint-test → alignment →
density → grouping read). When the product ships one, `.dx/design.json` `layout_system`
declares its column grid — where declared, LAY-1 makes the grid checkable; treat it
as layout context otherwise.

**Procedure:** follow `../dx-critique/pass.md` with the subset above. Catalogue
mechanics (filtering, tiers, plain-title naming):
`../../../procedures/catalogue-mechanics.md`. The shared back half of the run is
`../../../procedures/plan-approval.md`, `../../../procedures/implement.md`, and
`../../../procedures/design-review.md`; findings are recorded per
`../../../procedures/design-tickets.md`, and uncovered gaps become rule proposals per
`../../../procedures/rule-proposal.md`.
