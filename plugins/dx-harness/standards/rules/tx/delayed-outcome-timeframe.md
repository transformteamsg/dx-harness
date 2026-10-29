---
code: TX-12a
slug: delayed-outcome-timeframe
dss: TX-12
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  outcomeImmediate: null
  startPages: null
  successPages: null
  timeframePattern: '\b\d+\s+(working\s+)?(minutes?|hours?|days?|weeks?)\b'
---

# TX-12a: a delayed outcome comes with an estimated timeframe

## Statement

When the outcome is not immediate, the user is told how long it takes.

## Check

Applies when `outcomeImmediate` is `false`. Fails when neither a page in `startPages` nor a page in `successPages` has text that matches `timeframePattern`.

When `outcomeImmediate` is `true`, the rule does not apply.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Give the timeframe before the transaction starts, on the success page, or in the acknowledgement.

## Not required for

None listed.

## Rationale

A user who knows the wait does not call to ask.
