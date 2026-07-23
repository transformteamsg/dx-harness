---
id: CMP-6
source: TFX-DS
title: Data tables use the table pattern — semantic rows and headers, numeric columns right-aligned with tabular figures, text left-aligned, and a header that stays visible while scrolling
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [component, page]
verify: "Script asserts table/th semantics and right-aligned tabular numeric columns; evaluator judges header persistence, density, and that empty/loading states are designed (CMP-3)"
waiver: rationale
fails_when:
  - numeric columns centre- or left-aligned, or in proportional figures, so values do not line up (TYP-5)
  - a long table whose header scrolls out of view, leaving columns unlabelled
  - tabular data rendered as stacked cards or divs instead of a real table (A11Y-7)
  - a table that can be empty or slow has no designed empty or loading state (CMP-3)
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

When the content is tabular — rows of records compared across the same columns —
render a real table and follow the table pattern:

- **Semantics**: a `<table>` with `<th>` column headers (A11Y-7), not a grid of `<div>`s.
- **Alignment by data type**: numeric and quantitative columns (marks, counts, dates,
  currency) right-aligned with tabular figures (TYP-5) so digits line up for scanning
  and comparison; text columns (names, subjects) left-aligned; the header aligns with
  its column.
- **Persistent header**: for any table long enough to scroll, the header row stays
  visible (sticky header, or it repeats) so columns are never unlabelled.
- **Designed empty and loading states** (CMP-3): a table that can be empty says so
  ("No students in this class yet"), and one that loads over the network shows a
  loading state, not a blank frame.

Density follows LAY-5 (an entry-dense gradebook is legitimately tighter than a summary
table); row separation uses spacing or hairline dividers, not nested-card chrome
(SLP-4). Whether the data even belongs in a table — rather than cards or a list — is a
pattern-fit judgment (SLP-11): a table earns its rows when records are compared across
shared columns.

## Rationale

These are number-dense, table-heavy products: gradebooks, class rosters, attendance
grids, mark summaries. A table is a scanning instrument, and alignment is what makes it
work — a teacher reading down a column of 40 marks compares them at a glance only when
the digits line up and the header stays put. Centre-aligned numbers, proportional
figures, or a header that scrolls away each cost a beat of re-reading on every row,
which compounds across a full class. Faking a table with stacked cards or divs throws
away the row/column relationship screen readers and keyboard users rely on (A11Y-7) and
usually the alignment too. The table pattern is Utility by Default: the data holds
still so the teacher's attention can move.

## Passes when

- A gradebook with names left-aligned, a right-aligned **Mark** column in
  `tabular-nums`, a sticky header, and a "No marks entered yet" empty state.
- An attendance table whose **Present / Absent** counts are right-aligned and aligned
  with their headers, scrolling under a pinned header row.
- A short reference table (no scroll) with correct type-based alignment and semantic
  `<th>`s, no sticky header needed.

## Fails when

- A marks column centre-aligned or in proportional figures, so the ones and tens
  places wander down the column (TYP-5).
- A long roster whose header row scrolls off, leaving "which column is this?" once the
  teacher scrolls down.
- Rows of records built from `<div>`s with no `<table>`/`<th>` semantics (A11Y-7), so
  AT users lose the row/column model.
- A class list that can be empty rendering as a blank panel with no empty-state copy
  (CMP-3).

## How to verify

**Deterministic half** (`checks/` — planned): assert `<table>`/`<th>` semantics on
tabular data; flag numeric columns (cells matching a number pattern) that are not
right-aligned or lack `tabular-nums`. Until the script exists, verify against the
rendered table by hand and label it "verified manually".

**Judgment half:** the evaluator confirms the header stays visible while scrolling, the
density fits the task (LAY-5), and the empty/loading states exist and read clearly
(CMP-3). The evaluator also judges pattern fit — is a table the right pattern, or
should this be cards/a list (SLP-11)?

## Evaluator guidance

**Flag:** numeric columns that are not right-aligned or not tabular (digits fail to
line up in the screenshots); a scrolled table with no visible header; div/card "tables"
where a real table belongs; a table that can be empty or slow with no designed state.

**Do not flag:**

- A single-row or very short table with no scroll — no sticky header required.
- A deliberately left-aligned numeric column where the number is an identifier read as
  text (a class code, a phone number), not a quantity to compare — note the reason.
- Cards or a list used for genuinely non-tabular content (records not compared across
  shared columns) — that is correct pattern choice, not a table violation.

This is L2: a reasoned deviation (an identifier column, a deliberately card-based layout
for non-tabular records) takes an inline `tfx-waive CMP-6 reason="…"`.
