---
code: TYP-2a
slug: text-size-floor
control: TYP-2
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  bodyMinSize: 14
  labelMinSize: 12
  labelSelector: "label, legend, caption, figcaption, small, button, th"
---

# TYP-2a: body text is at least 14px, and label text is at least 12px

## Statement

Body text is at least 14px. Labels and captions are at least 12px.

## Check

Opens each page in `pages` at a viewport of 1280 by 800. Reads each visible element that holds text of its own. The floor is `labelMinSize` when the element is inside an element that matches `labelSelector`, and `bodyMinSize` otherwise. Fails each element whose computed font size is below its floor.

The rule reads the computed size, so it reads a size set in any unit, through `var()`, or by a utility class.

When a parameter is `null`, the rule reports "not configured" and does not pass.

## Recommendations

- Take sizes from the type scale. 14px is the smallest body size.
- Add the label and caption styles of the product to `labelSelector`.

## Not required for

None listed.

## Rationale

Text below these sizes is hard to read for every user, and harder on a small screen or for a user who is tired. A dense table is not an exception.
