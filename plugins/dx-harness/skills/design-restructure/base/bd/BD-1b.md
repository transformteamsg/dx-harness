---
code: BD-1b
dss: BD-1
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  viewports: [320, 768, 1280]
  pages: null
---

# BD-1b: no horizontal scroll at each viewport width

## Statement

Each page fits the viewport width without horizontal scrolling at every width in `viewports`.

## Check

Applies when `pages` is set. Loads each page in `pages` at each width in `viewports`, at a height of 800 pixels. Fails a page when the document is wider than the viewport. The finding names the page, the width, and the widest element. When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use relative units and `max-width` for containers and media.
- Let long text wrap.
- Test and resolve layout or functionality issues.

## Not required for

None listed. A data table that scrolls inside its own container does not fail the rule.

## Rationale

The DSS asks for services that are optimised for various devices and screen sizes. Horizontal scrolling at a narrow width is the plainest failure of that aim.
