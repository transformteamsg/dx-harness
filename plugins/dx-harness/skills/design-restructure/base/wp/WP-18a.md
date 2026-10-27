---
code: WP-18a
dss: WP-18
tier: L1
check: lint
surface: rendered
engine: axe `avoid-inline-spacing`
parameters:
  pages: null
---

# WP-18a: inline styles do not block text spacing overrides

## Statement

Inline styles do not set text spacing with `!important`.

## Check

Fails an element that axe `avoid-inline-spacing` reports. The engine fails an `!important` value that is below the WCAG minimum, and reads a line height only on text that wraps onto more than one line.

## Recommendations

- Allow assistive technology to override text spacing.

## Not required for

None listed.

## Rationale

An important inline declaration beats the style sheet of a user.
