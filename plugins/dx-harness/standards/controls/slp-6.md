---
id: SLP-6
source: DX-DS
title: Adjacent type-scale steps differ by at least 1.10x; no flat hierarchy
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [page]
verify: "Adjacent steps used on the page differ by ratio >= 1.10; flag flat heading/subheading/body hierarchies"
waiver: rationale
fails_when:
  - heading/subheading/body at nearly the same size
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

## Requirement

Where a page sets a heading, a subheading, and body text, the sizes it actually uses must
step apart far enough to read as a hierarchy. Two adjacent steps in the ramp a page uses
must differ by at least the ratio in this control's title. A page whose heading,
subheading, and body all land within a few per cent of each other has no hierarchy, only
three paragraphs.

The control governs the ramp a page *uses*, not the scale it draws from. TYP-3 governs
which sizes are available; SLP-6 governs whether the page picked sizes far enough apart to
be legible as levels.

## Rationale

A flat ramp is the most common way a generated page loses its structure. Every level is
present in the markup, so heading semantics and accessibility checks pass, but a reader
scanning the page cannot tell a section title from a sentence. The failure is visual, not
structural, which is why no heading-hierarchy check catches it.

## Why the threshold is 1.10x

The threshold was 1.25x, and at that value this control contradicted TYP-3, which mandates
Tailwind's default scale. Seven of that scale's twelve adjacent pairs fall below 1.25x —
72/60, 36/30, 24/20, 20/18, 18/16, 16/14, and 14/12 — so a page could not satisfy both
controls at once. This repository proved it: `.prose` runs 30/24/20/16px, making its h2 to
h3 step 24/20 = 1.20x, which TYP-3 mandates and a 1.25x floor would fail.

1.10x clears TYP-3's whole scale. The tightest adjacent pair on it is 20px to 18px =
1.1111x, which sits above the floor with about 0.011 of headroom. That is deliberate but
narrow: the threshold is close to the ceiling of what is safe, and it cannot rise without
reopening the contradiction with TYP-3.

## Why this is hybrid

**Rendered-check half.** The measurement only exists once the page is rendered: what
matters is which sizes actually land adjacent in the visual hierarchy of a real page, and
a source scan cannot know that. A class may be declared and never used, and a size may be
inherited rather than declared. That half belongs to the rendered check layer and is built
in #155.

**Judgment half.** Whether two sizes are adjacent *steps* — rather than two unrelated
elements that happen to sit near one another — is a reading of the page's structure. The
evaluator holds that call.

## Passes when

- Heading, subheading, and body sizes on the page are separated by at least the control's
  ratio at every adjacent step.
- The ramp reads as levels at a glance, without needing weight or colour to carry the
  distinction alone.

## Fails when

- A heading and its subheading are within a few per cent of each other.
- Body copy and a section heading are the same size, distinguished only by weight.
- A page declares several heading levels that all render at one size.

## Evaluator guidance

**Flag**:

- Adjacent steps in the page's own ramp that fall below the control's ratio.
- A page where hierarchy is carried entirely by weight or colour because the sizes are
  flat.

**Do not flag**:

- Two elements at the same size that are not adjacent steps in a hierarchy — a caption and
  a data-table cell, two sibling labels, two body paragraphs.
- Deliberately equal sizes where the hierarchy is carried by position and grouping, with a
  recorded rationale — this is an L2 control with `waiver: rationale`.
- Sizes on TYP-3's mandated scale: TYP-3 decides which sizes are legal, and a page cannot
  be asked to leave that scale in order to satisfy this control.
