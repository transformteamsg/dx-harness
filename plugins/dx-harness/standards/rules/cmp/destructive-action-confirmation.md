---
code: CMP-2a
slug: destructive-action-confirmation
control: CMP-2
tier: L1
check: lint
surface: rendered
engine: custom
judgedRemainder: CMP-2b
parameters:
  pages: null
  destructivePatterns: ["delete", "remove", "discard", "withdraw", "erase"]
  confirmSelector: "dialog[open], [role=dialog], [role=alertdialog]"
  undoPatterns: ["undo"]
---

# CMP-2a: a destructive control asks for confirmation or offers undo

## Statement

Before a destructive action runs, the user sees a confirmation, or the action runs and offers an undo.

## Check

Loads each page in `pages`. A destructive control is a visible button whose accessible name contains one of `destructivePatterns`, as a case-insensitive substring. The rule activates each destructive control on its own copy of the page. Fails the control when, after the activation, all of these hold:

- The page did not go to another address.
- No visible element matches `confirmSelector`, and the page did not call `window.confirm`.
- No visible button or link has an accessible name that contains one of `undoPatterns`.

The rule does not check a link, because a link goes to another page, and that page can hold the confirmation.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Prefer undo to confirmation when the action can be reversed.
- Keep the undo control visible long enough to use, and reachable by pointer and keyboard.

## Not required for

- An action that is easy to reverse, such as removing a filter. A confirmation for it trains users to accept without reading.

## Rationale

A user who loses work to one wrong click stops trusting the product. This rule decides that a confirmation or an undo exists. `CMP-2b` judges whether the copy names the object, states the consequence, and says whether the action can be reversed.
