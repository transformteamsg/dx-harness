# Design decision record — landing graphics & interactions rework (`/`)

> Modification run over the shipped Frame landing (see `landing.md` for the page's
> founding record). Scope: the feature grid's figures and hover explanations, the
> how-it-works player, and the skill cards' tool marks.

- **Date:** 2026-08-16
- **Product:** other — outside the portfolio. The DX Harness website itself; site
  accent Radix lime, light-only. `products:`-scoped controls are deliberately out
  of scope — product outside the portfolio.
- **Change type:** modification (three sections re-skinned in place)
- **Page type:** marketing / landing
- **Run type:** attended
- **The teacher and the moment:** none directly — the reader is a designer or
  builder arriving cold, deciding in under a minute whether the harness is worth
  installing. The graphics now have to explain the mechanism to that reader without
  a docs detour.

## Sprint contract (done-criteria)

1. Each of the four feature cards explains what it is and why it's better on
   hover/focus, and stays readable on touch where hover doesn't exist. Figures are
   geometric compositions that carry each feature's key message (route-selection;
   scatter-to-alignment; primitives-recomposed; the two-source check).
2. "From a request to a reviewed result" makes the mechanism legible in one pass,
   following one concrete example end to end; it auto-plays once in view and the
   three stages double as scrub buttons.
3. The six skill cards read as skills/tools, not bots: ink-preset tool icons via
   the repo's `gen:icons` pipeline; the eye-follow mascots retired. Heading:
   "The skills inside the harness."
4. Frame language preserved: hairlines, sheet bands, lime as instrumentation plus
   the hero's one filled primary (CMP-5).
5. Motion inside the token scale, ease-out, no bounce, reduced-motion variants
   everywhere; hover-revealed content keyboard-reachable and always open on coarse
   pointers.
6. `pnpm build`, unit tests, and the site-contract e2e suite pass.

## Chosen approach

Divergence ran as three rendered directions (Claude artifacts): **A · Signal
Geometry** (bold static shapes, expand-below hover, clickable step-through),
**B · Measured Sheet** (dimension-marked figures, overlay hover, storyboard rail),
**C · Working Shapes** (figures perform their message, auto-playing run, stamp-press
tiles). The builder picked a composite:

- **Feature grid — C.** The SVG markup holds each shape's final pose; the `ff-*`
  rules in `app/globals.css` pull shapes back to an initial pose while the card is
  idle, so hover *performs* the claim: FIG 1's routes draw and the picked skills
  fill; FIG 2's scattered shapes fly onto the shared rule lines; FIG 3's primitives
  leave their palette ghosts and take their places in the product frame; FIG 4's
  two source rings close over the work, the check draws, then the exit arrow. The
  whole block is gated on `(hover: hover) and (prefers-reduced-motion:
  no-preference)`, so touch and reduced-motion readers see the resolved final
  state. Each card is now a link to its doc page, which is what makes the hover
  reveal keyboard-reachable; on coarse pointers the explanation is always open.
- **How-it-works — A+C hybrid.** `components/landing/harness-run.tsx` plays the run
  once when scrolled into view (typed prompt, three status lines, the reviewed
  screen back), highlighting the matching stage; the three stages are buttons that
  scrub the player, and a quiet "Replay the run" outline button sits under it.
  Server-rendered state is the finished run, so no-JS readers miss nothing.
