# Design decision record — landing page (dark Linear register, diagram as hero)

> Supersedes the visual-world half of `docs/decisions/landing.md` (2026-08-11,
> light docs-world restyle). The storyline-first structure it established is
> retained in revised order; the "one light world" rule is reversed for the
> landing only, by explicit user decision the same day.

- **Date:** 2026-08-11
- **Product:** dx-harness website (the harness's own marketing surface)
- **Change type:** modification (full dark restyle + hero restructure of `/`)
- **Page type:** marketing landing
- **Run type:** attended
- **The person and the moment:** a designer-engineer on the Teacher & School
  portfolio, mid-evaluation, deciding whether the plugin earns a slot in their
  Claude Code setup — and asking "how does this actually work?"

## Sprint contract (done-criteria)

1. The landing renders in a dark Linear register — near-black layered surfaces,
   hairline borders, dense precise type, TW blue the only accent — zero SLP-1
   findings (no purple/violet, no cyan-on-dark theming, no glow shadows), AA
   contrast throughout (A11Y-1). [Recorded exception: the quincunx brand mark
   stays the page's one polychrome element (five hues incl. cyan-9), carried
   over from the previous record's approved "zero new tokens" identity
   decision — an identity mark, not chrome accent. The evaluator flagged the
   exception as unrecorded here; now recorded.]
2. A "How it works" section renders the harness architecture as a static,
   token-drawn diagram: You → trigger → Skills → `dx-design` (orchestrator) →
   specialised skills, the planned `/wayfinder` branch, and the context column
   (Control catalog L0/L1/L2 on an abstract↔deterministic spectrum →
   primitives → design.md). Legible at 320px (LAY-2), text alternative for the
   graphic (A11Y-6), full meaning with no motion (MOT-3).
3. The diagram replaces the five-phase timeline; the loop's phases survive as
   a compact strip inside the orchestrator node, rendered from
   `components/diagrams/loop-data.ts` (the contract-of-record: six phases,
   human gate at Plan). [Amended post-verdict: the original criterion said
   "five phases", inheriting the timeline's under-count; the evaluator caught
   the fork from the contract-of-record.]
4. Dark tokens are landing-scoped; docs stay light and unbroken.
5. Storyline holds with one focal region (LAY-7) and one primary action —
   Copy commands (CMP-5).
6. Passes the repo's prebuild gates (token-audit, type-scan, contrast,
   content-lint) and `tests/site-contract.spec.ts`.

## Chosen approach

