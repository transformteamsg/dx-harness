# Design Skills Restructure — Spec

**Date:** 2026-08-12
**Status:** Locked — assembled from [wayfinder map #28](https://github.com/transformteamsg/dx-harness/issues/28)
**Owner:** Reza Ilmi

## Purpose

Restructure the dx-harness design skills into the `dx-design-*` family: one orchestrator in
front, one builder, five propose-only passes, a graded critique, a design-language definer,
plus setup, git help, feedback, and research-brief. Every decision below was resolved on a
wayfinder ticket; this document is the single hand-off for a separate implementation effort.

Each section cites its source ticket. Conventions marked **(assembly)** were sharpened while
assembling this spec, as the map planned.

## 1. The skill family — renames and fates

All design skills take the `dx-design-*` prefix. ([#48](https://github.com/transformteamsg/dx-harness/issues/48))

| Today | Becomes | Change |
|---|---|---|
| `dx-start` | `dx-design` | Evolves into the orchestrator; claims the bare name |
| `dx-design` (six-phase loop) | `dx-design-make` | Slimmed: keeps intent + diverge; back half becomes shared procedure docs |
| `dx-critique` | `dx-design-critique` | Goes propose-only; gains re-audit asks |
| `dx-copy` | `dx-design-copy` | Pass; drops non-surface prose |
| `dx-flow` | `dx-design-flow` | Pass |
| `dx-layout` | `dx-design-pattern` | Pass; widened to named-pattern fit |
| `dx-motion` | `dx-design-motion` | Pass |
| `dx-polish` | `dx-design-polish` | Pass |
| `dx-standards` | — | Deleted outright; mechanics relocate (§8) |
| `dx-setup` | `dx-design-setup` | Tools-only + orientation; DESIGN.md seeding moves out |
| `dx-git-buddy` | `dx-design-git-helper` | Persona and memory kept; gains the branch guard |
| `dx-feedback` | `dx-design-feedback` | Rename |
| `dx-research-brief` | `dx-design-research-brief` | Rename only |
| — | `dx-design-language` | New: defines the design language, writes DESIGN.md |
| `dx-evaluator` (agent) | `dx-design-reviewer` | The design review agent; gains a verdict re-check pass |

The engineering skills group is untouched.

## 2. Architecture — Shape C

([#40](https://github.com/transformteamsg/dx-harness/issues/40), grounded in the
[orchestrator-vs-loop research](https://github.com/transformteamsg/dx-harness/blob/research/orchestrator-vs-loop/docs/research/orchestrator-vs-loop-architectures.md), [#39](https://github.com/transformteamsg/dx-harness/issues/39))

- `dx-design-make` keeps the loop's front half: **intent** and **diverge**.
- The loop's back half — **plan approval, implement, design review, rule proposal** — is
  extracted into shared procedure docs. `dx-design-make`, the orchestrator's improve-existing
  fan-out, and the five passes all load them. The orchestrator rejoins the shared back half at
  plan approval.
- Routed-to skills run in a **return-to-caller / hand-off mode** that skips their own
  interview, so nobody is interviewed twice and plan approval happens exactly once per run —
  asked by whoever started the run.
- The five passes keep **both entries**: directly callable for sharp asks, and dispatchable as
  propose-only subagents when the orchestrator fans out.

### Shared procedure docs **(assembly: location proposed here)**

Proposed home: `plugins/dx-harness/procedures/` — plugin root, beside `standards/` and
`checks/`, so no non-skill folder sits inside a scanned skills directory. The implementation
effort may adjust the path; the doc set is locked:

| Doc | Holds | Source |
|---|---|---|
| `plan-approval.md` | Stop-once protocol; explicit build ask counts as approval; L1 waiver approval happens here | #40 |
| `implement.md` | Frontend-only constraints; the branch guard | #40, #34 |
| `design-review.md` | Fresh-context reviewer dispatch; verdict re-check from new screenshots | #40 |
| `rule-proposal.md` | How the catalogue grows; "harness friction is a feedback issue, not a rule proposal" | #33 |
| `catalogue-mechanics.md` | Control filtering, tier behaviour, detail files, escalation, path resolution, plain-title naming | #33 |
| `design-tickets.md` | The design-ticket conventions (§9) | assembly |

## 3. The orchestrator — `dx-design`

([#29](https://github.com/transformteamsg/dx-harness/issues/29), [#33](https://github.com/transformteamsg/dx-harness/issues/33))

- **Invocation.** Model-invocable catch-all plus typed command. Ambiguous or dimensionless
  asks trigger it; sharp asks route directly to their specialist skill and skip it.
- **Opening: grill first.** Targeted questions one at a time, via a grilling skill vendored
  into the plugin (§3.1). Fallback when the person can't engage: five plain-language modes —
  **make something new / improve what exists / brainstorm / define your design language /
  set up or fix my tools**. Skill names appear only at handoff. The menu stays five modes;
  the git helper and rule questions are routed off-menu.
- **Entry context check** (kept from dx-start): agent-browser present, DESIGN.md present.
  Missing capture → setup; missing DESIGN.md → design-language.
- **Improve-what-exists (light triage).** Capture the page, skim, name standout issues — no
  full grading (scored audits stay critique's). One accepted issue in one dimension → that
  pass. Several across dimensions → parallel propose-only pass subagents; the orchestrator
  merges proposals into one ranked plan; one plan approval; a single frontend-only
  implementer applies accepted fixes; the design reviewer checks the whole result. When more
  than one credible approach exists, render the options as HTML artifacts first and build
  only the chosen one.
- **Brainstorm mode** lives inside the orchestrator: ground on the capture + DESIGN.md,
  explore 2–3 directions with trade-offs, route once a direction is chosen.
- **Rule and waiver questions** ("can I waive TOK-1?", "does CMP-3 apply here?") are the
  orchestrator's. It reads `standards/README.md` plus `catalogue-mechanics.md`, answers, then
  offers the one next step that fits: record the approved waiver on the surface's design
  ticket, promote a repeated waiver into DESIGN.md's Overrides, or start a rule proposal.
  It acts only on an explicit yes; it never builds.

### 3.1 Vendored grilling skill — snapshot + provenance

**(assembly: decided with the human, 2026-08-12)** The grilling skill is copied into the
plugin as a snapshot. The copy carries a provenance header: upstream URL and the upstream
commit it was taken from. A person re-checks the copy by hand when the plugin version bumps.
No sync tooling.

## 4. The builder — `dx-design-make`

([#40](https://github.com/transformteamsg/dx-harness/issues/40))

- The **only** skill that edits the product. It also builds accepted findings handed over by
  the passes and critique.
- Runs intent → diverge → plan approval → implement → design review (back half via the
  shared procedure docs).
- **Diverge** renders 2–3 genuinely different directions as real HTML pages — published as
  Claude Artifacts when running in Claude Code (or the host harness's equivalent) and opened
  automatically. The pick becomes a contract the design review audits against.
- **Plan approval.** An explicit ask to build a specific plan or chosen direction counts as
  approval — the run just builds. Otherwise the run stops exactly once, asked by whoever
  started the run.
- **Branch guard** (via `implement.md`, so all callers get it): after a fetch, if the person
  is on main/master or their branch is behind the remote default, hand off to the git helper —
  heads-up in plain words, propose the fix (new branch / pull), act only after the person
  agrees. No time heuristic.
- **Design review.** The `dx-design-reviewer` agent: fresh context, propose-only, spawned
  once per run by whoever started the run. After fixes, new screenshots go back to the same
  reviewer, which marks each fix resolved / partial / unresolved. The builder's narration is
  not evidence.
- The name `dx-design-prototype` was considered and rejected (collides with `/prototype` and
  the wayfinder ticket type; this skill ships verified production work).

## 5. The passes — copy, flow, pattern, motion, polish

([#32](https://github.com/transformteamsg/dx-harness/issues/32), [#48](https://github.com/transformteamsg/dx-harness/issues/48))

**Shape (all five).** A pass is propose-only: up to five ranked findings in its dimension,
recorded as a comment on the surface's design ticket — accepted and not-accepted alike, so
nothing is silently dropped. Accepted findings go to `dx-design-make` to build. A pass never
edits the product.

**Routing boundaries.**

- **Stated-edit boundary:** an ask stating the exact edit ("set the padding to 16px") is
  make's; an open-ended ask naming a pass dimension is the pass's. Exception: a pattern swap
  ask ("these cards should be a list") stays with pattern even when stated as an edit.
- **"One named dimension" means the five pass dimensions.** Audits naming any other dimension
  (accessibility, responsiveness, loading states) stay with critique.
- **Look vs behave:** pattern owns screen-level presentation of a named pattern; flow owns
  cross-step behaviour (traversal, async states, escapability, draft safety). Empty-state
  wording routes to copy.
- **Pattern vs polish:** pattern takes structure, hierarchy, density, grouping, card
  composition, pattern choice; polish takes tokens, type, colour. Bare "hierarchy" is
  pattern's; type/weight hierarchy (SLP-6) is polish's.

**`dx-design-pattern` (widened).** Judges structure (today's LAY-1..7 + SLP-4/5/11) plus
named-pattern fit. May propose up to a whole-page same-content rebuild — same information and
functionality after the change. A whole-page rebuild always stops at plan approval; smaller
accepted findings count as approved. Changes that add or remove information, features, or
screens are never pattern findings — they are make intents.

**Pattern inventory.** `layout-patterns.md` moves out of dx-critique to sit beside the
catalogue in `standards/`, expanded into the named-pattern inventory (list vs cards,
master-detail, wizard presentation, empty-state structure). Guidance, not controls — a
control always wins on conflict.

**`dx-design-copy`** drops non-surface prose (site content, marketing, documentation,
decision records). No design-family skill claims it.

## 6. The critique — `dx-design-critique`

([#48](https://github.com/transformteamsg/dx-harness/issues/48), [#29](https://github.com/transformteamsg/dx-harness/issues/29))

Grades an existing page: capture, score against the catalogue and pattern inventory, return
ranked suggestions. Now **propose-only** — findings recorded on the surface's design ticket,
make builds accepted ones. Takes whole-page review asks with no change or pass dimension
named — including "I don't like it" and re-audit asks ("re-check this page against the
catalogue"). Scored audits stay here; the orchestrator's light triage never grades.

## 7. The design language — `dx-design-language` and DESIGN.md

### DESIGN.md ([#30](https://github.com/transformteamsg/dx-harness/issues/30))

Reference-first: the Control Catalogue is always the rulebook; DESIGN.md never restates a
control. Ten sections, all optional except as noted:

1–8. **Branding decisions:** Essence, Colour, Typography, Tokens (pointers into code — code
is the authority), Motion, Voice & Tone, Layout system (machine-read bullets, kept exact),
Components (incl. manifest pointer).
9. **Guardrails:** product-specific agent instructions nothing in the catalogue covers
(≤10 bullets).
10. **Overrides:** one structured line per standing product-level deviation —
`<CONTROL-ID> (<tier>): <adjusted rule> — reason: …[; approver: …]`. Tier mechanics enforced
by the generator: **L0 never** (line rejected), **L1 requires a named approver**, **L2
requires a reason**. Checks and the design reviewer grade against the adjusted rule and
surface every active override.

**`.dx/design.json`** stays generated-only and becomes a typed projection, not a transcript:
only what checks and the reviewer consume, plus `catalog_version` for staleness detection.
Precedence: catalogue governs portfolio rules · code governs implemented primitives ·
DESIGN.md carries this product's decisions and deviations. Absent file = portfolio defaults =
valid state.

**Generator/checks work items:** overrides parser with tier validation and control-id
existence check against `catalog.yaml`; `catalog_version` stamping; fix the fields-OR-prose
parse so mixed sections survive; `detect.py` + reviewer load overrides.

Prototype template: [DESIGN-v2.PROTOTYPE.md on `prototype/design-md-template`](https://github.com/transformteamsg/dx-harness/blob/prototype/design-md-template/plugins/dx-harness/docs/templates/DESIGN-v2.PROTOTYPE.md).

### The guided procedure ([#31](https://github.com/transformteamsg/dx-harness/issues/31))

- **Health-scan first.** Scan the repo (tokens file, consistent scales, component manifest,
  hex sprawl) and state a verdict with evidence: **evidence-first** (mine code, present
  confirm-or-correct) on a healthy repo; **interview-first** on an inconsistent or token-less
  one. The human can overrule.
- **Evidence sources.** Code, plus built-in ingest: Figma via MCP (the skill sets the MCP up
  itself) and pasted brand docs or screenshots. On disagreement the human makes a
  **source-of-truth election** (code / Figma / hybrid per part). The election guides
  elicitation only: code stays the runtime authority; where the elected source beats shipped
  code, the skill files fix-todos. The skill never writes product code.
- **Walkthrough.** First run: one ordered pass through the ten sections. Each section is
  skippable (skip = portfolio default, said out loud) or deferrable as one tracker issue per
  section carrying that section's guiding questions (§9.3). Re-runs default to targeted
  single-section edits. Real interviewing is reserved for Essence, Voice & Tone, Guardrails;
  minable sections are confirm-or-correct. Per-section guiding questions: drafted on
  [#31's resolution](https://github.com/transformteamsg/dx-harness/issues/31).
- **Overrides start empty.** Deviations earn their place via the promotion flow (recurring
  per-run waiver → standing override, tier mechanics enforced). Volunteered deviations are
  recorded properly, not refused.
- **Approval and generation.** Per-section confirm-or-correct is the approval, plus one
  rendered preview of the assembled file — then write DESIGN.md, regenerate
  `.dx/design.json`, offer the commit.
- **Updates.** Guided entry points: human-asked changes and waiver promotion. Drift (stale
  `catalog_version`, dead token pointers) is a start-of-every-session check — banner +
  re-stamp — not a standalone flow.
- **Audience.** One person at the keyboard, possibly relaying team decisions. The L1
  approver field records accountability, not presence.

## 8. Deleting `dx-standards` — where the content lands

([#33](https://github.com/transformteamsg/dx-harness/issues/33))

1. **Run-time catalogue mechanics → `catalogue-mechanics.md`** (§2): control filtering
   (phase, surface, products/audiences), tier behaviour for agents (L0 never waives; L1 needs
   a named human approver at plan approval; L2 needs a real reason), when to read a detail
   file, the "control seems wrong" escalation, "never answer waiver questions from memory",
   catalogue path resolution. Loaded by every catalogue-consuming skill: make, the five
   passes, critique, design-language, the orchestrator, the design reviewer.
2. **The local catalogue file stays canonical for agents** — `standards/catalog.yaml` from
   the plugin, never a hosted copy. Website anchors are for humans.
3. **`standards/README.md` is unchanged.**
4. **The orchestrator answers rule questions** (§3).
5. **Plain-title rule naming** (written into the shared doc): say the rule in plain words
   first, id in brackets, website link — "no raw hex colours — use the design tokens (TOK-1,
   see link)". Bare ids are never the designer-facing name.
6. **"Ratchet" → "rule proposal"** (CONTEXT.md updated; routing note travels with
   `rule-proposal.md`).
7. **Deleted outright** — no stub under `dx-standards` (stub shims are for renamed skills
   only).

### Catalogue rule 5 — wording amendment

The DESIGN.md Overrides mechanism requires a one-line amendment to
`standards/README.md` rule 5 so standing overrides are sanctioned. Current wording:

> **One catalog for the whole portfolio.** No per-product control overlays; per-product
> difference is nuance calibration, never separate rules.

Amended wording **(assembly: drafted here; lands with implementation)**:

> **One catalog for the whole portfolio.** No per-product control overlays; per-product
> difference is nuance calibration or a standing override declared in that product's
> DESIGN.md (L0 never; L1 needs a named approver; L2 needs a reason) — never separate rules.

The catalogue itself stays single; overrides live in each product's DESIGN.md.

## 9. Design tickets — conventions **(assembly)**

([#40](https://github.com/transformteamsg/dx-harness/issues/40) decided tracker-based records;
formats sharpened here. These conventions become `procedures/design-tickets.md`.)

### 9.1 The ticket

- One long-lived issue per surface (page or flow). Title: `Design: <surface>` where
  `<surface>` is the route path (`/marks`) or the flow name (`marks entry wizard`).
  Label: `design-ticket`.
- Created by the first run that touches the surface (make, a pass, or critique). Runs find it
  by label + title match; sub-issues only for genuinely separate work items.
- `dx-design-setup` checks and wires the tracker (via the repo's issue-tracker doc where one
  exists). Repos without a tracker fall back to local markdown (§9.4).

### 9.2 Comment formats

Every comment opens with a typed heading, so agents can parse the history:

- **Run record** — `## Run — <date> — <skill>`: the approved plan (or "explicit build ask —
  counted as approval"), waivers granted this run (plain title + id, tier, reason, approver
  for L1), design review verdict including fix re-checks (resolved / partial / unresolved),
  link to the commit or PR.
- **Findings** — `## Findings — <date> — <pass or critique>`: ranked list, up to five for a
  pass; each finding named plain-title-first where a control applies, and marked `accepted` /
  `not accepted` once the human responds. Accepted findings link to the run record of the
  make run that built them.
- **Waiver record** — `## Waiver — <date>`: written by the orchestrator's rule-question route
  when a waiver is approved outside a run. Same fields as run-record waivers.

### 9.3 Related issues (not on the design ticket)

- **Deferred DESIGN.md section** (from design-language): one issue per skipped section.
  Title: `DESIGN.md: <section>`. Label: `design-language-todo`. Body carries that section's
  guiding questions.
- **Fix-todo** (code catch-up after a source-of-truth election): title `Design fix: <what>`,
  label `design-fix-todo`, body cites the elected source and the code it beats.

### 9.4 Local-markdown fallback

No tracker → one file per surface: `docs/design-tickets/<surface-slug>.md`, the same typed
blocks appended chronologically. Deferred sections and fix-todos append to
`docs/design-tickets/TODO.md` as checklist items with the same titles.

## 10. The git helper — `dx-design-git-helper`

([#34](https://github.com/transformteamsg/dx-harness/issues/34))

`dx-git-buddy` renamed. The Gitty persona (🦔) and per-person memory stay. Scope stays:
explain git in plain words, do it with the person safely, remember what they tell it.
`disable-model-invocation: true` is removed so the orchestrator can hand off directly; the
slash command still works. Not on the five-mode menu. Runs the branch guard when a design
build hands off (§4). The description is functional only; the persona lives in the body.

## 11. Rename mechanics and rollout

([#35](https://github.com/transformteamsg/dx-harness/issues/35) — full write-up:
[plugin-skill-renames.md on `research/plugin-skill-renames`](https://github.com/transformteamsg/dx-harness/blob/research/plugin-skill-renames/docs/research/plugin-skill-renames.md))

Facts: there is no skill-level alias or deprecation mechanism in Claude Code; the invocation
string comes from SKILL.md frontmatter `name` (directory name is independent); updates are
pull-based and gated by the `plugin.json` version string.

Staging:

1. **Release 1:** frontmatter `name:` renames + full doc/prose sweep (~15 command strings in
   READMEs, ONBOARDING.md, skill bodies; two routing descriptions) + version bump — one
   atomic release. Directory names (and their 20 relative-path cross-references) unchanged.
2. **Stub shims:** a deprecated stub skill under each old name pointing to the new one, kept
   for a release or two. (Renamed skills only — not `dx-standards`.)
3. **Later commit:** optional directory renames + relative-path rewrite, mechanical.
4. **CHANGELOG** entry with the old→new mapping — there is no forced migration; stragglers
   keep old names until they update.

## 12. Routing descriptions — locked texts

The 13 frontmatter descriptions are locked on
[#48's resolution](https://github.com/transformteamsg/dx-harness/issues/48) — the
implementation effort copies them verbatim from that comment. Principles they encode:
product framing generalised (no "Teacher & School"); specialists stay directly
model-invocable; passes use a hybrid propose-only template with the stated-edit boundary;
critique propose-only + re-audit asks; non-pass-dimension audits stay critique's;
`dx-design-research-brief` keeps its existing description.

## 13. Glossary

`CONTEXT.md` already carries the adopted terms: orchestrator, pass, pattern inventory, plan
approval, diverge, design ticket, rule proposal, standing override, guardrails, design
review, design language, branch guard, source-of-truth election. Implementation should keep
code and docs on these exact terms.

## 14. Future work (out of this spec)

- **Concept roll for diverge** — impeccable-style externalized option selection to stop runs
  converging on the default direction. Decided 2026-08-12: not adopted now; a later effort
  can take the bet.
- **Portable DESIGN.md export** — a generated self-contained brief for non-harness agents
  (à la getdesign.md / vercel.com/design.md), with provenance safeguards. Deferred from #30.
- **Pattern rules graduating into catalogue controls** — catalogue evolution stays outside
  this effort ([map #28](https://github.com/transformteamsg/dx-harness/issues/28) scope).

## Sources

| Ticket | Decided |
|---|---|
| [#29](https://github.com/transformteamsg/dx-harness/issues/29) | Orchestrator: routing, grill-first, triage, fan-out |
| [#30](https://github.com/transformteamsg/dx-harness/issues/30) | DESIGN.md contents, Overrides, `.dx/design.json` |
| [#31](https://github.com/transformteamsg/dx-harness/issues/31) | dx-design-language guided procedure |
| [#32](https://github.com/transformteamsg/dx-harness/issues/32) | Pattern scope; propose-only pass shape |
| [#33](https://github.com/transformteamsg/dx-harness/issues/33) | dx-standards relocation; rule questions; rule proposal |
| [#34](https://github.com/transformteamsg/dx-harness/issues/34) | Git helper; branch guard |
| [#35](https://github.com/transformteamsg/dx-harness/issues/35) | Rename mechanics (research) |
| [#39](https://github.com/transformteamsg/dx-harness/issues/39) | Orchestrator-vs-loop architectures (research) |
| [#40](https://github.com/transformteamsg/dx-harness/issues/40) | Shape C; make; diverge; plan approval; design review; design tickets |
| [#48](https://github.com/transformteamsg/dx-harness/issues/48) | The 13 locked routing descriptions |
| [#36](https://github.com/transformteamsg/dx-harness/issues/36) | This assembly: location, grilling sync, concept roll deferral, ticket conventions, rule 5 amendment |
