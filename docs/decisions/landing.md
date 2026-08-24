# Design decision record — the dx-harness front page (`/`)

- **Date:** 2026-08-14
- **Product:** other — outside the portfolio. This is the DX Harness website (the
  former TFX Design Standard site), not a Teacher & School product. Its site-level
  primary is Radix Lime: lime 9 for fills, lime 10 for hover, and lime 11 for text,
  borders, and focus rings. Teacher & School Blue remains available only for product
  examples in the foundations documentation.
  `products:`-scoped controls (IDN-4) are therefore **deliberately out of scope —
  product outside the portfolio**, a decision, not a silent drop.
- **Change type:** new page (replaces the previous `app/page.tsx`)
- **Page type:** marketing / landing
- **Audience:** designers and builders working with coding agents, not teachers.
  The harness exists so they can carry design intent into code with confidence,
  while teacher-facing surfaces still reach the bar.
- **Run type:** attended
- **The teacher and the moment:** none directly. The reader is a designer or builder
  arriving cold, deciding in under a minute whether the harness is worth installing.

## Sprint contract (done-criteria)

1. The hero leads with confidence in building in code, explains the harness in plain
   language, and offers Quick start as its only action.
2. The page names the orchestrator, control catalog, `DESIGN.md`, and review skill;
   follows a real prompt through the harness; compares the output; introduces six
   design roles; and closes on human-agent collaboration.
3. It reads in the approved **Frame** visual language: a 1040 sheet with hairline
   flanks, every section seam a hairline, and section headings that carry the
   hierarchy rather than a tint.
4. The hero carries the DXD mark drawn as a **measured blueprint** whose every
   number derives from the mark's construction.
5. Lime is reserved for the drawing's instrumentation and exactly one primary
   button; the page reads muted at a glance.
6. No new waivers. The build removes rather than adds catalogue deviations.

## Chosen approach

**F1 · Blueprint**, chosen from three explorations of the Frame direction (F1
Blueprint, F2 Canvas, F3 Inspector), then iterated once with tailwindcss.com as the
reference. The rendered explorations are the artifact at
`https://claude.ai/code/artifact/ae66d999-366d-4589-a74c-d43228feae53`.

Frame keeps its rules; the iteration made the **type** carry its share — a larger,
tighter headline, balanced line breaks, and a real step between a section heading
and the headings inside it.

## Rejected options

- **A · Paper** — hairlines and air, blue spent almost nowhere. Calm, but the frame
  structure that suits a catalog was lost.
- **C · Field** — banded grounds, no rules. Warmest of the three, but the bands need
  tall sections and it carried least well to the doc pages.
- **F2 · Canvas** — design-tool selection chrome on every figure. Strong, but three
  selected objects on one page competed with the words.
- **F3 · Inspector** — property strip, ruler, layer rows. The most committed, and the
  reason it lost: a page that is always the tool can never look plain.

## Tradeoffs, named

- **Radix lime replaces brand blue as the site accent.** It appears as instrumentation
  and one button. A reader who expects a blue-forward page will find this quieter and
  more distinct from Teacher Workspace. That is the point, and it is a real trade.
- **The frame's rules are unforgiving.** One notch darker than `--border` and the
  page reads busy. The treatment depends on the hairline staying a hairline.
- **The blueprint is a hero moment that does not recur.** F2 and F3 existed to carry
  the idea down the page; F1 deliberately does not, so the drawing is the only place
  the conceit appears. The content pass keeps it until the planned logo-grid asset is
  ready.
- **The route-group split touches every doc route.** Twelve directories moved into
  `app/(docs)/` so the landing could stop inheriting the docs sidebar. No URL
  changed, but the diff is wide for a "restyle the front page" ask.
- **The site now has two identities.** The landing says *dx-harness*; every doc page
  still says *TFX Design Standard*. Resolving that is PR 83's job, not this build's.

## Controls in scope

`TOK-1`, `TOK-2`, `TOK-3`, `TYP-1`, `TYP-2`, `TYP-3`, `TYP-4`, `TYP-6`, `COL-1`,
`CMP-1`, `CMP-5`, `CMP-7`, `SLP-3`, `SLP-4`, `SLP-5`, `SLP-6`, `SLP-7`, `SLP-9`,
`SLP-11`, `LAY-2`, `LAY-4`, `LAY-6`, `LAY-7`, `A11Y-1`, `A11Y-2`, `A11Y-4`, `A11Y-7`.

- `CMP-3` / `A11Y-11` — **N/A, state does not exist:** the surface has no async
  transaction. The compare demo's divider is an instant local range input.
- `CMP-2` — **N/A:** no destructive action on this surface.
- `IDN-4` and other `products:`-scoped controls — out of scope, product outside the
  portfolio (see Product above).
- `CMP-1: asserted, no manifest — manifest absent for other (the dx-harness website)`.
  The repo carries no `.dx/component-manifest.json`, so the v0-limit procedure in
  `controls/cmp-1.md` applies: components were inspected in the codebase. `SlopCompare` is reused from
  `components/compare.tsx` unchanged; the three new components are page-specific
  composition, not new primitives.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| SLP-1 | L1 | The comparison's quarantined before panel must exhibit the purple-gradient anti-pattern it teaches readers to identify. | rezailmi | `components/compare.tsx` |
| SLP-2 | L1 | The comparison's quarantined before panel must exhibit gradient text so the labelled violation remains concrete. | rezailmi | `components/compare.tsx` |
| SLP-4 | L1 | The comparison's quarantined before panel must exhibit nested cards so the structural violation is visible beside the corrected treatment. | rezailmi | `components/compare.tsx` |
| SLP-5 | L2 | The three icon tiles are an intentional anti-specimen, labelled in-product and contrasted with the corrected panel. | rezailmi | `components/compare.tsx` |
| SLP-9 | L2 | The buzzword-heavy sentence is deliberate bad copy inside the labelled anti-specimen. | rezailmi | `components/compare.tsx` |
| CMP-5 | L2 | Two filled actions deliberately demonstrate competing primaries inside the labelled anti-specimen. | rezailmi | `components/compare.tsx` |
| SLP-6 | L2 | The deliberately flat status treatment demonstrates weak hierarchy inside the labelled anti-specimen. | rezailmi | `components/compare.tsx` |

