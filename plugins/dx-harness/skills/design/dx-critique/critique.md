# Existing surfaces: critique, propose only (procedure)

Whenever the surface **already exists** (a whole-page review, an
"improve / polish this", an "I don't like it", or a catalogue re-audit), do not
propose changes before you have seen and judged the current state:

1. **Capture the current page.** Take a screenshot of the live surface at 1280
   (and 360 if the change is responsive). Capture mechanism, in order of
   preference: (1) the `agent-browser` CLI if installed (`agent-browser --help`
   to confirm; not installed → offer setup once via `../dx-setup/setup.md` before
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
   deliberate; do not "fix" them) **but verify, do not assume: every element you list as
   "preserve" stays in scope for its controls, so check it against the L0 floor
   (A11Y-1 contrast especially) before calling it good. Preserved is not waived:
   "preserve" means do not restyle a deliberate choice, it never means skip the
   check** — and what
   genuinely underperforms (control violations, hierarchy,
   friction in the teacher's task). Ground each point in the screenshot.
4. **Layout suggestions (ranked).** Up to 5, ordered by impact on the
   teacher's task. Each names: the concrete change ("merge the two summary
   cards into one calm header row"), the pattern or control it serves
   (layout-patterns.md #4, LAY-5), and the cost (S/M). Suggestions are OFFERS:
   the human approves them by S-number on the surface's design ticket, and
   `dx-design-execute` builds accepted ones in a later run. Unpicked
   suggestions are recorded as "considered", not silently dropped. A suggestion
   never bypasses `dx-design-execute`'s plan gate.
5. The critique's findings and suggestions feed the report step (`report.md`,
   beside this file) and the Findings comment on the surface's design ticket.
   Critique proposes only; it never edits the product. Improvement is the goal,
   and the critique keeps it targeted instead of a blanket restyle.
