---
code: WO-1b
dss: WO-1
tier: L1
check: lint
surface: source
engine: jsx-a11y interactive-supports-focus
parameters: {}
---

# WO-1b: interactive elements are focusable

## Statement

Each element with an interactive role or handler can receive keyboard focus.

## Check

Fails an element when it has an interactive `role` or a pointer handler and is not focusable. An element is focusable when it is a native control or has `tabIndex` of 0 or more.

## Recommendations

- Add `tabIndex={0}` to a custom control, and prefer a native element.
- Do not use a positive `tabIndex`. `WO-9a` checks this.

## Not required for

None listed.

## Rationale

A control that cannot take focus cannot be reached with a keyboard.