- **Skills — B.** Six ink-preset tool icons (Orchestrator `waypoints`, Copy
  `pen-line`, Pattern `layout-template`, Polish `sparkles`, Execute `hammer`,
  Review `search-check`) added to `scripts/generate-ink-icons.mjs` and rendered
  single-ink on 64px lime-wash `rounded-xl` tiles by the shared
  `components/ink-icon.tsx` (extracted from the page's collaborator icons).

## Rejected options

- **A · Signal Geometry (whole-page)** — static bold shapes read well but explain
  less than shapes that perform; its step-through survives inside the hybrid.
- **B · Measured Sheet (figures & how-it-works)** — most coherent with the hero
  blueprint and legible with zero interaction, but the builder wanted the working
  figures; its skill tiles survive as picked.
- **Keeping the eye-follow mascots** — rejected by the builder: the six cards are
  skills, not sub-agents, and personas overstated agency. The tool marks state
  what each skill actually is.

## Tradeoffs, named

- **Hover growth moves the row.** Expanding a card's explanation grows its grid
  row, so its row-mate shifts. B's overlay avoided this; the builder chose the
  expand-below reveal knowingly.
- **An auto-playing section moves unasked.** Mitigated: plays once, only in view,
  never under reduced motion, and a click anywhere on the stages stops it.
- **Personality traded for clarity.** The eyes were a delight moment; the tool
  marks are quieter. Explicit builder call.
- **More client JS on the landing** (the player + IntersectionObserver) — small,
  and the server-rendered fallback is the complete finished state.

## Controls in scope

`TOK-1`, `TOK-2`, `TOK-3`, `TYP-1`, `TYP-2`, `TYP-3`, `TYP-4`, `COL-1`, `COL-2`,
`CMP-1`, `CMP-5`, `CMP-7`, `SLP-5`, `SLP-6`, `SLP-8`, `SLP-9`, `SLP-11`, `MOT-1`,
`LAY-2`, `LAY-3`, `LAY-5`, `LAY-6`, `LAY-7`, `A11Y-1`, `A11Y-2`, `A11Y-4`,
`A11Y-5`, `A11Y-7`.

CMP-2/CMP-3/A11Y-11: N/A — no destructive or real async action; the player is a
narrative drawing. IDN-4 and other `products:`-scoped controls: deliberately out of
scope — product outside the portfolio.

CMP-1 verdict: asserted, no manifest — this repo has no `.dx/component-manifest.json`;
the build composes existing site patterns (Link, the sheet/band shells) plus bespoke
landing SVG figures, which the founding record already established as this page's
illustration system.

## Waivers granted

None granted this run — the build removes deviations rather than adding them.

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| | | | | inline `dx-waive` / this record |

## Plan approval

- **Approved by:** wondopamine (builder) — direction pick "C figures / A+C hybrid
  how-it-works / B skill tiles" followed by "go" on the exposed plan with its
  stated recommendations (cards become doc links; hover row-growth accepted; icon
  mapping and heading rename as listed).
- **Approved on:** 2026-08-16

## Verify verdict

- **Screenshots:** session scratchpad `evidence/` set, captured from the production
  build — `360-full.png`, `768-full.png`, `1280-full.png` (width evidence);
  `features-idle.png`, `features-hover-1..4.png`, `features-focus.png`,
  `features-touch-390.png`, `features-reduced-motion.png` (feature-card states);
  `run-playing.png`, `run-finished.png`, `run-scrub-stage1.png`,
  `run-reduced-motion.png` (player states); `skills.png` (tool tiles).
- **CMP-3 evidence:** N/A — state does not exist: the section is a narrative
  drawing of a run; no real async action ships on this page.
- **Token block line range:** none added — all colours are existing tokens.
- **Dark mode:** N/A — product has no dark mode (light-only by design; no `.dark`
  layer, `app/globals.css` header comment).
- **Verification ledger:**

  | Control | Method | Evidence |
  |---------|--------|----------|
  | TOK-1..3, COL-1..2 | script | `checks/token-audit.py app components lib` clean |
  | TYP-1..4 | script | `checks/type-scan.py app components` clean |
  | A11Y-1 | script | `checks/contrast.py --tokens app/globals.css` clean on changed paths; token pairs reuse the precomputed AA set in `globals.css` |
  | A11Y-2 | script | `checks/a11y-static.py` clean; e2e: keyboard Tab reaches feature card and reveals its explanation; focus-visible ring asserted by class |
  | A11Y-4 | manual | after the round-1 fix: replay button measured 44×130 at 320/360/1280 (reviewer re-measured independently); stage buttons 176–209px tall; card links full-card |
  | A11Y-5 | manual | choreography gated on `prefers-reduced-motion: no-preference`; player skips autoplay and renders the finished run (e2e + `run-reduced-motion.png`) |
  | A11Y-7 | manual | sections keep h2/h3 hierarchy; stage headings moved inside buttons as styled spans (buttons allow phrasing content only) — noted for the reviewer |
  | SLP-9 (lint half) | script | `checks/content-lint.py` clean on changed files (one pre-existing CNT-3 hit in `blueprint.tsx:33`, untouched) |
  | LAY-2 | script | e2e overflow suite at 320/360 on `/` passed |
  | CMP-5 | manual | hero keeps the page's only filled primary; replay is an outline button; result-screen lime block is drawing, not a control |
  | MOT-1 / MOT-2 / SLP-8 | manual | after the round-1 fix: every duration AND delay resolves to a `--motion-*` token (three `--motion-beat-*` added); no `animate-*` utility remains; figure choreography uses `--motion-story` (narrative surface); no bounce/elastic anywhere |
  | SLP-5/6/11, LAY-3/5/6/7, COL-1, CMP-7, TYP-4, SLP-9 (evaluator half) | manual | graded by the dx-design-review agent — verdict below |

- **Evaluator verdict — round 1 (`dx-design-review`), pasted verbatim:**

VERDICT: fail

> VERDICT: fail
>
> *(One L1 control violated with no waiver on file. It is a one-line fix, but the mechanical rule puts it in BLOCKING. Everything else is L2 or better.)*
>
> **Inputs note:** no `.dx/design.json` and no `DESIGN.md` exist at the product-repo root (`/Users/jeongwondo/.herdr/worktrees/dx-harness/landing-page`) — I checked directly rather than relying on the spawn. **No standing overrides are in force**, and LAY-1 is N/A (no `layout_system` declared). All measurements below were taken with Playwright against the production build (`pnpm start`, port 3111, BUILD_ID `f25HsTT88w0bEdyKz4PKy`), not from the screenshots alone.
>
> BLOCKING (must fix before ship):
>
> - **Interactive targets are at least 24×24 px, 44 px on mobile (A11Y-4, L1)** — the new "Replay the run" button in `components/landing/harness-run.tsx:213-219` measures **36 × 130 CSS px at both 320 and 360 px** (measured `getBoundingClientRect` at all three widths; 36 px at 1280 too). This repo treats 320/360 as mobile — `tests/site-contract.spec.ts:24` `const mobileWidths = [320, 360]` and lines 186–209 assert 44 px there. Every other target on this page is compliant (`Quick start` 44×116, `See all skills` 44×81, stage buttons 176–209 px tall). The component inventory flagged `min-h-9` itself; the plan records **"Waivers: none"**, so no waiver is on file. A waiver would need a named human approver and a specific reason why this one control may sit under the mobile floor — do not write one to close this; `min-h-11` matches the page's own convention. Verified manually (no script covers computed hit area; `a11y-static` is a static subset and cannot see it).
>
> ADVISORY (should fix):
>
> - **Control-group members share one resting affordance (CMP-7, L2)** — the three stage scrub buttons fail the control's third `fails_when` bullet exactly. Measured after autoplay settled: stages 01 and 02 resolve to `backgroundColor: rgba(0,0,0,0)`, `borderLeftColor: rgba(0,0,0,0)`, `cursor: default`; **hovering stage 01 changes nothing** (identical computed values before and after a 500 ms hover). Only the current stage carries `border-site-accent bg-site-accent-wash`. Source: `harness-run.tsx:228-232` has no `hover:` class at all. Contract item 2's "the three stages double as scrub buttons" is delivered in code but not communicated — nothing tells a reader 01 and 02 are clickable. Verified manually (no script).
> - **No icon-tile-above-heading feature-card template, no identical card grids (SLP-5, L2)** — the six skill cells (`app/(landing)/page.tsx:245-270`) are a 64 px `rounded-xl border bg-site-accent-wash` tile holding a 36 px icon, then an 18 px bold heading, then two lines of grey body, repeated identically six across in a grid (`evidence/skills.png`). That is the shape the control names. Mitigating: the cells themselves are hairline sheet cells, not floating cards, and each carries a distinct command chip — this is an index, not decorative marketing. The plan approved the tiles, but the plan states "Waivers: none" and no inline `dx-waive SLP-5 reason="…"` exists. L2 with `waiver: rationale` — either record the rationale inline or drop the tile. Verified manually; the `slop-layout` script that would cover SLP-5..7 is **not built** (`checks/README.md:336`).
> - **Motion inside the token scale (contract item 5, partially met; MOT-2 `status: proposed`)** — two motion values sit outside `--motion-*`/`--ease-*`. (a) `harness-run.tsx:167` uses `motion-safe:animate-pulse` — Tailwind's built-in 2 s infinite animation with its own `cubic-bezier(0.4, 0, 0.6, 1)`. (b) `app/globals.css:293-295` hardcodes `transition-delay: 220ms / 320ms / 180ms`. The file's own comment at line 100 claims "the only durations and easings site code may use", so this is the build contradicting its own declaration. Both are harmless in effect (the pulse is reduced-motion-gated, no bounce, SLP-8 clean) — flagged as advisory rather than blocking because MOT-2 is `status: proposed`, not settled.
> - **Plan fidelity — FIG 1's second beat does not render.** The approved direction is "FIG1 routes draw + picked shapes fill". The routes draw correctly, but the fill goes `var(--surface)` `#ffffff` → `var(--site-accent-wash)`, which resolves to **rgb(250, 254, 244)** (sampled via canvas), on a `#fafafa` ground. Comparing `features-idle.png` with `features-hover-1.png`, the three picked shapes are visually identical in both frames — the "picked" half of the argument is a dead beat. FIG 2, 3 and 4 all perform as planned (verified frame-by-frame). Not a control violation; a plan-fidelity finding.
>
> SUGGESTIONS (not violations):
>
> - Reserve the reveal height (or expand within the card box) so hovering a row-1 card stops pushing rows 2 down — FIG 3 moves from y=364 to y=447 (**83 px**) between `features-idle.png` and `features-hover-1.png`, so a pointer travelling toward card 3 has its target move out from under it.
> - Give inactive stage buttons a quiet resting mark (a `border-border` left rule, or a hover wash) plus `cursor-pointer` — serves CMP-7 and makes the scrub affordance discoverable without adding chrome.
> - Deepen FIG 1's picked-shape fill (a `--site-accent` fill at the strength FIG 2's seated circle already uses, or a stroke-weight step) so the "picked" beat reads at 8 % wash's current invisibility.
> - Replace the sparkles mark for Polish (`scripts/generate-ink-icons.mjs:45` → `"skills/polish": "sparkles"`) — the four-point sparkle is the single most recognisable "AI magic" icon, and it sits on the landing page of an anti-slop product.
> - Bring the run's total autoplay under 5 s (currently `t0 + 3400` ≈ **5.01 s** to the last beat, plus a 600 ms result transition) or give the stop path a visible label — right now clicking a stage silently clears the timers, which is a stop mechanism nobody can see.
>
> QUALITY GRADES:
>
> - **Design quality — strong.** The hairline sheet, the one filled lime action in the hero, and the 30 px → 18 px → 14 px cascade give the page a clear single reading order; the squint test lands on "Design in code with confidence." and its one filled button, exactly where the task wants it.
> - **Originality — strong, with two pulls toward the mean.** The four working figures are genuinely bespoke argument-drawings rather than stock decoration, and the deliberate lime-as-instrumentation system is a design decision, not the SLP-1 rainbow tell; against that, the six-up icon-tile grid (SLP-5) and the sparkles mark are the two places the page reverts to the default template.
> - **Craft — acceptable.** States are designed (idle/hover/focus/coarse-pointer/reduced-motion all captured and all correct), but three details are unfinished: a 36 px button on a page where everything else is 44, a choreography beat that renders invisibly, and FIG 1's two decoy shapes sitting ~3 px from the figure's top and bottom edges so they read as clipped artifacts rather than as the unpicked skills they represent.
> - **Functionality — acceptable.** Every path completes: the cards navigate, the run plays and can be replayed or scrubbed, no-JS and reduced-motion readers get the finished state, and 320 px reflows single-column with nothing unreachable — but the scrub controls have no visible affordance, so the interaction most of contract item 2 rests on is only findable by accident.
> - **Dark mode — N/A: product has no dark mode** (site is light-only by design; confirmed no `.dark` layer in `app/globals.css`).
>
> JUDGMENT CONTROL NOTES:
>
> - **Primary actions use the product's own brand colour (COL-1)** — pass. The one primary is `bg-primary` → `--site-accent` `#bdee63` with `--primary-foreground` `#18181b` (**13.6:1**, so the light-hue/white-label failure mode is avoided); no other product's primary (TW blue, CaseSync indigo, Glow orange) appears in the changed sections.
> - **Use the stack component where one exists (CMP-1)** — pass. `CMP-1: asserted, no manifest — manifest absent for the DX Harness website`. Evidence source: **(a) reviewed the product codebase directly**, plus (c) general knowledge of the Base UI / shadcn catalogue — neither ships a stepper or a narrative-figure component, and the new work is native `<ol>/<li>/<button>/<a>` plus bespoke SVG, i.e. composition, not a fork. No `.dx/component-manifest.json` exists.
> - **At most one filled action per view (CMP-5)** — pass with caveat. Exactly one filled button on the page (hero `Quick start`, `bg-primary`); the closing CTA steps down to `bg-surface border-muted-foreground`, `See all skills` is a link, `Replay the run` is outline, stage buttons are ghost. Caveat: the run drawing contains a lime-filled block (`harness-run.tsx:205`) that reads as a filled button at a glance — it is `aria-hidden` decoration inside a `role="img"` figure, so not an action.
> - **Components stay consistent with defaults and siblings (CMP-7)** — **fail** (see ADVISORY). Also noted but not flagged: the feature grid draws its cell hairlines with `sm:[&:nth-child(odd)]:border-r` while the adjacent skills grid uses `-mr-px border-r` for the same effect — visually identical, internally inconsistent.
> - **A card is only for an interactive unit (SLP-11)** — pass. The four card-styled containers are `<a>` links (the card *is* the click target); the six skill cells carry hairline separators only, no radius/shadow/background, so they are not cards; the 64 px tile is an icon container inside a cell, not a content card.
> - **No icon-tile-above-heading template (SLP-5)** — **fail** (see ADVISORY).
> - **Adjacent type-scale steps differ by ≥1.25× (SLP-6)** — pass. Chains used: 60 → 30 (2.0×), 30 → 18 (1.67×), 18 → 14 (1.29×). The 12 px eyebrow sits above the 18 px claim in the chain, not adjacent to the 14 px body, and is differentiated by weight and colour.
> - **No bounce or elastic easing (SLP-8)** — pass. `--ease-out: cubic-bezier(0.215, 0.61, 0.355, 1)` and `animate-pulse`'s `cubic-bezier(0.4, 0, 0.6, 1)` both keep y within [0,1]; no `transition-all` anywhere in the changed files.
> - **Copy carries no AI-writing tells (SLP-9, evaluator half)** — pass with caveat. `content-lint` exits 0; "catalog" spelling and the "you"/"your agent" actor rule hold; none of the repo's extra banned words appear. Caveat: three of the four "Why it matters" lines land on a negation — "not yours", "not like a page any model would make for anyone", "you are not the first quality check" — which reads as a rhetorical tic across the grid rather than four independent sentences.
> - **Surface maps to a known page template (LAY-3)** — pass. Standard marketing-landing template: hero → feature grid → mechanism → proof → directory → closing CTA. No bespoke shell.
> - **Density suits the task (LAY-5)** — pass with caveat. Scanning densities are right throughout; the caveat is the run's left half, where a 208 px-wide (`max-w-[13rem]`) drawing sits in a ~519 px column at 1280 and a full 768 px band at tablet, leaving the figure looking underweight against three stages of body copy.
> - **Shared edges align (LAY-6)** — pass. All cells share `px-6 sm:px-10`; the `-my-1` compensation on `See all skills` keeps that band the same height as the action-less bands; the `-mr-px`/`-mb-px` pull-backs land the outermost hairlines on the sheet flank at all three widths.
> - **One primary focal region, reading order matches priority (LAY-7)** — pass. Squint test at 1280 lands on the hero h1 plus the page's only filled button; every subsequent region is subordinate and sequential.
> - **Interface motion is 100–300 ms with standard easing (MOT-1)** — pass with caveat. Interface transitions are `--motion-fast` 120 ms and `--motion-base` 200 ms; the 600 ms `--motion-story` is confined to the narrative figures and the result panel, which the product's own token comment (`globals.css:103-104`) reserves for exactly that. Caveat is the 2 s `animate-pulse` cursor (see ADVISORY). Verified manually — the `motion` script covering MOT-1/SLP-8 is **not built**.
> - **Motion never carries meaning alone (MOT-3)** — pass. `features-reduced-motion.png` shows all four figures in their resolved pose (routes drawn, shapes seated, primitives placed, check + exit arrow drawn) and `run-reduced-motion.png` shows every status line and the returned screen — no information is lost with animation off, only the movement.
> - **Text is never set in all-caps (TYP-4)** — pass with caveat. `type-scan` exits 0. Caveat: "FIG 1".."FIG 4" (`feature-figure.tsx:169`) are letterspaced all-caps strings; I read them as genuine figure-label abbreviations, which the control exempts, and the script agrees — a close call, "Fig. 1" would remove the doubt.
> - **prefers-reduced-motion disables non-essential animation (A11Y-5)** — pass. The entire `ff-*` block is gated on `@media (hover: hover) and (prefers-reduced-motion: no-preference)` (`globals.css:282`); autoplay is suppressed at `harness-run.tsx:120`; every transition carries `motion-reduce:transition-none`; the cursor blink is `motion-safe:`-gated. Under reduced motion a user-pressed "Replay the run" still steps the beats, but with all transitions off nothing actually animates — a stepped content reveal, not motion.
> - **Structure is programmatically determinable (A11Y-7)** — pass with caveat. Heading outline reads h1 → h2 → h3 with no skips (16 headings enumerated from the rendered DOM); grids are `<ul>/<ol>`, the run figure uses `figure`/`figcaption`. Two caveats: (1) the stage headings are `<span class="text-lg font-semibold">` not headings — correct, since a heading may not nest in a button, and `<ol><li>` plus `aria-current="step"` carries the sequence instead; (2) each feature-card link's accessible name runs ~250 characters (verified by ARIA snapshot: *"Orchestrator skill Start with a plain-language request. You say what you want in your own words. dx-design reads the request… Why it matters — No tool names to learn…"*) because the clipped reveal stays in the accessibility tree. Descriptive out of context, but a screen-reader user in a links list hears a paragraph per link.
> - **Custom components expose name, role, value (A11Y-8)** — pass. All three stage controls are native `<button>` with full text names; `aria-current="step"` appears on exactly the one visually highlighted stage and moves with it (verified across autoplay and a scrub click). The feature cards correctly expose no `aria-expanded` — there is no hidden state, the content is always in the tree.
> - **Copy carries the product's tone register (IDN-3)** — pass. One register throughout: plain, second-person, technically confident, no marketing lift ("You type the ask in plain words", "Your agent stops guessing at taste").
> - **Voice quality and tone-fit (CNT-14)** — pass. Context is a marketing/explanatory landing surface; the copy is Clear and Approachable without gushing. One improvement rather than a finding: card 1's claim is imperative ("Start with a plain-language request.") while cards 2–4 are noun phrases, so the grid's four voices are not parallel.
> - **Domain fidelity (CNT-4)** — pass. I have direct access to the modelled artifact (this repo). Every mechanism claim checks out: plan approval before build (`procedures/plan-approval.md`), a separate reviewer grading against both sources (`agents/dx-design-review.md`), skills reading the catalogue first (`procedures/catalogue-mechanics.md`). One wobble in the agent-facing twin: `content/sections/landing.mdx:52` says "Six skills cover the path…" while `SKILL_COUNT` computes 21 — defensible (the six design-loop roles do cover that path) but worth a word.
> - **Empty-state clarity (CMP-4)**, **draft safety (CMP-8)**, **cross-user sanitisation (CMP-9)**, **async announcement (A11Y-11)** — N/A. No empty state, no data-entry flow, no cross-user content (grep for `dangerouslySetInnerHTML`/`v-html` across the changed files returns nothing), and the player is a narrative drawing with no real async action, as the plan recorded.
> - **No celebration around case data (IDN-4)** — N/A. Scoped `products: [casesync]`; this run's product is outside the portfolio.
>
> CONTRACT COMPLIANCE:
>
> 1. **Met.** All four cards carry a "what" sentence and a "Why it matters — …" line, revealed on `group-hover`/`group-focus-visible` and always open at `pointer-coarse` (`features-touch-390.png` confirms). Figures carry their messages — with the FIG 1 fill exception above.
> 2. **Partially met.** The example runs end to end and autoplays once on intersection at 40 % (`run-playing.png` → `run-finished.png`), and the stages do scrub (`run-scrub-stage1.png`; `aria-current` moves) — but they carry no affordance saying so (CMP-7).
> 3. **Met.** Six ink tool icons via the `gen:icons` pipeline; `skill-mark.tsx` and `claude-code-chat.tsx` are deleted with zero remaining references (grepped across `app`, `components`, `lib`, `tests`); heading reads "The skills inside the harness."
> 4. **Met.** Hairlines, sheet bands and lime-as-instrumentation are intact, and exactly one filled action exists on the page (hero).
> 5. **Partially met.** Ease-out everywhere, no bounce, reduced-motion variants present and captured, hover content keyboard-reachable — but two motion values sit outside the token scale (see ADVISORY).
> 6. **Met, builder-reported for the test counts.** I did not re-run `pnpm build`/`pnpm test`; I did serve and exercise the existing production build, and re-ran the four deterministic checks myself (all exit 0).
>
> UNCOVERED (defects no control covers — feed the ratchet):
>
> - **Hover-triggered layout shift moves adjacent targets.** Expanding a feature card reflows the grid: FIG 3 drops 83 px (y=364 → y=447) when card 1 is hovered, so a pointer travelling toward a row-2 card has its target move. No LAY or MOT control names hover-induced reflow of *sibling* content; the closest, LAY-6, is about static alignment. Candidate rule: a hover or focus reveal must not displace content outside its own container.
> - **Auto-playing animation at the 5-second boundary with no visible pause/stop.** The run starts by itself on intersection and animates for ~5.01 s to the last beat plus a 600 ms transition, with a blinking cursor throughout. WCAG 2.2.2 (Level A) requires a pause/stop/hide mechanism past five seconds; clicking a stage does clear the timers, but nothing signals that. A11Y-5 covers reduced motion only, and no catalogue control covers pause/stop/hide.
> - **Sparkle/star "AI magic" iconography is not named by any SLP control.** `scripts/generate-ink-icons.mjs:45` maps `skills/polish` to `sparkles`. SLP-1 names purple gradients, cyan-on-dark and glow, but the four-point sparkle is arguably the strongest single visual AI tell now in circulation, and nothing in SLP-1..11 catches it.
>
> Calibration note: the A11Y-4 blocker and the CMP-7 affordance finding are unambiguous and measured. The SLP-5 call is a genuine close call — reasonable reviewers could read six sheet cells with distinct commands as an index rather than the AI feature-card template — and I recommend a human decide whether to record a rationale or change the tile. The SLP-3 side-tab reading is likewise a close call worth a human eye, since the repo's CLAUDE.md states the house rule more absolutely than the catalogue control does.

