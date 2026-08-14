# Design decision record — landing lime figures (spec-sheet register)

> One record per page or significant change. Started at the Phase 3 plan gate,
> finished at Phase 6.

- **Date:** 2026-08-13
- **Product:** dx-harness website (landing)
- **Change type:** modification
- **Page type:** marketing landing (poster hero + figure sections)
- **Run type:** attended
- **The builder and the moment:** a developer evaluating the harness skims the
  landing; the figures must read as one drawn system that carries the harness's
  own identity, not the Teacher Workspace product blue.

## Sprint contract (done-criteria)

1. The landing's technical figures (FIG 0.1 hero mark, FIG 0.2–0.4 feature
   figures, FIG 0.5 harness map) draw in the harness's lime figure steps, in
   the makingsoftware.com spec-sheet register (framed panels, graph paper,
   rotated edge captions, leader-line callouts, mono uppercase annotations).
2. The nav mark is visibly bigger (24 → 32px).
3. The hero shares the header's 1080px column, so the headline's left edge
   aligns with the logo (LAY-6).
4. Blue stays on links, code accents, and the focus ring; primary buttons are
   ink/black site-wide (scope addition 6 below — it supersedes this item's
   original "blue buttons" wording). Lime never appears on interactive chrome.
5. DESIGN.md records lime as the harness accent (standing override of the
   one-accent guardrail) and the lime figure steps.

## Chosen approach

Direction C, "Lime Spec Sheet", picked from three rendered explorations: every
figure mounts in a `.spec-panel` (hairline frame, graph-paper dots via
`--dxd-lime-dot`, lime corner ticks, rotated mono edge caption). Structure is
drawn in `--dxd-lime-ink` (Radix lime-11, ≈4.6:1 on the page); fills use
`--dxd-lime-wash`. Leader-line callouts annotate the geometry (the builder
later trimmed the hero's to 1:2 WAIST and QUARTIC EDGE — scope addition 5 —
and a parallel session enriched the feature figures' callout sets). The
map's connector labels and group captions go mono uppercase. The hero mark is
a blueprint: wash fill, ink stroke (the builder chose wash over solid lime at
the grill).

## Scope additions during the run (builder asks, mid-implement)

Each of these was a direct builder instruction, applied as part of this run:

1. Nav mark darker with an outline — fill moved to --dxd-lime-deep (Radix
   lime-10) with a --dxd-lime-ink stroke.
2. The docs topbar carries the same mark — extracted to
   components/dxd-mark.tsx, replacing the blue "dx" square.
3. The standards demo (SlopCompare) is full width — the 760px cap removed.
4. Richer before/after demo content — the after panel reads as a real
   broadcast compose screen (To / Reaches / Schedule / Replies go to /
   Message + attachments); the before panel's buzzword copy extended.
5. The hero figure's leader-line callouts (BOUNDING SQUARE, WAIST 1:2,
   QUARTIC EDGE) removed — the builder judged them noise.
6. Primary buttons are black site-wide — --primary now resolves to
   --foreground (+ --primary-hover); TW blue narrows to links, code accents,
   and the focus ring. DESIGN.md updated to match.

## Rejected options

- **A — Lime Blueprint** — recolour only, no frames; judged too close to the
  current page to carry the makingsoftware reference the builder pointed at
  twice.
- **B — Lime Mark** — solid lime-9 hero mark, lime chips, hatched edges;
  judged the loudest option, lime starts competing with the headline.

## Tradeoffs, named

- Blue loses its monopoly on the landing. Acceptable: blue keeps every
  interactive surface, and the revert is token-level (swap the figure tokens
  back in each component).
- The spec panels add frames to a previously open layout. Accepted as part of
  the chosen register; the panel is a figure mount, not card chrome (SLP-11
  reading recorded in globals.css).
- Lime-9 itself cannot draw a legible stroke (~1.3:1), so the figure system
  leans on lime-11 ink; the pale brand lime appears only in fills and the nav
  mark.

## Controls in scope

