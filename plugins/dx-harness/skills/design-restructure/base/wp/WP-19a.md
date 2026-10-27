---
code: WP-19a
dss: WP-19
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  popupTriggerSelector: "[aria-describedby], [aria-haspopup], [data-tooltip]"
---

# WP-19a: hover and focus content is dismissible with Escape

## Statement

Content that appears on hover or focus disappears when the user presses Escape.

## Check

For each element matching `popupTriggerSelector`, shows the content through hover and through focus. Fails when Escape does not hide it and no other control does. Content that has a button in it counts as having another control. The pointer rests on the trigger during the hover test.

## Recommendations

- Make tooltips and sub-menus perceivable and dismissible without a change of focus.

## Not required for

None listed.

## Rationale

A user with a magnifier must clear content that covers the page.
