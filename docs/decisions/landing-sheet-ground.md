# Design decision record — the landing sheet's ground

> Adds a background construction layer to the landing shell, and removes the
> nav's "Quick start" link. Separate from `landing-feature-rows.md` (the
> illustrated rows) — this change is page chrome, not section content.

- **Date:** 2026-08-18
- **Product:** other — the dx-harness site itself (no `products:`-scoped controls
  apply; the site self-applies the portfolio standard)
- **Change type:** modification (page chrome)
- **Page type:** landing shell (marketing surface); applies to `/` and `/note`,
  the two routes on the landing layout
- **Run type:** attended
- **The builder and the moment:** the builder referenced the Paper website, which
  extends drafting artifacts out of its hero into the page background, and asked
  for "grid related graphics on the background… so that the hero graphic's grid
  and the entire page looks more intentional." The complaint underneath: the hero
  blueprint was carrying the drafting idea alone, so it read as one illustrated
  panel rather than as the page's language.

## Sprint contract (done-criteria)

1. The page ground carries construction graphics that make the sheet and the
   hero blueprint read as one drawing, in the Paper reference's *vocabulary*
   (measuring scale, radius, 45° axis, wedge, crossing marks) but in this site's own
   palette — no warm-paper cream, no new colour, no invented aesthetic.
2. Every element is derived from something already on the page, and the
   derivation is stated in the code, not asserted here.
3. **Nothing sits behind text**, at any width — the layer may not change a single
   text/background pairing (A11Y-1, L0).
4. It withdraws rather than crowds when the flanks are too narrow, and adds no
   horizontal overflow at 320 (LAY-2, L1).
5. It is inert: invisible to assistive tech, and it never intercepts a click.
6. The nav drops "Quick start"; the hero's filled CTA and the closing CTA stay.

## Chosen approach

Diverge was skipped: the builder supplied the reference and the direction, which
counts as the chosen direction under the stop-once rule.

**The idea.** The landing shell already draws the page as a measured sheet — a
1040px plate, hairline flanks, registration crosses straddling its corners — and
the hero holds a construction blueprint. The move is to put that sheet on a
larger drawing: geometry that passes *behind* the page and shows only in the
flanks. Because the flanks and the sheet share one ground (`--background`), the
two arcs read as one large curve enclosing the plate — a parenthesis around the
page rather than one hidden circle (see "Findings addressed"). That is what makes the page feel intentional rather than
decorated — and it is why the layer needs nothing behind the text to work.

**Per flank** (`components/landing/sheet-ground.tsx`):

- A **measuring scale** — a `--border` rule 40px outside the sheet edge, ticks
  repeating at `--ground-pitch`, running the page's full height. CSS, not SVG,
  because a ruler has to run the whole plate and the page height is unknown.
- A **construction radius** — an r=320 arc entering and leaving the sheet edge.
- A **45° axis**, dashed `5 7`, the dash the hero blueprint uses for its own
  construction diagonals.
- A **45° wedge** filled `--sheet-band`, the whisper tint the heading bands
  already carry, cut on the hero's `rotation: 45`.
- Two **round crossing dots** (`--surface` fill, `--border` stroke, `r=3.5`) on
  the arc↔scale crossings at y = 380 ± √(320² − 40²) = 62.5 and 697.5. Derived
  positions, not round numbers: a mark belongs where geometry actually meets. Round,
  because the hero marks its own construction points with `circle r="9"` — these
  were squares until the review caught that the square had no basis in anything
  that renders.

The left flank is the right flank mirrored (`-scale-x-100`), so one set of
geometry serves both and they cannot drift apart.

**Why 40px** — `--ground-pitch`, new in `app/globals.css`. The hero blueprint
measures on a 50-unit grid, which renders at ~40px a division at the 1040px sheet
width, so the ground and the drawing measure at one rhythm instead of two
competing ones.

**Also in this change:** `app/(landing)/layout.tsx` — the shell became
`relative`, renders `<SheetGround />`, and the sheet gained `z-10` (paint order
only — see "Findings addressed": it is not occlusion, and the flank clipping is
the real defence) plus a `data-sheet` hook for the
test below. The nav's "Quick start" link was removed; the nav now reads Docs /
Builder's note / GitHub, and Docs continues to resolve to `/overview`, the
harness overview page.

## Rejected options

