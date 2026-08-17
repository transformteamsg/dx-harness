# Design decision record — isolating one step in the landing run (`/`)

> Modification run over the shipped run player (see `landing-run-example.md` for
> the five-round history this builds on, and `landing-graphics.md` for the
> section's origin). Scope: the stage-selection behaviour of "From a request to
> a reviewed result." only. Planned as `plans/003-run-focus-single-step.md` and
> executed by a dispatched Sonnet agent, then carried through the design-review
> loop.

- **Date:** 2026-08-17
- **Product:** other — outside the portfolio. The DX Harness website itself;
  site accent Radix lime, light-only. `products:`-scoped controls are
  deliberately out of scope.
- **Change type:** modification (one interaction behaviour; no copy, no timing)
- **Page type:** marketing / landing
- **Run type:** attended
- **The teacher and the moment:** none directly — the reader is a designer or
  builder arriving cold, and this section is the one place the page shows the
  mechanism running rather than describing it.

## The request

The builder's words: "upon selecting the each step, can you only show that
specific step's graphic? rather than showing all other steps empty."

## The tension this had to resolve

The "other steps empty" the builder saw were **ghost frames at 40% opacity, and
they were themselves review-directed** — `landing-run-example.md` records the
round-3 finding that introduced them, because the state before them showed about
340px of empty column that measured as reading like a rendering failure. So the
change could not simply delete them.

The reconciliation, and the part the review graded as the good idea: **ghosts
and explicit selection answer different questions with the same pixels.**
Mid-autoplay, a reserved-but-faint region correctly means "this part is still
coming". When a reader picks step 02, a ghost of step 03 is noise. So the ghost
treatment stays in the autoplay path and disappears in the selection path. The
distinction is recorded in the code where the next reader will find it.

## Sprint contract (done-criteria)

1. Selecting a stage shows only that stage's graphic; the other steps are not
   present as empty or ghosted frames.
2. Autoplay still assembles the whole chain with its existing ghost treatment
   and timing, unchanged.
3. The column does not reflow between the default state and any selected stage.
4. The accessible name matches what is drawn in each state, and exactly one
   `aria-current="step"` exists at all times.
5. Server-rendered / no-JS and reduced-motion readers still get the complete
   composition.
6. Build, unit, e2e, and the five deterministic `checks/` scripts stay clean.

## Chosen approach

Built shape (`components/landing/harness-run.tsx`, commit `3994688`):

A second view state, `focused: number | null`, sits beside the existing `beat`.
`beat` drives the run as it assembles; `focused` is the reader asking to see one
step by itself. `null` is the initial state, so the server render and no-JS
readers still get the complete composition. Selecting a stage sets `focused` and
jumps to that stage's beat; replay clears `focused` and plays from the top, so it
is a real escape back to the whole run. `activeStage = focused ?? BEAT_STAGE[beat]`
keeps exactly one stage marked.

Regions are gated with `hidden` (`display: none`), **not** opacity — an
invisible-but-laid-out region would leave the same empty space the builder asked
to remove. The connectors belong to the assembled chain and go with it.

The column's height is held so nothing below the figure moves. The first build
(`3994688`) reserved a **hardcoded** measured constant; three attempts later
(`264f785`) the reserve is **measured at runtime** instead — a `ResizeObserver`
on the `<figure>` captures its own resting height while `focused === null`, and
that value is applied as an inline `minHeight` in focus mode, with the group
centred inside it. See the verify section for why no constant could work.

Each stage carries its own `figureLabel`, since in focus mode the full-sequence
narration would describe regions no longer drawn; `RUN_LABEL` returns when
nothing is focused.

## Rejected options

- **Letting the region scale up in focus mode to fill the space it reserves.**
  Proposed by the coordinator, **refused by the review on two grounds**, both
  sound. It breaks run/focus continuity — the same drawn artifact at two sizes
  means a reader scrubbing 01→02→03 sees three differently-scaled miniatures.
  And the `max-w-[15rem]` cap is what makes the figure's text wrap identically
  at every viewport, which is the only reason the reserve is width-independent
  at all; a scaled region exceeding the reserve would break the mechanism
  holding the height invariant. The reviewer's reframing is the reason the real
  fix exists: *the problem was never that the object is too small, it is that
  the object's caption abandoned it.*
- **Softening the region switch with a transition.** `display:none` cannot
  transition; doing it properly needs `@starting-style` plus
  `transition-behavior: allow-discrete`, a new pattern for this site that
  deserves its own decision. The review confirmed the instant switch implicates
  neither MOT-1 (which bounds motion that exists) nor MOT-3 (meaning survives
  with animation off), and traced 145 frames of an s02→s03 switch showing no
  flash of the ghost opacity and no flash of the `translate-y-1.5` offset.
- **Adding a live region for the changing figure label.** The figure's
  accessible name now changes silently on selection. Judged not worth a live
  region on a decorative figure: the three stage descriptions are full text in
  the `<ol>` regardless of state, `aria-current` moves with the pick and is
  announced as the button's own state, and `RUN_LABEL` returns on replay, so
  information parity holds.

## Tradeoffs, named

- **The focused step reads as spacious.** Stage 01 is a 138px group inside a
  544.5px reserve — **25% ink**, with 203px of blank above and below. The review
  declined to call this a LAY-5 violation, since the control's guidance protects
  "a deliberately spacious surface where the task is genuinely low-volume
  reading", and this is deliberate, documented, and low-volume. The cost rises
  at 360, where vertical space is the scarce resource and the graphic sits
  off-screen above the stage button the reader has chosen. **Open for the
  builder** — see below.
- **The reserve is a runtime measurement, not a constant.** That adds a
  client-side observer to a component that had none, which is a real cost. It
  buys a guarantee no constant can give: because the value is read from and
  applied to the same box, `max(reserve, focused content) === resting` holds by
  construction, and the maintenance obligation is discharged in code rather than
  left on a future human. The invariant is also **machine-guarded** by an e2e
  assertion at two viewports. Accepted limitation, documented in the code: if
  the viewport or the root font size changes while a stage is focused, the
  reserve stays stale until the reader returns to the whole run — with no jump
  when it happens, and full recovery on return.
- **The isolated region does not sit near the stage row that produced it.** At
  stage 01 the graphic's centre is around 560px while the active stage row's is
  around 220px. Noted by the review as a composition observation rather than a
  LAY-6 finding, since shared edges do align.

## Controls in scope

`TOK-1`, `TOK-2`, `TYP-1`, `TYP-2`, `TYP-3`, `COL-1`, `CMP-1`, `CMP-5`,
`CMP-7`, `SLP-4`, `SLP-8`, `SLP-9`, `MOT-1`, `MOT-3`, `LAY-2`, `LAY-5`,
`LAY-6`, `A11Y-1`, `A11Y-2`, `A11Y-3`, `A11Y-4`, `A11Y-5`, `A11Y-7`, `A11Y-8`.

Dark mode: N/A — the site is light-only by design. `products:`-scoped controls
out of scope — product outside the portfolio.

## Waivers granted

None. No L0 or L1 control is violated by this change.

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| | | | | inline `dx-waive` / this record |

## Plan approval

- **Approved by:** wondopamine (builder) — the change is the builder's own
  stated request, quoted above. An explicit ask to build a named change counts
  as approval (stop-once rule).
- **Approved on:** 2026-08-17

## Verify verdict

- **Evaluator verdict — round 1 (`dx-design-review`): pass-with-findings.** No
  L0 or L1 control violated. Gates re-run by the reviewer against its own fresh
  `pnpm build` + `pnpm start` rather than the coordinator's preview server;
  **44 e2e passed**, and `tests/site-contract.spec.ts` shows 26 insertions and
  **zero deletions**, confirming the pre-existing reduced-motion scrub test
  passes unmodified.

  Quality grades: design quality **acceptable**, originality **strong**, craft
  **acceptable**, functionality **strong**.

  Confirmed by the reviewer's own measurement: isolation correct in all three
  states at all four widths; **autoplay genuinely unchanged** — a 721-frame rAF
  trace showing figure height 544.5px at every sample with a maximum
  single-frame delta of **0.0px**, the ghost path intact, 145 distinct
  `translate` values so round 5's eased rise survives, and the last non-settled
  frame at **3961ms**, inside the WCAG 2.2.2 five-second boundary; exactly one
  `aria-current="step"` in every sampled state including across all 721 frames;
  keyboard, reduced-motion and no-JS all delivering the complete composition.

  It also **corrected its own first reading** on A11Y-2: the replay's focus ring
  initially measured grey because Tailwind v4's `transition-colors` includes
  `outline-color` and the button carries a 120ms duration — sampled at +200ms it
  is the `--color-ring` token. A transition frame, not a defect.

  **Findings, all advisory:**

  1. **The reserve breaks under text-only zoom** — the one real bug.
     `min-h-[504.5px]` is a fixed px constant reserving a height whose content
     is entirely rem-sized. Measured: at a **20px root** the default state is
     678.8px while every focused state is 554.5px, a **124.3px collapse on
     selection**; at a **24px root** the collapse is **248.8px**. The caption,
     the replay control, and at `max-lg` the whole stage list jump by that
     amount — precisely the defect the reserve exists to prevent.
  2. **Stage 03's accessible name inverts what it names** — it says the Save
     button sits "under a badge", but the badge renders **192px below** the
     screen (frame top 402.1px, badge top 594.1px). **An inherited plan defect,
     not executor drift**: the wording came verbatim from the plan's step 5. The
     reviewer considered grading A11Y-7 an L1 fail and declined, since none of
     the control's `Fails when` clauses match.
  3. **The figcaption is stranded 203px from its figure.** The graphic is
     centred; its caption is not centred with it. Answering the coordinator's
     question directly, the round-3 ghost finding **does not re-open** — that
     defect was an asymmetric, unexplained, permanent void with the object
     stranded at the top reading as mid-fade, and a symmetric 203/203 split
     around a centred object genuinely reads as placement. But the total blank
     is larger than round 3 measured (406px against 340px), and the orphaned
     caption is a new instance of the same "this space is missing something"
     read.
  4. **19% ink in the focused view** (LAY-5, pass-with-caveat) — recommended for
     human review rather than manufactured into a violation.
  5. **An orphan caret in the isolated stage-01 terminal** — the caret renders
     whenever `beat < FINAL_BEAT`, and stage 01 scrubs to beat 0, so the resting
     terminal shows a lone caret block on a second line: a wrapping artifact
     reading as a rendering seam, and a non-blinking cursor implying typing in a
     state at rest. Pre-existing, but isolation makes the terminal the only
     object on screen.

  Plus one code-clarity note: `statusLineIcon` carries `flex` while
  `regionOn(2)` appends `hidden` to the same class string, so two display
  utilities collide and resolve correctly **only because Tailwind emits
  `.hidden` after `.flex`** (verified in the served stylesheet at offsets 20211
  against 20173). It works, but the correctness lives in utility ordering rather
  than at the call site.

  **Both executor judgment calls were graded as plan compliance, not drift.**
  The reviewer reproduced the CNT-3 failure on the plan's verbatim 29-word
  label string itself, confirming the split was necessary, and independently
  reproduced 504.5px at all four widths, confirming the plan had explicitly
  required measuring rather than trusting its 521px placeholder.

- **Fixes applied after round 1** (commit `264f785`) — all five advisories
  closed. Stage 03's label corrected to "above a badge"; the caret gated on
  `typedCount < PROMPT.length`; the focus-mode centring moved onto the `figure`
  so the region and its caption centre as one group; the test's height
  assertion widened to 360; and the `flex`/`hidden` collision made explicit.

  **The reserve took three attempts, and the two failures were both errors in
  the coordinator's spec that the executor caught by measuring.** Recorded
  because the pattern matters more than the fix:

  1. **A rem constant cannot work.** The reviewer's suggested `31.53rem` held
     "within ~2px" at the width it was tested at, but does not generalise:
     `max-w-[15rem]` is 240px at a 16px root and 360px at a 24px root, so at
     narrow viewports the column constrains the figure below its cap, text
     wraps differently, and resting height climbs. Measured resting heights are
     544.5px at every width at root 16, but **703.16px at 320 against 678.78px
     at 360** at root 20. Worst case for any single value: **113.5px** at 320px
     width with a 24px root.
  2. **Measuring the wrong container also fails.** The second attempt measured
     the chain wrapper and applied it as the figure's `min-height`, which is
     short by exactly `gap-2` plus the figcaption — 40px at root 16, scaling to
     60px at root 24. The same 40px shortfall as attempt one, for an unrelated
     reason.

  The shipped mechanism is **measured, not declared**: a `ResizeObserver` on
  the `<figure>` captures its own resting height while `focused === null`, and
  that value is applied as an inline `minHeight` in focus mode. Self-consistent
  by construction, because it measures exactly the quantity it constrains. It
  also retires the maintenance hazard the review raised separately about a
  hardcoded constant, closing two findings with one change. One limitation is
  documented rather than hidden: if the root font size changes while a stage is
  focused, the reserve stays stale until the reader returns to the whole run.

  **Verified independently by the coordinator**, not accepted on report: a
  twelve-cell sweep at 320/360/768/1280 crossed with root font sizes 16/20/24,
  selecting each of the three stages at every cell — **worst delta 0.00px in
  all twelve**, zero console errors.

  The executor also **retracted its own earlier measurement**: the ~40px
  centring asymmetry it reported in the previous round was a defect in its own
  script, which compared the figure's bottom against the visible region's
  bottom rather than the figcaption's. With the boundary corrected there was
  never a real asymmetry once the reserve came from the figure. Blank space
  above and below the centred group now measures 203.25px each. The defect
  surfaced only because it re-measured after changing the mechanism — the
  discipline caught it, not the tooling.

- **Evaluator verdict — round 2 (same instance): pass, and this stands as the
  run's standing verdict.** No L0, L1 or L2 control violated. Every finding closed
  and independently re-measured except finding 4, which stays with the builder
  by explicit agreement. All nine gates re-run by the reviewer against its own
  production build rather than the coordinator's preview server: 92/92 unit,
  44 e2e, the pre-existing reduced-motion scrub test still passing unmodified.

  **The twelve-cell matrix verified independently: 0.00px in all twelve**, with
  the inline `minHeight` equalling each cell's resting height exactly — so the
  mechanism is self-consistent per cell, not merely correct where someone
  sampled. Zero console errors, including no ResizeObserver-loop warnings.

  **The reviewer retracted its own rem suggestion on measurement.** Resting
  height is width-invariant only at root 16 (544.5px at all four widths). At
  root 24 it spreads **930.25 / 871.75 / 813.25 / 813.25** across
  320/360/768/1280, a 117px range within one root. The cause is that
  `max-w-[15rem]` is 360px at that root, so at narrow widths the column becomes
  the binding constraint and text wraps more. The figure-derived constant would have been
  816.75px against the 930.25px needed at 320: **113.5px short**, the exact
  worst case. Its "within ~2px" was measured at 1280 alone and generalised to
  widths where the cap is not binding. In its own words, the same error class as
  the executor's script defect.

  **Its case for the ResizeObserver, stronger than the coordinator's:** the
  reserve is read from and applied to the same box, so
  `max(reserve, focused content) === resting` holds **by construction**. That
  makes the error behind both failed attempts — a value describing one box
  applied to a different box — *unrepresentable* rather than merely avoided. It
  also discharges the maintenance obligation in code rather than leaving it on a
  future human, and the `focused === null` guard is structurally sound rather
  than empirically lucky: the reserve is only ever active in the state where
  measurement is disabled, so no feedback path exists.

  **The staleness envelope, measured:** it requires an enlarged root *and* a
  mid-focus geometry change; there is **no jump at the moment of the change**
  (the focused view is simply under-reserved), and it **recovers completely** on
  return to the whole run. At root 16 a resize while focused has zero effect.
  The reviewer noted the comment named only the root-font-size trigger while
  viewport resize has the identical, more common envelope — closed by a
  one-line comment widening.

  Regression set re-measured and holding: autoplay across **721 rAF samples at
  a single figure height with a 0.00px maximum single-frame delta**; the ghost
  path's opacity floor exactly 0.400, never 0; 146 distinct `translate` values
  so the eased rise survives; settle at 3961ms inside the WCAG 2.2.2 boundary;
  `minHeight` never applied during a run, so the reserve is strictly a
  focus-mode construct; one `aria-current="step"` in all 721 frames; keyboard
  focus rings at three width-and-root combinations; replay 44×44 at root 16 and
  66×66 at root 24; reduced-motion and no-JS both complete, the no-JS render
  carrying **zero `.hidden` classes**. The reviewer also actively probed the
  four things this mechanism could plausibly break — observer feedback loop,
  hydration mismatch, observer leak, and margin collapse from the new badge
  wrapper — and found none.

  Finding 4's number is now **25% ink** rather than 19%, since the caption and
  its gap joined the centred group.

- **Fixes applied after round 2** (commit `3f64f90`): the staleness comment
  widened to name both triggers, viewport resize as well as root font size,
  with a note that the window causes no visible jump and self-heals on return
  to the whole run. Comment text only; the twelve-cell matrix was deliberately
  **not** re-run, and the executor said so plainly rather than implying it had.

## Final state of this run

Five commits on `plan-003-exec`, unmerged. The branch was cut from `03fecc6`,
partway through plan 002, so it also carries that plan's first three commits.

| Commit | What |
|---|---|
| `3994688` | Selecting a stage isolates its graphic; the reserve holds the column |
| `264f785` | The reserve becomes a runtime measurement; caption centres with its graphic; label, caret and test fixes |
| `3f64f90` | The staleness window's second trigger named |
| `058c881` | Builder-directed annotations under each focused stage |
| `0969973` | The redundant rows, duplicated mark and figcaption cut ("reduce unnecessary elements") |

Two review rounds, ending in a clean **pass** — the only surface in this
sequence to reach an unqualified pass. All five advisories closed except the
ink-to-air ratio, which stays with the builder by agreement.

- **Round 3 (fresh `dx-design-review` instance — the round-1/2 instance's
  transcript expired): pass-with-findings** on the builder-directed annotation
  enrichment (`058c881`). Independently reproduced: all 36 height sub-cells at
  0.00px; 721-frame autoplay at one height; no-JS and reduced-motion clean;
  ink ratio up from 25% to 45–58% per stage, so the round-2 open finding was
  graded "substantially reduced". Stage 02's two rows (the catalog and
  DESIGN.md sources) graded "genuinely strong — they earn their space". Three
  craft advisories: stage 01's first row and stage 03's row restated body copy
  visible in the same viewport (SLP-9); stage 03's accent-inked review mark
  duplicated the badge's mark 44.5px above it (CMP-7); and the figcaption had
  become indistinguishable from the annotation rows. Ratchet items filed:
  `token-audit.py` cannot see JSX inline styles or data-object colours (proved
  by mutation); no control asks whether an interaction's payload lands in the
  viewport at phone widths (measured 0–19% on screen at 320/360); no control
  asks whether a caption still reads as a caption.

