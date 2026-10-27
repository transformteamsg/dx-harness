---
code: WP-19e
dss: WP-19
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: WP-19d
parameters:
  triggerSelector: "[aria-describedby], [data-tooltip], [aria-haspopup]"
  dismissKey: Escape
  pages: null
  waitMs: 3000
---

# WP-19e: hover and focus content stays visible and can be dismissed

## Statement

Content that appears on hover or focus stays visible when the pointer moves onto it. It stays until the user dismisses it. The `dismissKey` hides it.

## Check

For each page in `pages`, runs a scripted test on each element that matches `triggerSelector`. A trigger that shows no content is skipped.

- Hover: shows the content and moves the pointer onto it. Reports content that disappears within `waitMs` without a user action. Presses `dismissKey` and reports content that stays.
- Focus: shows the content through focus. Reports content that disappears within `waitMs` without a user action.

The rule leaves to `WP-19a` the `dismissKey` test with the pointer on the trigger, and to `WP-19b` content that hides as soon as the pointer reaches it. When `pages` is unset, the rule reports "not configured".

The rule finds candidates and does not decide. It warns and never blocks. `WP-19d` judges whether the content is readable and usable.

## Recommendations

- Keep the content open while the pointer is over the trigger or the content.
- Hide the content only when the user moves away, presses `dismissKey`, or removes focus.

## Not required for

None listed.

## Rationale

A user with a magnifier moves the pointer onto the content to read it. Content that disappears first cannot be read. The scripted test finds the likely cases.
