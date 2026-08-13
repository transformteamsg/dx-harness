---
name: dx-design-polish
description: 'Use when the ask names a visual dimension of an existing product page but not the exact edit — spacing, type, radius, colour, shadow, or type/weight hierarchy (SLP-6): "polish the spacing", "the headings don''t stand out". Propose-only: records up to five ranked findings on the surface''s design ticket; dx-design-execute builds accepted ones. A stated edit ("set the padding to 16px") is dx-design-execute''s. NOT for a bare "polish/tidy the page" with no dimension named — that is dx-design-critique. Page hierarchy (what draws the eye) is dx-design-pattern''s; polish touches type/weight hierarchy only.'
---

# Polish an existing surface

A focused pass on the **polish** dimension: the token, type, and colour craft that makes
a screen read as cared-for rather than templated. You judge the visual surface only —
structure, wording, motion, and flow are out of scope and get NOTED and routed.

**Dimension controls** (the subset for this pass; procedure and loading rules:
../dx-critique/pass.md):

- **Tokens** — TOK-1 (no raw colour), TOK-2 (spacing scale), TOK-3 (radius scale).
- **Type** — TYP-1 (Plus Jakarta Sans / Inter only), TYP-2 (min sizes + line-height),
  TYP-3 (on-scale sizes), TYP-4 (no all-caps), TYP-5 (tabular figures).
- **Colour** — COL-1 (product primary for primary actions), COL-2 (Radix functional scales).
- **Visual anti-slop** — SLP-1 (no purple/glow), SLP-2 (no gradient text), SLP-3 (no
  side-tab card borders), SLP-6 (type hierarchy ≥ 1.25x), SLP-7 (spacing rhythm).

**Reference:** the polish bullets of `../dx-design/implement-craft.md` — tabular figures,
concentric radius, layered shadows, type polish (`text-wrap`, font-smoothing), image
edges. It refines these controls; it never replaces them.

**Procedure:** follow `../dx-critique/pass.md` with the subset above, in either entry
mode (called directly, or dispatched by the orchestrator with the `return-to-caller`
token; pass.md defines both and what the token suppresses). Card/nested-card
composition (SLP-4/5/11) is a dx-design-pattern matter: note and route it, never a
polish finding. Catalogue mechanics (filtering, tiers, plain-title naming):
`../../../procedures/catalogue-mechanics.md`. The pass is propose-only: it records
findings on the surface's design ticket per `../../../procedures/design-tickets.md`
and hands accepted ones to dx-design-execute, which owns plan approval, implement,
design review, and verify (`../../../procedures/plan-approval.md`,
`../../../procedures/implement.md`, `../../../procedures/design-review.md`).
Uncovered gaps become rule proposals per `../../../procedures/rule-proposal.md`.
