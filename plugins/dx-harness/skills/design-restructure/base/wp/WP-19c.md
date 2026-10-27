---
code: WP-19c
dss: WP-19
tier: L1
check: lint
surface: source
engine: custom
parameters: {}
---

# WP-19c: CSS reveals content on focus as well as on hover

## Statement

A style rule that reveals content on `:hover` has a matching rule for `:focus` or `:focus-within`.

## Check

Fails a selector that sets `display`, `visibility`, or `opacity` to reveal content under `:hover` when the same target has no `:focus` or `:focus-within` rule.

## Recommendations

- Pair each `:hover` reveal with a `:focus-within` reveal.

## Not required for

None listed.

## Rationale

A keyboard user triggers focus, not hover.
