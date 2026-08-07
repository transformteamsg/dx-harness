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
   - `python3 checks/contrast.py --tokens <globals.css> --repo-root <product root>` — the
     foreground/background token pairs declared under `## Colour` in DESIGN.md, measured
     against AA (A11Y-1). With no pairs declared it grades A11Y-1 N/A and says so: that
     is a manual check, never a pass.
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
3. **Evaluator review** — spawn the `dx-evaluator` subagent (a genuinely separate
   agent — do not write the verdict yourself) with: the sprint contract, the approved
   plan, the screenshots, the component inventory from Phase 1, the judgment/hybrid
   controls in scope, **and the absolute path to the harness's `standards/` directory**
   (the evaluator cannot resolve it from the product cwd). **If you cannot spawn subagents** (you are yourself a
   subagent, or running unattended), stop at this step and report — the proven
   pattern is *orchestrator dispatch*: whoever orchestrates you spawns the evaluator
   and routes its verdict back to you. Never write the verdict yourself, and never
   present unverified work as verified while waiting.

   **If the `evaluator` agent type specifically is not spawnable** (unregistered
   this session) but subagents in general are available, spawn a `general-purpose`
   agent and paste this harness's `agents/dx-evaluator.md` procedure into its prompt
   verbatim. Note in the decision record that this workaround was used — it produces
   a usable verdict but is not the intended mechanism, and should not read as if it
   were.

   **If an evaluator pass is interrupted mid-run** (session or rate limit), resume it
   with a follow-up message to the *same* agent instance rather than restarting — it
   picks up from its own transcript. Note the interruption and resumption explicitly
   in the decision record; do not silently retry as if nothing happened.

   **Paste the full verdict verbatim into the decision record** — the record is the
   durable artifact; a summary in its place is a defect ("full text in the session
   log" does not survive the session). You never grade your own design work. Note
   the shared limit honestly: the evaluator runs the same model on the same
   standards, so it is a second read, not a fully independent one — treat split
   findings and any control you could not mechanically verify as candidates for
   human review.
4. **E2E suite and accessibility scan.** If the product repo has an existing E2E
   suite, run it in full — not just the tests for this change — and triage every
   failure before proceeding:

   | Failure cause | Action |
   |---|---|
   | Outdated test — design changed the copy/layout/element the test covered | Update the test, record the update in the decision record |
   | Real regression — design broke behaviour that should still work | Fix the implementation, not the test |
   | Flaky, unrelated to this change | Note explicitly; don't block on it, don't silently ignore it |

   Do not consider this phase complete with a failing suite. If the product repo has
   no E2E suite, record **N/A — product has no E2E suite** in the decision record
   (same honesty rule as the dark-mode check above) — never treat the absence as a
   pass.

   **Accessibility scan, same Playwright run.** If `@axe-core/playwright` is
   available, run `AxeBuilder` against each page/viewport/state already captured
   above and fold its findings into the verification ledger — this converts the
   `manual`/`unverified` rows for inherited-background contrast (A11Y-1), alt text
   (A11Y-6), heading structure (A11Y-7), title/lang (A11Y-9), and skip-link (A11Y-10)
   into `script`-verified rows. If axe-core is not installed, those stay on the
   manual pass, as today — never claim a `script` row without one having actually
   run.

5. Address findings, then decide how to re-verify — a full evaluator re-grade is not
   always the right weight for what changed:
   - **Direct recheck** (re-screenshot the specific finding, re-check its control by
     hand, no new evaluator spawn) is enough when the prior verdict was
     pass-with-findings (zero BLOCKING) and the fix is small and targeted — touches
     only the flagged element, not structure or plan fidelity.
   - **Full evaluator re-grade** (back to step 2 to recapture evidence for whatever
     changed, then step 3) is required when: any BLOCKING finding was addressed, the
     fix touched structure or plan fidelity, or several findings were fixed together
     (harder to isolate whether one fix regressed another). Never spawn the evaluator
     against evidence captured before the fix — stale screenshots being re-graded as
     if they showed the fix is exactly the "unverified work presented as verified"
     failure this phase exists to prevent.
   - Record which path was taken and why in the decision record — a judgment call,
     but not a silent one.
