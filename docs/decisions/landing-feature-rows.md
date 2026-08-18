# Design decision record — landing feature rows (illustrated)

> Replaces the "What the harness gives your agent." 2×2 figure grid with three
> alternating illustrated rows from the builder's own reference. The prior
> treatment's record is `landing-feature-grid.md`; this record supersedes its
> surface (the four ink-mark figures and their hover-reveal are retired).

- **Date:** 2026-08-18
- **Product:** other — the dx-harness site itself (no `products:`-scoped controls
  apply; the site self-applies the portfolio standard)
- **Change type:** modification (section rebuild)
- **Page type:** landing section (marketing surface)
- **Run type:** attended
- **The builder and the moment:** the builder judged the drawn-figure grid was not
  conveying the message and supplied a designed reference (PDF) plus three
  hand-drawn illustration clips; the ask was to make the section match them.

## Sprint contract (done-criteria)

1. The section is rebuilt as three alternating full-width rows matching the
   builder's reference: illustration one side, text the other, sides swapping
   each row, "Why it matters" inline instead of hover-revealed.
2. The three Midjourney clips (624×624, ~5s, H.264) **loop** in the graphic
   frames while their row is on screen, and never start under
   `prefers-reduced-motion` (A11Y-5). Because a loop runs past five seconds
   beside other content, WCAG 2.2.2 requires a pause mechanism: a 44px,
   labelled pause control, bordered like the run player's replay (CMP-7),
   transparent at rest and revealed on hover, on keyboard focus, on coarse
   pointers, and under reduced motion.
3. Copy carries over verbatim from the reference (which matches the prior cards);
   SLP-9 clean; "catalog" spelling kept.
4. The review card leaves this section per the reference; its message remains on
   the page in the run's stage 03 and the skills table, and the markdown twin
   says where the review went.
5. L0s hold; the section reflows at 320 with no horizontal overflow; evidence at
   360/768/1280 plus the looping, paused-at-rest, hover-revealed, and
   reduced-motion states.

## Chosen approach

The builder's reference was the direction — diverge was skipped and the explicit
"make it happen" ask carried plan approval (stop-once rule). Built:

- `app/(landing)/page.tsx`: `FEATURES` reduced to three entries carrying video,
  poster, subject, and a `flip` flag; the grid replaced by `<ul>` rows of
  `lg:grid-cols-2` with the illustration cell first in DOM (mobile always reads
  illustration → text) and `lg:order-2` + seam-side border when flipped. Claim
  steps up from `text-lg` to `text-xl` (20/14 = 1.43× against the body, SLP-6
  clean); eyebrow/body/why styles carry over. FIG numbers retired with the
  figures.
- `components/landing/illo-video.tsx` (new client component): the clip carries
  `loop`, and an IntersectionObserver ties playback to visibility — it starts at
  ≥50% visible (unless reduced motion is set) and pauses when the row leaves, so
  nothing animates off screen. A pause the reader chooses is recorded in a ref
  and survives scrolling away and back, which is what makes the 2.2.2 mechanism
  real rather than nominal. The control toggles Play ⇄ Pause (ink icons
  `landing/play`, `landing/pause`), mirroring the run player's replay treatment,
  and is `opacity-0` at rest with `group-hover/illo`, `focus-visible`,
  `pointer-coarse` and `motion-reduce` reveals; its box is always reserved, so
  revealing it shifts no layout. The video is decorative (`aria-hidden`); the
  button carries the accessible name.
- Assets at `public/landing/`: `illo-{orchestrator,catalog,design-file}.mp4`
  (0.9–1.9MB, `preload="none"`) with 624px JPEG posters (56–102KB), each the
  clip's own first frame so there is no poster-to-video pop.
  **`illo-design-file.mp4` was replaced on 2026-08-18** at the builder's
  request: the tools-only still life became two figures with a notebook, pencil
  and brush, which reads closer to "your product's design language" and echoes
  the people in the catalog row above it. Same envelope (624x624, 5.04s,
  H.264, 1.9MB), so nothing downstream changed. Its poster was extracted from
  frame 0 of the clip itself through a canvas capture rather than supplied
  separately — `ffmpeg` on this machine is Playwright's stripped build and
  cannot demux MP4, so the browser is the available decoder.
