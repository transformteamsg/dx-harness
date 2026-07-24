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

- **Screenshots:** CAPTURED after `agent-browser` was installed. Width evidence at
  `docs/landing/screenshots/{320,360,768,1280}.png` (full-page; each frame's
  `window.innerWidth` verified to match its filename before saving, per verify.md's
  stale-viewport caution). LAY-2 confirmed: the page reflows to a single column at
  320px with no page-level horizontal scroll and no loss of content.
  - **Finding for #7 (not a wireframe blocker):** at 320px the install command
    overflows the code block horizontally (`/plugin marketplace add trans…`). This is
    the allowed code-block `overflow-x:auto` exception (WCAG 1.4.10), so it does not
    fail LAY-2, but the real build should make the full command visible on mobile
    (wrap, smaller mono size, or split the two commands).
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
  | LAY-2 | manual | screenshots at 320/360/768/1280 (`docs/landing/screenshots/`) — reflows to one column, no page-level h-scroll; code block scrolls internally (allowed exception) |
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
- **LAY-2 — now VERIFIED.** `agent-browser` was installed after the run; screenshots
  captured at 320/360/768/1280 confirm a clean single-column reflow with no page-level
  horizontal scroll. One mobile finding (install command overflows the code block)
  logged for #7; not a wireframe blocker.

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

---

# Modification — 2026-07-24 — Install section: two install paths