Option A — **the system is the product shot**: dark hero (headline + lede +
install panel), then the architecture diagram as the first full panel under
the retained heading "Intent without loss.", then the before/after demo
(intro'd by "You've seen this PR."), grouped skills, No-CLI close. Diagram is
semantic HTML boxes + token-drawn connectors — fully static, real text.

## Rejected options

- **Option B — demo hero, swap explainer only** — structurally conservative;
  the page's shape was the complaint.
- **Option C — dossier feature rows** — longest build; repeated asset rows
  drift toward the SLP-5 template.
- **Light Linear-craft register** — offered as recommended; user chose dark
  deliberately, knowing it reverses the same-day light-world unification.

## Tradeoffs, named

- The demo — the page's strongest asset — demotes to third position; the
  diagram must earn the hero slot.
- Landing leaves the shared light token world unified earlier the same day;
  landing→docs navigation becomes a dark→light jump. Accepted as a deliberate
  brand/docs split (the Linear pattern).
- The four FAILURES exhibit rows are cut — the demo's chips carry the same
  control IDs; keeping both was a restating pair.
- The diagram hard-codes the shipped skill roster plus labelled planned nodes;
  roster changes add one more surface to update.

## Controls in scope

A11Y-1, A11Y-2, A11Y-4, A11Y-5, A11Y-6..10, A11Y-11 (copy action), TOK-1..3,
TYP-1..6, COL-1, COL-2, CMP-1, CMP-3 (copy async states), CMP-5, CMP-7,
CNT-2/3/4/7/12/14, MOT-1, MOT-2/3 (proposed, honoured), SLP-1..11, LAY-2..7.
A11Y-3 n/a — no form fields beyond the demo's labelled range input.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| (carried) SLP-1/2/4/5/6/9, CMP-5, CNT-2 | L1/L2 | quarantined anti-specimen demo panel, unchanged | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |

No new waivers.

## Plan approval

- **Approved by:** reza.ilmi (design owner), via structured Approve/Adjust gate
- **Approved on:** 2026-08-11
- **Grilled:** yes. Decisions resolved:
  - Theme: dark, Linear-literal (user) — SLP-1 still binds: no purple, no
    glows, no cyan-on-dark; accent stays the TW blue ramp.
  - Diagram roster: shipped skills solid **plus** planned nodes (`/wayfinder`,
    `dx-pattern`, `dx-language`, `dx-assistant`) in a dashed "planned"
    treatment with a legend (user) — satisfies CNT-4 by labelling.
  - FAILURES exhibit rows: cut (user); "You've seen this PR." survives as the
    demo intro.
  - Resolved by recommendation under the early-approval rule (user directed
    "use your judgement" mid-grill): headline copy stays (fresh copy pass,
    copy not the named complaint); A11Y-1-on-dark named the control most at
    risk — every dark pairing gets a computed contrast note in the token
    block; `--tw-blue-text` (lighter ramp step) added because #0064FF on
    near-black is ≈3.5:1 and fails AA for body text.

## Verify verdict

- **Screenshots:** `review/evidence/landing-dark-2026-08-11/` — `1280-full.png`,
  `1280-viewport.png`, `768-full.png`, `360-full.png`, `320-full.png`,
  `slider-0.png`, `slider-100.png`, `copy-failed.png` (genuine headless
  clipboard denial), `copy-copied.png` (demo-only clipboard stub — headless
  denies write; noted per the Phase-4 demo-hook rule), `focus-pre-region.png`
  (keyboard focus ring on dark), `slider-keyboard-focus.png`,
  `diagram-1280.png` (post-fix diagram). All frames md5-distinct.
- **CMP-3 states:** the copy action has no loading state (clipboard write is
  effectively synchronous — the control's <100ms local-operation exemption);
  success = `copy-copied.png`, error = `copy-failed.png` (both re-captured
  after the post-verdict CopyCommands refactor).
- **Token block line range:** `app/globals.css` `:root` block plus the
  `/* dx-tokens */ … /* /dx-tokens */` region holding the `.landing-dark` /
  `.landing-light` scopes (exempt from token-audit).
- **Dark mode:** the landing's primary render is dark (`landing-dark`
  unconditional on the shell); docs verified still light at runtime. No
  dark/light parity to grade.
- **Evaluator verdict (verbatim):** first-pass verdict **fail** with two L1
  blockers (CNT-10, CMP-1), both resolved same-session — see "Post-verdict
  fixes applied" below. Full verdict:

> # VERDICT: fail
>
> Two L1 controls fail with no waiver on file. Both are cheap to resolve and neither is a visual defect — the surface is otherwise the strongest landing this repo has shipped. Re-run verify after the two blockers are closed.
>
> ## Contract compliance
>
> | # | Done-criterion | Verdict | Evidence |
> |---|---|---|---|
> | 1 | Dark Linear register, TW blue the only accent, zero SLP-1, AA throughout | **partially met** | Register holds (`--background` #0a0a0c / `--surface` #131316 / hairline `--border` #26262c; no `shadow` class anywhere in `app/(landing)/` or `components/landing/`). AA: I resolved all 167 rendered text runs in-browser — zero failures (fg/surface 16.9:1, muted-fg/muted 6.96:1, tw-blue-text/bg 7.86:1, white on #7c3aed in the waived exhibit 5.7:1). Builder's computed notes verified, all conservative. **Not "TW blue the only accent":** `QuincunxMark` (`app/(landing)/layout.tsx:18-32`) renders five hues — `--tw-blue`, `--warning-9` amber, `--sec-foundations` teal, `--success-9` grass, `--sec-products` **cyan-9 #00a2c7** — on near-black. Recorded in DESIGN.md ("the quincunx brand mark stays the one polychrome element") but not in the decision record that carries this criterion. |
> | 2 | Static token-drawn architecture diagram; dashed planned branch + skills; visible legend; legible at 320; text alternative; no motion | **partially met** | `components/landing/harness-diagram.tsx` — all real text, `aria-label` on the figure, connectors `aria-hidden`, nothing animates. Verified legible at 320 (single column, no clipping). Context band present (catalogue L0/L1/L2 → primitives → DESIGN.md). **Legend only partly visible:** the two key swatches render at ≈1.3:1 (`--border` #26262c / `--muted` #1e1e22 on `--surface` #131316) — sampled from `1280-full.png` at y=1822: `(30,30,34)` on `(19,19,22)`. The solid-vs-dashed key is not readable at 12px; meaning survives only because each planned node also carries the literal word "planned". The abstract↔deterministic "spectrum" collapses to two 3-line labels either side of a ~24px hairline stub. |
> | 3 | Diagram replaces the timeline; phases survive as the strip inside the orchestrator | **met** | `PHASES.map` renders inside the `dx-design` node as `<ol aria-label="The loop's five phases">`; no timeline remains. Note `PHASES[].text` (five descriptions) is now dead data — rendered nowhere. |
> | 4 | Dark tokens landing-scoped; docs light; demo pinned light | **met** | `.landing-dark` applied only on `app/(landing)/layout.tsx:36`; `/overview` measured at runtime `body` = `rgb(250,250,250)` / `rgb(24,24,27)`. `.landing-light` on the demo frame (`components/compare.tsx:240`) verified re-overriding inside the dark scope. |
> | 5 | Storyline; one focal region; one primary action | **met** | Section order matches the plan exactly. One filled button on the page (`Copy commands`); the demo's filled "Send to 4 classes" is a non-interactive depiction inside a distinct region. |
> | 6 | Prebuild gates + `tests/site-contract.spec.ts` | **met (verified independently)** | `pnpm build` clean (prebuild ran validate/token-audit/a11y-static/type-scan). Playwright **37/37 passed** — the builder's port note is real: `playwright.config.ts` pins `baseURL: 3000` with `reuseExistingServer`, and an unrelated app occupies 3000 on this machine, so a default run silently tests the wrong site. `content-lint` reproduces exactly as reported (only in-scope hit is the waived `components/compare.tsx:79`). |
>
> ## Plan fidelity
>
> Structure matches the approved plan (Option A) without drift: dark hero → diagram under "Intent without loss." → demo under "You've seen this PR." → grouped skills → No-CLI close. Grill decisions honoured — FAILURES rows cut, headline kept, `--tw-blue-text` added (measured 7.86:1 on `--background`), planned nodes dashed **and** word-tagged. One fidelity defect, below.
>
> ## BLOCKING (must fix before ship)
>
> - **CNT-10 (L1, judgment, no waiver on file) — the control catalog is named two ways on one page.** "Control **catalogue**" appears as the diagram node title (`harness-diagram.tsx:138`), in the section lede ("a control catalogue underneath it all", `page.tsx:74`) and in the figure's `aria-label` (`:44`); "**catalog**" appears in the hero lede ("a checkable standards catalog", `:29`), the problem paragraph ("The catalog names each failure", `:92`), the skills copy ("grow the control catalog", `data.ts:97`), the demo caption ("a control ID from the catalog") and the route `/standards/catalog`. Repo-wide: 5 × "catalogue" (all introduced by this sprint) vs 126 × "catalog", and zero "catalogue" in `content/`. **"catalog" should win.** CNT-10's waiver is `documented` and requires a named approver in the decision record — there is none.
> - **CMP-1 (L1, hybrid, no waiver on file) — the page's one primary action is a hand-rolled button where the stack component covers the need.** `components/landing/copy-commands.tsx:33-39` renders a bare `<button>` with inlined fill and hover (`bg-tw-blue … hover:bg-tw-blue-hover`) while `components/ui/button.tsx` wraps Base UI's `Button` with a `default` variant of exactly this shape (`bg-primary text-primary-foreground`, and `--primary: var(--tw-blue)` at `app/globals.css:85`). That is CMP-1's own named example ("a button with an inlined hover colour") and there is no `dx-waive CMP-1` with an approver. The only real gap is the 44px target floor (stack sizes stop at `h-9`) — a residual that belongs in a waiver or a DS request, not a fork. Note this is a **site-wide, pre-existing idiom** (`catalog-browser.tsx:102,128`, `page-actions.tsx`, `code-block.tsx` all do the same), so a site-scoped documented waiver is a legitimate resolution — but "preserved" is not "waived", and the landing's primary action is in scope here. The record must also carry the fixed CMP-1 verdict form (supplied below) or `audit-record.py` will reject it.
>
> ## ADVISORY (should fix)
>
> - **CNT-4 (L2) — the diagram under-reports the harness's own loop.** The orchestrator node says "One loop, one human gate" over five phases (Intent / Diverge / Plan gate / Implement / Verify). The repo's declared contract-of-record — `components/diagrams/loop-data.ts` ("Facts here are the contract-of-record … never fork them into prose"), guarded by `lib/loop.test.ts` (`expect(LOOP_PHASES.length).toBe(6)`) and rendered on `/harness/loop` — has **six** phases (adds Ratchet) and **two** gates (`gate: "plan"` = human gate, `gate: "waivers"` at Verify). The panel whose job is architectural fidelity contradicts the site's own source of truth. The sprint contract inherits the error ("five phases inside"), so fixing this needs the contract amended too. No domain expertise gap here — this is checkable in-repo.
> - **CNT-3 (L2) — the hero lede is one 31-word sentence.** "dx-harness is a Claude Code plugin of design skills your agent runs: a design loop that stops for your approval, a checkable standards catalog, and an evaluator that grades what ships." (measured on the rendered DOM). Also two passives in the next lede: "What you mean **is written down** first … every phase after **is graded** against it." Important: the "content-lint clean" claim does not cover this — `content-lint.py` inspects only *quoted string literals* in `.tsx` (`:686-700`), so every word of JSX prose on this landing is outside CNT-3/CNT-6/CNT-13/SLP-9 script reach.
> - **Legend key is functionally invisible (craft; not an A11Y-1 L0 fail).** Swatch borders at ≈1.3:1, measured above. I judged this *not* a 1.4.11 failure because the solid/dashed distinction is redundant with the per-node "planned" text, so the graphic is not *required* to understand the content — but the contract asked for a visible legend and this one you have to hunt for. Close call; worth a human look.
> - **CNT-1 close call — the copy-failure state.** Visible label becomes "Select and copy instead" (`copy-failed.png`), which states the next step but not what happened; the full anatomy ("Copying failed — select the commands and copy them manually") is `sr-only` only. The button also *retries the copy* when pressed, so its label doesn't name what it does (CNT-5-adjacent), and a second failure produces no new feedback. Still styled as the blue primary, so the failure doesn't read as one.
> - **Plan/record fidelity — the shipped direction contract describes the superseded design.** `app/layout.tsx:19-28` emits into the served markup: "OWN-WORLD: one light world for landing and docs (docs.stripe.com register) … white surfaces on #fafafa" and "FIRST VIEWPORT: … the SlopCompare demo; install panel". This is the *previous* sprint's light world; the shipped page is dark with the diagram as hero. It is deliberately auditable markup ("kept in emitted markup so the build can be audited") and it currently audits false.
> - **SLP-4 (L1) position is unrecorded.** The figure is a bordered, rounded, `bg-surface` panel containing ~15 bordered rounded boxes. I graded it **pass** — diagram notation, nothing interactive, no shadows, one border weight, one radius step — but that position is written only in a code comment for SLP-11 (`harness-diagram.tsx:8-10`). SLP-4 is L1; the next reader will see card-in-card. Record the position for SLP-4 in the decision record.
> - **Contract-1 exception unrecorded in the plan.** The polychrome mark exception lives in DESIGN.md but not in `docs/decisions/landing-dark.md`, whose criterion 1 says "TW blue the only accent".
> - **LAY-5 density nits.** At 320 the install panel header "Claude Code — two commands" wraps to four lines beside the button; the catalogue node's spectrum row wraps to three lines at 768 and 1280; `dx-assistant` breaks mid-token ("dx-" / "assistant") at 320.
>
> ## SUGGESTIONS (not violations)
>
> - Replace the swatch-only key with wording — "Solid: ships today · Dashed: planned" — or raise the swatch borders to `--border-strong` — serves A11Y-1 / CNT-4 — the key becomes readable at 12px and meaningful in AT, where the swatches are `aria-hidden` and the caption currently reads as an orphan fragment.
> - Reserve `font-mono` for literal strings; set "You", "primitives", "Control catalogue" in Inter — CMP-7 / typography semantics — mono currently signals "type this" on conceptual nodes.
> - Spring the "dispatches…" and "second route" connectors from the `dx-design` node's edge rather than page centre and a paragraph — LAY-6 — makes both branch origins unambiguous at md+.
> - Split the hero lede at the colon into two sentences and delete the now-dead `PHASES[].text` — CNT-3 plus maintenance — the strip renders labels only.
> - Give the failed-copy state its own non-primary treatment and say what happened ("Copy failed. Select the commands below.") — CNT-1 / CMP-3 — the recovery instruction stops looking like the happy path.
>
> ## QUALITY GRADES
>
> - **Design quality — strong.** The ramp does real work (60 / 30 / 18 / 14 px with hairline section rules at 64–80px), one focal region, and the diagram answers the persona's actual question ("how does this work?") in the slot where they ask it; the page reads top-to-bottom in task order.
> - **Originality — acceptable.** The token-drawn architecture figure is the right kind of distinctiveness — no stack component exists for it, so it isn't unwarranted novelty — and there are no SLP tells outside the quarantined exhibit; the polychrome mark and the 3×3 node grid are the two places character edges toward decoration rather than meaning.
> - **Craft — acceptable.** States are real and evidenced (idle / copied / failed, focusable scrollable `pre`, keyboard slider), 320 is genuinely verified, reduced motion kills the hero animation outright — but an invisible legend key, a collapsed spectrum row and mono-for-everything are three deliberate-looking decisions that don't survive being looked at.
> - **Functionality — strong.** The task (understand it, install it) completes: two commands, one primary action, a keyboard-reachable manual-copy fallback, and no dead ends. The copy-failure path is the one place recovery is muddier than it needs to be.
> - **Dark mode — pass, graded as the primary render.** The landing has no light variant by design (`landing-dark` is unconditional on the shell), so there is no dark/light parity to grade; docs verified still light at runtime. Not a TOK-1-resolution-only pass — every pairing was measured in a rendered dark frame.
>
> ## JUDGMENT CONTROL NOTES
>
> - **A11Y-1** pass — 167 rendered text runs measured in-browser; min real ratio 4.92:1 (white on `--tw-blue` button label); the one apparent failure ("Communication Hub") resolves to white on `#7c3aed`/`#a21caf` = 5.7–6.3:1.
> - **A11Y-6** pass — figure `aria-label="How the harness is structured…"`; every connector/arrowhead/swatch `aria-hidden`; all node content is real text.
> - **A11Y-7** pass — heading order H1 → H2 ×4 with H3 ×3 nested under the skills H2; `ol`/`ul`/`dl` used semantically; one `main`.
> - **A11Y-8** pass — native `input[type=range]`, name from `<label>` "Reveal the on-standard version", value tracked (`aria-valuetext` "50% on standard" → updates on input); `pre` exposes `role="region"` + name "Install commands".
> - **A11Y-11** pass — copy outcome announced in a polite `sr-only` region, focus untouched (correct transient channel, not both). Caveat: the button's accessible name also changes to "Copied", so a focused SR user hears the outcome twice in different words — a redundancy, not a double-channel failure.
> - **CMP-1** **fail** — `<button className="… bg-tw-blue … hover:bg-tw-blue-hover">` in `copy-commands.tsx:33` where `components/ui/button.tsx` `default` covers the need; no waiver. **CMP-1: asserted, no manifest — manifest absent for dx-harness website** (no `.dx/` directory exists; evidence source: product codebase read).
> - **CMP-3** pass — idle → copied | failed; absent loading state is explicitly excused by the control ("Instant (<~100ms) local operations with no perceivable pending period"). Success is quiet and non-blocking, as the guidance prefers.
> - **CMP-5** pass — exactly one filled button on the page; the demo's filled elements are `<span>`s inside a distinct region, and the anti-specimen's two primaries carry `dx-waive CMP-5`.
> - **CMP-7** pass — verified manually against siblings: the landing's button, chip and panel idioms match `catalog-browser.tsx` (`min-h-11 … focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)`), and `--primary-foreground: #ffffff` in the dark scope is a documented, reasoned override.
> - **CMP-4 / CMP-8 / CMP-9** N/A — no empty-state view; no multi-step or data-entry flow (single-step copy, nothing to lose); no cross-user content (the sole `dangerouslySetInnerHTML`, `app/layout.tsx:19`, is a build-time constant literal, not authored content).
> - **CNT-2** pass — "dx-harness", "Quick start", "Copy commands", "No command line?"; skill names match `plugins/dx-harness/skills/**` exactly; the invented "Communication Hub" is the waived exhibit.
> - **CNT-3** fail (L2) — 31-word hero lede, quoted above.
> - **CNT-4** fail (L2) — "five phases … one human gate" vs the six-phase, two-gate contract-of-record in `components/diagrams/loop-data.ts`. The skills roster itself is faithful: 7+8+6 = 21 matches the 13 design + 8 engineering skill directories, and all four dashed nodes (`dx-wayfinder`, `dx-pattern`, `dx-language`, `dx-assistant`) are absent from `skills/` and correctly word-tagged "planned".
> - **CNT-7** pass — "Intent without loss." then the promise, then the mechanism; no mechanism-first lede.
> - **CNT-10** **fail** — catalogue/catalog drift, quoted above.
> - **CNT-12** pass — sentence case throughout; "MIT License", "Customize → Plugins", "DESIGN.md", "TFX Design Standard" are proper/established names.
> - **CNT-14** pass — context is marketing/onboarding; "Your agent already writes the code. Now it holds the bar." is confident and concrete, not hype; "Style guides don't fix this, because agents can't read a PDF and reviewers can't check a vibe." is Clear and Thoughtful without sappiness. No mechanical tells double-counted here.
> - **COL-1** pass — tw-blue on the single primary and all links; `--tw-blue-text` is the same ramp lightened for AA on dark, documented at `globals.css:127-134`.
> - **IDN-2** pass — no product icons; the only glyph is lucide `ChevronsLeftRight` in the slider handle, consistent with the site's icon set.
> - **IDN-3** pass — no product row covers the harness's own marketing surface; the copy holds the shared DX character (plain, second person, active) and adopts no other product's register.
> - **IDN-4** N/A — not a CaseSync surface.
> - **LAY-1** N/A — no `.dx/design.json`, so no declared grid to follow.
> - **LAY-2** pass — at 320 `documentElement.scrollWidth` = `clientWidth` = 320; single column; the primary action measures 153×44. The install `pre` scrolls (453 vs 270) — the WCAG 2-D code-block exemption applies, and it is focusable with a name so keyboard users can reach the scroll. "Quick start" is `display:none` below 360 by documented decision, with the install block above the fold there.
> - **LAY-3** pass — marketing landing shell; hero + full-width panels, no bespoke chrome fighting the type.
> - **LAY-5** pass-with-caveat — reading density is right for a low-volume marketing read; the three nits above (320 panel header, spectrum row, mid-token break) are local.
> - **LAY-6** pass — verified at 1280: the "You" node, skills grid, context band and legend all hang off the figure's inner left edge; the centre-band boxes are optically centred on their connectors, which is deliberate.
> - **LAY-7** pass — squint test gives one focal region (headline + install panel), and reading order matches task priority: what is it → how it works → proof → roster → install fallback.
> - **MOT-1** pass — the only animation is `hero-enter`, 200ms, `cubic-bezier(0.215,0.61,0.355,1)` (measured at runtime).
> - **MOT-2** pass — `var(--motion-base)` / `var(--ease-out)`; no literal durations or curves.
> - **MOT-3** pass — diagram is entirely static; the demo's one-time 62→50 divider nudge carries no unique information (the caption "Drag the handle — or focus it and use arrow keys." states it) and is skipped under reduced motion.
> - **SLP-1** pass-with-caveat — no gradients, no glow (`grep shadow` in `app/(landing)/` and `components/landing/` returns nothing), no purple outside the waived exhibit; the caveat is the five-hue quincunx mark including cyan-9 on near-black, recorded in DESIGN.md only.
> - **SLP-2/3/8** pass — no `bg-clip-text` outside the waived exhibit; no side-tab borders; no bounce/elastic easing anywhere.
> - **SLP-4** pass — reasoned as diagram notation (see advisory on recording it).
> - **SLP-5** pass — the 3×3 node grid is a dispatch fan-out with no icon tiles and is not the page's default layout; the skills section is three `dl` lists, not a card grid.
> - **SLP-6** pass — heading/subheading/body ramp is 60 / 30 / 18 / 14 px (2×, 1.67×, 1.29×); the 14→12 pair is label-and-description, distinguished by weight, family and colour.
> - **SLP-7** pass — grouping is tighter inside nodes (`gap-1.5`, `mt-0.5`) than between bands (`py-4/5`, `mt-6`).
> - **SLP-9** pass — no buzzwords, no negative parallelism, no forced triads, and no em-dash chain within any sentence (checked every rendered em dash). Only tell: the `<title>` chains two em dashes — "dx-harness — design skills your agent runs — TFX Design Standard" — via the site template.
> - **SLP-10/SLP-11** pass — no modal; boxes are non-interactive notation with no card chrome nested inside them.
> - **TYP-2** pass — 12px floor observed; `leading-relaxed` on the multi-line labels.
> - **TYP-5** pass — no columnar or in-place-updating figures on the surface.
> - **TYP-6** pass — measures capped at `max-w-[58ch]` / `[62ch]`; verified against the 1280 frame.
>
> ## VERIFICATION LEDGER
>
> | Control | Method | Evidence |
> |---------|--------|----------|
> | A11Y-1 | manual | `contrast.py --tokens app/globals.css` resolves `:root` only (its sole finding, `components/ui/button.tsx:19`, is out of scope) — so the dark scope was computed in-browser: canvas-resolved fg/bg for all 167 rendered text runs on `/`, min real ratio 4.92:1 (white on `--tw-blue`) |
> | A11Y-2 | script | `a11y-static.py app components` clean; also focused all 9 controls at runtime — 2px `rgb(0,100,255)` solid, offset 2px, incl. the opacity-0 slider's `peer-focus-visible` handle ring |
> | A11Y-3 | script | `a11y-static.py` clean; only field is the range input, labelled via `htmlFor`/`useId` |
> | A11Y-4 | script | `a11y-static.py` clean; Playwright 44px/24px target tests pass; measured at 320 — all non-inline targets ≥44px high |
> | A11Y-5 | manual | Launched a `reducedMotion: "reduce"` context — `.hero-enter` computes `animation-name: none`, `scroll-behavior: auto` |
> | A11Y-6 | manual | Read the figure: `aria-label` present, all connectors/arrowheads/swatches `aria-hidden`, all node content real text |
> | A11Y-7 | manual | Dumped `main h1..h4` order (H1, H2, H2, H3×3, H2) and the list semantics |
> | A11Y-8 | script | `a11y-static.py` clean; runtime read of the range input's name/value and the `pre`'s `role="region"` + name |
> | A11Y-9 | manual | Served HTML: `<html lang="en">`, `<title>dx-harness — design skills your agent runs — TFX Design Standard` |
> | A11Y-10 | manual | "Skip to main content" link present in served markup targeting `main#main-content`; Playwright asserts one `main` landmark |
> | A11Y-11 | manual | Read `copy-commands.tsx` — polite `sr-only` region, no focus move; confirmed no `role="alert"` double-channel |
> | TOK-1 | script | `token-audit.py app components` clean |
> | TOK-2 | script | `token-audit.py` clean |
> | TOK-3 | script | `token-audit.py` clean |
> | TYP-1 | script | `type-scan.py app components` clean; weights are 400/500/600 only; mono is the DESIGN.md-sanctioned `--font-mono` system stack |
> | TYP-2 | script | `type-scan.py` clean (12px floor) |
> | TYP-3 | script | `type-scan.py` clean |
> | TYP-4 | script | `type-scan.py` clean — no all-caps |
> | TYP-5 | manual | Read every figure on the surface: no column of digits, no number that updates in place |
> | TYP-6 | script | `type-scan.py` clean; also measured `max-w-[58ch]`/`[62ch]` against the 1280 frame |
> | COL-1 | script | `token-audit.py` clean; tw-blue on the sole primary and all links |
> | COL-2 | script | `token-audit.py` clean; functional colours only inside the light-pinned demo |
> | CMP-1 | manual | Read `copy-commands.tsx:33` against `components/ui/button.tsx` `default` variant and `--primary: var(--tw-blue)`; no `.dx/component-manifest.json` exists — **fail** |
> | CMP-3 | manual | Read the state machine and both evidence frames (`copy-copied.png`, `copy-failed.png`); applied the <100ms local-operation exemption |
> | CMP-4 | manual | Enumerated views on `/` — no empty state exists (N/A) |
> | CMP-5 | manual | Counted filled buttons in the 1280 frame and in code — one, plus waived exhibit spans |
> | CMP-7 | manual | Compared the landing's button/chip/panel classes against `catalog-browser.tsx`, `page-actions.tsx` and `components/ui/button.tsx`; checked the one override (`--primary-foreground: #ffffff` on dark) for a recorded reason |
> | CMP-8 | manual | No multi-step or data-entry flow on the surface; the copy action holds no user input (N/A) |
> | CMP-9 | manual | `grep dangerouslySetInnerHTML app components lib` → one hit, `app/layout.tsx:19`, a build-time constant; no `v-html`, no cross-user content (N/A) |
> | CNT-1 | script | `content-lint.py` clean for this surface; also read the failure copy by hand — visible label omits what happened (advisory) |
> | CNT-2 | manual | Read every name against `plugins/dx-harness/skills/**` (21 skills, exact match) |
> | CNT-3 | manual | Measured sentence lengths on the rendered DOM — one 31-word sentence; `content-lint.py` cannot see JSX prose (`:686-700`), so the script's clean run does not cover it — **fail (L2)** |
> | CNT-4 | manual | Read the diagram against `components/diagrams/loop-data.ts` + `lib/loop.test.ts` (six phases, two gates) and the skills directories — **fail (L2)** on phase count/gates; roster faithful |
> | CNT-5 | script | `content-lint.py` clean for this surface |
> | CNT-6 | script | `content-lint.py` clean for this surface |
> | CNT-7 | manual | Read each section's first line for purpose-first ordering |
> | CNT-10 | manual | Grepped user-facing terms across the surface and the site: 5 × "catalogue" (all new) vs 126 × "catalog", route `/standards/catalog` — **fail** |
> | CNT-12 | manual | Read every heading, label and button for sentence case |
> | CNT-13 | script | `content-lint.py` clean for this surface (note: the catalogue/catalog split is graded under CNT-10, not spelling) |
> | CNT-14 | manual | Read the copy against the voice attributes for the marketing/onboarding context; quoted above |
> | IDN-1 | manual | No product lockup on the surface; the quincunx is dx-harness's own mark |
> | IDN-2 | manual | No product icons; sole glyph is lucide `ChevronsLeftRight`, consistent with the site set |
> | IDN-3 | manual | Read the copy against the register table; no switched voice system |
> | IDN-4 | manual | Product is the dx-harness site, not CaseSync (N/A) |
> | LAY-1 | unverified | N/A — no `.dx/design.json`, so no declared column grid exists to check |
> | LAY-2 | script | Playwright `no document overflow at 320px/360px` passes (37/37); also measured `scrollWidth == clientWidth == 320` and enumerated targets at 320 |
> | LAY-3 | manual | Compared the shell against the marketing-landing template in the plan |
> | LAY-5 | manual | Read the three captured widths plus a 320 crop for cramping; named three local nits |
> | LAY-6 | manual | Checked shared left edges and connector centring in the 1280 diagram crop |
> | LAY-7 | manual | Squint test on `1280-viewport.png` / `1280-full.png`: one focal region, reading order matches task priority |
> | MOT-1 | manual | Runtime read: `hero-enter 0.2s cubic-bezier(0.215, 0.61, 0.355, 1)` |
> | MOT-2 | manual | Read `globals.css:245-253` — `var(--motion-base)` / `var(--ease-out)` only |
> | MOT-3 | manual | Diagram static; the demo's intro nudge duplicates the caption's information and is skipped under reduce |
> | SLP-1 | manual | Grepped `shadow`/purple/violet/cyan in landing scope and read all three frames; quincunx mark is the one polychrome element |
> | SLP-2 | script | `type-scan.py` clean (gradient-text rule) |
> | SLP-3 | manual | Read all container classes — no thick side-tab borders |
> | SLP-4 | manual | Read the figure's nesting: one border weight, one radius step, no shadows, nothing interactive |
> | SLP-5 | manual | No icon tiles above headings; the node grid is diagram notation, not the page's default layout |
> | SLP-6 | manual | Measured the used steps: 60 / 30 / 18 / 14 px |
> | SLP-7 | manual | Compared intra-node vs inter-band spacing values |
> | SLP-8 | manual | Grepped easing: only `--ease-out` and `transition-colors`; no bounce/elastic |
> | SLP-9 | script | `content-lint.py` clean for this surface (`compare.tsx:79` waived inline); also read all rendered em dashes by hand — no in-sentence chain |
> | SLP-10 | manual | No modal on the surface |
> | SLP-11 | manual | Read each box for interactivity — none is clickable/selectable/draggable; treated as notation |
>
> ## UNCOVERED (defects no control covers — feed the ratchet)
>
> - **`content-lint.py` cannot see JSX text in `.tsx`** — only quoted string literals (`:686-700`). Every word of prose on this landing (and on any page whose copy lives in TSX rather than MDX) is invisible to CNT-1/3/5/6/13 and SLP-9. The 31-word lede proves it. This makes "content-lint clean" a much weaker claim than it reads.
> - **`contrast.py` resolves `:root` only** — any scoped token world (`.landing-dark`, `.landing-light`, a future `.dark`) is silently unverified, and the script still exits 0. A scope-aware mode, or at minimum a warning when a scanned file defines token overrides the script ignored, would close the gap this sprint had to close by hand.
> - **`playwright.config.ts` reuses whatever is on port 3000** (`baseURL: 3000` + `reuseExistingServer: !CI`). On a machine running another dev server, `pnpm test:e2e` tests the wrong site and can pass or fail meaninglessly. A port-uniqueness assertion or a title/marker check in `open()` would make the suite self-verifying.
> - **No check ties prose to a declared contract-of-record.** `components/diagrams/loop-data.ts` says "never fork them into prose" and the landing forked it anyway (five phases vs six). A parity sub-check — the kind `docs/SYNC.md` already uses for the IDN-3 register — would catch this class of drift.
> - **The direction contract emitted in `app/layout.tsx` has no freshness gate.** It ships in the served markup as an audit artifact, yet nothing fails when a redesign leaves it describing the previous design.
> - **Dead content data survives a restructure unnoticed** — `PHASES[].text` (five phase descriptions) is now rendered nowhere; no check flags unreferenced user-facing content.

### Post-verdict fixes applied (same session)

1. **CNT-10 (blocker)** — "catalog" wins everywhere: diagram node title,
   figure `aria-label`, section lede, connector comment, DESIGN.md. Zero
   "catalogue" remains in `app/`, `components/`, `DESIGN.md`.
2. **CMP-1 (blocker)** — `CopyCommands` recomposed on the stack's
   `components/ui/button.tsx` `default` variant; the only override is
   `min-h-11 px-5` for the 44px mobile target floor (the stack's size scale
   tops out at `h-9`) — recorded here as the reasoned residual. CMP-1 verdict
   form: **asserted, no manifest — manifest absent for dx-harness website**
   (evidence source: product codebase read).
3. **CNT-4** — the diagram now renders `LOOP_PHASES` from
   `components/diagrams/loop-data.ts` (six chips, "Plan · gate" marked);
   intro reads "One loop, six phases, a human gate before code"; the dead
   `PHASES` data was deleted from `components/landing/data.ts`; the sprint
   contract's criterion 3 amended above.
4. **CNT-3** — hero lede split into two sentences; promise lede rewritten
   active ("The loop writes what you mean into a contract, then grades every
   phase against it.").
5. **CNT-1 / A11Y-11 caveat** — the copy button's label no longer changes;
   a visible polite-live-region status beside it says "Copied" or "Copy
   failed. Select the commands below." (what happened + next step); failed
   still holds until the next attempt.
6. **Legend** — worded key ("solid — ships today · dashed — planned…") with
   `--border-strong` swatches.
7. **Typography semantics** — conceptual nodes (You, Control catalog,
   Primitives) set in Inter; mono reserved for literal names (dx-design,
   skills, DESIGN.md).
8. **Direction contract** (`app/layout.tsx`) rewritten to describe the
   shipped dark diagram-hero design — it audits true again.
9. **LAY-5 nits** — install-panel header shortens to "Claude Code" below
   `sm`; skill-chip names `whitespace-nowrap` (no more mid-token breaks).
10. **SLP-4 position recorded** (evaluator's ask): the diagram figure and its
    node boxes are diagram notation, not cards — non-interactive, no shadows,
    one border weight, one radius step; graded pass on that basis.
11. Full re-verify after fixes: build + prebuild gates clean; content-lint
    clean for the surface; Playwright 37/37 (on port 3100 — port 3000 is
    occupied by an unrelated dev server, see UNCOVERED); copy states, diagram,
    and widths re-captured (`copy-failed.png`, `copy-copied.png`,
    `diagram-1280.png`, full-page frames).

**Shipped as recorded advisories (L2, not fixed):** the catalog node's
spectrum row still wraps at narrow widths; the site `<title>` template chains
two em dashes (site-wide template, out of this sprint's scope); connectors
spring from band centres rather than the `dx-design` node edge (LAY-6
suggestion, declined — the centred down-arrow reads as "fans out to all").

### Re-verify verdict (second evaluator pass, verbatim summary)

The evaluator re-verified all ten fix items and confirmed each **pass**
(CNT-10 zero user-facing "catalogue"; CMP-1 recomposed on the stack Button
with the recorded `min-h-11 px-5` residual; CNT-4 six chips diffed against
`loop-data.ts`; CNT-3 max sentence 21 words; CNT-1/A11Y-11 single visible
polite status channel, 7.77:1; legend worded; typography semantics; direction
contract audits true; LAY-5 nits; record completeness). It found **one new
L0 blocker introduced by the CMP-1 fix itself**:

> **A11Y-2 (L0, `waiver: none`) — the page's primary action lost its visible
> focus indicator.** `components/ui/button.tsx:6` sets `outline-none` and puts
> focus on `focus-visible:border-ring focus-visible:ring-3
> focus-visible:ring-ring/50`. Reached by keyboard and measured at 1280:
> rendered indicator is a 3px ring of `rgb(10,59,139)` — **1.79:1** against
> the surface and **2.11:1** against the button fill, both below the 3:1
> A11Y-1 requires for UI-component state. The previous hand-rolled button
> measured **4.02:1**. It is also the only control on the page with a
> different focus treatment (CMP-7). Root cause is in the stack component:
> `--ring: #0064ff` is never re-pointed in `.landing-dark`, and half-alpha
> `#0064ff` cannot clear 3:1 on a near-black surface (it also only reaches
> 1.9:1 on the light `--surface`) — a **latent DS defect that CMP-1 adoption
> surfaced**; worth filing as the DS request CMP-1 pointed at.

It also asked for a focused-primary-button evidence frame (the gap that let
this slip) and noted a ratchet item: **no check verifies focus-indicator
contrast** — `a11y-static.py` catches a removed ring, not a weak one.

### Post-re-verify fixes applied (same session)

1. **A11Y-2 closed** — `.site-focus-ring` added in `app/globals.css`
   (unlayered author rule, so it deterministically outranks the stack's
   layered `outline-none`/ring utilities): the site's shared 2px
   `var(--tw-blue)` outline at 2px offset, `box-shadow: none`, and
   `transition: none`. Composed onto the Button
   (`components/landing/copy-commands.tsx`). Verified by keyboard in a clean
   Playwright browser: computed `rgb(0,100,255) solid 2px`, offset 2px
   (the evaluator measured this exact treatment at 4.02:1 on the dark
   surface). Evidence: `focus-primary-button.png`.
   - Debugging note for the next reader: the stack Button's `transition-all`
     animates the outline in from `currentcolor`/medium over 150ms, so any
     instant post-focus read (or screenshot) samples a white 3px
     mid-transition ring and looks like the rule "isn't applying". The
     `transition: none` in the focus state fixes both the measurement and
     the laggy-ring feel.
2. `--ring` re-pointed to `var(--tw-blue-text)` inside `.landing-dark`, so
   any future stack component on this surface clears 3:1 even before it
   adopts the shared idiom.
3. The record's own criterion-2 "Catalogue" corrected (evaluator's nit).
4. Full re-verify: build gates clean, Playwright 37/37, focused-primary
   frame captured.

### Final scoped verdict (third evaluator pass, verbatim conclusion)

> VERDICT: pass-with-findings
>
> BLOCKING: none. A11Y-2 on the primary action is closed and re-verified at
> runtime. (a) Keyboard-focused primary computes `2px solid rgb(0,100,255)`,
> offset `2px`, `box-shadow: none`, `transition: none`; pixel scan confirms a
> real 2px stroke with a 2px surface gap; indicator 3.77:1 vs panel surface,
> 4.02:1 vs page background (ring-vs-fill is 1:1 but separated by the offset
> gap — SC 1.4.11 satisfied by adjacency). (b) CMP-7: all 14 focusable
> controls share the `2px solid rgb(0,100,255) / 2px offset` idiom. (c) No
> state regression: hover/active/copied/failed all verified live.
>
> ADVISORY: the `--ring: var(--tw-blue-text)` lift in `.landing-dark` only
> reaches ~2.72:1 after the stack's /50 alpha compositing — partial
> mitigation, not a guarantee; the comment must not claim otherwise.
> [Resolved same session: comment rewritten to state the lift is partial and
> `.site-focus-ring` is the actual guarantee.]
>
> UNCOVERED: no control catches a misleading accessibility rationale in a
> comment; focus-indicator *strength* (not presence) is unchecked — confirms
> ratchet item 7.

Suggestion recorded, not taken this run: bake `.site-focus-ring` into the
stack Button wrapper for the `.landing-dark` scope (removes per-call-site
opt-in) — deferred as part of the DS request in ratchet item 8.

## Waivers granted (final)

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| (carried) SLP-1/2/4/5/6/9, CMP-5, CNT-2 | L1/L2 | quarantined anti-specimen demo panel, unchanged | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |

No new waivers — both blockers were fixed rather than waived.

## Addendum — 2026-08-12, demo joins the dark world (scoped modification)

User-directed: the pinned-light demo frame read as a glaring white block on
the dark page. `landing-light` removed from the frame; the demo now inherits
the dark scope. New dark steps added to `.landing-dark` (all in the exempt
token region, contrast computed): `--success #71d083` (8.85:1 on its subtle
tint), `--danger #ff9592` (8.22:1), `--demo-slop-surface #1c1728` +
`--demo-slop-ink #c4b5fd` (9.46:1; 10.04:1 on nested-card surface). The
waived gradient exhibit keeps white-on-`#7c3aed` at 5.7:1. The
subtle/muted mixes recompute automatically from `var(--surface)`. Evidence:
`demo-dark-50.png`, `demo-dark-slider-0.png`, `demo-dark-slider-100.png`.
Gates re-run clean (token-audit, type-scan).

## Ratchet

Evaluator UNCOVERED items, to file via the `feedback` skill once the user
accepts the result (harness gaps, not catalog controls):

1. `content-lint.py` cannot see JSX text in `.tsx` — only quoted string
   literals; TSX-authored prose is invisible to CNT-1/3/5/6/13 and SLP-9.
2. `contrast.py` resolves `:root` only — scoped token worlds
   (`.landing-dark`/`.landing-light`/future `.dark`) are silently unverified.
3. `playwright.config.ts` reuses whatever occupies port 3000 — the suite can
   silently test the wrong app; needs a self-check.
4. No parity check ties prose/diagrams to a declared contract-of-record
   (loop-data.ts was forked into the landing's copy despite its own warning).
5. The emitted direction contract in `app/layout.tsx` has no freshness gate.
6. No check flags dead (unreferenced) user-facing content data.
7. No check verifies focus-indicator contrast — `a11y-static.py` catches a
   removed ring, not a weak one; a runtime sub-check (focus each control,
   sample the indicator against both adjacent colours, assert 3:1) would have
   caught the A11Y-2 regression in the pass that introduced it.
8. DS request (CMP-1 residual, both from this run): the stack Button needs a
   ≥44px size for mobile primary actions, and its `--ring` half-alpha focus
   treatment fails 3:1 on dark and light surfaces alike.

Candidate control proposal: none new this run — the failures were covered by
existing controls (CNT-10, CMP-1, CNT-4). `[ratchet: harness gaps only]`
