---
artifact: quality-bar
version: "1.0"
updated: "2026-08-15"
grades: [strong, acceptable, weak]
criteria: [design-quality, originality, craft, functionality]
registers:
  product:
    name: Teacher & School product surfaces
    default: true
  standards-site:
    name: The DX Design Standard website
---

# Quality bar (the ceiling)

`catalog.yaml` is the floor: what a surface must not break. This file is the ceiling: what good
looks like once nothing is broken. A surface can pass all 69 controls and still be forgettable —
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

- **At plan** — the builder (`dx-design-execute`) reads this file whole **before diverge**:
  directions are where a strong decision is born, and plan time is too late to shape them. The
  scoped modification loop reads the whole file too — one rule, no size judgment call. That is
  the point of the ceiling: calibration arrives before the work, not after it.
- **At the plan gate** — the plan summary table carries one quality-bar row: the register in
  effect, and the one decision this surface makes that should read as strong. Never a predicted
  grade; grading unbuilt work is fake.
- **At verify** — `dx-design-review` grades the four criteria against it, quoting the anchor it
  judged against, the way CNT-14 quotes the voice table. The verdict's QUALITY GRADES section is
  a four-line block — one line per criterion slug, the grade plus one sentence quoting its
  anchor — under a header line naming the register in effect and the dark-mode condition
  (graded / N/A). The register arrives in the reviewer's dispatch payload, resolved once by the
  builder; the reviewer does not re-resolve it.
- **The graded review** (`dx-design-critique`) reads this file and grades the four criteria in
  its report, reusing the same four-line block. The dimension passes read one named criterion —
  `dx-design-pattern` → design quality, `dx-design-polish` → craft, `dx-design-motion` → craft,
  `dx-design-flow` → functionality, `dx-design-copy` → none (the voice table already calibrates
  copy) — and any pass may
  quote any anchor as finding evidence, never as a violation. `dx-design-language` reads the
  register list, so it can write `DESIGN.md`'s `## Quality bar` section.
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

Self-check against drift: **if three of the four criteria in one grading read strong, or if you
have graded three surfaces in a row strong, you are grading the controls, not the ceiling.** A
three-point scale with no stated distribution drifts upward. The first check applies to a single
surface, so it is the one a reviewer can run without a history.

**Dark mode is a condition, not a criterion.** When the product supports dark mode and a dark
frame was captured, every criterion grades both frames. When the product has no dark mode (no
toggle, no re-rendering `.dark` layer), dark-mode checks are **N/A — product has no dark mode**.
Never grade a "dark-safe" pass from token resolution alone for a mode that never renders.

## Registers

A register is a class of surface with its own idea of what good looks like. Registers are
declared here; which one a product uses is declared in that product's `DESIGN.md`. Distinct
from the *tone register* (**IDN-3**), which calibrates one product's voice — a register here
classifies the surface, not the product.

| Register | Surfaces | What good looks like |
|---|---|---|
| `product` *(default)* | Teacher Workspace, CaseSync, Glow — dense, calm, task-first professional tools | Efficiency reads as care. The teacher is mid-task, often between classes. |
| `standards-site` | This repo's website — the standard read by humans | A reading surface. Measure, rhythm, and scannability outrank density. |

**The list grows only on evidence.** A new register enters when a real surface exists that
neither declared register fits — never ahead of one. Glow and CaseSync are not registers:
their warmth and restraint are per-product nuance, carried by `DESIGN.md`'s Essence and
Voice, which the reviewer reads beside this file.

**What a register may vary.** The **We are / We are not pairings are register-invariant** —
they are the portfolio's shared vocabulary, and two registers with different vocabularies
would be two files wearing one name. A register note may vary a criterion's **By-surface
rows and thresholds** only, opt-in on the specific anchor, written inline as
`[standards-site: …]`. An anchor with no note applies everywhere — the same convention as
`products:` in `catalog.yaml`: absent means global, never an empty list. A register that
seems to need different pairings is evidence the criterion's prose is wrong, not grounds
for a note.

