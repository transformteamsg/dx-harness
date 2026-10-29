---
code: TYP-5a
slug: tabular-figures-in-columns
control: TYP-5
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: TYP-5b
parameters:
  pages: null
  tableSelector: "table"
  minRows: 2
---

# TYP-5a: a table column of numbers uses tabular figures

## Statement

Numbers that align in a column use tabular figures (`font-variant-numeric: tabular-nums`).

## Check

Opens each page in `pages` at a viewport of 1280 by 800. Reads the body rows of each table that matches `tableSelector`. A column is a column of numbers when it has `minRows` or more data cells with text, and every one of them holds a number. A number has a digit and no letters. A currency prefix, such as `S$` or `€`, and a percent sign are allowed. Fails the column when any text in those cells has a computed `font-variant-numeric` without `tabular-nums`. The finding sits on the first cell of the column.

A row that has a cell spanning two or more columns is not read.

When a parameter is `null`, the rule reports "not configured" and does not pass.

## Recommendations

- Set `font-variant-numeric: tabular-nums` on the table, or use the utility class `tabular-nums`.

## Not required for

- A number in running prose.

## Rationale

In proportional figures, a `1` is narrower than a `0`, so the digits of a column do not align, and the user reads each row again to compare them. `TYP-5b` judges the figures that align or update outside a table, such as a live counter.
