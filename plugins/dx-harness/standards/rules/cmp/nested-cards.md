---
code: CMP-13a
slug: nested-cards
dss: SLP-4
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  ignoreSelector: "button, input, select, textarea, a, img, svg, [role=button]"
---

# CMP-13a: no card inside a card

## Statement

A card-styled container does not sit inside another card-styled container.

## Check

Applies when `pages` is set. Renders each page in `pages` at 1280 by 800 pixels. A visible element is card-styled when its computed style has all of these:

- A border on all four sides, or a `box-shadow`.
- A `border-radius` that is not zero on one or more corners.
- A background colour that is not transparent, or a background image.
- A `display` of `block`, `flex`, `grid`, `flow-root`, or `list-item`.

An element that matches `ignoreSelector` is not card-styled. Fails each card-styled element that has a card-styled ancestor.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Flatten the inner card. Group its content with spacing, a heading, and a divider.

## Not required for

None listed.

## Rationale

A card inside a card adds a border, a shadow, and a background that say nothing new. Each level takes space and makes the page harder to scan.
