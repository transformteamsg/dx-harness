---
code: WP-19b
slug: hover-content-hoverable
dss: WP-19
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  popupTriggerSelector: "[aria-describedby], [aria-haspopup], [data-tooltip]"
  minVisibleMs: 5000
---

# WP-19b: hover content stays while the pointer is over it

## Statement

Content that appears on hover stays visible while the pointer is on the trigger or on the content.

## Check

Shows the content, moves the pointer onto it, and fails when it hides. The pointer cannot be moved onto a `::before` or `::after` of the trigger, so that content is tested only for the time it stays. Fails when it hides before `minVisibleMs` while the pointer remains on the trigger.

## Recommendations

- Keep the content until the user dismisses it or moves away.

## Not required for

None listed.

## Rationale

A user must be able to read and use content that appears on hover.
