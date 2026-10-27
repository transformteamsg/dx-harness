---
code: TX-3a
dss: TX-3
tier: L1
check: lint
surface: source
engine: custom
parameters:
  flowPages: null
  maxControlsPerStep: null
  stepSelector: null
---

# TX-3a: a step has no more than the set number of controls

## Statement

A long transaction is split into steps, and each step holds a limited number of fields.

## Check

For each page in `flowPages`, counts the visible input, select, and textarea controls on each step. A step is the form itself, or the element that matches `stepSelector` when the form holds several steps.

Fails a step when its count exceeds `maxControlsPerStep`.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Group related fields in a `<fieldset>` with a `<legend>`.
- Split a long form into logical steps or sections.

## Not required for

None listed.

## Rationale

A step with many fields raises the effort to finish it. `TX-3b` judges whether the grouping is logical.
