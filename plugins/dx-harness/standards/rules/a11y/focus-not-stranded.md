---
code: A11Y-11b
slug: focus-not-stranded
control: A11Y-11
tier: L1
check: lint
surface: rendered
engine: custom
judgedRemainder: A11Y-11c
parameters:
  actions: null
---

# A11Y-11b: focus is not lost after a state change

## Statement

After an action that hides, removes, or replaces the focused control, focus moves to an element that the user can see.

## Check

Applies when `actions` is set. Each action names a `page` and a `click` selector. The rule opens the page, focuses the element that matches `click`, and clicks it. Fails when, after the click, either of these holds:

- Focus is on `body`, or on no element.
- The focused element is not in the page, or the user cannot see it.

When `actions` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- When the action replaces the content, move focus to the new heading or to the first control. Give that element `tabindex="-1"` when it is not focusable.
- When the action closes a panel, move focus to the control that opened it, or to the next control.

## Not required for

None listed.

## Rationale

When the focused control disappears, the browser drops focus to the top of the page. A keyboard user loses their place, and a screen reader user hears nothing about the change. `A11Y-11c` judges whether the new focus target is the right one.
