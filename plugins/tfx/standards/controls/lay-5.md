---
id: LAY-5
source: TFX-DS
title: Density suits the task — neither cramped for data entry nor padded for scanning; extreme outliers in either direction are findings
tier: L2
check: judgment
phase: [verify]
applies_to: [page, component]
verify: "Evaluator judges density against the page type and task (a marks-entry form and a summary dashboard have legitimately different densities)"
waiver: rationale
fails_when:
  - a data-entry surface is too padded for efficient tab traversal
  - a reading or scanning surface is too cramped to scan without error
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Match information density to the task. A data-entry surface (a gradebook, a marks
form, an attendance grid) should be tight enough that the teacher can move and enter
quickly without acres of whitespace between fields. A reading or scanning surface (a
summary, a dashboard, a notice) should breathe enough to scan without error. Neither
extreme is universal — the right density depends on what the teacher is doing.

## Rationale

Density is not a style preference; it is a task fit. A marks form padded out like a
marketing page forces the teacher to scroll and tab through dead space on every row,
the week reports are due — friction that compounds across forty students. A reference
notice crammed to gradebook density is a wall the teacher mis-reads under time
pressure. Kind Utility means the surface's density serves the teacher's actual job,
which is why this control is judged against the page type, not a fixed metric.

## Passes when

- A marks-entry table is compact: rows close, tab order tight, minimal chrome between
  fields, so a full class enters fast.
- A summary dashboard is open: cards and figures spaced to scan in seconds.
- A settings page sits in between — grouped, readable, not cramped.

## Fails when

- A data-entry form so padded that entering a class of marks means constant scrolling
  and long tab jumps.
- A scanning surface so cramped that figures and labels run together and the teacher
  mis-reads.

## How to verify

**Judgment.** The evaluator judges density against the declared page type and task
from the screenshots — a marks-entry form and a summary dashboard legitimately differ.
There is no fixed spacing metric; the question is fit, not a number.

## Evaluator guidance

**Flag:** a data-entry surface too padded for efficient traversal; a reading surface
too cramped to scan without error. Name the surface and the task it serves.

**Do not flag:**

- Legitimate density differences between page types — a tight gradebook beside an open
  dashboard is correct, not inconsistent.
- A deliberately spacious surface where the task is genuinely low-volume reading.

**Deconfliction.** SLP-7 bans *uniform* spacing (everything at one value); LAY-5 asks
that density *fit the task* — they point in different directions and both can apply.
SLP-5 targets the identical-card-grid template; LAY-5 targets the density mismatch when
a template is applied to the wrong task. This is L2: a reasoned deviation takes an
inline `tfx-waive LAY-5 reason="…"`.
