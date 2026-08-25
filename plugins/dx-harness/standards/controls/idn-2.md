---
id: IDN-2
source: DX-DS
title: Product icons render only from the approved product-icon family; no ad-hoc, redrawn, or regenerated icons
tier: L1
check: hybrid
phase: [implement, verify]
applies_to: [page, component]
verify: "Icon files resolve to the approved product-icon set (the guideline's icon family); no inline-drawn or regenerated marks; new marks are pre-verified via the Icon Generator before entering the set"
waiver: documented
fails_when:
  - a redrawn, distorted, or regenerated product-icon mark
  - a per-product background colour or gradient applied to the icon container
  - wordmarks, photos, shadows, or gloss inside the icon
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Product icons — the marks that stand for a product in a launcher, a switcher, a nav, or a
card — render only from the approved product-icon family. A new mark enters the family by
being produced through the Icon Generator and verified before use, never by being drawn
ad hoc in a component.

The icon container is part of the mark. It does not take a per-product background colour
or gradient, and the icon itself carries no wordmark, photograph, shadow, or gloss.

## Rationale

Product icons are read as a set. Their value comes from being mutually consistent — the
same optical weight, the same corner treatment, the same container — so a user can tell
at a glance that two marks name two products in one family. A single ad-hoc icon breaks
the set for every icon beside it, which is why the control is L1 and why it governs the
container as well as the glyph.

Per-product background colours are the most common breach: they feel like a helpful
distinction and they destroy the family's coherence, because the container stops being
shared chrome and becomes per-product decoration.

## Why this is hybrid

**Static-check half.** Resolving an icon reference against the approved product-icon set
is mechanical, and so are two of the three failure conditions: a background colour or
gradient declared on an icon container, and a `box-shadow` or gloss gradient inside the
mark. That half is planned in #159 as `checks/identity-scan.py`; no script exists yet.

**Judgment half.** Whether an inline mark is a *product* icon — rather than a general
interface icon, which this control does not govern — is a reading of what the element
stands for. So is deciding that a mark is a regeneration of an existing family member
rather than a legitimately new one. The evaluator holds both.

## Passes when

- Every product icon resolves to a member of the approved product-icon family.
- New marks were produced through the Icon Generator and verified before entering the set.
- Icon containers share one treatment across products, with no per-product background
  colour or gradient.

## Fails when

- A product icon is drawn, traced, or regenerated in component source.
- An icon container takes a per-product background colour or gradient.
- A mark contains a wordmark, a photograph, a shadow, or a gloss highlight.

## Evaluator guidance

**Flag**:

- Inline-drawn marks used where a product icon belongs.
- Per-product container backgrounds or gradients in a launcher, switcher, or card grid.
- Product icons whose optical weight or corner treatment differs visibly from the rest of
  the family.

**Do not flag**:

- General interface icons — the icon set used for actions and navigation is not the
  product-icon family and is out of scope here.
- Logos and lockups, which IDN-1 governs.
- Third-party product icons supplied by that party.
- A documented waiver recording why a non-family mark is necessary — this is an L1 control
  with `waiver: documented`.
