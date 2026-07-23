---
id: LAY-7
source: TFX-DS
title: The page has one primary focal region and its visual reading order matches the task's priority order
tier: L2
check: judgment
phase: [plan, verify]
applies_to: [page]
verify: "Evaluator applies the squint test (does the first-glance read land on the region the task needs done first?) and enumerates the page's distinct visual regions by weight; a page with two or more regions of comparable weight and no task reason for the tie, or whose first-read region is not the task's priority region, fails"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

A page has **one primary focal region**, and its visual reading order matches the task's
priority order. The eye lands first on the region the teacher needs to act on first;
everything else steps down in size, weight, or position. Two regions of comparable weight
with no task reason for the tie is a finding — as is a first-read that lands on secondary
content (a decorative summary card outranking the data-entry surface the task requires).

This promotes the "Compose, don't fill" prose (design skill, Phase 2) into a checkable
whole-page composition rule.

## Rationale

Composition is how a page explains itself before it's read. When the most important thing
reads first, the teacher's eye is doing the work the hierarchy intends; when two regions
compete, the reader hesitates, and the page feels assembled rather than composed. A page can
pass CMP-5 (one filled button) and SLP-6 (real type-scale steps) and still fail this — the
outcome (which region leads) is not guaranteed by either mechanism alone.

## How to verify

**Judgment.** No deterministic sub-check — "which region reads first" is not mechanically
scorable without a gaze model.

- **Squint test:** blur or step back from the 1280 screenshot — which region draws the eye
  first? Compare to the task's stated priority (Phase 1's primary task).
- **Region enumeration:** list the page's distinct visual regions (not DOM elements) and
  rank them by apparent weight — size, colour saturation, position (top/centre draws first),
  whitespace isolation. A finding is two or more regions within the same rank with no task
  reason. Align this read with `critique/layout-patterns.md` item 1 rather than inventing a
  separate procedure.

## Passes when

- The first-glance read lands on the task's priority region; everything else steps down.
- A page with exactly one region by design (a single-decision confirmation card).
- A deliberate two-panel comparison where the task itself is side-by-side comparison (no
  single priority region — the "no task reason" clause's exception).

## Fails when

- Two or more regions compete for first read with no task reason for the tie.
- The squint-test first-read lands on secondary content.
- The primary action's region is visually subordinate to decoration.

## Evaluator guidance

**Do not flag:** a deliberate multi-region comparison view where the task has no single
priority region; a single-region-by-design page; a reasoned deviation carrying an inline
`tfx-waive LAY-7 reason="…"` (L2).

**Deconfliction.** CMP-5 is a component rule (one filled button per view); this is the
whole-page composition outcome. SLP-6 is one mechanism (type-scale contrast) hierarchy can
use; this is the result. LAY-3 says which template shell to use; this says what leads inside
it once chosen.
