---
code: WO-16a
slug: label-in-name
dss: WO-16
tier: L1
check: lint
surface: rendered
engine: axe label-content-name-mismatch
parameters:
  pages: null
---

# WO-16a: the accessible name contains the visible label

## Statement

The accessible name of a control contains its visible text label.

## Check

Fails a control whose accessible name does not contain its visible text. The axe rule `label-content-name-mismatch` is not experimental in axe-core 4.14, and the rule runs it by name.

## Recommendations

- Start the accessible name with the visible label.
- Add context after the visible label, not instead of it.

## Not required for

None listed.

## Rationale

Users of speech input say the visible label. A name that omits it does not respond.
