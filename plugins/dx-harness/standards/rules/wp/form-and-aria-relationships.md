---
code: WP-6c
slug: form-and-aria-relationships
dss: WP-6
tier: L1
check: lint
surface: rendered
engine: axe `form-field-multiple-labels`, plus custom
parameters:
  pages: null
---

# WP-6c: form controls and ARIA parents are related in the markup

## Statement

Form controls are associated with their labels, and ARIA roles sit inside the parents that they require.

## Check

Fails an element that axe `form-field-multiple-labels` reports. Fails a `<fieldset>` with no `<legend>` that has text. Fails a `<label for>` that points at no form control. `WR-1a` already reports `label`, and `WR-1b` reports `aria-required-parent` and `aria-required-children`, so this rule does not repeat them.

## Recommendations

- Associate each label with its control through `for` and `id`, or by wrapping.
- Group related controls in a `<fieldset>` with a `<legend>`.

## Not required for

None listed.

## Rationale

The label of a control is a relationship that assistive technology must determine from the markup.
