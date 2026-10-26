# Capture once for a run (shared procedure)

This is the shared home for the evidence a run gives to the dimensions it judges.
The run that sends out the dimensions runs it: the orchestrator, `dx-design`, in
improve mode. A pass called directly judges one dimension in its own context, so it
captures for itself per `pass.md` and does not run this procedure.

The run captures the surface once and resolves the rules once. Each dimension then
judges from what the run gives it. No dimension takes its own capture, and no
dimension gets its own list.

## Step 1: Decide the widths

Take 1280 for every run. Add 360 when any dimension in the run judges responsive
behaviour: its accepted issues name a narrow screen or reflow, or its subset holds a
control about responsive layout.

Triage captures 1280 before the person accepts any issue, so the dimensions are not
known yet. When an accepted dimension then needs 360, add 360 to the one capture:
the same session and the same capture set. Take no second capture of a width the
set already holds.

## Step 2: Capture each width once

Capture each width once, with the mechanism order in step 2 of
`../skills/design/dx-design-critique/critique.md`. That step also runs the rendered
check while the session is still open. Do not restate its mechanism order here.

Record the capture set:

- The path of each frame, with its width
- Each width that did not capture, with the error
- The rendered check output, or the reason it did not run

## Step 3: Resolve the rules once

Get the in-scope list from `<harness>/scripts/in-scope-rules.py` once for each
dimension in the run, with `--dimension <pass> --phase verify`, per
`catalogue-mechanics.md`, beside this file. `<harness>` is the absolute path one
level above this file. Each list is that dimension's subset.

Report each `Selection:` line to the person. When the command exits with an error,
stop before any dimension judges, and show the error.

Each list already holds the L0 controls. They bind every pass whatever its
dimension, per the L0 tier in `catalogue-mechanics.md`. Each rule line holds the id, title,
tier, `verify` text, and the path to the `detail` file when the rule has one.

## Step 4: Hand each dimension its evidence

Give each dimension the capture set and its own subset, and nothing wider. The
dimension reads the review part of each rule in its subset that has a detail, with
`rule-detail.py <detail path> --for review`, and the reference files its pass
`SKILL.md` names. It reads no other rules.

How the dimensions run depends on how many there are:

- **One or two dimensions**: judge each one in the run's own context, with steps 3
  and 4 of `pass.md`. Start no subagent.
- **Three or more dimensions**: dispatch one propose-only subagent for each pass,
  with the pass input in `return-to-caller.md`, beside this file.

## Step 5: When a width does not capture

A width that does not capture after the mechanism order in Step 2 stays missing.
No dimension takes its own capture to fill the gap, and the run does not retry it
once for each dimension.

Every rule that needed that width takes a `verify` verdict: evidence incomplete,
never failed. Name the missing width in the merged plan, so the person sees which
judgments the run could not make.
