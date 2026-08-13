---
artifact: quality-bar
version: "0.1-prototype"
updated: "2026-08-13"
grades: [strong, acceptable, weak]
criteria: [design-quality, originality, craft, functionality]
registers:
  product:
    name: Teacher & School product surfaces
    default: true
  standards-site:
    name: The DX Design Standard website
---

> **PROTOTYPE — not adopted.** Built for [#110](https://github.com/transformteamsg/dx-harness/issues/110)
> to make the *shape* reactable: filename, location, schema, and one criterion written end to
> end. **Design quality** below is complete; the other three are stubs showing the same six-block
> shape. The anchors themselves are illustrative — [#112](https://github.com/transformteamsg/dx-harness/issues/112)
> owns whether they are the right ones, [#113](https://github.com/transformteamsg/dx-harness/issues/113)
> the register model, [#114](https://github.com/transformteamsg/dx-harness/issues/114) the fold of
> `layout-patterns.md` and reviewer rubric §4, [#115](https://github.com/transformteamsg/dx-harness/issues/115)
> the plan/verify wiring. Delete this banner on adoption. Open decisions are listed at the bottom.

# Quality bar (the ceiling)

`catalog.yaml` is the floor: what a surface must not break. This file is the ceiling: what good
looks like once nothing is broken. A surface can pass all 70 controls and still be forgettable —
eleven of them are "no X" anti-slop rules, and passing them buys the absence of a mistake, not
the presence of a decision.

**Nothing here blocks.** A miss is evidence for a grade, never a finding. This is the whole
boundary between this file and the catalogue, and it holds in both directions:

- Anchors here never enter `BLOCKING` or `ADVISORY`. They produce the four quality grades and
  the sentence of reasoning under each.
- If a miss here is worth blocking on, that is **ratchet evidence for a control** — take it to
  `catalog.yaml` with the observed failure attached (authoring rule 4). Do not promote it here.
- Where a control already covers the ground, the control's finding is the output. This file
  grades what is left over: whether the surface that passed actually reads well. Each criterion
  names its own boundary under **Not this criterion's job**.

## How it is used

- **At plan** — the designing agent reads this file whole before building. That is the point of
  the ceiling: calibration arrives before the work, not after it.
- **At verify** — `dx-design-review` grades the four criteria against it, quoting the anchor it
  judged against, the way CNT-14 quotes the voice table.
- **Cited by quotation, never by id.** Anchors have no ids on purpose. An id-shaped reference in
  a finding would read as a control and send the reader to `catalog.yaml` to look for it. Quote
  the pairing or the threshold instead: *"reads airless — text pressed to its container edge."*

## Grades

Three grades per criterion: **strong / acceptable / weak**, each with one sentence of reasoning.

**Acceptable is the expected result.** It means: the surface passes its controls, reads in the
order the task needs, and carries no decision you would argue with. Most real surfaces land here
and should.

**Strong** means you can point at a decision — not an absence of mistakes — that made the surface
better than the obvious build, and say what it was. **Weak** means a teacher would hesitate, and
you can say where.

Self-check against drift: **if you have graded three surfaces in a row strong, you are grading
the controls, not the ceiling.** A three-point scale with no stated distribution drifts upward.

## Registers

A register is a class of surface with its own idea of what good looks like. Registers are
declared here; which one a product uses is declared in that product's `DESIGN.md`.

| Register | Surfaces | What good looks like |
|---|---|---|
| `product` *(default)* | Teacher Workspace, CaseSync, Glow — dense, calm, task-first professional tools | Efficiency reads as care. The teacher is mid-task, often between classes. |
| `standards-site` | This repo's website — the standard read by humans | A reading surface. Measure, rhythm, and scannability outrank density. |

**Absent = all registers.** An anchor with no register note applies everywhere; a register
variation is opt-in on the specific anchor, written inline as `[standards-site: …]`. This is the
same convention as `products:` in `catalog.yaml` — absent means global, and there is never an
empty list. Duplicating the whole file per register would guarantee drift.

`DESIGN.md` names one register per product. No declaration = `product`.

---

# Design quality

## Grades what

Hierarchy, spacing rhythm, alignment, reading order. Does the page read in the order the task
needs, and is the hierarchy doing work rather than decorating?

## Procedure

Before judging, work through this in order — it turns a feel into an observation:

- **Squint test.** What reads first, second, third? Does that order match the task's actual
  priority, or is something incidental winning attention it hasn't earned?
- **Edge count.** How many distinct left/top alignment edges are visible at 1280?
- **Density map.** Which regions read dense, which read calm — and does that split match which
  parts of the task are data entry versus decision?
- **Grouping check.** Is relatedness encoded by space, a divider, or a box — and is that the
  cheapest encoding that still works?

## Pairings

| We are | We are not |
| --- | --- |
| Dense but not cramped | Airless — text pressed to its container edge, rows with no room to breathe |
| Calm but not empty | Padded out — space standing in for structure that was never built |
| Ordered but not monotonous | One spacing value doing every job; a rhythm you cannot feel |
| Hierarchical but not shouty | Flat — nothing wins the first read; or three regions fighting over it |
| Aligned but not boxed | Drifting — every region on its own edge, or borders doing alignment's work |
| Deliberate but not fussy | Decoration that encodes neither hierarchy nor state |

## By surface

| Surface | Reads as | Direction |
| --- | --- | --- |
| Data entry (marks, attendance, bulk edit) | Dense, tabbable | Short rows, tabular figures, minimal padding; the next field is always reachable without scrolling |
| Scanning / comparison (lists, tables) | Dense, even | One row shape, digits right-aligned (**TYP-5**); rhythm regular enough that a break in it means something |
| Reading (guidance, policy, a case note) | Calm, measured | Measure at most 80 characters, targeting ~66 (**LAY-4**); more space between sections than inside them |
| Decision (approve, submit, escalate) | Calm, focused | One primary action (**CMP-5**); the consequence sits beside the action, not in a footer |
| Empty state | Inviting, quiet | Lead with the next action; no illustration outranking the page's real hierarchy |
| Overview / dashboard | Layered | One focal region (**LAY-7**); everything else steps down. Resist the equal-weight card grid (**SLP-5**) |

## Thresholds

Observations, with the mechanism that makes each one matter. A threshold without its reason does
not survive a waiver argument — and these are not waivable, because they do not block.

| Anchor | Why it is there |
| --- | --- |
| More space above a heading than below it | A heading belongs to what follows. Equal space orphans it and the eye groups it upward, into the section it just left. |
| At least two but not more than about three distinct spacing values in a region | One value everywhere reads as a template rather than a composition; past three the rhythm stops being perceptible as rhythm. |
| Largest-to-smallest type size on the page around 2× or more | Adjacent steps can each clear **SLP-6**'s 1.25× and the page still read flat at a glance. This is the cheaper second read that catches it. |
| Text in a bordered box: vertical padding at least `max(4px, 0.3 × font-size)`, horizontal at least `max(8px, 0.5 × font-size)` | Below this the text reads as pressed against the border, whatever the token said. |
| Body text at least 16px from the viewport edge, 24–32px preferred | **LAY-2** covers 320px reflow, not gutters at comfortable widths. Text flush to the edge reads as unfinished. |
| About four distinct left edges at 1280, not more | Past four the composition is drifting even when every individual region is internally aligned. |
| Concentric radius `outer = inner + padding`, unless padding exceeds ~24px | **TOK-3** states the formula with no upper bound. Past ~24px the layers are far enough apart that the eye stops relating them, and the math produces a wrong-looking outer radius. |

*[standards-site: the density row inverts. A reading surface is allowed — expected — to run
calmer than a marks-entry table, and "padded out" is judged against the measure, not the row
height.]*

## Not this criterion's job

| Belongs to | Not here |
| --- | --- |
| **LAY-7** | A page with two competing focal regions is a **finding**, not a weak grade. |
| **SLP-6** | Adjacent type steps below 1.25×. |
| **SLP-7** | Related items grouped no tighter than unrelated ones. |
| **LAY-5** / **LAY-6** | Density-to-task fit; grid coherence where a grid is declared. |
| **TOK-2** / **TOK-3** | Where a spacing or radius value came from. |
| Craft | Whether the *states* around this layout were designed. Grade only the composition here. |

Do not double-flag. If the miss has a control id, cite the control and move on — the grade
sentence should be about what is left after the controls are satisfied.

---

# Originality

*Stub — same six blocks. Procedure would be the **self-similarity test**: run the brief through
your own head; where you land in the same place, that part is a default, not a choice — then ask
whether each divergence earned itself. For this register the criterion is inverted, so the
pairings run toward "familiar but not lazy" and unwarranted novelty is the more common failure.*

# Craft

*Stub — same six blocks. Procedure would be the **browser-surfaces pass** (selection, caret,
scrollbar, focus ring, underline offset, tabular figures) plus replaying motion at 10% speed and
walking every state. Thresholds would carry motion restraint by interaction frequency.*

# Functionality

*Stub — same six blocks. Procedure would be walking the flow against the plan's flow map,
including the interruption and resume cases.*

---

# Open decisions — react to these

The prototype had to commit to an answer for each. Every one is reversible.

1. **Markdown with YAML frontmatter, not a YAML index plus detail files.** The catalogue splits
   because 70 controls cannot all sit in context and the site renders the index raw. Four
   criteria can. And the boundaries *are* the anchor — "dense but not cramped" only calibrates
   against "calm but not empty", so splitting criteria into separate files breaks the thing that
   makes them work. Frontmatter carries the only machine-legible parts: criterion slugs and
   register ids. **Risk:** the full file is roughly 550–600 lines once four criteria are real,
   read whole at every plan. If that is too heavy, the fallback is this file as the index
   (pairings + registers + grades) with procedures and thresholds in `quality/<criterion>.md`.
2. **Name and path: `standards/quality-bar.md`.** Sibling to `catalog.yaml` and
   `layout-patterns.md`. "Bar" carries the floor/ceiling metaphor; `ceiling.md` is opaque to a
   newcomer and `design-quality.md` collides with the criterion of that name.
3. **Criteria have slugs; anchors have no ids.** Citation is by quotation, exactly as CNT-14
   cites the voice table. Giving anchors ids would make ceiling findings indistinguishable from
   control findings in a report — the one confusion this whole artifact exists to avoid.
4. **Registers are top-level; variation is opt-in per anchor.** Mirrors `products:` in
   `catalog.yaml` — absent means global, never an empty list. Two registers declared; a third
   (`marketing`) is *not* declared because no such surface exists yet, and inventing one would be
   speculation.
5. **`validate.py` checks three things, and never the prose:** every control id cited here
   resolves in `catalog.yaml` (these cross-references are exactly what rots); every register id
   named in a `DESIGN.md` exists here; the reviewer's rubric §4 names the same four slugs this
   file declares. Schema-validating the prose would turn the ceiling into a controls file by the
   back door.
6. **Each criterion is a fixed six-block shape** — Grades what / Procedure / Pairings / By
   surface / Thresholds / Not this criterion's job. This is deliberately the control detail
   file's six-part discipline reused, so the artifact reads as a sibling of the catalogue rather
   than a new genre.
7. **The reading procedure moved in from `layout-patterns.md` and is now per-criterion**, not one
   procedure for the whole file — each criterion needs its own way of turning a feel into an
   observation. Whether the *named patterns* half of `layout-patterns.md` folds in too is
   [#114](https://github.com/transformteamsg/dx-harness/issues/114)'s call, not this ticket's.
