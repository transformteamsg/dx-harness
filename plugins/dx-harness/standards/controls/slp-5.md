---
id: SLP-5
source: DX-DS
title: No icon-tile-above-heading feature-card template; no identical card grids as default layout
tier: L2
check: judgment
phase: [plan, implement, verify]
applies_to: [page]
verify: "Layout scan: no icon-tile-above-heading card template; no grid of identical cards as the default page layout"
waiver: rationale
fails_when:
  - the universal AI feature-card shape repeated in a grid
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

## Requirement

A page does not fall back to the universal generated feature-card shape — a small icon
tile, a short heading beneath it, two lines of body copy — repeated across an evenly
weighted grid, as its default way of organising content.

The control targets the *default*, not the shape. A card grid chosen because the content
is genuinely a set of peers is fine. A card grid chosen because it is what fills a page
is not.

## Rationale

The icon-tile-above-heading card in a three-across grid is the single most recognisable
output of a generated layout. It flattens every item to the same weight, which hides
what matters, and it survives into shipped product because it looks finished. The
control exists to force a decision about hierarchy rather than to ban a component.

## Why this is judgment

There is no mechanical signature that separates a legitimate grid of peers — a product
catalogue, a set of equally weighted dashboard entities, a directory — from the default
feature-card template. Both compile to the same markup. What distinguishes them is
whether the items really are peers and whether the page has any other hierarchy, and
both of those are readings of intent rather than properties of the source.

The evaluator is the enforcement here. No static or rendered check covers any half of
this control, which is why it carries no accepted gap: a judgment control is enforced,
not deferred.

## Passes when

- A card grid is used because its items are genuinely peers of equal weight.
- The page has a hierarchy that does not depend on the grid — a lead, a primary action,
  or a differentiated first item.
- Cards differ where the content differs, rather than being uniform by default.

## Fails when

- Every section of a page is an icon tile, a heading, and two lines of copy, repeated.
- A grid of visually identical cards is the page's only organising idea.
- Content with real differences in importance is flattened into equal cards.

## Evaluator guidance

**Flag**:

- A page whose primary structure is one grid of identical cards, where the items are not
  peers.
- The icon-tile-above-heading template used for content that has a natural lead or
  ordering.
- Card grids that repeat across several sections of the same page with no change in
  treatment.

**Do not flag**:

- Grids whose items genuinely are peers — search results, a product list, a set of
  equally weighted entities.
- A single card grid on a page that also carries other structure.
- Cards that share a shape but differ in content weight, size, or emphasis.
- A recorded rationale explaining why the uniform grid is the right reading of the
  content — this is an L2 control with `waiver: rationale`.
