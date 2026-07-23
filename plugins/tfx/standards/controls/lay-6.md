---
id: LAY-6
source: TFX-DS
title: Shared edges align; optical alignment is used where geometry misleads
tier: L2
check: judgment
phase: [verify]
applies_to: [page, component]
verify: "Evaluator checks edge alignment in the 1280 screenshot; flags shared edges that do not align without a deliberate reason; distinguishes geometric from optical alignment (an icon optically centred but geometrically offset is correct)"
waiver: rationale
fails_when:
  - shared edges between sections or components do not align, with no deliberate reason
  - text or icon baselines and optical centres are visibly misaligned
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Align shared edges. Section and component edges that sit near each other should line
up to a common line — left edges of stacked blocks, the start of a heading and the body
beneath it, the right edge of a content column and the table inside it. Where strict
geometric alignment *looks* wrong, align optically instead: a play triangle, a single
chevron, or an asymmetric icon is centred by eye, not by bounding box. Optical wins
when the two disagree.

## Rationale

Misaligned edges are the quiet tell that a layout was assembled rather than composed —
the reader feels the wobble before they can name it, and it erodes the sense that the
surface was made with care (HIG: Craft). Alignment is most of what "tidy" means. The
optical clause matters because geometry and perception part ways for asymmetric shapes:
an icon centred by its bounding box reads as offset, so the craft move is to nudge it
until it *looks* centred. (A formal column grid — LAY-1 — is deferred until a product
grid is declared; until then alignment is judged against the surface's own visible
structure, not a declared grid.)

## Passes when

- Stacked sections share a left edge; headings and their body align to the same line.
- A "+" or play glyph inside a button is optically centred (geometrically nudged) so it
  reads as centred.
- A table's edges align with the content column that contains it.

## Fails when

- A section's left edge sits a few pixels off the section above it with no reason.
- An icon left geometrically centred so it visibly reads as offset toward its heavier
  side.
- Labels and values in a row whose baselines do not sit on a common line.

## How to verify

**Judgment.** The evaluator inspects the 1280 screenshot for edges that should align
and do not, and distinguishes a true misalignment from correct optical compensation.
No cross-element static check exists (alignment spans elements); this is an evaluator
read of the rendered frame.

## Evaluator guidance

**Flag:** shared edges that fail to align with no deliberate reason; baselines or
optical centres visibly off.

**Do not flag:**

- Deliberate optical alignment — an icon geometrically offset but optically centred is
  correct, not a bug.
- A deliberate, purposeful offset that signals hierarchy (an indented sub-item, a
  pulled-out callout) — intentional structure is a reason; unexplained drift is not.

**Deconfliction.** TOK-3 covers peer-radius consistency (per-element radius values);
LAY-6 covers edge/baseline alignment across the layout — a surface can pass TOK-3 (all
radii on scale) yet fail LAY-6 (edges wobble). LAY-1 (a declared column grid) is
deferred; LAY-6 stands on its own until it lands. This is L2: a reasoned deviation
takes an inline `tfx-waive LAY-6 reason="…"`.
