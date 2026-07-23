---
id: TYP-5
source: TFX-DS
title: "Numbers that align in columns or update in place use tabular figures (font-variant-numeric: tabular-nums)"
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [page, component]
verify: "Numeric columns/tables and dynamically-updating numbers carry font-variant-numeric: tabular-nums (Tailwind `tabular-nums`); evaluator judges which figures align or update; checks/type-scan tabular-nums subcheck (planned)"
waiver: rationale
fails_when:
  - a column of figures (grades, counts, marks) in proportional numerals that fail to align vertically
  - a live counter, timer, or total that reflows horizontally as its digits change
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Where numbers line up in columns or change in place, set
`font-variant-numeric: tabular-nums` (Tailwind's `tabular-nums` utility) so every
digit occupies the same advance width. This covers grade and mark tables, attendance
counts, score totals, and any live counter, timer, or running total. Proportional
figures stay fine for numbers that sit alone in running prose.

## Rationale

Inter ships proportional numerals by default — a `1` is narrower than a `0`. In a
column of marks that means the ones place wanders left and right down the page, and a
total that ticks from `9` to `10` shifts every character after it. Both read as
sloppy and both cost the teacher a beat of re-scanning. These are number-dense
products: a P5 Math teacher reading down a column of 40 marks the week reports are due
should be able to compare them at a glance, not realign her eye on every row. Tabular
figures are a one-property fix that makes the data hold still — Utility by Default,
and Craft at the surface (HIG: Craft).

## Passes when

- A marks/grades column or any numeric table cell carries `tabular-nums`, so digits
  align vertically regardless of value.
- A live counter, timer, or total (e.g. "23 marked / 40") uses `tabular-nums` and
  does not reflow as its digits change.
- A one-off number inside a sentence ("You have 3 classes today") uses the default
  proportional figures — no tabular treatment needed.

## Fails when

- A column of grades, counts, or marks renders in proportional numerals and the digits
  fail to align down the column.
- A dynamically-updating number (countdown, autosave count, vote tally) shifts the
  text around it horizontally as digits are added or removed.

## How to verify

**Hybrid.** A static scan (`checks/type-scan`, planned) can narrow the surface —
flag `<table>`/grid numeric cells and elements bound to a changing numeric value that
lack `tabular-nums`. Until the script exists, verify manually against the rendered
output and label it "verified manually". The evaluator judges the remainder: which
figures on the page actually align in a column or update in place, and therefore need
tabular figures, versus standalone numbers in prose that do not.

## Evaluator guidance

**Flag:** any column of figures or any number that visibly updates without
`tabular-nums` — check the screenshots for digits that fail to align down a column, or
ask whether a counter would jitter as it changes.

**Do not flag:** a single number embedded in a sentence; a number rendered in a
display face purely as a one-off hero stat where alignment is not in play. This is
L2 — a deliberate, reasoned deviation (e.g. a brand display numeral) takes an inline
`tfx-waive TYP-5 reason="…"`; "forgot" is not a reason.
