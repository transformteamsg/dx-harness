---
code: WP-17a
slug: boundary-contrast
dss: WP-17
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  minRatio: 3
  inputSelector: "input:not([type=hidden]), select, textarea"
  buttonSelector: "button, [role='button']"
  stateSelector: "input[type=checkbox], input[type=radio], [role='checkbox'], [role='radio'], [role='switch']"
---

# WP-17a: input and button boundaries meet the minimum contrast ratio

## Statement

The border or fill that identifies a form input or a button has a contrast ratio of `minRatio` or more against the adjacent background.

## Check

Runs on the default state and the focus state. For `stateSelector`, it also runs on the checked state.

For each element that matches `inputSelector`:

- Fails the element when it has no border and no fill that differs from its background.
- Fails the element when the border or fill contrast is below `minRatio`. When it has both, the stronger part counts.
- Passes a checkbox, a radio button, or a range input that keeps its default appearance, because the browser draws its boundary.

For each element that matches `buttonSelector`:

- Tests the border or fill only when the button has one. Fails the button when that contrast is below `minRatio`.
- Passes a button that has no border and no distinct fill. Text contrast is tested by the WP colour contrast rule.

When the adjacent background is an image or a gradient, the contrast cannot be computed. The rule reports a finding that says so, and does not pass the element.

No engine has this rule: axe 4.14.0 has no non-text contrast rule.

## Recommendations

- Focus on the elements that are critical for interaction, such as buttons and form inputs.

## Not required for

None listed. Other components, icons, and charts fall to `WP-17b`.

## Rationale

A user with low vision must see where a field is. A button with a text label does not need an edge to be found, so the rule tests an edge only when the button has one.
