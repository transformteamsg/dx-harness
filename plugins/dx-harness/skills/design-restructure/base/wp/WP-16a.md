---
code: WP-16a
dss: WP-16
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  reflowWidth: 320
  twoDimensionalSelector: null
---

# WP-16a: content reflows at the reflow width

## Statement

Content reflows to one column at `reflowWidth` CSS pixels, without horizontal scrolling.

## Check

Fails a page whose scroll width exceeds `reflowWidth`. The page passes when the overflow comes only from an element that matches `twoDimensionalSelector`. When `twoDimensionalSelector` is unset, the rule reports "not configured" and does not pass. Set it to an empty string when no exemption applies. The check shares its measurement with `BD-1b`.

## Recommendations

- Build with CSS Flexbox or Grid.
- Test on a range of devices.

## Not required for

- Content that requires a two-dimensional layout for understanding or function, such as maps, complex data tables, or data visualisations.

## Rationale

A user who magnifies the page needs one column of text. Horizontal scrolling for each line is not usable.
