---
code: TX-15a
slug: tracking-page
dss: TX-15
tier: L1
check: lint
surface: project
engine: custom
parameters:
  outcomeImmediate: null
  trackingPage: null
  statusSelector: null
  statusDescriptionSelector: null
---

# TX-15a: a product with a delayed outcome has a tracking page with status labels

## Statement

Users can track the status of a transaction online.

## Check

Applies when `outcomeImmediate` is `false`. Fails when `trackingPage` is unset or the page does not exist.

Fails the page when no element matches `statusSelector`, or no element matches `statusDescriptionSelector`.

When `outcomeImmediate` is `true`, the rule does not apply.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Use clear status labels and descriptions.
- Show the estimated completion timeline.
- Show any action that the user must take.

## Not required for

None listed.

## Rationale

A user who cannot see the status contacts the agency. `TX-15b` judges the timeline and the required actions.
