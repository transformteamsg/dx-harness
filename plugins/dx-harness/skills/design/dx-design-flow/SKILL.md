---
name: dx-design-flow
description: 'Use when the ask names the flow of an existing multi-step task but not the exact edit: step traversal, async states, escapability, or draft safety ("this wizard loses my draft", "there''s no way out"). Propose-only: records up to five ranked findings on the surface''s design ticket for dx-design-execute to build. NOT for a stated edit, a brand-new flow, page structure, or a whole-page review.'
---

# Improve the flow on an existing surface

A focused pass on the **flow** dimension: the journey across steps, not each screen in
isolation. You judge how the teacher moves through the task — entry, transitions, exits,
interruption, and resume — and leave visual and copy craft to their own passes (NOTED
and routed).

**When the ask belongs to another skill:**

- A stated edit, such as "add a back button to step 2", or a brand-new flow goes to `dx-design-execute`.
- How a page is structured goes to `dx-design-pattern`. How the steps behave stays here.
- A review of the whole page with no dimension named goes to `dx-design-critique`.

**Dimension controls** (the subset for this pass):

- **CMP-2a, CMP-2b** — destructive actions show consequences and offer undo/confirm.
- **CMP-3a** — every async transaction has loading, success, and error states.
- **CMP-8a, CMP-8b** — a non-destructive exit exists at every step, and in-progress work
  is preserved or explicitly discarded on interruption — never silently lost. (CMP-2a
  and CMP-2b keep the destructive-action consequence/undo mechanics; CMP-8a and CMP-8b
  cover the work itself and the ability to leave.)
- **WO-1a, WO-1b, WO-1c, WO-13a, WO-13b** — keyboard traversal works across the whole
  journey, not just per screen, with a visible focus indicator.
- **WR-2a, WR-2b, WR-2c, WO-9c, A11Y-11a, A11Y-11b, A11Y-11c** — each transition
  announces its change and manages focus.
- **CMP-14a** — a complex multi-section task gets a page, not a modal.

**Reference:** `../dx-design-execute/references/flow.md` —
entry points, the done state, every exit (back/cancel/abandon), and what happens to the
teacher's work on interruption, partial completion, and resume. Escapability is
structure, not polish.

**Procedure:** follow `../dx-design-critique/pass.md` with the subset above.
