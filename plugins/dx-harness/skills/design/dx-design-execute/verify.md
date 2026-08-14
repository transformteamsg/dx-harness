# Phase 5 — Verify (procedure)

Run in this order; do not present output to the user while a step is failing:

1. **Deterministic controls** — all L0/L1 `deterministic` controls. Run the built
   `checks/` scripts first — `checks/README.md` is the authority for the full set,
   each script's flags, and the static subset each does *not* cover.
   **Locating them:** like the catalog, `checks/` ships with this harness, not with
   the product repo — resolve it relative to this verify.md file, three levels up:
   `<this-skill-dir>/../../../checks/` (the same path works in the harness dev repo
   and when installed as the `dx-harness` plugin; do not expect a `checks/`
   directory in the project cwd). The commands below are written repo-relative for
   brevity; prefix each with that resolved path. The four that catch the most:
   - `python3 checks/token-audit.py <path>...` — TOK-1..3, COL-1..2.
   - `python3 checks/a11y-eslint.py <path>...` — jsx-a11y's `recommended` preset over the
     product's JSX: static halves of A11Y-2, A11Y-3, A11Y-6, A11Y-8. Needs no setup in
     the product repo. When it prints `did not run`, the controls it names go to manual
     verification, never a pass.
   - `python3 checks/a11y-static.py <path>...` — the bespoke FOCUS rule (A11Y-2): an
     outline removed with no focus-visible replacement on the same line. No tool
     covers it, and focus styling in a stylesheet it cannot see flags as a false
     positive: confirm the rendered element with a keyboard before treating it as a bug.
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
     that they witnessed the live render of all three. One more outcome is valid,
     per state: `N/A — state does not exist: <reason>`, permitted **only** when
     CMP-3's own "Do not flag" clause applies (an instant, < ~100 ms local
     operation has no loading state to photograph) — a truthful outcome recorded
     as fact, never a pass, exactly like the dark-mode N/A below.
   - **Journey evidence** (flows and multi-step interactions): traverse the happy
     path end-to-end, one frame per step, **plus one recovery path** from the Phase
     3 flow map actually walked — e.g. abandon at step 2 and return, or fail
     mid-flow and resume. Per-step screenshots that never demonstrate a traversal
     are page evidence, not flow evidence.
   Check each frame's *actual* rendered viewport before naming it — a screenshot
   named `768-*.png` taken at a stale viewport is mislabeled evidence.
   Capture mechanism, in order of preference: (1) the `agent-browser` CLI if
   installed (`agent-browser --help` to confirm; not installed → offer setup
   once via `../dx-design-setup/setup.md` before falling through; it has intermittently
   returned "os error 35" — if it misbehaves, fall through) — navigate to the
   route, set the viewport to the target width, screenshot; (2) Claude-in-Chrome or the
   user's installed browser agent; (3) the local Playwright fallback; (4) ask
   the user to provide the screenshot. If capture still keeps failing after a
   reasonable retry, any source is fine; the evidence set is not optional, and
   unverified work is never presented as verified.
   - **Inventory checkoff**: walk the Phase-1 component inventory and tick each
     interactive control as operated — tab to it (focus visible per A11Y-2),
     activate by keyboard, confirm role + accessible name + state (A11Y-8/A11Y-3).
     Run `checks/a11y-eslint` and `checks/a11y-static` as the static pre-pass, then
     operate what a static scan can't see. An un-operated control is uncovered, not
     clean.
   - **Dark mode: supported?** Before grading anything as dark-safe, establish
     whether the product actually supports dark mode: is there a visible theme
     toggle, and does a `.dark` (or `[data-theme="dark"]`) layer re-render the
     tokens? If **not**, record dark-mode checks as **N/A — product has no dark mode**
     in the decision record — this is a truthful outcome, never a pass.
     If **yes**, capture one dark frame using the capture convention above (an
     init-script that sets `.dark` / the theme attribute *before* load, or the
     app's own toggle); a token-resolution argument alone is not evidence that
     the mode renders.
3. **Evaluator review** — run the reviewer dispatch in
   `../../../procedures/design-review.md`: it holds who spawns the `dx-design-review`
   subagent, the inputs to pass (contract, approved plan, screenshots, component
   inventory, in-scope judgment/hybrid controls, and the absolute `standards/` path),
   the cannot-spawn rule, the verbatim-verdict rule, and the verdict re-check from
   new screenshots. You never write the verdict yourself, and never present
   unverified work as verified while waiting.
4. Address findings; re-run from step 1 after changes.
