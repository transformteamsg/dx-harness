---
id: SLP-1
source: DX-DS
title: No purple/violet gradient palettes, cyan-on-dark theming, or glow accents
tier: L1
check: hybrid
phase: [implement, verify]
applies_to: [page, component]
verify: "Stylesheet scan: no purple/violet gradient palettes, no cyan-on-dark theming, no glow box-shadow accents"
waiver: documented
fails_when:
  - the default AI aesthetic anywhere in product UI
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

## Requirement

Product UI does not reach for the three signatures of the default generative aesthetic:

- **Purple/violet gradient palettes** — a `linear-gradient` or `radial-gradient` running
  between two purple or violet hues, used as a surface, hero, or button fill.
- **Cyan-on-dark theming** — saturated cyan or electric-blue foreground text and accents
  set on a near-black surface.
- **Glow accents** — a coloured, large-radius, zero-offset `box-shadow` used as an
  ambient halo rather than as elevation.

This is an L1 control: a waiver is available, but it must be documented.

## Rationale

These three treatments are what an image or code generator produces when it has no brand
to draw from. They read as "generated" rather than as a product, and they arrive by
default rather than by decision. The control exists so the absence of a design choice
cannot pass as one.

The rule is about the *default* aesthetic, not about the colours themselves. A product
whose declared palette contains violet is not in breach for using it. `--glow` (Radix
orange-9) is a declared product colour in this repository, and using it as a token is
not a glow accent.

## Why this is hybrid

**Static-check half.** The three signatures have mechanical shapes: a gradient function
whose stops both resolve to hues in the purple/violet band, a cyan foreground token paired
with a near-black background token, and a `box-shadow` with a large blur, no offset, and a
saturated colour. A static check can find each of them in stylesheets and component
source. That half is planned in #156 as `checks/slop-scan.py`; no script exists yet.

**Judgment half.** Whether a given violet is the default aesthetic or the product's own
brand cannot be decided from the declaration alone — it depends on the product's declared
palette and on what the surface is doing. The evaluator holds that call, and it does not
reduce to a colour range.

## Passes when

- Gradients, if present, are drawn from the product's declared palette and serve a stated
  purpose rather than filling space.
- Foreground and background pairings come from declared tokens (TOK-1) and are not the
  saturated-cyan-on-near-black combination.
- Shadows express elevation — offset, tight blur, neutral colour — rather than ambient
  glow.

## Fails when

- A purple-to-violet gradient fills a hero, card, or primary button with no basis in the
  product's declared palette.
- Saturated cyan or electric-blue text and accents sit on a near-black surface as the
  theme rather than as one deliberate accent.
- A large-radius, zero-offset, saturated `box-shadow` halos an element.

## Evaluator guidance

**Flag**:

- Any of the three signatures where the product's declared palette does not account for
  the colour.
- A surface that uses all three together — that combination is the default aesthetic
  almost by definition.

**Do not flag**:

- A violet, cyan, or orange that is a declared product token used as intended
  (`--tw-blue`, `--casesync`, `--glow` in this repository).
- Elevation shadows with an offset and a tight blur.
- Gradients in illustrations, data visualisations, or brand marks, which are not product
  chrome.
- A documented waiver recording why the treatment is deliberate — this is an L1 control
  with `waiver: documented`.