- **Fixes applied after round 1** (all five, in `harness-run.tsx`, `feature-figure.tsx`, `globals.css`): `min-h-9` → `min-h-11` on Replay; inactive stage buttons given `border-border hover:bg-accent` + `cursor-pointer`; FIG 1's picked shapes filled `--site-accent` instead of the 8% wash; the three raw `transition-delay` values tokenised as `--motion-beat-1|2|3` and `animate-pulse` removed; autoplay retimed to finish inside five seconds.

- **Evaluator verdict — round 2 re-check (`dx-design-review`), pasted verbatim — this is the run's standing verdict:**

VERDICT: pass-with-findings

> Re-check complete. All five fixes re-measured against the rebuilt production build on port 3000 (I re-served and exercised it myself rather than taking the reported numbers).
>
> VERDICT: pass-with-findings
>
> *(The single L1 blocker is resolved and independently re-measured. Everything still open is L2 or uncovered, and two of those are sitting with the human builder by design.)*
>
> PER-FIX VERDICTS:
>
> **1. A11Y-4 — "Replay the run" under the mobile floor → RESOLVED.**
> Re-measured with `getBoundingClientRect` at all three widths on the new build: **44 × 130 at 320, 44 × 130 at 360, 44 × 130 at 1280**. Your numbers reproduce exactly. The button now matches the page's own convention (`Quick start` 44 × 116, `See all skills` 44 × 81), and `harness-run.tsx:223` carries a comment naming the 44 px floor so the next editor knows why. In-scope L1 control now passes; BLOCKING section is empty.
>
> **2. CMP-7 — stage buttons had no resting affordance → RESOLVED.**
> Measured after autoplay settled with stage 03 active: stages 01 and 02 rest at `borderLeftColor rgb(228, 228, 231)` at `3px` with `cursor: pointer`; hovering either produces `backgroundColor rgb(250, 250, 250)`; the active stage still steps up to `rgb(189, 238, 99)` + wash. All three members now share one resting affordance, which is precisely what the control's third `fails_when` bullet asked for. I also re-verified the fix did not cost anything: `aria-current="step"` still lands on exactly one stage and moves correctly on a scrub click (A11Y-8 holds), and under keyboard modality every control — card link, Replay, stage button, See all skills — still shows `solid 2px rgb(88, 120, 40)` at `outline-offset: 2px` (A11Y-2 holds).
> *One craft note on the fix, not a re-raise:* at 1280 the new 3 px grey rule sits immediately beside the 2-column grid's own 1 px divider, so on stages 01/02 it reads as a slightly thickened column border rather than as a per-stage mark (visible in `evidence-2/run-finished.png`). The control is satisfied either way, but most of the practical discoverability gain is coming from `cursor: pointer` and the hover wash rather than from the resting rule. Worth 30 seconds of a designer's eye, not a finding.
>
> **3. FIG 1's dead "picked" beat → RESOLVED.**
> `features-idle.png` shows three unfilled outline shapes; `features-hover-1.png` shows all three filled solid `--site-accent` with the routes drawn, and the two decoys unchanged and faint. The three-of-five selection argument now reads at a glance instead of being a fill change of rgb(255,255,255) → rgb(250,254,244) on a rgb(250,250,250) ground. Bonus, unasked-for: because the idle override stays inside the `(hover: hover) and (prefers-reduced-motion: no-preference)` gate, touch and reduced-motion readers now get the lime-filled resolved state too — `features-reduced-motion.png` confirms it, which *strengthens* MOT-3 (the picked/unpicked distinction is now legible with animation off, where before it was not). Plan fidelity for the approved "Working Shapes" direction is now complete across all four figures.
>
> **4. MOT-2 — motion values outside the token scale → RESOLVED.**
> (a) Swept `app/globals.css` for raw `ms` values: the only hits are lines 106–115, which *are* the `:root` token declarations (`--motion-fast/base/slow/story` plus the three new `--motion-beat-1|2|3`), plus one comment. The three `transition-delay` sites at lines 299–301 now read `var(--motion-beat-1|2|3)`. (b) `animate-pulse` is gone — grep for `animate-` across `app/(landing)`, `components/landing` and `components/ink-icon.tsx` returns nothing, and I confirmed on the live page that the caret's computed `animationName` is `none`. Contract item 5 ("motion inside the token scale") is now fully met rather than partially. Note the beat tokens are delays on narrative figures, so the 320 ms value does not bite MOT-1's ≤300 ms interface-motion rule.
>
> **5. Autoplay past five seconds → RESOLVED.**
> Verified empirically rather than from the source: triggered a replay and timed from the reset frame to **3.03 s** for the last status line to reach full opacity and **3.81 s** for the result panel to be fully settled (`opacity: 1`, `transform: none`). By arithmetic from `play()` itself the end-to-end is `250 + 34×26 + 2300 + 600` = **4.03 s** — your ~3.76 s figure is a shade optimistic (the prompt is 34 characters), but the number that matters is the same either way: comfortably inside the five-second boundary, so SC 2.2.2's precondition is no longer met and no pause/stop control is owed. The removal of the blinking caret helps here too — there is now no continuously blinking element at all.
>
> ALSO RE-VERIFIED (no regressions from the five changes):
>
> Deterministic checks re-run by me on the new build, all exit 0: `token-audit` (app components lib), `a11y-static` (app components), `type-scan` (app components), `contrast` (--tokens app/globals.css app components lib), `content-lint` (all changed files). Target sizes re-measured at 320/360/1280 — every interactive target on the surface now clears its floor, with the one pre-existing exception noted below. Focus rings, `aria-current` tracking, reduced-motion frames, and coarse-pointer always-open behaviour all still correct.
>
> STILL OPEN (carried forward, not re-raised):
>
> ADVISORY:
> - **No icon-tile-above-heading feature-card template (SLP-5, L2)** — unchanged, and correctly so: you have put it to the human builder and nothing is recorded yet. Per your instruction I am not treating silence as a rationale, so it stays an open L2 advisory: either an inline `dx-waive SLP-5 reason="…"` lands, or the tile changes. Verified manually; the `slop-layout` script remains unbuilt.
>
> UNCOVERED (ratchet candidates):
> - **Sparkle/star "AI magic" iconography** (`scripts/generate-ink-icons.mjs:45`) — with the human, unrecorded. No SLP control names it; still worth proposing as a rule regardless of what the builder decides for this instance.
> - **Hover-triggered layout shift moving adjacent targets** (83 px row shift) — the builder's explicit acceptance at plan approval closes this *instance*, and I am recording it as an accepted tradeoff rather than an open finding. The rule gap stays on the ratchet: no LAY or MOT control covers a hover reveal displacing content outside its own container.
> - **Auto-playing animation past five seconds with no pause/stop** — the instance is now moot (fix 5), but the rule gap is real and unchanged: nothing in the catalogue covers WCAG 2.2.2, and the next surface that autoplays will have nothing to check against.
>
> SUGGESTIONS (unchanged, none actioned this pass, all still worth taking):
> `sm:[&:nth-child(odd)]:border-r` vs `-mr-px border-r` grid inconsistency; card-1's imperative claim against three noun phrases; three of four "Why it matters" lines ending on a negation; the run figure's visual weight at 1280 (LAY-5); "FIG 1" as letterspaced caps.
>
> Out of scope and unchanged, noted for completeness: the 15 × 42 inline "catalog" link in the pre-existing SlopCompare caption sits under the 24 px floor, but it is an inline link constrained by its line-height inside a sentence — the standard exemption — and it is untouched by this run.
>
> VERIFICATION LEDGER — changed rows only (the rest of the previous ledger stands):
>
> | Control | Method | Evidence |
> |---------|--------|----------|
> | A11Y-4 | manual | Playwright `getBoundingClientRect` on the new build — "Replay the run" now **44×130 at 320, 360 and 1280**; all other targets 44 px+. **Pass** |
> | CMP-7 | manual | Computed styles on all three stage buttons at rest and on hover — shared `3px rgb(228,228,231)` left rule, `cursor: pointer`, hover `rgb(250,250,250)`; active steps up to lime + wash. **Pass** |
> | MOT-1 | manual | Re-swept the changed files and `globals.css` — every duration and delay resolves to a `--motion-*` token; no `animate-*` utilities remain; `animationName: none` on the caret |
> | MOT-2 | manual | Raw-`ms` sweep of `globals.css` returns only the `:root` declarations at lines 106–115; `transition-delay` sites now `var(--motion-beat-1|2|3)`. **Pass** (control remains `status: proposed`) |
> | MOT-3 | manual | `evidence-2/features-reduced-motion.png` — the picked/unpicked distinction is now carried by fill in the static resolved state, which it was not before |
> | A11Y-2 | manual | Re-tabbed the page under keyboard modality post-fix: card link, Replay, stage button and See all skills all show `solid 2px rgb(88,120,40)` at `outline-offset: 2px` |
> | A11Y-8 | manual | `aria-current="step"` still on exactly one stage and moves on a scrub click after the affordance change |
> | A11Y-1 | script | `checks/contrast.py --tokens app/globals.css app components lib` exit 0 on the rebuilt tree |
> | TOK-1 | script | `checks/token-audit.py app components lib` exit 0 |
> | TYP-1..4 | script | `checks/type-scan.py app components` exit 0 |
> | A11Y-3 | script | `checks/a11y-static.py app components` exit 0 |
> | SLP-9 | script | `checks/content-lint.py` exit 0 on all changed files |
> | SLP-5 | manual | Unchanged; no `dx-waive SLP-5` recorded. **Fail — carried forward as advisory** |
>
> Five for five. The blocker is gone, and fixes 3 and 5 each bought a second improvement beyond what they were aimed at — the lime fill fixed a reduced-motion legibility gap I had graded as merely passing, and the shortened run removed the page's only continuously blinking element. Ship-blocking work is done; what remains is two judgment calls that belong to the human, not to another agent pass.

