---
code: WP-14a
slug: text-resize
dss: WP-14
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  scalePercent: 200
  viewports: [1280]
---

# WP-14a: text scaled to 200 percent loses no content

## Statement

Text scaled to `scalePercent` loses no content or functionality.

## Check

Sets the root font size to `scalePercent` at each width in `viewports`. Fails when a text element is clipped, truncated, or overlapped, or when a control leaves the viewport. The check measures before and after the change and reports only what the change causes. Captions and images of text are excluded.

## Recommendations

- Test with zoom, magnification, and text-only resizing.

## Not required for

None listed.

## Rationale

Users with low vision enlarge text. Clipped content is lost to them.
