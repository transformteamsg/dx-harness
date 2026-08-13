# Pattern inventory (guidance, not controls)

This file is a judgment aid: the named-pattern inventory for Teacher & School
products. It sits beside the catalogue so that dx-design-critique and the
dx-design-pattern pass can suggest improvements, not just flag violations. It is
guidance, not controls. **Where a pattern here conflicts with a catalog control,
the control wins.**

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
   `.dx/design.json` `layout_system`); N/A otherwise.
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

## Named patterns

The catalogue says what any layout must not break; the entries below say which
pattern fits which moment. Diagnosing "wrong pattern for this region" and
proposing the swap is dx-design-pattern's job. A swap must keep the same
information and functionality; adding or removing either is a dx-design-execute
intent, not a pattern finding.

### List vs cards

- Default to a list (or a table) for homogeneous records the teacher scans and
  compares: rows share one shape, digits line up (TYP-5), and density stays high
  where the task is scanning (LAY-5).
- Reach for cards only when each unit is genuinely interactive and self-contained
  (SLP-11) and the units differ enough that a shared row shape would hide their
  differences. A grid of identical cards is the default to avoid (SLP-5).
- Choose a table over a list when the teacher compares several attributes at
  once; choose a list when one attribute per record carries the decision.
- Swap signals: cards whose bodies are one line of text each (swap to a list);
  rows so unlike each other that the column headers lie (swap to cards).

### Master-detail

- Use master-detail when the teacher works through a collection and inspects one
  item at a time without losing their place: a list pane beside a detail pane,
  with the selected item visibly marked in the list.
- Side by side needs room for both panes to breathe at 1280. Below that, present
  the list first and the detail as its own view with a way back (the traversal
  itself is dx-design-flow's).
- The detail pane needs an empty state for "nothing selected yet" that names the
  next action; never a blank region.
- Swap signals: a list where every task means opening a separate full page and
  returning (swap to master-detail); a master-detail whose detail pane holds a
  single field (swap to inline editing in the list).

### Wizard presentation

- Use a wizard when steps genuinely depend on earlier answers and the task has a
  defined done state. A short independent form is one page, not a wizard; a
  complex multi-section task gets a page, not a modal (SLP-10).
- One decision per step. The step title names the outcome, not the mechanism.
  Progress is visible: which step, how many, what remains.
- The current step keeps one primary action (CMP-5); back and exit read quieter.
- Presentation only: how steps traverse, preserve drafts, and behave on
  interruption is dx-design-flow's.

### Empty-state structure

- Structure, in order: what this space is for, then one clear next action, then
  at most one line of supporting detail. Lead with the action, not the absence.
- The next action is the same control the teacher will use once content exists;
  an empty state that only names the emptiness is a dead end.
- Keep it calm: no oversized illustration that outranks the page's real
  hierarchy, and no card around static explanatory text (SLP-11).
- The wording inside an empty state is dx-design-copy's; this inventory judges
  only the structure.