- **Round-2 evidence:** session scratchpad `evidence-2/` (same frame set as round 1, recaptured from the rebuilt production build).

## Open decisions for the builder

Neither is ship-blocking; both are recorded here unresolved rather than silently closed.

1. **SLP-5 on the six skill tiles (L2, open).** The reviewer's own read is that this is a close call — hairline sheet cells carrying distinct command chips are an index, not the AI feature-card template — but no rationale is recorded, and silence is not a rationale. Resolve by either landing an inline `dx-waive SLP-5 reason="…"` or dropping the 64px tile so the ink mark sits bare on the sheet.
2. **The `sparkles` mark for Polish.** Approved in the plan's icon mapping, flagged by the reviewer as the strongest single visual AI tell now in circulation, on the landing page of an anti-slop product. Swap or keep is the builder's call.

Accepted, not open: the 83px hover-reveal row shift. The builder accepted this tradeoff at plan approval; the reviewer records it as accepted rather than a finding.

## Ratchet

Three gaps the catalogue does not cover, surfaced by this run
`[proposed — pending design-lead approval]`:

1. **Hover or focus reveals must not displace content outside their own container.** A card that grows on hover pushes its grid row-mates and the row below it, so a pointer travelling toward another target has that target move out from under it (measured: 83px). LAY-6 covers static alignment only; no LAY or MOT control names hover-induced reflow of siblings.
2. **Auto-playing animation needs a visible pause/stop past five seconds** (WCAG 2.2.2, Level A). A11Y-5 covers reduced motion only. Nothing in the catalogue covers pause/stop/hide, so the next surface that autoplays has nothing to check against. This run's instance was fixed by staying under the boundary, which is exactly the kind of choice a control should be able to demand.
3. **Sparkle/star "AI magic" iconography belongs in the SLP anti-slop list.** SLP-1 names purple gradients, cyan-on-dark, and glow; the four-point sparkle is arguably a stronger tell than any of them and no control catches it.