- **Fixes applied after round 3** (commit `0969973`), under the builder's
  "reduce unnecessary elements" directive: stage 01 keeps only its
  non-redundant orchestrator row; stage 03's annotation deleted entirely
  (resolving the redundancy and the duplicated mark in one stroke); the
  figcaption deleted. Resting height dropped 544.5 → 504.5px at root 16 and
  **the measured reserve tracked it automatically — all 36 sub-cells again at
  exactly 0px**, which is the runtime-measurement mechanism proving itself.
  Centring now symmetric to the pixel (171.25/171.25, 116.25/116.25,
  146.5/146.5 per stage). Gates all green, 44 e2e.

## A finding this run surfaced but does not own

**The page has a text-zoom horizontal overflow, outside this section.** At 320px
with an enlarged root the document overflows: `scrollWidth` **322 at root 20**
and **386 at root 24** against a 320px viewport. The reviewer traced every
source and **none is in the run player** — they are the hero block's padding,
the `max-w-[13ch]` headline, and a `h-[22rem]` figure carrying the DXD mark. The
overflow is byte-identical before and after this change and in every focused
state, so this work neither introduced nor worsened it, and the run player's own
figure fits inside the viewport in all twelve cells (right edge 280/289/283 at
320px).

LAY-2 passes as written, because its normative test is 320 CSS px, which page
zoom produces without changing the root font size. But a reader who enlarges
text on a narrow screen gets a horizontally scrolling page, and that belongs to
someone. Recorded here rather than dropped; it needs its own plan.

