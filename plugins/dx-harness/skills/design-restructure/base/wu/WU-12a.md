---
code: WU-12a
dss: WU-12
tier: L1
check: lint
surface: project
engine: custom
parameters:
  flows: null
  reviewStepRequired: true
---

# WU-12a: an important transaction has a review and confirm step

## Statement

A transaction that has legal, financial, or data-changing effect has a review step before final submission.

## Check

Applies when `flows` maps each flow name to the ordered paths of its pages. `WU-13a` reads the same parameter. Fails a flow that has no step after the last input step that displays the entered data and offers a confirm control, when `reviewStepRequired` is `true`.

The review step is a later step that has a summary element (`dl`, `table`, or `[data-review]`) and a submit button. An unset `flows` reports "not configured".

## Recommendations

- Validate data before submission.
- Use a summary page for long forms and for payments.

## Not required for

None listed.

## Rationale

Users need a chance to correct an error that is costly to undo. `WU-12b` judges whether users can reverse a submission.