**Selection.** `DESIGN.md` names at most one register per product repo, in a `## Quality bar`
section (json key `quality_bar`), one bullet: `- register: standards-site`. No declaration —
or no `DESIGN.md` at all — selects the default. `validate.py` checks a declared id exists
here. Variety inside a product is what the six By-surface rows handle; the register is
repo-wide. There are **no ceiling overrides**: this file never blocks, so there is nothing
to waive — a conflict that recurs between a product and an anchor is evidence to change
this file.

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
| Ordered but not monotonous | A rhythm you cannot feel, even where the values differ |
| Hierarchical but not shouty | Flat — nothing wins the first read; or three regions fighting over it |
| Aligned but not boxed | Drifting — every region on its own edge, or borders doing alignment's work |
| Deliberate but not fussy | Decoration that encodes neither hierarchy nor state |

## By surface

| Surface | Reads as | Direction |
| --- | --- | --- |
| Data entry (marks, attendance, bulk edit) | Dense, tabbable | Short rows, tabular figures, minimal padding; the next field is always reachable without scrolling |
| Scanning / comparison (lists, tables) | Dense, even | One row shape, digits right-aligned (**TYP-5**); rhythm regular enough that a break in it means something. Where a row carries a full sentence rather than a field, the sentence is held to the reading measure; a row of fields is not |
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
| Largest-to-smallest type size on the page around 2× or more | Adjacent steps can each clear **SLP-6**'s 1.25× and the page still read flat at a glance. This is the cheaper second read that catches it. The reverse also happens: a page can clear this read at 2.5× while three of its four adjacent steps miss **SLP-6**. This read does not stand in for the control. |
| Text in a bordered box: at least `max(4px, 0.3 × font-size)` between the text's line box and the border vertically, and `max(8px, 0.5 × font-size)` horizontally | Below this the text reads as pressed against the border, whatever the token said. Measure the gap, not the padding property: a 12px pill with a 16px line box and 2px padding leaves 3px of air and does not read airless. |
| Body text at least 16px from the viewport edge, 24–32px preferred | **LAY-2** covers 320px reflow, not gutters at comfortable widths. Text flush to the edge reads as unfinished. |
| About four distinct left edges at 1280, not more, counted on regions. Inline flow inside a region does not create an edge | Past four the composition is drifting even when every individual region is internally aligned. Counted mechanically the number is meaningless: a row of inline badges starts each one wherever the last ended, and a human reads none of them as an edge. |
| Concentric radius `outer = inner + padding`, unless padding exceeds ~24px | **TOK-3** states the formula with no upper bound. Past ~24px the layers are far enough apart that the eye stops relating them, and the math produces a wrong-looking outer radius. |
| Running text ragged-left, never centred | Each centred line starts somewhere new, so the eye's return sweep has no anchor. **LAY-4** fixes the measure; it says nothing about the rag. |

*[standards-site: the density row inverts. A reading surface is allowed — expected — to run
calmer than a marks-entry table, and "padded out" is judged against the measure, not the row
height.]*

## Not this criterion's job

| Belongs to | Not here |
| --- | --- |
| **LAY-7** | A page with two competing focal regions is a **finding**, not a weak grade. |
| **SLP-6** | Adjacent type steps below 1.25×. |
| **SLP-7** | Related items grouped no tighter than unrelated ones, and one spacing value used everywhere. |
| **LAY-5** / **LAY-6** | Density-to-task fit; grid coherence where a grid is declared. |
| **TOK-2** / **TOK-3** | Where a spacing or radius value came from. |
| Craft | Whether the *states* around this layout were designed. Grade only the composition here. |

Do not double-flag. If the miss has a control id, cite the control and move on — the grade
sentence should be about what is left after the controls are satisfied.

---

# Originality

## Grades what

