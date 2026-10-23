---
name: dx-design-critique
description: 'Grade an existing product page: capture it, score it against the standards catalogue and pattern inventory, and return ranked improvement suggestions. Use when the ask is to review, critique, audit, judge, improve, or polish a page without naming a change or a pass dimension, including "I don''t like it", "what''s wrong here", and re-audit asks ("re-check this page against the catalogue"). Propose-only: dx-design-execute builds accepted findings.'
---

# Critique an existing surface

You evaluate a page that already exists and you propose, never build. Critique never
edits the product: findings land in the annotated-evidence report and on the surface's
design ticket, and `dx-design-execute` builds accepted ones in a later run.
The normative source is the DX Design Standard; brand essence is **Kind Utility**,
useful first, kind at the surface. You never propose changes before you have seen and
judged the current state, and you never restyle a deliberate choice without asking.

**When the ask belongs to another skill:**

- A stated change or a new page goes to `dx-design-execute`.
- An ask that names one pass dimension goes to the matching pass: `dx-design-copy`, `dx-design-polish`, `dx-design-motion`, `dx-design-flow`, or `dx-design-pattern`.
- Grading a build's own output belongs to the design reviewer agent inside the `dx-design-execute` loop.

**Load first:** `../../../procedures/catalogue-mechanics.md`, then get the critique's
in-scope list with `python3 <harness>/scripts/in-scope-rules.py <repo-root> --phase
verify --product <product> --audience <audience>`, where `<harness>` is the absolute
path three levels above this file. Report the `Selection:` line to the person. When
the command exits with an error, stop before you capture or grade, and show the
error. Read a listed rule's detail file before you grade it. If the product repo has
a `DESIGN.md`, it calibrates colour/tone/motion — load it too.

When someone asks about or proposes a waiver, read `../../../standards/README.md` in that turn
— never answer from memory.

## Run it

1. **Critique, don't change.** Read and run `critique.md` (beside this file) end to end:
   capture the live surface, do the structured layout read against the pattern
   inventory (`../../../standards/layout-patterns.md`, beside the catalogue), write
   what works and should be preserved and what genuinely
   underperforms, then produce **up to five ranked suggestions**. Each suggestion carries
   its score — impact on the teacher's task (the ranking) and cost (S/M) — and names the
   control or layout pattern it serves. **Preserved is not waived:** a "preserve" call
   protects a deliberate choice from restyling, never its compliance from the checks —
   verify every preserved element against its controls (the L0 floor, A11Y-1 especially).
2. **Present the report.** Read and run `report.md` (beside this file) end to end:
   redline the findings onto crops of this run's captures, pass the mandatory
   contact-sheet self-check, assemble the self-contained HTML in the locked document
   structure, and publish it. The report is the default output of every critique run,
   not an opt-in; a person who asked for a whole-page review with no dimension named
   gets it without asking. Only critique produces it; the five passes never do.
3. **Record the findings and stop.** Write a Findings comment on the surface's design
   ticket, in the typed-heading format from `../../../procedures/design-tickets.md`
   (the Findings heading carries the date and this skill's name), and link the report
   URL from it. Then stop. Suggestions are offers, not a plan; do not implement
   anything. At this point every suggestion is pending: do not mark anything
   `accepted` or `not accepted` before the human replies in step 4.
4. **Approval happens on the ticket, later.** When the human replies with S-numbers,
   each approved S# marks the F-findings it fixes as `accepted`, and suggestions the
   reply does not pick are marked `not accepted` then, never silently dropped
   (`../../../procedures/design-tickets.md` sets both states only on the human's
   response); the suggestions
   table's Fixes column (S# to F#) is the mapping. `dx-design-execute` builds accepted
   findings in a later run, its plan gate still applies, and each accepted finding then
   links to the run record of the execute run that built it. Nothing is built inside a
   critique run.

Second person, plain language, Singapore English, no AI-writing tells — SLP-9 binds
this prose too.
