---
code: WO-7b
dss: WO-7
tier: L1
check: lint
surface: rendered
engine: axe region
parameters:
  pages: null
---

# WO-7b: page content is inside landmarks

## Statement

All page content is inside a landmark region.

## Check

Fails a page that has content outside a landmark region.

## Recommendations

- Wrap repeated blocks in `<header>`, `<nav>`, `<main>`, or `<footer>`.

## Not required for

None listed.

## Rationale

Landmarks let assistive technology skip to the main content.
