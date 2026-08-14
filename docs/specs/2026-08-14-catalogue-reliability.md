# Control Catalogue Reliability — Spec

**Date:** 2026-08-14
**Status:** Locked — assembled from [wayfinder map #109](https://github.com/transformteamsg/dx-harness/issues/109)
**Owner:** Reza Ilmi

## Purpose

This spec makes the DX control catalogue and its judgment stack reliably produce good
design. It does three things:

1. Adds a **ceiling** above the catalogue — a calibrated design-quality artifact,
   `standards/quality-bar.md`, that says what good looks like once nothing is broken.
2. Decides the **accessibility check stack** — two named layers, static and rendered,
   built almost entirely from tools already on disk.
3. Resolves a **full triage** of every catalogue control whose label promised a script
   that was never written — 30 controls, dispositioned one by one.

Every decision below was resolved on a wayfinder ticket. This document is the single
hand-off for a separate implementation effort. Each section cites its source ticket. The
mark **(assembly)** shows a decision made or sharpened while this spec was assembled, as
the map planned.

**The thing this spec does not do:** it does not implement any of it. No catalogue edit,
no script, no schema change lands here. The prototype artifact on
`prototype/quality-bar-shape` is the only code-shaped output, and it carries a PROTOTYPE
banner until the implementation effort adopts it.

### The problem, stated once

The catalogue is a floor: **69 controls** saying what a surface must not break. Eleven of
them are "no X" anti-slop rules. A surface can pass all 69 and still be forgettable —
passing an anti-slop rule buys the absence of a mistake, not the presence of a decision.
The quality layer already existed twice, both verify-time only and both unanchored: the
reviewer's rubric §4 (four criteria, graded strong/acceptable/weak against nothing) and
`layout-patterns.md` (nine patterns, explicitly "guidance, not controls").

Separately, the floor itself had holes. **30 of the 69** are labelled as machine-checked
but have no script. The triage found that **11 of the 23 non-accessibility ones were
mislabelled** — the gap was not mostly an unwritten script, it was a label promising what
no script can deliver.

> **A count that moved mid-map.** The map baselines 70 controls (2026-08-13). IDN-4 was
> removed on 2026-08-14 (`890b9c3` — the only product-scoped control, retired to CaseSync's
> DESIGN.md under rule 5), so the catalogue is now **69**: 4 script / 18 partial / 30
> manual / 17 evaluator. **The triage set is unaffected** — IDN-4 was
> `judgment`/`evaluator`, not one of the 30 manual controls. 30 manual − 7 accessibility
> = 23, exactly as triaged. Where this spec and the map disagree on a total, this spec is
> current.

---

## Part I — The ceiling

## 1. Where the ceiling sits

([#109](https://github.com/transformteamsg/dx-harness/issues/109) charting,
[#110](https://github.com/transformteamsg/dx-harness/issues/110))

- **One sibling artifact** beside the catalogue: `plugins/dx-harness/standards/quality-bar.md`.
  Markdown with YAML frontmatter. Sibling to `catalog.yaml` and `layout-patterns.md`.
- **The ceiling sits outside `catalog.yaml`.** Authoring rule 4 (the catalogue grows only
  from observed failure) does not bind it. **No new controls enter the catalogue through
  this spec.**
- **Nothing here blocks.** A miss is evidence for a grade, never a finding. Anchors never
  enter `BLOCKING` or `ADVISORY`. If a miss is worth blocking on, that is rule-proposal
  evidence for a control — take it to `catalog.yaml` with the observed failure attached.
- **The name.** "Bar" carries the floor/ceiling idea and explains itself to a newcomer.
  `ceiling.md` is opaque; `design-quality.md` collides with the criterion of that name.

### Diagnosis this rests on

The four criteria are **unanchored**, not too few. The work is calibration, not expansion.
The harness anchors well by *prohibition* (`fails_when`, `Do not flag`, Deconfliction) and
badly by *positive target* — LAY-5 says outright "There is no fixed spacing metric; the
question is fit, not a number". Before this spec the harness had exactly **one**
paired-opposites table (`content/guidelines/voice-tone.mdx`), and it was for words, not
pixels. ([#111](https://github.com/transformteamsg/dx-harness/issues/111))

**No evidence run was done.** The harness was not first proven to pass weak design. The
ceiling rests on gap analysis, not a recorded failure. This was a deliberate charting
choice, recorded here so a later reader does not mistake it for an oversight.

## 2. The artifact — shape and schema

([#110](https://github.com/transformteamsg/dx-harness/issues/110))

**One file, not a split.** The catalogue splits into an index plus detail files because 70
controls cannot sit in context at once and the website renders the index raw. Four criteria
can. And the boundaries *are* the anchor — "dense but not cramped" only calibrates against
"calm but not empty", so splitting criteria into separate files breaks the thing that makes
them work.

**Frontmatter** carries the only machine-legible parts:

```yaml
artifact: quality-bar
version: "…"
updated: "…"
grades: [strong, acceptable, weak]
criteria: [design-quality, originality, craft, functionality]
registers:
  product:
    name: Teacher & School product surfaces
    default: true
  standards-site:
    name: The DX Design Standard website
```

**Criteria have slugs; anchors have no ids.** Citation is by quotation, exactly as CNT-14
cites the voice table. Giving anchors ids would make a ceiling finding read as a control
finding in a report — the one confusion this artifact exists to prevent.

**Each criterion is a fixed six-block shape** — Grades what / Procedure / Pairings /
By surface / Thresholds / Not this criterion's job. This is the control detail file's
six-part discipline reused, so the artifact reads as a sibling of the catalogue rather
than a new genre.

**Size and fallback.** ~530 lines today, ~5,100 words, read whole at every plan. If that
proves too heavy in practice, the documented fallback is this file as an index (pairings +
registers + grades) with procedures and thresholds moved to `quality/<criterion>.md`. Do
not take the fallback pre-emptively.

**Citation without links.** 23 of the 69 controls have no detail file, including SLP-5/6/7 and
TOK-2, all cited in the artifact. The artifact therefore cites by bare control id with no
link. Verified: all 13 control ids cited in the prototype resolve in `catalog.yaml`.

### `validate.py` checks three things, and never the prose

1. Every control id cited in `quality-bar.md` resolves in `catalog.yaml`.
2. Every register id named in a `DESIGN.md` exists in `quality-bar.md`.
3. The reviewer's rubric §4 stub names the same four slugs the artifact declares.

Schema-validating the prose would turn the ceiling into a controls file by the back door.
Check 1 costs one line — add `standards/quality-bar.md` to `cross_ref_files` at
`checks/validate.py:838`. **`standards/layout-patterns.md` is missing from that list today
too; add it in the same edit.** Check 3 costs no new code — see §6. Check 2 needs new code.

## 3. The four criteria and their anchors

([#112](https://github.com/transformteamsg/dx-harness/issues/112))

**The scale survives.** Strong / acceptable / weak stays, with three guards:

- **Acceptable is the expected result.** Said out loud in the file, so a run of
  "acceptable" does not read as failure.
- **The three-strong drift self-check.** Three strongs in one grading is a signal the
  grader has drifted, not that the surface is excellent.
- **Every grade quotes the pairing or threshold that decided it.** A grade with no quoted
  anchor is unfinished.

Counted checklist bands were rejected: counting misses turns the ceiling into a second
controls file.

**One context axis for all four criteria** — the same six surface types everywhere: data
entry, scanning, reading, decision, empty state, overview. Per-criterion axes were
rejected; frequency and flow detail live in each criterion's thresholds instead.

| Criterion | Procedure | What its thresholds carry |
|---|---|---|
| **design-quality** | The layout read, moved in from `layout-patterns.md` | Six pairings, six surface rows, seven thresholds; running text never centred |
| **originality** | Self-similarity test · unchanged-product test · remove-one pass | Kicker labels, the ghost card, pulse-on-static-data, unearned numbered markers, and the two AI looks SLP-1 misses (cream+serif+terracotta; broadsheet hairlines) |
| **craft** | Browser-surfaces pass · 10% motion replay · full state walk · edge-content pass | Motion restraint by interaction frequency, interruptibility, icon-stroke-to-text-weight, the 40×40 dense-desktop hit floor, text-wrap |
| **functionality** | Flow-map walk · repeat-user (fortieth-entry) pass · failure walk · one persona lens (the relief teacher) | Submit disabled while pending, undo preferred over confirmation where recovery is safe, a designed state per failure class, keyboard accelerators for per-row tasks |

**Boundary rule.** A ceiling threshold may sit *tighter* than a control's number — 40×40
over A11Y-4's 24×24, 150–250ms inside MOT-1's 100–300ms band. The tighter number is grade
evidence only, never a finding, and the row must name the control it tightens.

**Dark mode** is a global condition beside the Grades section, not a fifth criterion and
not a note under Craft. It conditions all four criteria, and the planning agent must see it
at plan time. Grade only when a dark frame was captured; `N/A` is a truthful outcome.
([#114](https://github.com/transformteamsg/dx-harness/issues/114))

### Register-filtering is mandatory on every import

The inspiration research imported anchors from three external skills. Filtering them
against this portfolio's register is not optional: `impeccable`'s `overused-font` rule
flags Inter and Plus Jakarta Sans — the exact two typefaces TYP-1 chose on purpose.
Rejected on the record and listed so a later import does not re-litigate them:
hero-as-thesis, signature elements, the concept roll, overdrive, onboarding tours,
delight/celebration, Nielsen's ten wholesale, press-scale and staggered entrances, font
smoothing, the 60-second task budget.
([#111](https://github.com/transformteamsg/dx-harness/issues/111))

## 4. Registers and how DESIGN.md selects one

([#113](https://github.com/transformteamsg/dx-harness/issues/113))

**Two registers, growing only on evidence.** `product` (default — Teacher Workspace,
CaseSync, Glow) and `standards-site`. A new register enters only when a real surface exists
that neither fits.

A correction the ticket forced: **Glow is a teacher tool**, not a student surface —
`content/products/glow.mdx` defines it as "the encouragement layer … in a teacher's day".
No student surface exists in the portfolio today. Glow's warmth and CaseSync's restraint
are per-product nuance carried by DESIGN.md Essence/Voice, which the reviewer reads beside
the quality bar. An audience-based register list (mirroring `catalog.yaml`'s
declared-but-unused `audiences:` axis) was rejected as speculation.

**What a register varies: context rows and thresholds, never pairings.** The
We-are / We-are-not pairings are the portfolio's shared vocabulary and are
register-invariant. A register note is opt-in per anchor, written inline as
`[standards-site: …]`; absent means global, never an empty list. A register that seems to
need different pairings is evidence the criterion's prose is wrong.

**Selection.** DESIGN.md declares at most **one** register per product repo, in a
`## Quality bar` section (json key `quality_bar`), as one bullet:

```markdown
## Quality bar

- register: standards-site
```

No declaration — section absent or whole file absent — selects the default. Within-product
variety is what the six By-surface rows already handle.

**No ceiling overrides.** DESIGN.md gets no override grammar for the ceiling. It never
blocks, so there is nothing to waive. A conflict that recurs between a product and an
anchor is evidence to change `quality-bar.md` itself.

**Rule 5 reading.** Consistent by construction: registers are declared once in the
portfolio-wide artifact and *selected* in DESIGN.md — the ceiling's analogue of rule 5's
"nuance calibration, never separate rules". No per-product ceilings exist.

**Terminology.** The word *register* stays despite colliding with IDN-3's *tone register*.
`CONTEXT.md` carries a **Register** entry separating the two senses (surface class vs
product voice), and the `## Quality bar` section name keeps the DESIGN.md declaration
unambiguous.

**Implementation work items:** `docs/templates/DESIGN.md` gains the `## Quality bar`
section; `DESIGN-CONTEXT.md` gains its guiding question; `generate-design-json.py` emits
the `quality_bar` key.

## 5. The folds — `layout-patterns.md` and reviewer rubric §4

([#114](https://github.com/transformteamsg/dx-harness/issues/114))

### `layout-patterns.md`

| Part | Disposition |
|---|---|
| Header ("guidance, not controls; control wins") | **Stays** in the slimmed file |
| Register framing paragraph | **Dropped** — superseded by the quality bar's Registers section; the header points there instead |
| The eight numbered principles | **Dropped, absorbed** — each maps to a quality-bar pairing, procedure step, or control (LAY-7, SLP-4, SLP-7, LAY-4, LAY-6) |
| Principle 5's residue ("avoid centred running text") | **Swept into the quality bar** as a Design quality threshold |
| "Reading a screenshot" mini-procedure | **Already moved** into the quality bar, per-criterion — delete from this file |
| Named patterns (list vs cards, master-detail, wizard, empty-state) | **Stay** |

**The file survives, slimmed to the named patterns, under its own name.** This matches
`CONTEXT.md`'s pattern-inventory definition exactly. Folding it in was rejected on two
grounds: ~55 more lines read whole at every plan, and swap guidance produces *findings*,
which cannot live in a file that never blocks.

### Reviewer rubric §4 (`agents/dx-design-review.md`, line 190)

| Part | Disposition |
|---|---|
| The four criterion bullets | **Replaced by the quality bar** |
| HIG framing (Simplicity / Delight / Craft / Agency tags) | **Dropped** — Agency is absorbed by the escapable-flow anchors, Delight by "character only where idle" |
| Kind Utility line | **Dropped from the reviewer** — it arrives through DESIGN.md's Essence, read beside the quality bar |
| Semantic-colour carve-out | **Folded in** as an Originality threshold row naming COL-2 and SLP-1, so the planning agent sees it too |
| Dark-mode bullet | **Global condition beside the Grades section** (§3) |

**What remains in the agent:** a 5–8 line stub. It names the four criterion slugs, points
at `standards/quality-bar.md`, and requires each grade to quote its anchor. Nothing
restated.

### Reference updates

Five files point at `layout-patterns.md` today. After the fold:

- `dx-critique` step 2's layout read → the quality bar's Design quality procedure.
- LAY-7's detail file → the quality bar's Design quality procedure.
- **`dx-critique`'s "layout-patterns.md #4" example citation must be rewritten** — the
  numbered principles no longer exist.
- `dx-layout` and `dx-design` split their pointer: named patterns stay in
  `layout-patterns.md`, the layout read moves to the quality bar.

## 6. Wiring into plan and verify

([#115](https://github.com/transformteamsg/dx-harness/issues/115))

### Who loads it, when

| Reader | Loads | When |
|---|---|---|
| `dx-design-execute` (builder) | The whole file | **Before diverge** — directions are where a strong decision is born; plan time is too late to shape them. The scoped modification loop reads the whole file too: one rule, no judgment call about change size |
| `dx-critique` | The whole file | Reads it and **grades the four criteria** in its report |
| `dx-layout` | design-quality | Its pass |
| `dx-polish` | craft | Its pass |
| `dx-motion` | craft | Its pass |
| `dx-flow` | functionality | Its pass |
| `dx-copy` | none | The voice table already calibrates copy |
| `dx-design-language` | The register list | To offer and write DESIGN.md's `## Quality bar` section |
| `dx-design-review` | The whole file | Grades at verify |

Any pass may quote any anchor as **finding evidence**, never as a violation. `dx-start` is
untouched.

### What the human sees

- **At plan approval:** the plan summary table gains **one row** — the register in effect
  plus the one decision this surface makes that should read as strong. No predicted grades;
  grading unbuilt work is fake.
- **At verify:** `QUALITY GRADES` becomes a **four-line block** — one line per criterion
  slug, the grade plus one sentence quoting its anchor — under a header line naming the
  register in effect and the dark-mode condition (graded / N/A). `dx-critique` reuses the
  same block, so both graded surfaces stay in one format.

### Keeping copies honest

- The rubric §4 stub's slug list sits in a **`dx-sync` fence**. The existing fence-parity
  mechanism in `validate.py` enforces it — this discharges structural check 3 (§2) with no
  new code. Precedent: `voice-tone.mdx`'s calibration tables use the same mechanism.
- `quality-bar.md` and `layout-patterns.md` join `validate.py`'s `cross_ref_files`.
- `implement-craft.md` survives as the build-time how-to and gains **one pointer line** to
  the Craft criterion. No fold.

### The register at run time

- A DESIGN.md register id that resolves to nothing → **fall back to the default register
  and flag the drift** to the human. `validate.py` still fails the structural check where
  it can see the DESIGN.md. No blocking stop — the ceiling never blocks.
- The builder resolves the register **once** and passes it to the reviewer **in the
  dispatch payload**. The reviewer never re-resolves it, so builder and reviewer cannot
  resolve a bad id differently.

---

## Part II — The floor

## 7. The accessibility check stack

([#117](https://github.com/transformteamsg/dx-harness/issues/117), grounded in
[#116](https://github.com/transformteamsg/dx-harness/issues/116))

**A premise correction that changed the question.** `axe-core@4.12.1` and
`eslint-plugin-jsx-a11y@6.10.2` are **already installed**, transitively via
`eslint-config-next@15.5.19`; `playwright@1.61.1` too. Only `pa11y` is genuinely absent.
But `eslint-config-next` switches on only **6 of jsx-a11y's 39 rules**, all as warnings —
and the rules covering A11Y-2 and A11Y-3 are among the ones switched off. The question was
never what to install. It was what to switch on, and whether to take a rendered tier.

**The structural finding.** Of 11 A11Y controls, only **A11Y-5** is fully decidable on
source. Five need a rendered DOM outright and three more need rendering plus interaction.
A source-only scanner honestly covers ~1.5 of 11 — so the 497-line `a11y-static.py` was
checking things it cannot see.

### Two layers, named

Both "tier" and "pass" were taken (catalogue tiers are L0/L1/L2; a Pass is a dimension
review skill), so the layers are named **static check** and **rendered check**. Terms are
in `CONTEXT.md` at `b0c8c5a`.

**Static check** — always runs, nothing installed in the target repo:

- eslint with jsx-a11y's **`recommended` preset** (31 rules), run from a harness-side
  config with `--no-config-lookup`, CWD set to the target root. Chosen over all-39 because
  the maintainers' preset encodes real ARIA exceptions — measured on this repo: 1 finding
  vs 8, of which 5 came from rules the maintainers disable on purpose.
- **`a11y-static.py` narrows to the FOCUS rule only.** The KBD and NAME rules are deleted —
  jsx-a11y does both on a real AST with maintained exception tables. FOCUS stays bespoke
  because **0 of axe's 105 rules check for a visible focus indicator**. Its known
  false-positive class (CSS it cannot see) is accepted.
- **`contrast.py`'s ERROR path is deleted** — provably wrong. It has no alpha, opacity, or
  compositing handling anywhere in the file, and its only finding on this repo compared
  `#ce2c31` to itself. It is **rebuilt as a token-pair check**: do the design system's
  declared fg/bg token combinations pass AA? Static, true, and something axe cannot answer.

**Rendered check** — runs when a page is open:

- axe via `@axe-core/playwright` on **the page the verify browser already has open**.
  Standalone runs (`dx-critique`, re-audit) ask the person for a URL.
- **The harness never boots the target app.** No dev server, no static export, no jsdom.
- Shape: `target-size` explicitly enabled (axe ships it off; Lighthouse re-enables it); run
  at **360 and 1280**; page **fully scrolled** (axe skips `outsideViewport`); **once per
  supported theme** (dark mode uses verify's existing detection; N/A stays truthful); plus
  **one `prefers-reduced-motion` emulation** checking non-essential animation stops — this
  covers A11Y-5, which no surveyed tool checks.
- axe `incomplete` results become a **third bucket** beside violations and passes. They
  feed the manual accessibility pass as named items to verify by hand — never dropped,
  never gated on. Mirrors the existing NOTE channel.

### Mapping and fallback

**One mapping file in the harness**: each axe / jsx-a11y rule → one A11Y control id.
Findings print in the existing `ERROR <file>:<line> [<CTL>]` contract.

**A layer that did not run sends its controls to manual verification.** A control never
silently passes, and **L0 still blocks until verified by some path.** This fallback rule is
reused verbatim by the triage (§8).

### Coverage, per control

| Control | Static check | Rendered check | Stays manual / evaluator |
|---|---|---|---|
| A11Y-1 contrast (L0) | token-pair check | axe `color-contrast`, both themes | `incomplete` bucket items |
| A11Y-2 keyboard + focus (L0) | jsx-a11y `click-events-have-key-events`, `no-static-element-interactions`, `interactive-supports-focus`; bespoke FOCUS rule | — (no focus-indicator rule exists) | traversal order |
| A11Y-3 labels (L0) | jsx-a11y `label-has-associated-control` | axe `label` | cross-file `htmlFor`↔`id` |
| A11Y-4 target size | — | axe `target-size` (enabled) | 44px-on-mobile judgment |
| A11Y-5 reduced motion | — | reduced-motion emulation | none — candidate for `enforced: script` |
| A11Y-6 text alternatives | jsx-a11y `alt-text` | axe `image-alt`, `svg-img-alt` | informative-vs-decorative judgment |
| A11Y-7 semantic structure | — | axe `list`, `listitem`, `heading-order` + the `structure` check | descriptive headings/labels |
| A11Y-8 name/role/value | jsx-a11y aria rules | axe aria suite, visible components only | closed overlays + state changes |
| A11Y-9 title + lang | — | axe `document-title`, `html-has-lang` | SPA per-view title updates |
| A11Y-10 bypass blocks | — | axe `bypass` (report-only) | skip-link-first confirmation |
| A11Y-11 async announced | — | — | fully evaluator/manual (needs interaction) |

### Labels

Honest recount; **most stay `partial`**. `enforced: script` only when the check fully
decides the control with no manual remainder. A11Y-5 can reach `script`. **No label
upgrades for coverage that depends on a URL being available.** `script:` fields update to
the new checks.

### Declined, on the record

- **App-boot layer (a third tier)** — declined. A11Y-8 and A11Y-11's interaction halves
  stay with the evaluator.
- **IBM equal-access** — deferred. The only tool with focus-visibility, target-spacing and
  form-group rules; revisit if the manual pass keeps finding what it would catch.
- **stylelint-a11y** — declined for the FOCUS rule's CSS half. The false-positive class is
  accepted instead of a new dependency.

## 8. The triage rubric and the `gap:` field

([#118](https://github.com/transformteamsg/dx-harness/issues/118))

### Scope correction

The map's "30 unscripted **deterministic** controls" was never true. The 30 manual controls
are **18 `deterministic` + 12 `hybrid`** whose script half was never built. `enforced:` is
written explicitly only 23 times in `catalog.yaml` (18 `partial`, 4 `script`, and MOT-2);
everything else takes the default. Minus the 7 A11Y controls dispositioned by §7, the
triage set is **23 = 13 deterministic + 10 hybrid**.

For a hybrid control, "build" means **the script half only** — the judgment half already
belongs to the design reviewer by design, not as a gap.

**MOT-2 rides along** (`status: proposed`) with a ratification caveat: its script ships only
once the control is ratified.

**Existing "planned script" notes in detail files count for nothing.** Every call was made
fresh, and the triage outcome replaces every planned note — with a real build item, or with
a `gap:` reason and the note deleted.

### The rubric — applied per control, in this order

1. **Is the label honest?** Could a script decide the whole claim (authoring rule 1)? No
   part mechanical → relabel to `judgment`; only part mechanical → relabel to `hybrid`.
   Then triage only what is mechanical. **The triage relabels directly** — a relabel is a
   correction, not a new rule, so no per-change design-lead sign-off. The rule-proposal
   process stays for new controls only.
2. **Which layer decides it?** Source files suffice → **static check**. Needs the open page
   → **rendered check**, under §7's rule: it runs against the page verify already has open,
   and a layer that did not run falls back to manual — never a silent pass.
3. **Would it cry wolf?** A check that would flag good work often is narrowed to the sure
   cases — the curated low-false-positive convention `checks/README.md` already names — or
   the gap is accepted. **A check never blocks on a guess.**
4. **Worth building?** Small script + real blast radius → build. Big script + rare L2
   failure → accept the gap, with a reason.

**Backstop: L0 never accepts a gap.** A non-waivable floor nobody checks by machine is a
promise, not a floor. This forced CMP-2's candidate-lister to be built (§9.2).

### The `gap:` field — a schema change

`enforced: manual` stays legal **only with a reason**. A new one-line `gap:` field in
`catalog.yaml` records why no script exists. The validator flags any `deterministic` or
`hybrid` control that is effectively manual — the `enforced:` default included — with no
`gap:`.

Implementation touches: `standards/schema.json` (declare the field);
`checks/validate.py` (the new rule; `FRONTMATTER_FIELDS` at `:51` if detail-file parity
should cover it). **Verified during assembly:** `catalog.yaml` has no unknown-key
rejection, so adding `gap:` breaks nothing that exists today.

### The rubric outlives the triage

`standards/README.md` gains a short authoring rule: **a new `deterministic` or `hybrid`
control arrives with a script, a `gap:` reason, or an honest relabel.** The validator backs
it, so the drift this triage cleans up cannot silently regrow.

`CONTEXT.md` gains the **Accepted gap** term (landed at `31d18df`).

## 9. Triage outcomes — all 23 controls

Every call below was proposed by the agent in one table and confirmed by the human in one
round. Every narrowing exists because a proposed detector was tested against this repo's
real code and found to misfire.

**Totals: 16 build · 4 relabel to `judgment` · 3 accept.** 11 of the 23 were mislabelled.

### 9.1 The SLP cluster ([#138](https://github.com/transformteamsg/dx-harness/issues/138))

| Control | Tier | Call | Layer | Narrowing |
|---|---|---|---|---|
| SLP-1 | L1 | relabel→hybrid + build | static | hue band **≥255°** only; ≥2 gradient stops both in band; "glow" = blur ≥6px AND offset ≤2px AND saturated; cyan-on-dark only when a dark token block sets both |
| SLP-2 | L1 | build | static | require a transparent fill alongside the clip; **never match `bg-clip-padding`** |
| SLP-3 | L1 | build | static | one side ≥3px AND radius >0 AND remaining sides 0/absent, element-local; `coverage: partial` |
| SLP-4 | L1 | build | **rendered** | flag only when the inner card's computed background differs from the outer's; static same-file AST pre-pass as fallback; `coverage: partial` |
| SLP-5 | L2 | **relabel→judgment** | — | — |
| SLP-6 | L2 | relabel→hybrid + build | **rendered** | flat case only — adjacent ramp steps <1.10x or identical; the 1.10–1.25 band goes to the evaluator |
| SLP-7 | L2 | **relabel→judgment** | — | — |
| SLP-8 | L1 | build | static | spring configs without an explicit `bounce`/`damping` emit `NOTE … verify manually`, not `ERROR` |

**Why the numbers are what they are.** SLP-1's hue band opens at 255° because `--casesync`
#3e63dd sits at 226° and `--sec-getting-started` iris-9 #5b5bd6 at **exactly 240°** — a band
opening at 240 flags the site's own section ink, which `globals.css:52` documents as
deliberately purple-avoiding. **255° is the design lead's ruling (assembly, 2026-08-14)**,
chosen over 250° and 260° for 15° of clearance. The blur floor exists because
`components/ui/sidebar.tsx:484` is a hairline ring, not a glow. SLP-2 needs an AST rule
rather than a line regex: `components/ui/button.tsx:7` carries `bg-clip-padding` (a
substring match fires wrongly) and `components/compare.tsx:65` puts `className` and the
gradient `style` on different lines (a line-local rule misses the true positive). SLP-3's
pair requirement correctly clears both near-misses here.

**Why SLP-5 and SLP-7 are not deterministic.** SLP-5's mechanical proxy fires equally on
`compare.tsx:87` (the deliberate slop exhibit) and on `foundations/icon-set.tsx:41` and
`section-index.tsx:33` (legitimate galleries) — rubric step 3 has no sure case to narrow
to. SLP-7 needs a relatedness model no script has. Both are structurally identical to
LAY-3/LAY-5/LAY-7, which the catalogue already labels `judgment`.

**Root cause.** All eight were adopted wholesale from the site seed catalogue on 2026-06-11
and stamped `deterministic` without the authoring-rule-1 test. SLP-9/10/11, added after
that consolidation, are correctly `hybrid`/`judgment`. The mislabel is an artefact of the
import, not of the ideas.

### 9.2 The CMP cluster ([#139](https://github.com/transformteamsg/dx-harness/issues/139))

| Control | Tier | Call | Layer | Narrowing |
|---|---|---|---|---|
| CMP-2 | **L0** | build (candidate-lister) | static | handler-shaped destructive identifiers only; hard denylist for DOM/collection APIs |
| CMP-3 | L1 | build | static | only "async call in a file with no error path at all"; visibility, loading and success halves stay evaluator |
| CMP-4 | L1 | **relabel→judgment** | — | — |
| CMP-5 | L2 | **accept** | — | — |
| CMP-6 | L2 | build (inside the A11Y-7 `structure` check) | rendered | `<table>`/`role="table"` with no `<th>`/`columnheader` only; alignment and tabular figures never guessed |
| CMP-8 | L1 | **relabel→judgment** | — | — |
| CMP-9 | L1 | build | static | render-sink token with no sanitiser identifier in the same file → ERROR; sanitiser present → NOTE, never a silent pass |

**CMP-2's lister enumerates and never judges.** It emits one `NOTE <file>:<line> [CMP-2]`
per candidate — a handler-shaped destructive identifier (`handleDelete`, `onDelete=`, a
server action or `useMutation` named destructively, `fetch(…, {method: "DELETE"})`) — plus
a same-file scan for a confirm/undo companion (`AlertDialog`, `confirm`, `undo`, `Dialog` +
a destructive-variant button), so each line reads "candidate, companion found / not found".

Drowning is prevented by a **hard denylist applied before anything is emitted**:
`removeEventListener`, `removeChild`, `.remove()` on a DOM ref, `clearTimeout`/
`clearInterval`, `Map`/`Set` `.delete()`, `revokeObjectURL`, `reset()` on a form. Not
theoretical: a naive `delete|remove|archive|discard|revoke` grep over `app components lib`
returns exactly 5 hits here, all `window.removeEventListener`; the denylist takes it to 0 —
the correct answer for a docs site with no destructive actions.

**Ruling: the lister exits 0 and forces ledger disposition.** Each candidate is written into
the reviewer's verification ledger — the `| Control | Method | Evidence |` table
`audit-record.py` already enforces — and must be dispositioned **by name**. No blanket
"verified manually" covers them. The reviewer still judges; the lister's job is to make sure
nothing is silently skipped. **This is what L0 blocking means for a control whose script
half only lists.**

**Why CMP-4 and CMP-8 have no mechanical half.** CMP-4's fail condition is *co-presence* — a
skeleton visible **while** the empty-state heading is visible — and its own "Do not flag"
list exempts a skeleton that renders and is gone before the heading. Source can only prove
both patterns exist in one file, which is exactly what a correct empty state looks like, so
a static rule flags every good implementation. A rendered check adds nothing either: the
harness cannot drive a surface into its empty state, and when the reviewer *is* looking at
one they already have the screenshot. CMP-8's clause 2 (work survives interruption) is
runtime-behavioural; clause 1 depends on a flow map only the reviewer produces, and a dialog
with no Cancel-labelled child is not a fail because Escape and the close button both count —
Base UI's Dialog ships one.

**Why CMP-3 narrows so hard.** Proving a state is *visible* means tracing a state variable
into JSX and across components — the cross-file mutation tracking `a11y-static.py:192`
already declared out of reach. This repo's one async surface proves the danger:
`components/page-actions.tsx` keeps `busy`, sets it, and never renders it, so there is no
visible loading state — yet a naive "three states exist" matcher would false-pass on the
`"idle" | "copied" | "error"` union sitting beside it.

**Why CMP-5 is accepted.** Counting is buildable — ast-grep 0.44.1 is installed and matches
multiline JSX, which matters because all three `<Button>` usages here span lines. The
denominator kills it: "a view" has no source marker, dialogs and toolbars each own a
primary, and `variant="default"` is filled *and* the default, so a bare `<Button>` counts.
Big script, L2, and the boundary the count depends on is explicitly the evaluator's half.

```yaml
gap: "No script: the primary-button count depends on view/region boundaries that source
      does not mark, and the boundary call is the evaluator's half of this control."
```

### 9.3 The IDN / LAY / MOT / TYP tail ([#140](https://github.com/transformteamsg/dx-harness/issues/140))

| Control | Tier | Call | Layer | Narrowing |
|---|---|---|---|---|
| IDN-1 | L1 | relabel→hybrid + build | static | resolve `src`/import paths in logo-bearing components against the declared set; **N/A when no registry is declared**; never flag a bare inline `<svg>`, only one inside a `*Logo*`/`*Lockup*`-named component |
| IDN-2 | L1 | relabel→hybrid + build | static | same script, same N/A gate; scoped to the **product-icon family only**, so `lucide-react` imports are never candidates; container-colour, gloss and wordmark clauses stay evaluator |
| LAY-1 | L2 | **accept** | — | — |
| LAY-4 | L2 | relabel→hybrid + build | static | judge only `ch` caps **already present** against the 80ch ceiling; never flag a missing cap |
| MOT-1 | L2 | relabel→hybrid + build | static | duration/easing half only; fire on `transition-all` and durations outside 100–300ms; vendored `components/ui/*` handled by `detector.ignoreFiles`, not by the rule |
| MOT-2 | L2 | relabel→hybrid + build | static | fire only where a `--motion-*` set exists; exempt the `:root` definition block, the declared code mirror `lib/motion.ts` + its drift test, and display copy naming a token value |
| TYP-5 | L2 | **accept** | — | — |
| TYP-6 | L2 | build | static | same rule body as LAY-4, second threshold; sub-45ch values are headings and labels, never flagged |

```yaml
# LAY-1
gap: "no product has yet declared a .dx/design.json layout_system, so the check would
      grade N/A everywhere it ran."
# TYP-5
gap: "which figures align in a column or update in place is a rendered-content property;
      a source scan can only flag every table cell, which cries wolf."
```

**The approved-asset registry does not exist anywhere** — not in `.dx/design.json` (whose
ten keys are `essence, colour, typography, tokens, tone, motion, layout_system, components,
guardrails, overrides`), not in the DESIGN.md template, not in `standards/`, not as any
allowlist file. IDN-1 and IDN-2 have no detail files, and `validate.py:587` already
grandfathers IDN-1 as "planned but unbuilt". Rather than accept the gap, the check is
**built now and grades N/A until a product declares a registry** — the honest-inert pattern
CMP-1 uses with `coverage: "complete"`. The gap closes the day someone declares one, with
no further triage. Registry ownership and shape: see §11.

**Why LAY-1 is accepted.** Its label was already honestly hybrid, so this is a pure
step-3/step-4 call. With a declared 12-column grid, this repo's fourteen ad-hoc
`grid-cols-3`/`-2`/`-4` uses are legitimate subdivisions a column-count matcher would flag
as violations. And a new ~200-line `layout-scan.py` would serve an L2 control that grades
N/A in every repo that exists — **no `.dx/design.json` exists anywhere**, including the
harness's own site.

**Why TYP-5 is accepted but TYP-6 is built.** Both are hybrid already. TYP-5's mechanical
half is *presence-requiring*, and a presence-requiring rule only works once the subject is
identified — which is the judgment half. Statically it either flags every `<td>` or proves
nothing. The real finding confirms it: `.prose td` sets no tabular figures, so sixteen MDX
files' numeric tables render proportional — visible on the page, invisible to a source scan
of `.tsx`. TYP-6 is deliberately **not** presence-requiring: it is a *disallow* rule over
caps already written, which is expressible. (This also distinguishes it from the scanner
research's verdict that TYP-5/6 "stay manual" — that was about stylelint, which has no
presence-requiring rule.)

**MOT-2's ratification is a prerequisite, not a follow-up.** The control is
`status: proposed`. The script ships only once the design lead ratifies it; the harness must
not enforce an unratified rule. Two of its three `fails_when` clauses are grep-able (raw
literal; animates-without-a-token-set); the third (narrative tier on task UI) needs the
surface class, hence the relabel.

**Calibration evidence:** all fourteen bare `duration-N` uses here sit in band and
`transition-all` fires exactly twice, both in vendored shadcn files (MOT-1).
`.prose { max-width: 70ch }` plus 25 `ch` caps, all ≤70 (LAY-4).

## 10. The build list

The 16 builds collapse to **7 build targets**, of which two need the rendered runner.

| # | Target | Controls | Layer | Notes |
|---|---|---|---|---|
| 1 | `checks/slop-scan.py` **(new)** | SLP-1, SLP-2, SLP-3 | static | Shares the gradient parser and colour resolver; **reuse `contrast.py`'s `var()`/`color-mix` resolver verbatim.** `checks/README.md:335` plans this script as SLP-1..4 — SLP-4 splits out to the rendered runner (§11) |
| 2 | `checks/motion-scan.py` **(new)** | MOT-1, MOT-2, SLP-8 | static | One walk, one file set, one exemption path. **Reuses `token-audit.py`'s exemption machinery** — splitting MOT-1 and MOT-2 would duplicate it twice. MOT-2's rule ships only after ratification |
| 3 | `checks/cmp-scan.py` **(new)** | CMP-2, CMP-3, CMP-9 | static | ~210 lines on `checklib.py`. All three are "find token X in a file, look for companion token Y in the same file" — structurally identical to `a11y-static.py`'s FOCUS/KBD/NAME rules |
| 4 | `checks/identity-scan.py` **(new)** | IDN-1, IDN-2 | static | Already named as planned `identity` at `checks/README.md:334`. Ships inert until a registry is declared |
| 5 | `checks/type-scan.py` **(extend `VALID_RULES`)** | LAY-4, TYP-6 | static | One rule body, two thresholds. Not a new script |
| 6 | Rendered runner — nested-card rule | SLP-4 | rendered | Static same-file AST pre-pass as fallback |
| 7 | Rendered runner — type-ramp rule | SLP-6 | rendered | Flat case only |

**Plus, from §7 (the accessibility stack):**

| Target | Controls |
|---|---|
| Harness-side eslint + jsx-a11y `recommended` config | A11Y-2, A11Y-3, A11Y-6, A11Y-8 (static halves) |
| `a11y-static.py` narrowed to FOCUS | A11Y-2 |
| `contrast.py` rebuilt as a token-pair check | A11Y-1 |
| **The rendered runner itself** (`@axe-core/playwright`) | A11Y-1/3/4/6/7/8/9/10 + reduced-motion for A11Y-5 |
| The `structure` check inside the rendered runner | **A11Y-7 and CMP-6**, under two control ids |
| The rule → control-id mapping file | all |

**One rendered runner serves three clusters** — accessibility (§7), anti-slop (SLP-4) and
typography (SLP-6). This is why the rendered check pays for itself: the verify phase already
opens a browser at the target viewport, so running against it is close to free.

**All new rules ride ast-grep**, per the scanner research §5.4: `kind: string_fragment`
reaches `className` values, `style={{}}` objects and template literals from harness-held
rules with **nothing installed in the target repo** — preserving the constraint `detect.py`
depends on.

## 11. Catalogue corrections and documentation fixes

These are not triage calls. They are errors the triage surfaced, and each is a required
edit in the implementation effort.

| Fix | Where | Why |
|---|---|---|
| **SLP-6's threshold drops from 1.25x to 1.10x** | `catalog.yaml` | As written it **contradicts TYP-3**, which mandates Tailwind's default scale — whose adjacent steps include 1.20x and 1.125x. This repo proves it: `.prose` runs 30/24/20/16px and h2→h3 is 1.20x. No page could pass both controls. 1.10x matches what SLP-6's own `fails_when` describes ("heading/subheading/body at nearly the same size") and matches the narrowed build |
| **Delete the false CMP-7 precedent citations** | `controls/cmp-4.md:69`, `controls/cmp-8.md:107` | Both cite "the deterministic override-detection precedent CMP-7 set". Verified: `validate.py --coverage` reports `CMP-7 · L2 · judgment · evaluator (default) · —`. **CMP-7 has no script and never did.** Its detail file says override-detection is "planned once the CMP-1 component manifest is wired". The real analogue is `checks/component-manifest.py`. CMP-7 itself needs no triage — `judgment`/`evaluator` is enforcement, not a gap |
| **Correct the two `verify:` strings promising `checks/layout-scan.py`** | `catalog.yaml` | LAY-1 accepts and LAY-4 moves into `type-scan.py`, so **`checks/layout-scan.py` now has no caller** |
| **Delete every "planned script" note** | `standards/controls/*.md` | Each is replaced by a real build item or by a `gap:` reason. Four of seven CMP notes named a concrete script for claims that are runtime-only or pure judgment; only CMP-9's — the most modestly worded — survived triage intact. And they propagated: CMP-4 and CMP-8 cited a CMP-7 precedent that was itself only planned. `CONTEXT.md`'s **Accepted gap** entry already lists "planned script" under *Avoid* |
| **Apply the 7 relabels to `hybrid` and 4 to `judgment`** | `catalog.yaml` | §9. Each relabel-to-judgment closes its gap by definition — the evaluator becomes the enforcement, per README §Enforcement |
| **Update the stale control count** | `standards/quality-bar.md:27` and `:416` | Both say "70 controls"; the catalogue is 69 since IDN-4's removal. Fix on adoption, with the PROTOTYPE banner |
| **Correct the planned-check table** | `checks/README.md:333–336` | **Found during assembly.** The table plans four checks that the triage has now overtaken: `slop-scan` is listed as SLP-1..4 (SLP-4 moves to the rendered runner); **`slop-layout` is listed as SLP-5..7 and should be deleted outright** — SLP-5 and SLP-7 relabel to `judgment` and SLP-6 moves to the rendered runner, so the script has no controls left; `motion` is listed as MOT-1 + SLP-8 and gains MOT-2; `identity` is listed as IDN-1 and gains IDN-2. The `slop-layout` row also still carries SLP-6's superseded 1.25 figure |

### The teaching exhibit **(assembly, 2026-08-14)**

`components/compare.tsx` deliberately exhibits SLP-1, SLP-2 and SLP-4 with inline `dx-waive`
markers. Those controls are **L1**, and the harness convention is that an inline waiver on
L1 downgrades the line and still exits 1 — so wiring `slop-scan.py` into prebuild would fail
this repo on its own teaching exhibit.

**Ruling: add `components/compare.tsx` to `detector.ignoreFiles`.** This is the same
mechanism the triage already chose for vendored `components/ui/*` under MOT-1 — one entry,
no new convention. A quarantine folder and a change to the L1 waiver rule were both
considered and declined: the folder invents a convention and moves files, and the waiver
change has portfolio-wide blast radius for one file's problem.

### CMP-9's sanitiser allowlist **(assembly, 2026-08-14)**

**Ruling: harness-held config.** The static check's defining constraint is that nothing is
installed or configured in the target repo, and a sanitiser allowlist (DOMPurify,
`sanitize-html`, and friends) is library-name knowledge that is portfolio-wide, not
product-specific. A per-product `.dx/config.json` key was the alternative; defer it until a
product actually needs one.

### The approved-asset registry **(assembly: shape proposed here)**

`#140` left ownership and shape open. Proposed, following the precedent the existing keys
already set: **a `## Approved assets` section in DESIGN.md, projected to an
`approved_assets` key in `.dx/design.json`** — exactly how `layout_system` and `components`
already work, human-authored in DESIGN.md and generated into the typed projection.
`identity-scan.py` then reads it the same way `component-manifest.py` reads `coverage`. The
per-product table shape TYP-1 uses (`controls/typ-1.md:28`) was the alternative. **The
implementation effort can adjust this** — nothing else in the spec depends on which shape
wins, because IDN-1/2 grade N/A until a registry exists at all.

## 12. The three remaining scanners **(assembly, 2026-08-14)**

The map scoped this effort's scanner decision to accessibility only — "wide research,
narrow decision". The design lead widened it during assembly, so `content-lint.py`,
`type-scan.py` and `token-audit.py` are settled here. All three enforce **design** controls;
none touch engineering code.

### `content-lint.py` — **keep, and fix the scoping bug**

The research proposed handing the rule bodies to Vale, on the grounds that CNT-5, CNT-3,
CNT-12 and CNT-9's acronym half exist near-verbatim in the Microsoft and Google styles, and
that maintained AI-tells packages cover much of SLP-9.

**Declined, for a reason the research did not weigh.** `content-lint.py` reads its word
lists at runtime from `standards/controls/slp-9.md`, `cnt-5.md`, `cnt-6.md` and `cnt-13.md`,
so the lint and the catalogue cannot diverge — grow a list in a detail file and the check
picks it up. Moving the rule bodies to Vale styles breaks that coupling, or replaces it with
a detail-file→Vale-style generator, which is new machinery to keep a property we already
have for free.

The measured ~13% false-positive rate is **a scoping bug, not a rule-body bug**: prose rules
are being run over Tailwind class strings in `.tsx`. The fix is the same string-extraction
work Vale would have needed anyway — Vale reads only *comments* from `.tsx`, so the script
would have survived as an extractor regardless.

**The work:** extract user-facing strings before linting; never lint a `className` value.
Vale is considered-and-declined on the record; the revisit trigger is the harness needing to
lint prose that no control covers (docs, marketing).

### `type-scan.py` and `token-audit.py` — **keep the scripts and the policy; move the matching layer to ast-grep**

The research's finding holds: a 12-line ast-grep rule kept in the harness, with no config in
the target repo, matches raw colour values in styled-components template literals,
`style={{}}` objects *and* `className` strings — the three contexts `token-audit.py` spends
most of its 866 lines reaching. **The design-scale policy stays bespoke; the scanning
machinery need not.** Deciding whether `p-[13px]` is off-scale still needs the scale logic,
the exemption machinery and the `var()`/`color-mix` resolver — none of that moves.

This is also **convergent**: §10 already commits every new rule to ast-grep. Keeping two
matching engines is the cost of not doing this.

**Two conditions on the swap:**

1. **Order.** The engine swap lands **before** the LAY-4/TYP-6 subcheck (build target 5), so
   the new rules are written once against the new front-end rather than ported.
2. **A parity gate.** The swap ships only when both scripts return identical findings on a
   corpus that includes **known-positive fixtures**, not only this repo. The research's
   parity evidence is a zero-findings match on `components/` — that proves agreement on the
   empty case and nothing more.

`token-audit.py`'s exemption machinery is policy, not matching, so `motion-scan.py`'s reuse
of it (build target 2) is unaffected by the swap in either order.

## 13. Validator, schema, and the website

### `validate.py`

| Change | Cost |
|---|---|
| Add `standards/quality-bar.md` **and** `standards/layout-patterns.md` to `cross_ref_files` (`checks/validate.py:838`) | one line each |
| New check: every register id named in a DESIGN.md exists in `quality-bar.md` | new code |
| New check: rubric §4's slug list matches the artifact's four slugs | **no new code** — the `dx-sync` fence-parity mechanism already does it |
| New check: any `deterministic`/`hybrid` control that is effectively manual (the `enforced:` default included) with no `gap:` → error | new code |
| Remove the IDN-1 "planned but unbuilt" grandfather at `:587` | one edit, once `identity-scan.py` ships |
| `[WIRING-SYNC]` will need the new scripts registered as they land | mechanical |

### `standards/schema.json`

Declare the `gap:` field. `enforced`'s allowed-value set is unchanged.

### `standards/README.md` **(assembly)**

Two additions:

1. **The triage authoring rule** (§8) — a new `deterministic`/`hybrid` control arrives with
   a script, a `gap:` reason, or an honest relabel.
2. **A short pointer section for the ceiling** — that `quality-bar.md` exists, that it never
   blocks, and that anchors are not controls. A reader of README today has no way to learn
   the ceiling exists. Keep it to a paragraph; the artifact explains itself.

Rule 5 needs no amendment for the ceiling: registers are declared portfolio-wide and merely
*selected* per product, which rule 5 already permits as nuance calibration (§4).

### The website — **no work in this effort**

**Ruled by the design lead (assembly, 2026-08-14): nothing for now.**

Verified during assembly: `lib/catalog.ts` projects controls through an explicit field list
(`PUBLIC_FIELDS` at `:29`, and the per-field mapping in `getCatalog()` at `:52`), so a new
`gap:` key in `catalog.yaml` is simply **not projected**. Nothing breaks, no test fails, no
route changes. Publishing `gap:` — and rendering the quality bar as a site page — are both
real options, and both are Future work (§15).

## 14. Glossary

`CONTEXT.md` already carries the terms this spec adopts. Implementation must keep code and
docs on these exact words:

- **Quality bar** — the ceiling artifact. Grades, never blocks.
- **Register** — a class of surface with its own idea of what good looks like, declared in
  the quality bar and selected once per product repo. **Distinct from IDN-3's tone
  register**, which calibrates one product's voice.
- **Static check** — the layer that runs on source files, always, with nothing installed in
  the target repo.
- **Rendered check** — the layer that runs against a page already open in the verify
  browser. The harness never boots the target app.
- **Accepted gap** — a `deterministic` or `hybrid` control that deliberately has no script,
  with a one-line `gap:` reason saying why. "Planned script" is not an accepted gap.

Two more this spec uses often:

- **Anchor** — a pairing, a By-surface row, or a threshold in the quality bar. Anchors have
  no ids and are cited by quotation.
- **Honest-inert** — a check that ships and grades `N/A` until the thing it reads is
  declared. CMP-1 does this with `coverage: "complete"`; IDN-1/2 now do it with the
  approved-asset registry.

## 15. Future work (out of this spec)

- **Publishing `gap:` on the website**, and **rendering the quality bar as a site page**.
  Both declined for now (§13); neither is blocked by anything.
- **Merging LAY-4 and TYP-6.** They are near-duplicate controls with different numbers —
  80ch vs 75ch ceiling, ~66ch vs 40–60ch target — and after this spec they share one rule
  body with two thresholds. Whether to merge them is a catalogue question the triage
  flagged and did not settle.
- **MOT-2's ratification.** A design-lead decision, and a hard prerequisite for build
  target 2's second rule.
- **The exact hue boundary, revisited.** 255° was chosen with 15° of clearance above the
  site's own iris-9 ink. If `slop-scan.py` proves noisy or blind in practice, this is the
  first number to move.
- **IBM equal-access.** Deferred, not declined (§7). Revisit if the manual accessibility
  pass keeps finding what it would catch.
- **A per-product sanitiser allowlist** for CMP-9, if a product ever needs one (§11).
- **An evidence run** — proving the harness passes weak design. Deliberately skipped during
  charting; the ceiling rests on gap analysis.
- **The twelve anchoring devices** from the inspiration research that were catalogued but
  not adopted here (an advisory class that reports but never fails, "considered but
  rejected" with an anti-filler clause, score calibration in prose, judgment-before-detector
  isolation, and others). They are content-independent and remain available.

## Sources

| Ticket | Decided |
|---|---|
| [#110](https://github.com/transformteamsg/dx-harness/issues/110) | Artifact shape and schema; `validate.py`'s three structural checks |
| [#111](https://github.com/transformteamsg/dx-harness/issues/111) | What the inspiration skills encode (research) |
| [#112](https://github.com/transformteamsg/dx-harness/issues/112) | The four criteria, anchored; the grade scale and its guards |
| [#113](https://github.com/transformteamsg/dx-harness/issues/113) | The register model and DESIGN.md selection |
| [#114](https://github.com/transformteamsg/dx-harness/issues/114) | Folding `layout-patterns.md` and reviewer rubric §4 |
| [#115](https://github.com/transformteamsg/dx-harness/issues/115) | Plan/verify wiring; readers, load points, the verdict block |
| [#116](https://github.com/transformteamsg/dx-harness/issues/116) | Off-the-shelf scanner replacements (research) |
| [#117](https://github.com/transformteamsg/dx-harness/issues/117) | The accessibility check stack; static check and rendered check |
| [#118](https://github.com/transformteamsg/dx-harness/issues/118) | The triage rubric; the `gap:` field; the L0 backstop |
| [#138](https://github.com/transformteamsg/dx-harness/issues/138) | SLP cluster triage; the SLP-6 threshold correction |
| [#139](https://github.com/transformteamsg/dx-harness/issues/139) | CMP cluster triage; CMP-2's lister; the false CMP-7 precedent |
| [#140](https://github.com/transformteamsg/dx-harness/issues/140) | IDN/LAY/MOT/TYP triage; the honest-inert registry pattern |
| [#119](https://github.com/transformteamsg/dx-harness/issues/119) | This assembly: the scanner rulings, the exhibit file, the sanitiser allowlist, the registry shape, the README section, the website call |

**Research notes** (each on a throwaway branch, every claim cited to `file:line` or a
primary source):

- [`docs/research/2026-08-13-inspiration-skill-anchors.md`](https://github.com/transformteamsg/dx-harness/blob/research/inspiration-skill-anchors/docs/research/2026-08-13-inspiration-skill-anchors.md) on `research/inspiration-skill-anchors`
- [`docs/research/2026-08-13-scanner-replacements.md`](https://github.com/transformteamsg/dx-harness/blob/research/scanner-replacements/docs/research/2026-08-13-scanner-replacements.md) on `research/scanner-replacements`

**The prototype artifact:**
[`plugins/dx-harness/standards/quality-bar.md`](https://github.com/transformteamsg/dx-harness/blob/prototype/quality-bar-shape/plugins/dx-harness/standards/quality-bar.md)
on `prototype/quality-bar-shape` — all four criteria written end to end, 28 decisions
recorded at the bottom of the file. **It carries a PROTOTYPE banner. Delete the banner on
adoption.**
