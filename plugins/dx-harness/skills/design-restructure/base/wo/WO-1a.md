---
code: WO-1a
dss: WO-1
tier: L1
check: lint
surface: source
engine: "jsx-a11y click-events-have-key-events, no-static-element-interactions"
parameters: {}
---

# WO-1a: pointer handlers have a keyboard handler

## Statement

Each element with a pointer handler also has a keyboard handler.

## Check

Fails an element when any of these holds:

- It has `onClick` and has none of `onKeyDown`, `onKeyUp`, or `onKeyPress`.
- It is a non-interactive element with a pointer handler and has no `role`.

Skips an element that is natively interactive, such as `<button>` or `<a href>`.

## Recommendations

- Use a native `<button>` or `<a href>` for an action.
- Provide keyboard operation for all functions of the page, unless the function needs path-dependent input such as handwriting.
- Avoid timing requirements for individual keystrokes. `WO-1c` judges this.

## Not required for

None listed.

## Rationale

A user who cannot use a pointer needs the same actions from a keyboard. A native control gives this with no extra code.
