---
code: WR-1b
dss: WR-1
tier: L0
check: lint
surface: rendered
engine: axe aria-roles, aria-allowed-role, aria-required-attr, aria-required-children, aria-required-parent
parameters:
  pages: null
---

# WR-1b: roles are valid and carry their required properties

## Statement

Each `role` value is valid for its element and has the properties that the role requires.

## Check

Applies when `pages` is set. When `pages` is unset, the rule reports "not configured" and does not pass.

Fails an element when any of these holds:

- Its `role` value is not a defined ARIA role.
- Its `role` is not allowed on the element.
- It lacks an attribute that the role requires, such as `aria-checked` on `role="checkbox"`.
- It lacks a required child or parent role, such as `role="option"` outside a listbox.

The source twin is `eslint-plugin-jsx-a11y` `aria-role`, `role-has-required-aria-props`, and `no-interactive-element-to-noninteractive-role`, mapped to `WR-1b`.

## Recommendations

- Use the native element instead of a role where one exists.
- Check the role against the ARIA Authoring Practices Guide pattern.

## Not required for

None listed.

## Rationale

A wrong role gives assistive technologies the wrong type of control. A missing required property leaves its value unknown.
