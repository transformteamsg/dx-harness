---
id: SLP-7
source: DX-DS
title: Spacing has rhythm — related items grouped tighter than unrelated ones
tier: L2
check: judgment
phase: [implement, verify]
applies_to: [page, component]
verify: "Spacing scan: related items grouped tighter than unrelated; flag a single spacing value used uniformly"
waiver: rationale
fails_when:
  - one spacing value used everywhere
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

## Requirement

Spacing must express grouping. Items that belong together sit closer than items that do
not, so a reader can see the structure before reading a word. A surface that applies one
gap value between every element has spacing but no rhythm.

A label sits nearer its field than the next field. A heading sits nearer the paragraph it
introduces than the paragraph above it. A card's rows sit nearer each other than the next
card.

## Rationale

Uniform spacing is what a generated layout produces, because a single gap value is the
safe default when nothing is known about which elements are related. The result passes
every token check — the values are on the scale (TOK-2) — while communicating nothing.
Proximity is the cheapest grouping signal there is, and dropping it forces the reader to
do the work instead.

## Why this is judgment

Grouping is meaning, not markup. Deciding that a label belongs to the field below it
rather than the field above it requires knowing what the elements *are*, and no property
of the source or the rendered page carries that. A check can see that one value is used
everywhere; it cannot see whether that is wrong, because a genuinely flat list of peers
is correctly spaced uniformly.

The evaluator is the enforcement. No static or rendered check covers any half of this
control, which is why it carries no accepted gap.

## Passes when

- Related items are visibly tighter than unrelated ones at each level of the surface.
- Section, group, and item spacing are distinguishable from each other.
- Spacing values come from the declared scale (TOK-2) and are chosen per relationship.

## Fails when

- One spacing value separates every element on the surface.
- A label is as far from its own field as from the next one.
- Section breaks and item breaks use the same gap, so sections do not read as sections.

## Evaluator guidance

**Flag**:

- A surface where every gap is the same value and the content has real grouping.
- Form fields whose labels are equidistant from their own control and the next one.
- Lists where item spacing equals group spacing, so groups disappear.

**Do not flag**:

- A genuinely flat set of peers — a single-level list, a row of equal chips — which is
  correctly spaced uniformly.
- Small surfaces with too few elements for grouping to exist.
- Spacing chosen deliberately against the default with a recorded rationale — this is an
  L2 control with `waiver: rationale`.
