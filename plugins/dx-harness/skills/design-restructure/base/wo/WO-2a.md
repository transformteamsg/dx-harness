---
code: WO-2a
dss: WO-2
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  tabLimit: 200
  pages: null
---

# WO-2a: keyboard focus leaves every component

## Statement

Pressing Tab moves focus out of every component on the page.

## Check

Applies when `pages` is set. For each page, the rule presses Tab up to `tabLimit` times from the start of the document. Fails when any of these holds:

- Focus stays on one element for three consecutive Tab presses.
- Focus cycles inside a subset of elements and never reaches the browser interface or the end of the page.

A modal dialog that traps focus passes when Escape closes it and returns focus. When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Test forms, widgets, and custom elements with the keyboard only.
- Use Tab and Shift+Tab to leave every component.
- If a component holds focus on purpose, tell users how to leave it.

## Not required for

None listed.

## Rationale

A keyboard user who enters a component and cannot leave it cannot use the rest of the page. `WO-2b` judges whether the exit is communicated.
