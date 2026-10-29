---
code: WP-18b
slug: text-spacing-no-loss
dss: WP-18
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  lineHeight: 1.5
  paragraphSpacing: 2
  letterSpacing: 0.12
  wordSpacing: 0.16
---

# WP-18b: text with adjusted spacing loses no content

## Statement

Text with the spacing in the parameters loses no content or functionality.

## Check

Injects a style sheet that sets the four spacing values as multiples of the font size, each with `!important`. Fails when a text element is clipped, truncated, or overlapped, or when a control leaves the viewport. The check measures before and after the change and reports only what the change causes.

## Recommendations

- Test with a tool that simulates the spacing values.
- The page does not need these values as defaults.

## Not required for

None listed.

## Rationale

Users with dyslexia or low vision set their own text spacing.
