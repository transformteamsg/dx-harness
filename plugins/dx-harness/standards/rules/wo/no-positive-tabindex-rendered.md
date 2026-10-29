---
code: WO-9b
slug: no-positive-tabindex-rendered
dss: WO-9
tier: L1
check: lint
surface: rendered
engine: axe tabindex
parameters:
  pages: null
---

# WO-9b: no positive tabindex in the rendered page

## Statement

No element in the rendered page has a `tabindex` above 0.

## Check

Fails an element whose `tabindex` attribute is above 0.

## Recommendations

- Order the elements in the DOM in the order that focus must follow.

## Not required for

None listed.

## Rationale

Markup that scripts or templates produce can carry a positive value that the source check cannot see.
