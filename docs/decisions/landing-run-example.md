# Design decision record — the landing run as one worked example (`/`)

> Modification run over the shipped run section (see `landing-graphics.md` for
> the run this builds on). Scope: the "From a request to a reviewed result."
> player only — reframed as one worked example on realistic interfaces — plus
> the replay control. Executed via the improve skill's plan/execute flow
> (`plans/001-run-example-realistic-interfaces.md`, executor: a dispatched
> Sonnet agent), then carried through the design-review loop.

- **Date:** 2026-08-17
- **Product:** other — outside the portfolio. The DX Harness website itself;
  site accent Radix lime, light-only. `products:`-scoped controls are
  deliberately out of scope — product outside the portfolio.
- **Change type:** modification (one section re-framed; feature grid untouched)
- **Page type:** marketing / landing
- **Run type:** attended
- **The teacher and the moment:** none directly — the reader is a designer or
  builder arriving cold. This section is the one place the page shows the
  mechanism running rather than describing it.

## Sprint contract (done-criteria)

1. The feature grid's abstract-geometry figures stay exactly as shipped; the
   run section alone becomes the worked example.
2. The example plays a happy-path sequence on realistic interfaces: the
   natural-language ask in the terminal, then the Orchestrator skill visibly
   running the specialised skills — each carrying the same ink tool mark the
   skills section uses — then a realistic settings screen returning with the
   review's verdict.
3. The replay control shrinks to (almost) an icon alone, without reopening
   the A11Y-4 mobile floor (44px hit area) or losing its accessible name.
4. The prior run's hard constraints hold: autoplay total under five seconds
   (WCAG 2.2.2), motion tokens only, no bounce, reduced-motion and no-JS
   readers get the complete composition, stages stay scrubb-able with
   `aria-current` tracking.
5. Build, unit, e2e, and the four deterministic `checks/` scripts stay clean.

## Chosen approach

The builder proposed two directions in their own words and picked the second
with a refinement: Option 1 (icon-and-abstract-graphic compositions for the
feature cards) was set aside — the grid keeps its abstract geometry — and
Option 2 (surface real interfaces) landed in the run section, framed as "one
example to explain how all those above would actually work" on a happy path.

Built shape (`components/landing/harness-run.tsx`): terminal (ask only) →
connector → orchestrator run panel (`dx-design` with its waypoints mark
"picks the passes", then indented rows: `layout pass · reads catalog +
DESIGN.md` with the pattern mark, `polish pass · …` with the polish mark,
`plan approved · building` with the execute mark) → connector → a miniature
real Settings screen (heading, labeled fields "Display name" / "Reminders",
a labeled Save block) → `design review passed` badge with the review mark.
Beats extended 0..5, autoplay settles ≈4.0s; the stages scrub to beats
0/4/5. The replay is an icon-only control: the ink refresh mark
(`harness/loop`) on a 44px button with `aria-label` and `title`.

Review-directed refinements across three rounds: un-revealed regions keep a
faint ghost frame (opacity-40) so reserved space reads as incoming, not
missing — in mid-autoplay and when scrubbed back to stage 01; the prompt row
reserves two line heights so the terminal never changes height mid-run; the
replay carries the site's shared secondary-control resting affordance
(hairline border + title); icon rows align their marks to the first line of
wrapped text; the drawn Save block carries its label; the ghost frame's 6px
rise eases via `transition-[opacity,translate]` (Tailwind v4 compiles
`translate-y-*` to `translate`, which a `transform` transition never
animates); the panel's indent rule arrives with its first row.

## Rejected options

- **Nothing was rejected from the builder's brief.** An earlier version of this
  record claimed Option 1 (icon compositions in the feature grid) was rejected.
  That was a misreading: "keep the current abstract graphic oriented comm for
  the What harness gives your agent" meant keep that *communication style*, not
  leave the section unchanged. The feature grid's ink-icon rework — each card
  drawn with the icon-generator marks spelling out its message (FIG 1: voice /
  prompt mark → orchestrator mark → the specialised skill marks, and the same
  treatment for the other three) — remains **outstanding**, tracked in
  `plans/README.md` and on the design ticket. This run's scope was the run
  section and the replay control only.