**Waivers this build retires.** PR 83's landing carries two that this treatment does
not need, because it uses the portfolio's own colour and faces. Both retirements were
verified in the built output by the reviewer.

- **Brand moments use the product's own primary (COL-1)** — was waived for the mark
  drawn in the lime steps. No longer needed: the mark is ink `--foreground`
  instrumented in `--blueprint-ink`, now an alias of the DX Harness lime 11 accent.
- **Only Plus Jakarta Sans and Inter (TYP-1)** — was waived for EB Garamond headings
  plus Departure Mono, scoped to `.landing-manual`. No longer needed: display is Plus
  Jakarta Sans, body is Inter, and the code chips are pinned to the body face.

**Waivers this build inherits for the comparison demo.** `components/compare.tsx`
is reused as a quarantined anti-specimen. On 2026-08-14, rezailmi approved its three
L1 deviations (SLP-1, SLP-2 and SLP-4) and the specific reasons for its four L2
deviations (SLP-5, SLP-9, CMP-5 and SLP-6). All seven now have an inline marker and
a matching row above. The front-page move did not create the deviations; it made the
existing component part of this surface's review scope.

## Plan approval

- **Approved by:** rezailmi (reza.ilmi@gt.tech.gov.sg)
- **Approved on:** 2026-08-14 — explicit direction picking F1 from the rendered
  explorations, then "let's go with F1 … and then pass it over to execute". Counted
  as approval of a chosen direction per `procedures/plan-approval.md`.
- **Decisions taken at approval:** base a new branch off `main`; no install commands
  in the hero (Quick start links to the docs quick start instead).

### Scoped follow-up — workflow illustrations (2026-08-15)

- **Intent:** replace the four ambiguous isometric feature drawings with authored
  workflow schematics that explain the adjacent claims at a glance.
- **Done-criteria:** each figure depicts a recognisable software artifact; the four
  figures share one precise line-and-lime drawing grammar; the existing grid, copy,
  figure labels, responsive behaviour, and decorative accessibility treatment stay
  unchanged; no internal label renders below the 12px floor.
- **Component inventory:** `/`; `FeatureFigure`; four decorative, non-interactive
  inline SVGs (`orchestrator`, `catalog`, `design-file`, `review`). No interactive,
  async, destructive, loading, success, or error state exists in the changed surface.
- **Approved by:** rezailmi, 2026-08-15 — picked **workflow schematics** in the grill,
  then selected **Approve** for the sharpened plan.
- **Grill decision:** prefer literal prompts, rule sheets, design specimens, interface
  fragments, and review annotations over abstract geometry or miniature product UI.
- **Intended diff:** redraw `components/landing/feature-figure.tsx`; add this scoped
  run record. Preserve the existing uncommitted removal of the figure's bottom border.

| Dimension | Approved plan |
|-----------|---------------|
| Structure | Keep the four-cell feature grid; replace artwork only |
| Components | Four authored inline SVGs with shared stroke properties |
| Interaction and motion | Static diagrams; no interaction or motion |
| Async states and A11Y-11 | N/A — no async state exists |
| Controls in scope | A11Y-1, A11Y-6, TOK-1, TYP-2, TYP-3, SLP-7, LAY-2, LAY-6 |
| Waivers | None |
| Tradeoffs | More SVG geometry in exchange for clearer concepts; one component keeps it reversible |
| Evidence | Deterministic checks and screenshots at 360, 768, and 1280 |

## Verify verdict

- **Screenshots:** `built-1440.png`, `built-390.png`, `built-320.png` (scratchpad,
  captured from `next start` against the production build).
- **CMP-3 evidence:** `N/A — state does not exist:` no async transaction on this
  surface, so there is no loading, success, or error state to photograph. Recorded as
  a fact, not a pass.
- **Token block line range:** none — this surface declares no `dx-tokens` exempt
  region. All colour resolves through `app/globals.css`.
- **Dark mode:** N/A — the site is light-only by design (`app/globals.css` defines a
  class-based dark variant with no `.dark` layer, so OS preference never activates it).
- **CMP-1: asserted, no manifest — manifest absent for other (the dx-harness website)**
  — the repo carries no `.dx/component-manifest.json`, so `controls/cmp-1.md`'s v0-limit
  procedure applies and components were inspected in the codebase directly.
