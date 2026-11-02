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

Status of the port: TOK-1, TOK-2, TOK-3, and COL-2 are ported. The check scans `.css` files, `<style>` blocks, `style` attributes, and `class` attributes, in HTML files and in `.vue` and `.svelte` files. A bound `style` or `class` is not read. A template that does not parse is a finding, because the check could not read it:

- A raw colour value is a finding.
- A `px` or `rem` spacing value that is not on the spacing scale is a finding. The scale is 0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 112, and 128 pixels, at 16 pixels to the `rem`.
- A `px` or `rem` radius value that is not on the radius scale is a finding. The scale is 0, 2, 4, 6, 8, 12, 16, 24, and 9999 pixels.
- A Tailwind palette class, such as `bg-red-500`, is a finding, unless the theme defines its colour as a `--color-<name>` token.

The check skips custom property definitions, the region between `/* dx-tokens */` and `/* /dx-tokens */`, `var()` values, and lengths inside `calc()`. The allow list and the waiver comments of `token-audit.py` are not ported.

## Recommendations

- Define each value once, as a token, and reference the token.

## Not required for

None listed. A token-definition region is exempt, as it is in the ported rules.

## Rationale

A raw value in a component breaks the consistency that a design system gives. This rule reuses the existing token checks and does not repeat their logic.
