---
code: MOT-1a
slug: interface-motion-duration
control: MOT-1
tier: L2
check: lint
surface: source
engine: custom
judgedRemainder: MOT-1b
parameters:
  minMs: 100
  maxMs: 300
  narrativeFiles: []
---

# MOT-1a: interface motion stays within the duration band and names its properties

## Statement

Each transition and animation of the interface runs for `minMs` to `maxMs`, with an easing that does not overshoot. A transition names the properties that it animates.

## Check

Reads CSS files, `<style>` blocks, inline `style` attributes, and the Tailwind classes of markup and script files. Fails each of these:

- A duration outside `minMs` to `maxMs`. A duration of zero is no motion, and passes. In a `transition` or `animation` shorthand, the first time of each item is the duration, and the second time is a delay, which the rule does not read.
- `transition: all`, `transition-property: all`, or the Tailwind class `transition-all`.
- A `cubic-bezier()` easing with a y value below 0 or above 1. A curve of this type overshoots, as a bounce or an elastic curve does.

Skips these:

- A file that matches a glob in `narrativeFiles`.
- An animation that repeats with no end (`infinite`).
- A value in `var()`, and a custom property definition. The rule does not resolve a token to its value.
- The Tailwind class `duration-(--name)`, which reads a custom property.

## Recommendations

- Use a duration from 100ms to 300ms for interface motion.
- Use an ease-out or ease-in-out curve.
- Name each property in the transition, such as `transition: opacity 200ms ease-out`.

## Not required for

- A narrative or marketing surface that is not a task flow, where a longer duration is a deliberate choice with a recorded rationale. List its files in `narrativeFiles`.
- A loading or progress indicator. The work sets its duration, not the designer.

## Rationale

Motion on a task flow is a cost that each user pays on each repetition. Below 100ms a transition looks like a jump, and above 300ms it looks like a wait. `transition: all` animates each property that changes, including layout properties, so the set of animated properties is unknown. The rule finds the literal values. `MOT-1b` judges whether motion on a critical path is decorative.
