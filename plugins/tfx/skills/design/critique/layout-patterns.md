# Layout patterns (guidance, not controls)

This file is a judgment aid, like `implement-craft.md` — it distils what a good
layout looks like for Teacher & School products so the critique step (see
`critique.md`) can suggest improvements, not just flag violations. **Where a
pattern here conflicts with a catalog control, the control wins.**

Teacher & School products are the **product register**: dense, calm,
task-first professional tools — not marketing pages. The patterns below are
written for that register, not for a brand or marketing surface, which would
read looser and more spacious by design.

1. **One focal point.** The eye lands on the teacher's primary task first;
   everything else steps down in size, weight, or position. If two regions
   compete for attention, demote one — don't let both fight for the same
   visual weight (ties to CMP-5, one primary action; SLP-6, type-scale
   contrast).
2. **Structure from the task, not a template.** Choose the page template by
   what the moment needs (LAY-3), then order regions inside it by the task's
   own sequence — a marks-entry page reads entry-first, not summary-first;
   a review page reads context-then-decision.
3. **Group by proximity and shared edges, not boxes.** Related items sit
   closer together than unrelated ones (SLP-7, spacing rhythm); shared left
   edges do the aligning work a border would otherwise do (LAY-6). Reach for
   a card only when the unit inside it is genuinely interactive (SLP-11).
4. **Density by register.** Data-entry and comparison surfaces run dense —
   short row heights, tabular figures, minimal padding — because the task is
   scanning and comparing. Reading and decision surfaces run calmer, with
   more breathing room (LAY-5). Never apply one density everywhere on a page.
5. **Measure and rag.** Body text runs at most 80 characters wide, targeting
   about 66 (LAY-4). Avoid centred running text — it's harder to track line
   to line. Numbers in tables are right-aligned so digits line up (TYP-5).
6. **Whitespace is hierarchy.** Increase space *between* sections before
   reaching for a divider line, and reach for a divider before reaching for a
   box (SLP-4). Each escalation should earn its cost in visual noise.
7. **Alignment discipline.** Every region's edges should land on a small set
   of shared vertical lines. Count the distinct left edges at 1280 — more
   than about four usually means the composition is drifting (LAY-6). Grid
   coherence is checkable where the product declares a grid (LAY-1, via
   `.tfx/design.json` `layout_system`); N/A otherwise.
8. **Restraint is the taste.** When in doubt, remove: decoration that doesn't
   encode hierarchy or state is a cost, not a bonus. This is the impeccable
   principle — restraint as the core of taste — and also SLP-1..11's positive
   restatement: the controls describe what restraint looks like in practice.

## Reading a screenshot

Before judging a layout, work through this mini-procedure in order:

- **Squint test.** What reads first, second, third? Does that order match
  the task's actual priority, or is something incidental winning attention
  it hasn't earned?
- **Edge count.** How many distinct left/top alignment edges are visible at
  1280? More than about four signals drift (pattern 7).
- **Density map.** Which regions read dense, which read calm — and does that
  split match which parts of the task are data-entry versus decision-making
  (pattern 4)?
- **Grouping check.** Is relatedness encoded by space, a divider, or a box —
  and is that the cheapest encoding that still works (patterns 3 and 6)?
