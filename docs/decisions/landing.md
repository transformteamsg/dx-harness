# Design decision record — atelier landing page (wireframe)

> Issue #3. Low-fidelity greyscale wireframe of the atelier landing page. Started at the
> Phase 3 plan gate, finished at Phase 6.

- **Date:** 2026-07-23
- **Product:** N/A — atelier repo landing page, not a Teacher & School product surface (off-domain; general standards only)
- **Change type:** new page
- **Page type:** informational landing page
- **Run type:** attended
- **The teacher and the moment:** N/A — a developer or designer evaluating atelier for the first time, deciding whether to install.

## Sprint contract (done-criteria)

1. Covers all five IA sections (hero, install, how-it-works, skill catalogue, footer).
2. Every structural decision cites a catalog control.
3. Reflows cleanly to a single column at 320px (LAY-2).
4. One clear primary focal region (LAY-7).
5. Low-fidelity and greyscale; no committed colour tokens (deferred to #7).
6. No anti-slop: no identical-card grid (SLP-5), no static content boxed in cards (SLP-11).

## Chosen approach

Option A — single-column narrative scroll: hero → install → how-it-works → skill
catalogue (two grouped description lists) → footer. Rendered as a throwaway greyscale
`docs/landing/mock.html`; structure and control traceability in `docs/landing/wireframe.md`.

## Rejected options

- **Option B (hero + sticky-install two-column)** — the two-column band adds 320px
  reflow risk and measure discipline for little gain on an informational page.
- **Option C (catalogue-forward)** — leading with the skill list buries the "what is
  atelier" context a first-time visitor needs before the list means anything.

## Tradeoffs, named

- Catalogue as grouped lists is denser and less "showcase-y" than cards; accepted to
  avoid SLP-5 slop and keep reflow trivial.
- Greyscale defers all colour and brand expression to #7; accepted because this
  artifact exists to lock structure, not look.

## Controls in scope

A11Y-1, A11Y-2, A11Y-4, A11Y-6, A11Y-7, A11Y-9, A11Y-10; LAY-2, LAY-4, LAY-7; TYP-6;
SLP-5, SLP-6, SLP-7, SLP-9, SLP-11; CMP-5; CNT-2, CNT-9, CNT-12.

Deferred to #7 (documented, not waived): COL-1, COL-2, TOK-1, TYP-1, TYP-2, TYP-3 —
greyscale throwaway artifact on an ad-hoc rem scale with no Tailwind/token
infrastructure; these attach to the shipped React app. A11Y-1 still binds and is met.

N/A: IDN-2/3/4 and CaseSync controls (not a product surface); CMP-2/CMP-3/A11Y-11 (no
async or destructive actions); CMP-6 (catalogue is a list, not tabular comparison).

## Plan grill

Plan was grilled. Decisions resolved:
- Control-most-at-risk (SLP-5): skill catalogue rendering fixed to grouped description
  lists (not a card grid, not a two-column tile grid, not a table).
- Intent-drift lens: closed — all six done-criteria covered, nothing added.
- TOK-1 applicability: resolved in-plan — the throwaway greyscale mock is not shipped
  UI, so TOK-1/COL/font controls are deferred to #7; A11Y-1 still binds.

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
| (none)  | -    | -      | -        | -              |

## Plan approval

- **Approved by:** user (interactive Approve at the Phase 3 gate)
- **Approved on:** 2026-07-23

## Verify verdict

- **Screenshots:** NOT captured — `agent-browser` is not installed in this environment.
  Width evidence at 360/768/1280 is a documented gap (LAY-2 unverified). Capture is a
  prerequisite before this wireframe is treated as fully signed off.
- **CMP-3 in scope:** No (no async actions) — state-frame evidence not required.
- **Token block line range:** N/A — greyscale raw greys deferred to #7, not tokenised here.
- **Dark mode:** N/A — single greyscale artifact, no dark layer or toggle.
- **Verification ledger:**

  | Control | Method | Evidence |
  |---------|--------|----------|
  | A11Y-1 | manual | contrast computed: ink #1a1a1a/white 17.4:1, muted #595959/white 7.0:1, white/#1a1a1a 17.4:1 |
  | A11Y-2 | script | `checks/a11y-static.py` clean; global `:focus-visible`, no outline removal |
  | A11Y-4 | manual | `.btn { min-height: 44px }` (mock.html:62) |
  | A11Y-6 | manual | no img/svg/icon; decorative footer glyph `aria-hidden` |
  | A11Y-7 | manual | h1→h2→h3 no skips; real `<ol>`/`<dl>`; sections `aria-labelledby` |
  | A11Y-9 | manual | descriptive `<title>`, `lang="en"` |
  | A11Y-10 | manual | skip link first in body, targets `#main` |
  | LAY-2 | unverified | fluid single column, no grid/fixed-width hazard; needs a rendered 320px capture |
  | LAY-4 / TYP-6 | manual | `--measure: 42rem` (~70ch at 17px), inside ≤80ch |
  | LAY-7 | manual | hero sole focal region; reading order matches task priority |
  | SLP-5 / SLP-11 | manual | no card chrome; ordered list + grouped `<dl>`s |
  | SLP-6 | manual | evaluator flagged unstyled `<h3>` (~1.07x step); FIXED — `.group h3` now 0.8rem eyebrow, 1.25x below body (mock.html:51) |
  | SLP-7 | manual | tiered spacing 2.5/2/1/.75/.6rem |
  | SLP-9 | script | `checks/content-lint.py` clean; manual read of all copy |
  | CMP-5 | manual | exactly one filled `<button>` (mock.html:110) |
  | CNT-2 / CNT-9 / CNT-12 | manual | plain command names, one-idea descriptions, sentence case |
  | TOK-1 | script | `checks/token-audit.py` 3 raw-grey hits — DEFERRED to #7 per approved plan |
  | COL-1/COL-2/TYP-1/TYP-2/TYP-3 | unverified | deferred to #7 (greyscale, system fonts, ad-hoc rem scale) |

- **Evaluator verdict (pasted verbatim from the `tfx:evaluator` agent):**

```
VERDICT: pass-with-findings

BLOCKING (must fix before ship):
- (none — no L0/L1 in-scope control failed with no waiver)

ADVISORY (should fix):
- SLP-6 (L2) — group headings <h3>Engineering (8)</h3> / <h3>Design (11)</h3>
  (mock.html:129, 143) carry no CSS rule, falling to the browser UA default
  (~19.9px) against the explicitly-styled h2 (1.25rem = 21.25px, mock.html:48)
  — a ~1.07x step, well under the 1.25x floor. Add an explicit h3 rule
  (e.g. ~1.1rem, bold, on-scale margin) so the catalogue's sub-grouping reads
  as a real step-down, not a browser accident.
- LAY-2 unresolved — the decision record itself flags this: no rendered
  capture exists in this environment. Treat the 320px reflow criterion as
  open, not passed, until a screenshot pass runs.
- TYP-3 (L1, found by checks/type-scan.py: 6 off-scale sizes — 17px, 32px,
  15.2px, at mock.html:29/47/57/80) is not named in the decision record's
  "Controls in scope" list nor its "Deferred to #7" list — it falls through a
  scope gap between the two. Given this is a raw-HTML throwaway with no
  Tailwind/token infrastructure at all (the same rationale used to defer
  TOK-1/TYP-1), recommend explicitly adding TYP-2/TYP-3 to the deferred list
  for consistency, rather than leaving them silently unscoped.

SUGGESTIONS (not violations — builder may take):
- Header "GitHub" link and footer "github.com/transformteamsg/atelier" link
  point to the same URL with different link text — harmless here (CNT-10 not
  in scope for this run) but worth aligning if/when the real header nav grows.
- Consider whether "Copy commands" should get visible confirmation feedback
  language noted now (even if unbuilt) so #7's CMP-3 states aren't an
  afterthought — not required here since CMP-3 is explicitly out of scope
  ("no async actions") for this throwaway artifact.

QUALITY GRADES:
- Design quality: acceptable — clear top-to-bottom narrative order matching
  the newcomer's task (understand → install → how it works → browse → find
  source), deliberate spacing tiers; held back one notch by the SLP-6 flat
  sub-heading step, which is exactly the kind of hierarchy slip the control
  exists to catch.
- Originality: strong — genuinely restrained for a landing page: no card
  grid, no gradient/glow, no forced triads in copy; the plain, unhyped skill
  descriptions are a real strength, not just an absence of lint hits.
- Craft: acceptable — careful on the a11y/semantic fundamentals (skip link,
  landmarks, focus states, contrast headroom well above floor) but the
  unstyled h3 is a genuine "was this deliberate or forgotten" craft gap.
- Functionality: acceptable — appropriate to a throwaway structure-lock
  artifact; "Copy commands" has no wired behaviour, which is expected and not
  a defect at this fidelity (no async/destructive flow exists to break).
- Dark mode: N/A — product/artifact has no dark mode (single greyscale
  mockup, confirmed no .dark layer or toggle in the markup or CSS).

UNCOVERED (defects no control covers — feed the ratchet):
- TYP-3 (L1, catalog-covered, script found 6 violations) sits in a scope gap:
  neither declared in-scope nor explicitly deferred in
  docs/decisions/landing.md, unlike TOK-1/TYP-1 which were. This isn't a
  finding against the artifact's design quality (the ad-hoc rem scale is
  internally coherent), but the decision record's scope-setting has a real
  gap here that should be closed before this pattern repeats on the next
  throwaway mockup.

[Full per-control ledger, script transcripts, and file:line evidence in the
verify-phase evaluator run; independently re-verified A11Y-1 contrast, ran
a11y-static/content-lint/token-audit/type-scan against the artifact.]
```

## Post-verdict fixes applied

- **SLP-6 (advisory) — FIXED.** Added `.group h3` rule (mock.html:51): 0.8rem bold
  muted eyebrow, a 1.25x step below body, so the group labels no longer sit near-equal
  to h2. Re-ran `a11y-static.py` and `content-lint.py` after the change — both clean.
- **TYP-3 scope gap — CLOSED.** TYP-2/TYP-3 added to the "Deferred to #7" list here and
  in `wireframe.md`, matching the TOK-1/TYP-1 rationale.
- **LAY-2 — still open.** Remains unverified pending a rendered 320px capture; carried
  forward, not claimed as passed.

## Ratchet

- **No new catalog control proposed** — nothing uncovered that a control does not already
  handle. SLP-6 caught the hierarchy slip (fixed); TYP-3 caught the off-scale sizes
  (deferred). Both worked as intended.
- **Harness friction to file via the `feedback` skill** (not control gaps):
  1. `implement-issue` Step 2 expects a literal `- [ ]` grooming-checklist block in the
     issue body, but the `create-issue`/`groom-issue` templates never emit one — the two
     skills disagree on the contract.
  2. `agent-browser` was not installed, so the verify phase could not capture the
     required width screenshots (LAY-2 left unverified). Onboarding/setup did not flag
     this before the design loop reached verify.
