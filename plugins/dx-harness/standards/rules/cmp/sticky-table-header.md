---
code: CMP-6b
slug: sticky-table-header
dss: CMP-6
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: CMP-6c
parameters:
  pages: null
---

# CMP-6b: a long table keeps its header row visible while it scrolls

## Statement

A table that is taller than the screen keeps its column headers visible while the user scrolls through it.

## Check

Loads each page in `pages` at 1280 by 800 pixels. Applies to each `table` with a header row that is taller than the viewport. The header row is the row of the `thead`, or the first row whose cells are all `th`. The rule scrolls the page until the top of the table is 400 pixels above the top of the viewport. Fails the table when no header cell is then inside the viewport.

The rule scrolls the page and not a container. A table that scrolls inside its own container is not checked.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Make the header row sticky, or repeat it.

## Not required for

- A short table that does not scroll.

## Rationale

A column with no visible header makes the reader scroll back up to find what it means. `CMP-6c` judges the parts of the table pattern that a script cannot measure.
