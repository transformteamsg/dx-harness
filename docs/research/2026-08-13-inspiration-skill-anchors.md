# Visual and interaction quality anchors in four inspiration skills

**Research ticket:** [#111](https://github.com/transformteamsg/dx-harness/issues/111)
**Date:** 2026-08-13
**Question:** What calibration for visual and interaction quality do `impeccable`, `better-ui`,
`make-interfaces-feel-better`, and the `frontend-design` plugin skill carry that the DX design
harness has no equivalent for?

This is a gap analysis for a layer that sits **outside** the control catalogue. Catalogue
authoring rule 4 (grows only from observed failure) does not bind it, but the spirit does:
nothing below is a recommendation to adopt wholesale. Rows tagged `wrong register` are the
point of the exercise as much as the rows tagged `genuinely missing`.

Every claim cites `file:line`. Line numbers are from the files as read on 2026-08-13.

---

## 0. Sources

### The four skills (primary sources, read in full unless noted)

| Skill | Root | Files read |
|---|---|---|
| `impeccable` v4.0.4 | `~/.claude/skills/impeccable/` | `SKILL.md`; `reference/` — `craft-floor.md`, `critique.md`, `audit.md`, `polish.md`, `layout.md`, `typeset.md`, `animate.md`, `colorize.md`, `operate.md`, `distill.md`, `quieter.md`, `bolder.md`, `delight.md`, `clarify.md`, `harden.md`, `onboard.md`, `overdrive.md`, `shape.md`, `new-work.md`, `adapt.md`, `optimize.md`, `craft.md`, `routing.md`; `scripts/detector/registry/antipatterns.mjs`; threshold constants in `scripts/detector/rules/checks.mjs` |
| `better-ui` | `~/.claude/skills/better-ui/` | `SKILL.md`, `surfaces.md`, `animations.md`, `icons.md`, `performance.md` |
| `make-interfaces-feel-better` | `~/.claude/skills/make-interfaces-feel-better/` | `SKILL.md`, `surfaces.md`, `animations.md`, `typography.md`, `icons.md`, `performance.md` |
| `frontend-design` | `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/frontend-design/skills/frontend-design/` | `SKILL.md` (56 lines; the skill has no reference files — only `SKILL.md` and `LICENSE.txt`) |

The `frontend-design` plugin **is** on disk. It resolves through two paths that hold the same
content — `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/frontend-design/` and
the cache mirror at `~/.claude/plugins/cache/claude-plugins-official/frontend-design/`. Citations
below use the marketplace path.

**Skimmed, not read line-by-line, with reason.** `impeccable`'s `document.md`, `init.md`,
`live.md`, `live-setup.md`, `hooks.md`, `doctor.md`, `extract.md`, `visualize.md`,
`ios.md`, `android.md`, `adapt.native.md`, `audit.native.md`, and `degraded/*` were opened at
heading level only. They are persistence, routing, platform, and session-mechanics files. Two
carry a quality device each, cited below (`document.md`'s Do/Don't template,
`live.md`'s identity lock and squint test); the rest carry none.

### The harness side

`plugins/dx-harness/standards/catalog.yaml` (1,292 lines, 70 controls across 10 categories —
A11Y×11, TOK×3, TYP×6, COL×2, CMP×9, CNT×14, MOT×3, IDN×4, SLP×11, LAY×7);
`plugins/dx-harness/standards/controls/*.md` (47 detail files);
`plugins/dx-harness/standards/layout-patterns.md`;
`plugins/dx-harness/agents/dx-design-review.md:190-224`;
`content/guidelines/voice-tone.mdx`.

---

## 1. What the harness anchors with today

Establishing the baseline before judging anything "missing".

**Device 1 — `fails_when` bullets.** Every catalogue entry carries a list of concrete failure
shapes, e.g. `catalog.yaml:1253-1255` for LAY-5: "a data-entry surface is too padded for
efficient tab traversal / a reading or scanning surface is too cramped to scan without error".
This is the harness's workhorse anchor and it is genuinely good — it anchors by *symptom*.

**Device 2 — the control detail file's six-part shape.** Requirement / Rationale / Passes when /
Fails when / How to verify / Evaluator guidance (split into **Flag** and **Do not flag**) /
Deconfliction. `controls/lay-6.md:18-75` is the canonical example; `controls/lay-7.md:47-69`
and `controls/lay-5.md:35-70` follow it. The **Do not flag** half is a real anchoring device
most published design guidance lacks.

**Device 3 — tier plus waiver class.** `catalog.yaml:16` defines the waiver syntax; each entry
carries `tier: L0|L1|L2` and `waiver: none|documented|rationale`. `dx-design-review.md:234-238`
turns this into a mechanical severity rule: "every in-scope control you judge 'fail' with no
waiver on file goes HERE if it is L0 or L1, ADVISORY if L2. Do not demote an L1 because the
element is peripheral".

**Device 4 — the screenshot-reading procedure.** `layout-patterns.md:49-60` names four
sub-procedures in order: squint test, edge count ("More than about four signals drift"),
density map, grouping check. This is the harness's one *procedural* anchor for a visual
judgment.

**Device 5 — paired opposites, for copy only.** `content/guidelines/voice-tone.mdx:26-34` is a
"We are / We are not" table ("Clear but not cold / Robotic or detached"; "Reassuring but not
sappy / Alarmist or dramatic"), plus a context → tone → direction table at `:39-47`. CNT-14
(`catalog.yaml:876-891`) is the control that reads against it, and `dx-design-review.md:180-188`
routes the evaluator there. **This device exists exactly once in the harness and only for
words.**

**Device 6 — the four-criteria rubric, deliberately unanchored.**
`dx-design-review.md:190-192`: "each graded strong / acceptable / weak with one sentence of
reasoning. These draw on Apple's HIG design principles as a reference lens (a judgment aid, not
a checkable standard)." Note `:198-201` — the originality criterion is *inverted* for this
register: "For professional daily-use tools this is inverted from consumer work: flag
*unwarranted* novelty (a custom pattern where a stack component exists is a finding) as readily
as generic slop."

**The shape of the gap.** The harness is strong on prohibition and category boundaries, and
carries a good `Do not flag` habit. It is weak on three things the four skills are strong on:
(a) **positive numeric targets** — LAY-5 says explicitly "There is no fixed spacing metric; the
question is fit, not a number" (`controls/lay-5.md:53-54`); (b) **procedures that turn a feel
judgment into an observation** (it has one, the squint test); and (c) **calibration prose that
tells the grader what the distribution should look like** — nothing tells an evaluator what
share of real surfaces should score "acceptable".

---

## 2. Per skill: dimensions named and how they are anchored

### 2.1 `impeccable` v4.0.4

The largest of the four by an order of magnitude: `SKILL.md` plus 35 reference playbooks plus a
5,580-line deterministic detector driven by a 59-rule registry
(`scripts/detector/registry/antipatterns.mjs:1-557`).

**Dimensions named.**

- **Visitor mode**, four of them, chosen per surface not per product (`SKILL.md:28-35`):
  Persuade, Operate, Read, Experience. `SKILL.md:31` defines Operate as "the visitor completes a
  task. App UI, dashboards, editors, admin, settings, tools. Scanability, consistency, native
  expectations, and the real usage scene outrank expression. Brand lives in precise details."
  This is the Teacher & School register almost verbatim.
- **A craft floor** of nine verify items (`craft-floor.md:9-17`) and a two-part "Refuse" list
  (`craft-floor.md:19-47`).
- **Ten Nielsen heuristics scored 0–4** with per-score criteria tables
  (`critique.md:398-601`), a rating band table (`critique.md:606-616`), and P0–P3 issue severity
  (`critique.md:620-631`).
- **Cognitive load** as its own dimension: three types (`critique.md:293-322`), an eight-item
  checklist (`critique.md:327-337`), and the working-memory rule (`critique.md:342-354`).
- **Five personas** with per-persona red-flag lists (`critique.md:643-777`) and a selection table
  by interface type (`critique.md:783-790`).
- **Technical audit** across five dimensions each scored 0–4 for a `/20` total
  (`audit.md:11-76`).

**How it anchors — numeric thresholds.** The craft floor is almost entirely numbers:

> **Type:** body measure 65–75ch, display max 6rem, tracking floor -0.04em, balanced headings,
> obvious scale and weight steps. — `craft-floor.md:12`

> Tracking stops at -0.04em. -0.02 to -0.03em usually reads better. — `craft-floor.md:43`

> Declare elevation once, border or shadow. A 1px border under a wide soft shadow is the ghost
> card. Card radii stay at 12–16px; pills are for small controls. — `craft-floor.md:44`

Motion is a four-band table (`animate.md:54-59`): 100–150ms immediate feedback, 150–300ms
routine state change, 300–500ms layout/overlay/view transition, 500–800ms "a deliberately
authored focal entrance", with `animate.md:61` adding "Exit faster than entrance… Long feedback
feels like latency."

**How it anchors — register-scoped numbers.** `operate.md` gives *different* values for the same
axes when the surface is a tool:

> **Tighter scale ratio.** 1.125–1.2 between steps is typical. More type elements here than on
> brand surfaces; exaggerated contrast creates noise. — `operate.md:15`

> 150–250 ms on most transitions. Users are in flow; don't make them wait for choreography.
> — `operate.md:41`

> No orchestrated page-load sequences. Product loads into a task; users don't want to watch it
> load. — `operate.md:43`

`operate.md:56-61` is a "Product permissions" list — an explicit statement of what a tool is
*allowed* to do that a brand surface is not: system fonts, standard nav patterns, density,
"Consistency over surprise… delight is saved for moments, not pages."

**How it anchors — defaults vs bans, as two named categories.**

> These are the category's defaults, not bans: the brief's own words can earn any of them.
> Reaching for one when the axis is free means you were not deciding — `craft-floor.md:21`

against exactly one item that is not a default:

> A kicker or eyebrow above a heading. **This one is a ban, not a default: no brief earns it
> back.** — `craft-floor.md:27`

**How it anchors — scoring calibration in prose.**

> Be honest with scores. A 4 means genuinely excellent. Most real interfaces score 20-32 out of
> 40. — `critique.md:131`

and a renormalisation rule so a partial set never prints `/40` (`critique.md:129, 133`).

**How it anchors — countable checklists with bands.**

> **Scoring**: Count the failed items. 0–1 failures = low cognitive load (good). 2–3 = moderate
> (address soon). 4+ = high cognitive load (critical fix needed). — `critique.md:338`

> **Humans can hold ≤4 items in working memory at once** (Miller's Law revised by Cowan, 2001).
> — `critique.md:344`
> ≤4 items: within limits; 5–7: pushing the boundary; 8+: overloaded — `critique.md:348-350`

**How it anchors — named tests.** The skeleton test (`bolder.md:20-22`: "Strip the copy out of
your planned section and study the bare structure… If it only works once the words return, the
boldness is in the text size, not the design"). The removal test, the wow test, the device test,
the context test (`overdrive.md:122-125`). The product slop test (`operate.md:7-9`: "whether a
category-fluent user can trust the interface immediately or must pause at every subtly-off
component… The bar is earned familiarity. The tool should disappear into the task"). The
neighbouring-product test (`delight.md:63`: "The moment is specific enough that a neighboring
product could not use it unchanged").

**How it anchors — a deterministic detector with published thresholds.** Each rule in
`antipatterns.mjs` carries `id`, `category` (`slop` | `quality`), an optional `severity`/
`advisory` flag, and a description that states both the failure and the fix. Exact constants,
from `scripts/detector/rules/checks.mjs`:

| Rule | Threshold | Location |
|---|---|---|
| `tight-leading` | line-height ratio < 1.3 | `checks.mjs:3438-3439` |
| `wide-tracking` | letter-spacing > 0.05em on body text over 20 chars | `checks.mjs:3528-3531` |
| `extreme-negative-tracking` | letter-spacing ≤ −0.05em | `checks.mjs:3541-3545` |
| `tiny-text` | body text < 12px | `checks.mjs:3455-3459` |
| `undersized-ui-text` | functional text < 11px; 10px floor only for non-interactive legal smallprint | `checks.mjs:3495-3513` |
| `cramped-padding` | vertical < max(4, 0.3 × font-size); horizontal < max(8, 0.5 × font-size) | `checks.mjs:3227-3234` |
| `monotonous-spacing` | one rounded value used in > 60% of ≥ 10 samples, with ≤ 3 unique values | `checks.mjs:1509-1522` |
| `flat-type-hierarchy` | largest/smallest rendered size ratio < 2.0 across ≥ 3 sizes | `checks.mjs:4176-4188` |
| `line-length` | > 80 characters (configurable) | `checks.mjs:3564`; rule text at `antipatterns.mjs:343-351` |
| `oversized-h1` | ≥ 72px **and** ≥ 40 chars **and** ≥ 28% of viewport height | `checks.mjs:4462-4476` |
| `heading-rhythm` | space above a heading less than space below it, ≥ 2 violations, ≥ 12px deficit | `checks.mjs:3983-3986` |
| `em-dash-overuse` | ≥ 8 em-dashes at ~1 per 500 chars of body text | `antipatterns.mjs:219-224` |

The `undersized-ui-text` description carries an anti-laundering clause worth quoting in full:

> Being ON the DESIGN.md size ramp does not exempt a value here: adding 8px to the ramp launders
> the token but not the legibility problem, and that is exactly the escape hatch this rule
> closes. — `antipatterns.mjs:417`

**How it anchors — an advisory class that never fails.**

> Advisory rules are detected and reported, but never treated as failures: the CLI lists them
> under a separate "Advisory" section, they do not affect exit codes or the failure count, and
> the design hook skips them by default. — `antipatterns.mjs:570-573`

**How it anchors — process isolation.** `critique.md:8-10` requires two isolated sub-agents and
states the reason: "Assessment A must finish before detector findings enter the parent synthesis
context. Detector output is deterministic, but it still anchors judgment." A single-context run
must print `⚠️ DEGRADED: single-context (<reason>)` as the report's first line
(`critique.md:9, 107`).

**Other devices, from files skimmed at heading level.** `document.md:237-249` templates a
"Do's and Don'ts" pair of lists into the generated DESIGN.md — "Lead each with 'Do' or 'Don't'
and include exact values only when established." `live.md:141` requires an **identity lock**:
"Write ONE sentence recording what is actually on screen: dominant surface and accent color
(real values, not 'warm')… do not name an aesthetic family (a conclusion, not data)."
`live.md:157` runs a squint test that checks three variants differ on *three different named
axes* — "three 'tighter density' variants is failure."

### 2.2 `better-ui`

Fifteen numbered principles, a Mistake→Fix table, and a review output contract. It explicitly
delegates three domains out: "Typography… is covered by the `better-typography` skill…
Accessibility… by the `better-accessibility` skill. Layout structure… by the `better-layout`
skill" (`SKILL.md:14`).

**Dimensions named.** Surfaces (radius, optical alignment, shadows, image outlines), animations
(interruptibility, enter/exit, icon transitions, press feedback, motion restraint), icons
(stroke, state, sizing, RTL), performance (transition specificity, `will-change`).

**How it anchors — exact constants with the failure mechanism attached.** This is the skill's
signature move: a number, then *why*.

> A subtle `scale(0.96)` on click gives buttons tactile feedback. Always use `0.96`. Never use a
> value smaller than `0.95`: anything below feels exaggerated. — `SKILL.md:61`

> The color must be pure black in light mode (`oklch(0 0 0 / 0.1)`) and pure white in dark mode
> (`oklch(1 0 0 / 0.1)`), never a near-black like slate, zinc, or any tinted neutral. **A tinted
> outline picks up the surface color underneath it and reads as dirt on the image edge.**
> — `SKILL.md:57`

> Use exactly these values: scale from `0.25` to `1`, opacity from `0` to `1`, blur from `4px`
> to `0px`… `transition: { type: "spring", duration: 0.3, bounce: 0 }`; bounce must always be
> `0`. — `SKILL.md:53`

> An icon next to text carries the text's optical weight: `1.5px` stroke beside regular (400)
> text, `2px` beside semibold (600). — `SKILL.md:77`, expanded to a three-row table at
> `icons.md:9-13` (adds `2.5px` for Bold 700)

**How it anchors — a formula.** `SKILL.md:29`: "Outer radius = inner radius + padding.
Mismatched radii on nested elements is the most common thing that makes interfaces feel off."
`surfaces.md:13` adds the escape hatch: "If padding is larger than `24px`, treat the layers as
separate surfaces and choose each radius independently instead of forcing strict concentric
math." Note `better-ui/surfaces.md:55` softens the rule relative to its sibling: "Calculate
concentrically when the layers share a visible, even inset; preserve an established component
token when the layers are independent."

**How it anchors — a review procedure that changes what you can observe.**

> When reviewing, slow the interface down: replay motion at 10% speed in the browser's
> Animations panel and walk every state: hover, focus, active, loading, empty. **What feels off
> at 10% speed is what's subtly wrong at full speed.** — `SKILL.md:10`

**How it anchors — a frequency test for motion.** `animations.md:387`:

> **No custom animation on high-frequency interactions.** An animation on something users trigger
> constantly (every keystroke, every list-row hover, every tab switch in a work tool) charges its
> attention cost on every single trigger. Reserve expressive motion for infrequent moments (first
> load of a view, success states, empty states); high-frequency interactions get instant feedback
> or the subtlest possible transition (`opacity`/`background-color` at ≤150ms).

**How it anchors — paired opposites for pixels.** The Common Mistakes table
(`SKILL.md:89-101`) is a two-column Mistake | Fix grid: "Border used only to fake elevation" →
"Use layered `box-shadow` with transparency; keep structural and state borders". This is the
closest any of the four skills comes to the voice-tone "We are / We are not" device.

**How it anchors — a verdict ladder.** Severity definitions at `SKILL.md:113`
(HIGH = "makes an interaction misleading, unresponsive, or repeatedly disruptive"), verdict at
`SKILL.md:139`: "`Block` if any `HIGH` finding remains, `Needs changes` if only `MEDIUM` or
`LOW`… `Approve` only when no actionable findings remain."

**Deference clause.** `SKILL.md:12`: "Preserve the project's component library, tokens, and
density. Match its established motion language except where a principle below prescribes an
exact interaction pattern."

### 2.3 `make-interfaces-feel-better`

**This is the same skill as `better-ui` at a different version.** A full diff of the four shared
reference files shows the differences are almost entirely punctuation (em-dash → colon) plus a
handful of substantive edits. `better-ui` is the split successor that delegates typography,
accessibility, and layout to sibling skills (`better-ui/SKILL.md:14`); `make-interfaces-feel-better`
is the self-contained version that keeps them (19 principles vs 15).

**What only `make-interfaces-feel-better` has:**

- Font smoothing (`SKILL.md:53-55`, `typography.md:65-99`), tabular numbers
  (`SKILL.md:57-59`, `typography.md:123-157`), text wrapping (`SKILL.md:61-63`,
  `typography.md:5-63`).
- **Minimum hit area** (`SKILL.md:85-87`, `surfaces.md:221-256`): "prefer a 44×44px hit area for
  touch or mobile contexts. In dense desktop interfaces, use at least 40×40px", plus a collision
  rule at `surfaces.md:254-256`: "If the extended hit area overlaps another interactive element,
  shrink the pseudo-element — but make it as large as possible without colliding. Two interactive
  elements should never have overlapping hit areas."
- **A review-mode table with finding caps** (`SKILL.md:124-127`): `quick` covers the primary path,
  HIGH+MEDIUM only, cap 5; `full` covers the whole scope, cap 15 — with `SKILL.md:148`
  "never pad the report to reach the cap."
- **A scope-and-coverage evidence table** (`SKILL.md:133-137`) with a `Not reviewed` cell that
  requires a reason, and the rule: "Include all five Quick Reference categories. **Never imply an
  uninspected surface was reviewed.**"
- **A "Considered but Rejected" section** (`SKILL.md:170-178`), 1–3 candidates in quick mode and
  2–5 in full, each with a "Rejected because" cell, and "Do not invent filler."

**What only `better-ui` has:** the `2.5px` bold stroke row (`icons.md:13`), the "one optical
strategy per surface" clause (`icons.md:31`), pixel-grid icon guidance (`icons.md` "Design at
Render Size"), an expanded RTL table, logical CSS properties (`padding-inline-start` rather than
`padding-left`), and the softened concentric-radius rule.

**Typography scope clause worth noting** (`typography.md:103-105`): "This skill does not require
a specific font family. **Do not introduce a paid or proprietary typeface just to satisfy the
polish checklist.**… font smoothing, text wrapping, and tabular numbers are rendering details.
They do not override the project's chosen font family" (`:121`).

`catalog.yaml:337-340` records that TYP-5 (tabular figures) was **already adopted from this
skill** on 2026-06-17, and `catalog.yaml:488-491` records CMP-5/CMP-6 as adoptions from the same
study. So a previous pass already mined this source; the residue below is what that pass left.

### 2.4 `frontend-design` (plugin)

Fifty-six lines, no reference files. The densest anchoring-per-line of the four.

**Dimensions named.** Aesthetic direction; hero-as-thesis; typography as personality; structure
encoding content; motion deliberation; complexity matched to vision; copy as design material.

**How it anchors — a named-defaults calibration list.** The single most transferable device here:

> For calibration: AI-generated design right now clusters around three looks: (1) a warm cream
> background (near #F4F1EA) with a high-contrast serif display and a terracotta accent; (2) a
> near-black background with a single bright acid-green or vermilion accent; (3) a broadsheet-style
> layout with hairline rules, zero border-radius, and dense newspaper-like columns. All three are
> legitimate for some briefs, but **they are defaults rather than choices, and they appear
> regardless of subject.** — `SKILL.md:31`

A hex value in a taste rule. `impeccable/new-work.md:65` carries the same three clusters
independently, adding "if someone could guess your aesthetic from the category alone, or from
category-plus-avoidance, rework until neither answer is obvious."

**How it anchors — a self-similarity test.**

> if any part of it reads like the generic default you would produce for any similar page **(work
> through a similar prompt to see if you arrive somewhere similar)** rather than a choice made for
> this specific brief — revise that part, say what you changed and why. — `SKILL.md:35`

**How it anchors — a named counter-example rather than a rule.**

> a big number with a small label, supporting stats, and a gradient accent is the template answer,
> only use if that's truly the best option. — `SKILL.md:17`

Same device at `SKILL.md:21` for numbered markers: "Many generic designs use numbered markers
(01 / 02 / 03), but that's only appropriate if the content actually is a sequence — like a real
process or a typed timeline where order carries information the reader needs."

**How it anchors — a plan contract with counts.** `SKILL.md:33`: "Color: describe the palette as
4–6 named hex values. Type: the typefaces for 2+ roles… Layout: a layout concept, using
one-sentence prose descriptions and ASCII wireframes… Signature: the single unique element this
page will be remembered by."

**How it anchors — a memorable closing move.**

> Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one
> accessory. — `SKILL.md:43`

**Quality floor, stated without ceremony.** `SKILL.md:43`: "Build to a quality floor without
announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected."

**Copy guidance** (`SKILL.md:47-55`) is close to the harness's existing content controls:
"Name things by what people control and recognize, never by how the system is built. A person
manages notifications, not webhook config" (≈ CNT-2); "An action keeps the same name through the
whole flow, so the button that says 'Publish' produces a toast that says 'Published'" (≈ CNT-10);
"Errors don't apologize, and they are never vague about what happened" (≈ CNT-1, voice-tone
`:42`); "Let each element do exactly one job. A label labels, an example demonstrates, and
nothing quietly does double duty" (≈ SLP-9's redundant label/helper clause).

---

## 3. Candidate-anchor table

Tag key: `already covered` (control id or rubric line named) · `genuinely missing` ·
`wrong register`. The Note column is advisory only.

### 3.1 Design quality — hierarchy, spacing rhythm, alignment, reading order

| Candidate anchor | Source | Tag | Note |
|---|---|---|---|
| Squint test as a named first-read procedure | `impeccable/reference/layout.md:18`; `critique.md` synthesis | already covered — `layout-patterns.md:51-53`, LAY-7 verify line `catalog.yaml:1284` | Independently arrived at; confirms the harness's version. |
| "more space above a heading than below it", detectable as a deficit | `craft-floor.md:11`; `antipatterns.mjs:387-394`; `checks.mjs:3983-3986` | **genuinely missing** | SLP-7 says related items group tighter (`catalog.yaml:1099`); nothing directs the *asymmetry* around a heading. Highest-value spacing gap. |
| Monotonous spacing made countable: one value in >60% of ≥10 samples with ≤3 unique values | `checks.mjs:1509-1522` | **genuinely missing** | SLP-7 has the rule and `fails_when: one spacing value used everywhere` (`catalog.yaml:1107`) but no threshold, so it is unfalsifiable in review. |
| Page-level flat-hierarchy read: largest/smallest size ratio < 2.0 | `checks.mjs:4183-4188` | **genuinely missing** | SLP-6 anchors *adjacent* steps at ≥1.25× (`catalog.yaml:1086`). The max/min page ratio is a second, cheaper read that catches a different failure. |
| Padding floor scaled to font size: vertical ≥ max(4, 0.3×fs), horizontal ≥ max(8, 0.5×fs) | `checks.mjs:3227-3228`; `antipatterns.mjs:353-361` | **genuinely missing** | TOK-2 governs where values come from; LAY-5 governs density fit. Nothing gives a floor for text inside a bordered box. |
| Body text flush to the viewport edge — needs ≥16px, ideally 24–32px horizontal padding | `antipatterns.mjs:363-369` | **genuinely missing** | LAY-2 covers 320px reflow (`catalog.yaml:1196`), not gutters at any width. |
| Whitespace → divider → box escalation ladder | — | already covered — `layout-patterns.md:34-36` | Harness's own; none of the four states it as crisply. |
| Distinct-left-edge count as a drift signal | — | already covered — `layout-patterns.md:39-41`, `:56-57` | Harness's own. |
| Concentric radius formula `outer = inner + padding` | `better-ui/SKILL.md:29`; `mifb/surfaces.md:7` | already covered — `controls/tok-3.md:19-27` states the identical formula and worked example | |
| The >24px-padding escape hatch on the concentric rule | `mifb/surfaces.md:13`; `better-ui/surfaces.md:55` | **genuinely missing** | TOK-3 has no upper bound; forcing concentric math on widely separated layers is a false positive waiting to happen. |
| Cognitive-load 8-item checklist with a failure-count band (0–1 low / 2–3 moderate / 4+ critical) | `critique.md:327-338` | **genuinely missing** | Nothing grades *total* load. LAY-7 grades the focal region, CMP-5 the action count; neither sums. |
| ≤4 visible options at a decision point; 5–7 pushing; 8+ overloaded | `critique.md:342-350` | **genuinely missing** | Directly register-relevant for dense teacher tools. |
| ≤5 top-level nav items; ≤4 sibling choices per sidebar level | `critique.md:353-357` | **genuinely missing** — low confidence | No observed failure behind it. Treat as a probe, not a rule. |
| Density as a tunable 0.6–1.4 range parameter | `impeccable/reference/layout.md:78-83` | **wrong register** | A live-variant generation mechanism, not a judgment anchor. |
| Hero as thesis; "big number, small label, supporting stats, gradient accent" is the template answer | `frontend-design/SKILL.md:17`; `craft-floor.md:26` | **wrong register** | Teacher & School surfaces have no hero. |
| Balance the columns when one stretches the first viewport | `antipatterns.mjs:309-316` | **wrong register** | Marketing-page failure shape. |

### 3.2 Originality — appropriate distinctiveness

Read every row here against `dx-design-review.md:198-201`, which inverts this criterion for
professional tools.

| Candidate anchor | Source | Tag | Note |
|---|---|---|---|
| The self-similarity test: run the same brief through your own head; if you land in the same place, that part is a default not a choice | `frontend-design/SKILL.md:35` | **genuinely missing** | The single best candidate in this whole document. The originality criterion currently has *no procedure at all* — the evaluator is asked for a strong/acceptable/weak grade with only HIG as a "reference lens" (`dx-design-review.md:190-192`). Inverts cleanly for this register: for a teacher tool the answer to "would any competent designer land here?" is *often correctly yes*, so the test becomes "where did I diverge, and did the divergence earn itself?" — which is exactly the inverted-originality reading. |
| The design-specificity question: could an unrelated product use this composition, interaction, and visual language unchanged? | `critique.md:55, 137` | **genuinely missing** | Same gap, complementary phrasing. |
| "specific enough that a neighboring product could not use it unchanged" | `delight.md:63` | **genuinely missing** | Same device, delight-scoped. |
| The three named AI-design clusters, with `#F4F1EA` named | `frontend-design/SKILL.md:31`; `new-work.md:65` | **genuinely missing** (partly) | SLP-1 names the purple/violet + cyan-on-dark + glow cluster (`catalog.yaml:1021`). The **cream/serif/terracotta** and **broadsheet-hairline** clusters are not in any SLP control. |
| `cream-palette`: "a warm cream or beige page background has become the default 'tasteful' AI surface, reached for by reflex" | `antipatterns.mjs:59-67` | **genuinely missing** | The detectable half of the above. |
| The kicker/eyebrow ban — "no brief earns it back" | `craft-floor.md:27`; `antipatterns.mjs:191-199` | **genuinely missing** | No SLP control covers the tracked-uppercase label above a heading. Note this is the one item impeccable marks a true ban rather than a default. |
| `gpt-thin-border-wide-shadow` / the "ghost card": a 1px border under a wide soft shadow — commit to one | `antipatterns.mjs:507-516`; `craft-floor.md:44` | **genuinely missing** | SLP-3 covers side-tab borders, SLP-4 nesting; nothing covers double-declared elevation. |
| `pulsing-dot`: decorative liveness — "Reserve pulse animation for indicators tied to genuinely live, changing data" | `antipatterns.mjs:98-105` | **genuinely missing** | Register-relevant: a "live" attendance or sync indicator that is not actually live is an honesty failure, not just a style one. |
| `numbered-section-labels` (01 / 02 / 03) unless the sequence carries information | `antipatterns.mjs:201-210`; `frontend-design/SKILL.md:21`; `craft-floor.md:28` | **genuinely missing** | Low priority for this register. |
| `radial-halo`, `radial-spotlight-glow`, `repeating-stripes-gradient`, `codex-grid-background` | `antipatterns.mjs:133-150, 518-536` | **genuinely missing** — marginal | SLP-1 names glow accents generally; these are four specific renderings. Marginal for a dense tool. |
| `icon-tile-stack`: rounded-square icon container above a heading | `antipatterns.mjs:161-169` | already covered — SLP-5 (`catalog.yaml:1073`) | |
| Gradient text | `craft-floor.md:33`; `antipatterns.mjs:42-49` | already covered — SLP-2 | |
| Nested cards | `craft-floor.md:25`; `antipatterns.mjs:69-77` | already covered — SLP-4 | |
| Bounce/elastic easing | `antipatterns.mjs:89-96` | already covered — SLP-8 | |
| Modal for a task needing neither interruption nor protected focus | `craft-floor.md:29`; `operate.md:52` | already covered — SLP-10 (`catalog.yaml:1144`) | `operate.md:52` "Modals are usually laziness. Exhaust inline / progressive alternatives first" is sharper phrasing for the same rule. |
| "defaults, not bans" as an explicit two-list framing | `craft-floor.md:21, 27` | already covered structurally — tier + `waiver:` classes (`catalog.yaml:16`, per-entry `waiver:`) | The *mechanism* exists; the *phrasing to the evaluator* does not. See §4.3. |
| The Chanel one-accessory rule: remove one thing before shipping | `frontend-design/SKILL.md:43` | **genuinely missing** | Cheap, memorable, and register-compatible — `layout-patterns.md:42-45` already frames restraint as the taste. |
| `overused-font`: Inter, Roboto, Geist, **Plus Jakarta Sans**, Space Grotesk "no longer feel distinctive" | `antipatterns.mjs:22-30` | **wrong register** | The harness has *deliberately fixed exactly these two faces* (TYP-1, `catalog.yaml:265`). Distinctiveness of typeface is a non-goal; a boring fixed stack is the point. Reject explicitly. |
| "Spend your boldness in one place"; the signature element the page is remembered by | `frontend-design/SKILL.md:33, 43` | **wrong register** | A daily-use tool should carry no signature element. |
| Concept roll / seed script / world workshop forcing non-convergence | `new-work.md:37-51` | **wrong register** | Structurally incompatible with an inverted originality criterion. |
| QUALITY BAR cards, comp-first pixel reproduction, sketch generation | `new-work.md:87, 104` | **wrong register** | Greenfield brand work. |
| Overdrive's WebGL/WebGPU/shader/particle toolkit | `overdrive.md:46-81` | **wrong register** | `overdrive.md:10` says so itself: "A particle system on a creative portfolio is impressive. The same particle system on a settings page is embarrassing." |

### 3.3 Craft — is each decision deliberate; states designed; edge content; responsive

| Candidate anchor | Source | Tag | Note |
|---|---|---|---|
| **Browser surfaces**: text selection, caret, custom scrollbars, focus rings, underline offset, tabular numerals — "the cheapest signal that a page was built rather than assembled, and the one models skip most reliably" | `craft-floor.md:15` | **genuinely missing** | The highest-value craft gap in this document. A11Y-2 covers focus *visibility*; TYP-5 covers tabular figures; selection, caret, scrollbar, and underline offset are unowned. Directly matches the rubric's craft line, "is each decision deliberate?" (`dx-design-review.md:211`). |
| Replay motion at 10% speed and walk every state | `better-ui/SKILL.md:10`; `mifb/SKILL.md:11` | **genuinely missing** | MOT-1/2/3 are static-value controls. There is no *procedure* for judging how motion feels — the motion analogue of the squint test. |
| Motion restraint by frequency: no custom animation on high-frequency interactions; those get instant feedback or ≤150ms opacity/background-color | `better-ui/animations.md:387`; `SKILL.md:85` | **genuinely missing** | MOT-1 says "no decorative motion on critical paths" (`catalog.yaml:896`) — same instinct, no frequency test. Strongly register-appropriate: a teacher triggers a row hover hundreds of times a session. |
| Interruptible motion: CSS transitions for interactive state changes, keyframes only for one-shot sequences | `better-ui/SKILL.md:39-41`; `animations.md:9-40` | **genuinely missing** | Nothing in MOT covers interruptibility. A drawer that snaps when re-toggled mid-flight passes every current motion control. |
| Exit softer than enter — exit ~150ms vs enter ~300ms, small fixed `translateY` (−12px) not full height | `better-ui/animations.md:180-183` | **genuinely missing** | MOT-1 gives one 100–300ms band for everything. |
| Motion duration bands by job (100–150 feedback / 150–300 state / 300–500 layout / 500–800 focal) | `animate.md:54-59` | **genuinely missing** (the banding) | MOT-1's single band is coarser. The 500–800ms tier is `wrong register` on its own; the first three are not. |
| 150–250ms for most transitions on a tool surface | `operate.md:41` | **genuinely missing** | A register-specific tightening of MOT-1's 100–300ms. |
| "Motion is never the only feedback channel" | `better-ui/SKILL.md:85`; `animations.md:388` | already covered — MOT-3 (proposed), `catalog.yaml:936` | Independent arrival at the same rule. |
| `transition: all` banned; name exact properties | `better-ui/SKILL.md:67-69`; `performance.md:7` | already covered — MOT-1 `fails_when: transition-all` (`catalog.yaml:905`) | |
| `will-change` only for transform/opacity/filter, only after observed first-frame stutter | `better-ui/SKILL.md:71-73`; `performance.md:47-49, 88` | **genuinely missing** — low priority | |
| The full state enumeration: default, hover, focus, active, disabled, loading, error, success, permission | `polish.md:73`; `operate.md:32`; `craft-floor.md:14` | **genuinely missing** (partly) | CMP-3 covers loading/success/error, CMP-4 empty, A11Y-2 focus. **Hover, active, disabled, and permission** are not required anywhere as an enumeration. |
| Skeleton states for loading, not spinners mid-content | `operate.md:34` | **genuinely missing** — low priority | CMP-3 requires a loading state, not a shape. |
| Icon stroke matched to adjacent text weight (1.5px @ 400, 2px @ 500–600, 2.5px @ 700); one stroke weight per set per surface | `better-ui/SKILL.md:77`; `icons.md:9-13, 31` | **genuinely missing** | IDN-2 governs the *product-icon family* (app marks), not UI icon sets. |
| One SVG recoloured via `currentColor`; outline default, fill marks active | `better-ui/SKILL.md:79-81`; `icons.md:34-57` | **genuinely missing** | |
| Test icons at their smallest render size; use native 16/20/24 grids | `better-ui/icons.md` "Design at Render Size" | **genuinely missing** — low priority | |
| Shadows for elevation, borders for structure — with an explicit *keep* list (dividers, layout separators, table cell boundaries, form input outlines, selected/focus) | `better-ui/SKILL.md:35-37`; `mifb/surfaces.md:119-121, 168-176` | **genuinely missing** | Nothing in the catalogue decides border-vs-shadow. The *keep* list is what makes it safe. |
| Depth positively defined: "shadows carry an offset and a soft blur. A zero-offset colored halo is decoration." | `craft-floor.md:10` | **genuinely missing** | SLP-1 bans glow accents; the positive form is absent. |
| Image outline `oklch(0 0 0 / 0.1)` light / `oklch(1 0 0 / 0.1)` dark, never a tinted neutral | `better-ui/SKILL.md:57`; `mifb/surfaces.md:182-187` | **genuinely missing** | Must land as a token, not a literal — TOK-1 forbids raw colour values in components (`catalog.yaml:210`). The *rationale* ("reads as dirt on the image edge") is what makes it defensible. |
| Optical alignment default value: icon-side padding = text-side − 2px; play triangle nudged 2px right | `mifb/surfaces.md:63-64, 89-100` | **genuinely missing** (the value) | LAY-6 requires optical alignment (`controls/lay-6.md:22-25`) but supplies no starting number, so it is unactionable at implement time. |
| 40×40px hit-area floor in dense desktop UI; hit areas of two elements must never overlap | `mifb/SKILL.md:85-87`; `surfaces.md:221-256` | **genuinely missing** (partly) | A11Y-4 sets 24×24 / 44 mobile (`catalog.yaml:90`). The dense-desktop floor and the **non-overlap** rule are both absent, and non-overlap is a real mis-tap source in a marks grid. |
| `text-wrap: balance` on headings (works ≤6 lines Chromium / ≤10 Firefox), `pretty` on short-to-medium body | `mifb/typography.md:5-63` | **genuinely missing** | Cheap, register-neutral, and the line-count caveat prevents the common misapplication. |
| Undersized functional text floor: 11px interactive/furniture, 10px legal smallprint only, plus the anti-laundering clause | `antipatterns.mjs:411-418`; `checks.mjs:3495-3513` | **genuinely missing** | TYP-2 sets 14px body / 12px label (`catalog.yaml:285`). Sub-label furniture (table meta rows, timestamps, breadcrumbs) has no floor. The anti-laundering clause is the more valuable half. |
| Gray text on coloured backgrounds — tint from the surface hue or the foreground, never gray | `craft-floor.md:9`; `quieter.md:57`; `antipatterns.mjs:318-325` | **genuinely missing** | COL-2 covers small functional-colour text on a tint at ≤12px (`catalog.yaml:407`). Gray-on-colour generally is not covered. |
| Overlays must escape their container — an absolutely positioned dropdown inside `overflow:hidden` gets clipped | `operate.md:37`; `antipatterns.mjs:455-463` | **genuinely missing** | A real, common, silent failure; CMP-1 mandates the stack component but not its stacking context. |
| Text occlusion / content overflowing its container / content invisible at rest after reveal handlers ran | `antipatterns.mjs:283-316, 438-446` | **genuinely missing** — low priority for a static-render product | |
| Line-height ≥1.3 floor | `checks.mjs:3438-3439` | already covered — TYP-2 requires 1.5–1.6 body (`catalog.yaml:285`) | Harness is stricter. |
| Body measure 65–75ch / ≤80ch | `craft-floor.md:12`; `typeset.md:21`; `antipatterns.mjs:343-351` | already covered — LAY-4 (~66ch, never above 80ch) and TYP-6 | Two independent sources agree with the harness. |
| Tabular figures for aligning/updating numbers | `mifb/typography.md:123-157` | already covered — TYP-5, adopted from this exact skill on 2026-06-17 (`catalog.yaml:337-340`) | |
| `-webkit-font-smoothing: antialiased` at the root | `mifb/typography.md:65-99` | **wrong register** | A macOS rendering preference, not a standard; and TYP-1 already fixes the type stack. |
| `scale(0.96)` press feedback, never below 0.95 | `better-ui/SKILL.md:59-61` | **wrong register** | Consumer-app tactility. SLP-8 bans overshoot; MOT-1 bounds duration; a press-scale on every button in a marks grid is exactly what `animations.md:387`'s own frequency rule argues against. |
| Split-and-stagger enter animations at ~100ms per chunk, ~80ms per word | `better-ui/SKILL.md:43-45`; `animations.md:44-52` | **wrong register** | `better-ui/SKILL.md:45` limits it to "infrequent staged entrance" itself; a tool surface has none. |
| Contextual icon animation exact values (scale 0.25→1, blur 4→0, spring bounce 0) | `better-ui/SKILL.md:53` | **wrong register** — with one exception | The values are consumer-flavoured, but `bounce: 0` is the same rule as SLP-8 and could be cited as prior art. |
| Concentric-radius tolerance / peer-radius anchor | — | already covered — `controls/tok-3.md:24-27` anchors peers to the product's `--radius` | Harness is *ahead* of all four skills here. |

### 3.4 Functionality — does the flow complete the task; dead ends; recovery

| Candidate anchor | Source | Tag | Note |
|---|---|---|---|
| Persona walkthrough with per-persona red-flag lists | `critique.md:635-812` | **genuinely missing** | The harness has no persona device at all. A Teacher & School adaptation (relief teacher on an unfamiliar class, form teacher under deadline, HOD reviewing, AT-dependent staff) would be register-appropriate; importing Alex/Jordan/Sam/Riley/Casey verbatim would not. |
| Keyboard accelerators, bulk/batch actions, "one-item-at-a-time workflows where batch would be natural" | `critique.md:522-540, 661-667` | **genuinely missing** | The most register-appropriate import in the whole document. A teacher entering 40 marks *is* the power-user persona. Nothing in the catalogue asks whether a repeated task has an accelerator. |
| "Would a user contact support about this? If yes, it's at least P1" | `critique.md:631` | **genuinely missing** | Harness severity is tier-mechanical (`dx-design-review.md:234-238`), which is correct for controls. The four *rubric grades* have no comparable tiebreaker. |
| Extreme-input matrix: 100+ char names, emoji, RTL, CJK, 1000+ items, 30–40% translation expansion | `harden.md:7-30, 87-92, 322-334` | **genuinely missing** (as an enumeration) | The rubric says "edge content lengths" (`dx-design-review.md:213`) with nothing behind it. The 30–40% expansion budget is a usable number. |
| Concurrency: "Click submit 10 times rapidly"; disable the control while loading | `harden.md:202-206, 331` | **genuinely missing** | CMP-3 requires a loading state, not double-submit protection. A duplicated attendance submission is a real-world data harm. |
| API status-code state map — 400 / 401 / 403 / 404 / 429 / 500 each get a designed state | `harden.md:165-172` | **genuinely missing** | CNT-1 governs the *wording* of an error; nothing enumerates which errors must have a designed state. |
| Empty-state taxonomy: first use / user-cleared / no results / no permissions / error | `onboard.md:187-192`; `clarify.md:59` | **genuinely missing** (partly) | CMP-4 requires an empty state be distinguishable from loading/error/permissions (`catalog.yaml:474`). It does not require the five *empty* varieties be distinguishable from each other — "no results for this filter" and "nothing exists yet" want different next actions. |
| Undo preferred over confirmation when recovery is safe | `clarify.md:37` | **genuinely missing** (the preference) | CMP-2 accepts "undo **or** explicit confirmation" (`catalog.yaml:442`). The ordering — undo first, confirm only when recovery is unsafe — is not stated. |
| Detail pane / master-detail "nothing selected yet" state | — | already covered — `layout-patterns.md:92-93` | Harness's own. |
| Lead an empty state with the action, not the absence | `frontend-design/SKILL.md:53`; `onboard.md:168-185` | already covered — `layout-patterns.md:110-116`, CMP-4 | |
| Errors answer what failed / why / how to recover | `clarify.md:47-52` | already covered — CNT-1 (`catalog.yaml:585`), voice-tone `:42` | |
| Progressive disclosure as an explicit load-management move | `critique.md:298-302, 336` | **genuinely missing** | SLP-10 and LAY-3 shape *where* complexity lives; nothing endorses staging it. |
| Nielsen's 10 heuristics scored 0–4, wholesale | `critique.md:113-133, 398-616` | **wrong register** | Importing all ten duplicates roughly fifteen existing controls and reintroduces the double-flagging the catalogue's Deconfliction sections exist to prevent. Take the two uncovered heuristics individually (rows above), not the frame. |
| Audit's five-dimension `/20` score | `audit.md:63-76` | **wrong register** | Duplicates the harness's own verdict ladder and tier arithmetic. |
| "Can Alex complete the core task in under 60 seconds?" | `critique.md:656` | **wrong register** | An unanchored universal time budget; teacher tasks have no comparable constant. |
| Time-to-value, aha moment, activation/skip/completion metrics | `onboard.md:42-46, 226-233` | **wrong register** | Growth-product framing. Teachers are not choosing to adopt. |
| Guided tours, spotlights, feature announcement modals | `onboard.md:122-142` | **wrong register** | The rubric already prefers escapability (`dx-design-review.md:221-222`, HIG: Agency); SLP-10 pushes complex tasks out of modals. |
| Delight moments, celebration proportional to effort | `delight.md:38-46` | **wrong register** | IDN-4 already forbids celebration around case data (`catalog.yaml:1000`); `operate.md:61` agrees — "delight is saved for moments, not pages." |
| Core Web Vitals targets (LCP<2.5s, INP<200ms, CLS<0.1) | `optimize.md:190-210` | **wrong register** for the *design* catalogue | Real and useful, but performance budgets belong to engineering standards, not the design rubric. |

---

## 4. Anchoring devices worth stealing, regardless of content

Twelve mechanisms, ranked by how much decidability they add per line of prose.

### 4.1 The self-similarity test
`frontend-design/SKILL.md:35` — "work through a similar prompt to see if you arrive somewhere
similar". The originality criterion has no procedure today. This one is cheap, decidable, and
*inverts correctly* for a professional register: the harness's question becomes "would any
competent designer land here — and if I diverged, did the divergence earn itself?" That is
exactly the inverted-originality reading `dx-design-review.md:198-201` already asks for, with a
procedure attached for the first time.

### 4.2 Paired opposites, extended from copy to pixels
The harness already owns this device and uses it once, for voice
(`content/guidelines/voice-tone.mdx:26-34`). None of the four skills has it in that exact form —
`better-ui/SKILL.md:89-101`'s Mistake | Fix table and `craft-floor.md:19-47`'s Refuse list are
each half of it. A "We are / We are not" table for the *visual* register (dense but not cramped /
calm but not empty / familiar but not lazy / restrained but not featureless / consistent but not
monotonous) would give design quality and originality the anchor CNT-14 already has. **This is a
synthesis of the harness's own device with the skills' content, not an import.**

### 4.3 Defaults vs bans, stated as two lists to the evaluator
`craft-floor.md:21` against `:27`. The harness encodes exactly this distinction in `tier` plus
`waiver: none|documented|rationale`, but never says it to the evaluator in prose. Saying it makes
waiver discipline legible and stops L2 controls being argued as absolutes.

### 4.4 An advisory class that is reported but never fails
`antipatterns.mjs:570-580`. The harness's severity routing is binary-by-tier
(`dx-design-review.md:234-238`): BLOCKING for L0/L1, ADVISORY for L2. A true third state —
detected, reported, excluded from the failure count, opt-in per product — is the right home for
taste-flavoured findings that should be visible without being blocking.

### 4.5 Slow the artefact down
`better-ui/SKILL.md:10` — replay motion at 10% speed in the Animations panel. A procedure that
changes what is *observable*, which is what the squint test does for layout
(`layout-patterns.md:51`). The harness has no such procedure for motion.

### 4.6 Threshold-with-reason
Every constant in `better-ui` carries its failure mechanism: `SKILL.md:61` "anything below feels
exaggerated"; `SKILL.md:57` "reads as dirt on the image edge"; `antipatterns.mjs:417` "adding 8px
to the ramp launders the token but not the legibility problem". The harness's `fails_when`
bullets state the symptom; adding the mechanism is what makes a threshold survive a waiver
argument.

### 4.7 The coverage table with an explicit "Not reviewed — reason" cell
`mifb/SKILL.md:129-137` — "Never imply an uninspected surface was reviewed." The review agent's
ledger records verdicts; it does not force an explicit admission of what was never looked at.

### 4.8 "Considered but rejected", 2–5 real candidates
`mifb/SKILL.md:170-178`, with "Do not invent filler. If the scope contains fewer borderline
candidates, include the ones that exist and say so." This is the direct antidote to an unanchored
strong/acceptable/weak grade: it forces the grader to show where the judgment boundary sits.

### 4.9 Finding caps with an anti-padding clause
`mifb/SKILL.md:124-127` and `:148` — a per-mode cap (quick 5 / full 15) plus "never pad the
report to reach the cap." Both halves are needed; a cap alone invites padding to it.

### 4.10 Score calibration stated in prose
`critique.md:131` — "A 4 means genuinely excellent. Most real interfaces score 20-32 out of 40."
A three-point scale with no stated distribution drifts to the middle. One sentence naming what
"acceptable" should be true of, and roughly how often, fixes it.

### 4.11 Judgment before machine, in separate contexts
`critique.md:8-10` — the design assessment must complete before deterministic findings enter the
synthesis context, because "Detector output is deterministic, but it still anchors judgment", and
a single-context run must print a `⚠️ DEGRADED` banner (`critique.md:9`). The harness runs
scripts and the evaluator in one context.

### 4.12 Register as an explicit parameter on a threshold
`impeccable/SKILL.md:28-35` plus `operate.md` give *different numbers for the same axis by
register*: 150–250ms in Operate (`operate.md:41`) versus up to 500–800ms for an authored focal
entrance (`animate.md:57-59`); a 1.125–1.2 type-scale ratio in Operate (`operate.md:15`) versus
SLP-6's global ≥1.25×. The harness has one register and states it well
(`layout-patterns.md:9-12`). Making the register an explicit parameter on judgment-control
thresholds would let one catalogue serve the product surfaces and this marketing/standards site
without a waiver on every difference — the site is currently held to product-register rules it
was never written for.

**Bonus device, from a skimmed file.** `live.md:141`'s **identity lock**: before generating
variants, write one sentence recording what is *actually on screen* using real values — "do not
name an aesthetic family (a conclusion, not data)". A useful discipline for any pass that must
preserve an incumbent look, and `dx-design-execute`/`dx-design-critique` both need it.

---

## 5. Register verdict, stated plainly

`layout-patterns.md:9-12` already says the register out loud: "dense, calm, task-first
professional tools — not marketing pages." Held against that, the following are **the wrong
register and should be rejected on the record**, not deferred:

1. **Typeface distinctiveness** (`antipatterns.mjs:22-30` flags Inter and Plus Jakarta Sans as
   saturated). TYP-1 chose exactly those two on purpose.
2. **Hero-as-thesis, the signature element, "spend your boldness in one place"**
   (`frontend-design/SKILL.md:17, 33, 43`). These surfaces have no hero.
3. **The concept roll, world workshop, QUALITY BAR comps, and sketch generation**
   (`new-work.md:37-51, 87, 104`) — structurally incompatible with an originality criterion the
   harness has deliberately inverted (`dx-design-review.md:198-201`).
4. **Overdrive's technical spectacle** (`overdrive.md:46-81`) — the skill says so itself at `:10`.
5. **Onboarding tours, aha moments, and time-to-value metrics** (`onboard.md:42-46, 122-142`).
6. **Delight and celebration devices** (`delight.md:38-46`) — IDN-4 already bans them around case
   data; `operate.md:61` reaches the same conclusion from the other direction.
7. **Nielsen's ten wholesale, and the /20 audit score** (`critique.md:398-616`, `audit.md:63-76`)
   — duplicate roughly fifteen existing controls and reintroduce double-flagging.
8. **Press-scale, staggered entrances, contextual icon spring animations**
   (`better-ui/SKILL.md:43-45, 53, 59-61`) — consumer tactility; `animations.md:387`'s own
   frequency rule argues against them in a daily-use tool.
9. **Font smoothing at the root** (`mifb/typography.md:65-99`) — a macOS preference, not a
   standard.
10. **The 60-second task budget** (`critique.md:656`) and **Core Web Vitals targets**
    (`optimize.md:190-210`) — the first is unanchored, the second belongs to engineering
    standards, not the design rubric.

The three imports that most repay the effort, in order: **the browser-surfaces checklist**
(`craft-floor.md:15`) for craft; **the self-similarity test** (`frontend-design/SKILL.md:35`) for
originality, which today has no procedure at all; and **motion restraint by interaction
frequency** (`better-ui/animations.md:387`), which is the one motion rule written for exactly this
register.

---

## 6. Limits of this research

- Skill contents are as of 2026-08-13 on this machine. `impeccable` is versioned (v4.0.4,
  `SKILL.md:4`); the other three carry no version field, so drift is undetectable from the files.
- `better-ui` and `make-interfaces-feel-better` are two versions of one skill; treating them as
  independent corroboration of any shared claim would be double-counting. Every claim above marked
  as appearing in both is noted as such.
- Detector thresholds were read from source constants, not from a run. No skill was executed
  against a Teacher & School surface, so no claim here is backed by an observed failure in this
  product — which is precisely why this document proposes anchors for a layer outside the
  catalogue rather than new controls.
- `impeccable`'s `document.md`, `init.md`, `live.md`, `live-setup.md`, `hooks.md`, `doctor.md`,
  `extract.md`, `visualize.md`, and the four native-platform files were read at heading level
  only. Three devices were pulled from that skim (`document.md:237-249`, `live.md:141`,
  `live.md:157`); a full read could surface more.
