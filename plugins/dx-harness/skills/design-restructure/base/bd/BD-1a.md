---
code: BD-1a
dss: BD-1
tier: L1
check: lint
surface: source
engine: axe meta-viewport
parameters: {}
---

# BD-1a: viewport meta present and zoom allowed

## Statement

Every HTML page declares a viewport meta tag that does not block zoom.

## Check

Fails a page when any of these holds:

- The page has no `<meta name="viewport">` tag.
- The tag sets `user-scalable=no`.
- The tag sets `maximum-scale` below 2.

## Recommendations

- Use `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Test the layout at 320 CSS pixels wide. `BD-1b` checks this.

## Not required for

None listed.

## Rationale

A page without a viewport tag renders at desktop width on a phone. A tag that blocks zoom stops users who need a larger view. The DSS asks for responsive web design, and this tag is its minimum.
