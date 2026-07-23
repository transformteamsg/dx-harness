---
id: TYP-6
source: TFX-DS
title: "Running body text is held to a comfortable measure — roughly 45-75 characters per line (target 40-60), via a max-width in ch, not full-viewport paragraphs"
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [page, component]
verify: "Running-prose blocks carry a max-width measure cap (Tailwind `max-w-prose` / `max-w-[65ch]`); evaluator judges which blocks are running prose versus headings, tables, and data grids; checks/type-scan measure subcheck (planned)"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Hold running body text to a comfortable measure — the number of characters per line.
Target 40–60 characters, and treat roughly 45–75 as the acceptable band. Cap the width of
prose blocks with a `max-width` expressed in `ch` (Tailwind's `max-w-prose`, or an explicit
`max-w-[65ch]`), rather than letting paragraphs stretch the full viewport on a wide screen.

This is running prose only — instructional text, help copy, descriptions, empty states,
long-form guideline and content pages. Headings, table cells, data grids, and short labels
are out of scope; they have their own layout logic and are not held to a measure.

## Rationale

When a line of prose runs much past ~75 characters the eye has to travel too far to find
the start of the next line, and long blocks become a wall of text; much under ~40 and the
reader hyphenates and re-fixates too often. Both cost reading speed and comprehension. A
single `max-width` in `ch` scales the cap to the actual font, so the measure stays
comfortable across breakpoints without hard-coding pixel widths — Utility by Default, and
easy on the reader. It is a strong default with reasonable exceptions (a two-column layout,
a deliberately narrow aside), so it is L2.

## Passes when

- A paragraph of body copy sits inside a `max-w-prose` (or `max-w-[65ch]`) container, so it
  wraps at a comfortable measure regardless of viewport width.
- A long-form content or guideline page constrains its prose column rather than running
  text edge to edge on a wide monitor.
- A table, data grid, or heading spans its natural width — no measure cap needed, and none
  expected.

## Fails when

- A paragraph of running prose spans the full viewport width with no `max-width` cap, so on
  a wide screen each line runs well past ~75 characters.
- Body copy set in a container wide enough that its lines routinely exceed ~75ch.

## How to verify

**Hybrid.** A static scan (`checks/type-scan`, planned measure subcheck) can narrow the
surface — flag prose containers (paragraphs, prose wrappers) that carry no `max-width` and
sit in a full-width or wide parent. Until the subcheck exists, verify manually against the
rendered output at a wide viewport and label it "verified manually". The evaluator judges
the remainder: which blocks are genuinely running prose (and so need a measure cap) versus
headings, tables, and data grids (which do not).

## Evaluator guidance

**Flag:** a block of running prose whose lines run the full width of a wide viewport with
no measure cap — check the wide-viewport screenshot for paragraphs whose lines are clearly
longer than a comfortable measure.

**Do not flag:** headings, table cells, data grids, code blocks, or short labels; a
deliberately full-width layout element that is not running prose. This is L2 — a reasoned
deviation (e.g. a two-column reading layout, or a narrow aside below the target) takes an
inline `tfx-waive TYP-6 reason="…"`; "forgot to cap it" is not a reason.
