---
code: A11Y-11a
slug: focus-target-not-live-region
control: A11Y-11
tier: L1
check: lint
surface: source
engine: custom
judgedRemainder: A11Y-11c
parameters:
  liveRoles:
    - alert
    - status
    - log
---

# A11Y-11a: a focus target is not also a live region

## Statement

An element that a script moves focus to does not also announce itself as a live region. One message uses one channel.

## Check

For each HTML element with `tabindex="-1"`, fails when any of these holds:

- It has a `role` in `liveRoles`.
- It has an `aria-live` attribute with a value other than `off`.

## Recommendations

- For a message that replaces the context, move focus to it and give it no live role.
- For a transient status, use a live region and leave focus where it is.

## Not required for

None listed.

## Rationale

When a script moves focus to an element, a screen reader reads the element. If the element is also a live region, the screen reader reads the same message twice. `A11Y-11c` judges which channel each change needs.
