---
code: WO-10a
slug: link-accessible-name
dss: WO-10
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
---

# WO-10a: each link has an accessible name

## Statement

Each link has text that a screen reader can announce.

## Check

Fails a link whose only name is its `title` attribute: it has no text content, no `aria-label`, no `aria-labelledby`, and no image with `alt` text. A link with no name at all is reported by `WR-1a`, through axe `link-name`, so this rule does not report it a second time.

## Recommendations

- Give an icon link an `aria-label` that states where it goes.

## Not required for

None listed.

## Rationale

A link without a name is announced as only "link".
