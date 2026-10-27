---
code: WO-15a
dss: WO-15
tier: L2
check: lint
surface: source
engine: custom
parameters:
  downEvents: [onMouseDown, onPointerDown, onTouchStart, mousedown, pointerdown, touchstart]
  activationSelector: "button, a[href], [role='button'], [role='link'], input[type=button], input[type=submit]"
  essentialDownEventSelectors: []
---

# WO-15a: activation controls do not run an action on a down event

## Statement

A button, a link, or a control with `role="button"` runs its action on the up event, not on the down event.

## Check

Fails an element that matches `activationSelector` and has a handler named in `downEvents`. Skips an element that matches a selector in `essentialDownEventSelectors`.

The rule does not check these elements: a `draggable` element, an `<input type="range">`, a `<canvas>`, and an element with `role="slider"` or `role="scrollbar"`.

The rule does not decide whether the handler runs an action or only tracks state. It reports each handler on an activation element, and the author records an essential case in `essentialDownEventSelectors`.

## Recommendations

- Run a function when the click or touch is released.
- Give users a way to cancel a critical action, such as an undo function.
- Use a confirmation dialog as a second check for a critical action. `WO-15b` judges this.

## Not required for

None listed.

## Rationale

A user can cancel an action by moving the pointer away before release. A down event takes that choice away.
