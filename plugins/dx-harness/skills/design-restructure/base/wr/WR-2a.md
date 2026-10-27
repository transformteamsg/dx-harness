---
code: WR-2a
dss: WR-2
tier: L1
check: lint
surface: source
engine: custom
parameters:
  statusSelectors: null
  liveRoles:
    - status
    - alert
    - log
---

# WR-2a: a status message sits in a live region

## Statement

A message that appears without taking focus is in a live region.

## Check

Applies when `statusSelectors` is set. For each element that matches a selector in `statusSelectors`, fails when any of these holds:

- It has no `role` in `liveRoles` and no `aria-live` attribute.
- It is added to the page with no live region already in place, as when the element is inserted together with its role.

When `statusSelectors` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use `role="status"` for a polite message and `role="alert"` for an urgent one.
- Render the live region empty, then change its text.
- Set `aria-describedby` on an input to link its error message.

## Not required for

None listed.

## Rationale

A screen reader announces a change inside a live region without a move of focus. A message outside one is silent. No engine can find a status message by its purpose, so the product config names them. `WR-2c` judges the content and timing.
