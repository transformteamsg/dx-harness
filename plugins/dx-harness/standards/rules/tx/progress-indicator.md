---
code: TX-4a
slug: progress-indicator
dss: TX-4
tier: L1
check: lint
surface: source
engine: custom
parameters:
  flowPages: null
  minStepsForIndicator: null
  progressSelector: '[aria-current="step"], [role="progressbar"]'
---

# TX-4a: a multi-step flow shows a progress indicator on each step

## Statement

Each step of a multi-step transaction shows where the user is in the process.

## Check

`flowPages` lists the pages of the flow, one for each step. Applies when it holds `minStepsForIndicator` or more pages. Fails a page in it when it has no element that matches `progressSelector`.

The indicator also needs a text equivalent. Fails when the matched element has no visible text and no accessible name.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Show the number of steps and the current step.
- Name each step.

## Not required for

None listed.

## Rationale

A user who cannot see the length of a flow cannot judge the effort left. `TX-4b` judges whether the indicator is clear.
