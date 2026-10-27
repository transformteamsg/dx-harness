---
code: WO-5b
dss: WO-5
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  maxAutoSeconds: 5
  pauseControlNames: [pause, stop, hide]
  pages: null
---

# WO-5b: moving content that runs longer than the limit has a control

## Statement

Content that moves, scrolls, or updates for longer than `maxAutoSeconds` has a pause, stop, or hide control.

## Check

Applies when `pages` is set. The rule loads each page and samples computed styles and the DOM across `maxAutoSeconds`. It fails when any of these holds, and the page has no control with an accessible name in `pauseControlNames`:

- An element has a CSS animation with `animation-iteration-count: infinite`.
- A carousel changes its active slide on its own.
- An element's text changes with no user input.

A page with `prefers-reduced-motion: reduce` set passes when the movement stops. When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Let users pause, stop, or hide content that moves, blinks, scrolls, or updates for more than 5 seconds.
- Apply this to auto-updating information and to animations that carry essential information.

## Not required for

None listed.

## Rationale

Moving content distracts users and makes the page hard to read. `WO-5a` flags the `<marquee>` and `<blink>` elements in source. `WO-5c` judges content that updates in ways a sample cannot see.