- **Keeping the labeled replay button**: rejected by the builder ("almost just
  with the refresh icon only"). The review then required the icon-only control
  to keep a resting border and title — icon-only is a size decision, not a
  licence to be affordance-free.
- **A visible pause/stop control for autoplay**: unnecessary — the run stays
  under the five-second boundary instead.

## Tradeoffs, named

- **The plan said "the replay stays a ghost control"; the build departs.** The
  round-3 review measured the borderless glyph as affordance-free (CMP-7) and
  directed the resting border + title. Reviewer-directed drift, reconciled in
  the plan file — recorded here so plan and build never disagree silently.
- **The terminal reserves a second prompt line it only uses mid-run** (~19px of
  air at rest) — the cost of never changing height during playback.
- **Ghost frames show scaffolding.** A reader who scrubs to stage 01 sees two
  faint empty frames; the alternative (a 340px void) measured worse. The
  orchestrator panel's ghost hairline is near-imperceptible (1.08:1) and reads
  mainly by its fill and shadow — parity with the result frame's blueprint
  hairline is a possible later refinement, noted by the round-4 review.
- **Executor isolation did not hold on the second dispatch.** The plan's
  executor first ran in an isolated worktree cut one commit behind the base
  and stopped correctly; the resumed run operated in the main checkout on a
  fresh branch (`plan-001-exec`) because the original worktree had been
  auto-cleaned. No damage — the base branch was untouched, scope held to the
  two in-scope files, and the reviewer re-verified everything — but the
  process deviation is recorded.

## Controls in scope

`TOK-1`, `TYP-1`, `TYP-2`, `TYP-3`, `COL-1`, `CMP-1`, `CMP-5`, `CMP-7`,
`SLP-4`, `SLP-8`, `SLP-9`, `MOT-1`, `MOT-3`, `LAY-2`, `LAY-5`, `LAY-6`,
`A11Y-1`, `A11Y-2`, `A11Y-3`, `A11Y-4`, `A11Y-5`, `A11Y-7`, `A11Y-8`.

CMP-2/CMP-3/A11Y-11: N/A — the player is a narrative drawing; no real async or
destructive action. `products:`-scoped controls: deliberately out of scope —
product outside the portfolio.

## Waivers granted

None granted this run.

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| | | | | inline `dx-waive` / this record |

## Plan approval

- **Approved by:** wondopamine (builder) — the direction was the builder's own
  recommendation, stated verbatim ("keep the current abstract graphic oriented
  comm … frame this as one example … with realistic interfaces … Make the
  replay button smaller. Almost just with the refresh icon only."), with the
  execution route named explicitly ("Use /Improve skill to execute and
  outsource to the right model"). An explicit ask to build a chosen direction
  counts as approval (stop-once rule).
- **Approved on:** 2026-08-17

## Verify verdict

- **Screenshots:** session scratchpad `evidence-3/` (post-build: run-playing,
  run-finished, run-scrub-stage1, run-reduced-motion) and `evidence-4/`
  (post-round-3 fixes: same set), plus the reviewer's own captures under
  `scratchpad/rev/` (round-4/5 pixel-sampled crops).
- **CMP-3 evidence:** N/A — state does not exist: the section is a narrative
  drawing of a run; no real async action ships on this page.
- **Dark mode:** N/A — product has no dark mode (light-only by design).
- CMP-1: asserted, no manifest — manifest absent for the dx-harness site;
  evidence source: the reviewer inspected the product codebase directly. The
  reviewer also noted the replay stays a raw `<button>` although
  `components/ui/button.tsx` ships a Base UI Button that covers the need —
  a pre-existing site-wide convention (every landing chrome control is a raw
  button on the shared focus-ring string), inherited, not introduced here;
  rationale recorded here rather than waived.
- **Reviewer continuity note:** rounds 1–2 of this surface's review live in
  `landing-graphics.md`. The round-3 reviewer instance below could not be
  resumed for the re-check (transcript expired); rounds 4–5 ran on a fresh
  `dx-design-review` instance with round 3's findings quoted verbatim in its
  dispatch. Both instances measured the live build themselves.
- **Verification ledger:**

  | Control | Method | Evidence |
  |---------|--------|----------|
  | TOK-1 | script | `checks/token-audit.py app components lib` exit 0 (builder and reviewer runs) |
  | TYP-1..3 | script | `checks/type-scan.py app components` exit 0; all new text 12px labels or larger |
  | A11Y-1 | script | `checks/contrast.py --tokens` exit 0; reviewer measured all 12 new text nodes — lowest 4.87:1; Save label 13.14:1 on lime |
  | A11Y-2 | manual | reviewer: real Tab traversal — all four controls show `solid 2px rgb(88,120,40)` at 2px offset |
  | A11Y-3 | script | `checks/a11y-static.py` exit 0; icon-only replay carries `aria-label`, svg `aria-hidden` |
  | A11Y-4 | manual | reviewer: replay 44×44 at 320/360/768/1280 |
  | A11Y-5 | manual | reviewer: reduced-motion context renders the complete composition at opacity 1; `motion-reduce:transition-none` on every transition |
  | A11Y-7 | manual | reviewer: rewritten figure `aria-label` names the orchestrator, both passes, catalog + DESIGN.md, approval, build, review, and the screen |
  | A11Y-8 | manual | reviewer: `aria-current="step"` count exactly 1 in every sampled state, tracks the highlight |
  | COL-1 / CMP-5 | manual | one filled action on the page (hero); the drawn Save block is `aria-hidden` inside `role="img"`, not focusable |
  | CMP-7 | manual | reviewer: replay resting style matches the site's shared secondary-control pattern (five sibling call sites cited) |
  | SLP-4 | manual | reviewer: run panel and screen are siblings, not nested cards; indent block is border-l only |
  | SLP-8 / MOT-1 | manual | reviewer frame-traces: all transitions on `--motion-*`/`--ease-*` tokens; autoplay settles 3.98–4.02s, inside the 5s boundary; no `animate-*` utilities |
  | MOT-3 | manual | reviewer: reduced-motion and no-JS renders carry the full composition; nothing depends on movement |
  | SLP-9 / CNT-3 | script | `checks/content-lint.py components/landing/harness-run.tsx` exit 0 |
  | LAY-2 | manual | reviewer: 320px `scrollWidth` = `innerWidth`; figure 40→280; e2e overflow suites pass |
  | LAY-5 / LAY-6 | manual | figure widened to `max-w-[15rem]`; terminal constant 98px and figure constant 545px across a full replay (95 samples); icon marks within 0.5px of first-line centre |
  | e2e contract | script | `pnpm test:e2e` 43/43, including the reduced-motion assertions on the two skill-pass rows |

- **Evaluator verdict — round 3 (`dx-design-review`), pasted verbatim:**

> Round 3 graded. I re-served the build at commit `01dde60` and instrumented the animation frame-by-frame rather than reading the stills — the timeline data changes two of my answers to your questions.
>
> VERDICT: pass-with-findings
>
> *(No L0/L1 violation. The finished state is materially better than round 2 — this is the first version where the mechanism actually reads as a product. But the change ships two reachable states that read as broken, one of them permanent.)*
>
> ADVISORY (should fix):
>
> - **"Makes the mechanism legible in one pass" (contract item 2) — partially met; the stage-01 scrub state does not resolve.** `jumpTo(0)` hides both the orchestrator panel and the result screen while their height stays reserved, so clicking stage 01 leaves the terminal at the top and roughly **340 px of empty column** beneath it — 163 px where the panel was plus ~180 px where the Settings screen was — then a caption and a grey glyph. `evidence-3/run-scrub-stage1.png` shows it (the screen is caught mid-fade-out; 600 ms later it is fully blank). Unlike the mid-autoplay void this state **never resolves** — it persists until the reader acts again. And it got *more* reachable as a direct consequence of the round-2 fix: making the stage buttons discoverable made landing here likely. Before this change the same state was compact, because the terminal held all four status lines and the result panel was the only reserved element.
> - **Components stay consistent with defaults and sibling usage (CMP-7, L2) — the icon-only replay has no resting affordance at all.** Measured at rest: `borderWidth: 0px`, `backgroundColor: rgba(0, 0, 0, 0)`, `color: rgb(103, 103, 111)`, and `title: null`. So a sighted pointer user gets a small grey glyph with no border, no fill, no label and no tooltip, in the same `--muted-foreground` as the figcaption directly above it — nothing separates it from the caption typographically. The recorded reason covers the *icon-only* decision, which is legitimately the builder's call; it does not cover the *affordance-free* decision, and those are separable. This is the same pattern I flagged on the stage buttons in round 1 and you fixed in round 2 — a control whose only affordance is hover. Answering your Q2 directly: **yes, it needs a resting border.** Keep the icon, restore the `border border-border` it replaced, and add `title="Replay the run"` so the tooltip carries what the label used to.
> - **Layout shift mid-animation: the terminal changes height twice per run (close call, not a control failure).** Removing `min-h-[104px]` left the prompt line free to reflow. Traced across a replay: terminal is **79 px at 8 ms → 98 px at 701 ms → back to 79 px at 2975 ms**. The 19 px jump happens when the caret wraps to a second line, and again in reverse when the caret is removed at the final beat — pushing the panel, both connectors, the Settings screen, the review badge, the caption and the replay button down and back up. This is the same defect class the reserved row heights were introduced to avoid, so the reasoning is applied inside the panel but not one element above it. A `min-h` sized for two lines on the prompt row closes it.
>
> ANSWERS TO YOUR FIVE QUESTIONS:
>
> 1. **Does the empty interval read as broken? Partly — but the interval you described is not the one that matters.** My frame trace: the panel reaches full opacity at 1592 ms and its first indented row starts at 1592 ms, so the header-only-with-dangling-left-rule state lasts ~350 ms, and the partially-filled state ~1.4 s. That is forgivable — a header that says "dx-design picks the passes" above a filling list is a recognisable streaming-log idiom, and reserving the height is the right call. The problem is the *other* void: the Settings screen's ~180 px stays blank from 0 ms to 3308 ms, i.e. **3.3 s of a 3.9 s run**, which is what makes `run-playing.png` read as a rendering failure rather than as a run in progress. Reserving the space is still right; leaving it visually empty is not. Give the reserved regions a quiet placeholder — a hairline ghost outline at low opacity, or the panel/screen fading in as a unit at reduced opacity before their contents land — so the space reads as "incoming", not "missing". That also fixes the stage-01 state above.
> 2. **Icon-only replay** — needs a resting border. See advisory above.
> 3. **`statusLineIcon` beside `statusLine` — good call, keep it.** Two variants of one line pattern with a recorded typographic reason is exactly the optical-vs-geometric distinction LAY-6 asks for, not the inconsistency CMP-7 penalises; text lines want a baseline bake, icon rows want the mark optically centred. One refinement: `items-center` is right for a single-line row, but "layout pass · reads catalog + DESIGN.md" and "polish pass · …" both wrap to two lines at this width, so their icons centre against the whole two-line block instead of against the first line. `items-start` with a small top offset reads tighter for a leading icon beside wrapped text.
> 4. **The Settings labels sharpen my CMP-5 caveat but do not change the verdict — still a pass.** The lime block is `aria-hidden` decoration inside `role="img"`; it is not one of the view's actions, and CMP-5's "one primary per distinct region" reading covers a depicted screen. What changed is craft: in an abstract diagram an unlabeled filled block read as "a primary, abstractly"; beside real "Display name" and "Reminders" labels it now reads as a **Save button with its label missing** — the one un-designed element in an otherwise designed miniature. A 12 px "Save" in `--foreground` fits the 24 px block, stays on TYP-2's label floor, and measures 13.6:1 on lime.
> 5. **Sparkles — noted, not re-litigated.** Recording only that the open decision now has two sites (skill tile + run panel row). Both resolve from one line, `scripts/generate-ink-icons.mjs:45`, so the pending decision has not become more expensive.
>
> SUGGESTIONS (not violations):
>
> - Give the reserved panel and screen regions a low-opacity ghost outline while empty — fixes both the mid-autoplay void and the stage-01 state with one change.
> - `items-start` on the two wrapping icon rows so the tool mark aligns to the first line.
> - Label the drawn lime block "Save" (12 px, `--foreground`) — completes the miniature and makes the depicted primary legible.
> - `title="Replay the run"` alongside the restored border, so the tooltip replaces the visible label the icon-only change removed.
> - Consider whether stage 01 should scrub to beat 0 at all, or to a beat where the panel has appeared — the stage's own copy ("You type the ask in plain words") is satisfied either way, and the latter has no void.
>
> QUALITY GRADES (changed section only):
>
> - **Design quality — strong.** The terminal → orchestrator panel → indented tool rows → Settings screen → review badge chain is now a genuine causal read; naming the two passes and showing each reading catalog + DESIGN.md is the first version where the section earns the heading above it.
> - **Originality — strong.** Reusing the skills section's own ink marks as the run's tool marks is a real system decision — the same mark means the same skill in both places — and it is the opposite of generic.
> - **Craft — weak.** Three measurable defects in one section: a 340 px permanent void in a reachable state, 3.3 s of visible blank during the run, and a 19 px height jump twice per play. Each is small; together they mean the section only looks finished in its finished state.
> - **Functionality — acceptable.** Autoplay, scrub, replay, no-JS and reduced-motion paths all work and the new e2e row assertion guards the reduced-motion state; the deduction is that one scrub destination leaves the reader worse off than before they clicked.
>
> [Round-3 verification ledger and carryovers omitted here only where they duplicate rows superseded by rounds 4–5 below; the full text is preserved in the session transcript. Carryovers named: SLP-5 on the skill tiles (with the builder), the sparkles mark (with the builder), and the hover-reflow ratchet item, strengthened by the terminal height jump as a second instance of animation- or interaction-induced layout shift that no LAY or MOT control covers.]

- **Fixes applied after round 3** (commit `674415f`): ghost frames on
  un-revealed regions; replay resting border + `title`; `min-h-[2lh]` prompt
  reserve; `items-start` + 1px icon nudge; "Save" label on the drawn block.

- **Evaluator verdict — round 4 re-check (fresh `dx-design-review` instance), pasted verbatim:**

> All measurements below are mine, taken from the 674415f build on http://127.0.0.1:3000 (Playwright + pixel sampling of fresh captures), not from the fixer's numbers.
>
> **VERDICT (changed section — "From a request to a reviewed result."): pass-with-findings**
>
> **1. Ghost states — RESOLVED (with caveat).** At stage-01 scrub (320/360/768/1280): panel `opacity 0.400`, result frame `0.400`, both connectors `0.400`, and every gated child at exactly `0` — no muddy half-visible text. Figure height is 545 px in every state, so nothing reflows. The never-resolving void is gone. Mid-autoplay the result frame now ghosts from 0 ms instead of sitting blank until 3.44 s, which closes the "reads as a rendering failure" half. Caveat, measured on rendered pixels against the `#fafafa` ground: the result frame's ghosted hairline is `(185,198,166)` = **1.72:1** (clearly visible), the orchestrator panel's is `(241,241,242)` = **1.08:1** — at the edge of perception; that box reads mainly by its white fill plus `shadow-sm`. Parity would come from ghosting the panel on the same blueprint hairline.
>
> **2. Replay affordance — RESOLVED.** At rest: `border-top-width 1px`, `rgb(228,228,231)` (`--border`), background `rgb(255,255,255)` (`--surface`), radius 8 px, `title="Replay the run"`, `aria-label="Replay the run"`. 44×44 at 320/360/768/1280. Hover: border → `--border-strong`, colour → `--foreground`. Focus-visible via real Tab traversal: `solid 2px rgb(88,120,40)` at 2 px offset. CMP-7 sibling check passes strongly — this is now verbatim the site's shared secondary-control pattern (`components/page-actions.tsx:14-18`, `catalog-browser.tsx:131`, `prev-next.tsx:20`, `diagrams/motion-scale.tsx:61`, `app/(docs)/for-agents/page.tsx:19`), so the fix joined the convention rather than inventing a variant. Two caveats: the resting hairline is 1.22:1 against the page ground, so identification still rests on the 4.9:1 glyph (acceptable under 1.4.11, but a whisper); and `plans/001-run-example-realistic-interfaces.md:129-130` says "the replay stays a ghost control" — the build now deliberately departs from that plan line on the round-3 reviewer's instruction. Reviewer-directed drift, but record it so plan and build don't disagree silently.
>
> **3. Terminal height — RESOLVED.** 95 samples at 45 ms across a full autoplay at 1280: terminal height **98 px at every sample**; figure 545 px at every sample; 98 px in the finished state at 320/360/768/1280 too. The 79 → 98 → 79 jump is gone. Cost worth naming: at rest the prompt is one line, so ~19 px of the reserved `2lh` sits empty inside the terminal — a fair trade for stability.
>
> **4. `items-start` + `mt-px` — RESOLVED.** All five icon rows at all four widths: icon box top 1.0 px above the first line box top, icon-mid vs first-line-mid delta 0.5 px — identical on single-line and wrapping rows. The mark no longer drifts to the middle of a two-line block.
>
> **5. "Save" label — RESOLVED.** Rendered: text `Save`, `12px`, weight `600`, `rgb(24,24,27)` on `rgb(189,238,99)`, 64×24, centred. Re-measured contrast **13.14:1** — the new code comment claims 13.6:1; `app/globals.css:18` already states 13.14:1, so the comment should be corrected to match the token file. CMP-5 unchanged: still `aria-hidden` decoration inside `role="img"`, not focusable, no pointer cursor.
>
> **Regression checks — all clean.** Autoplay: beat 5 fires 3.44 s after `play()`; result opacity reaches 1.000 at 3.98–4.01 s — under the 5 s WCAG 2.2.2 boundary with ~1 s margin. `aria-current="step"` count is exactly 1 in every state sampled. Focus rings intact on all four buttons. Reduced motion: full composition. No-JS render: full final composition. 320 px: no overflow. `tests/site-contract.spec.ts` — 43/43. Re-ran (not trusted): `token-audit.py`, `a11y-static.py`, `type-scan.py`, `contrast.py --tokens`, `content-lint.py` — all exit 0.
>
> **NEW findings introduced by the fixes:**
>
> - **ADVISORY (craft) — the result frame's 6 px rise is now a visible jump-cut.** `translate-y-1.5` compiles to Tailwind v4's `translate` property, but the element declares `transition-[opacity,transform]` — computed `transitionProperty` is `"opacity, transform"`, so `translate` is never transitioned. rAF trace: `60ms translate=0px 6px top=516.6` → `3438ms translate=none top=510.6` in a single frame, while opacity is still 0.4 and only then fades to 1 over 600 ms. Before this commit the element was at opacity 0 during the offset, so the snap was invisible; at opacity 0.4 it is a visible 6 px jump, and the ghost frame sits detached from its connector for the whole wait. Either `transition-[opacity,translate]` or dropping `translate-y-1.5` from the ghost state closes it. No control covers this — file it for the ratchet.
> - **SUGGESTION — gate the panel's inner left rule with its rows.** `border-l border-border pl-3` draws at full height while rows 2–4 are hidden, so an orphan hairline hangs in ~120 px of empty white for ~1.4 s mid-run and again inside the empty ghost at stage 01.
> - **SUGGESTION — correct the in-code contrast claim** ("Foreground on lime measures 13.6:1" → 13.14:1) so it matches `app/globals.css:18`.
>
> Carryovers still open, not re-litigated: SLP-5 on the six skill tiles (L2, no rationale recorded); the sparkles mark for Polish at two sites. Also noted: no `.dx/` directory exists in this repo — no standing overrides, no component manifest, no DESIGN.md — so **CMP-1: asserted, no manifest — manifest absent for the dx-harness site**, evidence source (a) reviewed the product codebase directly; the replay stays a raw `<button>` although `components/ui/button.tsx` ships a Base UI Button with `variant="outline" size="icon-lg"` that covers the need. That is a pre-existing site-wide convention (every chrome control is a raw button on the shared `focusRing` string), not something this commit introduced — it wants one recorded rationale or waiver, not a blocking finding here.

- **Fixes applied after round 4** (commit `3618a45`):
  `transition-[opacity,translate]` on the result frame; the indent rule gated
  with its first row; the contrast comment corrected to 13.14:1.

- **Evaluator verdict — round 5 re-check (same instance as round 4), pasted verbatim — this is the run's standing verdict:**

VERDICT: pass

> Round 5 re-check on 3618a45, measured myself against the live build.
>
> **1. Ghost frame's 6 px jump-cut — RESOLVED.** Re-measured independently. Computed on the served build: `transitionProperty: "opacity, translate"`, `0.6s`, `cubic-bezier(0.215, 0.61, 0.355, 1)`. rAF trace across a full replay: **145 distinct `translate` values**, and the **largest single-frame `top` delta is 0.26 px** — against the 6.00 px single-frame snap I measured on 674415f. The rise eases to completion at 4023 ms with the frame seated on its connector. Opacity reaches 1.000 at ~3.998 s and the rise finishes at ~4.02 s — still about a second inside the 5 s WCAG 2.2.2 boundary. Reduced motion still short-circuits it. Residual, not a finding: during the ghost wait the frame sits 6 px below its connector — the rise's start point; it now reads as motion rather than a defect.
>
> **2. Orphan indent rule — RESOLVED.** Measured `indentOp: 0` at the stage-01 ghost at 1280/360/320 and under reduced motion; in the replay trace it goes 1 → 0 by 331 ms and returns to 1 at ~2331 ms — it arrives with its first row, not before it. One observation for the record, not a re-opened finding: mid-run the rule spans the reserved height of the two hidden rows below it for ~1.4 s — that reads as "more rows coming", which is the opposite of the orphan problem, so I'd leave it.
>
> **3. Contrast comment — RESOLVED.** Now reads 13.14:1 with the token-file pointer, matching my own re-measurement.
>
> **No regressions.** Terminal 98 px and figure 545 px at every state and width sampled; exactly one `aria-current="step"` throughout; `design review passed` present in every state; 320 px no overflow. Gates re-run by me: `token-audit.py`, `a11y-static.py`, `type-scan.py`, `contrast.py --tokens`, `content-lint.py` all exit 0; `tests/site-contract.spec.ts` 43/43.
>
> **VERDICT (changed section — "From a request to a reviewed result."): pass**
>
> Round-3 and round-4 items stand as previously graded; the two carryovers stay open with the builder — SLP-5 on the six skill tiles (L2, no rationale recorded yet) and the sparkles mark now serving Polish at two sites. The one item worth carrying into the decision record rather than the code: `plans/001-run-example-realistic-interfaces.md:129-130` still says "the replay stays a ghost control", which the reviewer-directed border fix deliberately departs from, so plan and build should be reconciled in writing.

## Open decisions for the builder

Carried forward from `landing-graphics.md`; both resolved 2026-08-18
(builder-delegated rulings, recorded in full in `landing-feature-grid.md`):

1. **SLP-5 on the six skill tiles** — waived in the inline recorded-rationale
   form (correct for L2) at the tile in `app/(landing)/page.tsx`.
2. **The sparkles mark for Polish** — kept: it names the Polish skill
   literally and nothing on the surface uses sparkles decoratively; all sites
   resolve from the one generator line.

## Ratchet

Carried and strengthened from the previous record, plus one new
`[proposed — pending design-lead approval]`:

1. **Animation- or interaction-induced layout shift needs a control.** Third
   instance this surface: the hover-reveal row shift (run 1), the terminal
   height jump (this run, round 3), and the reserved-region voids are all the
   same family — content that moves or vanishes under the reader with no rule
   naming it.
2. **Transition property must actually cover the animated property.** Tailwind
   v4 compiles `translate-*`/`rotate-*`/`scale-*` to their own CSS properties;
   a `transition-[...,transform]` silently animates none of them. A
   deterministic check could catch `translate-`/`rotate-`/`scale-` utilities
   whose element transitions `transform` but not the matching property.
3. (Standing from run 1) visible pause/stop past five seconds of autoplay
   (WCAG 2.2.2); sparkle/star "AI magic" iconography for the SLP list.
