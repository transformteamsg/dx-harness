---
code: WP-7b
slug: visual-order-matches-code
dss: WP-7
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  orderTolerancePx: 8
  direction: null
  pages: null
---

# WP-7b: visual order matches the order of the code

## Statement

The visual reading order of text blocks matches their order in the DOM.

## Check

Lists text blocks in DOM order. A text block is a non-inline element with text and no non-inline child that has text. Fails a block that sits above the previous block in the same column, or beside it on the same row on the wrong side for `direction`, by more than `orderTolerancePx`. A block in another column is not compared. When `direction` is unset, the rule reports "not configured".

## Recommendations

- Avoid `order`, `flex-direction: *-reverse`, and absolute positioning that reorders content.

## Not required for

None listed.

## Rationale

Assistive technology reads in DOM order. A different visual order gives a different meaning.