- **Verification ledger:**

  | Control | Method | Evidence |
  |---------|--------|----------|
  | `TOK-1` | script | `checks/token-audit.py` over `app components lib` — clean. Self-test OK (29 cases). |
  | `TYP-1`, `TYP-4` | script | `checks/type-scan.py` over `app components` — clean. Self-test OK (46 cases). |
  | `TYP-2`, `TYP-3` | manual | **The script cannot cover these.** `type-scan.py` reads declarations, so it passed an earlier `text-[0.9em]` that rendered 10.8px. Now measured in the production DOM: smallest rendered size **12.00px**, and every size on the page is 12/14/16/18/20/30/36/48/60 — all on the Tailwind scale. |
  | `A11Y-1` (static half) | script | `checks/a11y-static.py` over `app components` — clean. |
  | curated profile | script | `checks/detect.py` over the changed surface — clean, 4 checks. **This is the curated subset (token-audit, contrast, a11y-static, TYP-1), not a whole-catalogue pass.** |
  | `LAY-2` | script | Playwright at 1440 / 390 / 320: `scrollWidth === innerWidth`, no horizontal overflow. Site-contract e2e also asserts no document overflow at 320 and 360. |
  | `A11Y-4` | manual | **The e2e does not cover this route** — `tests/site-contract.spec.ts:60-102` measures targets on `/harness/loop` and `/standards/catalog` only, never `/`. Measured by hand at 320/360/390/1440: 13 of 14 controls at 44px. Two exceptions, both pre-existing: the inline `catalog` link inside the reused demo at 42×15px, and the skip link at 38px tall when focused. |
  | `A11Y-7` | script | Site-contract e2e: exactly one `main` landmark on `/`. Sections use `h1`/`h2`/`h3` in order; the four parts, the stages and the skills are real lists. |
  | `A11Y-2` | script | Scripted tab walk at 1440: 14 focusable elements in visual order — skip link, logo, 3 nav links, 2 hero CTAs, the compare divider, the catalog link inside the demo, see-all, close CTA, 3 footer links. All settle on the site's `solid 2px` `#0064ff` ring. **Correction:** an earlier draft of this record claimed the compare divider keeps the browser's default ring. It does not. The `opacity-0` input's UA ring is invisible by construction; the visible handle carries `peer-focus-visible:outline-2 outline-offset-2 outline-(--color-tw-blue)`, and `--ring` and `--tw-blue` are the same value. The reviewer captured the focused frame to prove it. |
  | `CMP-5` | script | Counted every `a`/`button` with a non-white opaque background: exactly one — the hero **Quick start** at `rgb(0, 100, 255)`. The close CTA is outline-on-`--surface`; every other action is a link. |
  | `SLP-6` | script | Measured computed `font-size` in the browser: section heading 30px over card heading 18px = **1.67×**; card heading 18px over body 14px = **1.29×**; `h1` 60px over the 20px standfirst = **3.00×**. All clear the 1.25× floor. |
  | `SLP-3` | manual | No radiused container carries a side border ≥3px; the page's cells are 1px right/bottom hairlines. |
  | `SLP-4`, `SLP-5`, `SLP-11` | manual | **The page's own composition passes** — its cells are hairline-divided, with no radius, fill or shadow, so there is nothing to nest and no icon-tile template. An earlier draft of this record claimed "no cards anywhere", which was wrong: it silently excluded the embedded anti-specimen, which contains both a nested card (`compare.tsx:78` → `:83`) and three icon-tile cards (`:87-102`). Those are pre-existing and open — see "Open findings". |
  | `SLP-5` | manual | No icon-tile-above-heading shape; no icons in the grids at all. The two grids are frame cells with distinct content, not a repeated feature-card template. |
  | `LAY-4` | manual | Every running-text block is capped in `ch` (46ch hero, 52ch cards, 62ch stages, 58ch section support). Nothing is full-bleed and nothing exceeds 80ch. |
  | `SLP-9` | manual | Copy is PR 83's, unchanged. The one edit was case, not words (see Ratchet). |
  | `TYP-6`, `LAY-6`, `LAY-7`, `COL-1` (judgment half), `CMP-7` | unverified | Judgment controls — for the `dx-design-review` agent, not self-assessment. |
- **Evaluator verdict:** **fail** (round 1). Pasted verbatim below, in full, per
  `procedures/design-review.md` — a summary in its place is a defect. Six blocking
  findings: four were the builder's and are fixed and re-measured (see "Fix re-check");
  two are pre-existing in `components/compare.tsx` and are open pending the L1
  approver.

### Evaluator verdict — round 1, pasted verbatim

VERDICT: fail

*The direction is right and the build is well above average — the blueprint's derived geometry checks out to the last decimal, the sheet reads, every control is keyboard-reachable. It fails on tier, not on taste: two L1 typography floors, three L1 deviations carrying the wrong waiver form, and one L0 contrast measurement. All six are cheap to fix.*

**Inputs I did not receive:** no `.dx/design.json` exists in the product repo (I checked; **no standing overrides are active** — nothing to list). I could not diff against **PR 83's actual front page**, so contract criterion 1's "verbatim" claim is only partially verifiable — I verified the section order, the three approved cuts, and internal consistency, not word-for-word identity. No journey evidence was needed (no flow on this surface).

**BLOCKING (must fix before ship):**

- **Labels must be at least 12px (TYP-2, L1)** — six `<code>` chips render at **10.8px**: the `Start with /dx-harness:<skill>` line in every skill card (`app/(landing)/page.tsx:262`, a `Cmd` with `text-[0.9em]` inside the `text-xs` parent at line 261). Measured in the production DOM at both 1440 and 390. These are the actual commands the page asks the reader to type — the most functional text on the surface. `checks/type-scan.py` passes because it reads *declarations* and cannot resolve `0.9em`. This is the exact bug class the record's own Ratchet item 1 warns about (rendered size ≠ declared size), reintroduced by a different mechanism. No waiver on file; an L1 waiver would need a named human approver and a decision-record row.
- **Type sizes come from the Tailwind scale (TYP-3, L1)** — the same `text-[0.9em]` produces **10.8px, 12.6px and 16.2px** in the render; none is in `{…,20,18,16,14,12}`. Same root cause, same script blind spot, no waiver.
- **No purple/violet gradient palettes (SLP-1, L1)** and **no gradient text (SLP-2, L1)** and **no nested cards (SLP-4, L1)** — all three render on this surface inside `SlopCompare`: `linear-gradient(135deg, #7c3aed, #a21caf)` on the demo header and icon tiles, `bg-clip-text text-transparent` on "Term 3 broadcast" (`components/compare.tsx:64-66`), and a card inside a card (`compare.tsx:78` containing `:83`). Each carries an inline `dx-waive` comment — which is the **L2** waiver form. All three controls are `waiver: documented`, needing a named approver in the decision record and registry. The harness's own script confirms: `python3 checks/waiver-reconcile.py app components docs/decisions` → *"inline waiver has no recorded waiver row (named approver)"* for `compare.tsx:53` [SLP-1], `:62` [SLP-2], `:77` [SLP-4] (and for the three L2 ones, where inline is correct). The remedy is bookkeeping, not redesign — the quarantined anti-specimen is plainly intentional and approved as IA. But no waiver on file means blocking, and I am not granting one. Note this is a pre-existing condition in `components/compare.tsx` that the front-page move newly exposes; the requester may prefer to fix it at the component's home record rather than in this PR — their call, not mine.
- **UI components meet 3:1 contrast (A11Y-1, L0)** — the closing CTA (`app/(landing)/page.tsx:285`) is identified only by a 1px `--border-strong` `#a1a1aa` border, measured at **2.46:1 against the `--tw-blue-wash` ground and 2.56:1 against its own white fill**; the fill itself gives no boundary (1.06:1 vs the wash). Computed from the rendered DOM with the WCAG formula. **Interpretive caveat a human should confirm:** this is the WCAG 1.4.11 non-text-boundary reading, not text contrast — `checks/contrast.py --tokens app/globals.css` is clean because it measures text only, and the button remains discernible by eye. I flag it because A11Y-1's title explicitly extends to "UI components" at 3:1, the measurement is unambiguous, and 1.4.11's fill-contrast escape does not apply here. One token would fix it (`--muted-foreground` clears 3:1).

