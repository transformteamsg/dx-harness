# Design decision record — the feature grid in the ink-mark vocabulary (`/`)

> Modification run over the shipped feature grid (see `landing-graphics.md` for
> the grid this builds on, and `landing-run-example.md` for the run section
> whose vocabulary this adopts). Scope: the four figures under "What the
> harness gives your agent." only. Executed via the improve skill's
> plan/execute flow (`plans/002-feature-grid-ink-icons.md`, executor: a
> dispatched Sonnet agent), then carried through the design-review loop.

- **Date:** 2026-08-17
- **Product:** other — outside the portfolio. The DX Harness website itself;
  site accent Radix lime, light-only. `products:`-scoped controls are
  deliberately out of scope — product outside the portfolio.
- **Change type:** modification (four figures redrawn; card copy untouched)
- **Page type:** marketing / landing
- **Run type:** attended
- **The teacher and the moment:** none directly — the reader is a designer or
  builder arriving cold. This grid is where the page names its four parts
  before the run section shows them working.

## Why this run existed at all

Plan 001's record originally listed this work as *rejected*. That was a
misreading of the builder's brief, corrected in commit `bd48006`: "keep the
current abstract graphic oriented comm for the What harness gives your agent"
meant keep that **communication style** — a small abstract-graphic argument
per card that performs on hover — not leave the section unchanged. The
intended change was always to redraw each figure from the icon-generator's
ink marks. This run is that outstanding work.

## Sprint contract (done-criteria)

1. Each figure spells out its own card's message in the ink-mark vocabulary,
   where the same mark means the same thing here as in the skills section and
   the run panel.
2. The grid keeps its communication style: a geometric argument per card that
   performs that argument on hover, not a decorative icon row.
3. The hover choreography reads as one intentional motion per card, on
   `--motion-*`/`--ease-*` tokens only, no bounce; touch and reduced-motion
   readers get the resolved pose with no movement (A11Y-5).
