---
code: TL-2b
dss: TL-2
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  logoSelector: null
  aspectTolerance: 0.02
  minPixelRatio: 1
---

# TL-2b: the logo renders without distortion or pixellation

## Statement

The logo keeps its aspect ratio and has enough pixels for its rendered size.

## Check

For the `<img>` that matches `logoSelector`, fails when either of these holds:

- The rendered width-to-height ratio differs from the natural ratio by more than `aspectTolerance`.
- The natural width is below the rendered width multiplied by `minPixelRatio`.

An SVG logo passes the second condition. When `logoSelector` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use an SVG file, or a raster file at twice the rendered size.

## Not required for

None listed.

## Rationale

A stretched or blurred logo weakens trust in the service.
