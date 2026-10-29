---
code: TYP-6a
slug: prose-measure
dss: TYP-6
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: TYP-6b
parameters:
  pages: null
  proseSelector: "p, li, dd, blockquote"
  maxMeasure: 75
---

# TYP-6a: a line of running prose is no wider than 75ch

## Statement

Running body text keeps to a comfortable measure, about 45 to 75 characters for each line.

## Check

Opens each page in `pages` at a viewport of 1280 by 800. Reads each visible element that matches `proseSelector` and is not inside another match. Measures the width of each rendered line of its text. Fails the element when a line is wider than `maxMeasure` times the width of `1ch` in the font of the element.

The rule measures the rendered lines, so it reads a width set in any unit. A short paragraph on one line in a wide container passes, because its line is short.

When a parameter is `null`, the rule reports "not configured" and does not pass.

## Recommendations

- Cap the width of running prose with a `max-width` in `ch`, such as `max-width: 65ch` or the utility class `max-w-prose`.

## Not required for

- Headings, table cells, data grids, code blocks, and short labels.

## Rationale

When a line runs much past 75 characters, the eye travels too far to find the start of the next line, and a long block becomes a wall of text. `TYP-6b` judges the running prose that the default `proseSelector` does not match, and a wider block that is a deliberate exception.
