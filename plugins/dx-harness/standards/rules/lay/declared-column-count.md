---
code: LAY-1a
slug: declared-column-count
control: LAY-1
tier: L2
check: lint
surface: source
engine: custom
judgedRemainder: LAY-1b
parameters:
  gridColumns: null
---

# LAY-1a: column counts fit the declared grid

## Statement

Each grid in the source uses a column count that divides the product's declared column count.

## Check

Fails when a `grid-template-columns` value, or a Tailwind `grid-cols-N` class, sets a number of tracks that does not divide `gridColumns`. The rule reads stylesheets, `<style>` elements, and `style` attributes.

The rule counts `repeat(N, ...)` as N tracks, and each other track as one. It does not count a value that holds `auto-fill`, `auto-fit`, `var()`, or `subgrid`, because the number of tracks is not known from the source.

When `gridColumns` is unset, the rule reports "not configured" and does not pass. A product that declares no grid does not set `gridColumns`.

## Recommendations

- Set `gridColumns` from the `columns` value of the product's grid declaration.
- Make a section span a number of columns of the declared grid, rather than invent a new count.
- Take gutters and margins from the spacing scale. `BD-6b` checks that values come from tokens, so this rule does not check gutters.

## Not required for

None listed.

## Rationale

A declared grid makes "the layout is aligned" a claim that a script can check. A column count that does not divide the grid breaks the shared column lines. `LAY-1b` judges whether the column structure reads as coherent.
