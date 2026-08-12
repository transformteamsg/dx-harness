# Design decision record — landing page (storyline-first, docs-world restyle)

> One record per page or significant change. Started at the Phase 3 plan gate (the
> approved plan is the fixed artifact the verify phase grades against), finished at
> Phase 6.

- **Date:** 2026-08-11
- **Product:** dx-harness website (the harness's own marketing surface)
- **Change type:** modification (full restyle + narrative restructure of `/`)
- **Page type:** marketing landing
- **Run type:** attended
- **The person and the moment:** an engineer or designer already using Claude Code,
  arriving from a colleague's link, deciding in ~30 seconds whether the plugin earns
  an install.

## Sprint contract (done-criteria)

1. The landing renders entirely in the docs token system (light `--background`, zinc
   inks, TW blue accent, `--radius` family) with a Stripe-docs feel — no `--canvas-*`
   or `--tape-*` usage remains in `app/(landing)/`; the two-worlds rule in DESIGN.md
   is retired (system change, DESIGN.md updated).
2. Section order follows storyline A (`docs/research/landing-storyline.md`): hook with
   a first-viewport demonstration (`SlopCompare`) → named problem → promise ("intent
   without loss") → proof (the loop as one worked example) → path/CTA → real close.
3. No load-bearing claim lives in `aria-hidden` decoration; the tape strips are removed.
4. The two flat skill lists become moment-of-need groups with one-line transformations.
5. All in-scope catalog controls pass; the TYP-1 800-weight waiver is retired (display
   returns to on-scale weights).

## Chosen approach

Option 2 — **demo-first hero**: hook line over `SlopCompare` as the first-viewport
demonstration, install panel with the page's one primary action directly after, then
problem → promise → worked loop → grouped skills → No-CLI close. Look and feel keyed
to **docs.stripe.com** (user-chosen reference): white surfaces, crisp bordered panels
with subtle shadow, tight type ramp, TW blue as the single accent.

## Rejected options

- **Option 1 — docs-native essay** — quietest; the hook would be words, not a
  demonstration, under-selling the mechanism (impeccable: first viewport is a thesis).
- **Option 3 — spec-sheet translated** — cheapest diff but keeps the inventory-ordered
  Grafana skeleton the change exists to leave behind.
- **Stripe marketing register (gradient hero)** — rejected at the grill: SLP-1 bans the
  gradient palette; the landing's own demo exhibits it as the "before" specimen.

## Tradeoffs, named

- The distinctive dark tape identity is given up; differentiation now rests on the
  demonstration and the copy's specificity. Accepted: that identity was the complaint
  ("too literal a Grafana clone") and one visual world halves maintenance.
- Risk of reading as "just another light docs site" — mitigated by SlopCompare in the
  first viewport and the named-failures problem section, not by decoration.
- Heavier first viewport at 320px: hook → demo → install stack vertically; LAY-2 is
  the control to verify hardest.

## Controls in scope

A11Y-1, A11Y-2, A11Y-4, A11Y-5, A11Y-6..10, A11Y-11 (copy action), LAY-2, LAY-4,
LAY-6, LAY-7, TYP-1..4, TOK-1..3, COL-1, COL-2, SLP-1..11, CMP-1, CMP-3 (copy
async states), CMP-5, CMP-7, CNT-2, MOT-1, IDN-3. A11Y-3 n/a — no form fields.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| — | | none proposed; the prior TYP-1 800-weight waiver (Hex×Grafana display) is **retired** with its rationale | reza.ilmi (design owner) | this record |

## Plan approval

- **Approved by:** reza.ilmi (design owner), via structured Approve/Adjust gate
- **Approved on:** 2026-08-11
- **Grilled:** yes. Decisions resolved:
  - Stripe reference = docs.stripe.com feel (user); stripe.com's gradient hero
    rejected as an SLP-1 conflict.
  - Quincunx mark keeps five-phase geometry, re-inked from existing docs tokens
    (tw-blue / grass / amber / teal / cyan) — zero new tokens (user).
  - Facts resolved from context: old "no shadows" rule dies with the tape world
    (docs surface already uses `shadow-sm`); 600ms tape entrance removed with the
    strips; hook copy comes from storyline A; stale test assertion
    ("Why a standard, not a style guide") repointed at real page copy.

## Verify verdict

- **Screenshots:** `review/evidence/landing-2026-08-11/` — `360-full.png`,
  `768-full.png`, `1280-full.png`, `1280-viewport.png`, `slider-0.png`,
  `slider-100.png`, `copy-failed.png` (genuine headless clipboard denial),
  `copy-copied.png` (success via a demo-only clipboard stub — headless
  Chromium denies clipboard-write; noted per the Phase-4 demo-hook rule).
  The first evidence pass shipped three byte-identical frames; the evaluator
  caught it and both copy states were re-captured as distinct frames
  (md5-verified) post-verdict.
- **CMP-3 states:** the copy action has no loading state (clipboard write is
  effectively synchronous); success = `copy-copied.png`, error =
  `copy-failed.png`.
- **Token block line range:** `app/globals.css:9-134` (`:root` token block,
  exempt from token-audit).
- **Dark mode:** N/A — the site is light-only (no `.dark` layer, no toggle).
- **Verification ledger:** as recorded in the evaluator verdict below, with
  these post-fix amendments:

  | Control | Method | Evidence |
  |---------|--------|----------|
  | SLP-9 | script + manual | `content-lint.py` errors remain only on the two **waived exhibit lines** (`page.tsx` quoted buzzword, `compare.tsx:79` specimen) — the script has no waiver layer (ratchet item); the two-em-dash sentence was rephrased; other findings are in pre-existing untouched files |
  | CNT-2 | manual | inline `dx-waive CNT-2` added on the anti-specimen "Communication Hub" (`compare.tsx`), matching its sibling waivers — approver: reza.ilmi (design owner), pending their explicit confirmation per the evaluator's close-call note |
  | SLP-5 | manual | inline `dx-waive SLP-5` added on the exhibit tile grid |
  | A11Y-11 / CMP-3 | manual + frames | failed state now **holds until the next attempt** (timer removed for `failed`; cleanup on unmount added); both states evidenced as distinct frames |
  | LAY-6 | manual | footer re-aligned to the page's left text column (`justify-end` removed) |
  | LAY-2 | script | Playwright 37/37 re-run after all fixes |

- **Evaluator verdict (verbatim):**

> ## VERDICT: pass-with-findings
>
> Grading inputs: contract + `docs/decisions/landing.md` (approved plan), all 8 evidence frames, full code read of `app/(landing)/page.tsx`, `app/(landing)/layout.tsx`, `components/landing/*`, `components/compare.tsx`, `app/globals.css`, plus independent enumeration of the route's interactive controls.
>
> ### Done-criteria
>
> | # | Criterion | Result | Evidence |
> |---|---|---|---|
> | 1 | Docs token system, no `--canvas-*`/`--tape-*` | **met** | `grep -rn "canvas-\|tape-"` across `app/(landing)/`, `components/landing/`, `components/compare.tsx` → zero hits. Inks/accent resolve to `--tw-blue #0064ff`, `--radius` family, `shadow-sm` panels. Stripe-docs register reads true in `1280-viewport.png`: white surfaces, hairline borders, single blue accent. |
> | 2 | Storyline A order | **met at 1280/768, partially at 360** | `page.tsx` sections in order: hook+`SlopCompare` (l.25–70) → "You've seen this PR." (l.73) → "Intent without loss." (l.102) → "One ask, five phases." (l.117) → "Twenty-one skills, one prefix." (l.145) → "No command line?" (l.180). The *hook is a demonstration* claim breaks at 360: see LAY-5 below — neither panel is legible in `360-full.png`. |
> | 3 | No load-bearing claim in `aria-hidden` decoration; tape strips gone | **partially met** | Tape strips gone. `aria-hidden` is used only on the QuincunxMark (`layout.tsx:19`), the divider/handle (`compare.tsx:255,262`) and icons — no claims there. But the inverse fault exists: *both* compare panels are always in the AT tree regardless of slider position, unlabelled as before/after (see UNCOVERED). |
> | 4 | Two flat lists → moment-of-need groups with one-line transformations | **met** | `data.ts` `SKILL_GROUPS`: "When you're designing" (7) / "When you're shipping" (8) / "When you're starting out" (6) = 21, matching the "Twenty-one skills" heading and the "Eight skills" lede. Each skill carries a one-liner. |
> | 5 | In-scope controls pass; TYP-1 800-weight waiver retired | **not met** | Weights are 400/500/600 only across all four files (`grep font-*` → only `font-medium`/`font-semibold`) — the waiver retirement holds. But `checks/content-lint.py` (the SLP-9 deterministic half) was **not run** and **fails**, and the copy button's async-state evidence does not exist (see BLOCKING). |
>
> ### Plan fidelity
> Build matches the approved Option 2 structure (demo-first hero → install panel → problem → promise → worked loop → grouped skills → No-CLI close), the docs.stripe.com register, and the "zero new tokens" quincunx decision (`--warning-9`/`--sec-foundations`/`--success-9`/`--sec-products`, `layout.tsx:20-28`). No structure drift found.
>
> ### BLOCKING (must fix before ship)
>
> - **[contract item 5 / component-inventory coverage — evidence integrity]** The copy button's `copied` and `failed` states are **not evidenced**. `copy-state.png`, `copy-copied.png` and `slider-100.png` are byte-identical (`md5` = `318846adb8363c27bf562a32d7879192`) — all three are the same hero frame at exposure 100%, captured at 1280×900 where the install panel sits below the fold. The claim that `copy-state.png` shows "Select and copy instead" and `copy-copied.png` the success state is not supported by the files. CMP-3/A11Y-11 for that control are therefore verified from code read only; re-capture both states and re-verify.
> - **[SLP-9, L2 by tier but filed here as a run gap → see ADVISORY for the finding itself]** *not blocking as a control*; recorded under ADVISORY. The blocking part is the process claim: "deterministic checks already run" omitted `checks/content-lint.py`, which errors on this surface. Done-criterion 5 cannot be asserted until it is run clean or waived.
> - **[CNT-2, L1, no waiver on file]** `components/compare.tsx:64` — `"Communication Hub"` is an invented "…Hub" feature name rendered in UI. Every sibling defect in that panel carries an inline marker (`dx-waive SLP-1`, `SLP-2`, `SLP-4`, `SLP-9`, `CMP-5`, `SLP-6`); this one does not, so there is no waiver on file for an L1. Fix is one line (`dx-waive CNT-2 reason="…anti-specimen…"`) or a chip naming it. **Close call — recommend human confirmation** on whether CNT-2 reaches fictional demo content at all; graded blocking per the mechanical tier rule, not because the defect is severe.
>
> ### ADVISORY (should fix)
>
> - **[SLP-9, L2, script]** `app/(landing)/page.tsx:80` — `checks/content-lint.py` → `ERROR [SLP-9] buzzword "revolutionise"`. It is a deliberate quoted exhibit ("Copy that promises to 'revolutionise your seamless workflow.'") but carries no inline waive marker, unlike the identical string at `compare.tsx:74`. Add the marker or rephrase.
> - **[SLP-9, L2, judgment half — em-dash clustering]** `page.tsx:87-94`: *"Each of those failures above has a name in the harness's catalog — SLP-1, SLP-4, SLP-9, CMP-5 — and a check that catches it before you do."* Two em dashes in one sentence — the control's own mechanical rule. The lint misses it because JSX splits the sentence across `<span>`s, so this is a static-reach gap, not a pass. Six further single-dash constructions across a short page (`page.tsx:79, 111, 192`; `data.ts:26, 34`; `compare.tsx:242`) put this into the "clustering across a paragraph" territory the detail file reserves for the evaluator.
> - **[LAY-5, L2, manual]** The demo — the page's load-bearing hook — has a density mismatch at both ends. At 360 (`360-full.png`, hero crop) the 16:10 frame gives ~180px per side: the before copy is clipped mid-word ("Revolutionise your se|"), a chip overlaps the divider, and the after side shows fragments ("…t by Friday", "arents"). At exposure 0 (`slider-0.png`) the after panel has ~290px of empty void between "To: 4 classes · 127 parents" and the footer row, because its height is set by the before panel's content — the "on standard" exhibit reads unfinished. LAY-2 passes (no overflow, 37/37 Playwright) but legibility is the judgment half.
> - **[LAY-6, L2, manual]** `layout.tsx:69` — footer uses `justify-end` while every other element in the same 1080px container is left-aligned (visible in `1280-full.png`, footer links flush right against a left-aligned page). Unexplained edge drift, not a hierarchy signal.
> - **[A11Y-11, L1, pass-with-caveat → advisory only]** `copy-commands.tsx:22` resets to `idle` after 2500ms *including* the `failed` state, so the recovery instruction ("Select and copy instead" / "select the commands and copy them manually") disappears before a user can act on it. The channel choice itself is correct (transient → polite live region, no focus move); the timing is the defect. Also `window.setTimeout` is never cleared on unmount.
>
> ### SUGGESTIONS
>
> - Let the after panel own its intrinsic height (or set a shorter aspect at `sm:`) so `slider-0` shows a finished screen — serves LAY-5 and the demo's whole argument.
> - Below `sm`, swap the slider for a stacked before/after pair — serves LAY-2/LAY-5 and keeps criterion 2's "first-viewport demonstration" true at 360.
> - Left-align the footer links to the page's text column — LAY-6, one class change.
> - Hold the `failed` copy state until the next interaction instead of a 2.5s timer — A11Y-11 / recovery cost.
> - At ≥1280 the content caps at 760/640px inside a 1080px container, leaving the right half of the viewport empty; nudging the demo and install panel toward the container width would balance LAY-7's focal region.
>
> ### QUALITY GRADES
>
> - **Design quality — strong.** Hierarchy reads in task order (thesis → demonstration → one action), the 24ch/58ch/62ch measures are disciplined, and section rhythm (`py-16 sm:py-24` between hairline borders) is consistent; the only weak spot is the widescreen right-hand void.
> - **Originality — strong.** Distinctiveness comes from the mechanism (a live anti-specimen with real control IDs and inline waive markers), not decoration; the purple gradient is a quarantined exhibit, not the page's palette, and the multi-hue quincunx is deliberate identity geometry, not SLP-1 rainbow.
> - **Craft — acceptable.** `text-balance` on every heading, `text-pretty` on prose, property-scoped transitions (`transition-[border-color,box-shadow]`, `duration-(--motion-fast)`), `motion-reduce:transition-none`, and a documented `clip-path`-over-`overflow-hidden` decision are real craft — pulled down by the 360 demo, the empty after panel, and evidence that does not show the states it claims.
> - **Functionality — acceptable.** The task (decide, then install) completes: install commands are selectable and focusable (`pre tabIndex={0} role="region"`) even when the clipboard is denied, and `#no-cli` covers the no-terminal path. The failed-copy recovery instruction self-destructing after 2.5s is the one dead-end-ish edge.
> - **Dark mode — N/A: this surface renders in the light docs token world only; no dark frame captured and no `.dark` layer in scope.**
>
> ### JUDGMENT CONTROL NOTES
>
> - **LAY-3** pass — marketing landing rendered as a sectioned marketing page (hero → argument sections → CTA close), not an ad-hoc shell.
> - **LAY-4** pass — prose capped at `max-w-[58ch]`/`[62ch]`, headings at `[24ch]`; nothing above 80ch.
> - **LAY-5** fail — see advisory; quoted: `slider-0.png` after panel void, `360-full.png` "Revolutionise your se|" clip.
> - **LAY-6** fail — `layout.tsx:69` `justify-end` footer against a left-aligned page.
> - **LAY-7** pass — one focal region: h1 + `SlopCompare` + the single filled "Copy commands" button, in that order; squint test holds at 1280 and 768.
> - **LAY-1** N/A — no `layout_system` declared (`.dx/design.json` absent).
> - **TYP-2** pass — smallest text is `text-xs` (12px) on captions/chips/labels only; body at `text-sm`/`text-base` with `leading-relaxed`.
> - **TYP-3** pass — `type-scan.py` clean; all sizes Tailwind-default (`4xl/5xl/6xl` hero ramp).
> - **TYP-4** pass — no `uppercase`; `tracking-[0.08em]` on mono labels is letterspacing, not all-caps.
> - **SLP-1/2/4/6** pass — every gradient/nested-card/flat-hierarchy instance is inside `BeforePanel` with a matching inline `dx-waive` (`compare.tsx:56,68,79,113,124`) and a visible chip; the page proper has none.
> - **SLP-3** pass — no side-tab accent borders.
> - **SLP-5** pass-with-caveat — the three icon-tile cards (`compare.tsx:96-110`) are a textbook icon-tile grid; deliberate exhibit but the only one in the panel carrying neither a chip nor a `dx-waive` marker.
> - **SLP-7** pass — spacing has rhythm (`mt-1`/`mt-1.5` intra-group vs `mt-5`/`mt-12` inter-group).
> - **SLP-8** pass — `EASE_OUT = cubicBezier(0.215, 0.61, 0.355, 1)`, no bounce/elastic.
> - **SLP-9** fail — `page.tsx:80` lint ERROR + the two-em-dash sentence at `page.tsx:87-94`.
> - **SLP-10** N/A — no modal on the surface.
> - **SLP-11** pass — the two card-styled containers are the install panel (contains the copy button) and the demo frame (contains the slider); both are interactive units.
> - **CMP-5** pass — exactly one filled button on the page ("Copy commands", `copy-commands.tsx:30`, `bg-tw-blue`); the after panel's "Send to 4 classes" is a non-focusable `span` inside the demo region, and the before panel's two primaries are chipped and waived.
> - **CMP-7** pass — verified manually: nav/footer links, the mono chip, and the status pills all resolve to existing globals tokens (`--success-subtle/-muted/-9`, `--danger-*`, `--tw-blue`); no default colour/shape override found. The only novel colours are the `--demo-slop-*` set, declared as demo-scoped tokens in `globals.css:108-115`.
> - **COL-1** pass — the primary action and the accent are `--tw-blue`, the product's brand anchor.
> - **COL-2** pass — status colour is semantic: grass for "Passes the catalog", danger scale for violation chips.
> - **CNT-2** fail — `compare.tsx:64` "Communication Hub" (close call, see BLOCKING). Harness's own names ("Quick start", "One ask, five phases.", "No command line?") all pass.
> - **IDN-3** pass — plain, direct register throughout ("Your ask becomes a written contract", "drift is a defect"); no switched voice system, no marketing gush outside the quarantined exhibit.
> - **MOT-1** pass — the one animation is `DUR.base` = 200ms with `EASE_OUT`, gated on `useReducedMotionSafe()` *and* on prior interaction (`compare.tsx:214-227`); pointer drags apply directly with no easing lag.
> - **A11Y-11 (channel choice)** pass-with-caveat — transient outcome → `aria-live="polite"` `sr-only`, focus untouched, no double-announcement (`copy-commands.tsx:34-41`). Caveat: the failed message auto-clears (advisory above), and the frames meant to prove both states are duplicates.
> - **CNT-14** pass — onboarding/marketing context; tone is inviting and concrete, no dramatic register.
>
> Interactive controls I enumerated independently and spot-checked (all carry a visible focus ring via `focus-visible:outline-2 outline-offset-2 outline-(--color-tw-blue)`, a role and an accessible name): wordmark link, 3 nav links, 3 footer links, copy button, focusable `pre` (`role="region"` + `aria-label="Install commands"`), the range slider (`<label class="sr-only">` + `aria-valuetext` updated on input, focus ring surfaced on the handle via `peer-focus-visible`), the `#no-cli` anchor, the `/standards/catalog` figcaption link, the `/overview` link. Targets meet 44px (`min-h-11`) on nav, footer and the copy button.
>
> ### VERIFICATION LEDGER
>
> | Control | Method | Evidence |
> |---------|--------|----------|
> | TOK-1 | script | `token-audit.py` clean |
> | TOK-2 | script | `token-audit.py` clean |
> | TOK-3 | script | `token-audit.py` clean |
> | TYP-1 | script | `type-scan.py` clean; also grepped weights — only `font-medium`/`font-semibold`, 800 waiver retired |
> | TYP-2 | manual | read every text class in the four files — smallest is `text-xs` on captions/chips; body `leading-relaxed` |
> | TYP-3 | script | `type-scan.py` clean |
> | TYP-4 | script | `type-scan.py` clean; no `uppercase` class present |
> | A11Y-1 | script | `contrast.py` clean except pre-existing `components/ui/button.tsx:19` destructive variant (untouched, out of scope) |
> | A11Y-2 | script | `a11y-static.py` clean; also confirmed by hand that all 12 enumerated controls carry `focus-visible:outline-2` (slider via `peer-focus-visible` on the handle) |
> | A11Y-3 | manual | N/A — no form fields; the only input is the `type="range"`, named by `<label class="sr-only" htmlFor={id}>` |
> | A11Y-4 | script | `a11y-static.py` clean |
> | A11Y-5 | manual | read `compare.tsx:214-227` — intro animation gated on `useReducedMotionSafe()`; Playwright reduced-motion hydration test passes |
> | A11Y-6 | script | `a11y-static.py` clean |
> | A11Y-7 | manual | read heading order: single `h1`, six section `h2`, three group `h3`; `<ol>` for phases, `<dl>` for skills, `<figure>/<figcaption>` for the demo |
> | A11Y-8 | manual | slider's `aria-valuetext` rewritten on every input to track the visible divider (`compare.tsx:200`); copy button's label and live region change together |
> | A11Y-9 | script | `a11y-static.py` clean |
> | A11Y-10 | script | `a11y-static.py` clean |
> | A11Y-11 | manual | read `copy-commands.tsx` — polite live region, no focus move, no double channel; **visual states unverified** (the two state frames are duplicates of `slider-100.png`) |
> | LAY-1 | manual | N/A — no `layout_system` declared; `.dx/design.json` absent |
> | LAY-2 | script | Playwright site-contract 37/37 including 320/360 overflow |
> | LAY-3 | manual | read section structure against the marketing-page template |
> | LAY-4 | manual | measured declared measures in `page.tsx` — 24ch/58ch/62ch, none above 80ch |
> | LAY-5 | manual | compared `slider-0.png` (empty after panel) and the 360 hero crop (clipped both sides) against the demo's task |
> | LAY-6 | manual | compared container edges in `1280-full.png` — footer `justify-end` vs left-aligned page |
> | LAY-7 | manual | squint-read `1280-viewport.png` and `768-full.png` — one focal region, order matches priority |
> | COL-1 | manual | primary button and accent both resolve to `--tw-blue` (`globals.css:18`, `--primary` alias line 85) |
> | COL-2 | manual | read status colours — grass-9 success pill, danger scale chips, semantic not decorative |
> | CMP-1 | manual | evidence source: **product codebase read** — no component manifest wired; `shadcn` primitives untouched, landing composes raw elements |
> | CMP-3 | manual | read the three-state machine in `copy-commands.tsx`; **visual evidence missing** (duplicate frames) |
> | CMP-5 | manual | counted filled buttons in the rendered DOM/code — exactly one page primary; demo primaries chipped and waived |
> | CMP-7 | manual | checked each component's colours/radii/shape against `globals.css` tokens and the docs surface; no unrecorded override |
> | CNT-2 | manual | read every UI name on the surface; "Communication Hub" (`compare.tsx:64`) fails with no waiver on file |
> | CNT-14 | manual | read all copy against the voice attributes for the onboarding/marketing context |
> | IDN-3 | manual | read copy register against the IDN-3 calibration table |
> | IDN-4 | manual | N/A — product is dx-harness, not CaseSync |
> | MOT-1 | script | `lib/motion.test.ts` binds `DUR`/easing to the CSS tokens; also read the one animation (200ms, `EASE_OUT`) |
> | SLP-1..8, SLP-11 | manual | read each element against its control; every violation is inside `BeforePanel` with an inline `dx-waive` + chip, except the icon-tile grid (`compare.tsx:96-110`, SLP-5, marker missing) |
> | SLP-9 | script | `checks/content-lint.py` → 1 unwaived ERROR at `page.tsx:80`; plus a manual em-dash-chain finding the extractor cannot see at `page.tsx:87-94` |
> | SLP-10 | manual | N/A — no modal on the surface |
> | CMP-4 / CMP-8 / CMP-9 | manual | N/A — no empty state, no multi-step data entry, no cross-user content on this surface |
>
> ### UNCOVERED (feed the ratchet)
>
> - **Visually-clipped-but-AT-exposed comparison panels.** `compare.tsx` hides the after layer with `clip-path` and reveals the before layer beneath it — but neither panel is ever `aria-hidden`, so a screen-reader user always hears both, interleaved and unlabelled: "Communication Hub… Revolutionise your seamless communication workflow… Get started! Learn more… Term 3 broadcast… Passes the catalog… Send to 4 classes." The `role="group"` label ("Before and after: the same screen, default AI output versus on standard") says a comparison exists but nothing marks which content is which, so the anti-specimen's slop copy reads as the page's own claims. No control covers "content hidden by clip-path/clip must be labelled or hidden from AT for comparison widgets" — candidate new control, sibling to A11Y-8. Recommend per-panel labelling (e.g. nested `<div role="group" aria-label="Default AI output">` / `"On standard"`).
> - **Evidence-integrity check.** Nothing in `checks/` verifies that a review's evidence frames are distinct or show the region they claim; three identical files passed as three states here. A cheap `audit-record.py` extension (hash-dedupe the evidence directory, warn on collisions) would have caught it.
>
> Fix-first list before ship: (1) re-capture the copy button's `copied` and `failed` frames, (2) run `checks/content-lint.py` clean or waive `page.tsx:80`, (3) add the missing `dx-waive` markers (`CNT-2` on "Communication Hub", `SLP-5` on the tile grid), (4) hold the failed-copy message until the next interaction. LAY-5/LAY-6 are L2 and can ship as recorded advisories.

### Post-verdict fixes applied (same session)

1. Copy states re-captured as distinct, md5-verified frames (`copy-failed.png`,
   `copy-copied.png`).
2. `content-lint.py` run; the two remaining errors are the waived exhibit
   lines (`page.tsx` now carries the inline `dx-waive SLP-9` its sibling had);
   the script's missing waiver layer is a ratchet item. All other findings are
   in pre-existing files outside this change.
3. Inline `dx-waive CNT-2` (Communication Hub) and `dx-waive SLP-5` (tile
   grid) added to the anti-specimen panel.
4. Failed copy state now holds until the next attempt; timer cleared on
   unmount. Two-em-dash sentence rephrased.
5. Footer left-aligned (LAY-6). Both compare panels given per-panel
   `role="group"` labels ("Before: default AI output…" / "After: …on
   standard") — the evaluator's UNCOVERED recommendation.
6. Full re-verify: token-audit / a11y-static / type-scan clean; Playwright
   37/37.

**Shipped as recorded advisories (L2, not fixed):** LAY-5 at 360px (demo
panels cramped in the 16:10 frame; suggested stacked before/after below `sm`)
and the after panel's slack height at exposure 0; the ≥1280 right-hand void.

## Addendum — 2026-08-11, block re-hosting (scoped modification)

User-directed follow-up, approved via structured gate: lower sections re-hosted
as Linear-style bordered feature panels (Stripe-marketing energy without
gradients — SLP-1 holds). Problem section became exhibit rows with the demo's
red chip anatomy (`FAILURES` in `data.ts`); the loop became a vertical timeline
(blue nodes, hairline spine) in a panel; skills became three titled group
panels (`lg:grid-cols-3`, differing row counts — not an SLP-5 identical grid);
No-CLI close panelled; the promise stays un-panelled as the quiet moment.
Demo resting state kept at 50/50 (user choice). Verified: token-audit /
a11y-static / type-scan clean, Playwright 37/37, frames
`1280-panels.png` / `360-panels.png`.

## Ratchet

- **Proposed control:** comparison/reveal widgets that hide content visually
  (clip-path/clip/overflow) must either label each layer for AT or
  `aria-hidden` the non-exposed layer — sibling to A11Y-8.
  `[proposed — pending design-lead approval]`
- **Harness gaps (to file via the feedback skill):**
  1. `content-lint.py` has no `dx-waive` layer, so waived exhibit copy can
     never lint clean;
  2. no evidence-integrity check — hash-dedupe evidence directories in
     `audit-record.py` to catch duplicate frames;
  3. SLP-9's em-dash rule can't see sentences split across JSX elements.