- `content/sections/landing.mdx`: the section's twin drops the review paragraph
  and points at the worked example below ("Three parts … the review that closes
  each run is described in the worked example below.").
- Retired: `components/landing/feature-figure.tsx`, the `ff-*` choreography block
  in `app/globals.css` (and with it the MOT-1 inline waiver it carried — the
  recorded MOT-1 row in `landing-feature-grid.md` is now stale by design), the
  hover-reveal contract test (replaced by a reduced-motion + keyboard + pause-holds
  test on the illustration control).

## Rejected options

- **One pass that rests on its final frame, with a permanent replay button** —
  built first, then rejected by the builder on 2026-08-18: the standing replay
  button was chrome the drawing did not need, and a living loop carries the
  section better than a frozen last frame. Superseded by the loop above, which
  keeps the 2.2.2 mechanism but lets it recede.
- **Keep the whole-card links** — the old cards linked to their doc pages; the
  reference shows plain rows, and a row-wide link wrapping an embedded video
  control nests interactive elements. Dropped; every destination stays reachable
  from adjacent sections (skills band, compare's catalog link). Reversible by
  linking the claim headings.
- **Keep a fourth (review) row without a clip** — rejected: the reference is
  three rows and no fourth clip exists; a text-only fourth row would break the
  rhythm the reference establishes.

## Tradeoffs, named

- **~4.8MB of video enters the landing page.** Mitigated by `preload="none"` +
  posters (nothing fetches until a clip is half in view), but readers who scroll
  the section do pay for what they watch. Accepted for the message the drawings
  carry.
- **The review message loses its section slot.** It survives in the hero copy,
  the run's stage 03, and the skills table, but it is no longer one of the named
  "parts". The builder's reference makes this call; flagged at build time.
- **The pause control has no resting affordance on a fine pointer.** It is
  `opacity-0` until hover or focus, which is the price of the clean cell the
  builder asked for; the reveal target is the whole illustration cell, not a
  small hotspot, and touch, keyboard, and reduced-motion readers all get it
  unconditionally. **This sentence was false when first written** — the
  re-review measured the target as the 384x436 `group/illo` wrapper inside a
  519x532 cell, so hovering the cell padding revealed nothing. Rather than
  soften the claim, the build was changed to match it: `group/illo` now sits on
  the `[data-feature-illo]` cell, and a contract test hovers the cell padding at
  (6, 6) to hold it there. This is the one place on the surface where a control is
  discovered rather than seen — related to, but narrower than, the CMP-7 finding
  the run player's replay closed by keeping a resting border.
- **Looping motion is always present in the section.** Three clips loop while in
  view rather than settling. Mitigated by visibility-gated playback (nothing
  loops off screen) and the pause that holds once chosen.

## Controls in scope

**Tokens and type:** `TOK-1..3`, `TYP-1..4` (`TYP-6` measure), `COL-1`, `COL-2`.
**Layout:** `LAY-2` (320 reflow), `LAY-3` (template fit), `LAY-4`, `LAY-5`
(density), `LAY-6`, `LAY-7`. `LAY-1` N/A — no `layout_system` declared.
**Components:** `CMP-1` (verdict form below), `CMP-5` (untouched — hero keeps the
one filled primary), `CMP-7` (the control reuses the run player's replay
treatment), `CMP-9` (no cross-user content).
**Motion:** `MOT-1` (no interface motion beyond the control's 120ms opacity
fade; the clips are content, gated by visibility and reduced motion), `MOT-2`
(the one duration is the `--motion-fast` token), `MOT-3` (every claim the
drawing makes is also written beside it).
**Anti-slop:** `SLP-1..4` (no gradient, gradient text, side-tab border, or
nesting), `SLP-5` (rows, not a card grid), `SLP-6` (30 → 20 → 14px steps),
`SLP-7` (grouping spacing), `SLP-8` (no bounce), `SLP-9` (copy carried, not
generated), `SLP-11` (no card chrome added).
**Accessibility:** `A11Y-1`, `A11Y-2`, `A11Y-3` (control labelled), `A11Y-4`
(44px target), `A11Y-5` (reduced motion), `A11Y-6` (clip decorative, not
focusable), `A11Y-7` (heading order, real list), `A11Y-8`, `A11Y-10`.
**Content:** `CNT-1`, `CNT-3`, `CNT-5`, `CNT-6`, `CNT-12` (sentence case),
`CNT-13` (SG spelling; "catalog" is the locked carve-out), `CNT-14` (tone fit),
`IDN-3` (register).
**Out of scope, stated:** `CMP-2`/`CMP-3`/`A11Y-11` (no async or destructive
action), `CMP-4`, `CMP-6`, `CMP-8`, `CNT-2/4/7/10/11`, `TYP-5`, `SLP-10`,
`IDN-1`/`IDN-2` (no logo or product-icon mark — `IDN-2` governs the blue
rounded-square product-icon family, not the site's `InkIcon` UI glyphs),
`IDN-4` (product is not CaseSync).

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| SLP-5 | L2 | The six skill tiles further down the page keep their pre-existing inline waiver; this section itself is rows, not a tile grid. | — (L2, rationale form) | inline `dx-waive` in `app/(landing)/page.tsx` |

No new waivers for this section.

## Plan approval

- **Approved by:** the builder (wondo.jeong) — the reference PDF plus the verbatim
  ask "change the whole … section with the materials I am sharing … make it
  happen" names the chosen direction, which counts as approval under the
  stop-once rule.
- **Approved on:** 2026-08-18

## Verify verdict

- **Screenshots:** session scratchpad `evidence/` — `loop-1280-rest.png`
  (looping, control at `opacity: 0` — measured in the production DOM),
  `loop-1280-hover.png` (same cell hovered, control at `opacity: 1` showing
  Pause), `1280-row2.png` (flipped row), `768-row1.png`, `360-row1.png`. Loop
  and visibility-gating confirmed in the live DOM: with row 1 centred, the three
  clips read `playing loop=true | paused loop=true | paused loop=true`.
  Reduced-motion and pause behaviour verified by the contract test "looping
  feature illustrations honour reduced motion and stay pausable" (Playwright
  `emulateMedia`), which asserts poster-rest, a visible Play control, keyboard
  start, and that a keyboard pause holds. Frames added after the reviewer's
  evidence finding, each with its state measured in the same run:
  `loop-320.png` (320px, `scrollWidth=320`, `paused=false t=2.48 loop=true`,
  control `opacity: 0` — correct at 320 on a *fine* pointer, where hover is
  available), `loop-1280-reduced-motion.png` (`paused=true t=0.00`, control
  `opacity: 1`, label "Play the orchestrator illustration"), and
  `loop-touch-iphone14.png` — the coarse-pointer case the `pointer-coarse`
  reveal exists for: `matchMedia("(pointer: coarse)")` true, control
  `opacity: 1` at 44x44, so a touch reader who cannot hover still gets the
  pause.
- **Record audit:** `python3 plugins/dx-harness/checks/audit-record.py
  --repo-root . docs/decisions/landing-feature-rows.md` → `OK: 1 records
  audited`. The `--repo-root .` flag is required, not optional: the script
  defaults `REPO_ROOT` to the *plugin* directory
  (`plugins/dx-harness/`), so every repo-root-relative path a record cites
  resolves against the wrong tree and reports "referenced path does not exist" —
  including a record citing itself. Filed in the Ratchet; it is the same script
  defect class `landing.md` already logged (exits 0 while printing errors).
- **Deterministic checks:** `pnpm build` green (runs `check-standards` +
  `check:python`: validate, token-audit, a11y-static, type-scan, contrast);
  `waiver-reconcile --src app components lib --records docs/decisions` exit 0
  (one deliberate stale NOTE: the retired MOT-1 row, see above); typecheck green;
  vitest 21/21 on the twin/llms corpus after the mdx edit; Playwright contract
  suite 44/44 (re-run after the loop change). 320px `scrollWidth` = 320 in this section.
- **CMP-1: asserted, no manifest — manifest absent for the dx-harness site.**
  Evidence source (a): reviewed the product codebase directly. No `.dx/`
  directory exists, so there is no component manifest and no standing overrides;
  nothing in the Base UI / shadcn stack ships a video figure, and `IlloVideo`'s
  raw `<button>` matches the site-wide raw-button convention already recorded in
  `landing-run-example.md`.
- **Reviewer verdict (`dx-design-review`, 2026-08-18): pass-with-findings.**
  Recorded verbatim in "Reviewer verdict" below. **Scope note:** the reviewer
  graded the *first* build of this section — one-pass playback with a permanent
  replay button (its evidence reads `loop=false` and "rests on the final
  frame"). The builder then asked for looping playback, so every
  control-specific finding about the replay control was re-verified against the
  looping build; see "Findings addressed" for what changed and what carried.
- **Delta re-review (`dx-design-review`, 2026-08-18): pass-with-findings, no
  blockers.** It graded the looping build against the amended contract and
  answered the open question directly: **the `opacity-0`-at-rest control is
  acceptable and it would not hold ship for it.** Its reasoning: CMP-7 is L2
  with `waiver: rationale`, and its "do not flag" clause exempts a deliberate
  recorded override — which this is, with the reason and mitigations in
  "Tradeoffs" — while the clause with teeth for a control group (one shared
  resting and revealed state across all three) is satisfied. On WCAG 2.2.2 it
  confirmed the mechanism is available rather than required to be permanently
  visible, and verified the part that makes it real: it paused row 1 at
  `t=1.74`, scrolled to the page bottom and back, and read `paused: true,
  t: 1.74` unchanged.

### Reviewer verdict — verbatim

Recorded verbatim from the `dx-design-review` agent, 2026-08-18. It graded the
first build of this section (one-pass playback, permanent replay button); see
"Findings addressed" above for what the loop change superseded.

VERDICT: pass-with-findings

**Inputs used.** Sprint contract + approved plan + evidence list: `docs/decisions/landing-feature-rows.md`. Code: `app/(landing)/page.tsx` (lines 88–196), `components/landing/illo-video.tsx`, `content/sections/landing.mdx`, `tests/site-contract.spec.ts`, `app/globals.css`, `public/landing/`. Screenshots: the five frames listed in the record. Standing overrides: I looked for `.dx/design.json` myself — **the `.dx/` directory does not exist**, so there are no standing overrides in force and every control is graded against the catalogue text; LAY-1 is N/A (no `layout_system` declared). Product = `other` (the standard's own site), so `products:`-scoped controls (IDN-4) are out of scope. Interactive controls enumerated independently from code *and* the live DOM at `http://localhost:3000`: exactly three (`[data-feature-illo] button` × 3) — no control was missing from the builder's inventory. Dark mode: **N/A — product has no dark mode** (`app/globals.css:5-6`, no `.dark` layer; `@custom-variant dark` is declared but nothing renders it).

**Contract compliance (5 done-criteria)**

1. **Met.** Three `<li>` rows, `lg:grid-cols-2`, illustration first in DOM; measured at 1280: row 1 illo x=121/text x=640, row 2 illo x=640/text x=121 (`lg:order-2 lg:border-l`), row 3 back to illo-left. "Why it matters" renders inline in every row (`featureRows.getByText("Why it matters")` = 3).
2. **Met.** All three clips are 624×624 (measured `videoWidth/videoHeight`), 5.04/5.04/5.08 s, `muted playsInline preload="none" loop=false`. Autoplay fires once at ≥50% visibility and only for the row scrolled into view (observed: row 1 `paused:false t:1.93`, rows 2–3 `paused:true t:0`); under emulated `prefers-reduced-motion: reduce` **none** played (all `paused:true t:0`, all labels "Play the … illustration"). Control is 44×44 at both 320 and 1280, labelled, `rounded-lg border border-border bg-surface text-muted-foreground` — byte-for-byte the run player's replay classes (`components/landing/harness-run.tsx:487`). Pause and replay both verified live (Pause → `paused:true t:0.93`; resume → `t:1.23`; label tracked each time).
3. **Met.** Diffed against `git show HEAD:"app/(landing)/page.tsx"`: eyebrow / claim / what / why for the three retained rows are character-identical; "catalog" kept; `content-lint.py` (CNT-1/3/5/6 + SLP-9 lint half) clean on both the TSX and the MDX.
4. **Met.** The review card is gone; the twin reads "Three parts … the review that closes each run is described in the worked example below."; "A reviewed result" survives as run stage 03 and "Review" survives as an `h3` in the skills band (both confirmed in the rendered heading/focus order).
5. **Partially met (evidence, not behaviour).** Behaviour holds: at 320 CSS px `document.documentElement.scrollWidth = 320`, single column, all three controls reachable at 44px. Frames exist for 360/768/1280 + playing + ended; the reduced-motion state is evidenced by the Playwright test only (I re-ran it: 1 passed) and by my own emulation — no reduced-motion frame was captured. Also note the captures carry the Next dev-tools indicator (dark "N", bottom-left); it is **not** in the production DOM (`body > *` has no such node), so it is capture-environment chrome, not a page element.

**Plan fidelity.** No drift. Everything the "Chosen approach" section describes is what shipped, including the `text-lg → text-xl` step, the seam-side border following the flip, the Play→Pause→Replay icon cycle (`landing/play`, `landing/pause`, `harness/loop`), the spent-auto-pass guard, `preload="none"` + first-frame posters (57/102/120 KB), and the three retirements (`feature-figure.tsx` deleted, `ff-*` block removed, hover test replaced).

BLOCKING (must fix before ship):
- **The component-stack verdict must be recorded in one of three fixed forms (CMP-1, L1, no waiver on file)** — the record lists `CMP-1` in "Controls in scope" with a paraphrase ("CMP-1: asserted, no manifest — `.dx/` absent in this repo…") but its **Verify verdict** section carries no fixed-form line, and `controls/cmp-1.md` makes the form the control's verification requirement ("Zero forms → `audit-record.py` reports an error… a paraphrase fails the check"). Evidence: `python3 plugins/dx-harness/checks/audit-record.py docs/decisions/landing-feature-rows.md` → `ERROR … record claims CMP-1 but carries no CMP-1 verdict line`. The *component judgment itself passes* (see notes below) — the fix is one line in Verify verdict: `CMP-1: asserted, no manifest — manifest absent for the dx-harness site`, plus the evidence source ("reviewed the product codebase directly"). Every sibling record already carries it (`landing-feature-grid.md`, `landing-graphics.md`, `landing.md`, `landing-run-example.md`).
- **The decision record must pass its own record audit (contract item — `checks/audit-record.py`)** — `## Ratchet` is missing entirely; all six sibling records and `TEMPLATE.md` carry it. Evidence: `ERROR docs/decisions/landing-feature-rows.md: missing required section '## Ratchet'`. The audit's three remaining errors (no `VERDICT:` line, no `QUALITY GRADES` block, no verification ledger) clear when this verdict is pasted verbatim, ledger included.

ADVISORY (should fix):
- **Copy is free of proofreading errors (CNT-13, L2 — pass-with-caveat)** — the section mixes apostrophe glyphs in adjacent strings: `app/(landing)/page.tsx:116` "Your product**’**s design language." (U+2019) against `:102` "The routing is the harness**'**s job, not yours." (ASCII U+0027); the twin uses ASCII for both (`content/sections/landing.mdx:20,27`). Carried over verbatim under contract item 3, so it is inherited — but preserved is not waived, and it renders side by side at 1280.
- **Second person and active voice (CNT-3, L2 — close call, not a script hit)** — the twin's new clause is passive: "the review that closes each run **is described in** the worked example below". `content-lint` is clean (it scores sentence length, not voice). "The worked example below shows the review that closes each run" would carry the same pointer actively.
- **The record's "Controls in scope" list is narrower than the change** — a copy-bearing page/component change also pulls A11Y-6, A11Y-7, TYP-6, MOT-3, CNT-3/6/12/13/14, IDN-3, LAY-3, LAY-5, SLP-1..4, SLP-7. All of them pass on my read (rows below), but the record does not show they were considered, which is what the list is for.
- **The section now carries no outbound link** (the recorded "keep the whole-card links" rejection). Verified live: the page's only remaining destinations are `/harness/install`, `/standards/catalog`, `/harness/skills`, `/overview`, `/note`, GitHub. The DESIGN.md row's old destination (`/harness/skills#the-design-language`) is now two hops away via "See all skills". Not a dead end and not a control failure — naming it because the record's reversibility note is the mitigation, and nothing on the surface signals where a reader goes next.
- **No 320 frame in the evidence set** — the record asserts `scrollWidth = 320`; I confirmed it independently, so LAY-2 passes, but the assertion had no frame behind it. Same for the reduced-motion state (test-only).

SUGGESTIONS (not violations):
- Link each row's claim heading to its doc page — serves CMP-1's "destination reachable" intent and the record's own reversibility note — puts the reader one click from the catalog/skills page the row argues for, without nesting a link around the video control.
- Add a rejection handler to both `void video.play()` calls in `components/landing/illo-video.tsx` — craft — a blocked autoplay (iOS Low Power Mode) currently raises an unhandled promise rejection; the visible state is already correct, so this is console hygiene only.
- At 768 the clip is centred at 384 px while the copy starts at the 40 px gutter and stops at ~52ch, leaving ~290 px of void to its right — LAY-5/LAY-6 — left-aligning the clip to the text's edge would give the stacked bands one shared left edge.
- At 1280 each row is 532 px tall (clip-driven: 384 + 8 + 44 + 96 padding) against ~150 px of text in the other half — LAY-5 — one step off `sm:p-12` or `max-w-sm` shortens the band without touching the reference's rhythm.
- Ship a 2× clip (or cap the frame at ~312 CSS px) — craft — the 624 px source is upscaled to 768 device px on a retina 1280 view.

QUALITY GRADES:
- **Design quality — strong.** The read order is eyebrow → claim → what → why with real steps behind it (h2 30 px → claim 20 px → body 14 px = 1.5× then 1.43×), the alternation supplies rhythm without adding chrome, and hairline seams do the grouping a card would have done. The one soft spot is that each row's height is set by the illustration rather than composed, so the text half carries ~350 px of void.
- **Originality — strong.** This is the inverse of slop: hand-drawn clips produced through the exact route `content/guidelines/illustration.mdx` mandates (Midjourney with the brand SREF), a single deliberate lime accent, no gradients, no icon tiles, no glow. The motion is content that finishes its argument and rests on the final frame — character in service of the task, not decoration on top of it.
- **Craft — strong, with named nits.** `aspect-square w-full` reserves the box so nothing shifts; posters are the clips' own first frames so there is no poster→video pop; the auto-pass is marked spent the moment the reader takes control (scrolling never restarts motion they stopped); `idSuffix` keeps the ink filter ids unique per instance; the control reuses the run player's treatment exactly. Nits: unhandled `play()` rejection, 624 px source upscaled at 1280, mixed apostrophe glyphs. Dark mode: N/A — product has no dark mode.
- **Functionality — strong.** Mouse and keyboard both operate all three controls (Enter starts playback; `size-11` = 44 px at 320 and 1280); pause, resume, and replay all behave; reduced motion is honoured without stranding the reader (the control still offers Play); a blocked autoplay degrades to poster + "Play". No dead ends — every destination the retired card links carried is still reachable on the page, one hop further.

JUDGMENT CONTROL NOTES (one line per in-scope judgment/hybrid control):
- Stack component used where one exists (CMP-1) **pass-with-caveat** — evidence source: **product codebase read** (no `.dx/`, so no manifest; per cmp-1.md's absent-manifest clause). `IlloVideo` is a raw `<video>` + raw `<button>`; nothing in the Base UI/shadcn stack ships a video figure, and the raw button matches the site-wide convention already recorded in `landing-run-example.md`. Caveat is the missing fixed verdict form, filed BLOCKING above.
- Components stay consistent with defaults and sibling usage (CMP-7) **pass** — verified manually by diffing the two class strings: `illo-video.tsx:107` and `harness-run.tsx:487` are identical apart from `mt-2` vs `mt-4` (`inline-flex size-11 … rounded-lg border border-border bg-surface text-muted-foreground transition-colors duration-(--motion-fast) hover:border-border-strong hover:text-foreground`); no default overridden, no colour/shape divergence, and the three row controls share one resting affordance.
- At most one primary filled action per view (CMP-5) **pass** — the section adds no action; the page's only filled CTA remains the hero's `bg-primary` "Quick start" (`page.tsx:146`); the closing CTA is outlined (`border-muted-foreground bg-surface`, `:330`).
- Structure is programmatically determinable (A11Y-7) **pass** — rendered hierarchy `h1 → h2 "What the harness gives your agent." → h3 ×3` with no skips; the rows are a real `ul`/`li`; the visual flip is `lg:order-2` only, and since the clip is `aria-hidden` the AT reading order is unaffected.
- Custom components expose name, role, value (A11Y-8) **pass** — native `<button>` (role), `aria-label` + `title` (name), and the state tracks the visual: I drove it live and read `"Pause the orchestrator illustration"` while playing, `"Play the …"` after pausing, `"Replay the …"` after `ended` — icon switches `landing/pause` → `landing/play` → `harness/loop` in step.
- Comfortable measure (TYP-6) **pass** — measured with a 100-char probe span at 1280: what/why = 49.7ch, claim = 24.0ch, inside the 45–75 band.
- Motion never carries meaning alone (MOT-3) **pass** — every claim the drawing makes is stated in the text cell beside it; the clip rests on its final frame, so a reader who never plays it loses nothing.
- No AI-writing tells (SLP-9) **pass** — lint half clean (`content-lint.py` on TSX + MDX, exit 0); structural read of the prose finds no forced triads, no significance inflation, one em dash per row used as the "Why it matters" separator, not clustered.
- Cards only for interactive units (SLP-11) **pass** — no card chrome added: the rows are full-bleed cells separated by `border-b border-border` hairlines, no radius, no shadow; removing anything would not aid comprehension because there is nothing to remove.
- Reflow at 320 with no loss (LAY-2) **pass** — verified manually at 320×900: `documentElement.scrollWidth = 320`, single column, DOM order illustration→text in every row, all three 44 px controls present; the only nodes extending past 320 are the visually-hidden skip link and an off-canvas decorative SVG group in the hero preview (no body scroll).
- Page-template fit (LAY-3) **pass** — marketing-landing band pattern (full-bleed alternating two-column rows under a section head), consistent with the page's other bands and with `layout-patterns.md`'s note that a marketing surface "would read looser and more spacious by design".
- Density suits the task (LAY-5) **pass-with-caveat** — the marketing register licenses the airiness, but measured at 1280 the text half holds ~150 px of content in a 532 px cell, and at 768 the copy column leaves ~290 px empty to its right; suggestions above, not findings.
- Shared edges align (LAY-6) **pass** — measured at 1280: text-cell copy starts at x=161 (row 2) / x=680 (rows 1, 3) — the two alignment lines the alternation implies — and each clip is symmetrically centred in its 519 px cell (188..572 left, 708..1092 right); the play glyph's ink bbox centre (x=384) sits on the button's interior centre (383.5), i.e. within a pixel and inside optical tolerance for the wobbly ink stroke.
- One primary focal region, order matches priority (LAY-7) **pass** — the squint read still lands on the hero ("Design in code with confidence." + the working logo studio); the three rows are a deliberate peer list under one section head, which is the "no single priority region" case the control exempts.
- Per-product tone register (IDN-3) **pass** — the shared DX voice at plain weight, second person throughout ("You say what you want in your own words", "Your agent stops guessing at taste"); no other product's register borrowed.
- Voice and tone-fit (CNT-14) **pass** — context is marketing/onboarding; the copy is Clear ("One file in your repo that holds your colours, type, motion, and voice"), Thoughtful (each row states the mechanism then the payoff), Approachable without gushing — no exclamation, no hype, no talking down.
- Brand colour for brand moments (COL-1) **pass** — unchanged from the prior treatment: eyebrow and "Why it matters" both `text-site-accent-text` (lime-11 darkened, #587828), the site's own accent; no new colour introduced.
- Sentence case (CNT-12) **pass** — every eyebrow, claim, and label is sentence case ("Orchestrator skill", "Control catalog", "Why it matters"); "DESIGN.md" is a filename, `dx-design` a command.
- N/A this surface, stated for the record: A11Y-11 (no async state change), CMP-2/CMP-3 (no destructive or async action), CMP-4 (no empty state), CMP-6 (no table), CMP-8 (no multi-step or data-entry flow), CMP-9 (no cross-user content — grepped: no `dangerouslySetInnerHTML`/`v-html` on the surface), CNT-2/4/7/10/11 (no new names, no real-world artifact modelled), TYP-5 (no aligned numerals), SLP-10 (no modal), LAY-1 (no declared grid), IDN-1/IDN-2 (no logo or product-icon mark — IDN-2 governs the blue rounded-square product-icon family per `content/guidelines/product-icons.mdx`, not the site's `InkIcon` UI glyphs, so adding `landing/play` and `landing/pause` through the same generator that produced every other mark is out of its scope), IDN-4 (product is not CaseSync).

VERIFICATION LEDGER (one row per in-scope control):
| Control | Method | Evidence |
|---------|--------|----------|
| A11Y-1 | script | `checks/contrast.py --tokens app/globals.css app components lib` clean; also sampled the rendered DOM — eyebrow #587828 on #fafafa = 4.87:1 (12 px), body #67676f = 5.37:1, why #3f3f46 = 10.01:1, control icon #67676f on #ffffff = 5.61:1 (UI floor 3:1) |
| A11Y-2 | script | `checks/a11y-static.py app components` clean (FOCUS/KBD); live traversal at 1280 shows all three controls in the tab order with a 2 px `outline` in `--ring` (#587828, 4.87:1 against the white cell) at `outline-offset: 2px` |
| A11Y-3 | script | `checks/a11y-static.py` clean (NAME rule); each icon-only button carries `aria-label` "Play/Pause/Replay the {orchestrator\|control catalog\|DESIGN.md} illustration" plus a matching `title` |
| A11Y-4 | manual | measured `getBoundingClientRect()` on all three buttons at 320 and at 1280: 44×44 each (`size-11`), above the 44 px mobile floor |
| A11Y-5 | script | `pnpm exec playwright test -g "feature illustrations"` → 1 passed; independently re-verified with emulated `reduced-motion: reduce`: all three videos `paused:true currentTime:0`, all labels "Play the … illustration", control still focusable and Enter still starts playback |
| A11Y-6 | manual | read the render path: `<video aria-hidden="true">` with the claim restated in the adjacent text cell; `InkIcon` emits `<svg aria-hidden="true">` (`components/ink-icon.tsx:33`); confirmed the video is not focusable (`video.focus()` leaves `activeElement` on `BODY`, no `tabindex` attribute), so no aria-hidden-focus conflict |
| A11Y-7 | manual | enumerated rendered headings (`h1` → `h2` → three `h3`, no skipped level) and confirmed the rows are `ul > li`, not styled divs |
| A11Y-8 | manual | drove the control in the live DOM: label and icon cycled Play → Pause → Replay in step with `paused`/`ended`; state exposure is via accessible name (native button role), not a stale visual |
| A11Y-10 | manual | "Skip to main content" is still the first focusable element in the live tab order (unchanged by this section) |
| TOK-1 | script | `checks/token-audit.py app components lib` clean — no raw hex/rgb in `illo-video.tsx` or the section markup |
| TOK-2 | script | `checks/token-audit.py` clean — spacing used is `mt-2/mt-3/mt-4/px-6/py-10/sm:p-12/sm:px-10/sm:py-12/size-11`, all on the default scale |
| TOK-3 | script | `checks/token-audit.py` clean — only `rounded-lg` (computed `8px`), matching the run player's replay |
| TYP-1 | script | `checks/type-scan.py app components` clean; computed families confirm claim = "Plus Jakarta Sans Variable", body/eyebrow = "Inter Variable" |
| TYP-2 | script | `checks/type-scan.py` clean; computed sizes 20/14/12 px (body ≥14, label ≥12). Body line-height computes to 1.625 (`leading-relaxed`) — above the 1.6 target but not the control's fail condition ("line-height under 1.5"), and site-wide established, so not scored a violation |
| TYP-3 | script | `checks/type-scan.py` clean — `text-xl` (20), `text-sm` (14), `text-xs` (12) all on the Tailwind default scale |
| TYP-4 | script | `checks/type-scan.py` clean — no `uppercase` utility or `text-transform` in the section (the eyebrow uses `tracking-wide` only) |
| TYP-6 | manual | probe-span measurement at 1280: body columns 49.7ch, claim 24.0ch — inside 45–75ch |
| COL-1 | script | `checks/token-audit.py` clean (palette-bypass half); judgment half verified by reading the section against `HEAD` — accent usage is unchanged, only the site accent token is used |
| COL-2 | manual | read the section for functional colour: none used (no success/warning/danger states on this surface) |
| CMP-1 | manual | read the product codebase: no `.dx/`, so no manifest; `IlloVideo` is composition (raw `<video>` + raw button) with no stack component covering a video figure, and the raw-button convention is already recorded in `landing-run-example.md`. Record's fixed verdict form is missing — see BLOCKING |
| CMP-5 | manual | read every action on the page: one filled primary (hero `bg-primary` "Quick start"), closing CTA outlined; the section adds no action |
| CMP-7 | manual | diffed `illo-video.tsx:107` against `harness-run.tsx:487` class-by-class — identical apart from `mt-2`/`mt-4`; computed border `#e4e4e7`, bg `#ffffff`, radius `8px` on both; all three row controls share one resting affordance |
| CNT-1 | script | `checks/content-lint.py "app/(landing)/page.tsx" components/landing/illo-video.tsx content/sections/landing.mdx` exit 0 — no raw error codes (no error surface here) |
| CNT-3 | script | `checks/content-lint.py` clean (no sentence over 25 words); evaluator read flags one passive clause in the twin — see ADVISORY |
| CNT-5 | script | `checks/content-lint.py` clean — no device-bound verbs; the control is labelled "Play/Pause/Replay", not "Click to play" |
| CNT-6 | script | `checks/content-lint.py` clean — no empty openers or filler in the row copy |
| CNT-12 | manual | read every string on the surface: eyebrows, claims, and the "Why it matters" label are sentence case; "DESIGN.md" and `dx-design` are a filename and a command |
| CNT-13 | manual | proofread the six strings against `cnt-13.md`'s maps ("colours" is British; "catalog" is not in the US→UK map and is the artifact's own name) — one caveat: mixed apostrophe glyphs at `page.tsx:102` vs `:116`, filed ADVISORY |
| CNT-14 | manual | read the copy against `content/guidelines/voice-tone.mdx` for a marketing/onboarding context — mechanism-then-payoff in each row, brief and plain, no hype or gush |
| MOT-1 | manual | grepped the section's transitions: only `transition-colors duration-(--motion-fast)` = 120 ms with the default easing (in the 100–300 ms band); the 5 s clips are content, not interface motion, and are gated per A11Y-5 |
| MOT-2 | manual | the one duration in the new component resolves to the `--motion-fast` token; the retired `ff-*` block took the last `--motion-story` usage on this surface with it |
| MOT-3 | manual | read each drawing against its text cell — every claim is stated in words; the clip rests on its final frame, so no meaning exists only while it moves |
| SLP-1 | manual | inspected the section and the clip frames (slop-scan unbuilt): no purple/violet gradient, no cyan-on-dark, no glow; the lime is a single deliberate accent, not a multi-hue wash |
| SLP-2 | manual | no gradient text anywhere in the section — all text is a flat token colour |
| SLP-3 | manual | no side-tab accent borders; the only borders are the 1 px `--border` cell seams |
| SLP-4 | manual | no cards at all, so nothing nested; the illustration sits directly in its grid cell |
| SLP-5 | manual | the 2×2 identical-card grid is gone — three alternating full-width rows, no icon-tile-above-heading template; the pre-existing skills-tile waiver (`page.tsx:294`) still carries its reason and `waiver-reconcile.py --src app components lib --records docs/decisions` exits 0 |
| SLP-6 | manual | measured computed sizes: 30 → 20 → 14 px = 1.5× then 1.43×, both above 1.25; the 12 px eyebrow is a label distinguished by colour and weight, not a hierarchy step |
| SLP-7 | manual | read the spacing: `mt-3`/`mt-4`/`mt-2` inside the text block against `py-10`/`sm:py-12` between rows — related items are grouped tighter than unrelated ones, no single value used uniformly |
| SLP-8 | manual | the only easing on the surface is the default ease of `transition-colors`; no bounce, elastic, or overshoot (the `ff-*` block that held the story easing was deleted) |
| SLP-11 | manual | inspected each container: no border+radius+background box anywhere; grouping is done by hairline seams and whitespace |
| LAY-2 | manual | resized to 320×900 and read the layout: `scrollWidth = 320`, single column, illustration→text order in each row, all three controls present at 44 px |
| LAY-3 | manual | matched the surface to the marketing-landing band pattern used by the page's other sections (section head + full-bleed two-column band) |
| LAY-4 | manual | probe-span measurement at 1280: body containers `max-w-[52ch]` render 49.7ch, claim `max-w-[24ch]` renders 24.0ch — under the 80ch ceiling, near the 66ch target (`checks/layout-scan` unbuilt) |
| LAY-5 | manual | measured cell geometry at 1280 (row 532 px tall, text content ~150 px) and at 768 (copy ~52ch in a 768 px cell) — airy but within the marketing register `layout-patterns.md` licenses; caveat recorded |
| LAY-6 | manual | measured left edges at 1280 (161 / 680 text lines; clips centred 188..572 and 708..1092) and pixel-sampled the play glyph in `768-row1.png`: ink bbox centre x=384 against button interior centre 383.5 |
| LAY-7 | manual | squint read of the 1280 frames plus region enumeration — the hero still leads; the three rows are a deliberate peer list under one head |
| IDN-3 | manual | read all six strings against the register table in `controls/idn-3.md` — shared DX voice, plain weight, no borrowed register |
| CMP-9 | manual | grepped the surface for `dangerouslySetInnerHTML` / `v-html`: none; no cross-user content renders here |

UNCOVERED (defects no control covers — feed the ratchet):
- **No control covers media weight / page budget.** This change adds ~4.8 MB of video (`illo-orchestrator.mp4` 0.9 MB, `illo-catalog.mp4` 1.7 MB, `illo-design-file.mp4` 2.2 MB) to the landing page. `preload="none"` + posters means nothing fetches until a clip is half in view, and the record names the tradeoff — but a teacher who scrolls the section on a school network pays for all three, and no catalogue control would ever have raised it. A budget control ("a marketing surface's auto-fetched media stays under N MB per viewport-triggered region") would give this a home.
- **No control covers text baked into imagery (WCAG 1.4.5, images of text).** The DESIGN.md clip renders hand-lettered "DESIGN.md create skill" as part of the drawing — unscalable, unselectable, and invisible to AT because the clip is (correctly) `aria-hidden`. A11Y-6 is satisfied (decorative content is hidden), and the words duplicate the eyebrow, so nothing essential is lost — but the class of defect is real and nothing in the catalogue names it.
- **Catalogue clarification, not a product defect: TYP-2's line-height band is one-sided.** The title and "Passes when" say 1.5–1.6, but "Fails when" only lists "line-height under 1.5", and `type-scan.py`'s comment codifies that reading. This site's body copy computes to 1.625 (`leading-relaxed`) everywhere, so a large established surface sits above the stated band while passing the control. Worth resolving in one direction so future evaluators don't have to.

## Findings addressed

From the reviewer's pass-with-findings verdict, all against the looping build:

- **BLOCKING — CMP-1 fixed verdict form missing.** Fixed: the fixed-form line
  plus its evidence source now sits in "Verify verdict" above.
  `audit-record.py` no longer reports it.
- **BLOCKING — record missing `## Ratchet`** (and the verdict / quality-grade /
  ledger blocks). Fixed: the verdict is recorded verbatim below with its ledger,
  and the Ratchet section follows.
- **ADVISORY — CNT-13 mixed apostrophe glyphs.** Fixed: the three U+2019
  apostrophes in `app/(landing)/page.tsx` are now ASCII, matching the site's
  established convention (124 ASCII and zero curly in `content/`). The reviewer
  named two adjacent strings; the fix covers all three on the page.
- **ADVISORY — CNT-3 passive clause in the twin.** Fixed: "the review that
  closes each run is described in the worked example below" → "The worked
  example below shows the review that closes each run."
- **ADVISORY — controls-in-scope list narrower than the change.** Fixed: the
  list above now enumerates every control the change pulls in, grouped, with the
  out-of-scope set stated rather than dropped.
- **ADVISORY — evidence set had no 320 frame and no reduced-motion frame.**
  Fixed: both captured, plus a third the loop change made necessary
  (`loop-touch-iphone14.png`) proving the coarse-pointer reveal, since the
  control is no longer visible at rest on a fine pointer.
- **SUGGESTION — unhandled `play()` rejection.** Fixed: both call sites now
  `.catch(() => {})`, with a comment naming why a blocked autoplay is a correct
  resting state rather than an error.
- **Superseded by the loop change:** the reviewer's "rests on the final frame"
  reading of MOT-3, and its A11Y-8 evidence for the Play → Pause → **Replay**
  cycle. The looping build toggles Play ⇄ Pause, WCAG 2.2.2 now binds (a loop
  runs past five seconds beside other content), and the control is `opacity-0`
  at rest — which trades the resting affordance the reviewer confirmed under
  CMP-7 for the clean cell the builder asked for. That trade is named in
  "Tradeoffs" and is the item most worth a second reviewer opinion.
- **Delta re-review suggestions, all applied:** `group/illo` moved to the cell
  (above); `any-pointer-coarse:opacity-100` added beside `pointer-coarse` — the
  reviewer found the real gap, a touch laptop reporting `pointer: fine` with
  `any-pointer: coarse`, where the pause had been keyboard-only (both media
  queries confirmed in the built CSS); the reduced-motion preference is now
  re-read through a `matchMedia` change listener instead of captured once at
  mount, because with a loop a stale read means motion recurs on every re-entry
  to the viewport; and a contract test now pins the fine-pointer behaviour
  (rest `opacity: 0`, cell-padding hover `1`, keyboard focus `1`) so a refactor
  that dropped `focus-visible:opacity-100` could not ship an invisible focus
  ring past a green suite.
- **Ratchet item 6 corrected on the reviewer's evidence.** My claim that
  `audit-record.py` "exits 0 while printing ERROR" did not reproduce — it exits
  1 (`audit-record.py:703-707`); I had carried the claim forward from
  `landing.md` without re-testing it. The real silent-failure hole is upstream:
  **no package script calls the record audit at all** (`prebuild` runs
  `check-standards.mjs` + `check:python`, neither of which invokes it), so
  record defects surface only when a human or an agent runs it by hand.
- **Left open, deliberately:** the section carries no outbound link (the builder
  accepted this on 2026-08-18 when the whole-card links were dropped; the
  reviewer's suggestion to link each claim heading stays the reversal path), and
  the LAY-5 density notes at 768/1280 plus the 2x-clip craft note are visual
  changes beyond this ask — logged here rather than silently taken.

## Later changes to this surface

**2026-08-18, after the verdicts above.** Recorded here rather than in a new record
because they change the same rows this record governs:

- **The DESIGN.md row was reframed around the skill.** Eyebrow "DESIGN.md" →
  "Design language skill"; claim "Your product's design language." → "A design
  language your team owns."; body now names `dx-design-language`, says it reads
  your code and writes a `DESIGN.md` into your repo, and states that anyone on
  the team can edit it from there. The builder's point: the artifact was the
  visible half of the feature, and the skill that generates it — and the fact
  that the team then owns and iterates on it — was the half that mattered.
- **The clips now blend into their ground.** Each clip's near-white ground varies
  (measured 251 to 255 across the four), so no single cell colour matched and
  every drawing carried a faint square plate. `mix-blend-multiply` maps pure white
  onto the backdrop, and `brightness(1.02)` lifts the near-white the rest of the
  way (251 x 1.02 clamps to 255) while leaving the ink untouched. Measured after:
  the clip's ground and the surrounding band both render `250,254,244` — an exact
  match, no plate. It also means a clip can sit on any ground, which is what let
  the closing band keep its tint.
- **The run player lost its replay control** at the builder's request. The
  scroll-triggered single play was already the behaviour (IntersectionObserver at
  40% visibility, `played` guard, observer disconnected after), so only the
  control was removed. A contract assertion now pins its absence. Note this
  reverses the round-3 reviewer-directed work recorded in
  `landing-run-example.md`, which added the control's resting border and title —
  that history stands, this supersedes it.
- **The compare frame stopped clipping.** Both panels now share one grid cell so
  the taller one sizes the frame. The row must be `auto`: `grid-rows-1` resolves
  to `minmax(0, 1fr)`, whose zero minimum let the 16/10 aspect cap the height and
  cut the after panel's send row. Measured 0px clipped at 1440/1280/768/360.
- **The compare frame gained side margins**, reversing the builder's earlier
  40/60 full-bleed ruling at their request. The full-bleed existed so the aspect
  bound before a content-driven height floor; the grid fix removes that need.
- **The three passes are labelled as this example's**: "This example used three
  skills. Your request brings in whichever ones it needs."
- **The closing section's three glyphs became one clip** (a person and an agent
  reading the same book) and its grid was fixed: `grid-rows-3` had split the
  *section's* height into thirds, stranding each detail line a third of the way
  down instead of under its label.

- **The play/pause control was removed entirely (2026-08-18, builder ruling:
  "don't provide a button to pause and play upon hover. Not required").** This
  supersedes the hidden-at-rest control the delta re-review judged acceptable,
  and it must be recorded plainly: **the page no longer offers a per-clip stop
  mechanism, so looping motion beside content is not pausable in-page, which
  WCAG 2.2.2 asks of motion running past five seconds.** What remains: under
  `prefers-reduced-motion` nothing ever plays (the poster rests — now the one
  stop mechanism, pinned by a contract test asserting `paused && t === 0` plus
  zero buttons in the cells); playback is visibility-gated, so only the on-screen
  clip moves; the clips are muted and decorative with every claim written beside
  them. No catalog control names stoppability (Ratchet item, still proposed), so
  this is a builder-accepted deviation from WCAG guidance, not a waivable
  control. The `landing/play` and `landing/pause` generator entries left with
  the control.
- **The closing clip runs smaller (2026-08-18):** `max-w-64` (256px) against the
  rows' `max-w-sm` (384px) — the builder asked for "like 70%"; 256px is 67%, the
  nearest on-scale token (`269px` exact would be an off-scale arbitrary value).
- **A builders' quote band sits between the run and the compare sections
  (2026-08-18):** the quote (cited to `/note`), an outlined Quick start (CMP-5
  holds — the hero keeps the one filled primary), and the setup ask written as a
  copyable prompt (`components/landing/copy-prompt.tsx`). The prompt text is
  visible and selectable so a blocked clipboard degrades to select-and-copy;
  the copy outcome is announced through a polite live region (A11Y-11) and the
  button label; the clipboard content is pinned by a contract test.

## Ratchet

New items this run, all `[proposed — pending design-lead approval]`:

1. **No control covers media weight or a page's fetch budget.** This section
   adds ~4.8MB of video to the landing page. `preload="none"` plus posters means
   nothing fetches until a clip is half in view, and the tradeoff is named — but
   a reader who scrolls the section on a school network pays for all three, and
   no catalog control would have raised it. Candidate: "a marketing surface's
   auto-fetched media stays under N MB per viewport-triggered region."
2. **No control covers text baked into imagery (WCAG 1.4.5, images of text).**
   The DESIGN.md clip renders hand-lettered "DESIGN.md create skill" inside the
   drawing: unscalable, unselectable, and invisible to assistive tech because the
   clip is correctly `aria-hidden`. Nothing essential is lost here (the words
   duplicate the eyebrow), but the defect class is real and unnamed.
3. **No control covers a pause mechanism for looping media (WCAG 2.2.2).** This
   build had to reason from the WCAG text directly because no catalog control
   names it — A11Y-5 covers reduced motion, not stoppability. Candidate: "motion
   that plays longer than five seconds beside other content offers a visible
   pause, and a chosen pause persists."
4. **Carried from `landing-feature-grid.md`, still open: animation- or
   interaction-induced layout shift needs a control.** This build sidesteps it
   (the control's box is always reserved, so revealing it shifts nothing), which
   is evidence the rule is writable.
5. **Catalog clarification, not a product defect: TYP-2's line-height band is
   one-sided.** Its title and "Passes when" say 1.5–1.6, but "Fails when" only
   lists "line-height under 1.5", and `type-scan.py` codifies that reading. This
   site's body copy computes to 1.625 (`leading-relaxed`) everywhere, so a large
   established surface sits above the stated band while passing. Worth resolving
   in one direction.
6. **`audit-record.py` resolves record paths against the plugin directory, not
   the consumer repo.** `REPO_ROOT` is derived from the script's own location
   (`checks/../` → `plugins/dx-harness/`), so a record in a consumer repo that
   cites `docs/decisions/<name>.md` — or any repo-root-relative path — is
   reported as a missing reference unless the caller passes `--repo-root .`. This
   is why the sibling landing records show the same error class. Two candidate
   fixes: derive the root from the audited file's location, or make
   `--repo-root` required. Related, already logged in `landing.md`: the script
   exits 0 while printing ERROR lines, so a CI wiring would pass silently.
