---
name: flow
description: Improve the flow of an existing Teacher & School multi-step task or interaction — step traversal, async states, escapability, and draft safety. Use for a scoped ask that names this dimension — "improve this flow", "this multi-step form loses my draft", "smooth the journey between steps on <page>", "there's no way out of this wizard" — with no structural rebuild named. NOT for a whole-page review with no dimension named (that is critique); NOT for a named structural change or a brand-new flow (that is design). Layout goes to layout, wording to copy.
---

# Improve the flow on an existing surface

A focused pass on the **flow** dimension: the journey across steps, not each screen in
isolation. You judge how the teacher moves through the task — entry, transitions, exits,
interruption, and resume — and leave visual and copy craft to their own passes (NOTED
and routed).

**Dimension controls** (the subset for this pass; procedure and loading rules:
../critique/pass.md):

- **CMP-2** — destructive actions show consequences and offer undo/confirm (L0).
- **CMP-3** — every async transaction has loading, success, and error states.
- **CMP-8** — a non-destructive exit exists at every step, and in-progress work is
  preserved or explicitly discarded on interruption — never silently lost. (CMP-2 keeps
  the destructive-action consequence/undo mechanics; CMP-8 covers the work itself and
  the ability to leave.)
- **A11Y-2** — keyboard traversal works across the whole journey, not just per screen.
- **A11Y-11** — each transition announces its change and manages focus.
- **SLP-10** — a complex multi-section task gets a page, not a modal.

**Reference:** the "A flow is not a stack of pages" section of `../design/SKILL.md` —
entry points, the done state, every exit (back/cancel/abandon), and what happens to the
teacher's work on interruption, partial completion, and resume. Escapability is
structure, not polish.

**Procedure:** follow `../critique/pass.md` with the subset above.