> Scoped `tfx:design` modification loop (structure fixed → diverge skipped). Triggered
> by the README consolidation (PR #12): the README's Install section now documents a
> no-command-line **Claude Desktop / web** plugin flow alongside the Claude Code CLI
> commands, so the landing page's Install section was updated to match and re-verified.

- **Date:** 2026-07-24
- **Change type:** modification (install-section content + one CSS rule)
- **Run type:** attended

## Intent

Update the Install section to reflect the new README: keep the Claude Code CLI commands
and add the point-and-click Claude Desktop / web plugin path, so a non-technical visitor
sees they can install without a terminal.

## Sprint contract (done-criteria)

1. Install section keeps the Claude Code CLI commands AND adds the no-command-line
   Claude Desktop / web plugin path.
2. A non-technical visitor can see they can install without a terminal.
3. Standards floor held on the changed surface — no NEW violations vs the
   deferred-to-#7 baseline.
4. Exactly one primary action preserved (CMP-5).
5. No anti-slop introduced (SLP-5 / SLP-6 / SLP-11).

## Chosen approach

Two labelled paths inside the *same* Install section (no new section, no cards):

- **Claude Code** (`<h3>` eyebrow) — the existing two `/plugin` commands in a code block
  + the existing single filled **"Copy commands"** button (the one primary action).
- **Claude Desktop or web — no command line** (`<h3>` eyebrow) — a 3-step ordered list
  reusing the existing `ol.points` pattern: open **Customize → Plugins**; add a
  marketplace from the repository `transformteamsg/atelier`; install the **tfx** plugin.
- The shared "Then run any skill as `/tfx:…`" line moved to the end of the section.

CSS: the existing `.group h3` eyebrow rule was generalized to `.group h3, .path h3` so
the new sub-path labels share the styled eyebrow (0.8rem bold muted) rather than falling
to the UA default — avoiding the exact flat-`h3` slip caught at the baseline SLP-6
finding. Added `.path { margin: 0 0 1.5rem }`. No colours, fonts, or type sizes added.

Desktop-flow depth (concise 3-step vs one-line pointer vs full 5-step walkthrough) was
put to the user at the plan gate; **concise 3-step chosen** (the fuller numbered steps
live in the README).

## Controls in scope (changed surface)

CMP-5, SLP-5, SLP-11, SLP-6, A11Y-7, A11Y-1, A11Y-2, A11Y-4, CNT-2, SLP-9. Same fidelity
and deferrals as baseline (COL-1/COL-2, TOK-1, TYP-1/TYP-2/TYP-3 deferred to #7;
IDN + CaseSync N/A; CMP-2/CMP-3/A11Y-11 N/A — Copy button remains unwired).

## Tradeoffs, named

- The section is longer (two paths vs one). Accepted — serving non-code practitioners is
  the explicit goal, and stacked labelled paths keep 320px reflow trivial (no columns,
  no tabs).

## Plan approval

- **Approved by:** user (interactive Approve at the Phase 3 gate)
- **Approved on:** 2026-07-24

## Verify

- **Deterministic checks** (against `docs/landing/mock.html`):
  `a11y-static.py` clean; `content-lint.py` (SLP-9) clean; `token-audit.py` 3 raw `#fff`
  hits and `type-scan.py` TYP-1/2/3 hits — all on pre-existing lines, none introduced by
  this change, deferred to #7 per baseline.
- **Screenshots:** RE-CAPTURED at 320/360/768/1280 (`docs/landing/screenshots/`), each
  frame's `window.innerWidth` verified against its filename. LAY-2 confirmed: single-column
  reflow at 320px, no page-level horizontal scroll; the two install paths stack cleanly
  and the Desktop ordered list wraps. The install command still overflows the code block
  horizontally at 320px — the allowed `overflow-x:auto` exception (WCAG 1.4.10), same
  pre-existing finding logged for #7, not a blocker.
- **CMP-5:** exactly one filled button on the whole page (`Copy commands`, mock.html) —
  the Desktop path added no button.

- **Evaluator verdict (pasted verbatim from the `tfx:evaluator` agent):**

```
VERDICT: pass

BLOCKING (must fix before ship):
- (none — no in-scope L0/L1 control failed on the changed surface with no deferral/waiver on file)

ADVISORY (should fix):
- (none new introduced by this modification. For continuity: the shared eyebrow rule at
  `mock.html:51` — now generalized to `.group h3, .path h3` — renders the new sub-path
  labels at 0.8rem/12.8px, which `type-scan` flags TYP-2 (below the 14px body floor, L1)
  and TYP-3 (off-scale). This is the exact same eyebrow size already in use for the
  catalogue group labels and already recorded as DEFERRED to #7 in both
  docs/decisions/landing.md and docs/landing/wireframe.md. The modification reused an
  established, already-deferred size — it did not introduce a new off-scale value — so it
  does not breach contract criterion 3. Flagging only so #7 remembers these two new labels
  are now inside the TYP-2/TYP-3 deferral scope and must be resolved there too when the
  token/type infrastructure lands.)

SUGGESTIONS (not violations — layout/pattern improvements the builder may take):
- In #7, consider making the "Claude Code" and "Claude Desktop or web" eyebrows visually
  parallel to the catalogue group eyebrows they now share a rule with, so the reuse is
  intentional-looking rather than incidental — serves SLP-6 hierarchy legibility.
- The intro line and the trailing "Then run any skill as…" line now bracket two paths; a
  hair more vertical separation before the trailing line at 1280px would make it read as
  "applies to both paths" rather than trailing the Desktop steps — serves LAY-7 grouping.
  Minor.

QUALITY GRADES (scoped to the Install section as changed):
- Design quality: strong — the two labelled paths read in task order, the eyebrow labels
  create a genuine step-down, and "no command line" directly answers the non-technical
  visitor's question at the point of doubt; proximity/spacing groups each path without chrome.
- Originality: strong — restrained and correct: reused the existing `ol.points` and eyebrow
  patterns and grouped by spacing rather than inventing a card or a novel component; no SLP
  tells introduced.
- Craft: strong — deliberate reuse of established patterns, one CSS selector generalized
  cleanly, an on-scale `.path` spacing rule added, no new colours/fonts/sizes; the unwired
  Copy button is expected at this fidelity.
- Functionality: acceptable — at wireframe fidelity both paths fully communicate the install
  task with no dead ends; the Desktop path is instructional prose (no interactive step to
  break), and the Copy button remains intentionally unwired (CMP-3/A11Y-11 out of scope).
- Dark mode: N/A — product/artifact has no dark mode (single greyscale mockup, no `.dark`
  layer or toggle).

JUDGMENT CONTROL NOTES (one line per in-scope judgment/hybrid control):
- [CMP-5] pass — exactly one filled/primary button on the whole page: <button class="btn">
  Copy commands</button>; every other link is an <a> in body/muted ink, none filled. The
  added Desktop path introduced no button.
- [SLP-6] pass — new sub-path labels styled via `.path h3` at 0.8rem/12.8px = ~1.33x below
  17px body and ~1.66x below the 1.25rem h2; without this rule they would have fallen to the
  UA <h3> default (~19.9px, ~1.07x to h2), the exact flat-hierarchy slip caught at baseline —
  the change prevents it rather than reintroducing it.
- [SLP-5] pass — Desktop path is a real <ol class="points">; no icon-tile-above-heading
  template, no identical-card grid.
- [SLP-11] pass — the `.path` wrappers carry only margin, no border/shadow/radius/background;
  static content grouped by spacing + eyebrow type, not boxed as cards.
- [A11Y-7] pass — heading walk h1 (hero) → h2 "Install" → h3 "Claude Code" / h3 "Claude
  Desktop or web — no command line" with no skipped level; both new headings describe their
  content; list is a real <ol>.
- [A11Y-1] pass — no colours changed; new eyebrow uses --muted #595959 on white = ~7.0:1 (AA
  for 12.8px bold); a11y-static.py clean.
- [A11Y-2] pass — only interactive control on the surface is the Copy button (unchanged);
  global :focus-visible, no outline removal; no new focusable element added.
- [A11Y-4] pass — Copy button min-height: 44px meets the mobile target; no new targets added.
- [CNT-2] pass — new labels/steps are plain and function-named; "Customize"/"Plugins" mirror
  the actual Claude app labels; no portmanteaus or codenames.
- [SLP-9] pass — content-lint.py clean; the intro em-dash does real work (not a chain), no
  buzzwords, no forced triad, one idea per list line.

UNCOVERED (defects no control covers — feed the ratchet):
- (none — every defect surface here is covered by an in-scope control or by the documented
  #7 deferral. No new gap found in this scoped modification.)
```

## Ratchet (modification)

- **No new catalog control proposed** — the modification introduced no uncovered defect;
  every in-scope control passed and the only script hits are the documented #7 deferrals.
- **Carried forward to #7:** the two new install sub-path eyebrows join the existing
  TYP-2/TYP-3 deferral scope; the 320px code-block overflow finding still stands for the
  React build.