TOK-1, TOK-2, TOK-3, COL-1, COL-2, TYP-1, TYP-3, A11Y-1, A11Y-2 (unchanged
interactive set), A11Y-5 (existing reduced-motion paths preserved), LAY-2,
LAY-6, CNT-4 (map legend), MOT-1/MOT-3 (no new motion), SLP-8, SLP-9, SLP-11.
No async or destructive actions touched — CMP-2/CMP-3 N/A.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| COL-1 | L1 | The harness's own identity (brand mark + landing technical figures) draws in --dxd-lime and its steps, a second accent held apart from the page primary --tw-blue; never interactive chrome | rezailmi (plan gate, this run) | DESIGN.md Colour (standing override) + inline `dx-waive` at components/dxd-mark.tsx, components/landing/hero-geometry.tsx, components/landing/feature-cards.tsx, components/landing/full-map-diagram.tsx |
| COL-1 | L1 | The single primary action is ink (--primary → --foreground), not the product blue — the builder's explicit direction ("use black as primary button on the website across", 2026-08-13) | rezailmi (explicit ask, this run) | DESIGN.md Colour (standing override) + inline `dx-waive` at the --primary definition in app/globals.css |
| TYP-2 | L1 | Figure annotations are SVG text scaled with the figure: ≥12px rendered at the desktop layout; at md and below they shrink with the figure (measured ~5–9px at 320–768; 768/md is the worst case). Waived for figure annotations only, never UI text | rezailmi (post-review fix decision, 2026-08-13) | DESIGN.md Typography + this record |
| TYP-4 | L2 | Figure annotations are mono uppercase — the spec-sheet technical-drawing register the builder picked (direction C); confined to FIG 0.1–0.5 annotations, never body or UI copy | L2 — reason recorded | DESIGN.md Typography + this record |

## Plan approval

- **Approved by:** rezailmi — grilled plan (wash-fill hero mark, lime washes on
  the map, 32px nav mark), then picked direction C from three rendered
  explorations; the pick is the contract.
- **Approved on:** 2026-08-13

## Verify verdict

- **Screenshots:** scratchpad `evidence/` set — 1280-hero, 1280-features(2),
  1280-map, 1280-demo, 1280-docs-topbar, 768-hero, 768-features, 360-hero,
  360-features, 360-demo. No async states exist on the surface (CMP-3 N/A), so
  the width evidence is the full set.
- **Token block line range:** app/globals.css `:root` block (the exempt token
  sheet; lime steps defined there)
- **Dark mode:** N/A — product has no dark mode (one light world,
  docs/decisions/landing-light-return.md)
- **Verification ledger:**

  | Control | Method | Evidence |
  |---------|--------|----------|
  | TOK-1..3 | script | repo build gate: `token-audit.py app components lib` clean |
  | COL-1/COL-2 | script + manual | token-audit clean; lime steps are Radix lime-9/10/11 (ink darkened for AA, same precedent as --warning); waiver recorded |
  | TYP-2/TYP-3 | script | `type-scan.py` clean after captions raised 10px → 12px (caught by the gate) |
  | A11Y-1 | script + manual | contrast.py: one pre-existing false positive in ui/button.tsx (untouched); measured by hand: ink #516d29 ≈5.4:1 on wash, ≈5.7:1 on page bg; muted-foreground on panel ≈5.1:1 |
  | A11Y-2/8 | script + manual | a11y-static clean; no interactive semantics changed this run; focus rings unchanged (blue ring on black button verified in capture) |
  | A11Y-5 | manual | reduced-motion paths untouched (hero keyframes, scroll map arm-check, compare settle) |
  | LAY-2 | manual | 360 captures: hero, features, demo reflow with no horizontal scroll; edge caption shortened after 360 overflow was caught |
  | LAY-6 | manual | 1280 capture: hero headline left edge on the 1080 column with the header |
  | CNT-4 | manual | map legend updated to "lime edge — the single front door"; dashed key unchanged |
  | MOT-1/3 | manual | no new motion; existing draw loop and staged reveal untouched |
  | SLP-8/9/11 | manual | no bounce; DESIGN.md prose plain; spec panel is a figure mount, static content not boxed as cards |
  | A11Y-4 | unverified | needs computed hit areas; nothing interactive changed, flagged for the reviewer |

- **Evaluator verdict:**

**VERDICT: fail** (first pass, 2026-08-13 — full text verbatim below; fixes follow in "Fixes after review")

