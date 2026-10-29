---
code: CMP-12a
slug: side-accent-border
dss: SLP-3
tier: L1
check: lint
surface: source
engine: custom
parameters:
  minWidth: 3
---

# CMP-12a: a rounded box has no thick side accent border

## Statement

A box with rounded corners does not carry a thick accent border on one side.

## Check

Reads each `.css` file, each `<style>` block of an HTML file, and each `style` attribute. Fails a rule or a `style` attribute that sets both of these:

- A side border of `minWidth` pixels or more: `border-left`, `border-right`, `border-inline-start`, or `border-inline-end`, or the `-width` property of one of them. A `rem` or `em` length counts as 16 pixels. The keyword `medium` counts as 3 pixels, and `thick` as 5.
- A `border-radius`, or the radius of one corner, that is not zero.

## Recommendations

- Mark the state or the type of the box with an icon, a label, or a full border.
- Remove the side accent when the box needs no mark.

## Not required for

None listed.

## Rationale

A thick coloured stripe down one side of a rounded card is the most recognisable sign of a generated interface. It adds a colour that carries no meaning the text does not already give.
