---
code: COL-4a
slug: gradient-text
control: SLP-2
tier: L1
check: lint
surface: source
engine: custom
parameters: {}
---

# COL-4a: no gradient text

## Statement

Text does not take a gradient fill.

## Check

Reads each `.css` file, each `<style>` block of an HTML file, and each `style` attribute. Fails a rule or a `style` attribute that sets `background-clip: text` or `-webkit-background-clip: text`, and also sets a `background` or `background-image` that holds a gradient. A `var()` in the background resolves through the custom properties of the style sheets.

## Recommendations

- Give a heading or a metric a solid colour from the palette.
- Show emphasis with size, weight, or position.

## Not required for

None listed.

## Rationale

Gradient text on a heading or a metric is a common sign of a generated page. It also makes the contrast of the text vary along its length, so no single contrast value describes it.
