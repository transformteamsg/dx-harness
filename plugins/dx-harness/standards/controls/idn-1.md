---
id: IDN-1
source: DX-DS
title: Product lockups and logos render only from approved assets; no recreations
tier: L1
check: hybrid
phase: [implement, verify]
applies_to: [page]
verify: "Logo/lockup files resolve to the approved asset library; no inline redraws"
waiver: documented
fails_when:
  - rebuilt or distorted logo marks
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Every logo and product lockup on a page renders from the approved asset library. A mark is
referenced, never redrawn: no inline SVG path copied from a design file, no traced
approximation, no regenerated version, and no lockup assembled out of a wordmark and a
separate glyph.

The asset must also be used at its intended proportions. A stretched, recoloured, or
re-spaced mark is a recreation even when it started from the approved file.

## Rationale

A logo is the one element on a page whose correctness is not a matter of taste. Redrawn
marks drift — a path simplifies, a corner radius rounds, a lockup's spacing closes up —
and the drift compounds because each recreation is made from the last one rather than
from the source. Referencing the asset makes the mark update everywhere at once and makes
drift impossible rather than merely discouraged.

This is an L1 control: a waiver is available and must be documented.

## Why this is hybrid

**Static-check half.** Whether a logo reference resolves to a file in the approved asset
library is mechanically decidable: the check follows image and SVG references from page
source and compares them against the library's manifest. It can also find the strongest
recreation signal — a large inline SVG path in a component whose name identifies it as a
logo or lockup. That half is built in #159 as `checks/identity-scan.py`.

**Judgment half.** Whether an inline mark is a *recreation of this product's logo*, rather
than an unrelated illustration or icon, needs a human reading. So does distortion: a
lockup at slightly wrong proportions is a finding, and no threshold separates that from
legitimate responsive sizing. The evaluator holds both calls.

## Passes when

- Every logo and lockup is referenced from the approved asset library.
- Marks render at their intended proportions and clear space.
- Colour variants come from the library's own variants rather than from CSS filters
  applied to a single file.

## Fails when

- A logo is drawn inline in component source instead of referenced.
- A lockup is assembled from separate wordmark and glyph assets rather than used as the
  approved lockup.
- A mark is stretched, re-spaced, recoloured, or otherwise altered from the approved file.

## Evaluator guidance

**Flag**:

- Inline SVG paths in a component whose role is to render a logo or lockup.
- A mark whose proportions or spacing differ visibly from the approved asset.
- Recoloured marks achieved with CSS filters rather than an approved variant.

**Do not flag**:

- Icons and illustrations that are not logos or product lockups — IDN-2 governs product
  icons, and general iconography is out of scope for both.
- Third-party logos rendered from that party's own supplied asset.
- A documented waiver recording why a non-library rendering is necessary — this is an L1
  control with `waiver: documented`.