## Open decisions for the builder

1. **Whether 19% ink in the focused view is acceptable**, particularly at 360
   where the isolated graphic sits off-screen above the stage button the reader
   has chosen. The two options the review surfaced are to accept the spacious
   reading, or to change the composition so the focused region and its stage row
   sit nearer each other. Scaling the region up is **not** among them — see
   "Rejected options".
2. **Carried from `landing-run-example.md`, unchanged:** SLP-5 on the six skill
   tiles, and the sparkles mark for Polish, now at four sites.

## Ratchet

Two new items, plus the carried ones from `landing-run-example.md` and
`landing-feature-grid.md`.

1. **[new] A measured layout constant hardcoded in a unit that does not track
   what it measures.** `min-h-[504.5px]` reserved a height composed entirely of
   rem-sized content, so the invariant survived page zoom but not text-only zoom
   (a 124.3px collapse at a 20px root, 248.8px at 24px). No control names it:
   TOK-2 covers margin, padding and gap only; LAY-2 covers 320px reflow, which
   page zoom satisfies. That makes it the **third instance on this surface of the
   family already at the top of the ratchet** — content that moves or vanishes
   under the reader with no rule naming it. A narrow deterministic sub-check
   exists: flag an arbitrary `px` value in a `min-h-[…]`/`h-[…]` utility whose
   sibling content is rem-sized, and require either a rem unit or a test
   asserting the invariant. Worth noting the commit **did** ship the guarding
   test — the gap was the unit, which is why a rule catches this and a test
   alone does not.
2. **[new] An accessible name that changes on interaction with no
   announcement.** New to this codebase: `aria-label` now swaps per state on a
   `role="img"` figure. No control asks whether a silently-changing accessible
   name needs a live region. It should not be added here — information parity
   holds through the stage list and `aria-current` — but the pattern now exists,
   and the next instance, where the information *is* only in the image, should
   have the question asked of it.
