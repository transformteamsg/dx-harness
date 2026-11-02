---
name: dx-design-motion
description: 'Use when the ask names the motion of an existing product page but not the exact edit: transitions, easing, timing, or reduced motion ("the motion feels janky", "transitions are too slow"). Propose-only: records up to five ranked findings on the surface''s design ticket for dx-design-execute to build. NOT for a stated edit, a brand-new interaction, visual styling, or a whole-page review.'
---

# Smooth the motion on an existing surface

A focused pass on the **motion** dimension: how the interface moves — entrances, state
and view changes, hover/press feedback. You judge motion only; styling, layout, copy,
and flow structure are out of scope and get NOTED and routed.

**When the ask belongs to another skill:**

- A stated edit, such as "make the transition 150ms", or a brand-new interaction goes to `dx-design-execute`.
- Visual styling goes to `dx-design-polish`.
- A review of the whole page with no dimension named goes to `dx-design-critique`.

**Dimension controls** (the subset for this pass):

- **MOT-1a, MOT-1b** — 100–300ms, standard easing, no decorative motion on critical paths.
- **MOT-2a, MOT-2b** — motion values come from the declared motion token set; durations and
  easings are never hardcoded in component code.
- **MOT-3a** — motion may emphasise meaning but never carry it alone; the surface
  communicates the same information with animations off.
- **A11Y-5a, A11Y-5b** — a `prefers-reduced-motion` variant disables non-essential animation.
- **MOT-4a** — no bounce or elastic easing on interface elements.

**Reference:** the motion bullets of `../dx-design-execute/implement-craft.md` — property-scoped
interruptible transitions (`transition-property`, never `transition: all`), direction of
easing (entrances `ease-out`, exits `ease-in`, changes `ease-in-out`), press feedback
(`scale(0.96)`, never a bounce), and disciplined `will-change`. Keyboard navigation is
instant — no animation on tab/arrow movement.

**Procedure:** follow `../dx-design-critique/pass.md` with the subset above.
