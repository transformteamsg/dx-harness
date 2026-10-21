# Capture once for a run (shared procedure)

This is the shared home for the evidence a run gives to the dimensions it judges.
The run that sends out the dimensions runs it: the orchestrator, `dx-design`, in
improve mode. A pass called directly judges one dimension in its own context, so it
captures for itself per `pass.md` and does not run this procedure.

The run captures the surface once. Each dimension then judges from the capture
set the run gives it.

## Step 1: Decide the widths

Take 1280 for every run. Add 360 when any dimension in the run judges responsive
behaviour: its accepted issues name a narrow screen or reflow, or its subset holds a
control about responsive layout.

## Step 2: Capture each width once

Capture each width once, with the mechanism order in step 2 of
`../skills/design/dx-design-critique/critique.md`. That step also runs the rendered
check while the session is still open. Do not restate its mechanism order here.

Record the capture set:

- The path of each frame, with its width
- Each width that did not capture, with the error
- The rendered check output, or the reason it did not run

## Step 3: Hand each dimension its evidence

Give each dimension the capture set.

Dispatch one propose-only subagent for each pass, with `mode:return-to-caller`,
the accepted issues for that pass and the capture set.
