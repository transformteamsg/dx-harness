---
code: COL-3a
slug: purple-gradient-and-glow
control: SLP-1
tier: L1
check: lint
surface: source
engine: custom
judgedRemainder: COL-3b
parameters:
  hueRange: [260, 300]
  minSaturation: 0.3
  minGlowBlur: 16
---

# COL-3a: no purple gradient and no glow shadow

## Statement

A style sheet does not fill a surface with a gradient between two purple or violet colours. It does not give an element a glow: a coloured, large, zero-offset `box-shadow`.

## Check

Reads each `.css` file, each `<style>` block of an HTML file, and each `style` attribute. It reads raw colour values only: hex, `rgb()`, `hsl()`, and the purple and violet colour names. A colour in `var()` is a product token, and the check does not read it. A custom property declaration is not read.

- Fails a `linear-gradient`, `radial-gradient`, or `conic-gradient`, or a repeating one, that has two or more purple stops. A stop is purple when its hue is in `hueRange`, in degrees, and its HSL saturation is `minSaturation` or more.
- Fails a `box-shadow` layer that is not `inset`, has an x offset and a y offset of zero, has a blur of `minGlowBlur` pixels or more, and has a colour with a saturation of `minSaturation` or more. A `rem` or `em` length counts as 16 pixels.

## Recommendations

- Take the surface colours from the product palette, as tokens.
- Show elevation with a shadow that has a y offset and a neutral colour.

## Not required for

- A colour from the declared palette of the product, used as a token. A palette that contains violet is not a failure.

## Rationale

A purple gradient and a glow are what a generator produces when it has no brand to use. They read as generated, not as a product. `COL-3b` judges what this rule cannot read: cyan or electric-blue text on a near-black surface, and a token palette that is only the default look under a new name.