Appropriate distinctiveness — inverted from the usual reading, on every register declared so
far. On a daily-use professional tool, and no less on the standard's own reading surface,
unwarranted novelty is the more common failure than genericness: the surface's job is to
disappear into the task. The question is never "is this distinctive?" but "did every
divergence from the obvious build earn itself — and does anything demand to be remembered
that shouldn't?"

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
| Decision (approve, submit, escalate) | Sober | No character near consequences — celebration restraint, applied product-wide |
| Empty state | One moment of character | It must not outrank the next action |
| Overview / dashboard | Deliberate wayfinding | Semantic colour is design (**COL-2**); unmotivated multi-hue is the tell |

## Thresholds

| Anchor | Why it is there |
| --- | --- |
| No kicker or eyebrow label above a heading. A badge that names the document's own state or version (`proposed`, `draft`, `v0.1`) is not a kicker: it carries information the heading does not, and there is nowhere else for the reader to learn it. A label that restates the section, the audience, or the value proposition is | Imported marketing furniture. The source that names it calls it a ban, not a default — no brief on this register earns it back. |
| No 1px border under a wide soft shadow — the ghost card | Elevation declared twice; commit to one. **SLP-3** and **SLP-4** cover other card tells, not this one. |
| No pulse animation on data that is not live | It claims liveness the data does not have — an honesty failure, not a style one. |
| No numbered markers (01 / 02 / 03) where order carries no information | Sequence as decoration; a real process or a typed timeline earns them. |
| The named AI looks are defaults, not choices: warm cream + high-contrast serif + terracotta accent; broadsheet hairlines at zero radius | They appear regardless of subject. **SLP-1** names only the purple/glow cluster; these are the other two. |
| Per-section or per-status colour doing wayfinding or status work is a colour system, not slop | Decorative (`aria-hidden`) wayfinding colour and Radix status colour (**COL-2**) are deliberate design. **SLP-1** names the purple/glow tell; flag unmotivated multi-hue decoration, never a deliberate system. |

## Not this criterion's job

| Belongs to | Not here |
| --- | --- |
| **SLP-1..SLP-11** | Any generic-AI tell with a control id is a finding — cite it, do not fold it into the grade. |
| **CMP-1** | The mandate to use the stack component. Grade only whether the divergences that remain earned themselves. |
| **CMP-7** | Consistency with design-system defaults and sibling pages. |
| **IDN-1..IDN-3** | Lockups, product icons, tone registers. Celebration boundaries around case data are a CaseSync DESIGN.md guardrail. |
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
| Scanning / comparison (lists, tables) | Restrained | Where the row itself is clickable, row hover is a ≤150ms opacity or background change; no per-row choreography either way |
| Reading (guidance, policy, a case note) | Set with care | Selection colour, underline offset, and wrapping read as chosen |
| Decision (approve, submit, escalate) | Still | Motion at its minimum near consequences; the confirm moment never animates for effect |
| Empty state | Finished | The rarest state carries the same furniture as the busiest — no orphaned defaults |
| Overview / dashboard | One voice | One icon stroke weight per surface; one elevation strategy |

## Thresholds

