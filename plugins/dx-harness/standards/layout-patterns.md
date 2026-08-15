# Pattern inventory (guidance, not controls)

This file is a judgment aid: the named-pattern inventory for Teacher & School
products. It sits beside the catalogue so that dx-design-critique and the
dx-design-pattern pass can suggest improvements, not just flag violations. It is
guidance, not controls. **Where a pattern here conflicts with a catalog control,
the control wins.**

Which register a surface belongs to, and what good looks like inside it, is
`quality-bar.md`'s Registers section. The layout read that used to sit here —
squint test, edge count, density map, grouping check — is that file's Design
quality Procedure, and the eight numbered principles that used to precede it
are now its pairings, thresholds, and the controls they always pointed at.

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
