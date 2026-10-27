---
code: WO-18a
dss: WO-18
tier: L1
check: lint
surface: rendered
engine: axe target-size
parameters:
  minSize: 24
  pages: null
---

# WO-18a: pointer targets are at least the minimum size

## Statement

Each interactive area is at least `minSize` by `minSize` CSS pixels.

## Check

Fails a target whose width or height is below `minSize`, unless a circle of `minSize` pixels around its centre overlaps no other target.

Skips a target whose size is set by the line height of non-interactive text, such as a link inside a paragraph.

## Recommendations

- Use `min-height` and `min-width` to give targets enough size.
- Space smaller targets so that a 24 pixel area around each does not overlap its neighbours.
- Use larger targets on touch devices.

## Not required for

- A target whose size is set by the line height of non-interactive text, such as a text link in body text.

## Rationale

A small target is hard to hit for users with tremor or large fingers.
