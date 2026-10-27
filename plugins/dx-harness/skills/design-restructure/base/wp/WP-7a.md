---
code: WP-7a
dss: WP-7
tier: L1
check: lint
surface: source
engine: jsx-a11y `tabindex-no-positive`, plus custom for HTML
redirects: [WO-9a]
parameters: {}
---

# WP-7a: no positive tabindex

## Statement

No element sets `tabindex` above 0.

## Check

Fails an element that `jsx-a11y/tabindex-no-positive` reports in JSX and TSX, and an element with `tabindex` above 0 in plain HTML.

## Recommendations

- Order the code in the reading order, and use `tabindex="0"` or `-1` only.

## Not required for

None listed.

## Rationale

A positive `tabindex` moves keyboard focus away from the order of the code.
