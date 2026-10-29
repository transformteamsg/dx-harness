---
code: A11Y-5a
slug: reduced-motion
control: A11Y-5
tier: L1
check: lint
surface: rendered
engine: custom
judgedRemainder: A11Y-5b
parameters:
  pages: null
  essentialSelectors: []
  minDurationMs: 50
---

# A11Y-5a: no animation runs when the user asks for reduced motion

## Statement

When the user sets `prefers-reduced-motion: reduce`, every non-essential animation stops.

## Check

Applies when `pages` is set. The rule loads each page with `prefers-reduced-motion: reduce`. Fails for each visible element that has a running animation of `minDurationMs` milliseconds or more, from a CSS animation, a CSS transition, or the Web Animations API, unless the element matches a selector in `essentialSelectors`.

An animation shorter than `minDurationMs` passes. The usual reduced-motion reset sets `animation-duration: 0.01ms`, which is a correct response to the media query.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Put each animation inside `@media (prefers-reduced-motion: no-preference)`, or turn it off inside `@media (prefers-reduced-motion: reduce)`.
- Replace a moving effect with a change of opacity or a static state.
- Name an animation that carries meaning, such as a progress indicator, in `essentialSelectors`, and record why.

## Not required for

- An animation that is essential to the information or the function. The product names it in `essentialSelectors`, and `A11Y-5b` judges the choice.

## Rationale

Motion can cause dizziness and nausea for a user with a vestibular disorder, and it distracts a user who has trouble with attention. The operating system setting is how the user asks for less motion. WCAG 2.3.3 is level AAA, so no DSS rule covers it.
