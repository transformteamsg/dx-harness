# Design Skills Restructure — Spec

**Date:** 2026-08-12
**Status:** Locked — assembled from [wayfinder map #28](https://github.com/transformteamsg/dx-harness/issues/28)
**Owner:** Reza Ilmi

## Purpose

This spec restructures the dx-harness design skills into the `dx-design-*` family. The
family has one orchestrator in front, one builder, five propose-only passes, a graded
critique, and a design-language skill. It also keeps setup, git help, feedback, and
research-brief skills.

Every decision below was resolved on a wayfinder ticket. This document is the single
hand-off for a separate implementation effort. Each section cites its source ticket. The
mark **(assembly)** shows a convention that was sharpened while this spec was assembled,
as the map planned.

## 1. The skill family — renames and fates

All design skills take the `dx-design-*` prefix. ([#48](https://github.com/transformteamsg/dx-harness/issues/48))

| Today | Becomes | Change |
|---|---|---|
| `dx-start` | `dx-design` | Becomes the orchestrator; claims the bare name |
| `dx-design` (six-phase loop) | `dx-design-execute` | Slimmed: keeps intent + diverge; the back half moves to shared procedure docs |
| `dx-critique` | `dx-design-critique` | Goes propose-only; gains re-audit asks |
| `dx-copy` | `dx-design-copy` | Pass; drops non-surface prose |
| `dx-flow` | `dx-design-flow` | Pass |
| `dx-layout` | `dx-design-pattern` | Pass; widened to named-pattern fit |
| `dx-motion` | `dx-design-motion` | Pass |
| `dx-polish` | `dx-design-polish` | Pass |
| `dx-standards` | — | Deleted; the content relocates (§8) |
| `dx-setup` | `dx-design-setup` | Tools-only + orientation; DESIGN.md seeding moves out |
| `dx-git-buddy` | `dx-design-git` | Persona and memory stay; gains the branch guard |
| `dx-feedback` | `dx-design-feedback` | Rename |
| `dx-research-brief` | `dx-design-research-brief` | Rename only |
| — | `dx-design-language` | New: defines the design language and writes DESIGN.md |
| `dx-evaluator` (agent) | `dx-design-review` | Does the design review; gains a verdict re-check pass |

The engineering skills group does not change.

## 2. Architecture — Shape C

([#40](https://github.com/transformteamsg/dx-harness/issues/40), grounded in the
[orchestrator-vs-loop research](https://github.com/transformteamsg/dx-harness/blob/research/orchestrator-vs-loop/docs/research/orchestrator-vs-loop-architectures.md), [#39](https://github.com/transformteamsg/dx-harness/issues/39))

- `dx-design-execute` keeps the front half of the loop: **intent** and **diverge**.
- The back half of the loop moves into shared procedure docs. The back half is: **plan
  approval**, **implement**, **design review**, and **rule proposal**. `dx-design-execute`,
  the orchestrator, and the five passes all load these docs. The orchestrator joins the
  shared back half at plan approval.
- A routed-to skill runs in a **return-to-caller mode**. This mode skips the skill's own
  interview. So no person is interviewed twice. Plan approval occurs one time per run.
  Whoever started the run asks it.
- The five passes keep **two entries**. A person can call a pass directly with a sharp
  ask. The orchestrator can also dispatch a pass as a propose-only subagent.

### Shared procedure docs **(assembly: location proposed here)**

Proposed home: `plugins/dx-harness/procedures/` — at the plugin root, beside `standards/`
and `checks/`. Then no non-skill folder sits inside a scanned skills directory. The
implementation effort can adjust the path. The doc set is locked:

| Doc | Holds | Source |
|---|---|---|
| `plan-approval.md` | Stop-once protocol; an explicit build ask counts as approval; L1 waiver approval happens here | #40 |
| `implement.md` | Frontend-only constraints; the branch guard | #40, #34 |
| `design-review.md` | Fresh-context reviewer dispatch; verdict re-check from new screenshots | #40 |
| `rule-proposal.md` | How the catalogue grows; "harness friction is a feedback issue, not a rule proposal" | #33 |
| `catalogue-mechanics.md` | Control filtering, tier behaviour, detail files, escalation, path resolution, plain-title naming | #33 |
| `design-tickets.md` | The design-ticket conventions (§9) | assembly |

## 3. The orchestrator — `dx-design`

([#29](https://github.com/transformteamsg/dx-harness/issues/29), [#33](https://github.com/transformteamsg/dx-harness/issues/33))

- **Invocation.** `dx-design` is a model-invocable catch-all and a typed command. An
  unclear, mixed, or dimensionless ask triggers it. A sharp ask routes directly to its
  specialist skill and skips the orchestrator.
- **Opening: grill first.** The orchestrator asks targeted questions, one at a time. It
  uses a grilling skill vendored into the plugin (§3.1). If the person cannot engage with
  open questions, it falls back to five plain modes: **make something new / improve what
  exists / brainstorm / define your design language / set up or fix my tools**. Skill
  names appear only at handoff. The menu keeps five modes. Git asks and rule questions
  route off-menu.
- **Entry context check** (kept from dx-start): agent-browser present, DESIGN.md present.
  Missing capture → setup. Missing DESIGN.md → design-language.
- **Improve what exists (light triage).** Capture the page. Skim it. Name the standout
  issues. Do not grade — scored audits stay with critique. One accepted issue in one
  dimension → that pass. Several issues across dimensions → parallel propose-only pass
  subagents. The orchestrator merges the proposals into one ranked plan. There is one
  plan approval. One frontend-only implementer applies the accepted fixes. The design
  reviewer checks the full result. When more than one credible approach exists, the
  orchestrator first renders the options as HTML artifacts. It builds only the chosen
  one.
- **Brainstorm mode** lives inside the orchestrator. It grounds on the capture and
  DESIGN.md. It explores 2–3 directions with trade-offs. It routes when the person picks
  a direction.
- **Rule and waiver questions** ("can I waive TOK-1?", "does CMP-3 apply here?") belong
  to the orchestrator. It reads `standards/README.md` and `catalogue-mechanics.md`, then
  answers. Then it offers the one next step that fits: record the approved waiver on the
  surface's design ticket, promote a repeated waiver into DESIGN.md's Overrides, or
  start a rule proposal. It acts only on an explicit yes. It never builds.

### 3.1 Vendored grilling skill — snapshot + provenance

**(assembly: decided with the human, 2026-08-12)** The grilling skill is copied into the
plugin as a snapshot. The copy has a provenance header: the upstream URL and the upstream
commit. A person re-checks the copy by hand at each plugin version bump. There is no sync
tooling.

## 4. The builder — `dx-design-execute`

([#40](https://github.com/transformteamsg/dx-harness/issues/40))

**(assembly: renamed by the human, 2026-08-12.** #40 named this skill `dx-design-make`
and the review agent `dx-design-reviewer`. The human later chose `dx-design-execute` and
`dx-design-review`. This spec carries the current names everywhere.)

- The **only** skill that edits the product. It also builds accepted findings from the
  passes and from critique.
- The run is: intent → diverge → plan approval → implement → design review. The back half
  comes from the shared procedure docs.
- **Diverge** renders 2–3 clearly different directions as real HTML pages. In Claude Code
  they publish as Claude Artifacts; other harnesses use their equivalent. They open in
  the browser automatically. The pick becomes a contract. The design review audits
  against it.
- **Plan approval.** An explicit ask to build a specific plan or chosen direction counts
  as approval — the run just builds. In all other cases the run stops one time. Whoever
  started the run asks.
- **Branch guard** (in `implement.md`, so all callers get it). The run does a fetch. If
  the person is on main/master, or their branch is behind the remote default branch, the
  run hands off to the git helper. The helper explains the risk in plain words and
  proposes the fix (new branch / pull). It acts only after the person agrees. There is no
  time heuristic.
- **Design review.** The `dx-design-review` agent has fresh context and is
  propose-only. Whoever started the run spawns it, one time per run. After fixes, new
  screenshots go back to the same reviewer. The reviewer marks each fix resolved /
  partial / unresolved. The builder's narration is not evidence.
- The name `dx-design-prototype` was considered and rejected. It collides with the
  `/prototype` skill and with the wayfinder ticket type. Both of those mean throwaway
  artifacts; this skill ships verified production work.

## 5. The passes — copy, flow, pattern, motion, polish

([#32](https://github.com/transformteamsg/dx-harness/issues/32), [#48](https://github.com/transformteamsg/dx-harness/issues/48))

**Shape (all five).** A pass is propose-only. It records up to five ranked findings in its
dimension as a comment on the surface's design ticket. It records accepted and
not-accepted findings alike, so nothing is silently dropped. `dx-design-execute` builds the
accepted findings. A pass never edits the product.

**Routing boundaries.**

- **Stated-edit boundary.** An ask that states the exact edit ("set the padding to 16px")
  goes to make. An open-ended ask that names a pass dimension goes to that pass.
  Exception: a pattern swap ask ("these cards should be a list") stays with pattern, even
  when stated as an edit.
- **"One named dimension" means the five pass dimensions.** An audit that names any other
  dimension (accessibility, responsiveness, loading states) stays with critique.
- **Look vs behave.** Pattern owns the screen-level presentation of a named pattern. Flow
  owns cross-step behaviour: traversal, async states, escapability, draft safety.
  Empty-state wording goes to copy.
- **Pattern vs polish.** Pattern takes structure, hierarchy, density, grouping, card
  composition, and pattern choice. Polish takes tokens, type, and colour. Bare
  "hierarchy" goes to pattern. Type/weight hierarchy (SLP-6) goes to polish.

**`dx-design-pattern` (widened).** It judges structure (today's LAY-1..7 + SLP-4/5/11)
plus named-pattern fit. It may propose up to a whole-page rebuild, if the page shows the
same information and functionality after the change. A whole-page rebuild always stops at
plan approval. A smaller accepted finding counts as approved. A change that adds or
removes information, features, or screens is never a pattern finding — it is a make
intent.

**Pattern inventory.** `layout-patterns.md` moves out of dx-critique. It sits beside the
catalogue in `standards/`. It grows into the named-pattern inventory: list vs cards,
master-detail, wizard presentation, empty-state structure. It is guidance, not controls.
A control always wins on conflict.

**`dx-design-copy`** drops non-surface prose: site content, marketing, documentation,
decision records. No design-family skill claims it.

## 6. The critique — `dx-design-critique`

([#48](https://github.com/transformteamsg/dx-harness/issues/48), [#29](https://github.com/transformteamsg/dx-harness/issues/29))

Critique grades an existing page. It captures the page, scores it against the catalogue
and the pattern inventory, and returns ranked suggestions. It is now **propose-only**: it
records findings on the surface's design ticket, and make builds the accepted ones. It
takes whole-page review asks that name no change and no pass dimension — including "I
don't like it" and re-audit asks ("re-check this page against the catalogue"). Scored
audits stay here. The orchestrator's light triage never grades.

### The annotated-evidence report

**(assembly: brought in from [tfx-design-standard#39](https://github.com/transformteamsg/tfx-design-standard/issues/39); decided with the human, 2026-08-12)**

Every critique run ends with a shareable HTML report. The report is critique's default
output and its present step. It lives inside `dx-design-critique` — no new skill. The five
passes do not produce it.

- **Shape.** Each finding sits beside a cropped screenshot of the live surface. A rounded
  highlight box (3px) marks the specific element. Crops come from the full-res 1280
  capture and downscale to ~760px. Comparison findings stack crops from several pages
  into one image.
- **Self-check.** Before the report publishes, the skill renders a contact sheet of all
  crops and re-reads it. This step catches misplaced boxes. It is mandatory.
- **Document structure.** The reference format is locked on
  [#39's comment](https://github.com/transformteamsg/tfx-design-standard/issues/39):
  title + one-line lede ("no code changed"); a fact grid; a summary block with tier
  counts and a "reply with S-numbers to approve" line; the suggestions table first (S#,
  fixes F#, controls, impact, cost, quick-win rows); annotated findings F1..Fn; code-level
  findings; the full catalogue coverage table (a "verify" verdict means evidence
  incomplete, never "failed"); a "what works — preserve" section; an appendix with full
  captures. Rejected suggestions get a "considered and declined" line — nothing is
  silently dropped.
- **Working conventions.** Keep F-/S-numbering stable across revisions; removals leave
  gaps. The HTML is self-contained: base64 images, light/dark theme. Republish to the
  same artifact URL on each pass, with a version label.
- **Fit with this restructure.** The findings still go on the surface's design ticket
  (§9.2); the findings comment links to the report. An S-number approval marks the
  finding `accepted`, and `dx-design-execute` builds it. The report proposes only — critique
  stays propose-only.

## 7. The design language — `dx-design-language` and DESIGN.md

### DESIGN.md ([#30](https://github.com/transformteamsg/dx-harness/issues/30))

DESIGN.md is reference-first. The Control Catalogue is always the rulebook. DESIGN.md
never restates a control. It has ten sections, all optional except as noted:

1–8. **Branding decisions:** Essence, Colour, Typography, Tokens (pointers into code —
code is the authority), Motion, Voice & Tone, Layout system (machine-read bullets, kept
exact), Components (with a manifest pointer).
9. **Guardrails:** product-specific agent instructions that no catalogue control covers
(≤10 bullets).
10. **Overrides:** one structured line per standing override —
`<CONTROL-ID> (<tier>): <adjusted rule> — reason: …[; approver: …]`. The generator
enforces the tier rules: **L0 never** (the line is rejected), **L1 needs a named
approver**, **L2 needs a reason**. Checks and the design reviewer grade against the
adjusted rule. They surface every active override.

**`.dx/design.json`** stays generated-only. It becomes a typed projection, not a
transcript: only what the checks and the reviewer consume, plus `catalog_version` for
staleness detection. Precedence: the catalogue governs portfolio rules · code governs
implemented primitives · DESIGN.md carries this product's decisions and deviations. An
absent file means portfolio defaults, and that is a valid state.

**Generator/checks work items:** an overrides parser with tier validation and a
control-id existence check against `catalog.yaml`; `catalog_version` stamping; a fix for
the fields-OR-prose parse, so mixed sections survive; `detect.py` and the reviewer load
overrides.

Prototype template: [DESIGN-v2.PROTOTYPE.md on `prototype/design-md-template`](https://github.com/transformteamsg/dx-harness/blob/prototype/design-md-template/plugins/dx-harness/docs/templates/DESIGN-v2.PROTOTYPE.md).

### The guided procedure ([#31](https://github.com/transformteamsg/dx-harness/issues/31))

- **Health scan first.** The skill scans the repo: tokens file, consistent scales,
  component manifest, hex sprawl. It states a verdict with its evidence. On a healthy
  repo it goes **evidence-first**: mine the code, then confirm-or-correct with the
  person. On an inconsistent or token-less repo it goes **interview-first**. The human
  can overrule either way.
- **Evidence sources.** Code, plus built-in ingest: Figma via MCP (the skill sets the MCP
  up itself) and pasted brand docs or screenshots. When sources disagree, the human makes
  a **source-of-truth election**: code, Figma, or a hybrid split per part. The election
  guides elicitation only. Code stays the runtime authority. Where the elected source
  beats shipped code, the skill files fix-todos. The skill never writes product code.
- **The walkthrough.** The first run is one ordered pass through the ten sections. The
  person can skip a section (skip = portfolio default, said out loud). The person can
  also defer a section as one tracker issue that carries the section's guiding questions
  (§9.3). Re-runs default to targeted single-section edits. Real interviewing is reserved
  for Essence, Voice & Tone, and Guardrails. Minable sections are confirm-or-correct.
  The per-section guiding questions are drafted on
  [#31's resolution](https://github.com/transformteamsg/dx-harness/issues/31).
- **Overrides start empty.** A deviation earns its place through the promotion flow: a
  recurring per-run waiver becomes a standing override, with the tier rules enforced. A
  volunteered deviation is recorded properly, not refused.
- **Approval and generation.** The per-section confirm-or-correct is the approval, plus
  one rendered preview of the assembled file. Then the skill writes DESIGN.md,
  regenerates `.dx/design.json`, and offers the commit.
- **Updates.** Two guided entry points: human-asked changes, and waiver promotion. Drift
  (stale `catalog_version`, dead token pointers) is a start-of-every-session check —
  banner + re-stamp. It is not a standalone flow.
- **Audience.** One person at the keyboard, possibly relaying team decisions. The L1
  approver field records accountability, not presence.

## 8. Deleting `dx-standards` — where the content lands

([#33](https://github.com/transformteamsg/dx-harness/issues/33))

1. **Run-time catalogue mechanics → `catalogue-mechanics.md`** (§2). It holds: how to
   filter controls (phase, surface, products/audiences); tier behaviour for agents (L0
   never waives; L1 needs a named human approver at plan approval; L2 needs a real
   reason); when to read a detail file; the "control seems wrong" escalation; "never
   answer waiver questions from memory"; catalogue path resolution. Every
   catalogue-consuming skill loads it: make, the five passes, critique, design-language,
   the orchestrator, and the design reviewer.
2. **The local catalogue file stays canonical for agents.** Agents read
   `standards/catalog.yaml` from the plugin, never a hosted copy. Website anchors are for
   humans.
3. **`standards/README.md` does not change.**
4. **The orchestrator answers rule questions** (§3).
5. **Plain-title rule naming** (written into the shared doc). Say the rule in plain words
   first, the id in brackets, then the website link: "no raw hex colours — use the design
   tokens (TOK-1, see link)". A bare id is never the designer-facing name.
6. **"Ratchet" → "rule proposal"** (CONTEXT.md updated; the routing note travels with
   `rule-proposal.md`).
7. **Deleted outright** — no stub under `dx-standards`. Stub shims are for renamed skills
   only.

### Catalogue rule 5 — wording amendment

The Overrides mechanism needs a one-line amendment to rule 5 in `standards/README.md`, so
standing overrides are sanctioned. Current wording:

> **One catalog for the whole portfolio.** No per-product control overlays; per-product
> difference is nuance calibration, never separate rules.

Amended wording **(assembly: drafted here; lands with implementation)**:

> **One catalog for the whole portfolio.** No per-product control overlays; per-product
> difference is nuance calibration or a standing override declared in that product's
> DESIGN.md (L0 never; L1 needs a named approver; L2 needs a reason) — never separate rules.

The catalogue itself stays single. Overrides live in each product's DESIGN.md.

## 9. Design tickets — conventions **(assembly)**

([#40](https://github.com/transformteamsg/dx-harness/issues/40) decided tracker-based
records. The formats are sharpened here. These conventions become
`procedures/design-tickets.md`.)

### 9.1 The ticket

- One long-lived issue per surface (page or flow). Title: `Design: <surface>`, where
  `<surface>` is the route path (`/marks`) or the flow name (`marks entry wizard`).
  Label: `design`.
- The first run that touches the surface creates the ticket (make, a pass, or critique).
  Runs find it by label + title match. Sub-issues are only for genuinely separate work
  items.
- `dx-design-setup` checks and wires the tracker. It uses the repo's issue-tracker doc
  where one exists. A repo without a tracker falls back to local markdown (§9.4).

### 9.2 Comment formats

Every comment opens with a typed heading, so agents can parse the history:

- **Run record** — `## Run — <date> — <skill>`. It holds: the approved plan (or "explicit
  build ask — counted as approval"); the waivers granted this run (plain title + id,
  tier, reason, approver for L1); the design review verdict with the fix re-checks
  (resolved / partial / unresolved); a link to the commit or PR.
- **Findings** — `## Findings — <date> — <pass or critique>`. A ranked list, up to five
  for a pass. Each finding is named plain-title-first where a control applies. Each is
  marked `accepted` / `not accepted` when the human responds. An accepted finding links
  to the run record of the make run that built it.
- **Waiver record** — `## Waiver — <date>`. The orchestrator's rule-question route writes
  this when a waiver is approved outside a run. Same fields as run-record waivers.

### 9.3 Related issues (not on the design ticket)

- **Deferred DESIGN.md section** (from design-language): one issue per skipped section.
  Title: `DESIGN.md: <section>`. Label: `design-language-todo`. The body carries that
  section's guiding questions.
- **Fix-todo** (code catch-up after a source-of-truth election): title
  `Design fix: <what>`, label `design-fix-todo`. The body cites the elected source and
  the code it beats.

### 9.4 Local-markdown fallback

No tracker → one file per surface: `docs/design-tickets/<surface-slug>.md`. The same
typed blocks are appended in time order. Deferred sections and fix-todos append to
`docs/design-tickets/TODO.md` as checklist items with the same titles.

## 10. The git helper — `dx-design-git`

([#34](https://github.com/transformteamsg/dx-harness/issues/34))

**(assembly: renamed by the human, 2026-08-12.** #34 named this skill
`dx-design-git-helper`. The human later chose `dx-design-git`.)

`dx-git-buddy` is renamed. The Gitty persona (🦔) and the per-person memory stay. The
scope stays: explain git in plain words, do it with the person safely, remember what they
tell it. `disable-model-invocation: true` is removed, so the orchestrator can hand off
directly. The slash command still works. The helper is not on the five-mode menu. It runs
the branch guard when a design build hands off (§4). The description is functional only.
The persona lives in the skill body.

## 11. Machine setup — `dx-design-setup`

`dx-design-setup` prepares a person's machine and orients newcomers. It verifies the
per-user tools: the agent-browser capture CLI + skill, an authenticated `gh`, and
Python + PyYAML for the checks. It also wires the design-ticket tracker (§9.1).

### Commit signing **(assembly: added by the human, 2026-08-12)**

Some repos require verified commit signatures on the default branch. An unsigned commit
then blocks every merge. Setup checks and fixes this once per machine:

1. **Check git config.** `gpg.format`, `user.signingkey`, and `commit.gpgsign` must be
   set. If they are not, configure SSH signing: `gpg.format ssh`,
   `user.signingkey ~/.ssh/<key>.pub`, `commit.gpgsign true`.
2. **Test a signature locally.** `echo test | ssh-keygen -Y sign -f ~/.ssh/<key> -n git`
   must produce a signature block.
3. **Check the key on GitHub.** The public key must be on the account as a **signing
   key**, not only as an auth key. Read it with `gh api user/ssh_signing_keys`. That call
   needs the `admin:ssh_signing_key` scope — if it is missing, guide the person through
   `gh auth refresh -h github.com -s admin:ssh_signing_key` (device login).
4. **Add the key if absent.** `gh api --method POST user/ssh_signing_keys` with a title
   and the public key.
5. **Know the order rule.** GitHub does not verify a signature retroactively. A commit
   pushed before the key was registered stays unverified. The fix: re-sign the commits
   (`git rebase --force-rebase <base>`) and force-push after the key exists.

The git helper (§10) applies the same steps when a design session hits a signature block
mid-run; setup exists so it never comes to that.

## 12. Rename mechanics and rollout

([#35](https://github.com/transformteamsg/dx-harness/issues/35) — full write-up:
[plugin-skill-renames.md on `research/plugin-skill-renames`](https://github.com/transformteamsg/dx-harness/blob/research/plugin-skill-renames/docs/research/plugin-skill-renames.md))

Facts: Claude Code has no skill-level alias or deprecation mechanism. The invocation
string comes from the SKILL.md frontmatter `name` when present, **falling back to the
directory name** — so a directory name never leaves the namespace, and a directory
whose name differs from its frontmatter `name` claims *both* strings. Renaming
frontmatter while keeping directories does not move a name; it makes the name
ambiguous, and the first end-to-end run observed the directory winning
([#121](https://github.com/transformteamsg/dx-harness/issues/121):
`dx-harness:dx-design` loaded the builder from the `dx-design/` directory, not the
orchestrator whose frontmatter claimed the name). Updates are pull-based and gated by
the `plugin.json` version string.

Staging — **corrected by #121**: step 3's directory renames were originally staged as
optional cleanup, but given the fallback they are the step that actually completes a
rename, so they are **required**, and a stub under a retired name cannot fire while a
live directory still holds that name:

1. **Release 1:** frontmatter `name:` renames + a full doc/prose sweep (~15 command
   strings in the READMEs, ONBOARDING.md, and skill bodies; two routing descriptions) +
   a version bump — one atomic release. As shipped, directory names (and their 20
   relative-path cross-references) did not change — which left every renamed skill
   colliding with its own former name until step 3 landed.
2. **Stub shims:** a deprecated stub skill under each old name, pointing to the new name.
   (Renamed skills only — not `dx-standards`.) As shipped under `deprecated-*`
   directories, every stub was shadowed by the live directory still holding its
   declared name, so no stub ever fired; the stub layer was retired unshipped and the
   stubs deleted outright when the directories were renamed (#121).
3. **Directory renames + relative-path rewrite.** Required, not optional — until
   directories match frontmatter, the old names stay live and ambiguous.
4. **CHANGELOG** entry with the old→new mapping. There is no forced migration —
   stragglers keep old names until they update.

## 13. Routing descriptions — locked texts

The 13 frontmatter descriptions are locked on
[#48's resolution](https://github.com/transformteamsg/dx-harness/issues/48). The
implementation effort copies them from that comment, with the later renames applied:
replace `dx-design-make` with `dx-design-execute`, and `dx-design-git-helper` with
`dx-design-git`. One content change: the `dx-design-setup` description adds commit
signing to its verified-tools list (§11). No other wording changes. The principles they encode:
product framing is generalised (no "Teacher & School"); specialists stay directly
model-invocable; passes use a shared propose-only template with the stated-edit boundary;
critique is propose-only and takes re-audit asks; audits that name a non-pass dimension
stay with critique; `dx-design-research-brief` keeps its existing description.

## 14. Glossary

`CONTEXT.md` already carries the adopted terms: orchestrator, pass, pattern inventory,
plan approval, diverge, design ticket, rule proposal, standing override, guardrails,
design review, design language, branch guard, source-of-truth election. Implementation
must keep code and docs on these exact terms.

One more term this spec uses often: a **waiver** is a one-time approved exception to one
control, for one run on one surface. L0 is never waived. An L1 waiver needs a named human
approver. An L2 waiver needs a real reason. A waiver that repeats can be promoted into a
standing override in DESIGN.md (§7).

## 15. Future work (out of this spec)

- **Concept roll for diverge** — impeccable-style externalized option selection, so runs
  do not converge on the default direction. Decided 2026-08-12: not adopted now. A later
  effort can take the bet.
- **Portable DESIGN.md export** — a generated self-contained brief for non-harness agents
  (like getdesign.md / vercel.com/design.md), with provenance safeguards. Deferred from
  #30.
- **Pattern rules graduating into catalogue controls** — catalogue evolution stays
  outside this effort ([map #28](https://github.com/transformteamsg/dx-harness/issues/28)
  scope).

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
| [tfx-design-standard#39](https://github.com/transformteamsg/tfx-design-standard/issues/39) | Annotated-evidence HTML report as critique's default output (brought in 2026-08-12) |
