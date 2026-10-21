# Capture once for a run (shared procedure)

This is the shared home for the evidence a run gives to the dimensions it judges.
The run that sends out the dimensions runs it: the orchestrator, `dx-design`, in
improve mode. A pass called directly judges one dimension in its own context, so it
captures for itself per `pass.md` and does not run this procedure.

The run captures the surface once and resolves the rules once. Each dimension then
judges from what the run gives it. No dimension takes its own capture, and no
dimension reads the catalogue.

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

Load `../standards/catalog.yaml` once for the run, and filter it by phase and scope
per `catalogue-mechanics.md`, beside this file. Then take each dimension's subset
from the control ids its pass `SKILL.md` names.

Add the four L0 controls to every subset: A11Y-1, A11Y-2, A11Y-3, and CMP-2. They
bind every pass whatever its dimension, per the L0 section of `pass.md`.

For each control in a subset, record its id, title, tier, and `verify` text, and
the path to its `detail` file when it has one.

## Step 4: Hand each dimension its evidence

Give each dimension the capture set and its own subset, and nothing wider. The
dimension reads the `detail` files in its subset and the reference files its pass
`SKILL.md` names. It reads no other rules.

How the dimensions run depends on how many there are:

- **One or two dimensions**: judge each one in the run's own context, with steps 3
  and 4 of `pass.md`. Start no subagent.
- **Three or more dimensions**: dispatch one propose-only subagent for each pass,
  with `mode:return-to-caller`, the accepted issues for that pass, the capture set,
  and that pass's subset.

## Step 5: When a width does not capture

A width that does not capture after the mechanism order in Step 2 stays missing.
No dimension takes its own capture to fill the gap, and the run does not retry it
once for each dimension.

Every rule that needed that width takes a `verify` verdict: evidence incomplete,
never failed. Name the missing width in the merged plan, so the person sees which
judgments the run could not make.
