# Design review (shared procedure)

The design review is a fresh-context read of the built work. The `dx-design-review`
agent grades it; the builder never grades its own output. Self-evaluation skews
positive, which is why the role exists separately.

## Reviewer dispatch

- **Whoever started the run spawns the reviewer, one time per run.** Spawn the
  `dx-design-review` subagent (a genuinely separate agent; do not write the verdict
  yourself) with: the sprint contract, the approved plan, the screenshots, the
  component inventory, the judgment/hybrid controls in scope, the absolute path
  to the harness's `standards/` directory (the reviewer cannot resolve it from the
  product cwd), and **the quality-bar register the builder already resolved**. Pass
  the id you resolved at intent, and when a declared id resolved to nothing, say so
  and name the default you fell back to — the reviewer's header line has to be
  honest about which register it graded against. The reviewer never resolves this
  itself; that is what makes it impossible for the two of you to grade one surface
  against different bars, or for a mid-run edit to move the bar under the work.
  Resolution rules, for whoever resolves: `../docs/DESIGN-CONTEXT.md`, "Loading
  rules".
- **If you cannot spawn subagents** (you are yourself a subagent, or running
  unattended), stop and report. The proven pattern is orchestrator dispatch:
  whoever orchestrates you spawns the reviewer and routes its verdict back. Never
  write the verdict yourself, and never present unverified work as verified while
  waiting.
- **No dedicated designer on the team?** The portfolio designer holds this gate
  asynchronously, the same way they hold plan approval (see `plan-approval.md`,
  beside this file): route the verdict and its evidence to them and record on the
  design ticket that it was sent. Target turnaround is less than one day.
- **Paste the full verdict verbatim into the decision record** and the surface's
  design ticket run record (`design-tickets.md`, beside this file). The record is
  the durable artifact; a summary in its place is a defect. Note the shared limit
  honestly: the reviewer runs the same model on the same standards, so it is a
  second read, not a fully independent one; treat split findings and anything not
  mechanically verified as candidates for human review.

## Async evidence gate (mandatory when CMP-3 is in scope)

This is a harness rule (EVD-1, async evidence), not a catalog control. Before
dispatch, the screenshot
set must capture the loading state, the success state, and the error state, not
only the initial or empty state. A build can claim all three states exist in code
while only the empty state is ever screenshotted; code-level reachability is not
perceptibility. Acceptable substitutes for a frame: a video walkthrough that covers
all three states, or a named human reviewer's attestation that they witnessed the
live render of all three. An evidence set that misses this gate goes back to the
builder; do not dispatch the reviewer on it.

## Verdict re-check from new screenshots

After the builder addresses findings, the fixes go back to the **same reviewer**
with **new screenshots** of the changed surface:

- The reviewer marks each fix **resolved / partial / unresolved**, grading only from
  the new evidence.
- **The builder's narration is not evidence.** "I fixed it" without a new capture is
  an unverified claim; a fix with no new screenshot stays unresolved.
- The re-check verdicts go into the run record beside the original findings.

Repeat until the findings are resolved or explicitly accepted as open by the person
who approved the plan.
