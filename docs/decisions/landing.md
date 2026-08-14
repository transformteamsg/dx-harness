# Design decision record — the dx-harness front page (`/`)

- **Date:** 2026-08-14
- **Product:** other — outside the portfolio. This is the dx-harness website (the
  TFX Design Standard site), not a Teacher & School product. It has no product
  primary of its own and uses Teacher & School Blue `--tw-blue` as its anchor, the
  convention already established in `app/globals.css` and `CLAUDE.md`.
  `products:`-scoped controls (IDN-4) are therefore **deliberately out of scope —
  product outside the portfolio**, a decision, not a silent drop.
- **Change type:** new page (replaces the previous `app/page.tsx`)
- **Page type:** marketing / landing
- **Audience:** builders and their agents, not teachers. The one test ("does this
  help teachers work faster with less stress?") is served indirectly: the harness
  exists so teacher-facing surfaces reach the bar without waiting for a designer.
- **Run type:** attended
- **The teacher and the moment:** none directly. The reader is an engineer or an
  agent-operator arriving cold, deciding in under a minute whether the harness is
  worth installing.

## Sprint contract (done-criteria)

1. The page carries PR 83's information architecture and copy **verbatim** — hero,
   the four parts, how it works, the compare demo, the skills collection — in order.
2. It reads in the approved **Frame** visual language: a 1040 sheet with hairline
   flanks, every section seam a hairline, and section headings that carry the
   hierarchy rather than a tint.
3. The hero carries the DXD mark drawn as a **measured blueprint** whose every
   number derives from the mark's construction.
4. Blue is reserved for the drawing's instrumentation and exactly one primary
   button; the page reads muted at a glance.
5. No new waivers. The build removes rather than adds catalogue deviations.

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

- **The brand blue nearly disappears as decoration.** It survives as instrumentation
  and one button. A reader who expects a blue-forward page will find this quiet. That
  is the point, and it is a real trade.
- **The frame's rules are unforgiving.** One notch darker than `--border` and the
  page reads busy. The treatment depends on the hairline staying a hairline.
- **The blueprint is a hero moment that does not recur.** F2 and F3 existed to carry
  the idea down the page; F1 deliberately does not, so the drawing is the only place
  the conceit appears.
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
- `CMP-1` — **asserted, no manifest.** The repo carries no
  `.dx/component-manifest.json`, so the v0-limit procedure in `controls/cmp-1.md`
  applies: components were inspected in the codebase. `SlopCompare` is reused from
  `components/compare.tsx` unchanged; the three new components are page-specific
  composition, not new primitives.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| — | — | **None.** No waiver was requested or granted this run. | — | — |

**Waivers removed by this build.** PR 83's landing carries two that this treatment
does not need, because it uses the portfolio's own colour and faces:

| Control | Was waived for | Why it is no longer needed |
|---------|----------------|----------------------------|
| `COL-1` | The mark drawn in the lime steps (`components/dxd-mark.tsx`) | The mark is ink `--foreground` with `--blueprint-ink` (an alias of `--tw-blue`) instrumentation. No non-portfolio hue appears. |
| `TYP-1` | EB Garamond headings + Departure Mono, scoped to `.landing-manual` | Display is Plus Jakarta Sans, body is Inter. No third typeface. |

## Plan approval

- **Approved by:** rezailmi (reza.ilmi@gt.tech.gov.sg)
- **Approved on:** 2026-08-14 — explicit direction picking F1 from the rendered
  explorations, then "let's go with F1 … and then pass it over to execute". Counted
  as approval of a chosen direction per `procedures/plan-approval.md`.
- **Decisions taken at approval:** base a new branch off `main`; no install commands
  in the hero (Quick start links to the docs quick start instead).

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
- **Verification ledger:**

  | Control | Method | Evidence |
  |---------|--------|----------|
  | `TOK-1` | script | `checks/token-audit.py` over `app components lib` — clean. Self-test OK (29 cases). |
  | `TYP-1`, `TYP-2`, `TYP-3`, `TYP-4` | script | `checks/type-scan.py` over `app components` — clean. Self-test OK (46 cases). |
  | `A11Y-1` (static half) | script | `checks/a11y-static.py` over `app components` — clean. |
  | curated profile | script | `checks/detect.py` over the changed surface — clean, 4 checks. **This is the curated subset (token-audit, contrast, a11y-static, TYP-1), not a whole-catalogue pass.** |
  | `LAY-2` | script | Playwright at 1440 / 390 / 320: `scrollWidth === innerWidth`, no horizontal overflow. Site-contract e2e also asserts no document overflow at 320 and 360. |
  | `A11Y-4` | script | Site-contract e2e: mobile chrome targets ≥ 44px at 320 and 360; desktop audited targets ≥ 24px. All nav, footer and CTA links carry `min-h-11`. |
  | `A11Y-7` | script | Site-contract e2e: exactly one `main` landmark on `/`. Sections use `h1`/`h2`/`h3` in order; the four parts, the stages and the skills are real lists. |
  | `A11Y-2` | script | Scripted tab walk at 1440: 14 focusable elements in order — skip link, logo, 3 nav links, 2 hero CTAs, the compare divider, the catalog link inside the demo, see-all, close CTA, 3 footer links. 13 of 14 carry the site's `solid 2px` `--color-ring` outline. The 14th is the compare divider's native range input, which keeps the UA `auto 1px` ring — visible, so `A11Y-2` holds, but it is the one focus style on the page that is not the site's. Pre-existing in `components/compare.tsx`, not introduced here. |
  | `CMP-5` | script | Counted every `a`/`button` with a non-white opaque background: exactly one — the hero **Quick start** at `rgb(0, 100, 255)`. The close CTA is outline-on-`--surface`; every other action is a link. |
  | `SLP-6` | script | Measured computed `font-size` in the browser: section heading 30px over card heading 18px = **1.67×**; card heading 18px over body 14px = **1.29×**; `h1` 60px over the 20px standfirst = **3.00×**. All clear the 1.25× floor. |
  | `SLP-11`, `SLP-4`, `SLP-3` | manual | No cards anywhere: cells are divided by shared hairlines with no radius, fill, or shadow, so there is nothing to nest and no side-tab border. |
  | `SLP-5` | manual | No icon-tile-above-heading shape; no icons in the grids at all. The two grids are frame cells with distinct content, not a repeated feature-card template. |
  | `LAY-4` | manual | Every running-text block is capped in `ch` (46ch hero, 52ch cards, 62ch stages, 58ch section support). Nothing is full-bleed and nothing exceeds 80ch. |
  | `SLP-9` | manual | Copy is PR 83's, unchanged. The one edit was case, not words (see Ratchet). |
  | `TYP-6`, `LAY-6`, `LAY-7`, `COL-1` (judgment half), `CMP-7` | unverified | Judgment controls — for the `dx-design-review` agent, not self-assessment. |
- **Evaluator verdict:** _pending — the caller dispatches `dx-design-review` once, per
  `procedures/design-review.md`. This run was dispatched `mode:return-to-caller` and
  does not spawn its own reviewer._

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
