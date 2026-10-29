---
code: MOT-4a
slug: no-overshoot-easing
dss: SLP-8
tier: L1
check: lint
surface: source
engine: custom
parameters:
  namePatterns: ["bounce", "elastic"]
---

# MOT-4a: no bounce, elastic, or overshoot easing

## Statement

An interface element does not move with bounce, elastic, or overshoot easing.

## Check

Reads each `.css` file, each `<style>` block of an HTML file, and each `style` attribute. Reads the `transition`, `transition-timing-function`, `animation`, and `animation-timing-function` declarations. A `var()` in the value resolves through the custom properties of the style sheets.

- Fails a `cubic-bezier(x1, y1, x2, y2)` where `y1` or `y2` is less than 0 or more than 1.
- Fails a value with a name that contains one of `namePatterns`, as a case-insensitive substring. An example is the animation name `bounceIn`.

The check does not read motion that a script sets.

## Recommendations

- Use an ease-out curve for an element that comes in, and an ease-in curve for an element that goes out.

## Not required for

None listed.

## Rationale

A dialog that springs in past its place and back draws attention to the motion, not to the content. It also makes the interface feel slower, because the element settles after it arrives.
