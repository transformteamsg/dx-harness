---
code: WO-8b
slug: single-page-view-title
dss: WO-8
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  spaRoutes: null
---

# WO-8b: each single-page view sets its own title

## Statement

Each view of a single-page application sets `document.title` when it loads.

## Check

Applies when `spaRoutes` is set. The rule navigates to each route in `spaRoutes` through in-page links. Fails a route when `document.title` is unchanged from the previous route or is empty.

When `spaRoutes` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Set the title when the view changes.
- Announce the view change to assistive technology.

## Not required for

None listed.

## Rationale

A single-page application serves many views from one URI. Without a new title, a user cannot tell views apart.