- **A full-bleed graph-paper tile behind the whole page** — rejected on
  criterion 3. Several sections are transparent (the hero's copy half, each
  feature row's text half), so a tiled ground would put ruled lines directly
  behind body copy. It also reads as texture rather than construction, which is
  the opposite of "intentional".
- **Copying Paper's palette** — rejected. Paper's ground is warm cream with a
  paper grain; this site is a cool neutral (`--background: #fafafa`) and reverted
  to one light world deliberately. Borrowing the vocabulary is legitimate;
  borrowing the aesthetic would be a pastiche and would fight COL-1.
- **Letting the arc cross behind the hero's copy half** — the strongest version
  visually (Paper's wedge does cross its hero), and rejected anyway: it puts a
  hairline through the headline for a gain the flanks already deliver.
- **Extending the header's rule out into the flanks with handles**, which is
  Paper's most literal device — rejected as too fragile: it needs the header's
  exact height, which is a coupling that would break silently the first time the
  nav wrapped.

## Tradeoffs, named

- **The effect is invisible below 1200px**, which is most phone and tablet
  readers. The flanks are where the whole idea lives, and they do not exist at
  those widths, so the alternative was crowding the sheet edge or drawing behind
  text. Accepted: the layer is decorative and its absence costs the reader
  nothing.
- **It is quiet enough to miss.** `--border` on `--background` is a hairline, and
  `--sheet-band` over `--background` is roughly a 1.5% luminance step. On a
  dim or glossy screen a reader may not consciously register it. That is the
  intended register for this site — but it does mean the change reads as
  atmosphere, not as a feature, and a builder expecting Paper's more present
  wash will find this softer.
- **The construction is concentrated in the top 760px** while the scales run the
  full height. Below the hero the flanks carry rhythm but no geometry, which is
  deliberate (the drawing belongs where the blueprint is) and does leave the
  lower page plainer than the reference.
- **One more full-page layer to reason about.** Any future sticky or
  overflow-sensitive element on this shell now has a sibling spanning the page.
  Mitigated by `pointer-events-none`, `aria-hidden`, and `overflow-hidden`, and
  pinned by the intrusion test.

## Controls in scope

**Tokens and colour:** `TOK-1` (only `--border`, `--sheet-band`, `--surface`,
`--ground-pitch`; no raw hex in the component), `TOK-2`, `COL-1` (no new
colour), `COL-2` (no functional colour).
**Layout:** `LAY-2` (320 reflow, no overflow), `LAY-6` (the scale and handles are
positioned off the sheet edge and the derived crossings, not eyeballed), `LAY-7`
(the ground must not compete with the hero for the focal region).
**Motion:** none added — the layer is static; `MOT-1`/`A11Y-5` not engaged.
**Anti-slop:** `SLP-1` (no gradient palette — the one `repeating-linear-gradient`
is a hard-stop hairline pattern in a single token colour, a tick rhythm rather
than a colour transition), `SLP-2`, `SLP-3` (the flank rules are the sheet's own
measure, not decorative side-tabs), `SLP-7`, `SLP-11` (no card chrome).
**Accessibility:** `A11Y-1` (criterion 3 — no text pairing may change), `A11Y-2`
(nothing focusable added; nothing may become unreachable), `A11Y-6` (the layer is
`aria-hidden`, decorative).
**Content:** `CNT-2` (the nav's remaining labels are unchanged).
**Out of scope, stated:** `CMP-2`/`CMP-3`/`A11Y-11` (no async or destructive
action), `CMP-4`, `CMP-6`, `CMP-8`, `TYP-*` (no type added), `SLP-9`/`CNT-3`/
`CNT-13` (no prose added — one nav link removed), `SLP-10`, `LAY-1` (no declared
grid), `IDN-1`/`IDN-2`/`IDN-4`.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| | | | | none — this change adds no waiver |

No waivers. The change introduces no catalog deviation; `waiver-reconcile.py`
exits 0 with the one deliberate stale MOT-1 NOTE carried from
`landing-feature-rows.md`.

## Plan approval

- **Approved by:** the builder (wondo.jeong) — the Paper reference plus the
  verbatim ask ("I want to add some grid related graphics on the background… Take
  a look at the references and make it happen") names the chosen direction, which
  counts as approval under the stop-once rule.
- **Approved on:** 2026-08-18

## Verify verdict

- **CMP-1: asserted, no manifest — manifest absent for the dx-harness site.**
  Evidence source (a): reviewed the product codebase directly. No `.dx/`
  directory exists, so there is no component manifest and no standing overrides.
  `SheetGround` is presentational SVG and CSS with no interactive surface, so no
  stack component covers it.
- **Criterion 3 (nothing behind text) — measured, 0px at every width.** Worst-case
  intrusion of any ground element into the `[data-sheet]` box, measured in the
  production DOM at 320, 360, 768, 1088, 1199, 1200, 1280, 1440 and 1920: **0px
  in every case.** Pinned by the contract test "the sheet ground draws in the
  flanks only, and only when there is room".
- **Criterion 4 (withdraws, no overflow) — measured.** Ground parts present: 0 at
  1199, 4 at 1200 and above. `document.documentElement.scrollWidth` equals the
  viewport at all nine widths, 320 included.
- **Criterion 5 (inert) — measured.** The layer computes
  `pointer-events: none`; `document.elementFromPoint` at the Docs link's centre
  returns the `<a href="/overview">` itself, and the click navigates to
  `/overview`. (An earlier throwaway probe suggested the click failed; that was a
  flaw in the probe's wait, not the page — re-verified with `waitForURL`.)
- **Criterion 6 (nav) — measured.** Nav is `["DX Design Harness", "Docs",
  "Builder's note", "GitHub"]`; Docs → `/overview`, whose `h1` renders the
  harness overview. Two in-page "Quick start" CTAs remain (hero filled, closing
  outlined), so CMP-5 is unchanged.
- **Deterministic checks:** typecheck clean; `pnpm build` green (runs
  `check-standards` + `check:python`); `token-audit`, `a11y-static`,
  `type-scan`, `contrast`, `waiver-reconcile` all exit 0; Playwright contract
  suite **46/46** (two added this round). Record audit:
  `audit-record.py --repo-root . docs/decisions/landing-sheet-ground.md`.
- **Screenshots:** session scratchpad `evidence/` — `ground-1440.png` (hero with
  both flanks), `ground-1280-hero.png` (narrower flanks), `ground-1440-scrolled.png`
  (scales continuing past the hero), `ground-flank-left.png` and
  `ground-flank-right.png` (2× crops showing the handles landing on the
  arc↔scale crossings).
- **Correction — the first round of measurements was taken against `next dev`,
  not production.** The reviewer caught this: a `pnpm dev` server started earlier
  in the session still held port 3000, so every later `pnpm start` failed to bind
  and fell through silently, and the served HTML carried `(app-pages-browser)`
  and dev-tools markers. The dark "N" badge in the first screenshots is that
  indicator, not page chrome. The reviewer re-ran every measurement on a real
  production server and reported the facts hold; I then killed the stale process
  and re-verified on a genuine `pnpm start` (zero dev markers, fresh PID). Every
  number in this record is from that production run. The lesson is in the
  Ratchet: a claimed verification environment is not checkable by any script.
- **Reviewer verdict (`dx-design-review`, 2026-08-18): pass-with-findings.** Its
  one blocker — a red contract suite — was real but caused by the *copy* change
  landing in the same tree: two assertions still expected the old meta
  description and the old "DESIGN.md" eyebrow. Both are reconciled and the suite
  is 46/46 on the production build. Its CMP-7 **fail** was also real and is
  fixed: see "Findings addressed".

### Reviewer verdict — verbatim

Recorded verbatim from the `dx-design-review` agent, 2026-08-18. Its blocking item
(a red contract suite, caused by the copy pass landing in the same tree) and its
CMP-7 fail are both closed above; the environment defect it found is corrected in
"Verify verdict".

VERDICT: pass-with-findings

**Inputs.** Sprint contract + approved plan + waiver table: found in `docs/decisions/landing-sheet-ground.md` (untracked, so the spawn's "no decision record yet" is out of date — I graded against its 6 done-criteria). Standing overrides: **none** — no `.dx/design.json` exists at the repo root, so no control is adjusted and `layout_system` is undeclared (LAY-1 N/A). Evidence: 5 screenshots at 1280/1440 + 2× flank crops. **Missing: 360 and 768 frames** — the ground is absent at both, but the nav edit is *only* visible there, so I captured them myself.

BLOCKING (must fix before ship):

- the recorded gate is red, not green — the record's Verify verdict claims "Playwright contract suite 46/46"; on the tree I graded it is 44 passed / 2 failed, reproducibly (two runs, identical failures). Evidence: `tests/site-contract.spec.ts:70` expects meta description "gives coding agents…", page serves "gives your coding agent…" (`app/(landing)/page.tsx:15`); `tests/site-contract.spec.ts:94` expects eyebrow `["Orchestrator skill", "Control catalog", "DESIGN.md"]`, page renders `…, "Design language skill"` (`app/(landing)/page.tsx:115`). Root cause is LAST round's copy rename, not the sheet ground — but both assertions are on the surface under review, a red suite blocks the loop regardless of which change reddened it, and the record asserts the opposite. Fix the two assertions (or the copy) and re-state the count.

ADVISORY (should fix):

- components stay consistent with sibling usage (CMP-7, L2) — the ground's handles are 6×6 SQUARES (`sheet-ground.tsx`, `<rect x="37" …>`); the only drafting drawing that actually renders on this surface, `DxdConstructionPreview`, marks its construction points with ROUND dots (`dxd-construction-preview.tsx:284-287`, `<circle r="9">`; and `r="5"` at line 275), and the sheet's own corner marks are crosses (`layout.tsx` `Registration`). The record justifies the square by citing "the hero blueprint's vocabulary… corner handles" — but the square-handle component it means, `components/landing/blueprint.tsx` (`HANDLE = 14`, `fill="var(--surface)"`), is **rendered nowhere**: `grep -rn "Blueprint"` across `app/ content/ lib/` returns only a code comment. So the recorded reason is inaccurate, and two shapes for one drafting device sit ~1100px apart in the same frame. Verified manually (no manifest exists). L2 → advisory, and the fix may be the record's reason rather than the shape.
- `/note` loses its only route to install, and the contract does not cover it — criterion 6 justifies the nav removal as "the hero's filled CTA and the closing CTA stay", which is true of `/` only. The record states the layout serves `/` AND `/note`; `/note` has no in-page install CTA (its full href set is `/`, `/note`, `/note.md`, `/overview`, GitHub, LICENSE). Install is now two hops from `/note` via Docs → `/overview`. Not a control failure — a gap in the contract's reasoning that should be stated as an accepted tradeoff or closed with a CTA.
- evidence and gate labels do not match what ran — the spawn and the record both call `http://localhost:3000` a "fresh production build" and the measurements "the production DOM". Port 3000 is `next dev` (PID 29888, parent `next dev`; served HTML carries `(app-pages-browser)` module ids and `next-devtools/userspace/app/segment-explorer-node.js`), and the dark "N" badge at bottom-left of `ground-1440.png` / `ground-1280-hero.png` / `ground-1440-scrolled.png` is that dev-tools indicator, not page chrome. Also `ground-1440-scrolled.png` shows the eyebrow "DESIGN.md", which the current tree renamed to "Design language skill" — that frame predates the tree under review. I re-ran every measurement against a real `pnpm start` on :3111 and the facts hold, so this is a labelling defect, not a wrong result. Worth fixing because `.next` is shared with the dev server (BUILD_ID mtime moved 11:46 → 11:54 while I worked, and :3111 began serving a broken RSC stream mid-review), so "pnpm build green" cannot currently be evidenced from that setup.

**Your three constraints, verified independently and challenged.**

1. **Nothing sits behind text — confirmed, and stronger than your measurement, but resting on one mechanism, not two.** I measured worst-case overlap with `[data-sheet]` at **13** widths (320 / 360 / 480 / 768 / 1024 / 1088 / 1199 / 1200 / 1201 / 1280 / 1440 / 1920 / 2560): **0px at every width**, and I also measured the *painted* geometry (each `path`/`rect` bbox clipped to its SVG viewport, not just the element box your test uses) — **also 0px everywhere**. The geometry is sound: the svg's `x=0` is placed exactly on the sheet edge via `calc(50%±520px)` and `viewBox="0 0 320 760"` clips everything inward, so painted intrusion is structurally impossible, not merely absent. **The challenge:** your code comment reads as two defences — "z-10 keeps the sheet and everything on it above the ground layer" *and* the clipping. Only the clipping is real. Every element from the `h1` up to the sheet is `rgba(0,0,0,0)`, and the sheet itself computes `backgroundColor: rgba(0, 0, 0, 0)`; the first opaque layer behind the headline is the shell's `bg-background`, which is the **parent** of `SheetGround` and therefore paints *below* it. `z-10` buys paint order, zero occlusion. If any ground element ever drifted inward, it would render behind live glyphs and `z-10` would not stop it. Your Playwright test is the sole backstop — correctly load-bearing, and worth saying so in the record rather than implying belt-and-braces.
2. **It withdraws when there is no room — confirmed.** 0 ground parts at 1199, 4 at 1200 and every width above. `document.documentElement.scrollWidth === clientWidth` at all 13 widths including 320 and 2560. At 320/360 the nav wraps to two rows with all four links at 44px height and the hero CTA intact. 400% zoom on 1280 = 320 CSS px, so the layer is correctly absent there too.
3. **Nothing is invented — mostly true, and better-evidenced than your record claims for two of five elements; one element fails.** The dash **is** derived: `dxd-construction-preview.tsx:186` uses `strokeDasharray="5 7"` on its construction diagonals — exactly the ground's value. The wedge angle **is** derived: `SETTINGS = { …, rotation: 45 }` at line 17, and `--sheet-band` is that component's own plate fill (line 167). The pitch **is** derived and I checked the arithmetic: `GRID` step 50 in `viewBox="180 180 640 640"` at a 520px hero cell = **40.6px** per division, so `--ground-pitch: 40px` is honest. The handle *positions* are genuinely derived — √(320²−40²) = 317.49, so crossings at y 62.5 / 697.5, and `rect x="37" width="6"` / `y="59.5"`,`"694.5"` centre precisely on x=40 and those two y values. **What fails:** the handle *shape* (see CMP-7 above), and — smaller — the repeating tick ruler. The live hero has a full modular grid and, in the unrendered `blueprint.tsx`, a single dimension line with two end tick caps; a *repeating* scale is a new device. It is squarely in the drafting family so I would not call it invention, but "every element is already in the hero blueprint's vocabulary" overstates it by one shape and one device.

**Paper pastiche or legitimate expression? Legitimate, decisively.** The four rejected options in the record are the reason: refusing the warm cream, refusing the arc through the headline, refusing the header-rule extension on coupling grounds, and refusing the full-bleed graph tile on criterion 3. That is a builder taking a reference's *grammar* and declining its *surface*. Nothing here reads as decoration: every mark answers to a number that already existed on the page.

**Inertness — confirmed beyond your `elementFromPoint` spot-check.** I enumerated **every** interactive element on both routes (`a[href]`, `button`, `summary`, `video[controls]`, `[tabindex]`), scrolled each to centre and hit-tested it: **0 unclickable** at 1200 / 1280 / 1440 / 1920 on `/`, and 0 on `/note`. All four ground parts compute `pointer-events: none` (inherited from the root — no child overrides it), the root computes `aria-hidden="true"`, and it contains **0** focusable descendants. The skip link still works above it: first Tab lands on "Skip to main content", `zIndex: 50`, visible, hit-tests to itself — so adding `relative`+`z-10` to the shell caused no A11Y-2/A11Y-10 regression. I also confirmed nothing in `app/(landing)/page.tsx` or `components/landing/*` uses `sticky`, `fixed`, or any `z-index`, so the new stacking context conflicts with nothing.

**Sanity check on last round's fixes (not the subject):** `group/illo` is on the illustration cell, `any-pointer-coarse:opacity-100` is present, and the motion preference is re-read via `motionQuery.addEventListener("change", sync)` with one resolver for both visibility and preference — all three applied as suggested. The control keeps `aria-label` tracking `playing`, `size-11` (44px), and a resting border.

SUGGESTIONS (not violations — the builder may take these):
- Derive the flank offset and handle coordinates from one source. The sheet width is three uncoordinated literals (`max-w-[1040px]`, `calc(50%-560px)`, `calc(50%+520px)`) and 37 / 59.5 / 694.5 are hand-solved from r=320 and offset 40 — serves LAY-6; change `--ground-pitch` or the sheet width and the drawing silently desyncs from the ruler it claims to share a rhythm with.
- Neutralise the layer under `forced-colors: active` (see UNCOVERED) — serves the A11Y floor's spirit; keeps the ruler from degrading into two black rules.
- Give `[data-sheet]` an opaque `bg-background` — serves criterion 3; turns `z-10` into the real second defence your comment already claims it is.
- Reconcile the two withdrawal thresholds (1088 for the registration crosses, 1200 for the ground) or state the rule that produces both — serves LAY-2 and your own ratchet item 2; two judgment calls on one surface with no appealable rule.
- Delete `components/landing/blueprint.tsx` or render it — serves CMP-7; it is dead code that the record cites as the authority for the square handle.

QUALITY GRADES:

- Design quality: STRONG. The flanks now give the 1040 plate a reason to be a plate rather than a centred column, at a pitch that measurably matches the hero's own division (40.6px vs the declared 40px), and the squint test still lands first on the headline and the green blueprint — the ground never competes.
- Originality: STRONG. This is the inverted test and it passes: the risk was Paper pastiche, and the palette, the rejected warm cream, and the refused arc-through-headline show a builder borrowing grammar and declining surface; SLP-1 does not fire because the one gradient is a hard-stop hairline in a single token neutral, not decoration.
- Craft: STRONG, with two honest gaps. Deriving handle positions from sqrt(320^2-40^2) instead of round numbers, and mirroring one flank so the two cannot drift, is real care; against that, the sheet width lives in three literals and the layer degrades badly under forced colors.
- Functionality: ACCEPTABLE. The layer is inert and verified so across every interactive element on both routes; the cost sits in the nav edit, where `/note` loses its only direct route to install and the contract only reasons about `/`.
- Dark mode: N/A — product has no dark mode (`app/globals.css:5`: "this site is light-only (no .dark layer)"; no `.dark` layer, no toggle, `html.className` empty).

JUDGMENT CONTROL NOTES:

- reflow at 320 CSS px (LAY-2) pass — `scrollWidth == clientWidth` at 13 widths incl. 320 and 2560; layer absent below 1200; at 320 the nav wraps to two rows, all 4 links present at h=44.
- shared edges align; optical alignment (LAY-6) pass — the scale rule sits exactly 40px off the sheet edge and each handle centres on the true arc-scale crossing (x=40, y=62.5/697.5); no eyeballed placement found.
- one primary focal region (LAY-7) pass — squint on `ground-1440.png`: headline + saturated-green blueprint lead; the ground is a hairline at ~1.14:1 against `--background` and never enters the rank.
- page-template fit (LAY-3) pass — marketing landing template unchanged; chrome-only change.
- density suits the task (LAY-5) pass — the flanks were empty whitespace; they now carry quiet measure and the sheet's own density is untouched.
- product column grid (LAY-1) n/a — no `.dx/design.json`, so no `layout_system` declared.
- component consistency (CMP-7) FAIL — square ground handle vs the live hero's round `<circle r="9">` registration dots and the sheet's crosses; the recorded reason cites a component (`blueprint.tsx`) that renders nowhere. Verified manually.
- stack component exists for the need (CMP-1) pass — evidence source: **product codebase read** (no `.dx/`, so no manifest exists, per the v0-limit clause). A decorative drafting layer has no Base UI equivalent; `SheetGround` adds no interactive surface.
- at most one primary filled action (CMP-5) pass — hero keeps the one filled "Quick start" (`bg-primary`), closing CTA is outlined; removing the same-named nav text link strengthens rather than weakens this.
- structure is programmatically determinable (A11Y-7) pass — `header` / `nav[aria-label="Primary"]` / `main#main-content` / `footer` intact; the ground is one `aria-hidden` div with no headings or landmarks.
- custom components expose name/role/value (A11Y-8) pass — ground adds no interactive component (0 focusables inside it); the pre-existing illo `button` carries `aria-label` that tracks the `playing` state and `title` to match.
- brand colour for primary/brand moments (COL-1) pass — no new colour; only `--border`, `--sheet-band`, `--surface`; hero CTA still `bg-primary` (lime).
- plain-language names (CNT-2) pass — remaining nav labels "Docs" / "Builder's note" / "GitHub"; no portmanteau or codename introduced.
- one term per thing (CNT-10) pass — "Quick start" still names the same thing in the hero CTA, the closing CTA, and `lib/nav.ts:16`; only a duplicate entry point was removed.
- voice quality and tone-fit (CNT-14) pass — no copy added; context is marketing/onboarding and the surviving nav labels are the plainest available nouns. Gestalt only; no mechanical miss to attribute.
- product tone register (IDN-3) pass — register unchanged; the removal cannot shift tone and the hero copy I read ("gives your coding agent a shared design language…") stays plain and second-person.
- motion never carries meaning alone (MOT-3) n/a — the layer is entirely static; no transition or animation added.
- card only for an interactive unit (SLP-11) pass — the ground adds no card chrome; the flank rules sit outside the sheet, not on a container.
- complex tasks get a page not a modal (SLP-10) n/a — no modal, no task.
- domain fidelity (CNT-4) n/a — the surface models no real-world artifact whose scope or terminology could drift.
- empty-state clarity (CMP-4) n/a — no empty-state view on either route.
- draft safety / escapability (CMP-8) n/a — no multi-step or data-entry flow.
- cross-user sanitisation (CMP-9) n/a — no user-authored content renders here; grep for `dangerouslySetInnerHTML` / `v-html` on the surface: none.
- destructive actions (CMP-2) n/a; async states (CMP-3) n/a; data tables (CMP-6) n/a; tabular figures (TYP-5) n/a; body measure (TYP-6) pass-unchanged — no type added.
- CaseSync restraint (IDN-4) n/a — run product is the dx-harness site, not casesync.

VERIFICATION LEDGER:

| Control | Method | Evidence |
|---------|--------|----------|
| A11Y-1  | manual | 0px intrusion into `[data-sheet]` at 320/360/480/768/1024/1088/1199/1200/1201/1280/1440/1920/2560 — measured both element boxes AND painted `path`/`rect` bboxes clipped to the SVG viewport; no text/background pairing changed. `checks/contrast.py` also exit 0 on the changed files |
| A11Y-2  | script | `checks/a11y-static.py` clean on `sheet-ground.tsx` + `layout.tsx`; also walked Tab from load — skip link first (z-50, visible, 2px solid outline), then logo/Docs/Builder's note/GitHub/hero CTA, each hit-testing to itself; 0 focusables inside the ground |
| A11Y-3  | script | `checks/a11y-static.py` clean — no form field added |
| A11Y-4  | manual | nav links measured h=44 at 320/360/768; illo control `size-11` = 44px |
| A11Y-5  | manual | read `sheet-ground.tsx` end to end — no `transition`, `animation`, or easing declared; nothing to gate on reduced motion |
| A11Y-6  | script | `checks/a11y-static.py` clean; root computes `aria-hidden="true"` with 0 focusable descendants, so the decorative SVGs are out of the AT tree |
| A11Y-7  | manual | read the rendered DOM — header / `nav[aria-label="Primary"]` / `main#main-content` / footer intact; ground adds one `aria-hidden` div, no headings |
| A11Y-8  | script | `checks/a11y-static.py` clean; ground adds no interactive component; illo button's `aria-label` tracks `playing` |
| A11Y-9  | manual | `<title>` = "DX Design Harness — design in code with confidence" served on `/` |
| A11Y-10 | manual | first Tab from load focuses "Skip to main content" (`href="#main-content"`, z-50), visible and clickable above the new layer |
| A11Y-11 | unverified | n/a — no async state change in this change; nothing to announce |
| TOK-1   | script | `checks/token-audit.py` exit 0 on `sheet-ground.tsx`, `layout.tsx`, `globals.css`; read the component: only `var(--border)`, `var(--sheet-band)`, `var(--surface)`, `--ground-pitch` |
| TOK-2   | script | `checks/token-audit.py` exit 0; arbitrary values present (`h-[760px]`, `w-[320px]`, `calc(50%±520/560px)`) are drawing geometry, not spacing |
| TOK-3   | script | `checks/token-audit.py` exit 0 — no radius added |
| TYP-1   | script | `checks/type-scan.py` exit 0 — no type added |
| TYP-2   | script | `checks/type-scan.py` exit 0 |
| TYP-5   | unverified | n/a — no numeric columns added |
| TYP-6   | manual | measure unchanged; hero body `max-w` untouched by this change |
| COL-1   | manual | read the component — no new colour; hero CTA still `bg-primary` (lime); ground is neutral only |
| COL-2   | script | `checks/token-audit.py` + `checks/contrast.py` exit 0 — no functional success/warning/danger colour introduced |
| CMP-1   | manual | product codebase read (no `.dx/`, no manifest) — no Base UI component covers a decorative drafting layer; `SheetGround` is presentational SVG/CSS |
| CMP-2   | unverified | n/a — no destructive action on either route |
| CMP-3   | unverified | n/a — no async transaction |
| CMP-4   | unverified | n/a — no empty-state view |
| CMP-5   | manual | counted filled actions in the rendered frame: one (`bg-primary` hero "Quick start"); closing CTA outlined |
| CMP-6   | unverified | n/a — no data table |
| CMP-7   | manual | compared the ground's `<rect>` handles against the live `DxdConstructionPreview` (`<circle r="9">` at lines 284-287, `r="5"` at 275) and the sheet's `Registration` crosses; grepped `Blueprint` across `app/ content/ lib/` — the cited square-handle component renders nowhere. FAIL |
| CMP-8   | unverified | n/a — no multi-step or data-entry flow |
| CMP-9   | unverified | n/a — no cross-user content; grep for `dangerouslySetInnerHTML`/`v-html` on the surface returns nothing |
| CNT-2   | manual | read the three surviving nav labels: "Docs", "Builder's note", "GitHub" — all plain nouns |
| CNT-10  | manual | traced "Quick start" across `page.tsx:145`, `page.tsx:332`, `lib/nav.ts:16` — one term, one thing |
| CNT-14  | manual | read the nav labels and unchanged hero copy against the voice attributes; context is marketing/onboarding, tone inviting and plain; no new copy to grade |
| CNT-4   | unverified | n/a — no real-world artifact modelled |
| MOT-1   | manual | read `sheet-ground.tsx` — no duration or easing declared |
| MOT-2   | script | `checks/waiver-reconcile.py` exit 0; no raw ms or cubic-bezier added |
| MOT-3   | unverified | n/a — layer is static |
| IDN-2   | manual | read the component — generic drafting geometry only; no product icon or mark redrawn |
| IDN-3   | manual | register unchanged; read the hero copy — plain, second person |
| IDN-4   | unverified | n/a — run product is the dx-harness site, not casesync |
| SLP-1   | manual | computed style of the one gradient: `repeating-linear-gradient(rgb(228,228,231) 0px, rgb(228,228,231) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 40px)` — hard-stop hairline in one token neutral; no purple/violet, no cyan-on-dark, no glow shadow |
| SLP-2   | manual | read the component — no gradient text; the gradient is a background pattern |
| SLP-3   | manual | the flank rules sit 40px OUTSIDE the sheet on no container; not a side-tab on a rounded card |
| SLP-4   | manual | read the DOM — no card added, so no nesting |
| SLP-5   | manual | no icon-tile-above-heading template added |
| SLP-6   | script | `checks/type-scan.py` exit 0 — hierarchy untouched |
| SLP-7   | manual | read the rendered frame — the flanks group tighter than the sheet's sections; no single spacing value applied uniformly |
| SLP-8   | manual | read the component — no easing declared, so no bounce/elastic possible |
| SLP-9   | script | `checks/content-lint.py` covered by `pnpm build`'s check-standards; no prose added (one nav link removed) |
| SLP-10  | unverified | n/a — no modal |
| SLP-11  | manual | read the DOM — ground adds no card chrome |
| LAY-1   | unverified | n/a — no `.dx/design.json`, so no `layout_system` declared |
| LAY-2   | manual | `scrollWidth == clientWidth` at 13 widths incl. 320; 0 ground parts at 1199, 4 at 1200; nav wraps to 2 rows at 320/360 with all 4 links at h=44 and the hero CTA reachable |
| LAY-3   | manual | read the route — marketing landing template unchanged |
| LAY-4   | manual | no body-text container added or widened |
| LAY-5   | manual | read `ground-1440.png` + the 2× flank crops — the flanks carry quiet measure where there was empty whitespace; sheet density untouched |
| LAY-6   | manual | recomputed the geometry: scale rule at x=40 off the sheet edge, arc centre (0,380) r=320, crossings y=380±317.49; `rect x=37 w=6` and `y=59.5/694.5 h=6` centre exactly on (40, 62.5) and (40, 697.5) |
| LAY-7   | manual | squint on `ground-1440.png` and `ground-1280-hero.png` — headline + green blueprint lead; the ground is ~1.14:1 against `--background` and enters no rank |

UNCOVERED (defects no control covers — feed the ratchet):

- A decorative layer's behaviour under `forced-colors: active` is ungoverned, and this layer degrades badly there. Measured with `forcedColors: "active"` at 1440: the scale's tick pattern computes `backgroundImage: none` (the UA drops the background image) while its `borderColor` is forced to `rgb(0, 0, 0)`, and the SVG arc / dashed axis / wedge / handles keep their unforced near-white paint (`pathFill: rgb(247, 247, 248)`). Net result: the ruler loses its rhythm and becomes two solid black full-height rules 40px outside the sheet, the construction they measured disappears, and the page reads as four stray vertical black lines. A decorative layer becoming LOUDER and MEANINGLESS in the mode a user chooses for clarity is the failure class. A11Y-1 does not fire (no text pairing changes), A11Y-6 does not fire (still `aria-hidden`). Candidate control: "a decorative layer either declares `forced-color-adjust` / withdraws under `forced-colors: active`, or its forced-colors rendering is captured and judged." This is a third proposal alongside the record's own two, and it generalises past this surface — the sheet's flanks, the registration crosses, and the hero blueprint all share it.
- Nothing requires a record's stated verification environment to be the one that ran. The record says the measurements were taken "in the production DOM" and the gate report says "46/46"; the server was `next dev` and the suite is 44/46. `checks/audit-record.py` validates the ledger's SHAPE but cannot check that a claimed environment or gate result is true — which is how a false gate claim reached a reviewer.

**Recommended human review** on one close call: whether the ground's arcs read as "a single circle continuing behind the page" (the record's phrase). Geometrically they are two mirrored semicircles each centred *on its own sheet edge* with vertical tangents there, so the implied hidden curve is not a circle and the two lobes cannot be one. Visually they do read as one large enclosing curve passing behind the plate, parenthesis-fashion, which is the effect you were after. I would not change the drawing; I would soften the record's wording. That is a judgment about perception, so it is yours or a designer's to settle, not mine to rule on.

## Findings addressed

- **BLOCKING — the recorded gate was red (44/46).** Real. Two assertions in
  `tests/site-contract.spec.ts` still expected the pre-copy-pass strings (the
  third-person meta description, and `"DESIGN.md"` as row 3's eyebrow). The
  reviewer is right that a red suite blocks the loop whichever change reddened
  it. Both assertions now match the shipped copy; the suite is 46/46.
- **CMP-7 fail — the handle shape had no basis in anything that renders.** Real,
  and the sharpest finding of the three reviews. My handles were 6x6 squares,
  justified in this record by "the hero blueprint's vocabulary" — but the
  square-handle component I had in mind, `components/landing/blueprint.tsx`,
  **renders nowhere** (a grep for `Blueprint` across `app/`, `content/` and
  `lib/` returns only a comment). The drawing that actually ships marks its
  construction points with round dots (`dxd-construction-preview.tsx:284`,
  `circle r="9"`), and the sheet's own corner marks are crosses. So the ground
  put a third shape on one drafting device, ~1100px from the second. Fixed by
  changing the shape, not the reason: the crossings are now
  `circle r="3.5"`, and the code comment cites the line it copies.
- **UNCOVERED — the layer degraded under `forced-colors: active`.** Real and
  worth more than its severity suggests. The UA drops `background-image` but
  forces border colours, so the tick scale lost its rhythm and became two solid
  black full-height rules while the construction they measured vanished — a
  decorative layer becoming *louder and meaningless* in the mode a reader chose
  for clarity. Fixed with `forced-colors:hidden`: it is decoration, so it
  withdraws, exactly as it does below 1200px.
- **"Nothing is invented" overstated by one device.** Conceded. The pitch, the
  `5 7` dash, the 45-degree cut and the round dots are all quoted from the hero
  (the reviewer verified the dash and rotation independently, and recomputed the
  pitch at 40.6px against my declared 40px). The *repeating* scale is not: the
  hero has a modular grid, not a ruler. The component comment now says so.
- **"A single circle continuing behind the page" was wrong.** Conceded, and
  corrected in the comment. The two arcs are mirrored semicircles each centred on
  its own sheet edge with vertical tangents there, so no one circle can join
  them. The reviewer's read — a parenthesis enclosing the plate — is what the
  drawing actually does, and it agreed the effect works; only the wording was
  false.
- **`z-10` is not a second defence.** Conceded. Every element from the `h1` up to
  the sheet computes a transparent background, and the first opaque layer is the
  shell's `bg-background`, which is `SheetGround`'s *parent* and therefore paints
  below it. `z-10` buys paint order, not occlusion, so the flank clipping plus
  its contract test are the sole backstop. Recorded here rather than papered
  over; the reviewer's suggestion to give `[data-sheet]` an opaque background
  would make the claim true and is left as a follow-up, not taken silently.
- **`/note` lost its only direct route to install** — accepted tradeoff, flagged
  to the builder. The nav removal was their explicit request; criterion 6 reasons
  only about `/`, where two CTAs remain. On `/note` install is now two hops via
  Docs. Closing it with a CTA on `/note` is the fix if the builder wants it.
- **Not taken, logged:** deriving the sheet width from one source instead of
  three literals (`max-w-[1040px]`, `calc(50%-560px)`, `calc(50%+520px)`);
  reconciling the two withdrawal thresholds (1088 for the registration crosses,
  1200 for the ground); deleting or rendering the dead `blueprint.tsx`. All three
  are real and none is this change's subject.

## Later changes to this ground

**2026-08-18, after the verdict above.** The builder supplied a second reference —
two rules crossing at a small square handle, with a staircase of fine cells
stepping away from it — and asked for that snap device, plus variation down the
page instead of one grid repeated to the footer.

**Snapped patches.** Four patches of a finer grid (`--ground-cell`, half the
ruler's pitch) revealed inside shapes whose every edge lands on a module line:
a stepped staircase (the reference's own shape), the same cells cut on the 45
degrees the sheet already uses, a plain two-by-one block, and a notched square.
Each carries a square handle on the corner it snaps from. They alternate flanks
at roughly 21 / 38 / 58 / 78 percent of the page, clearing the top construction
(which ends at 760px, about 15 percent).

Two decisions inside that:

- **The variation is in the shape, not the density.** All four draw the same cell,
  so they read as one paper snapped differently rather than four textures. The
  step is a full pitch — two cells — because a step equal to the cell landed on
  the cell lines and the staircase vanished. That was the first attempt, and the
  crop showed it: a few big squares instead of a stair.
- **The handle position is named per shape**, not defaulted. The stepped shapes
  snap from their outer top corner, the triangle from its right angle. Defaulting
  every handle to top-right left the triangle's floating in empty space, reading
  as a stray dot.

**A reversal, recorded.** These handles are squares, and the arc crossings kept
their round dots — so the layer now carries both shapes, which is exactly what the
review's CMP-7 finding objected to. The reversal is deliberate and the builder's:
the square is the snap idiom their reference shows, and it marks a different thing
from a construction point on a curve. If a later reviewer flags it again, the
resolution is to name the two devices in the catalogue or to pick one — not to
silently flip the shape a third time.

**Re-verified after the patches** (production build, `pnpm start`, no dev markers):
worst-case intrusion into `[data-sheet]` is **0px** at 1200 / 1280 / 1440 / 1920,
measured over every painted descendant of the ground layer;
`scrollWidth == viewport` at each; contract suite 46/46; token-audit, a11y-static,
type-scan, contrast and waiver-reconcile all exit 0. One measurement note: a first
pass reported 541px of intrusion, which was a false positive — the selector had
caught the compare slider's own `clip-path`, which lives inside the sheet by
design. The scoped re-measurement is the one above.

**2026-08-18 — the docs topbar drops "For agents".** Recorded here because this is
the only record that governs a nav-link removal, with the scope difference stated:
this record's subject is the *landing* shell (`app/(landing)/layout.tsx`), and this
change is the *docs* shell (`components/topbar.tsx`), which no record governs.

The link was the topbar's only right-hand item, so the empty
`nav[aria-label="Primary"]` went with it rather than being left for assistive tech
to announce as a navigation landmark with nothing in it (A11Y-7). `/for-agents` is
not orphaned: the docs sidebar lists it (`lib/nav.ts:99`) and `/overview` links it
in prose. Two contract assertions that measured that link's target size now
measure the wordmark home link instead, and one asserts the landmark is gone, so a
silent re-addition of an empty nav would fail. Suite 47/47 on the production build.

## Ratchet

1. **[proposed] No control covers a decorative layer's relationship to text.**
   This change's single most important property — that no graphic sits behind a
   glyph — has no control behind it. A11Y-1 governs the text/background pairing
   but says nothing about a decorative layer that could alter it, so the
   constraint had to be invented, argued, and pinned by a bespoke test. Candidate:
   "a decorative background layer either sits outside every text container, or
   its contribution to the text's effective contrast is measured and recorded."
2. **[proposed] No control covers a breakpoint below which decoration is
   withdrawn.** The 1200px threshold here, and the 1088px threshold the
   registration crosses already use, are both judgment calls made twice on the
   same surface with no rule to appeal to. Candidate: "decoration that needs a
   gutter states the width below which it is absent, and absence is the fallback
   rather than a squeezed variant."
3. **[proposed] No control governs a decorative layer under
   `forced-colors: active`.** This layer failed there and nothing would have
   caught it: A11Y-1 does not fire (no text pairing changes) and A11Y-6 does not
   fire (it stays `aria-hidden`). The failure class is a decorative layer growing
   *louder* in the mode chosen for clarity. Candidate: "a decorative layer either
   withdraws under `forced-colors: active` or its forced-colours rendering is
   captured and judged." Generalises past this surface — the flanks, the
   registration crosses and the hero blueprint all share the exposure.
4. **[proposed] Nothing requires a record's stated verification environment to be
   the one that ran.** This record claimed "the production DOM" while the server
   was `next dev`, and claimed 46/46 while the suite was 44/46.
   `audit-record.py` validates the ledger's *shape* and cannot check that a
   claimed environment or gate result is true, which is how a false gate claim
   reached a reviewer. Candidate: the evidence line names the server command and
   the build id it was taken against.
5. **Carried, still open, from `landing-feature-rows.md`:** media weight / page
   fetch budget; text baked into imagery (WCAG 1.4.5); a pause mechanism for
   looping media (WCAG 2.2.2) with a device clause covering
   `any-pointer: coarse`; and `audit-record.py`'s plugin-relative `REPO_ROOT`
   plus the fact that no package script calls it.
