---
id: CMP-4
source: TFX-DS
title: Every empty-state view unambiguously signals "no content exists" — distinct from loading, error, or permissions failure — through a heading, explanatory subtext, and the absence of loading chrome such as skeleton rows or spinners
tier: L1
check: hybrid
phase: [plan, implement, verify]
applies_to: [page, component]
verify: "Deterministic: confirm the rendered DOM contains neither a skeleton-row element nor a loading spinner when the empty-state heading is visible (manual until a script exists). Judgment: evaluator reads the heading + subtext pair and answers 'could a first-time user mistake this for a loading state or a permissions error?' — pass = no plausible confusion"
waiver: documented
fails_when:
  - a skeleton row, shimmer, or loading spinner is visible in the DOM alongside the empty-state heading
  - the heading/subtext pair reads as "still loading" or "you don't have access" rather than "nothing here yet"
  - an empty state ships with list chrome (row dividers, placeholder rows) that could be mistaken for a populated-but-loading list
detail: controls/cmp-4.md
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Every empty-state view must unambiguously signal "no content exists" to a teacher
encountering the surface cold. Two things carry that signal: a heading and explanatory
subtext that read as "nothing here yet" (not "still loading" and not "you don't have
access"), and the total absence of loading chrome — no skeleton rows, no shimmer, no
spinner — anywhere alongside that heading. An empty state that still carries leftover
loading affordances is not designed; it is a loading state that forgot to finish.

## Rationale

The triggering incident is not a defect but a gap: the Student Notes loop run's page
handled its own empty state well ("No notes yet" + explanatory subtext, no list chrome
that could read as loading) — the central done-criterion of that run's sprint contract —
yet no catalog control graded it directly; the pass rode entirely on CMP-3 (async states)
and evaluator judgment. The design-evaluator (opus), reading independently, confirmed the
same gap in its UNCOVERED section and recommended a ratchet proposal. The catalog carried
a reserved slot for exactly this proposal (`catalog.yaml` ~line 397) from 2026-06-16 until
this control filled it on 2026-07-08.

CMP-3 requires that loading/success/error states exist and are perceivable; it does not
require that the *empty* state, once reached, actually reads as empty rather than as an
interrupted loading state. CMP-4 names that specific failure mode so it is caught by rule,
not by whichever reviewer happens to notice the leftover skeleton row.

## Passes when

- The empty-state view shows a heading and subtext that clearly say "nothing here yet" (or
  the surface's equivalent plain-language phrasing) — not "loading…" and not a
  permissions-denied message.
- No skeleton row, shimmer placeholder, or spinner is present in the DOM while that heading
  is visible.
- Any list chrome present (dividers, empty row templates) reads as intentionally empty, not
  as a populated list still waiting for data.

## Fails when

- A skeleton row, shimmer, or loading spinner is visible in the DOM alongside the
  empty-state heading.
- The heading/subtext pair reads as "still loading" or "you don't have access" rather than
  "nothing here yet."
- An empty state ships with list chrome (row dividers, placeholder rows) that could be
  mistaken for a populated-but-loading list.

## Evaluator guidance

Two halves, one hybrid check:

1. **Deterministic sub-check** (manual until a script exists — the deterministic
   override-detection precedent CMP-7 set applies here too): read the rendered DOM at the
   moment the empty-state heading is visible. Confirm no skeleton-row element and no
   loading-spinner element render alongside it. Report "verified manually" and name what
   you checked when no script exists yet.
2. **Judgment sub-check**: read the heading and subtext together and ask, "could a
   first-time user mistake this for a loading state or a permissions error?" Pass = no
   plausible confusion; fail = any reasonable reading supports the loading-or-error
   interpretation. Quote the heading/subtext text you judged.

This control applies whenever a page or component can render an empty state — most often
lists, tables (CMP-6 already names "design the empty and loading states" as part of the
table pattern; this control is the general rule that bullet defers to), and dashboards with
no data yet.

## Do not flag

- A loading state itself, correctly labelled and still loading — CMP-4 only binds the
  *empty* state, once the loading transaction has actually completed with nothing to show.
- An empty state that omits subtext but whose heading alone is unambiguous (e.g. "No notes
  yet — the class hasn't received any"). The requirement is clarity, not a fixed heading +
  subtext template.
- A skeleton or spinner that renders only during the loading transition and is fully gone
  before the empty-state heading renders — the fail condition is co-presence, not that a
  loading pattern exists anywhere in the surface's code.