**ADVISORY (should fix):**

- **Shared edges align (LAY-6, L2)** — at 768/1024/1280/1440 the sheet hangs content on **three different left rules**: 41px (nav, hero, all four `h2` bands, see-all, compare, close, footer), 33px (feature cells `p-8`, stage rows `px-8`), 25px (skills cells `p-6`). Measured; visible at 2× — the blue eyebrow "/dx-harness:dx-design" pokes 8px left of the "Core features of the design harness." it belongs to, and "Getting started" sits 16px left of "Skills collection." The two grids do not even agree with each other. No stated reason. This is the one defect that argues against contract criterion 2 on its own terms: a Frame whose rules do not line up.
- **Body measure never above 80 characters (LAY-4, L2)** and **running text held to 45–75 characters (TYP-6, L2)** — measured with canvas glyph metrics at 1440: the five stage-row paragraphs run **80–87 characters per line** (one renders as a single unwrapped 84-character line: "The orchestrator grills first, then routes. Rule and waiver questions stop here too."), the compare figcaption ~82, section subtexts 74–77. Root cause: `max-w-[62ch]` is 62 *`ch` units* (the width of "0"), which in Inter holds ~85 real characters. Every `ch` cap on the page is ~1.35× more generous than it reads.
- **Components stay consistent with defaults and siblings (CMP-7, L2)** — verified manually against `components/ui/button.tsx` and three sibling usages. The close CTA rests at `border-border-strong`, whereas `app/(docs)/for-agents/page.tsx:19`, `components/diagrams/motion-scale.tsx:61` and `components/catalog-browser.tsx:131` all rest at `border-border` and only *hover* to `border-border-strong` — this button takes the site's hover border as its resting state and drops the border-colour hover. Separately, the stack Button's focus treatment (`focus-visible:ring-3 ring-ring/50`) and the site's actual convention (`outline-2 outline-offset-2`) are two different focus systems in one codebase. No recorded reason for either. Related: the hero standfirst (20px/600) and the closing headline (36px/600) render in **Inter**, while every same-role heading on the page uses Plus Jakarta Sans — display-size text in the body face, because the display face is bound to `h1..h4` only. Not a TYP-1 violation (both faces are approved, at approved weights) but an unmotivated inconsistency.
- **Use the stack component where one exists (CMP-1, L1 — graded pass-with-caveat, close call)** — `components/ui/button.tsx` is a Base UI `Button` with exactly the `default` (filled `bg-primary`) and `outline` variants this page needs, and both landing actions are hand-styled `<Link>`s with inlined hover colours and an inlined focus ring — CMP-1's "Fails when" list names this pattern verbatim, and there is no `dx-waive CMP-1`. I graded it pass-with-caveat, not fail, because **no product surface on this site uses that Button** (only `ui/sheet.tsx` and `ui/sidebar.tsx` do) and its `h-8`/`h-9` sizes cannot meet A11Y-4's 44px mobile floor, so "exists for the need" is genuinely arguable. This build did not introduce the divergence. **A human should settle this** — the control's "do not flag" list has no clause for "the stack component exists but the whole product ignores it".
- **Interactive targets ≥ 24px, 44px on mobile (A11Y-4, L1 — pass-with-caveat)** — 13 of the 14 controls measure exactly 44px tall at 320/360/390. Two exceptions: the `catalog` link inside the compare figcaption is **42×15px at every width** (WCAG 2.5.8's inline-in-a-sentence exception plausibly covers it; the catalogue text carries no such exception, and there is no `controls/a11y-4.md` to say), and the pre-existing skip link is 38px tall when focused. **Evidence gap:** the record cites the site-contract e2e as A11Y-4 evidence, but `tests/site-contract.spec.ts:60-102` measures targets only on `/harness/loop` and `/standards/catalog` — it never visits `/`. That is why the 42×15 link was never seen.
- **Structure is programmatically determinable (A11Y-7, L1 — pass-with-caveat, close call)** — the heading outline is clean (one `h1`, four `h2`, fifteen `h3`, no skips), the four parts / stages / skills are real `ul`/`ol`, one `main`, and every link name reads out of context. Two gaps: (1) the closing section has **no heading** — its 36px statement is a `<p>`, so the eye sees five bands and a screen reader hears four; forcing that two-sentence CTA into the heading outline has its own cost, which is why I did not call it a fail. (2) `components/landing/harness-map.tsx` is a `<figure>` with no `role="img"` and no label, and its caption ("Dashed: lives in your repo, not the plugin.") explains a visual property with no text equivalent — mitigated only because stage 05's adjacent row already says "your product repo".
- **No icon-tile-above-heading template (SLP-5, L2)** — the demo's three tiles (`compare.tsx:87-102`) are that exact template with radius, border, fill and shadow, and are the one violation in the panel carrying **no** inline `dx-waive`; the other five each do.
- **Body line-height 1.5–1.6 (TYP-2, close call, not counted as the fail above)** — 15 body blocks render at **1.625** (`leading-relaxed`), outside the stated band. I am not calling this a violation: the control's own "Fails when" list bites only *under* 1.5. The catalogue should reconcile its own two halves.
- **Spacing has rhythm (SLP-7, L2 — pass-with-caveat)** — page-level rhythm is varied (hero 80px, band 32px, cells 32/24px, stage rows 16px), but the hero's five internal gaps are 20/20/24/20/32, so the `h1` is set apart by size alone, not by space.
- **Record accuracy (not a design control, but it ships with the work)** — `python3 checks/audit-record.py docs/decisions/landing.md` reports the record **claims CMP-1 in scope but carries no CMP-1 verdict line** in one of the three required fixed forms (a paraphrase in "Controls in scope" does not satisfy it), plus three "empty Approver cell" errors from the *waivers-removed* table being parsed as a waiver table. Beyond the script: the ledger's `script` method over-claims on TYP-2/TYP-3 (the script cannot see em-relative sizes) and A11Y-4 (the e2e never loads `/`); the SLP-3/4/11 evidence "**No cards anywhere**" silently excluded the embedded demo, which contains both nested cards and icon-tile cards; and the CMP-5 counting method ("every `a`/`button` with a non-white opaque background") structurally cannot see the demo's three span-rendered filled actions. **`checks/content-lint.py` and `checks/waiver-reconcile.py` were never run** — the repo's own `check:python` gate omits both — and both report on this surface. One correction in the builder's favour: the "known-open" item claiming the compare slider keeps the browser's default ring is **wrong**. The `opacity-0` input's UA ring is invisible by construction; the visible handle carries `peer-focus-visible:outline-2 outline-offset-2 outline-(--color-tw-blue)`, and `--ring` and `--tw-blue` are both `#0064ff` — so it is the site's ring, in colour and geometry. I captured the focused frame to confirm.

**SUGGESTIONS (not violations — the builder may take these):**

- Give the heading band and the grid cells one shared gutter (a single `--gutter`, or `px-10` / `p-10` throughout) — LAY-6 — so the sheet reads measured rather than approximately measured.
- Drop `text-[0.9em]` from `Cmd` and set the chip at a scale size, stepping the "Start with" line up to `text-sm` — TYP-2/TYP-3 — the commands are the page's most-copied text.
- Retune the running-prose caps to ~46ch at 14px and ~44ch at 16px (measured ≈62 real characters) — LAY-4/TYP-6.
- Give the closing section an `h2` (visually the statement it already has) and `HarnessMap` a `role="img"` + label, or `aria-hidden` since the `<ol>` beside it duplicates the content — A11Y-7.
- Balance the compare demo's "after" panel: at 1440 it is ~55% empty white, which weakens the argument the figure exists to make — CMP-7/craft.

**QUALITY GRADES:**

- **Design quality — strong.** Hierarchy does its job: 60/30/18/14 with real steps (3.00× / 1.67× / 1.29×, measured), the sheet-and-seam structure tells the reader where they are, and the one primary sits exactly under the claim. Kind Utility holds — the page is useful before it is decorated. Docked only by the three-rule left-edge drift.
- **Originality — strong.** Warranted distinctiveness: the blueprint *is* the argument, drawn, and I verified independently that every quoted number derives from the construction (p=4 exponent; cusps at r=300 → bound 300·cos45° = 212.13 → box 424.26² → waist at θ=45° = 75√2 = 106.07 → W:B exactly 1:2), with the plate and the nav glyph sharing one `DXD_MARK_PATH`. No generic-AI tells in the page's own copy. The blue on eyebrows and numbers is deliberate drafting annotation, not the SLP-1 rainbow tell. The one novelty risk is a bespoke button where a stack component exists — filed as CMP-1, not marked down twice here.
- **Craft — acceptable.** High-craft decisions everywhere: cell borders pulled back a pixel so the outermost hairlines land on the flank, the registration mark withdrawn under `min-[1088px]` with the 1088 = 1040 + 24×2 arithmetic written down, annotations moved out of the SVG because a scaled `viewBox` would have hidden a TYP-2 fail, a derived `SKILL_COUNT` that cannot go stale, and four honestly-recorded ratchet items. Against that: the very bug class Ratchet item 1 names recurs through `text-[0.9em]`, the left rules do not line up, and three ledger rows claim `script` coverage their scripts cannot provide. **Dark mode: N/A — product has no dark mode** (`app/globals.css` declares a class-based dark variant with no `.dark` layer; no dark frame exists to grade, and I did not credit a "dark-safe" pass from token resolution).
- **Functionality — strong.** All 14 controls keyboard-reachable in visual order, every one settling on the site's `solid 2px #0064ff` ring (scripted tab walk, verified after transitions settle — three buttons carry `transition-colors`, which in Tailwind v4 animates `outline-color`, so the ring fades in rather than snapping; cosmetic). Every outbound link and all twelve moved doc routes return 200, `/index.md` matches the page it twins, `tsc --noEmit` and 58 unit tests pass, and no overflow at 320/360/390/768/1024/1280/1440. Docked for the compare demo: at 320–390 the default 50% divider leaves two interleaved half-sentences and neither side is readable ("Communication H" / "Revolutionise you" / "nd to 4 sses"). Recoverable by dragging, so **not** a LAY-2 violation per its explicit do-not-flag clause — but the figure's argument does not land on a phone.

**UNCOVERED (defects no control covers — feed the ratchet):**

- **A figure whose content is illegible at the reflow width.** At 320–390 the compare demo's default 50% divider leaves both panels clipped mid-sentence and overlapping ("Communication H" beside "arent by Friday"), so neither side of the argument can be read on a phone. LAY-2 explicitly does not cover it (recoverable via the control), and no other control asks whether a *diagram* still communicates at 320. Candidate: extend LAY-2 or add a "figure legibility at reflow width" clause — a before/after comparison whose two halves are each ~135px wide has lost its meaning, not just its comfort.
- **A `ch` cap is not a character count.** Four controls (LAY-4, TYP-6) are specified in characters, but the idiomatic implementation (`max-w-[62ch]`) is specified in "0"-glyph widths — ~1.35× wider in Inter. Every well-intentioned cap on this page overshoots by the same factor. Candidate: state the conversion in `lay-4.md`/`typ-6.md` (≈0.72× for Inter), or have the planned `checks/layout-scan` measure rendered characters rather than the declaration.
- **`em`-relative type sizes escape both TYP-2 and TYP-3.** `text-[0.9em]` on a `text-xs` parent silently produces 10.8px and passes `type-scan`. This is the sibling of the record's own Ratchet item 1 (SVG text scaled by a `viewBox`); both are "declared size ≠ rendered size". Candidate: one `type-scan` rule that flags any relative font-size unit in a UI file, or a rendered-DOM sub-check.
- **The repo's own gate omits two built scripts.** `package.json`'s `check:python` runs `validate`, `token-audit`, `a11y-static`, `type-scan` — but not `content-lint.py`, `contrast.py`, `waiver-reconcile.py` or `audit-record.py`. Three of those four report findings on this surface today. Candidate: add `waiver-reconcile.py` and `audit-record.py` to the gate — an L1 waiver in the wrong form is exactly the failure a gate should catch, and it took a manual run to find it here.
- **`checks/audit-record.py` exits 0 while printing ERROR lines.** It printed six errors for `docs/decisions/landing.md` and still exited 0, so a CI wiring would pass silently. Separately, it parses the "waivers removed by this build" table as a waiver table and demands an Approver column it does not have. Both are script defects, not build defects.

**Same-model caveat — where a human's eye is worth more than mine.** I am the same model reading the same standards as the builder, so the findings most likely to be *my* blind spot or *my* overreach are: (1) the **A11Y-1 close-CTA blocker**, which turns on whether a button's border counts as 1.4.11 boundary information — the measurement is certain, the interpretation is not, and it is an L0 call; (2) the **SLP-1/2/4 waiver-form blockers**, where the design intent is unambiguously sound and only the paperwork is wrong, so a human may reasonably record the waivers and ship rather than send the build back; (3) **CMP-1**, where I chose pass-with-caveat over fail on a judgment the control's do-not-flag list does not cover; and (4) **contract criterion 4**, where I read "blue is reserved for the drawing's instrumentation and exactly one primary button" literally and found ~16 blue annotation elements plus a full-section 4% wash — the page unquestionably reads muted at a glance, so whether the letter or the spirit governs is the requester's to decide, not mine. Findings I would defend without a human: the 10.8px chips, the off-scale rendered sizes, the three left rules, and the 84-character line — all measured in the production render, all reproducible.

*(The reviewer's per-control notes and its own verification ledger are part of the same
verdict; they are reproduced in the round-1 review transcript rather than duplicated
here, because the ledger above is this record's own and the two must not be conflated.)*

### Fix re-check — round 1

Six blocking findings. Four were the builder's; all four are fixed and re-measured in
the production render. The inherited `components/compare.tsx` deviations were accepted
by the named human approver and recorded in the required waiver form.
**The narration below is not the evidence — the measurements are, and each was taken
from a fresh build with the stylesheet confirmed at HTTP 200 first.**

| Finding | Tier | Outcome | Measured after the fix |
|---|---|---|---|
| Labels ≥ 12px (TYP-2) | L1 | **resolved** | `Cmd` no longer sets a size, so the chip inherits its parent. Smallest rendered size anywhere on the page is now **12.00px**. The "Start with" line moved `text-xs` → `text-sm`, so the commands render at 14px. |
| Sizes on the Tailwind scale (TYP-3) | L1 | **resolved** | Every rendered size on the page is now 12 / 14 / 16 / 18 / 20 / 30 / 36 / 48 / 60 px. No off-scale value remains. |
| UI components ≥ 3:1 (A11Y-1) | L0 | **resolved** | Border moved `--border-strong` → `--muted-foreground`. Measured **3.74:1** against the `--tw-blue-wash` ground (was 2.46:1). Height unchanged at 44px. |
| Shared edges align (LAY-6) | L2 | **resolved** | Every cell moved to the band's gutter (`sm:px-10`). All full-width and first-column content now lands on **one 241px rule** at 1440 — h2 bands, hero h1, both grids, nav, footer. The stage rows read 529px because that column legitimately begins after the 18rem map cell, not from a padding mismatch. |
| Measure ≤ 80ch (LAY-4 / TYP-6) | L2 | **resolved** | Running-prose caps retuned 62ch/58ch/52ch → **48ch** (≈66 real characters, LAY-4's target rather than its ceiling), and two uncapped lines in `components/compare.tsx` given the same cap. Widest measure on the page is now **58 characters**; the only wider block is the 67-character line inside the waived anti-specimen, which is deliberate slop copy. |
| Closing band has no heading; `HarnessMap` unlabelled (A11Y-7) | L2 | **resolved** | The closing statement is now an `h2` — **5 `h2` in `main`**, matching the five bands the eye sees. `HarnessMap` carries `role="img"` with a full label, and its decorative cells and caption are `aria-hidden`. Both of this page's figures are now labelled. |
| Purple gradient / gradient text / nested cards (SLP-1, SLP-2, SLP-4) | L1 ×3 | **accepted by waiver** | Pre-existing in `components/compare.tsx`, reused as a quarantined anti-specimen. rezailmi approved the three documented waivers on 2026-08-14; each inline marker now has a matching decision-record row. |
| Icon-tile template (SLP-5) | L2 | **accepted with rationale** | The demo intentionally exhibits this template in its labelled before panel. The inline marker and specific reason were recorded on 2026-08-14. |

Regression check after the fixes: `pnpm build` clean (70 controls, 36 docs),
`tsc --noEmit` clean, 58 unit tests and 37 Playwright contracts pass, no horizontal
overflow at 1440 / 390 / 320, and 14 keyboard stops all land on the site's ring.

**Human resolution — 2026-08-14.** rezailmi accepted the comparison demo's seven
intentional deviations in their required waiver forms. This closes the review's
remaining control findings without a visual code change; the re-check measurements
and screenshots above remain representative of the rendered page.

### Post-review iteration — 2026-08-14

The product metadata now consistently names **DX Harness** and explains the current
design harness: one front door, checkable standards, and an independent reviewer.
The hero's redundant `dx-harness` eyebrow was removed. The site primary moved from
Teacher & School Blue to the requested Radix Lime scale: lime 9 (`#bdee63`) for solid
fills, lime 10 (`#b0e64c`) for hover, and lime 11 (`#5c7c2f`) for text, borders, and
focus rings. Solid lime controls use the dark foreground (`#18181b`); the primary
button measures 13.14:1 for text and its lime 11 border remains visible against the
lime 9 fill. This amendment supersedes the earlier blue-specific implementation
notes while leaving the original review evidence intact as historical evidence.

### Superseded naming note — 2026-08-17

The paragraph above naming **DX Harness** is now stale: the product is named
**DX Design Harness** in user-facing copy site-wide (commit `75ce249`), leaving
`dx-harness` as the plugin identifier and install command only. The record above
is left as historical evidence and not rewritten.

### Accepted inherited deviations and residual finding

The comparison demo predates this build. Moving it onto the front page brought its
intentional anti-patterns into this run's scope.

1. **Seven intentional deviations are accepted and recorded** — SLP-1, SLP-2 and
   SLP-4 as L1 waivers approved by rezailmi; SLP-5, SLP-9, CMP-5 and SLP-6 with
   specific L2 rationales. Each record matches an inline marker in
   `components/compare.tsx`.
2. **The figure is labelled** — the comparison frame has `role="group"` and an
   accessible name describing the before/after content. The earlier review note that
   it was unlabelled was stale.
3. **The demo remains hard to read at 320–390** — its default 50% divider leaves both panels
   clipped mid-sentence. LAY-2 expressly does not cover it (a drag recovers it), so it
   is an uncovered defect logged in the Ratchet, not an unrecorded control failure.

### Workflow-illustration follow-up verification — 2026-08-15

- **Evidence:** `/tmp/dx-harness-illustrations-final-1280.png`,
  `/tmp/dx-harness-illustrations-final-768.png`, and
  `/tmp/dx-harness-illustrations-final-360.png`, captured from the final production
  build after confirming the actual viewport width for each frame.
- **Inventory:** four `FeatureFigure` instances render one SVG each and retain
  `aria-hidden="true"`. The adjacent headings carry the complete meaning; no SVG
  contains rendered text or an interactive control.
- **CMP-3 / A11Y-11:** N/A — no async state exists in this static illustration change.
- **Dark mode:** N/A — the product has no dark-mode token layer or rendered theme state.
- **Fresh-context evaluator:** not dispatched in this session; no independent
  evaluator verdict is claimed for this scoped follow-up. The evidence below is the
  builder's deterministic and rendered verification.

| Control or gate | Method | Evidence |
|-----------------|--------|----------|
| A11Y-1, A11Y-6, TOK-1, TYP-2, TYP-3 | script | Focused token, a11y, type, and contrast scans clean; `pnpm run check:python` clean (`70 controls valid`) |
| LAY-2 | manual | 360px production DOM reports `scrollWidth - innerWidth === 0`; focused Playwright overflow checks pass at 320 and 360 |
| LAY-6, SLP-7 | manual | 1280 / 768 / 360 evidence inspected for optical alignment, line density, clipping, and grouping rhythm |
| Landing feature contract | script | Focused Playwright run: three tests pass, including four feature figures and both mobile overflow widths |
| Unit regression | script | `pnpm run test`: 12 files, 92 tests pass |
| Production build | script | `pnpm run build`: 245 static pages generated and CSP post-build completed |
| Full Playwright file | unverified | 40 of 41 pass; the unrelated site-accent test expects committed lime 11 `#5c7c2f` while the branch renders committed `#587828`; neither file is in this follow-up diff |

### Skill-mark interaction follow-up — 2026-08-15

The six skill marks keep their existing colour and silhouette system, with two scoped
refinements from the approved visual direction: the Polish diamond and Execute hexagon
now use softened corners, and each pair of pill eyes follows a fine-pointer position
while that pointer is inside its card. Eye travel is capped at four pixels so it reads
as attention rather than displacement. It resets on pointer exit, ignores touch input,
and stays at rest when `prefers-reduced-motion: reduce` is active.

- **A11Y-5 / MOT-3:** reduced-motion users receive the static resting state; the
  decorative SVGs remain `aria-hidden`.
- **MOT-1 / MOT-2:** only the eye group's `transform` changes, with the existing fast
  motion token and a direct ease-out response.
- **LAY-2 / SLP-8:** the mark viewBox and 64px footprint are unchanged, so the softened
  paths and eye travel cannot alter card geometry or page overflow.
- **Regression contract:** the focused browser check covers all six card hooks,
  pointer following, exit reset, and the reduced-motion resting state.
- **Verification:** `/tmp/dx-harness-skill-marks.png` and
  `/tmp/dx-harness-skill-marks-hover.png` record the resting and pointer-following
  production states. Typecheck, ESLint, all 92 unit tests, the 70-control design
  gate, the 245-page production build, and four focused Playwright checks pass.

### The mark's ink and weight — 2026-08-18 (builder ruling)

The traced mark in the hero blueprint now draws in `--mark-ink` at a 7px stroke,
replacing a 5px stroke in `--blueprint-ink`. Verbatim ask: "Change the logo mark
(animation one)'s colour into B0E64C and make it thicker."

- **`--mark-ink` is new in `app/globals.css`**, aliasing `--site-accent-hover`
  (Radix lime-10, `#b0e64c`). It exists so the mark's colour has a name of its
  own rather than reading as a hover state at the call site, and so the raw hex
  stays in the token block (TOK-1). Measured in the production DOM: the mark
  computes `rgb(176, 230, 76)`, `strokeWidth: 7px`.
- **COL-1 still passes without a waiver.** This record already retired the old
  COL-1 waiver on the ground that the site's lime *is* this product's own
  primary; drawing the mark a step brighter in the same family does not reopen
  that. The construction guides keep `--blueprint-ink` (`#587828`, measured
  4.75:1 on the `--sheet-band`), so the drawing keeps its readable layer.
- **What it costs, stated plainly.** Lime-10 measures **1.37:1** on the
  `--sheet-band` panel where the old ink measured ~4.75:1, so the mark no longer
  clears the 3:1 non-text floor. It is the brand mark, which WCAG exempts from
  that floor as a logotype, and the hero's message is carried by the headline
  beside it — no reader has to resolve the drawing to follow the page. A11Y-1 (L0)
  is unaffected: it governs text and UI components, and every text pairing on the
  surface is unchanged. The stale claim in
  `components/landing/dxd-construction-preview.tsx` that "the mark's own stroke
  clears the 3:1 floor" was corrected rather than left standing.
- **The extra 2px is load-bearing**, not decoration: at 5px the lighter ink read
  as a wash against its own guides. Verified in `hero-mark-1280.png`.

## Ratchet

Four things the build had to decide that no control cleanly settled. All four are
recorded rather than improvised, and three are candidates for the catalogue.

1. **SVG annotation text has no size floor anyone checks.** `TYP-2` requires labels
   ≥ 12px, and `checks/type-scan.py` reads source declarations — but an SVG `<text>`
   sized in user units renders at whatever the viewBox scale makes it. The blueprint's
   labels would have landed near 9px and passed the script. Fixed by moving the
   annotations into real HTML beside the plate. `[proposed — pending design-lead
   approval]` a `TYP-2` note, or a check, for text inside a scaled `viewBox`.
2. **`<code>` silently imports a third typeface.** A bare `<code>` inherits the UA
   monospace default, which puts a face outside Plus Jakarta Sans and Inter on the
   page while `type-scan` sees no declaration to flag. This page pins its code chips
   to `font-body`. **The docs prose has always rendered inline code in UA monospace**
   (`.prose code` in `app/globals.css` sets no family) — a pre-existing `TYP-1` gap
   this build declines to widen but does not fix. `[proposed — pending design-lead
   approval]` either register a code/command face in `TYP-1`'s table the way the Glow
   wordmark is registered, or set `.prose code` to the body face site-wide.
3. **A registration mark needs a gutter to register against.** Below 1088px the sheet
   is full-bleed, so a mark centred on its edge hangs past the viewport and trips
   `LAY-2`. Withdrawn under `min-[1088px]`, which is sound because the mark is
   decorative and `aria-hidden`. No control covers "decoration that cannot survive
   the narrow viewport" — recorded, not proposed; the general rule is already `LAY-2`.
4. **The markdown twin can drift from its page silently.** `/index.md` renders from
   `content/sections/landing.mdx`, which nothing on the new page reads, so replacing
   the HTML landing left the agent-readable front page serving the old copy and no
   check noticed. `content/sections/landing.mdx` was rewritten to match.
   `[proposed — pending design-lead approval]` a check that a singleton's twin and its
   page agree on title and description — on a site whose selling point is being
   machine-readable, a stale twin is a defect, not a nit.

Five more the round-1 reviewer surfaced, kept here because Phase 6 owns the ratchet:

5. **A figure can be illegible at the reflow width and still pass.** At 320–390 the
   compare demo's default 50% divider clips both panels mid-sentence, so neither half
   of a before/after argument can be read. `LAY-2` expressly does not cover it — a drag
   recovers it — and no control asks whether a *diagram* still communicates at 320.
   `[proposed — pending design-lead approval]` a figure-legibility clause on `LAY-2`.
6. **A `ch` cap is not a character count.** `LAY-4` and `TYP-6` are written in
   characters; the idiomatic implementation (`max-w-[62ch]`) is written in zero-widths,
   ~1.35× wider in Inter. Every cap on this page overshot by that factor, in good faith.
   `[proposed — pending design-lead approval]` state the conversion (≈0.72× for Inter)
   in `lay-4.md` and `typ-6.md`, or measure rendered characters in a check.
7. **`em`-relative font sizes escape both `TYP-2` and `TYP-3`.** `text-[0.9em]` on a
   `text-xs` parent silently renders 10.8px and `type-scan.py` passes it. This is the
   sibling of item 1 above — both are "declared size ≠ rendered size", and both got
   through. `[proposed — pending design-lead approval]` one `type-scan` rule flagging
   any relative font-size unit in a UI file.
8. **The repo's own gate omits two built scripts.** `package.json`'s `check:python`
   runs `validate`, `token-audit`, `a11y-static` and `type-scan` — but not
   `waiver-reconcile.py`, `audit-record.py`, `content-lint.py` or `contrast.py`. The L1
   waiver-form problem in "Open findings" is exactly what a gate should have caught, and
   it took a manual run to find. `[proposed — pending design-lead approval]` add
   `waiver-reconcile.py` and `audit-record.py` to `check:python`.
9. **Two defects in `checks/audit-record.py` itself, not in any record.** It exits 0
   while printing ERROR lines, so a CI wiring would pass silently. And its `REPO_ROOT`
   resolves to the *plugin's* install directory, so its "referenced docs/ path exists"
   check tests product-repo paths against the plugin and always fails them — the one
   error this record still reports is that false positive, reproducible with
   `python3 checks/audit-record.py docs/decisions/landing.md` from any product repo.
   `[proposed — pending design-lead approval]` exit non-zero on error, and resolve
   `repo_root` from the audited file's own repository.
