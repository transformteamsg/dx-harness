# Existing surfaces: critique before you polish (procedure)

Whenever the surface **already exists** (a modification, a restyle, an
"improve / polish this", or a catalog re-audit), do not propose changes before
you have seen and judged the current state. Before Phase 1's contract:

1. **Capture the current page.** Take a screenshot of the live surface at 1280
   (and 360 if the change is responsive). Capture mechanism, in order of
   preference: (1) the `agent-browser` CLI if installed (`agent-browser --help`
   to confirm; not installed → offer setup once via `../setup/setup.md` before
   falling through) — navigate to the route, set the viewport to the target
   width, screenshot; (2) Claude-in-Chrome or the user's installed browser agent; (3)
   the local Playwright fallback; (4) ask the user to provide the screenshot.
   Never critique a page you cannot see, and never fabricate what it looks like.
2. **Layout read (do this before judging).** Read `layout-patterns.md` (beside
   this file). From the 1280 frame (and 360 when responsive behaviour is in
   scope), write down — in this order, before any judgment: (a) the page's
   regions and what each is for; (b) where the eye lands first, second, third
   (squint test) and whether that matches the task's priority; (c) the
   distinct left/top alignment edges; (d) a density map — which regions are
   dense, which calm, and whether that fits the task; (e) how grouping is
   encoded (space / divider / box). THEN judge: violations go to the
   critique's "what underperforms" list as before; everything else that would
   make the layout better becomes a **suggestion**.
3. **Write a short design critique of what is there** — against the in-scope
   catalog controls *and* Kind Utility: what works and should be preserved
   (call out established iconography, radius, layout, and copy that are
   deliberate — do not "fix" them, cf. the conservative-defaults rule in
   Phase 3/4) — **but verify, do not assume: every element you list as
   "preserve" stays in scope for its controls, so check it against the L0 floor
   (A11Y-1 contrast especially) before calling it good. Preserved is not waived:
   "preserve" means do not restyle a deliberate choice, it never means skip the
   check** — and what
   genuinely underperforms (control violations, hierarchy,
   friction in the teacher's task). Ground each point in the screenshot.
4. **Layout suggestions (ranked).** Up to 5, ordered by impact on the
   teacher's task. Each names: the concrete change ("merge the two summary
   cards into one calm header row"), the pattern or control it serves
   (layout-patterns.md #4, LAY-5), and the cost (S/M). Suggestions are OFFERS
   for the Phase 1 contract and Phase 3 plan — the user picks; unpicked
   suggestions are recorded in the decision record as "considered", not
   silently dropped. A suggestion never bypasses the plan gate.
5. The critique's "what underperforms" list **is** the scope of the polish; it
   feeds the Phase 1 contract and the Phase 3 plan. Improvement is the goal —
   the critique keeps it targeted instead of a blanket restyle.
