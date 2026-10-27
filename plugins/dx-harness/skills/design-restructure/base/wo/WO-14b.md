---
code: WO-14b
dss: WO-14
tier: L2
check: lint
surface: source
engine: custom
judgedRemainder: WO-14a
parameters:
  gestureEvents: [touchmove, gesturestart, onTouchMove, onDrag]
  gestureLibraries: [hammerjs, react-use-gesture, swiper]
---

# WO-14b: multipoint and path-based gesture handlers are flagged

## Statement

Each handler for a multipoint or path-based gesture is reported so that the author confirms a single-point alternative.

## Check

Finds a handler for an event in `gestureEvents`, for example a `touchmove` handler that reads more than one touch. Finds an import of a package in `gestureLibraries`.

The rule finds candidates and does not decide. It warns and never blocks. `WO-14a` judges whether a single-point alternative exists.

## Recommendations

- Provide a button for each pinch, swipe, or drag action.
- Offer a single tap or click that does the same thing.

## Not required for

- A gesture that is essential, such as freehand drawing.

## Rationale

The rule finds the handler. Not every drag or swipe needs an alternative, and the author confirms each one.
