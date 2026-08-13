---
name: dx-design-flow
description: 'Use when the ask names the flow of an existing multi-step task but not the exact edit — step traversal, async states, escapability, draft safety ("this wizard loses my draft", "there''s no way out"). Propose-only: records up to five ranked findings on the surface''s design ticket; dx-design-execute builds accepted ones. A stated edit ("add a back button to step 2") or a brand-new flow is dx-design-execute''s. How steps behave is flow; how a page is structured is dx-design-pattern. NOT for a whole-page review with no dimension named — that is dx-design-critique.'
---

# Improve the flow on an existing surface

A focused pass on the **flow** dimension: the journey across steps, not each screen in
isolation. You judge how the teacher moves through the task — entry, transitions, exits,
interruption, and resume — and leave visual and copy craft to their own passes (NOTED
and routed).

**Dimension controls** (the subset for this pass; procedure and loading rules:
../dx-critique/pass.md):

- **CMP-2** — destructive actions show consequences and offer undo/confirm (L0).
- **CMP-3** — every async transaction has loading, success, and error states.
- **CMP-8** — a non-destructive exit exists at every step, and in-progress work is
  preserved or explicitly discarded on interruption — never silently lost. (CMP-2 keeps
  the destructive-action consequence/undo mechanics; CMP-8 covers the work itself and
  the ability to leave.)
- **A11Y-2** — keyboard traversal works across the whole journey, not just per screen.
- **A11Y-11** — each transition announces its change and manages focus.
- **SLP-10** — a complex multi-section task gets a page, not a modal.

**Reference:** the "A flow is not a stack of pages" section of `../dx-design/SKILL.md` —
entry points, the done state, every exit (back/cancel/abandon), and what happens to the
teacher's work on interruption, partial completion, and resume. Escapability is
structure, not polish.

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
