---
name: dx-design-motion
description: 'Use when the ask names the motion of an existing product page but not the exact edit — transitions, easing, timing, reduced-motion ("the motion feels janky", "transitions are too slow"). Propose-only: records up to five ranked findings on the surface''s design ticket; dx-design-execute builds accepted ones. A stated edit ("make the transition 150ms") or a brand-new interaction is dx-design-execute''s. NOT for a whole-page review with no dimension named — that is dx-design-critique. Visual styling goes to dx-design-polish.'
---

# Smooth the motion on an existing surface

A focused pass on the **motion** dimension: how the interface moves — entrances, state
and view changes, hover/press feedback. You judge motion only; styling, layout, copy,
and flow structure are out of scope and get NOTED and routed.

**Dimension controls** (the subset for this pass; procedure and loading rules:
../dx-critique/pass.md):

- **MOT-1** — 100–300ms, standard easing, no decorative motion on critical paths.
- **MOT-2** — motion values come from the declared motion token set; durations and
  easings are never hardcoded in component code.
- **MOT-3** — motion may emphasise meaning but never carry it alone; the surface
  communicates the same information with animations off.
- **A11Y-5** — a `prefers-reduced-motion` variant disables non-essential animation.
- **SLP-8** — no bounce or elastic easing on interface elements.

**Reference:** the motion bullets of `../dx-design/implement-craft.md` — property-scoped
interruptible transitions (`transition-property`, never `transition: all`), direction of
easing (entrances `ease-out`, exits `ease-in`, changes `ease-in-out`), press feedback
(`scale(0.96)`, never a bounce), and disciplined `will-change`. Keyboard navigation is
instant — no animation on tab/arrow movement.

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
