---
code: CMP-6a
slug: numeric-column-alignment
dss: CMP-6
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: CMP-6c
parameters:
  pages: null
  numericPattern: '^[-+−]?\s*(?:S\$|\$|€|£)?\s*[\d][\d,.\s]*%?$'
  identifierColumnSelector: "[data-identifier]"
---

# CMP-6a: numeric table columns are right-aligned with tabular figures

## Statement

A table column of numbers is right-aligned, and its numbers use tabular figures, so the digits line up.

## Check

Loads each page in `pages`. In each `table`, a column is numeric when every cell of it in the body that has text matches `numericPattern`, and it has at least one such cell. Fails the table when a cell of a numeric column has a computed `text-align` other than `right` or `end`, or has no tabular figures. A cell has tabular figures when its computed `font-variant-numeric` includes `tabular-nums`, or its `font-feature-settings` turns on `tnum`.

Skips a column whose header cell matches `identifierColumnSelector`.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Left-align text columns, and align each header with its column.
- Mark a column of codes or phone numbers as an identifier column, because a reader does not compare its values as quantities.

## Not required for

- A column of numbers that are identifiers, such as a class code or a phone number.

## Rationale

A reader compares a column of numbers at a glance only when the digits line up. `CMP-6c` judges the identifier columns, the density, the empty and loading states, and whether a table is the right pattern.
