---
code: WO-9e
slug: tab-sequence-order
dss: WO-9
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: WO-9d
parameters:
  maxJumpPixels: 400
  pages: null
---

# WO-9e: the tab sequence does not jump far up or left

## Statement

The tab sequence does not jump up or to the left by more than a set distance.

## Check

Applies when `pages` is set. Tabs through each page in `pages` and records the position of each focused element. Warns when the next element sits above or to the left of the current one by more than `maxJumpPixels`.

The rule finds candidates and does not decide. It warns and never blocks. `WO-9d` judges whether the order preserves meaning and operation.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Order the source to match the visual reading order.
- Avoid CSS that moves elements away from their source position.

## Not required for

None listed.

## Rationale

A large backward jump often means the focus order differs from the visual order. Some jumps are correct, such as a skip link or a modal, so the rule does not block.
