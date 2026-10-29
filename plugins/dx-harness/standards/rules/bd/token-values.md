---
code: BD-6b
slug: token-values
dss: BD-6
tier: L1
check: lint
surface: source
engine: ported TOK rules
parameters: {}
---

# BD-6b: values come from tokens, not raw values

## Statement

Colour, spacing, and radius values come from the tokens of the design system, not from raw values.

## Check

Runs the ported token rules from `plugins/dx-harness/checks/token-audit.py` (TOK-1, TOK-2, TOK-3, COL-2). A finding from any of them is a finding of `BD-6b`. The scales and the allowed values are the parameters of those rules, and this rule adds none.

Status of the port: only the raw colour part of TOK-1 is ported. It scans `.css` files, `<style>` blocks, and `style` attributes, and skips custom property definitions and `var()` values. TOK-2, TOK-3, and COL-2 are not ported yet.

## Recommendations

- Define each value once, as a token, and reference the token.

## Not required for

None listed. A token-definition region is exempt, as it is in the ported rules.

## Rationale

A raw value in a component breaks the consistency that a design system gives. This rule reuses the existing token checks and does not repeat their logic.
