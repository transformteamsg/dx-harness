---
artifact: quality-bar
version: "0.2-prototype"
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
> to make the *shape* reactable, then filled for [#112](https://github.com/transformteamsg/dx-harness/issues/112):
> all four criteria are now written end to end and the anchors are human-confirmed. Still open —
> [#113](https://github.com/transformteamsg/dx-harness/issues/113) owns the register model,
> [#114](https://github.com/transformteamsg/dx-harness/issues/114) the fold of
> `layout-patterns.md` and reviewer rubric §4, [#115](https://github.com/transformteamsg/dx-harness/issues/115)
> the plan/verify wiring. Delete this banner on adoption. Decisions recorded are listed at the bottom.

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
- A threshold here may sit *tighter* than a control's number — a 40×40 hit floor over
  **A11Y-4**'s 24×24, or 150–250ms inside **MOT-1**'s 100–300ms band. The tighter number is
  evidence for a grade, never a finding, and the row names the control it tightens.

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
The sentence quotes the pairing or threshold that decided the grade — a grade with no quoted
anchor is unfinished.

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

## Grades what

Appropriate distinctiveness — inverted for this register. On a daily-use professional tool,
unwarranted novelty is the more common failure than genericness: the tool's job is to disappear
into the task. The question is never "is this distinctive?" but "did every divergence from the
obvious build earn itself — and does anything demand to be remembered that shouldn't?"

## Procedure

Before judging, work through this in order:

- **Self-similarity test.** Work the brief through your own head. Where you land in the same
  place the surface did, that part is a default, not a choice. For a teacher tool, "any
  competent designer lands here" is often the correct answer — the grade turns on the
  divergences: name each one and ask what it earned.
- **Unchanged-product test.** Could an unrelated product ship this composition, interaction,
  and visual language unchanged? Some yes is right here; all yes means no decision was made
  anywhere.
- **Remove-one pass.** Before grading strong, name one element that could be removed. If
  removing it costs nothing, it was decoration, not a decision.

## Pairings

| We are | We are not |
| --- | --- |
| Familiar but not lazy | The template answer — the default any competent build lands on, no divergence examined |
| Distinctive but not novel | A custom pattern where a stack component exists |
| Specific but not branded | A surface an unrelated product could ship unchanged; or one element demanding to be remembered |
| Character only where idle | Character near consequences, or on a high-frequency path |

## By surface

| Surface | Reads as | Direction |
| --- | --- | --- |
| Data entry (marks, attendance, bulk edit) | Invisible | Zero novelty; the tool disappears into the task |
| Scanning / comparison (lists, tables) | Regular | A break in rhythm must carry meaning, never decorate |
| Reading (guidance, policy, a case note) | Measured | Typographic care is the allowed expression |
| Decision (approve, submit, escalate) | Sober | No character near consequences — **IDN-4**'s instinct, applied product-wide |
| Empty state | One moment of character | It must not outrank the next action |
| Overview / dashboard | Deliberate wayfinding | Semantic colour is design (**COL-2**); unmotivated multi-hue is the tell |

## Thresholds

| Anchor | Why it is there |
| --- | --- |
| No kicker or eyebrow label above a heading | Imported marketing furniture. The source that names it calls it a ban, not a default — no brief on this register earns it back. |
| No 1px border under a wide soft shadow — the ghost card | Elevation declared twice; commit to one. **SLP-3** and **SLP-4** cover other card tells, not this one. |
| No pulse animation on data that is not live | It claims liveness the data does not have — an honesty failure, not a style one. |
| No numbered markers (01 / 02 / 03) where order carries no information | Sequence as decoration; a real process or a typed timeline earns them. |
| The named AI looks are defaults, not choices: warm cream + high-contrast serif + terracotta accent; broadsheet hairlines at zero radius | They appear regardless of subject. **SLP-1** names only the purple/glow cluster; these are the other two. |

## Not this criterion's job

| Belongs to | Not here |
| --- | --- |
| **SLP-1..SLP-11** | Any generic-AI tell with a control id is a finding — cite it, do not fold it into the grade. |
| **CMP-1** | The mandate to use the stack component. Grade only whether the divergences that remain earned themselves. |
| **CMP-7** | Consistency with design-system defaults and sibling pages. |
| **IDN-1..IDN-4** | Lockups, product icons, tone registers, celebration boundaries. |
| Craft | Whether a divergence is well executed. Grade here only whether it was warranted. |

---

# Craft

## Grades what

Whether each decision was deliberate — browser furniture owned, states designed, motion that
respects how often it fires. These are the cheapest signals that a surface was built rather
than assembled, and the ones a generator skips most reliably.

## Procedure

Before judging, work through this in order:

- **Browser-surfaces pass.** Selection colour, caret colour, scrollbars on themed panes,
  focus-ring offset, underline offset and thickness, tabular figures where numbers align.
- **10% replay.** Replay motion at 10% speed in the browser's Animations panel. What feels off
  at 10% is what is subtly wrong at full speed.
- **State walk.** Default, hover, focus, active, disabled, loading, empty, error — at the three
  captured widths. The *existence* of loading, empty, error, and focus states belongs to
  controls (**CMP-3**, **CMP-4**, **A11Y-2**); grade hover, active, disabled, and the quality
  of all of them here.
- **Edge-content pass.** The longest realistic name, zero, one, many. Does the composition
  survive real data?

## Pairings

| We are | We are not |
| --- | --- |
| Finished but not fussy | Default selection, caret, and scrollbar clashing with the theme |
| Quiet but not static | Custom animation on a high-frequency interaction; or no feedback at all |
| Interruptible but not twitchy | A drawer that snaps when re-toggled mid-flight |
| Every state designed | Hover, active, disabled left as browser defaults |
| Precise but not laboured | Optical alignment ignored — an icon centred by the box, not the eye |

## By surface

| Surface | Reads as | Direction |
| --- | --- | --- |
| Data entry (marks, attendance, bulk edit) | Focused, instant | The focus ring is designed for the theme, not left default; feedback on every commit is immediate |
| Scanning / comparison (lists, tables) | Restrained | Row hover is a ≤150ms opacity or background change; no per-row choreography |
| Reading (guidance, policy, a case note) | Set with care | Selection colour, underline offset, and wrapping read as chosen |
| Decision (approve, submit, escalate) | Still | Motion at its minimum near consequences; the confirm moment never animates for effect |
| Empty state | Finished | The rarest state carries the same furniture as the busiest — no orphaned defaults |
| Overview / dashboard | One voice | One icon stroke weight per surface; one elevation strategy |

## Thresholds

| Anchor | Why it is there |
| --- | --- |
| High-frequency interactions get instant feedback or a ≤150ms opacity/background change | An animation on something triggered constantly charges its attention cost on every trigger. Expressive motion is for infrequent moments. |
| Most transitions 150–250ms on a tool surface; exits faster than entrances | Tightens **MOT-1**'s 100–300ms band for this register, as grade evidence only. The teacher is in flow; long feedback reads as latency. |
| CSS transitions for interactive state changes; keyframes only for one-shot sequences | A keyframe cannot be interrupted — a drawer re-toggled mid-flight snaps, and passes every static motion control while doing it. |
| Icon stroke matches adjacent text weight: 1.5px beside regular (400), 2px beside semibold (600) | A mismatched stroke reads as a different voice in the same sentence. **IDN-2** governs the product-icon family, not UI icon sets. |
| Hit areas at least 40×40 in dense desktop UI, and two hit areas never overlap | Tightens **A11Y-4**'s 24×24 floor for this register, as grade evidence only. At marks-grid density a mis-tap is a data error. |
| `text-wrap: balance` on headings (up to ~6 lines); `pretty` on short body | Cheap and register-neutral; the line cap prevents the common misapplication. |

## Not this criterion's job

| Belongs to | Not here |
| --- | --- |
| **MOT-1** / **MOT-2** / **MOT-3** | The duration band, motion tokens, and motion never carrying meaning alone. |
| **A11Y-2** | Focus visibility and keyboard reachability. Grade the ring's design, not its existence. |
| **A11Y-4** | The 24×24 target floor — the finding when broken. |
| **A11Y-5** | reduced-motion behaviour. |
| **TYP-5** | Whether aligned numbers use tabular figures — a control finding. |
| **CMP-3** / **CMP-4** | The existence of loading, success, error, and empty states. |
| **LAY-6** | Shared edges, and optical alignment where geometry misleads — the finding; grade the finer nudges it leaves open. |
| Design quality | The composition the states live in. |

---

# Functionality

## Grades what

Whether the flow completes the teacher's task — at the fortieth entry, through interruption,
and through failure. Dead ends, recovery cost, and repeat-user efficiency.

## Procedure

Before judging, work through this in order:

- **Flow-map walk.** Walk the flow against the plan's flow map: entry points, exits,
  interruption and resume. Is the teacher's work preserved through each? **CMP-8** owns the
  non-destructive-exit and preservation findings; grade the journey that remains.
- **Repeat-user pass.** Do the task as the fortieth entry, not the first. Is there a keyboard
  path? A batch path where one-at-a-time is natural to batch?
- **Failure walk.** For each failure class the flow can hit — bad input, no permission, not
  found, rate limit, server error — is there a designed state and a way back?
- **Persona lens.** Walk once as the relief teacher: unfamiliar class, no history, no time to
  learn the tool.

## Pairings

| We are | We are not |
| --- | --- |
| Complete but not exhaustive | A dead end — a state with no way back or no next action |
| Recoverable but not naggy | A confirmation where undo would do |
| Efficient at the fortieth entry | One-at-a-time where batch is natural; no keyboard path for a per-row task |
| Protective but not obstructive | Double submission possible; or confirm-everything |

## By surface

| Surface | Reads as | Direction |
| --- | --- | --- |
| Data entry (marks, attendance, bulk edit) | Keyboard-complete | Tab order matches reading order; submit disabled while pending; a bulk path for per-student tasks |
| Scanning / comparison (lists, tables) | Recoverable | "No results for this filter" differs from "nothing exists yet"; the filter clears in place |
| Reading (guidance, policy, a case note) | Resumable | Return preserves position |
| Decision (approve, submit, escalate) | Reversible first | Undo where recovery is safe; confirmation only where it is not |
| Empty state | Actionable | Each empty variety names its own next action — first use, cleared, no results, no permission read differently |
| Overview / dashboard | Navigable | Every tile leads somewhere; no dead-end stat |

## Thresholds

| Anchor | Why it is there |
| --- | --- |
| The submit control is disabled while its request is pending | Ten rapid clicks must not write ten attendance records — duplication is data harm, not polish. **CMP-3** requires the loading state; disabling during it is the ceiling. |
| Undo preferred over confirmation wherever recovery is safe | **CMP-2** accepts either; the preference is the ceiling. Confirmation taxes every use; undo taxes only mistakes. |
| A designed state per failure class: bad input, no permission, not found, rate limit, server error | **CNT-1** owns the wording of an error; nothing enumerates which failures get a state. |
| Any task repeated per row or per student has a keyboard accelerator | The teacher entering 40 marks is the power user. **A11Y-2** owns reachability; an accelerator is efficiency, and pointer-only repetition is a time tax ×40. |

## Not this criterion's job

| Belongs to | Not here |
| --- | --- |
| **CMP-2** | Destructive-action behaviour — consequences shown, undo or confirmation offered. |
| **CMP-8** | Non-destructive exits and work preservation — the finding when broken. |
| **CMP-3** / **CMP-4** | The existence of async and empty states. |
| **CNT-1** | Error wording — what happened and what to do next. |
| **A11Y-2** | Keyboard reachability of each control. Grade accelerators and batch paths here. |
| Craft | The visual quality of the states the flow passes through. |

---

# Decisions recorded

Items 1–7 are shape decisions committed by the prototype and confirmed on
[#110](https://github.com/transformteamsg/dx-harness/issues/110). Items 8–10 were settled on
[#112](https://github.com/transformteamsg/dx-harness/issues/112).

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
8. **Strong / acceptable / weak survives as the scale**, with three guards: acceptable is the
   expected result; the three-strong drift self-check; every grade quotes the anchor that
   decided it. Counted checklist bands were considered and rejected — counting misses turns
   the ceiling into a second controls file.
9. **One context axis for all four criteria** — the same six surface rows everywhere, so the
   file reads as one system. Per-criterion axes (interaction frequency for craft, exposure for
   originality) were rejected; frequency and flow detail live in each criterion's thresholds
   instead.
10. **A ceiling threshold may tighten a control's number, as grade evidence only**, and the row
    names the control it tightens (the 40×40 hit floor over **A11Y-4**, 150–250ms inside
    **MOT-1**). The alternative — keeping controlled ground out of the ceiling entirely — was
    rejected; it would have cost the two most register-specific craft rows.
