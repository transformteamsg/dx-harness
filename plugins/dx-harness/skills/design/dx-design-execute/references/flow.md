# A flow is not a stack of pages

Read this file in Phase 1 when the surface is a flow or a page hosts a multi-step
interaction. The plan in Phase 3 uses it again for the flow map.

When the surface is
a flow — or a single page hosts a multi-step interaction — design the journey, not
just each screen:

- **Map it in Phase 1**: entry points (where does the teacher arrive from, and with
  what already known?), the done state, and every exit — back, cancel, abandon. A
  flow with only its happy path mapped is a demo, not a design.
- **Edge cases are structure, not polish.** Decide in Phase 3, not during build:
  interruption (timeout, network loss mid-flow), partial completion and resume, the
  teacher who left at step 2 and returns tomorrow, data that already exists
  elsewhere. For each, the plan says what happens to the teacher's work — "your
  draft is saved" must be a designed behaviour before it can be honest copy.
- **Interactions carry the flow.** Transitions preserve context — content and
  controls stay in predictable positions across steps (HIG: Flexibility); keyboard
  traversal works across the whole journey, not just within each screen (A11Y-2 at
  flow scope); focus lands somewhere sensible after every step change (A11Y-11
  applies at each transition, not only at async states).
- **Escapability is part of the structure** (HIG: Agency): the teacher can leave at
  any step without losing work, and the route out is visible, not discovered.
