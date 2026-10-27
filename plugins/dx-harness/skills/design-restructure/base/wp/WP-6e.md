---
code: WP-6e
dss: WP-6
tier: L1
check: lint
surface: source
engine: jsx-a11y `prefer-tag-over-role`, plus custom for HTML
judgedRemainder: WP-6d
parameters: {}
---

# WP-6e: a native element is used where one exists for the role

## Statement

A native element is used where one exists for the role.

## Check

In JSX and TSX, fails an element that the `jsx-a11y` rule in the `engine` field reports. In plain HTML, fails a `<div>` or `<span>` whose `role` has a native element, such as `button`, `link`, `navigation`, or `heading`. `WP-6b` already reports a role that repeats the implicit role of its element.

`WP-6d` judges whether the structure fits the content.

## Recommendations

- Replace a `div` with a `role` by the native element, such as `<button>` or `<nav>`.

## Not required for

None listed.

## Rationale

A native element carries its role, its keyboard behaviour, and its states. A script finds a replaceable element and cannot decide whether the whole structure fits.
