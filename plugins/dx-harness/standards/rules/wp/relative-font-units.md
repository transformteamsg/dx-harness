---
code: WP-14b
slug: relative-font-units
dss: WP-14
tier: L2
check: lint
surface: source
engine: custom
parameters:
  allowedUnits: [rem, em, "%"]
---

# WP-14b: font sizes use relative units

## Statement

Font sizes use relative units.

## Check

Fails a `font-size` declaration whose unit is not in `allowedUnits`. A value from a design token passes when the token resolves to an allowed unit. The rule reads style sheets, `<style>` blocks, and inline `style` attributes in HTML. It does not read a JSX style object.

## Recommendations

- Use `rem` for font sizes.

## Not required for

None listed.

## Rationale

A pixel font size does not follow the text size setting of the browser.
