---
name: dx-design-polish
description: 'Use when the ask names a visual dimension of an existing product page but not the exact edit: spacing, type, radius, colour, shadow, or type/weight hierarchy ("polish the spacing", "the headings don''t stand out"). Propose-only: records up to five ranked findings on the surface''s design ticket for dx-design-execute to build. NOT for a stated edit ("set the padding to 16px"), a bare "polish the page" with no dimension, or page hierarchy.'
---

# Polish an existing surface

A focused pass on the **polish** dimension: the token, type, and colour craft that makes
a screen read as cared-for rather than templated. You judge the visual surface only —
structure, wording, motion, and flow are out of scope and get NOTED and routed.

**When the ask belongs to another skill:**

- A stated edit, such as "set the padding to 16px", goes to `dx-design-execute`.
- A bare "polish the page" or "tidy the page" with no dimension named goes to `dx-design-critique`.
- Page hierarchy, that is, what draws the eye, goes to `dx-design-pattern`. Polish covers type and weight hierarchy (TYP-7a, TYP-7b) only.

**Dimension controls** (the subset for this pass):

- **Tokens** — TOK-1 (no raw colour), TOK-2 (spacing scale), TOK-3 (radius scale).
- **Type** — TYP-1 (Plus Jakarta Sans / Inter only), TYP-2a and TYP-2b (min sizes +
  line-height), TYP-3 (on-scale sizes), TYP-4a and TYP-4b (no all-caps), TYP-5a and
  TYP-5b (tabular figures).
- **Colour** — COL-1 (product primary for primary actions), COL-2 (Radix functional scales).
- **Visual anti-slop** — COL-3a and COL-3b (no purple/glow), COL-4a (no gradient text),
  CMP-12a (no side-tab card borders), TYP-7a (type hierarchy ≥ 1.10x) and TYP-7b,
  LAY-9a (spacing rhythm).

**Reference:** the polish bullets of `../dx-design-execute/implement-craft.md` — tabular figures,
concentric radius, layered shadows, type polish (`text-wrap`, font-smoothing), image
edges. It refines these controls; it never replaces them.

**Procedure:** follow `../dx-design-critique/pass.md` with the subset above. Card/nested-card
composition (CMP-13a, LAY-8a, CMP-15a) is a dx-design-pattern matter: note and route it, never a
polish finding.
