# Quality-bar evidence run: `/standards/catalog`

An evidence run for the prototype quality bar, filed on
[#145](https://github.com/transformteamsg/dx-harness/issues/145), child 1 of
[#144](https://github.com/transformteamsg/dx-harness/issues/144). It grades one known-weak
surface against the prototype so a mis-aimed anchor is found before nine readers and a verify
block depend on it.

**Nothing here blocks.** Every line below is a grade or a note toward one. No finding in this
record is `BLOCKING` or `ADVISORY`, no grade enters a verify verdict or an audit record, and no
anchor has an id. Anchors are cited by verbatim quotation, the way CNT-14 cites the voice table.

**Terminology** is the spec's glossary (section 14 of
[`docs/specs/2026-08-14-catalogue-reliability.md`](https://github.com/transformteamsg/dx-harness/blob/prototype/quality-bar-shape/docs/specs/2026-08-14-catalogue-reliability.md)
on `prototype/quality-bar-shape`): quality bar, register, anchor, accepted gap. Static check,
rendered check and honest-inert do not appear, because no check ran. These terms are not in
`CONTEXT.md` on either branch yet; the citation is to the spec until
[#147](https://github.com/transformteamsg/dx-harness/issues/147) adopts them.

**On quoted text.** Anchor quotations are byte-exact, so they carry the artifact's own em-dashes
and its `×`, `≤` and en-dash characters. Do not normalise them: a paraphrased anchor is not a
citation.

---

## The run

| Field | Value |
|---|---|
| Surface | `/standards/catalog`, rendered by `app/standards/catalog/page.tsx` (45 lines) and `components/catalog-browser.tsx` (275 lines) |
| Register | `standards-site`, stated by hand (see [Register](#register)) |
| Artifact read | `plugins/dx-harness/standards/quality-bar.md`, frontmatter `version: "0.2-prototype"`, blob `5071385900dc3c3ce5a9dff0ca511e89340b2ae6`, on `prototype/quality-bar-shape` at commit `7ad1478bd7be222c6898bbba49f7430e2f97c5f1`. Read whole, with every prototype mark left in place, including the PROTOTYPE banner and both stale "70 controls" lines. |
| Control count | **70** control ids in `plugins/dx-harness/standards/catalog.yaml` at `main` commit `91b7f7b4cf8c58ab64ef906ab7debc1cbcef2c17`. Measured, not quoted: IDN-4's removal at `890b9c3` is branch-only, so `main` still carries IDN-4 at `catalog.yaml:1003`. |
| Widths captured | 360 / 768 / 1280, the widths `plugins/dx-harness/agents/dx-design-review.md:39` already requires. Frames in [`2026-08-14-quality-bar-evidence-run/`](2026-08-14-quality-bar-evidence-run/). |
| Dark-mode condition | **N/A, product has no dark mode.** `app/globals.css:5` records that this site is light only with no `.dark` layer, and `:6` scopes the `dark` variant to `&:is(.dark *)`. Measured on the rendered page: no `.dark` ancestor exists anywhere in the document. Not inferred from token resolution. |
| Date and grader | 2026-08-14. Graded by the `dx-implement-issue` agent run on #145, for the design lead. |

### Frames

| Frame | What it shows |
|---|---|
| `catalog-primary-360.png` / `-768.png` / `-1280.png` | The primary state at each width. |
| `catalog-cards-1280.png` | The result region at 1280, so the repeated card shape is in evidence. |
| `catalog-empty-360.png` / `-768.png` / `-1280.png` | The zero-results state, reached by filtering to a count of zero. |
| `standards-compare-1280.png` | `/standards`, for the negative control. |

Two frames were captured and then dropped rather than filed: a chip-hover and a focus frame at
1280 came out byte-identical, because the scripted Tab presses landed on site chrome outside the
clipped region. The focus and hover evidence below is the measured computed style, not a frame.
Recapturing those two frames by hand is the one gap in the frame set.

### Register

`standards-site` (`quality-bar.md:103`: "This repo's website — the standard read by humans | A
reading surface. Measure, rhythm, and scannability outrank density."), stated by hand, because
nothing in the repo can select it.

The artifact's selection rule at `:119` to `:120` reads: "`DESIGN.md` names at most one register
per product repo, in a `## Quality bar` section (json key `quality_bar`), one bullet:
`- register: standards-site`. No declaration — or no `DESIGN.md` at all — selects the default."
There is no `DESIGN.md` at this repo's root; the only one is the template at
`plugins/dx-harness/docs/templates/DESIGN.md`. So the rule as written would select `product`, the
wrong register for a reading and scanning site surface. Recorded as a gap for whoever owns
register selection. This run creates no `DESIGN.md` to close it.

One consequence, stated plainly: `product` is the default register, and the portfolio's real
product surfaces (Teacher Workspace, CaseSync, Glow) have no code in this repo. **This run leaves
the default register ungraded.**

---

## QUALITY GRADES

The block below is the four-line shape `quality-bar.md:54` to `:59` describes, under a header line
naming the register in effect and the dark-mode condition, so #147 inherits a worked example.
Writing the shape into a note is not wiring: no agent file, no skill and no check changed.

```
QUALITY GRADES  register: standards-site  ·  dark mode: N/A (product has no dark mode)

design-quality: weak. The zero-results view gives the reader no route back to results, against the
  Empty-state direction "Lead with the next action; no illustration outranking the page's real
  hierarchy".
originality: strong. Five divergences from the obvious build each earn themselves, including
  filter-group boundaries that retain meaning when their groups wrap, so this is not "The template
  answer — the default any competent build lands on, no divergence examined".
craft: weak. No active state exists on any interactive element on the surface and the one
  near-disabled affordance still fires, which is "Hover, active, disabled left as browser
  defaults".
functionality: weak. A filter combination that yields zero results offers no way to clear it at
  any width, against "the filter clears in place".
```

**Drift self-check: did not fire.** One of four criteria graded strong. See
[Drift self-check](#drift-self-check) for what the check's own text says and why applying it
raised a finding.

---

## design-quality: weak

### Procedure walked

`quality-bar.md:136` to `:146`, in the order written.

**Squint test.** First read is the h1 "Control catalog" (30px, 600, Plus Jakarta Sans). Second is
the intro paragraph. Third is the filter region, which at 1280 is 162px tall, taller than the
first result card. That order matches the task. LAY-7 passes: one focal region, and the first read
does not land on secondary content.

**Edge count.** At 1280, inside `main`, a mechanical sweep of block boxes wider than 120px returns
nine distinct left positions. Only two of them are alignment edges: `x=304` (115 boxes, the
content column) and `x=321` (210 boxes, the card interior). The other seven (`380`, `383`, `386`,
`390`, `540`, `559`, `583`) are inline-flow positions inside the card's badge row, where each
inline-flex badge starts wherever the previous one ended. Read as a human reads it, the surface has
two alignment edges inside `main` plus the site chrome's own. The anchor "About four distinct left
edges at 1280, not more" is satisfied. That the mechanical count and the human count differ by
seven is recorded as a finding, not as a miss.

**Density map.** The filter region reads dense (24 chips at one weight over five wrap lines at
1280, six at 768, fourteen at 360). The result region reads even (70 cards, one shape, 12px gaps,
16px padding). The intro reads calm (measure 63ch at both 768 and 1280, capped by
`max-w-[720px]` at `page.tsx:13`). The split matches the task: the reader scans, and nothing here
is data entry.

**Grouping check.** Relatedness in the filter region is encoded by a divider glyph
(`components/catalog-browser.tsx:205`, `:216`, `:227`, `:238`: `<span aria-hidden className="mx-1
hidden text-border sm:inline">|</span>`). Measured at 1280: within-dimension gap 8px, chip-to-
divider gap 12px, so across-dimension gap is about 28px. That is the cheapest encoding. It works
only partially, because four of the five dimension groups straddle a wrap line: the category group
breaks across lines 1 and 2, the check-type group across 2 and 3, the product group across 3 and
4, the audience group across 4 and 5. Nothing labels any of the five dimensions.

### Observation and grade

The zero-results state renders the count line "0 of 70 controls" (`:252`) and then nothing, because
`:271` maps an empty array with no branch for it. There is no next action to lead with. The
existence of an empty-state heading and subtext is CMP-4's ground and is attributed there; leading
with the next action is not.

**Anchor (By surface, Empty state):** "Inviting, quiet | Lead with the next action; no illustration
outranking the page's real hierarchy".

**Grade: weak.**

The filter region remains a supporting grouping observation: its five dimensions have no labels,
and four groups wrap. The divider glyphs do still encode boundaries between those groups, so they
are not evidence for "Decoration that encodes neither hierarchy nor state" and do not decide this
grade.

### Anchors satisfied

| Anchor | Measured |
|---|---|
| "Largest-to-smallest type size on the page around 2× or more" | 30px / 12px = 2.5× |
| "More space above a heading than below it" | Group headings: 24px above, 8px below |
| "Body text at least 16px from the viewport edge, 24–32px preferred" | 41px at 1280, 24px at 768 and 360 |
| "Running text ragged-left, never centred" | Every `p`, `h1`, `h2`, `h3` and `li` in `main` computes `text-align: start` |
| "At least two but not more than about three distinct spacing values in a region" | Filter region: 8px within a dimension, about 28px across one. Result region: 12px between cards, 16px inside one, 24px between groups. |
| "About four distinct left edges at 1280, not more" | Two alignment edges inside `main` (see Edge count) |
| **By surface, Scanning / comparison:** "Dense, even \| One row shape, digits right-aligned (**TYP-5**); rhythm regular enough that a break in it means something" | One card shape, 70 times: padding `16px`, radius `8px`, border `1px rgb(228, 228, 231)`, no variants |
| **By surface, Reading:** "Calm, measured \| Measure at most 80 characters, targeting ~66 (**LAY-4**); more space between sections than inside them" | The reading block this row names, the intro at `page.tsx:13` to `:37`, measures 63ch at 1280 and 768 |
| Register note at `:186` to `:188`: "*[standards-site: the density row inverts. A reading surface is allowed — expected — to run calmer than a marks-entry table, and \"padded out\" is judged against the measure, not the row height.]*" | Applied. The intro's calm is not read as "Padded out"; the measure is 63ch, inside the note's own test. |

### A threshold missed, which the grade does not rest on

"Text in a bordered box: vertical padding at least `max(4px, 0.3 × font-size)`, horizontal at
least `max(8px, 0.5 × font-size)`", whose reason reads "Below this the text reads as pressed
against the border, whatever the token said."

Measured on the tier, check, category and status pills (`components/catalog-browser.tsx:135`,
`:143`, `:148`, `:153`): font-size 12px, so the threshold requires 4px vertical; actual padding is
2px (`py-0.5`). 216 boxes on the page miss it. But the pill's line box is 16px around a 12px glyph,
so the measured distance from the glyph box to the border is 3px, not 2px, and the frames show the
pills do not read airless. The threshold measures the padding box while its stated mechanism is the
optical distance to the glyphs. Recorded as a finding for #147, and the grade above does not rest
on it.

### Attributed to controls, and dropped from the grade sentence

Per the criterion's closing rule at `:201` to `:202`: "Do not double-flag. If the miss has a
control id, cite the control and move on — the grade sentence should be about what is left after
the controls are satisfied."

- **SLP-6.** Adjacent type sizes painted on the page are 12, 14, 16, 18 and 30px. Three of the
  four adjacent ratios miss SLP-6's 1.25× as it reads on `main`: 14/12 = 1.167, 16/14 = 1.143,
  18/16 = 1.125. The 18px lead paragraph (`page.tsx:24`) and the 16px paragraph directly under it
  (`:28`) are the pair SLP-6's `fails_when` describes as "heading/subheading/body at nearly the
  same size". The artifact's own boundary block already assigns this ground away: "**SLP-6** |
  Adjacent type steps below 1.25×."
- **LAY-4 and TYP-6.** The result cards carry no measure cap: card width 928px at 1280, so a
  control statement runs 87ch and its "Fails when:" line runs 101ch. LAY-4's `fails_when` includes
  "measure exceeds 80ch"; TYP-6's includes "body copy running well past ~75ch per line". Both are
  named by the Reading By-surface row, so both are the floor's.
- **TOK-3, as a question rather than a finding.** The pills are `rounded-full` inside an 8px-radius
  card, and TOK-3's `fails_when` includes "child radius larger than parent (non-concentric
  nesting)". Whether a pill counts as a nested container is TOK-3's call, not the ceiling's. The
  ceiling threshold "Concentric radius `outer = inner + padding`, unless padding exceeds ~24px" is
  therefore left unapplied here rather than graded either way.
- **TOK-2 passes.** Every spacing value painted in `main` is on the scale: 2, 4, 6, 8, 12, 16, 24,
  32px. `checks/token-audit.py` agrees.
- **SLP-7 passes**, and this matters to the grade. Related chips sit 8px apart, unrelated chips
  about 28px, so "related items grouped tighter than unrelated ones" holds, and more than one
  spacing value is in use, so `fails_when`'s "one spacing value used everywhere" does not fire. The
  floor is satisfied and the ceiling still finds the grouping unreadable. That is the ceiling doing
  the job it exists for.

### Procedure steps with nothing to observe

None. All four steps produced observations.

---

## originality: strong

### Procedure walked

`quality-bar.md:219` to `:229`, in the order written.

**Self-similarity test.** Worked the brief through first: a faceted list of 70 controls needs
search, filters, and one row per control. That is where any competent build lands, and for this
surface it is the correct answer. The grade turns on the divergences, so each is named:

| Divergence | Where | What it earned |
|---|---|---|
| Faceted counts on every chip, recomputed against the live query | `:62` to `:79` | The reader learns which filter is worth clicking before clicking it. Earns itself. |
| `/` focuses search from anywhere, unless the reader is already typing | `:29` to `:41` | A repeat reader's accelerator. Earns itself. Verified working. |
| Grouped-by-category view that collapses to a flat list once a category chip or search text is active | `:83` | Two reading modes for two tasks, browse and look up. Earns itself. |
| Per-control anchor ids with `scroll-mt-20` | `:125` | Every control is deep-linkable as `#A11Y-1`, which is how the catalogue gets cited. Earns itself. |
| Four `aria-hidden` `\|` divider glyphs | `:205`, `:216`, `:227`, `:238` | A lightweight boundary between filter dimensions. It retains some grouping meaning when a dimension wraps. Earns itself. |

**Unchanged-product test.** An unrelated product could ship this composition, interaction and
visual language nearly unchanged. Some yes is right here, and nothing on the surface demands to be
remembered.

**Remove-one pass.** The four divider glyphs are the cheapest candidate to remove. Removing them
would erase the only visible boundaries between the five filter dimensions at 768 and 1280, so the
removal carries a cost even though the dimensions wrap. No cost-free element was found.

### Observation and grade

The surface is not the template answer: it makes five divergences from the obvious build, each one
earns itself, and the remove-one pass finds no element whose removal costs nothing. The faceted
counts, search accelerator, browse/search mode switch, deep links, and filter boundaries are
specific decisions that improve the obvious build.

**Anchor (Pairings):** "Familiar but not lazy | The template answer — the default any competent
build lands on, no divergence examined". The surface sits on the "We are" side of it.

**Grade: strong.**

### Anchors satisfied

| Anchor | Measured |
|---|---|
| "No 1px border under a wide soft shadow — the ghost card" | Cards compute `box-shadow: none` and carry a 1px border. Elevation is declared once. |
| "No pulse animation on data that is not live" | No `animation` on any element on the surface |
| "No numbered markers (01 / 02 / 03) where order carries no information" | None present |
| "The named AI looks are defaults, not choices: warm cream + high-contrast serif + terracotta accent; broadsheet hairlines at zero radius" | Background `#fafafa` (neutral, not cream), sans throughout (Plus Jakarta Sans display, Inter body), card radius 8px (not zero) |
| "Per-section or per-status colour doing wayfinding or status work is a colour system, not slop" | The per-tier pill colours (`lib/tier-style.ts`) and the amber "Proposed" pill are status colour doing status work, and are read as a deliberate system, not flagged |
| **By surface, Data entry / Decision / Overview** | Not exercised, see [Surface rows not exercised](#surface-rows-not-exercised) |

**By surface, Scanning / comparison:** "Regular | A break in rhythm must carry meaning, never
decorate." The divider glyphs mark changes between filter dimensions, so the break carries meaning
even though wrapping weakens it.

### Procedure steps with nothing to observe

None. All three steps produced observations.

---

## craft: weak

### Procedure walked

`quality-bar.md:284` to `:295`, in the order written.

**Browser-surfaces pass.** Measured across every stylesheet the page loads:

| Surface | State |
|---|---|
| Selection colour | No `::selection` rule anywhere. Browser default. |
| Caret colour | No `caret-color` declaration anywhere. Browser default. |
| Scrollbars | No scrollbar rule and no `scrollbar-color`. Browser default, on a page 11,470px tall at 1280. |
| Focus-ring offset | Designed, not default: every interactive element on the surface carries `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)`, computing to `2px solid rgb(0, 100, 255)` at 2px offset. A11Y-2 owns the ring's existence; this is the ring's design, and it is good. |
| Underline offset and thickness | Chosen: `underline-offset-2` on the "Details" links (`:162`) and the `catalog.yaml` link (`page.tsx:31`), computing to 2px. Thickness left at `auto`. |
| Tabular figures | Present on the 24 chip counts (`tabular-nums` at `:114`). Absent on the two numbers that actually change: the count line at `:252` and the group-heading counts at `:263` both compute `font-variant-numeric: normal`. That is TYP-5's ground and is attributed there. |

**10% replay.** **Nothing to replay.** The surface's only motion is a 150ms `transition-colors` on
the chips (`:106`) and a 1200ms label revert on the copy button (`:88`), which is a text swap, not
an animation. No keyframes, no enter or exit sequence, nothing to slow down. Recorded as not
exercised, which is not the same as satisfied.

**State walk**, at 360, 768 and 1280:

| State | Found |
|---|---|
| default | Present |
| hover | Chips change text colour (`hover:text-foreground`). Copy buttons change border colour (`hover:border-border-strong`). The "Details" links have no hover treatment at all: the underline is already there at rest. Cards have no hover, correctly, because a card is not itself clickable. |
| focus | Present and designed. See the browser-surfaces pass. |
| **active** | **None.** No `:active` treatment on any of the 24 chips, the 70 copy buttons, or the 70 "Details" links. A press produces no acknowledgement until the state change lands. |
| **disabled** | **None exists.** Measured: zero elements carry `[disabled]` or `aria-disabled`. The one affordance that reads as disabled is a zero-count chip dimmed to `opacity-50` (`:110`), which is still fully clickable and leads to the zero-results dead end. |
| loading | Not exercised. The page is statically rendered from local YAML; there is no async transaction. CMP-3 owns the existence question and has nothing to own here. |
| empty | Present in the sense that a zero-results view renders. Its content is the count line and nothing else. CMP-4 owns the existence of a heading and subtext. |
| error | Not exercised. No failure path can reach this surface at runtime. |

**Edge-content pass.** Longest realistic control statement is 229 characters (CMP-4's own title),
which wraps to three lines inside a card and does not break the composition. Longest chip label is
"Outside the portfolio — name the product in the decision record (69)" at 420px, which forces the
audience dimension onto its own wrap line and so worsens the grouping problem design-quality
already graded. The composition survives real data; the filter row's grouping does not.

### Observation and grade

Two states are missing across every interactive element on the surface, and the only affordance
that looks disabled is not.

**Anchor (Pairings):** "Every state designed | Hover, active, disabled left as browser defaults".

**Grade: weak.**

Second, independent miss: **"`text-wrap: balance` on headings (up to ~6 lines); `pretty` on short
body"**, whose reason says "Cheap and register-neutral; the line cap prevents the common
misapplication." Register-neutral, so it decides here without any scope question. Measured: not one
element on the page computes a non-`auto` `text-wrap-style`, and `grep` over `app/`, `components/`
and `lib/` finds no `text-balance`, `text-pretty` or `text-wrap` utility anywhere in the repo.

### Anchors satisfied

| Anchor | Measured |
|---|---|
| "High-frequency interactions get instant feedback or a ≤150ms opacity/background change" | Chips: 150ms colour transition, exactly at the ceiling. Copy button: instant, no transition declared. Both sides of the "or". |
| "CSS transitions for interactive state changes; keyframes only for one-shot sequences" | Only CSS transitions are used. No keyframes on the surface. |
| **By surface, Empty state:** "Finished \| The rarest state carries the same furniture as the busiest — no orphaned defaults" | Attributed to CMP-4, see below |
| **By surface, Scanning / comparison:** "Restrained \| Row hover is a ≤150ms opacity or background change; no per-row choreography" | No per-row choreography exists. The row also has no hover, which is right here because the row is not clickable, and the row as written does not say so. Recorded as a finding. |

### Anchors with nothing to observe

- "Icon stroke matches adjacent text weight: 1.5px beside regular (400), 2px beside semibold
  (600)". **Not exercised.** The surface has no stroked icons. Its only glyphs are the text
  characters `⚑`, `→`, `✓` and `|`.
- "Most transitions 150–250ms on a tool surface; exits faster than entrances". Half applies: the
  one transition is 150ms, inside the band. There are no exits on the surface to compare against
  entrances, so the second clause is not exercised. This row also has a scope problem, recorded
  under [Anchors that could not decide](#anchors-that-could-not-decide).

### Attributed to controls, and dropped from the grade sentence

- **TYP-5.** The count line at `:252` is a live counter that reflows horizontally as its digits
  change (70, then 7, then 0), in proportional numerals. That is TYP-5's second `fails_when`
  verbatim, and Craft's boundary block already assigns it: "**TYP-5** | Whether aligned numbers use
  tabular figures — a control finding."
- **CMP-4.** The zero-results view has no heading and no explanatory subtext, which is what CMP-4's
  title requires of an empty-state view. Craft's boundary assigns the existence question away:
  "**CMP-3** / **CMP-4** | The existence of loading, success, error, and empty states." The Empty
  state By-surface row is therefore recorded and not used as grade evidence.
- **A11Y-2 and A11Y-4 both pass**, and A11Y-4's pass is what makes the 40×40 row interesting. See
  [The boundary rule, exercised in both directions](#the-boundary-rule-exercised-in-both-directions).

---

## functionality: weak

### Procedure walked

`quality-bar.md:354` to `:364`, in the order written.

**Flow-map walk.** Entry points: `/standards`, the sidebar, a `#CTL-ID` deep link, and the
`catalog.yaml` raw link. Exits: a control's own detail page, the raw YAML, the breadcrumb.
Interruption and resume: filter and search state lives only in component state. Measured, after
clicking a chip, the URL is still `/standards/catalog` with no query string. A reload, a shared
link, or a return from a detail page loses the whole filter combination. CMP-8 owns non-destructive
exits and work preservation, but its `applies_to` is `flow` and this surface writes nothing, so
there is no CMP-8 finding: what is lost is a reader's filter state, not their work.

**Repeat-user pass.** `/` focuses the search from anywhere, verified working, and it is the only
usable way in: the first twelve Tab stops on the page are all site chrome (skip link, header, then
the sidebar tree), so the search field is not reachable by Tab in fewer than thirteen presses. The
per-row task on this surface is "copy a control id", one button per card at `:128`. It is
keyboard-reachable, which is A11Y-2's ground, and it has no accelerator: reaching card 40's copy
button means tabbing past twelve chrome stops, 24 chips, a search field, and 39 cards' worth of
controls.

**Failure walk.** Of the five failure classes the threshold enumerates, exactly one is reachable on
this surface: bad input, in the form of a filter or search combination that matches nothing. It has
no designed state. No permission, not found, rate limit and server error are all unreachable, since
the page is statically rendered from a local YAML file.

**Persona lens.** The artifact names one persona, the relief teacher, and this surface is on the
`standards-site` register, where that persona has no analogue. Walked instead as a first-time
reader of the standard, and recorded as a finding that the step cannot be walked as written on this
register: the reader cannot tell what "L0" or "hybrid" or "Glow" selects on, because no dimension is
labelled, and a combination that yields nothing gives no way back.

### Observation and grade

Filtering to zero is a dead end. Measured at 360, 768 and 1280, the view prints "0 of 70 controls"
and nothing after it. There is no clear-filters affordance anywhere on the surface at any width:
the only way back from a five-chip combination is to click each active chip a second time, and the
only way to clear the search box is the browser's own native `×`.

**Anchor (By surface, Scanning / comparison):** "Recoverable | \"No results for this filter\"
differs from \"nothing exists yet\"; the filter clears in place". The first half of that row is
CMP-4's ground and is attributed there. The second half, **the filter clears in place**, is owned by
no control, and it is what decides this grade.

**Grade: weak.**

Supporting misses in the same criterion:

- **Pairings:** "Complete but not exhaustive | A dead end — a state with no way back or no next
  action." The zero-results view is both.
- **By surface, Empty state:** "Actionable | Each empty variety names its own next action — first
  use, cleared, no results, no permission read differently." The surface has exactly one empty
  variety and it names no next action. Naming a next action is beyond what CMP-4 requires, so this
  row stays as grade evidence.
- **Thresholds:** "Any task repeated per row or per student has a keyboard accelerator", whose
  reason reads "**A11Y-2** owns reachability; an accelerator is efficiency, and pointer-only
  repetition is a time tax ×40." The per-row copy has none.
- **Thresholds:** "A designed state per failure class: bad input, no permission, not found, rate
  limit, server error." One class is reachable and it has no designed state.

### Anchors with nothing to observe

- "The submit control is disabled while its request is pending". **Not exercised.** No submit, no
  request.
- "Undo preferred over confirmation wherever recovery is safe". **Not exercised.** No destructive
  action exists.
- **By surface, Reading:** "Resumable | Return preserves position". Not graded. Scroll restoration
  on return from a detail page was not tested at the captured widths, and this run does not claim a
  result it did not measure.

---

## The boundary rule, exercised in both directions

Spec section 3's rule: a ceiling threshold may sit tighter than a control's number, the row must
name the control it tightens, and the tighter number is grade evidence only. This surface exercises
it in both directions at once, which is why it was chosen.

| Layer | Anchor or control, quoted | Measured at 1280 | Measured at 360 | Verdict |
|---|---|---|---|---|
| Floor | **A11Y-4**: "Interactive targets are at least 24x24px (44px on mobile)" | Chips 26px tall, copy buttons 24px, "Details" links 24px, search field 34px | Chips and copy buttons 44px (`min-h-11`) | **Passes at both widths.** No finding. |
| Ceiling | "Hit areas at least 40×40 in dense desktop UI, and two hit areas never overlap" | 191 of 191 interactive boxes are under 40 in at least one dimension; zero pairs overlap | Three of 171 under 40 | **First clause missed at 1280, second clause satisfied.** Grade evidence only, and the row names A11Y-4 as required. |

The control passes and the ceiling row still has something to say, which is the boundary rule
working. What the run could not settle is whether that row applies to this register at all: see the
craft entry under [Anchors that could not decide](#anchors-that-could-not-decide). Because of that,
the craft grade above does not rest on this row.

---

## Anchors that could not decide

Each row carries the criterion slug, the anchor quoted verbatim, why it could not decide, and the
anchor text that would have decided it. No grade in this run rests on any of them.

| Criterion | Anchor, verbatim | Why it could not decide | Text that would have decided it |
|---|---|---|---|
| `originality` | Thresholds: "No kicker or eyebrow label above a heading", reason "Imported marketing furniture. The source that names it calls it a ban, not a default — no brief on this register earns it back." | The surface has a pill above its h1 (`app/standards/catalog/page.tsx:18` to `:20`) reading "⚑ Proposed seed — v0.1". By shape it is an eyebrow label. By content it is a status badge: it names the document's state and its version, which the heading does not, and CLAUDE.md makes the settled/proposed distinction load-bearing across the site. The anchor's stated mechanism (imported marketing furniture) does not reach it, and the anchor's wording does not exclude it. It cannot separate this badge from the thing it bans. | "No kicker or eyebrow label above a heading. A badge that names the document's own state or version (`proposed`, `draft`, `v0.1`) is not a kicker: it carries information the heading does not, and there is nowhere else for the reader to learn it. A label that restates the section, the audience, or the value proposition is." |
| `craft` | Thresholds: "Hit areas at least 40×40 in dense desktop UI, and two hit areas never overlap", reason "Tightens **A11Y-4**'s 24×24 floor **for this register**, as grade evidence only. At marks-grid density a mis-tap is a data error." (and identically, "Most transitions 150–250ms on a tool surface; exits faster than entrances", reason "Tightens **MOT-1**'s 100–300ms band **for this register** ...") | The reason says "for this register" and names no register. The artifact's Registers section at `:112` to `:114` requires register variation to be "written inline as `[standards-site: …]`", and states that "An anchor with no note applies everywhere". Neither row carries a note, so by the file's own rule both are global and both decide here. But decision 10 at `:455` to `:458` calls these "the two most register-specific craft rows", and both reasons argue from the `product` register ("At marks-grid density", "The teacher is in flow"). The artifact contradicts itself about the scope of its own two most consequential craft rows. | Either an inline note, `[product: hit areas at least 40×40 in dense desktop UI, and two hit areas never overlap]`, or the reason rewritten to name the register out loud: "Tightens **A11Y-4**'s 24×24 floor on the `product` register, as grade evidence only." The same edit applies to the 150–250ms row. |
| `design-quality` | By surface, Reading: "Calm, measured \| Measure at most 80 characters, targeting ~66 (**LAY-4**); more space between sections than inside them" | Measured at 1280, a control statement in a card runs 87ch and its "Fails when:" line runs 101ch. The Reading row names LAY-4, so the observation is already attributed to the floor. But this is not a reading block: it is one full sentence inside a scanning row, and the Scanning row says nothing at all about prose measure. Neither row reaches a scanning row that contains prose, so the ceiling cannot say whether 87ch is acceptable there or not. | Add to the Scanning / comparison Direction: "where a row carries a full sentence rather than a field, the sentence is held to the reading measure; a row of fields is not." |

**No criterion was left ungraded.** Every criterion had at least one anchor that did decide, so the
whole-criterion case that acceptance criterion 2 describes ("no grade is invented for that
criterion") did not arise: no grade was invented, and none was withheld. Three individual anchors
could not decide, and each is recorded above with the text that would have decided it. Recorded
this way rather than claimed as a match.

---

## Drift self-check

One of four criteria graded strong, so the check did not fire and no re-walk was needed.

Applying it raised a finding about the check itself. Its text at `quality-bar.md:85` reads: "**if
you have graded three surfaces in a row strong, you are grading the controls, not the ceiling.**"
That is a check across three gradings of three surfaces. Spec section 3 describes the same guard as
"**The three-strong drift self-check.** Three strongs in one grading is a signal the grader has
drifted", which is a check across four criteria inside one grading. A single grading of a single
surface cannot satisfy the artifact's wording at all. Recorded as a finding: the two readings are
different checks and only one of them can be applied at verify.

---

## Surface rows not exercised

The artifact uses one context axis for all four criteria, the same six By-surface rows everywhere.
For `/standards/catalog`:

| Surface row | Exercised |
|---|---|
| Data entry (marks, attendance, bulk edit) | **No.** The page writes nothing. |
| Scanning / comparison (lists, tables) | Yes, primary. 70 control cards, five filter dimensions, a search field. |
| Reading (guidance, policy, a case note) | Yes, secondary. The intro block at `app/standards/catalog/page.tsx:13` to `:37`. |
| Decision (approve, submit, escalate) | **No.** No consequential action exists on the page. |
| Empty state | Yes. The zero-results view, captured at all three widths. |
| Overview / dashboard | **No.** |

The three rows marked no are **not graded, and their silence is not evidence the anchors work.**
This run does not test them. Together with the ungraded `product` register, that is the largest
limit on what the grades above prove.

---

## Limits of this run

- **The dark-mode condition goes untested.** It records `N/A` truthfully because the product has no
  dark mode, which the artifact calls a truthful outcome, but that means no criterion was graded
  against a dark frame anywhere in this effort.
- **The `product` register goes ungraded.** It is the default register and its surfaces have no code
  in this repo.
- **Three of six By-surface rows go unexercised**, as listed above.
- **One surface, one grading.** Nothing here says how the anchors behave on a data-entry or decision
  surface, which is where most of the `product` register lives.
- **Two frames were dropped** rather than filed, as noted under [Frames](#frames).

---

## What the run found about the floor

Not the ceiling's business, and not acted on here. `catalog.yaml` is unchanged by this run and no
control's fields, thresholds or labels were touched. Recorded because the surface was chosen on the
premise that it is control-clean as far as the repo can show, and that premise did not survive the
grading.

| Control | What the surface does | Why CI passes it anyway |
|---|---|---|
| **SLP-6** | Three of four adjacent type ratios are 1.167, 1.143 and 1.125, against the 1.25× the control requires on `main` | SLP-6 is `deterministic` with no script wired. Spec section 11 already rules that SLP-6's threshold drops to 1.10×, which this page would clear on all four ratios. **This run is a real surface confirming that correction.** |
| **LAY-4**, **TYP-6** | The card column has no measure cap: 87ch statements and 101ch fail-condition lines at 1280 | Neither has a running script (`checks/layout-scan.py` has no caller; `type-scan.py`'s measure subcheck is planned). Whether a one-sentence control statement counts as running prose is exactly the judgment the LAY-4 / TYP-6 merge question in spec section 15 turns on, so this is input to that question. |
| **CMP-4** | The zero-results view has no heading and no explanatory subtext, which the control's title requires | `hybrid`, evaluator-enforced, and no evaluator has read this page. Separately: none of CMP-4's three `fails_when` bullets describes "no empty state at all", because all three presuppose one exists. That is rule-proposal evidence with an observed failure attached, for whoever takes it to `catalog.yaml`. It is not taken there by this run. |
| **TYP-5** | The count line is a live counter in proportional numerals that reflows as its digits change | `hybrid`. The chips next to it do use `tabular-nums`, so the miss is inconsistency, not ignorance. |
| **TOK-3** | `rounded-full` pills nested inside an 8px-radius card | Open question, not a claim. Whether a pill is a nested container is TOK-3's call. |

**The conclusion the epic needs from this table:** the surface passes every script this repo runs
and still misses at least four controls, all of them in the unscripted or evaluator-only part of the
floor. A ceiling cannot be evidence-run against this repo's surfaces on the assumption that a green
`pnpm check:python` means the floor is satisfied. Four of the five rows above had to be lifted out
of the grade sentences by hand.

---

## Findings for #147

Each finding is the anchor as written, the proposed replacement text, and the criterion slug and
block it sits in. No severity label on any of them, because the quality bar never blocks.
`quality-bar.md` is left byte-identical by this issue.

### 1. The kicker threshold cannot see a status badge

- **Slug and block:** `originality`, Thresholds.
- **As written:** "No kicker or eyebrow label above a heading".
- **Proposed:** "No kicker or eyebrow label above a heading. A badge that names the document's own
  state or version (`proposed`, `draft`, `v0.1`) is not a kicker: it carries information the heading
  does not, and there is nowhere else for the reader to learn it. A label that restates the section,
  the audience, or the value proposition is."

### 2. Two craft rows say "for this register" and name none

- **Slug and block:** `craft`, Thresholds (two rows).
- **As written:** "Tightens **A11Y-4**'s 24×24 floor for this register, as grade evidence only." and
  "Tightens **MOT-1**'s 100–300ms band for this register, as grade evidence only."
- **Proposed:** name the register in each reason, or carry the register in an inline note as the
  Registers section at `:112` to `:114` requires: `[product: hit areas at least 40×40 in dense
  desktop UI, and two hit areas never overlap]`. Decision 10 at `:455` calls these the two most
  register-specific craft rows while neither row is scoped, and the artifact's own rule reads an
  unnoted anchor as global.

### 3. The bordered-box threshold measures the wrong box

- **Slug and block:** `design-quality`, Thresholds.
- **As written:** "Text in a bordered box: vertical padding at least `max(4px, 0.3 × font-size)`,
  horizontal at least `max(8px, 0.5 × font-size)`".
- **Proposed:** "Text in a bordered box: at least `max(4px, 0.3 × font-size)` between the text's
  line box and the border vertically, and `max(8px, 0.5 × font-size)` horizontally." A 12px pill
  with a 16px line box and 2px padding puts 3px between glyph and border and does not read airless,
  yet fails the padding arithmetic 216 times on this one page.

### 4. A pairing restates SLP-7's fail condition, and the boundary block claims only half of it

- **Slug and block:** `design-quality`, Pairings, and the Not-this-criterion's-job row for SLP-7.
- **As written:** Pairing "Ordered but not monotonous | One spacing value doing every job; a rhythm
  you cannot feel", and boundary "**SLP-7** | Related items grouped no tighter than unrelated ones."
- **Proposed:** extend the boundary row to both halves of the control, "**SLP-7** | Related items
  grouped no tighter than unrelated ones, and one spacing value used everywhere", and reword the
  pairing to the ground the control does not own: "Ordered but not monotonous | A rhythm you cannot
  feel, even where the values differ." SLP-7's `fails_when` on `main` is "one spacing value used
  everywhere", which the pairing currently restates almost verbatim, so the artifact invites the
  double-flag it forbids two paragraphs later.

### 5. No anchor reaches prose inside a scanning row

- **Slug and block:** `design-quality`, By surface, Scanning / comparison.
- **As written:** "Dense, even | One row shape, digits right-aligned (**TYP-5**); rhythm regular
  enough that a break in it means something".
- **Proposed:** add "Where a row carries a full sentence rather than a field, the sentence is held
  to the reading measure; a row of fields is not." Measured: 87ch statements and 101ch fail-condition
  lines at 1280, with the Reading row's 80ch pointing only at LAY-4 and the Scanning row silent.

### 6. The edge count cannot be counted without saying what an edge is

- **Slug and block:** `design-quality`, Thresholds.
- **As written:** "About four distinct left edges at 1280, not more".
- **Proposed:** "About four distinct left edges at 1280, not more, counted on regions. Inline flow
  inside a region does not create an edge." A mechanical sweep of this surface returns nine
  positions inside `main` where a human reads two, and seven of the nine are inline-flex badges
  starting wherever the previous badge ended.

### 7. The drift self-check has two incompatible readings

- **Slug and block:** file-level, the Grades block at `:85`.
- **As written:** "if you have graded three surfaces in a row strong, you are grading the controls,
  not the ceiling."
- **Proposed:** say which check it is, and if both are wanted, say both: "If three of the four
  criteria in one grading read strong, or if you have graded three surfaces in a row strong, you are
  grading the controls, not the ceiling." Spec section 3 describes the first; the file states only
  the second; the wiring will need whichever one a reviewer can actually apply to a single surface.

### 8. The persona lens has no analogue on the standards-site register

- **Slug and block:** `functionality`, Procedure.
- **As written:** "**Persona lens.** Walk once as the relief teacher: unfamiliar class, no history,
  no time to learn the tool."
- **Proposed:** carry the persona per register, in the inline note form the artifact already uses:
  "**Persona lens.** Walk once as the relief teacher: unfamiliar class, no history, no time to learn
  the tool. *[standards-site: walk once as a first-time reader of the standard: no idea which
  controls exist, arriving from a cited control id.]*"

### 9. No anchor covers whether a scanning surface's filter state survives

- **Slug and block:** `functionality`, By surface, Scanning / comparison.
- **As written:** "Recoverable | \"No results for this filter\" differs from \"nothing exists yet\";
  the filter clears in place".
- **Proposed:** add "and a filter combination worth keeping survives a reload and travels in a
  link." Measured: after filtering, the URL carries no state, so a reader cannot share or restore a
  filtered view. Nothing in the artifact reaches this today.

### 10. The row-hover direction presumes a clickable row

- **Slug and block:** `craft`, By surface, Scanning / comparison.
- **As written:** "Restrained | Row hover is a ≤150ms opacity or background change; no per-row
  choreography".
- **Proposed:** "Restrained | Where the row itself is clickable, row hover is a ≤150ms opacity or
  background change; no per-row choreography either way." On this surface the row is not clickable
  and correctly has no hover, and the row as written reads as a requirement it does not mean.

### 11. The 2× type threshold's reason names only one direction of the gap

- **Slug and block:** `design-quality`, Thresholds.
- **As written:** "Largest-to-smallest type size on the page around 2× or more", reason "Adjacent
  steps can each clear **SLP-6**'s 1.25× and the page still read flat at a glance. This is the
  cheaper second read that catches it."
- **Proposed:** add the inverse, which this run hit: "The reverse also happens: a page can clear this
  read at 2.5× while three of its four adjacent steps miss SLP-6. This read does not stand in for the
  control." Measured on this surface: 30/12 = 2.5× satisfied, and 18/16 = 1.125 against SLP-6.

---

## Negative control: `components/compare.tsx`

Capped, as the issue requires, at four grade lines and one boundary note. Rendered at `/standards`,
frame `standards-compare-1280.png`. This is a confirmation pass, not a graded run.

```
design-quality: not gradeable. Every composition miss in the frame carries a control id on its
  face (SLP-1 gradient palette, SLP-2 gradient text, SLP-4 nested cards, SLP-6 flat hierarchy),
  so "Do not double-flag" empties the grade sentence.
originality: not gradeable. Originality's boundary sends "Any generic-AI tell with a control id"
  to the control, and every tell in the panel has one, including CMP-5 and SLP-9.
craft: not gradeable. The panel's whole visual language is quarantined by inline dx-waive markers
  (`components/compare.tsx:53`, `:62`, `:72`, `:77`, `:104`, `:114`), so no anchor about
  deliberate execution can mean anything against it.
functionality: not exercised. A static exhibit with one focusable control, the compare slider.
  There is no task to complete and no failure to recover from.
```

**Boundary note.** The ceiling stayed silent exactly where the floor speaks, which is the intended
direction and the thing this pass set out to confirm. It also confirms why the exhibit could not be
the run's subject: it produces zero grade evidence, so it cannot test whether the ceiling catches
design that passes every control.

---

## Line-number drift against `main`

Recorded because the epic requires it: every `validate.py` line number in the spec is branch
relative, and the spec's other `file:line` citations are too. Re-resolved against `main` at
`91b7f7b4cf8c58ab64ef906ab7debc1cbcef2c17`.

| Spec citation | Where it actually is on `main` | Drift |
|---|---|---|
| `checks/validate.py:838`, the `cross_ref_files` list (spec sections 2 and 10) | `plugins/dx-harness/checks/validate.py:917` | +79 |
| `validate.py:587`, the IDN-1 "planned but unbuilt" grandfather (spec section 9.3) | `plugins/dx-harness/checks/validate.py:665` | +78 |
| `agents/dx-design-review.md`, line 190, reviewer rubric section 4 (spec section 5) | `plugins/dx-harness/agents/dx-design-review.md:196` | +6 |
| `quality-bar.md:416`, the second stale control count (spec section 11) | `quality-bar.md:417` on `prototype/quality-bar-shape` | +1 |

Two counts in the spec are also stale against `main`: section 2 says "69 controls" and "23 of the
69 controls", and `main` carries 70. Section 1's "the catalogue is 69 since IDN-4's removal at
`890b9c3`" describes `prototype/quality-bar-shape` only.

One cross-reference claim verified rather than drifted: spec section 2 says all 34 control ids
cited in the finished prototype resolve in `catalog.yaml`. Checked against `main`'s catalogue:
**34 ids cited, all 34 resolve.** So adding `standards/quality-bar.md` to `cross_ref_files` in #147
will pass on the first run.

---

## Sources

- Prototype artifact:
  [`plugins/dx-harness/standards/quality-bar.md`](https://github.com/transformteamsg/dx-harness/blob/prototype/quality-bar-shape/plugins/dx-harness/standards/quality-bar.md)
  on `prototype/quality-bar-shape`. Not merged, not edited, not copied to `main` by this run.
- Spec sections 1, 3, 11, 14 and 15:
  [`docs/specs/2026-08-14-catalogue-reliability.md`](https://github.com/transformteamsg/dx-harness/blob/prototype/quality-bar-shape/docs/specs/2026-08-14-catalogue-reliability.md)
  on the same branch.
- Graded surface, on `main`: `app/standards/catalog/page.tsx`, `components/catalog-browser.tsx`,
  `lib/catalog-filter.ts`, `lib/tier-style.ts`.
- Floor: `plugins/dx-harness/standards/catalog.yaml` at `91b7f7b`.
- Source tickets: #110 (shape), #112 (the four criteria and their anchors), #145 (this run),
  #144 (the epic), #147 (adoption, which owns every anchor change proposed above).
