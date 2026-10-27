---
code: WP-18c
dss: WP-18
tier: L1
check: lint
surface: source
engine: custom
parameters:
  properties: [line-height, letter-spacing, word-spacing]
---

# WP-18c: style sheets do not force text spacing

## Statement

A style sheet does not set a spacing property with `!important`.

## Check

Fails a declaration of any property in `properties` that carries `!important`.

## Recommendations

- Remove `!important` from spacing declarations.

## Not required for

None listed.

## Rationale

The source check reports the line that blocks an override.