4. No regression against the baseline: no overflow at 320/360/390, no marks
   clipped inside the `h-44 overflow-hidden` box, no layout shift, no SVG
   filter-id collisions (a collision silently strips one mark's ink texture).
5. Build, unit, e2e, and the deterministic `checks/` scripts stay clean.

## Chosen approach

Built shape (`components/landing/feature-figure.tsx`, commit `d560427`):

- **FIG 1 (Orchestrator skill)** — speech-bubble mark (your plain words) feeds
  the orchestrator mark inside its selector ring; three picked skill marks
  (pattern, polish, execute) gain accent discs and drawn routes on hover,
  while copy and review stay unpicked. The orchestrator selects; it does not
  broadcast.
- **FIG 2 (Control catalog)** — the human mark and the machine mark converge
  on one drawn catalog sheet carrying the list-checks mark, their connectors
  drawing in. One catalog, two readers.
- **FIG 3 (DESIGN.md)** — the colour, typography, and tokens marks route into
  the miniature drawn interface, whose avatar dot and action glyph fill with
  accent. Same parts, your arrangement.
- **FIG 4 (Review skill)** — two rings, one carrying the catalog mark and one
  the newly generated `landing/design-file` mark, close over the work; the
  check draws where they agree, then the arrow leaves.

One new icon was generated for this run: `landing/design-file`
(lucide `file-pen-line`), added to `TOPIC_ICONS` in
`scripts/generate-ink-icons.mjs` and produced by `pnpm run gen:icons`. The
regeneration was verified purely additive — no existing entry changed.

Every `InkIcon` call carries a per-figure `idSuffix` (`-fig1`…`-fig4`).
The suffix is load-bearing, not cosmetic: the same marks already render in the
skills section with no suffix and in the run panel with `-run`, and a
duplicate SVG filter id fails **silently** by stripping one mark's ink
texture. Measured after the build: 15 marks in the grid, 15 unique filter
ids, 30 unique page-wide.

## Rejected options

- **Regenerating the whole icon set to add the DESIGN.md mark**: not needed —
  the generator's seed is a deterministic per-key hash, so adding one
  `TOPIC_ICONS` entry leaves every existing entry byte-identical. Verified by
  asserting zero removed lines in the generated file's diff.
- **Reusing `guidelines/voice-tone` for "voice" in FIG 3**: rejected on
  system grounds. That mark already means "your plain-words ask" in FIG 1;
  giving it a second meaning in a sibling card would break the
  same-mark-same-meaning property this run exists to establish.
- **Putting the choreography classes on the nested `<svg>` elements**:
  rejected — nested SVGs do not obey `transform-box: fill-box` consistently
  across engines. The marks hold still and the plain shapes around them
  (discs, routes, rings, wrapper `<g>`s) carry the motion.

## Tradeoffs, named

- **The marks lose their ink character at grid sizes.** The reviewer measured
  the baked rough.js wobble as surviving at 4× zoom on the 22–28px marks but
  nearly spent at 1×, where they read as ordinary line icons. Accepted: the
  page already ships 18px marks in the run panel, so these sizes are inside
  the established family. The cost is character, not legibility.
- **FIG 3's figure and its card copy name different sets.** The card says
  DESIGN.md holds "your colours, type, motion, and voice"; the figure draws
  colour, typography, and tokens. The review flagged this as the one advisory
  a human might reasonably escalate, since it touches contract item 1
  directly. Left open for the builder — see "Open decisions" below.
- **The first build traded one defect for another on FIG 1.** The pre-rework
  figure had all five candidate shapes in one column but clipped them at the
  box edges — a craft finding from the earlier `landing-graphics.md` review.
  Commit `d560427` fixed the clipping and lost the single-column read;
  `ce5ff4e` restored the column without the clipping, which round 2 confirmed
  resolved (five marks at one size on an even 40-unit pitch, 19.66 and 19.51
  units of top and bottom inset).
- **`--motion-story` (600ms) exceeds MOT-1's 100–300ms band.** Carried, not
  new: these are narrative surfaces, and the token definition already says so
  at `app/globals.css:103-109`. Closed this run by an inline `dx-waive MOT-1`
  at the deviation site, which is the form an L2 `rationale` waiver takes —
  see "Waivers granted".

## Controls in scope

`TOK-1`, `TYP-1`, `TYP-2`, `TYP-3`, `COL-1`, `CMP-1`, `CMP-5`, `CMP-7`,
`SLP-4`, `SLP-8`, `SLP-9`, `MOT-1`, `MOT-3`, `LAY-2`, `LAY-5`, `LAY-6`,
`A11Y-1`, `A11Y-5`, `A11Y-7`.

The figures are `aria-hidden` decorative drawings inside a linked card, so
name and contrast controls apply to the card chrome, not the drawing.
`products:`-scoped controls: deliberately out of scope — product outside the
portfolio. Dark mode: N/A — the site is light-only by design
(`app/globals.css:4-6`, no `.dark` layer).

## Waivers granted

One, and it needs no approver — MOT-1 is **L2 with `waiver: rationale`**, which
the standard satisfies with an inline marker at the deviation site rather than a
named sign-off (`plugins/dx-harness/standards/README.md` line 89; contrast the
L1 `documented` row above it, which is what `SLP-1` and `SLP-4` use in
`docs/decisions/landing.md`).

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| MOT-1 | L2 (`rationale`) | `--motion-story` is reserved for narrative surfaces; these figures are `aria-hidden` narrative drawings, not task UI | none required at L2 | inline `dx-waive MOT-1` on the `ff-*` block in `app/globals.css` |

No L0 or L1 waiver was needed or granted this run.

## Plan approval

- **Approved by:** wondopamine (builder) — the direction is the builder's own
  brief, quoted in `bd48006`: keep the abstract-graphic communication style
  for "What the harness gives your agent" and redraw each card with the
  icon-generator ink icons spelling out its message, "e.g. FIG 1 as
  voice/prompt icon → orchestrator icon → the specialised skill icons, and the
  same treatment for the other three cards". An explicit ask to build a
  chosen direction counts as approval (stop-once rule).
- **Approved on:** 2026-08-17

## Verify verdict

- **Executor isolation failed on the first dispatch, again.** The
  auto-provisioned worktree was cut from `935f5e5` — six commits behind, from
  before plan 001's work landed — so the executor's drift check tripped and it
  correctly refused to run, leaving its tree clean. That makes this the
  **second consecutive run** to hit executor-worktree base drift (plan 001 hit
  a variant of it). The coordinator then provisioned a worktree explicitly at
  the plan's `bd48006` baseline on branch `plan-002-exec` and resumed the same
  executor there, where the drift check came back clean. Recorded because a
  defect that recurs across runs is a process problem, not an incident.
- **CMP-1: asserted, no manifest** — no `.dx/` directory exists in this repo,
  so no component manifest, no standing overrides, and no `DESIGN.md`.
  Evidence source: the reviewer inspected the product codebase directly. The
  change wraps the shared `components/ink-icon.tsx` renderer without forking
  it and adds no component; nothing in the stack ships a narrative-figure
  component. LAY-1 is N/A — no `layout_system` declared.
- **Dark mode:** N/A — product has no dark mode.
- **Screenshots:** session scratchpad — grid idle, per-card hover at 1280 and
  360, reduced-motion and touch renders, plus the reviewer's own 320/360/390/
  768/1280 captures with pixel-sampled crops.

- **Evaluator verdict — round 1 (`dx-design-review`): pass-with-findings.**
  No L0/L1 violation; every in-scope blocking control passes with recorded
  evidence. Gates re-run independently by the reviewer: the five `checks/`
  scripts, `tsc --noEmit`, `pnpm build` (+ CSP postbuild externalising 1350
  inline scripts across 120 prerendered pages), `pnpm test` 92/92,
  `pnpm test:e2e` 43/43.

  Five advisories, each with the reviewer's own measurement:

  1. **FIG 1's unpicked pair does not read as part of the candidate set.**
     Picked marks at `translate(286 …)` `size={28}` in `r=20` discs; unpicked
     at `translate(334 …)` `size={22} opacity=".3"` — 48 units right, 21%
     smaller, 30% opacity, no disc. Three differentiators stack where one
     would do. The baked 1.4-unit stroke renders 1.63 parent units at size 28
     and 1.28 at size 22, against 2.0 for every drawn stroke, so the size drop
     is a weight drop too.
  2. **FIG 3's figure and card copy name different things**, and the run's own
     new `landing/design-file` mark is used only in FIG 4 — absent from the
     DESIGN.md card it was made for.
  3. **FIG 2's hover motion barely registers.** `translateX(±16)` = 12.8 CSS
     px, 4.4% of the 288px drawing. The baseline moved shapes 152–166 units.
     This, not FIG 4, is the card whose motion does not earn its 600ms.
  4. **Same mark, two inks, no recorded reason** (CMP-7, L2, pass-with-caveat)
     — `standards/catalog` is accent in FIG 2 but foreground at `.6` in FIG 4;
     `skills/orchestrator` is foreground here but accent in the run panel.
     A defensible logic exists but is written down nowhere.
  5. **Cell-to-cell figure weight is uneven and FIG 4 sits off-centre**
     (LAY-5/LAY-6, both L2, pass-with-caveat) — box-height share is FIG 1 73%,
     FIG 3 78%, but FIG 2 50% and FIG 4 53%, so the right column reads
     lighter. FIG 4's content centre is 206.5 against the box centre 180 —
     26.5 units (21 CSS px) right.

  **Two of the coordinator's three pre-review concerns were refuted on
  measurement**, which is the loop working as intended:

  - *FIG 4's rings barely move*: **refuted.** The idle rings are near-tangent,
    not overlapped — centre distance 112 against 116 sum-of-radii, a 4-unit
    lens (3.2 CSS px) — opening to a 40-unit lens (32.0 CSS px) on hover. A
    10× change, and the clearest motion of the four.
  - *FIG 1's speech bubble is optically underweight and the ring may read as a
    nested card*: **refuted on both.** The bubble's baked stroke renders 2.57
    parent units against the ring's 2.0, so it is heavier per stroke, merely
    smaller in area — which is the argument ("small input, big selector").
    SLP-4 is nowhere near implicated: card and figure both compute transparent
    background, `border-width: 0px`, `border-radius: 0px`; a stroked circle
    carrying a glyph is a medallion, not a card.

  Quality grades on the changed section: design quality **acceptable, close to
  strong** (the vocabulary change is a real gain — all four cards now read
  input → mechanism → result in one shared mark set); originality **strong**
  (redrawing from the generated ink family rather than inventing four more
  bespoke geometries is a system decision); craft **acceptable** (everything
  measurable is clean — dash headroom ≥12.27 units on all eleven drawn paths,
  30/30 unique filter ids, nearest mark edge 20.3px inside the box at 320 —
  held back by the three unfinished details above); functionality **strong**
  (all four cards navigate, keyboard focus resolves the figure with a 2px
  `#587828` ring, touch and reduced-motion get the finished pose, 43/43 e2e).

- **Fixes applied after round 1** (commit `ce5ff4e`): FIG 1's five marks to one
  column at one size (28) on an even 40-unit pitch, discs shrunk to `r=17`,
  unpicked opacity raised .3 → .5, with the accent disc alone carrying
  "picked"; FIG 2's readers to 40 units of travel with the sheet scaled up;
  FIG 3 rebuilt to route the three foundation marks into a
  `landing/design-file` mark and thence into the interface; FIG 4 recentred
  (ring centres 142/218 → 114/206, radius 58 → 80); and the ink rule written
  into the file's header comment and applied — **the mark naming its own
  card's subject renders `--site-accent-text`, every other mark renders
  `--foreground`.**

- **Evaluator verdict — round 2 re-check (same `dx-design-review` instance):
  pass-with-findings, net clearly better than round 1.** Three of the five
  round-1 advisories fully resolved, one partially (its open half is the
  builder's by design), one resolved on both its metrics but at the cost of
  two new craft findings. No L0/L1 regression; no control moved from pass to
  fail. Three controls were **upgraded**: CMP-7 to a clean pass (the written
  ink rule is the recorded reason the control asks for, and all 16 rendered
  strokes obey it), LAY-5 and LAY-6 to clean passes.

  Measured round-1 → round-2 deltas: FIG 2's reader travel 16 → 40 units
  (2.5×); height-fill spread across the four cells **28.2 → 9.5 points**;
  content centres now 174.3 / 179.7 / 184.4 / 180.0 against the box centre
  180, all within ±6 units; filter ids 16/16 unique in the grid, 31/31
  page-wide; minimum viewBox inset 16.0 units at both poses; minimum dash
  headroom 14.3 units.

  **The round caught a regression the fixer's own report had hidden.** The
  fixer reported FIG 4's overlap as 42.5% against 34.5% — but that is the
  *hover* overlap. The number that mattered was the rest state: the idle lens
  went from **4 units (3.4% of diameter) to 32 units (20%)**, collapsing the
  idle-to-hover ratio from **10× to 2.1×**, because the radius grew 58 → 80
  while the idle offset stayed at ±18. At rest FIG 4 now already reads as a
  Venn diagram, so the closing no longer reads as a change of state, and the
  argument's logic weakens: the idle lens (x 144–176) already exactly contains
  the check's bounding box, so "the check draws where they agree" no longer
  depends on the rings closing.

  Two of the coordinator's three round-2 concerns were again adjusted on
  measurement:

  - *FIG 3's file mark is undersized*: **refuted.** Its glyph box is
    30.75 × 33.88 against the foundation marks' largest 30.17 × 30.04, and its
    stroke is 2.333 units against their 2.1 — the biggest and heaviest mark in
    the figure. The "way-point" read is real but has three other causes:
    accent ink costs contrast (`--site-accent-text` 5.13:1 against
    `--foreground` 18.9:1, so ~27% of its inputs' optical weight at equal
    stroke); the corridor is starved (curves shortened 97.73 → 69.64 units,
    stopping 14 units short on vertical tangents, so they read as a `}` brace,
    with a 13-unit hyphen as the route out); and it is the only accent subject
    mark with no drawn container. Under-scaffolded, not undersized.
  - *FIG 1 is now the heaviest, so balance was levelled up to a drifter*:
    **refuted.** The spread genuinely narrowed (28.2 → 9.5 points) and FIG 1's
    own growth was only 78.2% → 82.2%, with 19.66 / 19.51-unit top and bottom
    insets. The column now reads "five candidates, three chosen" at a glance.

  New findings introduced by the round-1 fixes:

  1. **FIG 4's rest state no longer reads as "not yet closed"** — the item the
     reviewer said it would hold the round for, because the fix is one line
     with an exact known value: idle offset ±18 → **±34**, which puts the
     centres 160 apart against 2r = 160, tangent at rest, restoring a
     10×-class read with `r=80` and the hover pose untouched.
  2. **FIG 3's funnel reads as a brace plus a way-point** — see the corridor
     measurements above.
  3. **FIG 2's sheet now reads as a phone, not a page of guidance** — the rect
     went 60 × 110 (1:1.83) to 60 × 166 (1:2.77) while its glyph grew only
     44 → 48, leaving ≈69 units of empty sheet above and below. The height-fill
     metric was satisfied by scaling the container rather than giving the
     sheet content. Clearest at 360 wide.

  Quality grades on the changed section: design quality **strong** (up from
  acceptable), originality **strong** (strengthened — the ink rule is now a
  written system rule rather than an implicit habit), craft **acceptable**
  (hygiene again clean and round 1's worst defect gone, but three new
  unfinished details replaced it, two of them side effects of fixing an L2
  metric), functionality **strong**.

- **Fixes applied after round 2** (commit `03fecc6`) — **two of three; the
  headline fix proved geometrically impossible.**

  Delivered and measured clean: **FIG 3's corridor joined** — the three curves
  extended to land at x=105 (lengths 71.45 / 33 / 71.45), the file mark raised
  to `size={48}`, and the route out lengthened from a 13-unit hyphen to 29
  units by moving the miniature interface's left edge from x=170 to x=186 with
  its interior shifted +8 to keep the layout coherent. **FIG 2's sheet given
  content** — widened 60×166 → 80×166 for a measured 1:2.075 aspect (inside the
  "no thinner than 1:2.2" limit) with four drawn rule-lines added above and
  below the checklist glyph, holding height fill at 75.45%; its connectors
  shortened to 24 and 20 units as expected.

  **Not delivered: FIG 4's rest-state tangency (round 2's headline advisory).**
  The reviewer's specified value of ±34 is geometrically unreachable, and the
  fixer measured it, reverted, and stopped rather than improvising — which is
  the STOP condition working as designed. Verified independently:

  - Tangency at rest puts the rest centres exactly 2r apart, so the rest span
    is **4r = 320** units.
  - For that span to sit inside the 360-unit viewBox with 12-unit insets, the
    rings' **midpoint** must lie in **[172, 188]**.
  - The midpoint is **160**, and a symmetric offset cannot move it — so the
    pair is **12 units too far left** for the fix to exist at these centres.
    At ±34 the left ring's edge lands at exactly **0.0**.
  - The largest offset respecting the 12-unit floor is **±22**: idle lens 24u,
    hover lens 68u, **ratio 2.83×** against today's 2.13× and round 1's 10×.

  **The cause was an earlier fix in this same loop.** Round 1's centring
  advisory (FIG 4 sitting 26.5 units right of centre, an L2 nit) was closed by
  centring the *content bounding box* — which includes the exit arrow. Since
  the arrow occupies only the right side, centring the box pushed the rings'
  own midpoint 20 units left of the box centre, consuming exactly the
  horizontal budget the closing motion needed. So the LAY-6 upgrade and the
  motion advisory are in direct conflict, with the exit arrow as the element
  that cannot coexist with tangency at rest. Four numerically verified
  resolutions were put to the reviewer to adjudicate: accept ±22; centre the
  rings themselves on 180 (tangency restored, insets 20/20, height fill
  intact, but the content centre drifts 15–19 units); drop or reroute the exit
  arrow (satisfies every constraint at once, at the cost of "and only then does
  the arrow leave for you"); or shrink r toward 77, the bottom of the weight
  band. The decision is a composition trade, so it was **not** left to a fixer.

  This fix round was also instructed to re-measure the properties round 2
  graded **good**, not only the ones it graded bad — the procedural lesson from
  round 1. That sweep came back clean: FIG 1's geometry, all four content
  centres, all route lengths, the ink rule across all 16 marks, and filter-id
  uniqueness all matched their stated baselines.

  One measurement worth carrying forward: the ink marks carry roughly **7 units
  of internal padding** before the visible stroke begins, so a route landing on
  a mark's nominal translate-box edge touches its silhouette about 7 units
  later than the coordinates suggest. Anyone joining a route to a mark needs to
  aim at the glyph, not the box.

- **Adjudication of the FIG 4 conflict — the reviewer retracted its own
  round-1 advisory.** Asked to choose among the four verified resolutions, the
  reviewer instead derived a fifth that none of them covered, and then
  disclosed three errors of its own. The exchange is the most valuable output
  of the run and is recorded in full.

  **The resolution (option e): shift the whole of FIG 4 right by 14 units,
  then set the offset to ±34.** The binding constraint was never the offset —
  it was the ring-pair midpoint, the exact thing the round-1 centring advisory
  moved. Tangency needs the midpoint in [172, 188]; +14 puts it at **174**, so
  tangency becomes reachable with `r=80` and the 72.7% height fill both
  intact. Independently verified: rest centres 94/254, distance exactly
  160 = 2r (**tangent**); rest span 14→334, insets **14 / 26**; hover rings
  unchanged at 48→300; **hover lens unchanged at 68 units** (140→208); the
  check's span 158→190 inside that lens; the arrow at 310→340 with a 20-unit
  right inset and its 10-unit ring clearance preserved. Because the shift is
  uniform, every internal relationship in the figure survives it.

  **Nothing real is traded.** The only casualty is the round-1 *metric* —
  content bounding-box centre within ±6 of 180 — which the reviewer formally
  retracted as the wrong measurement. On the measure that actually governs
  LAY-6, optical centre, which for a stroke drawing means **ink mass**, the
  shift lands the centroid at **184.3** against **170.3** today and **191.3**
  after round 1. So the trade everyone was braced for (motion versus
  alignment) never existed: one of the two constraints was invalid.

  **The reviewer's three disclosed errors**, quoted in substance because the
  process lesson is the point:

  1. **The ±34 recommendation was unverified.** It checked the lens arithmetic
     and never re-checked it against the ≥12-unit inset floor it had set
     itself two paragraphs earlier in the same verdict, then presented it as
     "a precise fix available with no cost".
  2. **It measured the wrong quantity.** LAY-6's detail file directs the
     evaluator to prefer optical over geometric alignment and lists "an icon
     geometrically offset but optically centred is correct, not a bug" in its
     do-not-flag section. A content bounding box is geometric, and on this
     composition the two `r=80` rings carry **96.9%** of the ink while the
     trailing hairline arrow carries **3.1%** — a bbox weights them equally.
     That is precisely the substitution the control warns against. Measured on
     ink mass, round 1's FIG 4 was a **pass** and the advisory should never
     have been raised: it bought **1.6 units** of optical improvement and
     spent **20 units** of horizontal budget.
  3. **It rewarded the error in round 2**, upgrading LAY-6 while citing
     "content centres within ±6 u of 180" — the same wrong yardstick, which
     told the fixer the number *was* the goal.

  **Struck from this surface's standing verdicts:** the ±6-on-bounding-box
  tolerance, and the reasoning behind round 2's LAY-6 upgrade. LAY-6 was a
  pass in both rounds on the correct measurement. For a stroke figure with
  trailing light elements the criterion is **ink-mass centre**, and light
  trailing elements are allowed to hang, like hanging punctuation.

  Options rejected, with reasons: **(a) accept ±22** — refused outright, a
  24-unit rest lens still reads as "already overlapping", the defect merely
  smaller. **(b) centre the rings on 180** — works, but overshoots the optical
  centre to 190.3 and squeezes the arrow to a 14-unit inset for no gain over
  +14. **(c) drop or reroute the arrow** — wrong trade in kind; "and only then
  does the arrow leave for you" is part of the card's argument, and option (e)
  shows the room was available without spending it. **(d) shrink `r` toward
  77** — unnecessary; tangency needs only 4r ≤ 336, so the ceiling is r = 84
  and `r=80` was never the problem. The weight fix stands.

- **Fixes applied after the adjudication** (commit `4dad3cf`): the seven
  uniform +14 coordinate edits on FIG 4 and the two CSS offsets to ±34.
  Everything predicted reproduced exactly. **Rest lens 0** — the idle rings
  measure left x14→174 and right x174→334, meeting precisely at 174 with zero
  overlap and zero gap. **Hover lens 68, unchanged**, spanning 140→208. Check
  span 158→190, inside that lens. Minimum inset **14.0 idle** (as predicted)
  and 30.0 hover. Arrow 310→332 with its head at 332→340, right inset 20.
  Confirmed visually: at rest the rings read as two circles exactly touching,
  and hover closes them into a proper lens with the check inside — the closing
  reads as a change of state again. FIG 1, 2 and 3 measured byte-identical
  across height fills, content centres, route lengths and insets; all 16 marks
  keep unique filter ids and obey the ink rule; all nine gates pass.

  **One number did not reproduce, and it is the one the retraction rests on.**
  The fixer computed FIG 4's ink-mass centroid two ways — 181.4 weighting
  stroke length by stroke width, 182.2 weighting by length alone — against the
  reviewer's predicted **184.3**, and measured the ring share of total ink at
  about **82%** rather than the cited **96.9%**. Its method sampled
  `getPointAtLength` at roughly 1-unit resolution and mapped through the root
  SVG's inverse `getScreenCTM` so the CSS offsets are accounted for; it could
  not reverse-engineer a weighting that yields 96.9/3.1, and reported the gap
  plainly rather than reconciling it. The **direction** of the argument holds
  either way — the centroid moved from 170.3 to roughly 182, so the shift did
  improve optical centring — but a retraction that struck a standing tolerance
  and downgraded one of the reviewer's own advisories to "should never have
  been raised" needs reproducible numbers. Sent back to the reviewer to
  re-measure with its weighting method stated, and to confirm whether the
  correction changes the retraction. Recorded here unresolved rather than
  quietly rounded, because trusting an unverified number is the exact failure
  the retraction was about.

- **Centroid reconciliation — both parties were right, and one cited figure was
  wrong.** The reviewer re-measured with its method stated: ink = arc length ×
  stroke width × effective opacity, sampled at ≤0.5-unit resolution and mapped
  through `rootCTM⁻¹ · elCTM` so the CSS offsets and the nested marks' scale
  both count; a path whose `stroke-dashoffset ≥ length` deposits zero ink; icon
  paths count as their own ink rather than being lumped into the rings.

  - **184.3 stands** — it reproduces at **184.10**, and it was always a
    *hover-pose* number. The fixer's 181.4 / 182.2 were *rest-pose*, and the
    reviewer's own rest figure is **182.22**, matching the fixer exactly. The
    1.9-unit pose difference was the whole gap; neither measured wrong.
  - **"96.9% of the ink is the two rings" was wrong and is corrected on the
    record.** 96.9% is everything *except* the exit arrow — rings plus both
    marks plus the check. The **rings alone are 71.2% at hover and 78.5% at
    rest**, and the fixer's ~82% was a fair reading under its own weighting.
    The number the argument actually rests on, **the exit arrow at 3.1%**, is
    measured, reproducible, and unchanged. The reviewer's note on it: the
    sentence "was sloppy in a paragraph whose entire purpose was rigour, which
    is the worst place for it."

  **The retraction stands and is stronger, now measured rather than argued.**
  Ink centroid at hover across three builds: round 1 (r=58, ring midpoint 180)
  ≈191; round 2 (r=80, midpoint 160) **170.1**; now (r=80, midpoint 174)
  **184.1**. So the correct ring midpoint is **174 — six units from where
  round 1 already had it**. The centring advisory moved it 20 units the wrong
  way, and three rounds later it is back within six units of its starting
  point. The only durable gain from the whole excursion belongs to a
  *different* advisory (the radius 58 → 80). The churn, and the round-2 motion
  regression that was its cost, are attributable to that one advisory.

  **The reviewer then narrowed its own replacement measure before it could
  entrench.** Running the same ink model across all four figures gave hover
  centroids of 221.7 (FIG 1), 180.8 (FIG 2), 232.1 (FIG 3), 183.5 (FIG 4) — and
  FIG 1 and FIG 3 are **correct** at those values, because they are
  *directional* compositions where inputs sit left and the outcome sits right.
  Their asymmetry is the argument. Had "ink centroid within ±6 of 180" been
  written as a rule, it would have flagged two figures that are right. The
  honest form, now the standing measure for this surface:

  - **Symmetric compositions** (FIG 2's two readers around one artifact, FIG
    4's two co-equal sources): optical centre should sit near the box centre,
    and ink centroid measures it. Both pass — FIG 2 at +2.0 / +0.8, FIG 4 at
    +2.2 / +3.5.
  - **Directional compositions** (FIG 1, FIG 3): horizontal balance is not a
    centring question. Judge margin symmetry at the extremes and reading
    order, and attach **no** tolerance to any centre metric.

  In the reviewer's own words, it "nearly repeated my own mistake by proposing
  a numeric tolerance on a second proxy one round after concluding that
  evaluators must not do that."

- **Evaluator verdict — round 3 (same instance): pass-with-findings, and the
  section is ready modulo one builder decision.** Craft **upgraded to strong**;
  design quality, originality and functionality all **strong**. All nine gates
  clean, 92/92 unit, 43/43 e2e, zero console errors.

  Independently reproduced on `4dad3cf`: FIG 4 rest lens **0** (rings 14→174
  and 174→334, tangent), hover lens **68** (140→208), check 158→190 inside it,
  rest inset 14.0. FIG 3's corridor **resolved** — routes terminate at x=105.00
  against a silhouette starting at x=108.30, a **3.30-unit (2.64 CSS px) gap
  that reads as contact at 1× and meets the glyph without overrunning its
  strokes**, against the 14-unit gap of round 2; route out 29 units with a
  symmetric 3.8-unit exit gap; the mark at `size={48}` measures 36.90 × 40.66
  with a 2.8-unit stroke against the largest foundation mark's 30.17 × 30.04 at
  2.1, so the destination is now unambiguously the heaviest mark in the figure.
  Regression sweep across FIG 1, 2 and 3 came back byte-identical, minimum dash
  headroom 14.3 units, 16/16 grid filter ids unique and 31/31 page-wide, all 16
  marks obeying the ink rule, reduced-motion and keyboard-focus states
  resolving fully, `scrollWidth == clientWidth` at 320/360/390/768.

  **Still open after round 3:**

  1. **FIG 2's sheet proportion — partially resolved, and the reviewer
     recommends the builder may close it.** The four rule-lines fixed the
     emptiness, but at 80 × 166 the aspect is **1:2.075**, still phone
     territory (a page reads at 1:1.4 or squarer). The reviewer deliberately
     issued **no new number**, because FIG 2's 75.45% height fill is carried
     entirely by the sheet's height, so a squarer sheet drops the fill back
     toward the round-1 problem. That tension is a direct product of its own
     round-1 height-fill advisory — the **second instance** of the same
     proxy-metric failure. The way out is compositional (let something other
     than the sheet carry the vertical extent), not proportional. Its
     position: "if the builder decides 1:2.075 is fine and closes this thread,
     I would not hold ship for it."
  2. **New, L2: FIG 3's miniature interface lost half its interior padding.**
     Narrowing the frame from 160 to 144 units for corridor room shifted the
     interior rather than rescaling it, so the wash field is **128 wide inside
     a 144 frame, leaving 8-unit margins where there were 16**, and it now
     occupies 89% of the frame's width against 80% before; the avatar sits 9 units from
     the edge where it sat 17. Dispatched as a final fix: rescale the interior
     (field to ≈112) and keep the frame at 144, since its width is load-bearing
     for the corridor.
  3. **MOT-1's 600ms allowance still lacks an inline `dx-waive`.** Initially
     held open here on the reasoning that granting a waiver needs a named
     approver, making it the builder's act. **That reasoning was wrong, and the
     reviewer corrected it from the standard's own text.** MOT-1 is **L2 with
     `waiver: rationale`**, and `plugins/dx-harness/standards/README.md` line 89
     defines an L2 rationale waiver as "inline waiver at the deviation site,
     like an eslint-disable"; the named-approver requirement sits on the L1
     `documented` row above it. Verified directly: `catalog.yaml` gives
     `MOT-1: tier=L2 waiver=rationale` against `SLP-1` and `SLP-4` at
     `L1/documented` — which is exactly why the approver reasoning **was**
     right for those two in `docs/decisions/landing.md` and does not transfer
     here. A category error on the coordinator's part, caught because the
     reviewer re-read the standard instead of answering from memory. Closed by
     an inline marker at the deviation site (see below).

- **Fixes applied after round 3** (commit `9339d40`) — FIG 3's interior padding
  restored, closing round 3's one new advisory. The frame stayed at
  `x=186 width=144` (its width is load-bearing for the corridor); the interior
  was rescaled instead. Measured: wash field now `x=202 width=112` giving
  **16-unit interior margins** on both sides (were 8), the field back to
  **77.8% of the frame width** against the original 80% (was 89%), and the
  avatar back to **17 units** from the frame edge, exactly its pre-narrowing
  value. Regression sweep clean on every property round 3 graded good,
  including the one this loop has broken three times: **FIG 4's rest lens is
  still 0 with the rings meeting exactly at x=174, and its hover lens still
  68**; FIG 1, 2 and 3 unmoved on height fill, content centre, route lengths
  and insets; 16/16 unique filter ids; the ink rule holding on all 16 marks.
  All nine gates pass.

  Verified independently: 16 marks with 16 unique filter ids, zero console
  errors, no overflow at 390, and the miniature interface now reads with
  consistent breathing room around its wash panel, header bar and button.

## Final state of this run

Six commits on `plan-002-exec`, unmerged:

| Commit | What |
|---|---|
| `d560427` | The four figures redrawn in the ink-mark vocabulary, plus the generated `landing/design-file` mark |
| `ce5ff4e` | Round-1 advisories: FIG 1's column, FIG 2's travel, FIG 3's mark, FIG 4's centring, the written ink rule |
| `03fecc6` | Round-2 advisories: FIG 3's corridor joined, FIG 2's sheet given content (FIG 4 deliberately absent, stated in the message) |
| `4dad3cf` | FIG 4 seated tangent at rest — the +14 shift that made it geometrically possible |
| `9339d40` | FIG 3's interior padding restored |
| `2ee80d9` | MOT-1's rationale recorded as an inline `dx-waive` at the deviation site |

Three review rounds plus a round-4 sign-off, all `pass-with-findings`, no L0 or
L1 violation at any point. Quality grades ended at **design quality strong,
originality strong, craft strong, functionality strong** — craft having climbed
from acceptable across the rounds. Every finding that was the reviewer's to
raise is closed and independently re-measured, and the round-4 sign-off
confirmed the property this loop broke three times finally held: FIG 4's rings
still meeting exactly at x=174 at rest with the hover lens at 68, and FIG 1–3
unmoved to three decimal places.

**Three items remain open, and all three are genuinely the builder's** — each a
judgment about what the drawing should say, not a defect:

1. **FIG 3's figure/copy mismatch** — reword the card or generate a motion
   mark. Do not reuse `guidelines/voice-tone`: it already means "your
   plain-words ask" in FIG 1.
2. **FIG 2's sheet proportion at 1:2.075** — the reviewer would not hold ship
   for it and confirmed it as the builder's to close, noting the constraint it
   fights (box-height fill carried entirely by the sheet) is one the reviewer
   itself introduced. Judging 1:2.075 acceptable closes it with no further
   work.
3. **FIG 4 carrying no mark for its own subject** — a composition change with a
   real choreography cost (a multi-path mark cannot stroke-draw the way the
   bare check does), deliberately not taken in a fix round.

MOT-1 is **no longer** on this list: it was closed by an inline rationale
marker once the tier classification was corrected.

## What this run taught, and what it cost

Recorded because the process failures were more instructive than the figures,
and because all three were the evaluator's own — disclosed by it, not extracted.

Every regression across three rounds shared one mechanism: **the evaluator
attached a number to a proxy metric, the builder hit the number, and the
quality the proxy stood for silently paid.** A content bounding-box centre
stood in for optical centring and cost FIG 4 its closing motion. A box-fill
percentage stood in for visual weight and turned FIG 2's sheet into a phone.
The centring one compounded: it consumed the horizontal budget that made the
motion fix *geometrically impossible* two rounds later, and when it was
finally resolved the correct ring midpoint was **six units from where round 1
had already had it** — twenty units of wrong-way travel and three rounds of
churn for nothing, with the only durable gain belonging to a different
advisory.

The asymmetry is the mechanism: one side of each trade was a number in a
ledger, the other was a judgment nobody re-measured. And it is recursive — the
evaluator nearly attached a tolerance to its *replacement* metric one round
after concluding that evaluators must not, which would have flagged FIG 1 and
FIG 3 as broken when their asymmetry is the argument.

Three rules earned here, each costing a round:

1. **Do not attach a numeric tolerance to a proxy metric.** State the quality
   and the measurement that governs it; if only a proxy is available, say so
   and attach no tolerance. Name which compositions a metric applies to —
   symmetric ones answer to a centre measure, directional ones do not.
2. **A fix round must re-measure what the previous round graded *good*.**
   Applied by hand from round 3 onward; it is the only reason the later fixes
   are known to have broken nothing.
3. **Verification scaffolding is per-run and self-identifying.** Two agents
   writing `measure.mjs` and `screenshot.mjs` into one shared scratchpad
   overwrote each other mid-run. Nothing was silently corrupted this time
   because the fixer noticed, but a collision that quiet produces measurements
   attributed to the wrong build — indistinguishable from a real regression.
   The evaluator's own round-1 and round-2 screenshot directories should be
   treated as unverifiable provenance; the numbers in those verdicts are
   reproducible from the scripts, not from those images.

## Open decisions for the builder

1. **FIG 3's figure/copy mismatch** (new, from this run's review) — the card
   says DESIGN.md holds "your colours, type, motion, and voice"; the figure
   draws colour, typography, and tokens. Either adjust the card's wording or
   generate a motion mark for the figure. Do **not** reuse
   `guidelines/voice-tone` for "voice": it already means "your plain-words
   ask" in FIG 1. Round 2 confirmed the fixes left this untouched either way.
2. **FIG 4 is the only card whose subject has no mark** (new, surfaced by round
   2 precisely because the ink rule is now written down). `skills/review`
   exists in the family and already renders in FIG 1 as an unpicked candidate
   and in the run panel's "design review passed" badge, but FIG 4 draws only
   the two sources it consults, so no mark in it can carry the accent and the
   ink rule is vacuous there. The gap has the same shape as the round-1 one
   that was closed for FIG 3. Deliberately **not** taken in a fix round:
   seating the review mark in the lens would change the choreography (a
   multi-path mark cannot stroke-draw the way the bare check does), and the
   loop had already produced one round where a fix caused two regressions.
   Being a composition decision, it is the builder's.
3. **SLP-5 on the six skill tiles** (L2, carried from `landing-graphics.md`,
   still open) — waive with a recorded rationale or drop the 64px tile.
4. **The sparkles mark for Polish** — carried, now at three sites (skill tile,
   run-panel row, FIG 1). All three resolve from one line in
   `scripts/generate-ink-icons.mjs`, so the decision has not become more
   expensive, but it is no longer a two-site question.

## Ratchet

Carried from the previous records, plus two new `[proposed — pending design-lead
approval]`:

1. **Animation- or interaction-induced layout shift needs a control.** Fourth
   instance across this surface. Re-measured this run: hovering card 1 grows
   its row from 341px to 424px and pushes row 2 down exactly 83px, so a
   pointer travelling toward a row-2 card has its target move under it. The
   figure box is a constant 176px in both states, so this is the card's copy
   reveal, not the rework — but no LAY or MOT control names hover-induced
   reflow of sibling content. Candidate rule: *a hover or focus reveal must
   not displace content outside its own container.*
2. **[new] No control catches a fix that trades a graded-good quality for a
   graded-bad metric.** Now the loop's clearest lesson, and it recurred: every
   regression across three rounds came from closing a measured L2 finding while
   an unmeasured quality quietly paid for it. Round 1's weight-balance metric
   cost FIG 4 its closing motion and FIG 2 its sheet proportion; round 1's
   centring nit cost FIG 4 the horizontal budget that made the motion fix
   *impossible* two rounds later. The asymmetry is the mechanism: one side of
   the trade is a number in a ledger, the other is a judgment nobody
   re-measures. Candidate rule, or procedure amendment: a fix round must
   re-measure the properties the previous round graded **good**, and an
   advisory whose fix consumes a shared budget (space, time, contrast) must
   name what it is spending. Applied by hand in round 3's dispatch; it belongs
   in the loop, not in a prompt.
3. **[new] Verification scaffolding must be per-run and self-identifying.**
   Proposed wording: scratch scripts, logs, and screenshot directories carry
   the commit SHA and the writing agent's role in the filename
   (`verify-<sha>-<role>.mjs`, `shots-<sha>-<role>/`); never a generic name in
   a shared scratchpad. A measurement whose provenance cannot be read off its
   filename is not evidence. Earned when two agents silently overwrote each
   other's `measure.mjs` mid-run.
4. **[new] No control governs "same mark, same ink" in a generated icon
   vocabulary.** CMP-7 comes closest but is written for design-system
   components, not for a mark family whose colour is an intended prop. A
   product that builds a same-mark-same-meaning system has nothing to check
   its colour semantics against — which is why advisory 4 was a close call
   rather than a clean fail. The rule adopted in the fix round (subject mark
   accent, supporting marks foreground) is a candidate to promote.
5. **[new] Executor worktree base drift needs a harness fix, not a per-run
   correction.** Two consecutive runs have had their executor provisioned at
   the wrong base commit; both times the plan's drift check caught it, which
   is the control working — but the coordinator had to hand-provision a
   worktree at the plan's `Planned at` SHA to proceed. The plan-template
   drift check should be treated as load-bearing, and dispatch should pin the
   base commit explicitly.
6. **Transition property must actually cover the animated property.**
   Carried from `landing-run-example.md`: Tailwind v4 compiles
   `translate-*`/`rotate-*`/`scale-*` to their own CSS properties, so a
   `transition-[...,transform]` silently animates none of them.
7. (Standing) visible pause/stop past five seconds of autoplay (WCAG 2.2.2);
   sparkle/star "AI magic" iconography for the SLP list.