> I have measured the built result directly (live dev server, Playwright), read the code, and run the repo's own vendored checks. Verdict follows.
>
> VERDICT: fail
>
> **Inputs received:** sprint contract, approved plan (direction C + six scope additions), decision record, component inventory, 11 screenshots, judgment/hybrid control list. **Inputs I fetched myself:** `.dx/design.json` — it has **no `overrides` key**, so there are no machine-readable standing overrides to apply; the COL-1 override exists in DESIGN.md prose and the decision record only (see ADVISORY 9). **Evidence gaps I had to close myself:** `1280-features.png` is a hero capture (mislabelled); `1280-demo.png` and `1280-features2.png` predate the black-primary edit; there is no 360 map capture and **no 320 capture at all** — LAY-2's actual target. I re-rendered at 320/360/768/1280 plus reduced-motion and no-JS.
>
> BLOCKING (must fix before ship):
>
> - **Labels below the 12px floor (TYP-2, L1)** — every annotation in FIG 0.1–0.5 renders under the label floor. Measured rendered sizes (computed font-size × viewBox scale, Playwright): at 1280 `FRONT DOOR` / `TIERED RULES` / `ONE SOURCE` = **8.7px**, `L0`/`L1`/`L2` = 9.49px, map connector labels (`ONE ASK, IN PLAIN WORDS`, `DISPATCHES PROPOSE-ONLY SUBAGENTS`, `SHARED CONTEXT`) = 11px; at 768 all 22 nodes ≤ 9.9px; at 360 all 25 nodes ≤ 8.9px with connector labels at **5.46px**; at 320, **4.67px**. Contradicts the product's own declared rule — DESIGN.md line 48: "mono: --font-mono, **12px floor**". `checks/type-scan.py` reads `font-size:` CSS and `text-[Npx]` only, never SVG `fontSize` attributes or viewBox scaling, so the green gate was blind here. No waiver on file. Verified manually + by measurement.
> - **Horizontal page scroll and a clipped nav control at 360px (LAY-2, L1)** — `document.documentElement.scrollWidth` = **368** vs `clientWidth` 360 across 359–367px; the header nav's right group ends at x=368 and "GitHub" is visibly cut; `window.scrollX` reaches 8. LAY-2 requires controls to hold at 360 and no two-dimensional scrolling. **This run caused it:** forcing the nav svg back to 24px removes the overflow exactly (368 → 360), i.e. contract item 2's 24→32px growth is the cause. No waiver.
> - **The single primary action is a neutral, not the product primary (COL-1, L1)** — the hero "Quick start" computes to `rgb(24,24,27)` (`--primary` → `--foreground`). COL-1's evaluator guidance names exactly this case: "a legitimately-tokenised *neutral* is sitting where the brand belongs". The one COL-1 waiver on file reads "The harness's own identity (brand mark + landing technical figures) draws in --dxd-lime…" — it does not cover the ink primary, and the plan-gate contract said the opposite (record line 24: "Blue stays the interactive accent: **buttons**, links, focus rings"). A waiver would need: control COL-1, tier L1, the ink-primary deviation stated explicitly, a named approver (rezailmi), recorded in the record's Waivers-granted table and DESIGN.md — or revert `--primary` to `--tw-blue`. Alone among the three, this fix may be documentary.
>
> ADVISORY (should fix):
>
> - **Reduced-motion and no-JS lose two of the map's nine layers (MOT-3, L2)** — the svg is 950px tall inside a 620px `overflow:hidden` window and the camera `translate` is only applied when JS arms it. Measured at 1280 with `prefers-reduced-motion: reduce` **and** with JS disabled: layer 7 (`WRITTEN INTO THE PRODUCT REPO`) and layer 8 (`DESIGN.md` / `Your product repo`) are `visible=false`, layer 6 (`SHARED CONTEXT`) partly clipped — permanently unreachable. The file's own comment claims "No-JS and reduced-motion render the complete finished map"; it does not.
> - **Hero figure centred against a left-aligned stack, 641–1023px (LAY-6, L2)** — `.hero-geometry` is `mx-auto max-w-[640px]`: at 768 it sits 64→704 while h1/CTA sit at 24; at 1023 it sits **192→832** (a 168px indent).
> - **Map panel edge off the column (LAY-6, L2)** — FIG 0.5 measures 542→**1150** while FIG 0.1/0.2/0.4 and the section container are flush at **1156**. Cause: `mx-auto max-w-[608px]` in a 619.5px grid track.
> - **No optical correction on the nav mark (LAY-6, L2)** — h1 left = 124.0, logo box left = 124.0, but the mark's ink starts at **133.2** and is only **13.6px wide inside a 32px box** (the quartic path fills 42.5% of its viewBox). Boxes align; nothing visible does. Contract item 3's stated aim reads as unmet at 1280, and the "visibly bigger" mark reads small and thin beside the 18px wordmark.
> - **All-caps annotation system, unwaived (TYP-4, L2)** — `FIG 0.1`, `45° ROTATION`, `[ QUARTIC MARK ]`, `FRONT DOOR`, `TIERED RULES`, `ONE SOURCE`, `STEP 01 · in the chat`, `ONE ASK, IN PLAIN WORDS`, `PROPOSE-ONLY PASSES`, `SHARED CONTEXT`, `WRITTEN INTO THE PRODUCT REPO`. TYP-4's verify text is "all-caps strings flagged **anywhere**"; DESIGN.md says mono is "sentence case". No `dx-waive TYP-4` at any site and no waiver row. (CNT-12 is the same defect, not a second one.)
> - **Two em dashes in one sentence, x2 (SLP-9, L2)** — confirmed by the repo's own linter: `components/landing/feature-cards.tsx:194` ("one file the whole team—human and agent—can work from") and `components/landing/full-map-diagram.tsx:203` (the `<desc>`). Both pre-existing copy inside files this run edited. Note `content-lint.py` is **not** in the repo's `check:python` gate.
> - **Legend does not key the drawing (CNT-4, L2)** — "lime edge — the single front door", but the lime accent edge also marks `dx-design-execute`; "solid — the harness plugin", but layer 1's "You" plate is solid lime-wash and is not the plugin.
> - **Stale in-code documentation of this run's own colour decision** — `app/layout.tsx:22` direction contract still says "TW blue as the single accent" and "quincunx wordmark"; `app/(landing)/layout.tsx:8` comment says "TW blue as the single accent"; `app/globals.css:24` claims "COL-1 exempts the brand mark itself" when the actual mechanism is a recorded standing override.
> - **The typed projection of contract item 5 is garbled** — `.dx/design.json` was regenerated but the generator mis-parsed the new multi-line DESIGN.md bullets (accent truncated mid-clause; continuation lines concatenated into `colour.prose`). There is also **no `overrides` key**, so the L1 COL-1 standing override is invisible to machine readers.
> - **Record fidelity** — the decision record contradicts itself and the build: contract item 4 still says blue buttons while scope addition 6 says black; item 1 still lists "leader-line callouts" that addition 5 removed; the waiver row's "Where recorded" names `app/(landing)/layout.tsx` (the marker is now in `components/dxd-mark.tsx`) and omits `components/landing/full-map-diagram.tsx`; and `components/tool-card.tsx` was changed but absent from the declared changed-file list.
> - **Focus ring eases in, against the site's own rule (craft)** — nav links and "Explore the harness" carry `transition-colors duration-(--motion-fast)`, which animates `outline-color`; `app/globals.css:271` states "A focus indicator must appear instantly".
>
> SUGGESTIONS: fixed-px figure annotations or HTML overlays (TYP-2); spec panels on the section's left edge (LAY-6); map viewport clamp only when JS arms the camera (MOT-3); nudge/crop the DxdMark so the glyph fills its box (LAY-6); add `content-lint.py` to `pnpm check:python`.
>
> QUALITY GRADES: Design quality — acceptable. Originality — strong (the lime spec-sheet direction is genuinely distinctive and motivated; close call on SLP-5's three-up skeleton, saved by bespoke distinct illustrations — recommend a human read). Craft — weak (the register's pitch is precision, and precision is where it fails: sub-12px labels, 8px nav overflow at 360, 168px figure indent at 1023, 6px panel-edge miss, two of five map layers unreachable with motion off; the hero mark blinks out and redraws every 4.2s indefinitely). Dark mode — N/A. Functionality — acceptable (all 14 focusables keyboard-reachable with a settled 2px blue ring; targets ≥44px; slider labelled with aria-valuetext; the reduced-motion content loss and the clipped 360 nav are the functional holes).
>
> JUDGMENT CONTROL NOTES: COL-1 fail (ink CTA unwaived; lime half honoured — no lime on any interactive element, with a scope caveat on the rail's lime border/heading code being prose chrome, not figures). LAY-2 fail (359–367px scrolls; 320 itself clean). LAY-3 pass. LAY-5 pass-with-caveat (map stage 1 sparse). LAY-6 fail (three measured misses). LAY-7 pass-with-caveat. LAY-1, LAY-4, TYP-6 pass. SLP-5 pass-with-caveat (human read recommended). SLP-6, SLP-8, SLP-10, SLP-11 pass. SLP-9 fail (two em-dash chains). CNT-4 pass-with-caveat (legend mis-keys; FIG 0.3 cubes have no tier ordering under a "TIERED RULES" caption). CNT-14, IDN-3, CMP-1, CMP-5, A11Y-7 pass. CMP-7 pass-with-caveat (orbit-loop.tsx still fills active states with bg-tw-blue on docs pages). MOT-3 fail (layers 7–8 unreachable with motion off).
>
> UNCOVERED (feed the ratchet): rendered text size inside a scaled SVG (type-scan blind spot); WCAG 2.2.2 pause/stop/hide for the indefinitely looping hero mark; figure-legend integrity (no control asks whether a key matches its figure); DESIGN.md → .dx/design.json projection fidelity (garbled keys, no overrides projection).
>
> (Verification ledger with per-control method and evidence received and archived with the run; screenshots in scratchpad rev/.)

### Fixes after review (same day)

Applied in response, pending the reviewer's re-check from new screenshots:

1. TYP-2 (blocking): map labels raised to 12 units (12px at desktop scale 1.0); feature-figure callouts and tier labels raised to 16 units (≈12.7px at the desktop card width); hero labels were already ≥12px at desktop. Small-screen rendering covered by the TYP-2 waiver above (approver rezailmi).
2. LAY-2 (blocking): nav mark is size-6 below `sm` and size-8 from `sm` up — removes the 8px overflow and the clipped "GitHub" at 360.
3. COL-1 (blocking, documentary): ink-primary standing override recorded — waiver row above, DESIGN.md Colour, and a `dx-waive` marker at the `--primary` definition.
4. MOT-3: the map's sticky clamp and viewport clip now apply only when JS arms the camera — reduced-motion and no-JS render the complete static map.
5. LAY-6: hero panel left-aligned (mx-auto removed); map panel fills its grid track; DxdMark viewBox cropped to the glyph's ink (255 255 490 490) so the mark fills its box and optically aligns.
6. TYP-4: figure-annotation register recorded as an L2 deviation (waiver row above + DESIGN.md Typography).
7. SLP-9: both em-dash-chain sentences rewritten.
8. CNT-4: legend now reads "lime edge — the front door and the one builder"; the layer-1 "You" plate uses a neutral top so "solid wash = the plugin" keys truthfully.
9. Stale documentation: direction contract in app/layout.tsx, the landing-shell comment, and the globals.css mark comment all updated; DESIGN.md colour bullets reflowed to single lines and .dx/design.json regenerated (the generator's missing `overrides` projection is fed to the ratchet).
10. Focus ring: nav/footer links use `transition-[color]` so `outline-color` no longer animates.




### Re-check verdict (2026-08-14, same reviewer, from new evidence — verbatim)

> RE-CHECK VERDICT: fail → **pass-with-findings**
>
> All three blockers are cleared — two by the build, one by a properly recorded waiver. 8 of 10 advisories resolved, 2 partial, plus 2 new items introduced by the fix pass. Nothing L0/L1 remains unwaived.
>
> 1. **Label floor (TYP-2, L1) — partial; blocker cleared.** Desktop is fixed: all **41** SVG text nodes at 1280 measure **12.0–14.0px** (was 4.67–11px across 25 nodes). Below desktop it still fails on the numbers — 38 of 41 nodes under 12px at 768 (**8.03px** features / **7.93px** map), all 41 at 360 (5.96–11.82px) and 320 (5.1–10.04px). But a valid L1 waiver is now on file: specific reason, approver **rezailmi**, in the record's Waivers-granted table *and* DESIGN.md Typography. Moves to ADVISORY (waived L1). Two wording defects to correct: (a) the scope phrase "below md" is wrong — 768 *is* md and is the **worst** case; say "at md and below". (b) `waiver-reconcile` emits a NOTE that the TYP-2 waiver has no inline usage marker.
> 2. **Reflow / clipped nav at 360 (LAY-2, L1) — resolved.** `scrollWidth == clientWidth` at 320/360/640/768/1023/1280; no nav link clipped at any width. Contract item 2 survives the fix: the recropped glyph means **20.8px of visible ink at 320 vs 13.6px in the old 32px box** — the mark is visibly bigger everywhere despite the smaller box. Residual nit: at 360 the nav group ends exactly at x=360.
> 3. **Ink primary (COL-1, L1) — resolved (documentary).** Waiver row present with tier, a specific reason quoting the direct instruction, approver rezailmi, DESIGN.md Colour standing override, and an inline `dx-waive COL-1` directly above `--primary`. `waiver-reconcile.py` clean.
> 4. **Reduced-motion content loss (MOT-3) — resolved.** Under reduced motion **and** with JS disabled: zero clipping ancestors, full 950px svg, **all 9 layers at opacity 1**.
> 5. **Hero figure alignment (LAY-6) — resolved.** Figure left edge = 24 at 320–1023, identical to the h1 and CTA; 596→1156 flush at 1280.
> 6. **Map panel edge (LAY-6) — resolved.** FIG 0.5 now 536→1156, flush with the 1080 column.
> 7. **Nav mark optical alignment (LAY-6) — resolved.** Ink fills 86.6% of the box (was 42.5%), a 2.15px optical inset from the headline edge — correct for a pointed glyph.
> 8. **All-caps register (TYP-4) — resolved** (L2 waiver row + DESIGN.md line; the "TYP-4 bind" sentence now names its one deviation).
> 9. **Em-dash chains (SLP-9) — resolved** (content-lint zero em-dash-chain hits; remaining buzzwords are the waived anti-specimen).
> 10. **Legend fidelity (CNT-4) — resolved.** Legend keys truthfully; layer 1 uses the neutral plate. Bonus: the redrawn FIG 0.3 stacks L0 at the base — the tier-ordering caveat is resolved too.
> 11. **Stale in-code docs — resolved** (all three sites).
> 12. **`.dx/design.json` — partial.** Colour keys no longer truncated; one bullet still swallowed into `colour.prose`; `overrides` remains absent — accepted as the ratchet item.
> 13. **Focus-ring easing — partial**: navLink/footerLink snap; "Explore the harness" still eased (fixed after this verdict: `transition-[color]`).
>
> **Hero-geometry delta — resolved, with a knock-on gain**: only three labels remain, 13.22px at 1280 and 15.32px at 768 — the hero clears the floor at both desktop widths.
>
> **NEW (2 minor):** map connector labels overflowed the figure into the caption strip (since reworked/shortened); content-lint CNT-1 false positives on the wrapped uppercase drawing labels (markers added; the heuristic and its missing dx-waive support go to the ratchet).
>
> **Gate status re-run:** type-scan clean, token-audit clean, a11y-static clean, waiver-reconcile clean (one NOTE).
>
> **Quality grade movement:** craft **weak → acceptable**; design quality acceptable, originality strong, functionality acceptable; dark mode N/A.

### Post-re-check fixes (2026-08-14)

- "Explore the harness" link: `transition-[color]` so the focus ring snaps (re-check item 13).
- Map connector labels shortened / reworked with arrowheads so they stay clear of the caption strip (new item 1); the parallel session refined the final texts.
- Inline `dx-waive TYP-2` usage markers added (waiver-reconcile NOTE); `dx-waive CNT-1` markers document the drawing-label false positives.
- Waiver wording corrected: the TYP-2 waiver scope reads "at md and below" (768 is md and is the worst case).

## Ratchet

Uncovered defects no control caught, proposed for the catalogue ratchet
[proposed — pending design-lead approval]:

1. Rendered text size inside a scaled SVG — TYP-2/type-scan read source values
   only; a 4.67px label shipped past a green gate. Proposal: a rendered-size
   sub-check (computed font-size × viewBox scale) or a rule on text inside
   scaled viewBoxes.
2. WCAG 2.2.2 pause/stop/hide — the hero mark loops every 4.2s indefinitely;
   no control covers indefinitely looping decorative motion.
3. Figure-legend integrity — no control asks whether a legend keys the figure
   it sits under (CNT-4 is about real-world fidelity, not internal
   consistency).
4. DESIGN.md → .dx/design.json projection fidelity — the generator truncates
   multi-line bullets, swallows one bullet into prose, and projects no
   `overrides` key, so machine readers cannot see recorded standing overrides.
5. content-lint has no inline dx-waive suppression, and its CNT-1 all-caps
   heuristic false-positives on figure drawing labels; the script is also
   absent from the repo's build gate.
