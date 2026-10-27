---
code: WO-13b
dss: WO-13
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  viewports: [320, 1280]
  maxObscuredRatio: 0
  pages: null
---

# WO-13b: focused elements are not covered

## Statement

A sticky or fixed element does not cover the element that has focus.

## Check

Applies when `pages` is set. At each width in `viewports`, the rule moves focus through the page with Tab. After each move, it compares the bounds of the focused element with those of each `position: fixed` or `position: sticky` element. Fails when the covered share of the focused element is above `maxObscuredRatio`.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Do not let floating widgets and sticky headers cover the focused element.
- Use `scroll-padding` to keep focused elements in view.

## Not required for

None listed.

## Rationale

A focused element that is hidden gives the user no sign of where they are.
