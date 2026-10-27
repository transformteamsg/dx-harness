---
code: WR-1d
dss: WR-1
tier: L1
check: lint
surface: source
engine: eslint-plugin-jsx-a11y interactive-supports-focus, click-events-have-key-events, no-static-element-interactions, no-noninteractive-element-interactions
parameters: {}
---

# WR-1d: a custom interactive element has a role and is focusable

## Statement

An element that handles a user action has a role that identifies it and can take keyboard focus.

## Check

Fails a non-native element that has an event handler, such as `onClick`, when any of these holds:

- It has no `role`.
- It has an interactive role but is not focusable (no `tabIndex`).
- It handles a click with no matching key handler.

A native `<button>`, `<a href>`, `<input>`, `<select>`, or `<textarea>` passes.

Status: the module reads plain HTML, where the handler is an `on*` attribute. The JSX and TSX path, through `eslint-plugin-jsx-a11y`, is not built.

## Recommendations

- Use a standard HTML control. It already meets this criterion when used to specification.
- For a custom component, set the role, the name, and the states with ARIA.

## Not required for

None listed.

## Rationale

A `<div>` with a click handler has no role, so assistive technologies do not report it as a control. It is also out of the keyboard order.