| Anchor | Why it is there |
| --- | --- |
| High-frequency interactions get instant feedback or a ≤150ms opacity/background change | An animation on something triggered constantly charges its attention cost on every trigger. Expressive motion is for infrequent moments. |
| Most transitions 150–250ms on a tool surface; exits faster than entrances *[product: the band is this register's; a reading surface may run slower]* | Tightens **MOT-1**'s 100–300ms band for the `product` register, as grade evidence only. The teacher is in flow; long feedback reads as latency. |
| CSS transitions for interactive state changes; keyframes only for one-shot sequences | A keyframe cannot be interrupted — a drawer re-toggled mid-flight snaps, and passes every static motion control while doing it. |
| Icon stroke matches adjacent text weight: 1.5px beside regular (400), 2px beside semibold (600) | A mismatched stroke reads as a different voice in the same sentence. **IDN-2** governs the product-icon family, not UI icon sets. |
| Hit areas at least 40×40 in dense desktop UI, and two hit areas never overlap *[product: 40×40; a reading surface is held to **A11Y-4**'s floor and no more]* | Tightens **A11Y-4**'s 24×24 floor for the `product` register, as grade evidence only. At marks-grid density a mis-tap is a data error. |
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
  learn the tool. *[standards-site: walk once as a first-time reader of the standard: no idea
  which controls exist, arriving from a cited control id.]*

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
| Scanning / comparison (lists, tables) | Recoverable | "No results for this filter" differs from "nothing exists yet"; the filter clears in place, and a filter combination worth keeping survives a reload and travels in a link |
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
[#112](https://github.com/transformteamsg/dx-harness/issues/112). Items 11–14 were settled on
[#113](https://github.com/transformteamsg/dx-harness/issues/113). Items 15–20 were settled on
[#114](https://github.com/transformteamsg/dx-harness/issues/114). Items 21–28 were settled on
[#115](https://github.com/transformteamsg/dx-harness/issues/115). Item 29 was settled on
[#147](https://github.com/transformteamsg/dx-harness/issues/147), which adopted this file.

1. **Markdown with YAML frontmatter, not a YAML index plus detail files.** The catalogue splits
   because 69 controls cannot all sit in context and the site renders the index raw. Four
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
11. **Two registers, growing only on evidence.** A third register enters when a real surface
    exists that neither fits — the same discipline that kept `marketing` out. Glow is a
    teacher tool (the encouragement layer, per its product page), not a student surface;
    its warmth is `DESIGN.md` nuance, not a register. An audience-based register list
    (mirroring `catalog.yaml`'s unused `audiences:` axis) was rejected as speculation.
12. **Pairings are register-invariant.** A register note may vary By-surface rows and
    thresholds only. The loose alternative — any anchor may carry a note — was rejected:
    it lets two registers grow different vocabularies inside one file. This forced the
    small register-neutral rewrite of Originality's opening line.
13. **Selection is one `- register:` bullet in a `## Quality bar` section of `DESIGN.md`**
    (json key `quality_bar`), at most one per repo; absent — section or file — selects the
    default. The word *register* stays despite the **IDN-3** tone-register collision;
    `CONTEXT.md` now separates the two senses.
14. **No ceiling overrides in `DESIGN.md`.** The ceiling never blocks, so there is nothing
    to waive. The reviewer reads Essence and Voice beside this file; a recurring conflict
    is evidence to change this file, not grounds for a per-product adjustment grammar.
15. **The eight numbered principles of `layout-patterns.md` are dropped, absorbed.** Each maps
    to a pairing, a procedure step, or a control (**LAY-7**, **SLP-4**, **SLP-7**, **LAY-4**,
    **LAY-6**). The one residue with no home — running text never centred — became a Design
    quality threshold rather than surviving as a ninth principle.
16. **`layout-patterns.md` survives, slimmed to the named patterns, under its own name.**
    List vs cards, master-detail, wizard presentation, empty-state structure — exactly
    `CONTEXT.md`'s definition of the pattern inventory. Swap guidance produces pass findings,
    so it cannot live in a file that never blocks; its header points here for registers and
    the layout read. Folding it in was rejected: ~55 more lines read whole at every plan, and
    a findings-producing section inside a grades-only file.
17. **Reviewer rubric §4 becomes a short stub** — about 5–8 lines: it names the four criterion
    slugs (`validate.py` checks this), points at this file, and requires each grade to quote
    the anchor that decided it. No criterion text is restated in the agent.
18. **The HIG lens and the Kind Utility line leave the reviewer.** HIG's useful ideas are
    already absorbed (Agency → the escapable-flow anchors, Delight → character only where
    idle); Kind Utility reaches the reviewer through `DESIGN.md`'s Essence, read beside this
    file (decision 14).
19. **Dark mode is a global condition beside the Grades section**, not a note under Craft and
    not reviewer-only text: it conditions all four criteria, and the planning agent must see
    it at plan time. The stub does not restate it.
20. **The semantic-colour carve-out folded in as an Originality threshold row**, naming
    **COL-2** and **SLP-1**. Keeping it as reviewer text was rejected — the planning agent
    would never see it; dropping the operational detail (aria-hidden wayfinding, Radix status
    colour) risked a reviewer flagging a deliberate colour system as slop.
21. **The builder reads the whole file before diverge**, not at the plan phase and not in the
    Load-first block. Directions are where a strong decision is born; loading at skill start
    was rejected because routing-only turns would pay the read for nothing.
22. **The scoped modification loop reads the whole file too.** One rule, no judgment call about
    change size — a padding tweak can still make a surface read worse. On-demand and skip-it
    variants were rejected as letting the builder decide what counts.
23. **Every proposing skill reads it**: `dx-design-critique` grades the four criteria in its
    report; the dimension passes read one named criterion (`dx-design-pattern` → design quality,
    `dx-design-polish` → craft, `dx-design-motion` → craft, `dx-design-flow` → functionality,
    `dx-design-copy` → none — the voice table already calibrates copy) and may quote any anchor
    as finding evidence, never as a
    violation; `dx-design-language` reads the register list to write `DESIGN.md`'s
    `## Quality bar` section. "Each pass decides" was rejected — two runs of one pass would
    calibrate differently.
24. **The plan gate gains one plan-table row, nothing more**: the register in effect and the
    one decision this surface makes that should read as strong. Predicted grades were rejected
    as fake — grading unbuilt work — and a free-text ceiling note as more words at the gate.
25. **QUALITY GRADES becomes a four-line block with a header line** — one line per criterion
    slug (grade + one sentence quoting its anchor); the header names the register in effect
    and the dark-mode condition. `dx-design-critique`'s report reuses the same block, so both graded
    surfaces stay in one format.
26. **The rubric §4 stub's slug list sits in a `dx-sync` fence**, enforced by `validate.py`'s
    existing fence-parity mechanism — this discharges the third check of decision 5 with no
    new code. `quality-bar.md` and `layout-patterns.md` also join `validate.py`'s
    `cross_ref_files` list (one line each).
27. **`implement-craft.md` survives as the build-time how-to, plus one pointer line** — the
    reviewer grades Craft against this file, so read that criterion's anchors as you build.
    Folding it in was rejected as new fold work outside the wiring ticket.
28. **A `DESIGN.md` register id that resolves to nothing falls back to the default and flags
    the drift** to the human; `validate.py` still fails the structural check where it can see
    the `DESIGN.md`. A blocking stop was rejected — the ceiling never blocks, so an error stop
    would give this file more power than it has. The builder resolves the register once and
    passes it to the reviewer in the dispatch payload; independent re-resolution was rejected
    because builder and reviewer could resolve a bad id differently.
29. **Eleven anchors were amended on adoption, all on evidence.** The evidence run in
    [#145](https://github.com/transformteamsg/dx-harness/issues/145) graded one known-weak
    surface against this file and recorded eleven anchors that could not decide, or decided
    wrongly, against a real frame. Their recorded findings are the only grounds on which any
    anchor may change, so all eleven were taken as written: the kicker threshold now admits a
    state badge; the two register-specific craft rows carry the register they were written
    for; the bordered-box threshold measures the gap rather than the padding property; the
    edge count says what an edge is; the SLP-7 boundary claims both halves of the control and
    its pairing stops restating it; the scanning rows reach prose measure, filter durability
    and the unclickable row; the persona lens carries a `standards-site` analogue; the 2×
    type read names both directions of the gap; and the drift self-check states both of its
    readings. No pairing vocabulary, no grade scale, and no surface row was changed.
