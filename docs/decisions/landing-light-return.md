# Design decision record — landing page (one light world, seed docs register)

> Supersedes the visual-world half of `docs/decisions/landing-dark.md`
> (2026-08-11, dark Linear register with the lime token sheet of ticket #82).
> The storyline-first structure that record retained from
> `docs/decisions/landing.md` is retained again unchanged; only the token
> world and the accent decision reverse. The old record stays as history.

- **Date:** 2026-08-13
- **Product:** dx-harness website (the harness's own marketing surface)
- **Change type:** modification (world flip of `/` back to the light `:root` tokens)
- **Page type:** marketing landing
- **Run type:** attended (orchestrated: dx-start → dx-design-language → dx-design)
- **Approved by:** rezailmi, in-session, 2026-08-13 (plan exposed in full, then approved)
- **The person and the moment:** unchanged from landing-dark.md — a
  designer-engineer mid-evaluation, asking "how does this actually work?"

## Decision

One light world. The landing and the docs both render the light `:root`
tokens; the reference register is seed-design.io's docs pages — calm,
near-monochrome, generous whitespace, hairline borders, large plain display
headings. DESIGN.md at the repo root was rewritten to this model the same day
and `.dx/design.json` regenerated.

## What changed

1. `app/globals.css` — the `landing-dark` and `landing-light` scope blocks
   removed (with them the lime accent `#bdee63`, its hover/pressed/line/wash
   steps, the dark functional steps, and the dark anti-specimen inks). The
   `.landing-primary-hover` rule removed; the primary action returns to the
   stack Button's default hover. `--primary-line` and `--primary-wash`
   (consumed by feature-cards and skills-section) are re-defined in `:root`
   as blue mixes — the wash held at 4% so `--tw-blue-text` on it keeps
   ≥4.5:1. `.site-focus-ring` stays: the brand-blue
   outline computes ~3.9:1 on the light surfaces where the stack's half-alpha
   ring underperforms the 3:1 UI-state floor (A11Y-2).
2. `app/(landing)/layout.tsx` — the `landing-dark` class dropped from the
   shell. The quincunx mark re-picked for the light sheet: centre `--primary`
   (TW blue, the brand anchor leads again), corners amber `--warning-9`,
   brown `--sec-harness`, grass `--success-9`, teal `--sec-foundations` —
   five distinct hues at 6px; the dark-world set collapsed two pairs on the
   light sheet (grass/grass and blue/blue). The mark remains the page's one
   recorded polychrome exception.
3. `components/landing/no-cli-dialog.tsx` — no longer carries `landing-dark`
   into the portal; `:root` already governs `<body>`.
4. `components/compare.tsx` — comment-only: the demo inherits the (now light)
   page world; no pinning needed.
5. `components/landing/copy-commands.tsx` — drops `landing-primary-hover`;
   comment updated.
6. `components/landing/full-map-diagram.tsx` — legend wording "lime edge" →
   "blue edge"; the edge itself is `border-primary` and re-inks by token.
7. `app/layout.tsx` — the OWN-WORLD line of the direction contract rewritten
   to the one-light-world model.

Everything else re-inks itself: the landing markup is token-only (TOK-1), so
removing the scope flips the world.

## Contrast facts (A11Y-1, light sheet)

Unchanged from the audited `:root` values: `--foreground` on `--surface`
≈ 14.7:1; `--muted-foreground` on `--muted` clears 4.5:1 by design (see the
token comment); `--tw-blue-text` (= `--tw-blue`) on `--background` ≈ 4.7:1;
white `--primary-foreground` on the `--tw-blue` fill ≈ 4.6:1 at button-label
size and weight (≥18.66px bold equivalent not required: 4.5:1 floor met).

## Rejected directions

- **Keep the dark landing, borrow only seed's structure** — offered at the
  grill; the user chose the full one-light-world move.
- **Seed's own brand-orange hero** — seed-design.io's homepage leads with a
  full-bleed brand-orange panel; not taken: the ask pointed at the docs
  register, and a saturated full-bleed hero would fight the single-accent
  strategy (COL-1) and the calm register the user chose.

## Waivers granted

No **new** deviations were introduced by this run. What follows re-grants the
pre-existing ones in a machine-readable form, because they were not one before.

`landing-dark.md` recorded all eight demo waivers in a single row whose Control
cell read `(carried) SLP-1/2/4/5/6/9, CMP-5, CNT-2`. `waiver-reconcile.py`
matches column 0 against `^[A-Z0-9]+-\d+$` and skips anything else as a
descriptive placeholder, so that row was invisible to it and all eight inline
markers reconciled as orphans — the named approver was present in prose but
absent to the checker. One row per control id, as below, is the form that
actually holds.

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| SLP-1 | L1 | quarantined anti-specimen: the gradient/glow palette is the exhibit itself | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |
| SLP-2 | L1 | quarantined anti-specimen: gradient text is the exhibit itself | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |
| SLP-4 | L1 | quarantined anti-specimen: nested cards are the exhibit itself | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |
| CNT-2 | L1 | quarantined anti-specimen: "Communication Hub" is the invented portmanteau the control bans, shown as the exhibit | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |
| COL-1 | L1 | brand mark: the quincunx is five distinct hues by construction — one dot per loop phase — and is the single polychrome element on the surface | reza.ilmi (design owner) | inline `dx-waive` in `app/(landing)/layout.tsx` |
| SLP-5 | L2 | quarantined anti-specimen: the icon-tile grid is the exhibited default | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |
| SLP-6 | L2 | quarantined anti-specimen: the flat type hierarchy is the exhibit itself | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |
| SLP-9 | L2 | quarantined anti-specimen: the AI-writing tells are the exhibit itself | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |
| CMP-5 | L2 | quarantined anti-specimen: competing primaries are the exhibit itself | reza.ilmi (design owner) | inline `dx-waive` in `components/compare.tsx` |

A11Y-1 is **not** waived anywhere and never has been: both demo panels pass
WCAG AA against the `--demo-slop-*` values. The exhibit breaks style and
content controls only — L0 is never demonstrated broken.

The COL-1 row is new to this record. The quincunx exception was approved in
this run's plan and described in the Colour section of `DESIGN.md`, but existed
only as prose; it now carries an inline marker at the mark itself, so the
single-accent rule and its one exception are both checkable.

## Review fixes (same day)

The design review returned fail on three blockers; fixed and re-evidenced:

1. **Hover contrast (A11Y-1, L0, introduced by this run):** the primary
   action's hover now uses `hover:bg-tw-blue-hover` (the 88%-black darken,
   same as tool-card.tsx) instead of the stack's `hover:bg-primary/80`
   lighten, whose white-on-#3383FF composite was 3.6:1. Also resolves the
   CMP-7 hover-direction inconsistency.
2. **Target size (A11Y-4, L1, pre-existing):** the map's Replay button gets
   `max-sm:min-h-11 max-sm:min-w-11`; the dialog Close gets `max-sm:size-11`
   in `components/ui/dialog.tsx` (site-wide, consistent).
3. **Label floor (TYP-2, L1, pre-existing):** all SVG labels in the map
   raised to 12px design units, and the SVG no longer scales below its 560px
   design width — below 560 the figure scrolls in its own focusable container
   (LAY-2 container scroll). "YOUR PRODUCT REPO" recased to sentence case
   (TYP-4).

## Follow-up fixes (2026-08-13, after the review)

The three items the review deferred, now closed.

1. **Breakpoints reconciled with the code.** `DESIGN.md` declared
   `[320, 768, 1080]`, which described no system anyone had written against:
   320 is the reflow floor (no media query exists at it), 1080 is the column
   cap, and the two breakpoints actually carrying weight — `sm` 640 and `lg`
   1024 — were missing. The declaration is now `[640, 768, 1024, 1280]`,
   Tailwind's uncustomised defaults, matching the 65 `sm:`, 13 `md:`, 14 `lg:`
   and 2 `xl:` utilities in `app/` and `components/`. `minWidth: 320px` is
   recorded separately as the reflow floor. `.dx/design.json` regenerated.

2. **Waivers made machine-readable.** See "Waivers granted" above. The eight
   demo waivers reconciled as orphans because the previous record listed them
   in one combined cell the checker skips; they are now one row per control id,
   and `waiver-reconcile.py --src app components --records docs/decisions`
   exits 0 with no orphans and no stale notes. COL-1 (the quincunx mark) gained
   both a row and an inline marker, having previously existed only as prose.

3. **The scroll-reveal now fails visible.** Two defects in
   `components/landing/reveal.tsx` and `components/landing/full-map-diagram.tsx`:
   the hidden state was armed *before* the `IntersectionObserver` was
   constructed, and the trigger used `{ threshold: 0.2 }` — a ratio threshold,
   unsatisfiable once the element exceeds 5x the viewport height. The map
   figure is ~1090px, so any viewport shorter than 218px stranded the whole
   architecture diagram at `opacity: 0` after a full scroll, silently.
   Reproduced at 210px and 150px; fixed by constructing before arming and
   moving to `{ threshold: 0, rootMargin: "0px 0px -20% 0px" }`, which triggers
   on the same beat at any element height. Re-verified: the animation still
   plays (armed/opacity 0 at load → shown/opacity 1 on scroll), reduced-motion
   never arms at all, and no-JS markup contains no `data-reveal`.

This failure mode is not covered by any existing control — MOT-3 governs
motion-off parity, not a reveal that never fires — so it is written up as
`docs/decisions/proposal-mot-4-reveal-fail-visible.md`. That proposal is **not
adopted**; `standards/` is unchanged, because adopting it amends the rulebook
for every product using the harness.

## Review verdict

### Initial verdict (verbatim)

VERDICT: fail

The sprint contract's register criterion is met — the page reads unmistakably as the calm light seed-docs world. It fails on three unwaived control violations (one L0, two L1), one of which this run introduced.

**Standing overrides:** `.dx/design.json` at the repo root carries **no `overrides` key**, and `DESIGN.md` has no overrides section. No control was graded against an adjusted rule.

BLOCKING (must fix before ship):

- **Text meets WCAG AA contrast (A11Y-1, L0)** — the primary action's *hover* state fails. The plan's step "`.landing-primary-hover` removed; the primary action returns to the stack Button's default hover" (decision record, change 1; diff in `components/landing/copy-commands.tsx`) hands the hover to the stack default `hover:bg-primary/80` (`components/ui/button.tsx`, `default` variant). #0064FF at 80% over the white panel = #3383FF; white 14px label on it = **3.60:1**, against a 4.5:1 floor. Resting is fine (4.92:1). Evidence: code read + computed; `checks/contrast.py` cannot see this (its own header: line-local pairs only, no alpha/hover states), so the "contrast clean" result does not cover it. This is a regression introduced by this run — the repo already has the right token (`--tw-blue-hover`, an 88%-black mix) and a sibling using it (`components/tool-card.tsx:37`).
- **Interactive targets are at least 24×24px (44px on mobile) (A11Y-4, L1)** — two controls on this surface miss the 44px mobile floor at the 320/360 widths in evidence: the map's **Replay** button (`components/landing/full-map-diagram.tsx:110-117`, `px-3 py-1.5 text-xs` ≈ 26px tall) and the **dialog Close** button (`components/ui/dialog.tsx:62-70`, `size="icon-sm"` = 28px). Verified manually by reading the classes (no script covers A11Y-4 — `a11y-static.py` states "Interactive hit-area size (A11Y-4) — needs computed layout"). Pre-existing, not introduced this run, but preserved is not waived; the repo already knows the fix — `copy-commands.tsx` carries `min-h-11` for exactly this reason.
- **Labels at least 12px (TYP-2, L1)** — the architecture figure's SVG text is set at `fontSize` 11, 10.5, 10 and 9.5 (`full-map-diagram.tsx:294, 343, 364-401, 416, 424-452, 467, 493-502`), below the 12px label floor, and it shrinks further as the SVG scales below its 560px design width (≈5.4px at 320). `checks/type-scan.py` matches `font-size:` CSS and `text-[Npx]` only, not SVG `fontSize` attributes, so this was never script-covered; verified manually. Pre-existing; no waiver on file. A waiver here would need a named approver and a reason why the connector captions cannot be 12px.

ADVISORY (should fix):

- **Text is never set in all-caps (TYP-4, L2)** — `YOUR PRODUCT REPO`, `full-map-diagram.tsx:501`, typed as literal caps. `type-scan.py`'s TYP-4 rule only detects `text-transform: uppercase` / the `uppercase` utility, so the script's pass is not evidence here. It also contradicts `.dx/design.json`'s own mono spec ("sentence case").
- **Components stay consistent with DS defaults and sibling pages (CMP-7, L2)** — verified manually against the sibling: the same primary action *darkens* on hover in `components/tool-card.tsx` (`hover:bg-tw-blue-hover`) and now *lightens* on the landing. `--tw-blue-hover` is left declared and unused by this surface. Same root cause as the A11Y-1 blocker, different defect (consistency); fixing one likely fixes both.
- **Declared grid and breakpoints (LAY-1, L2)** — `.dx/design.json` declares `breakpoints: [320, 768, 1080]` and `maxContentWidth: 1080px`. The width cap and section padding match (`max-w-[1080px]`, `py-16`/`sm:py-20` = 64/80px), but the layout switches at Tailwind `sm` (640) and `lg` (1024) — `page.tsx:102`, `feature-cards.tsx:88`, `skills-section.tsx:35` — neither of which is a declared breakpoint. Either the declaration or the code should move.
- **Plan fidelity — edits outside the approved plan.** The plan I was given is a token-world flip plus a legend word. The working tree also changes: `feature-cards.tsx` (adds a sixth node `dx-design-polish` and rewords the caption "passes" → "propose-only skills"), `data.ts` + `skills-section.tsx` (removes the `planned` flag and its CNT-4 "planned" label from `dx-design-language`), plus `content/sections/landing.mdx`, `content/harness/skills.mdx`, `content/getting-started/build.mdx` and `lib/markdown-twin.test.ts`. All are *factually* correct against the shipped plugin (I checked: `dx-design-language` now ships with a `SKILL.md`; the six propose-only skills match the frontmatter names), but none is in the approved plan text. Confirm they were approved, or record them.
- **Decision record's waiver section is inaccurate.** `docs/decisions/landing-light-return.md` says "Waivers: None requested, none granted", while the surface ships eight inline `dx-waive` markers in `components/compare.tsx` (SLP-1, SLP-2, SLP-4, SLP-5, SLP-6, SLP-9, CNT-2, CMP-5) and the record itself calls the quincunx "the page's one recorded polychrome exception". The waivers carry specific reasons ("quarantined anti-specimen…") but no **named approver** — SLP-1/SLP-2/SLP-4/CNT-2 are L1 and their waiver type is `documented`. Pre-existing, but the record for this run should reconcile rather than assert none.
- **Focus indicator on the dialog Close button (A11Y-2, L0) — close call, recommend human check.** The stack default is `focus-visible:ring-3 ring-ring/50` (≈2.2:1 halo on white) plus `focus-visible:border-ring` (a 1px #0064FF border at 4.9:1). The 1px border probably carries the indicator over the 3:1 non-text floor, so I am not calling it a failure — but the repo's own `.site-focus-ring` comment says the stack ring "underperforms the 3:1 UI-state floor" and applies the fix to the primary action only. No focus screenshot was supplied for this control.
- **CNT-13 (L2), pre-existing:** "catalog" (US) across the landing versus Singapore/British "catalogue" used in the harness's own procedure docs. Repo-wide established term mirroring `catalog.yaml`; noting for consistency, not a regression from this run.

SUGGESTIONS (not violations):

- Point the primary action's hover at `--tw-blue-hover` rather than reintroducing a scope class — serves A11Y-1 and CMP-7 in one change, and retires the now-dead token.
- Give the reveal wrappers a fallback (`rootMargin` or a short timeout that forces `data-reveal="shown"`) — serves the storyline's functionality; today the map only exists after a scroll event.
- Raise the map's SVG captions to 12px and drop `YOUR PRODUCT REPO` to sentence case — serves TYP-2/TYP-4 and the diagram's legibility at 360.
- Add `min-h-11` to the Replay button and pass a 44px size to the dialog Close on small viewports — serves A11Y-4 with the idiom already used on the copy button.
- Move the "Quick start nav hidden below 360px" reason out of the code comment and into the decision record — serves LAY-2's auditability.

QUALITY GRADES:

- **Design quality — strong.** Hierarchy is carried by size, space and hairlines exactly as the register asks: one h1, three h2 sections separated by full-bleed rules, and blue used only where something is actionable. The teacher-equivalent reader knows where they are and what to do first (copy two commands) within the first viewport.
- **Originality — strong (appropriately restrained).** This is a professional tool page and it behaves like one: the distinctiveness lives in the isometric map and the before/after slider, both of which do explanatory work, not decoration. The purple/glow/gradient material is quarantined in the labelled anti-specimen with inline waivers — that is a deliberate colour system, not the SLP-1 tell. The one thing to watch is the three-up equal-weight feature card row (SLP-5's neighbourhood); the builder's inline rationale is reasonable and each figure differs, so I am not calling it, but a human should confirm.
- **Craft — acceptable.** Token discipline, motion tokens, reduced-motion handling, live-region choice and the SSR/no-JS reveal contract are all deliberate and well documented. Points come off for the hover state shipped without its contrast fact recomputed (the record recomputes four other pairs and skips this one), the sub-12px SVG type, and the two mobile target sizes.
- **Dark mode — N/A: product has no dark mode.** One light world; `@custom-variant dark` exists but no `.dark` layer renders.
- **Functionality — acceptable, with one real risk.** Copy → copied/failed works and recovers ("Copy failed. Select the commands below." plus a focusable `pre`), the dialog is escapable, the slider is keyboard-operable. But two of the five storyline beats are gated behind an IntersectionObserver at `threshold: 0.2` with no fallback — see UNCOVERED.

UNCOVERED (defects no control covers — feed the ratchet):

- **A scroll-reveal can leave content permanently invisible, and no control covers it.** `components/landing/reveal.tsx` and `full-map-diagram.tsx` both arm `data-reveal="armed"` (opacity 0) from client JS, then wait for `IntersectionObserver` with `threshold: 0.2` and no timeout, `rootMargin`, or forced-shown fallback. The threshold is a ratio of the *target's* area, so for a container much taller than the viewport it may never be reachable: at 320 the map figure runs roughly 2,400 CSS px, so a 568px-tall viewport tops out near 0.24 — a ~0.04 margin from the section never appearing at all. Two consequences already visible in the evidence: (a) every full-page capture at 320/768/1280 renders those sections blank, meaning the page's two central explanatory regions are absent for any non-scrolling consumer (print, PDF, screenshot tooling, some crawlers); (b) the section only appears after the reader has scrolled a fifth of it into view. A11Y-5 covers the reduced-motion path (handled) and MOT-3 covers the animation-off path (handled) — neither covers a JS-gated hidden state that may never resolve *with* motion on. Proposed rule: a reveal that hides content must guarantee resolution (fallback timer or intersection independent of target height), and hidden-until-scrolled content must render in a full-page capture.
- **Waiver records have no approver field in practice.** Eight inline `dx-waive` markers ship on this surface with specific reasons but no named approver, four of them on L1 controls whose waiver type is `documented`. `checks/waiver-reconcile.py` exists; nothing in the review flow forces the approver name into either the marker or the decision record, and the record for this run asserts "none granted" while they are live in the code.

(The full judgment-control notes and per-control verification ledger are preserved in the review agent transcript; key rows: A11Y-1 manual — contrast.py cannot see hover/alpha states; TYP-2 manual — type-scan.py does not match SVG fontSize; A11Y-4 manual — no script covers hit-area size.)

### Re-check verdict (verbatim)

**VERDICT: pass-with-findings** (was: fail). All three blockers are resolved on the new evidence; nothing new rises above advisory.

**1. Text meets WCAG AA contrast — hover state (A11Y-1, L0) — RESOLVED.**
Verified two independent ways. Code: `components/landing/copy-commands.tsx` now passes `hover:bg-tw-blue-hover` in `className`, and the comment records the fact ("white-on-#3383FF composite fails AA (3.6:1)"). Evidence: I recomputed `color-mix(in oklab, #0064FF 88%, black)` myself and got **oklab(0.4926, −0.0332, −0.2113) = #0053D7** — the reported live computed value (0.4925, −0.033, −0.211) matches to rounding, which it could only do if twMerge dropped the variant's `/80` lighten (that path would compute near oklab L 0.62). White label on #0053D7 = **6.52:1**, clear of the 4.5:1 floor. `fix-hover.png` shows the visibly darker fill at 1280. This also resolves the **CMP-7** hover-direction advisory: the landing and `components/tool-card.tsx` now darken identically.

**2. Interactive targets 44px on mobile (A11Y-4, L1) — RESOLVED.**
Replay: `max-sm:min-h-11 max-sm:min-w-11` added (`full-map-diagram.tsx:113`). Dialog Close: `max-sm:size-11` added (`components/ui/dialog.tsx:65`), with the 28px `icon-sm` retained ≥sm where the 24px floor governs — correct, since A11Y-4's mobile floor is what was failing. `fix-dialog-320.png` shows the close control at 320 with no collision with the title. Caveat on evidence, not on the fix: the Replay 44px measurement is reported, not photographed (`fix-map-360.png` is scrolled past it); I confirmed the classes in code and accept the live measurement.

**3. Labels at least 12px (TYP-2, L1) — RESOLVED.**
I grepped every `fontSize` in `full-map-diagram.tsx`: the set is now {12, 14, 15} — no value below the floor remains (was 9.5/10/10.5/11). The second half of the fix matters as much as the first: `min-w-[560px] max-w-[560px]` pins the SVG at its design width, so 12 design units are always 12 CSS px; previously the same labels shrank with the container (≈5.4px at 320). `fix-map-1280.png` shows the labels rendering noticeably larger and legible. The LAY-2 consequence is handled correctly — container scroll, not page scroll (`figure` gets `min-w-0` so the grid item can shrink; reported `documentElement.scrollWidth <= clientWidth` true at 320 and 360), and WCAG 1.4.10 exempts diagrams from the 2-D scroll rule. `fix-map-360.png` shows the expected clean clip at the container edge with the narrative rail intact above it.

**Advisories also cleared:** TYP-4 (all-caps) — RESOLVED: `Your product repo` at `full-map-diagram.tsx:505`. Decision-record waiver accuracy — RESOLVED: the record now names all eight `dx-waive` markers, states which four are L1, records the missing-approver gap as a ticket follow-up, and notes the quincunx COL-1 exception is not yet written as a marker.

**New, from the fixes (advisory only):**
- Focus state on the new scroll container (A11Y-2, L0) — close call, no finding, but check it: the scrollable region declares no `focus-visible:outline`; UA default expected. Add the site idiom for consistency and photograph it. [Addressed after this verdict: the shared focus idiom was added and `fix-map-focus-360.png` captures the ring; `:focus-visible` match verified true live.]
- Scroll discoverability at <560px — sighted users get a clipped plate edge with no affordance until they scroll; the hint currently lives only in the `aria-label`. Suggestion, not a finding.
- Scope note: fix 2 edits `components/ui/dialog.tsx`, a shared stack component — every dialog in the product now gets a 44px close on mobile. That is the correct direction and the record documents it, but it is a DS-wide change made outside the approved plan; worth a line on the ticket.

**Carried forward unchanged (accepted as follow-ups):** the UNCOVERED scroll-reveal risk (`threshold: 0.2` with no fallback), LAY-1 breakpoint declaration vs `sm`/`lg` utilities, the styled-`<p>` pseudo-heading in the curated block (A11Y-7 caveat), "catalog/catalogue" locale, and the plan-fidelity items. The `feature-cards` sixth node, the `planned`-flag removal and the `content/*.mdx` edits are concurrent user work on this branch rather than this run's — recorded here so a reader diffing the branch knows.
