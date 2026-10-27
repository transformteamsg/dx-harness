---
code: WP-6b
dss: WP-6
tier: L1
check: lint
surface: source
engine: jsx-a11y `aria-role`, `aria-props`, `aria-proptypes`, `aria-unsupported-elements`, `role-has-required-aria-props`, `role-supports-aria-props`, `no-redundant-roles`, `no-noninteractive-element-to-interactive-role`, `no-interactive-element-to-noninteractive-role`
parameters: {}
---

# WP-6b: ARIA roles and properties are valid

## Statement

ARIA markup is valid and not redundant.

## Check

Fails an element that any `jsx-a11y` rule in the `engine` field reports.

## Recommendations

- Do not overuse ARIA. Extra markup adds clutter for end users.

## Not required for

None listed.

## Rationale

Invalid ARIA gives assistive technology a wrong structure. Redundant ARIA adds noise.
