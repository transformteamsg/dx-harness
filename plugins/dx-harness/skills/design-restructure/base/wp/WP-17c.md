---
code: WP-17c
dss: WP-17
tier: L2
check: lint
surface: project
engine: custom
parameters:
  minRatio: 3
  boundaryTokenPairs: null
---

# WP-17c: declared boundary token pairs meet the minimum contrast ratio

## Statement

Each border or fill token that identifies a component has a contrast ratio of `minRatio` or more against the background token that it sits on.

## Check

Reads the pairs in `boundaryTokenPairs`. Each pair names a foreground token, a background token, and the component that uses them. Resolves each token to a colour and computes the contrast. Fails a pair below `minRatio`.

When `boundaryTokenPairs` is unset, the rule reports "not configured" and does not pass. It does not need a rendered page.

## Recommendations

- Declare a pair for every component boundary in the design system.

## Not required for

None listed.

## Rationale

A token pair is checked once for every use of the token. `WP-17a` catches a value that is not declared as a token, and `BD-6b` catches a raw value.
