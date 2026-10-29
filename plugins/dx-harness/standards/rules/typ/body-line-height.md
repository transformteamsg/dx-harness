---
code: TYP-2b
slug: body-line-height
control: TYP-2
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  bodySelector: "p, li, dd, blockquote"
  minLineHeight: 1.5
  maxLineHeight: 1.6
---

# TYP-2b: body text has a line height from 1.5 to 1.6

## Statement

The line height of body text is from 1.5 to 1.6 times its font size.

## Check

Opens each page in `pages` at a viewport of 1280 by 800. Reads each visible element that matches `bodySelector` and holds text of its own. Divides its computed line height by its computed font size. Fails the element when the ratio is below `minLineHeight` or above `maxLineHeight`. A line height of `normal` fails, because a browser sets it near 1.2.

When a parameter is `null`, the rule reports "not configured" and does not pass.

## Recommendations

- Set a unitless line height on the body text, so that it scales with the font size.

## Not required for

- Headings, labels, and table cells, which the default `bodySelector` does not match.

## Rationale

Lines that sit too close make the eye lose its place. Lines that sit too far apart break a paragraph into separate lines.
