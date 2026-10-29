---
code: A11Y-3a
slug: visible-field-label
control: A11Y-3
tier: L0
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
---

# A11Y-3a: every form field has a visible label

## Statement

Each form field that has an accessible name also shows a label on the page. A placeholder, an `aria-label`, or a visually hidden label is not a visible label.

## Check

Applies when `pages` is set. For each `input`, `select`, and `textarea` that a user can see and fill in, the rule finds its label: a `label` that names it by `for` or wraps it, or an element that its `aria-labelledby` names. Fails when the field has an accessible name and any of these holds:

- It has no label, and its name comes from `placeholder`, `aria-label`, or `title` only.
- Its label is visually hidden: clipped, off the screen, or smaller than 2 by 2 pixels.

A field with no accessible name fails `WR-1a`, so this rule does not report it again. A hidden input, a submit button, a reset button, and an image button have no label to show.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Put a `label` element before the field, and connect it with `for`.
- Keep the placeholder for an example value, not for the label.
- Use `aria-labelledby` to point at a visible heading when the heading names the field.

## Not required for

None listed.

## Rationale

A placeholder disappears when the user types, and an `aria-label` is never on the screen. A user who cannot see the label must guess what the field asks for, or remember it. axe `label` accepts a placeholder as a name, so a field labelled only by its placeholder passes `WR-1a`.
