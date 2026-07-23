# Phase 5 — Verify (procedure)

Run in this order; do not present output to the user while a step is failing:

1. **Deterministic controls** — all L0/L1 `deterministic` controls. Run the built
   `checks/` scripts first — `checks/README.md` is the authority for the full set,
   each script's flags, and the static subset each does *not* cover. The three that
   catch the most:
   - `python3 checks/token-audit.py <path>...` — TOK-1..3, COL-1..2.
   - `python3 checks/a11y-static.py <path>...` — static subset of A11Y-2/3/8.
   - `python3 checks/contrast.py --tokens <globals.css> <path>...` — static subset of A11Y-1.
   Each reads line-local code only: traversal order, computed hit-area, ARIA-state,
   inherited/computed backgrounds, and font-size classification all stay in the manual
   pass. Everything without a script: verify by hand against the control's detail file
   and label it "verified manually" (see "What actually runs today" above).
   For the manual accessibility pass, work through the catalog's A11Y controls in id
   order — they mirror the GovTech checklist's Essential tier
   (a11y.tech.gov.sg/checklist), which addresses ~96% of common web accessibility
   errors. L0 failure blocks everything; L1 failure sends you back to Phase 4.
2. **Render and screenshot.** Evidence sets, all that apply required:
   - **Width evidence**: the primary state at 360/768/1280.
   - **State evidence**: one frame per state asserted by each in-scope hybrid
     control — *including loading*, the state most often coded-but-unphotographed
     (it slipped through both pilot runs before this rule existed). Use the
     demo-only hooks built in Phase 4. **MANDATORY when CMP-3 is in scope** (harness
     rule, not a catalog control — see `docs/catalog-changes/evd-1-async-evidence.md`):
     the evidence set must capture the loading state, the success state, and the
     error state, not only the initial/empty state — a build can claim all three
     exist in code while only the empty state is ever screenshotted, and code-level
     reachability is not perceptibility. Acceptable substitutes for a frame: a video
     walkthrough covering all three states, or a named human reviewer's attestation
     that they witnessed the live render of all three.
   - **Journey evidence** (flows and multi-step interactions): traverse the happy
     path end-to-end, one frame per step, **plus one recovery path** from the Phase
     3 flow map actually walked — e.g. abandon at step 2 and return, or fail
     mid-flow and resume. Per-step screenshots that never demonstrate a traversal
     are page evidence, not flow evidence.
   Check each frame's *actual* rendered viewport before naming it — a screenshot
   named `768-*.png` taken at a stale viewport is mislabeled evidence.
   Capture mechanism, in order of preference: (1) the `agent-browser` CLI if
   installed (`agent-browser --help` to confirm; not installed → offer setup
   once via `../setup/setup.md` before falling through; it has intermittently
   returned "os error 35" — if it misbehaves, fall through) — navigate to the
   route, set the viewport to the target width, screenshot; (2) Claude-in-Chrome or the
   user's installed browser agent; (3) the local Playwright fallback; (4) ask
   the user to provide the screenshot. If capture still keeps failing after a
   reasonable retry, any source is fine; the evidence set is not optional, and
   unverified work is never presented as verified.
   - **Inventory checkoff**: walk the Phase-1 component inventory and tick each
     interactive control as operated — tab to it (focus visible per A11Y-2),
     activate by keyboard, confirm role + accessible name + state (A11Y-8/A11Y-3).
     Run `checks/a11y-static` (if built) as the static pre-pass, then operate what
     a static scan can't see. An un-operated control is uncovered, not clean.
   - **Dark mode: supported?** Before grading anything as dark-safe, establish
     whether the product actually supports dark mode: is there a visible theme
     toggle, and does a `.dark` (or `[data-theme="dark"]`) layer re-render the
     tokens? If **not**, record dark-mode checks as **N/A — product has no dark mode**
     in the decision record — this is a truthful outcome, never a pass.
     If **yes**, capture one dark frame using the capture convention above (an
     init-script that sets `.dark` / the theme attribute *before* load, or the
     app's own toggle); a token-resolution argument alone is not evidence that
     the mode renders.
3. **Evaluator review** — spawn the `evaluator` subagent (a genuinely separate
   agent — do not write the verdict yourself) with: the sprint contract, the approved
   plan, the screenshots, the component inventory from Phase 1, the judgment/hybrid
   controls in scope, **and the absolute path to the harness's `standards/` directory**
   (the evaluator cannot resolve it from the product cwd). **If you cannot spawn subagents** (you are yourself a
   subagent, or running unattended), stop at this step and report — the proven
   pattern is *orchestrator dispatch*: whoever orchestrates you spawns the evaluator
   and routes its verdict back to you. Never write the verdict yourself, and never
   present unverified work as verified while waiting.
   **Paste the full verdict verbatim into the decision record** — the record is the
   durable artifact; a summary in its place is a defect ("full text in the session
   log" does not survive the session). You never grade your own design work. Note
   the shared limit honestly: the evaluator runs the same model on the same
   standards, so it is a second read, not a fully independent one — treat split
   findings and any control you could not mechanically verify as candidates for
   human review.
4. Address findings; re-run from step 1 after changes.
