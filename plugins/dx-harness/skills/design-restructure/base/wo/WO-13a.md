---
code: WO-13a
dss: WO-13
tier: L1
check: lint
surface: source
engine: "custom, ported from a11y-static.py"
parameters:
  replacementProperties: [box-shadow, border, background-color, text-decoration]
---

# WO-13a: the focus indicator is not removed

## Statement

A style rule does not remove the focus indicator without a replacement.

## Check

Fails a style rule that sets `outline: none` or `outline: 0` on a focusable element or on `:focus`, unless the same rule or its `:focus-visible` rule sets a property in `replacementProperties`.

## Recommendations

- Do not disable the default focus indicator of the browser.
- If the default does not meet contrast needs, change the background colour or the border of the focused element.

## Not required for

None listed.

## Rationale

A keyboard user needs to see where focus is. `WO-13b` checks that nothing covers it.
