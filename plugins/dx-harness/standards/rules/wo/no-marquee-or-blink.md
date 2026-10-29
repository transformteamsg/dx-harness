---
code: WO-5a
slug: no-marquee-or-blink
dss: WO-5
tier: L1
check: lint
surface: source
engine: jsx-a11y no-distracting-elements
parameters: {}
---

# WO-5a: no marquee or blink elements

## Statement

The source has no `<marquee>` or `<blink>` element.

## Check

Fails an element that is `<marquee>` or `<blink>`.

## Recommendations

- Use content that the user can pause, stop, or hide.

## Not required for

None listed.

## Rationale

These elements move or blink with no control for the user. `WO-5b` covers content that script and CSS animate.
