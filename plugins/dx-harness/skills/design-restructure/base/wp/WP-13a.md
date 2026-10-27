---
code: WP-13a
dss: WP-13
tier: L1
check: lint
surface: rendered
engine: axe `color-contrast`
parameters:
  pages: null
  normalRatio: 4.5
  largeRatio: 3
  largeTextPt: 18
  largeBoldTextPt: 14
  decorativeSelector: null
  inactiveSelector: null
---

# WP-13a: text meets the minimum contrast ratio

## Statement

Text has a contrast ratio of `normalRatio` or more against its background. Large text needs `largeRatio` or more.

## Check

Fails text that axe `color-contrast` reports against the ratios and sizes in the parameters. Skips an element that matches `decorativeSelector` or `inactiveSelector`. When either selector is unset, the rule reports "not configured". Set a selector to an empty string when no exemption applies.

## Recommendations

- Verify with a contrast checker such as the WebAIM Contrast Checker or Oobee.

## Not required for

- Text that is decorative and conveys no meaningful information.
- Text that is part of a component in an inactive state.

## Rationale

Low contrast text is unreadable for users with low vision.
