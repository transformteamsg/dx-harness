---
code: WR-1c
slug: valid-aria-attributes
dss: WR-1
tier: L0
check: lint
surface: rendered
engine: axe aria-valid-attr, aria-valid-attr-value, aria-allowed-attr, aria-prohibited-attr, aria-hidden-body, aria-hidden-focus
parameters:
  pages: null
---

# WR-1c: ARIA attributes are valid and supported

## Statement

Each ARIA attribute is a defined attribute, has a valid value, and is supported by the role of its element.

## Check

Applies when `pages` is set. When `pages` is unset, the rule reports "not configured" and does not pass.

Fails an element when any of these holds:

- An `aria-*` attribute name is not defined.
- An `aria-*` value is not valid for its type, or an ID reference points to no element.
- An attribute is not allowed on the role, or is prohibited on it.
- `aria-hidden="true"` is set on `<body>`, or on an element that contains a focusable element.

The source twin is `eslint-plugin-jsx-a11y` `aria-props`, `aria-proptypes`, `aria-unsupported-elements`, and `role-supports-aria-props`, mapped to `WR-1c`.

## Recommendations

- Provide states and properties, such as `aria-expanded` and `aria-selected`, on custom components.
- Update each state when it changes.

## Not required for

None listed.

## Rationale

An invalid attribute is ignored or misread. The state it was meant to carry does not reach the user.
