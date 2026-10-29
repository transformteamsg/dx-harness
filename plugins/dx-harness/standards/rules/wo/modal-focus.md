---
code: WO-9c
slug: modal-focus
dss: WO-9
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  modalSelector: "dialog[open], [role=dialog], [aria-modal=true]"
  pages: null
---

# WO-9c: focus moves into a modal and returns when it closes

## Statement

Opening a modal moves focus inside it. Closing it returns focus to the element that opened it.

## Check

Applies when `pages` is set. For each trigger of an element that matches `modalSelector`, the rule activates the trigger with the keyboard. Fails when any of these holds:

- Focus is not inside the modal after it opens.
- Tab moves focus to an element outside the modal while it is open.
- After Escape or the close control, focus is not on the trigger.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Set focus inside the modal when it opens, and keep it there until it closes.
- Return focus to the trigger when the modal closes.

## Not required for

None listed.

## Rationale

A keyboard user who loses their place in the page must start again from the top.
