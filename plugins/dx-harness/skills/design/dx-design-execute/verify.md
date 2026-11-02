# Phase 5: Design review

Run these steps in order, under "Gates" in `SKILL.md`:

1. **Deterministic controls and lint rules.**
   - **Lint rules**: run `design-lint` per `../../../procedures/design-lint.md`. It
     decides every lint rule on the in-scope list. When the procedure stops, the
     page is not verified: report what is missing and go no further in this phase.
   - **Catalogue controls**: the controls that no base rule replaces keep their
     `checks/` scripts. `checks/` ships with this harness, three levels above this
     file, at `<this-skill-dir>/../../../checks/`. Run the ones whose controls are
     on the list:
     - `python3 checks/token-audit.py <path>...`: TOK-1..3, COL-1..2.
     - `python3 checks/type-scan.py <path>...`: TYP-1 and TYP-3.
     - `python3 checks/component-manifest.py .dx/component-manifest.json <repo-root>`:
       CMP-1, when the product has a manifest.

     `checks/COVERAGE.md` names what each script does not cover.
   - **Everything else on the list**: verify by hand against the rule's review
     part, from `rule-detail.py <detail path> --for review`, and label it "verified
     manually" (see "Gates" in `SKILL.md`). A judged rule goes to the reviewer in
     step 4.

   L0 failure blocks everything; L1 failure sends you back to Phase 4.
2. **Render and screenshot.** Evidence sets, all that apply required:
   - **Width evidence**: the primary state at 360/768/1280.
   - **State evidence**: one frame per state asserted by each in-scope hybrid
     control — *including loading*. Use the
     demo-only hooks built in Phase 4. **MANDATORY when CMP-3 is in scope** (harness
     rule, not a catalog control): `../../../procedures/design-review.md` holds
     EVD-1, the async evidence gate. Meet it.
   - **Journey evidence** (flows and multi-step interactions): traverse the happy
     path end-to-end, one frame per step, **plus one recovery path** from the Phase
     3 flow map actually walked — e.g. abandon at step 2 and return, or fail
     mid-flow and resume. Per-step screenshots that never demonstrate a traversal
     are page evidence, not flow evidence.
   Check each frame's *actual* rendered viewport before naming it — a screenshot
   named `768-*.png` taken at a stale viewport is mislabeled evidence.
   Capture with the mechanism order in step 2 of `../dx-design-critique/critique.md`.
   Then scale every frame per Step 3 of `../../../procedures/capture.md`, and give
   the reviewer the scaled copies.
   The evidence set is not optional, and unverified work is never presented as
   verified.
   - **Inventory checkoff**: walk the Phase-1 component inventory and tick each
     interactive control as operated — tab to it (focus visible per A11Y-2),
     activate by keyboard, confirm role + accessible name + state (A11Y-8/A11Y-3).
     The `design-lint` run in step 1 is the static pre-pass. Operate what a static
     scan can't see. An un-operated control is uncovered, not clean.
   - **Dark mode: supported?** Before grading anything as dark-safe, establish
     whether the product actually supports dark mode: is there a visible theme
     toggle, and does a `.dark` (or `[data-theme="dark"]`) layer re-render the
     tokens? If **not**, record dark-mode checks as **N/A — product has no dark mode**
     in the decision record — this is a truthful outcome, never a pass.
     If **yes**, capture one dark frame using the capture convention above (an
     init-script that sets `.dark` / the theme attribute *before* load, or the
     app's own toggle); a token-resolution argument alone is not evidence that
     the mode renders.
3. **Rendered check** — while the capture session from step 2 is still open, run
   `python3 checks/rendered-check.py --session <the session you captured with>`
   (add `--url <url>` when the session is on another page). It attaches to that
   open session over CDP, runs axe at 360 and 1280 in each supported theme plus
   one reduced-motion cell, and hands the session back as it found it. It boots
   nothing: if the app is not already serving, there is no rendered check.
   - A finding reads `ERROR <route>:<cell> [<CTL>] …`, where the cell names the
     viewport and theme that produced it.
   - `NOTE` lines carry the third bucket: what axe could not decide, what it
     found on markup nobody can currently reach, and A11Y-10, which is
     report-only. Each is an item for the manual accessibility pass in step 1,
     not a gate.
   - When it prints `did not run` — no session, or the driver is not
     provisioned — the controls it names go to manual verification, never a
     pass, and A11Y-1 and A11Y-3 still block until verified by some path.
   - It covers no part of A11Y-2 (no axe rule checks a visible focus indicator)
     and no part of A11Y-11 (that needs interaction, and this check interacts
     with nothing). Both stay with the inventory checkoff above.
4. **Reviewer dispatch** — run the reviewer dispatch in
   `../../../procedures/design-review.md`.
5. **E2E suite.** If the product repo has an existing E2E suite, run it in full —
   not just the tests for this change — and triage every failure before proceeding:

   | Failure cause | Action |
   |---|---|
   | Outdated test — design changed the copy/layout/element the test covered | Update the test, record the update in the decision record |
   | Real regression — design broke behaviour that should still work | Fix the implementation, not the test |
   | Flaky, unrelated to this change | Note explicitly; don't block on it, don't silently ignore it |

   Do not consider this phase complete with a failing suite. If the product repo has
   no E2E suite, record **N/A — product has no E2E suite** in the decision record
   (same honesty rule as the dark-mode check above) — never treat the absence as a
   pass. The accessibility scan runs in step 3, not here — do not also reach for an
   ad hoc `@axe-core/playwright` run in this suite.
6. Address findings, then decide how to re-verify:
   - **Direct recheck** (re-screenshot the specific finding, re-check its control by
     hand, no new reviewer spawn) is enough when the prior verdict was
     pass-with-findings (zero BLOCKING) and the fix is small and targeted — touches
     only the flagged element, not structure or plan fidelity.
   - **Full reviewer re-grade** (back to step 2 to recapture evidence for whatever
     changed, then step 4) is required when: any BLOCKING finding was addressed, the
     fix touched structure or plan fidelity, or several findings were fixed together
     (harder to isolate whether one fix regressed another). Never spawn the reviewer
     against evidence captured before the fix.
   - Record which path was taken and why in the decision record — a judgment call,
     but not a silent one.
