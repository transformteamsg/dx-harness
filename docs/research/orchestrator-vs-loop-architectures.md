# Research: orchestrator vs phased-loop architectures in mature skill harnesses

**Issue:** [#39](https://github.com/transformteamsg/dx-harness/issues/39) · **Feeds:** the dx-design orchestrator decision ([#28](https://github.com/transformteamsg/dx-harness/issues/28))
**Sources studied:** compound-engineering plugin (Every), impeccable v4.0.4, dx-harness's own design skills. All claims below are grounded in the local source files listed per section.

## Answer first

Mature harnesses do **not** absorb their working procedures into the orchestrator, and they do **not** keep orchestration and execution fully separate either. Both prior arts converge on the same split, reached from opposite directions:

- **The orchestrator owns routing, sequencing, and gates — never the craft.** compound-engineering's `lfg` is 62 lines: it invokes skills in order and verifies each produced its artifact. impeccable's `SKILL.md` is 79 lines: a command router that loads one playbook per request.
- **The phase logic lives in load-on-demand procedure documents**, not in the orchestrator and not duplicated across skills. compound-engineering puts it in per-skill SKILL.md + `references/*.md`; impeccable puts it in 36 `reference/*.md` playbooks under one skill. Same mechanism, different packaging.
- **Evaluation is always a fresh-context, propose-only subagent.** Both harnesses (and dx-harness already) refuse to let the builder grade its own work, and both make the parent apply fixes rather than letting reviewers edit.
- **Human gates sit at durable artifacts** (a plan doc, a direction card, a findings table), and every gate has a documented unattended/headless behaviour so an outer pipeline can pass through it without silently skipping it.

**Implication for #28:** the six-phase loop should neither survive untouched as a monolith nor be dissolved into the orchestrator. The evidence supports a third shape the repo is already halfway to: **extract the loop's back half (plan-gate protocol, implement constraints, verify, ratchet) into shared procedure docs; keep `dx-design` as the make-new engine that sequences all six phases; let the orchestrator's improve-existing fan-out replace only phases 1–2 (intent/diverge) and rejoin the shared back half at the plan gate.** Details and honest trade-offs in the Recommendation section.

---

## Harness 1: compound-engineering (Every)

**Source:** `/Users/rezailmi/.claude-work/plugins/marketplaces/compound-engineering-plugin/plugins/compound-engineering/` — `skills/lfg/SKILL.md`, `skills/ce-brainstorm/SKILL.md`, `skills/ce-plan/SKILL.md`, `skills/ce-work/SKILL.md`, `skills/ce-code-review/SKILL.md`, `agents/` (50 agent definitions), `README.md`.

### Orchestrator role

`lfg` ("full autonomous engineering workflow") is the pipeline orchestrator, and it is deliberately tiny: 62 lines, `disable-model-invocation: true` (user-triggered only). It does **zero** craft work. Its entire job:

1. Invoke `ce-plan` → **GATE: STOP** — verify a plan file exists in `docs/plans/`; re-invoke if not.
2. Invoke `ce-work` → **GATE: STOP** — verify files actually changed.
3. Invoke `ce-code-review` with `mode:autofix plan:<path>`.
4. Persist review autofixes (commit + push).
5. Route residual findings to durable sinks (tracker tickets, PR body, or a committed fallback file) — "residuals must become durable before DONE, but the agent never stops to ask."
6. `ce-test-browser mode:pipeline`, then `ce-commit-push-pr`, then output DONE.

The gates verify **artifacts**, not intentions — the orchestrator checks that the previous skill produced its file/diff before proceeding. Skill-to-skill invocation is by name via the Skill tool, with explicit defensive instructions ("match a listed entry verbatim before calling") because cross-skill dispatch is a known fragility.

### Working skills are themselves mini-orchestrators

The interesting part: fan-out does **not** live in `lfg`. Each working skill orchestrates its own subagents:

- **ce-plan** dispatches parallel research agents (`ce-repo-research-analyst`, `ce-learnings-researcher`, conditionally `ce-best-practices-researcher`, `ce-framework-docs-researcher`, `ce-spec-flow-analyzer`), consolidates their findings itself, and runs a "confidence check and deepening" pass that dispatches more agents section-by-section.
- **ce-code-review** spawns 6–18 parallel **read-only persona reviewers** (auto-selected per diff from a catalog of ~25), each returning structured JSON findings with severity (P0–P3), a 5-anchor confidence score, and an `autofix_class` routing field. The skill then merges, dedupes, and synthesizes in its own context — "Synthesis owns the final route. Persona-provided routing metadata is input, not the last word." Exactly **one fixer** applies only `safe_auto` findings; everything else routes to a human or a downstream resolver. Model tiering is explicit: three high-stakes reviewers inherit the session model, the rest are forced to mid-tier.
- **ce-work** executes plans by dispatching per-unit implementation subagents — serial for dependent units, parallel with **worktree isolation** for independent ones, with a file-overlap safety check and orchestrator-owned merging. Subagents in shared directories are forbidden to commit; the orchestrating skill owns git state.

### Gates and headless duality

Every skill has two contracts: an interactive one (blocking `AskUserQuestion` menus at each synthesis point — one question per turn, options over prose) and a **headless/pipeline mode** (`mode:autofix`, `mode:headless`, "Pipeline mode: skip interactive questions"). In headless mode, un-confirmed agent inferences are not silently adopted — they route to an explicit `## Assumptions` section in the artifact "so downstream review can scrutinize them as bets, not as authoritative decisions." The human gate is never deleted; it is converted into a reviewable record.

### Artifact flow

Durable markdown at every seam: `docs/brainstorms/*-requirements.md` (WHAT) → `docs/plans/*-plan.md` (HOW, a "decision artifact, not an execution script"; progress is derived from git, never written into the plan) → `/tmp/.../run-id/` review artifacts → `docs/solutions/` learnings. **The artifact is the inter-skill API.** ce-work reads the plan's implementation units; ce-code-review reads the plan to verify requirements completeness; lfg only checks the artifacts exist.

---

## Harness 2: impeccable

**Source:** `/Users/rezailmi/.claude-work/skills/impeccable/` — `SKILL.md`, `reference/` (36 playbooks incl. `routing.md`, `new-work.md`, `critique.md`, `polish.md`, `degraded/`), `agents/` (4 subagent definitions as TOML).

### Orchestrator role

One skill, monolithic packaging, but the SKILL.md is a **79-line router**: a commands table mapping 24 sub-commands (`critique`, `polish`, `bolder`, `animate`, `layout`, …) to reference playbooks, plus routing rules ("No argument: read routing.md and present its context-aware menu; never auto-run a command"). The no-argument menu is dynamic: a script reads project signals (has DESIGN.md? last critique score? changed files? dev server up?) and the model leads with 2–3 recommended commands. Phase logic never lives in SKILL.md — "load the one playbook that owns the request," plus a mandatory `craft-floor.md` load immediately before any UI edit.

### The design loop lives in one playbook

`new-work.md` carries the equivalent of dx-design's loop: decide what's already true → one round of questions → choose invention level → **concept roll** (a script assigns which of seven candidate directions gets built — externalized dice, "the roll is the mechanism that keeps every run from converging on the category default") → **human gate: direction choice**, presented as rendered option cards on a served decision web page (with generated sketches when image gen exists, fanned out one asset-producer subagent per card, up to four parallel) → commit the direction as a 150-word contract comment in the artifact itself → build → bounded inspection ("two rounds is the ceiling" — anti-loop discipline) → finish.

This is the closest prior art to the dx-design spec's "multiple credible approaches → HTML artifacts to compare → execute the chosen one" step: impeccable renders comparable option cards/sketches **before** building, puts the choice to the human, and treats the choice as a contract the reviewer later audits against.

### Evaluation: fresh-context, propose-only, parent applies

The `impeccable_finish_reviewer` subagent is the sharpest statement of the evaluator pattern found anywhere in this research:

- Spawned **fresh, never inheriting the build thread** — "a reviewer that inherits your transcript inherits your framing, your optimism, and your abstractions."
- **Propose-only**: "You do not edit anything; the parent agent applies your fixes."
- Returns a derived disposition (`rebuild`/`fix`/`ship`) the parent "has no authority to soften," an ordered `material_fixes` list (max eight), and a `keep` line naming what must not be diluted while fixing.
- The parent applies fixes in one batch, recaptures, and sends screenshots back to the **same reviewer** for a verdict pass scoring each fix resolved/partial/unresolved — "the parent's narration of what was fixed is not evidence."
- Harnesses without subagents get documented degraded fallbacks (`reference/degraded/finish-reviewer.md`), and a substituted review must be disclosed.

A second subagent (`impeccable_documenter`) writes DESIGN.md **after** the build, from the built world — the ratchet as a separate agent.

---

## Harness 3: dx-harness today

**Source (this repo):** `plugins/dx-harness/skills/design/dx-design/SKILL.md` (+ `grill.md`, `implement-craft.md`, `verify.md`), `dx-critique/SKILL.md` (+ `critique.md`, `pass.md`, `layout-patterns.md`), `dx-polish/SKILL.md`, `agents/dx-evaluator.md`.

### The six-phase loop

`dx-design` runs: **1 Intent** (sprint contract, dimension + ambition clarification, component inventory) → **2 Diverge** (2–3 structural options, no pixel code, user picks) → **3 Plan** (human gate, three stages: expose → grill → structured Approve/Adjust; approved plan written to `docs/decisions/<page>.md`) → **4 Implement** (build exactly the approved plan; drift is a defect) → **5 Verify** (deterministic checks → evidence screenshots → spawned `dx-evaluator` verdict pasted verbatim) → **6 Ratchet** (finish the decision record; failures no control caught become catalog proposals).

Nearly everything runs inline in one context; the only subagent is the evaluator (fresh, propose-only, `model: opus`, "you never grade your own design work"). One human gate at Phase 3, plus the Phase 2 option pick and the verify/acceptance gate.

### The harness already has the "shared procedure doc" shape

Three facts matter for the #28 decision:

1. **`pass.md` is a shared procedure.** The five focused passes (copy, polish, motion, flow, layout) are thin SKILL.md files (~27–45 lines) that each name a control-id subset and then run one shared procedure: capture → load slice → up to five ranked suggestions → **plan gate** → implement → verify via `../dx-design/verify.md`. The phases are already partially factored out of the loop skill.
2. **`dx-critique` already is a proto-orchestrator for improve-existing.** It captures, grades, returns ranked suggestions, **stops** for the human pick, then "hand[s] the accepted list to `design` … as a specified-change run," rejoining the loop's modification path with the plan gate intact.
3. **`verify.md` already anticipates orchestrator dispatch.** "If you cannot spawn subagents (you are yourself a subagent) … the proven pattern is *orchestrator dispatch*: whoever orchestrates you spawns the evaluator and routes its verdict back to you."

What the loop does **not** yet have: a headless/return-to-caller contract (compound-engineering's `mode:` tokens), and its improve-existing entry runs the critique serially in one context rather than fanning out dimension passes in parallel.

---

## Comparison table

| Dimension | compound-engineering | impeccable | dx-harness today | dx-design orchestrator spec (#28) |
|---|---|---|---|---|
| Entry / orchestrator | `lfg`, 62-line pipeline skill, user-triggered only | One skill; 79-line SKILL.md command router + dynamic menu | `dx-design` (model-invocable, routes internally); `dx-critique` for improve-existing | `dx-design` catch-all; grilling intake + five-mode menu |
| Where phase logic lives | Per working skill (SKILL.md + `references/`) | 36 `reference/*.md` playbooks, loaded one per request | Mostly inline in dx-design SKILL.md; partially extracted (`verify.md`, `grill.md`, `pass.md`, `implement-craft.md`) | TBD — this ticket |
| Orchestrator does craft work? | No — sequences skills, checks artifacts at gates | No — routes, then the playbook runs in-context | Partially — the loop skill both orchestrates and implements | Triage only; implementation delegated |
| Fan-out | Inside working skills: 6–18 parallel review personas; parallel research agents; parallel worktree-isolated implementers | Parallel asset producers (one per option card, ≤4) | None (evaluator only) | 5 parallel specialist passes (copy, motion, flow, pattern, polish) |
| Subagent write authority | Reviewers read-only, return structured JSON; **one** fixer applies `safe_auto` only; implementers write in isolated worktrees, orchestrator merges | Reviewer propose-only, parent applies; documenter writes docs only | Evaluator propose-only ("findings, not fixes") | PROPOSE-ONLY passes; single frontend-only implementer |
| Merge of findings | Orchestrating skill merges/dedupes/synthesizes; "synthesis owns the final route"; conservative on disagreement | Reviewer returns ordered list (≤8), parent works only from that list | n/a | Orchestrator merges proposals into one ranked plan |
| Human gates | Plan approval + synthesis confirmations + post-plan menu; every gate has a headless conversion (inferences → `## Assumptions`) | Direction choice (rendered option cards); rebuild consultation; polish-budget decision | Phase 3 three-stage plan gate; Phase 2 pick; verify acceptance | One approval gate on the merged ranked plan |
| Options-as-artifacts | No (textual approaches in brainstorm) | Yes — decision page with cards + generated sketches, shared frame for fair comparison | No (textual options in Phase 2) | Yes — HTML artifacts of competing approaches |
| Evaluator | Review personas + validation pass | Finish reviewer: fresh context, disposition parent can't soften, verdict pass on recaptures | `dx-evaluator`: fresh agent, verdict verbatim into decision record | Evaluator agent verifies result |
| Artifact flow | requirements doc → plan doc → run artifacts → solutions docs; artifact is the inter-skill API | PRODUCT.md / DESIGN.md / surface briefs / direction contract in the artifact / QUALITY BAR cards | Sprint contract → decision record (`docs/decisions/<page>.md`) with plan, waivers, verdict | Captured page → ranked plan → decision record (presumably) |
| Headless mode | First-class: `mode:` tokens, pipeline mode, structured output envelopes | Unattended rules inline ("in unattended work, the safe rendition is the known risk") | Operator-proxy approval rules in Phase 3 | Not yet specified |

---

## What the prior art says about the three shapes

### Shape A — loop survives as a standalone skill the orchestrator routes to

This is compound-engineering's answer. `lfg` never absorbed `ce-plan`/`ce-work`/`ce-code-review`; it sequences them and verifies artifacts. What makes it work:

- **Dual contracts.** Every routed-to skill supports interactive standalone use *and* a headless/return-to-caller mode. The orchestrator passes `mode:` tokens; the skill skips its menus and returns structured output. Without this, routing produces double interrogation (orchestrator grills the user, then the loop's Phase 1 grills them again).
- **Gates verify artifacts, not narration.** "Verify that the ce-plan workflow produced a plan file … Do NOT proceed until a written plan exists."
- **The cost is real.** Cross-skill dispatch is fragile enough that lfg spends a paragraph on name resolution; each seam needs serialization (the orchestrator's triage findings must travel into the loop's input as text); and keeping two contracts per skill honest is ongoing maintenance (compound-engineering's skills are 200–900 lines partly because of the mode matrix).

### Shape B — loop absorbed into the orchestrator

This is superficially impeccable's answer — one skill owns everything — but the fine print undercuts absorption as usually imagined. impeccable's SKILL.md stays at 79 lines **only because 36 reference files carry the actual procedure**, loaded one at a time. "Absorbing" the six-phase loop into a dx-design orchestrator SKILL.md would either bloat it past usability (dx-design is already 456 lines before adding intake, five modes, fan-out, and merge logic) or force exactly the extraction Shape C describes. What absorption genuinely buys: one intake conversation, no seam where intent can leak ("intent without loss" is the harness's one promise, and every skill-to-skill handoff is a loss surface), and no double gates. What it costs: the loop stops being independently invocable and independently versionable, and a routing bug anywhere degrades everything.

### Shape C — loop becomes shared procedure docs both the orchestrator and passes load

Neither prior art ships this exact shape, but both point at it, and **dx-harness is already halfway there**: `pass.md` is a shared loop the five passes run; `verify.md` is a shared phase four skills reference; `grill.md` and `implement-craft.md` are phase extractions from dx-design. The observation that unlocks it: **the orchestrator spec's back half and the loop's back half are the same machine.** Merge-proposals → one ranked plan → human gate → single implementer → evaluator maps one-to-one onto Phase 3 (plan + gate) → Phase 4 (implement) → Phase 5 (verify) → Phase 6 (ratchet). Only the front half differs by mode: make-new needs intent + diverge (Phases 1–2); improve-existing needs capture + triage + specialist fan-out (which dx-critique half-does serially today).

Costs, honestly: procedure docs have weaker load guarantees than skills (nothing forces an agent to read a file; dx-design already fights this with "read it now, before verifying anything" imperatives); more files whose consistency must be maintained (the repo's `dx-sync` markers exist precisely because duplicated text drifts); and ownership of a shared doc is fuzzier when two callers want divergent changes.

---

## Recommendation (for the human decision ticket)

**Recommended: Shape C with an A-flavored spine — keep `dx-design`'s loop as a real skill for make-new and named modifications; extract Phases 3–6 into shared procedure docs; the orchestrator's improve-existing fan-out replaces Phases 1–2 and rejoins at the plan gate.**

Concretely:

1. **The six-phase loop survives, but slimmer.** dx-design remains the engine for "make new" and named modifications — the diverge phase (2–3 options, user picks) is the loop's distinctive value for new surfaces, and impeccable's option-cards round shows it should get *stronger* (options as comparable artifacts, per the #28 spec), not be dissolved.
2. **Phases 3–6 become shared procedure docs** (`plan-gate.md`, implement constraints, `verify.md` — already extracted, `ratchet.md`), the same way `pass.md` and `verify.md` already work. The orchestrator, the loop, and the five passes all load the same gate protocol and the same verify procedure. This kills the main absorption argument (duplicate gate logic) without killing the loop.
3. **The orchestrator stays thin**: intake/grilling, mode routing, capture + light triage, parallel dispatch of propose-only passes, proposal merge into one ranked plan — then it *enters the shared back half* like every other caller. It never implements and never grades.
4. **Give the loop (and the passes) a return-to-caller contract** modeled on compound-engineering's `mode:` tokens, so orchestrator-invoked runs skip their own intake and don't re-ask what the orchestrator's grilling already established. This is the single highest-risk seam: without it, users get grilled twice; with a sloppy version, the plan gate gets skipped. The gate must be owned by exactly one layer per run — the orchestrator when it dispatched the work, the loop when invoked standalone (verify.md's "orchestrator dispatch" rule already states this principle for the evaluator).
5. **Evaluator stays a fresh propose-only subagent** in every path — all three harnesses agree on this, and impeccable's verdict-pass mechanism (reviewer re-scores the fixes; parent's narration is not evidence) is worth adopting into `verify.md`.

**If the team prefers a simpler first cut:** Shape A (orchestrator routes to today's skills unchanged, dx-critique's hand-back pattern generalized) ships fastest and is proven by lfg, at the price of double-intake friction until return-to-caller modes are added. **Shape B (full absorption) is the one the evidence argues against** — no studied harness keeps craft procedure in its orchestrator, and the 456-line loop plus orchestrator concerns cannot share one SKILL.md without the extraction that makes it Shape C anyway.

Open questions this research does not settle (they need the human decision on #28):

- Whether the five specialist passes keep their model-invocable standalone entries once the orchestrator can dispatch them as propose-only subagents (compound-engineering keeps both: personas are agents, but review is also a standalone skill).
- Where the decision record is written in an orchestrator-mediated run — one record per run (orchestrator-owned) is cleaner than one per pass.
- Whether Phase 2 diverge for make-new should adopt impeccable-style externalized option selection (its concept-roll script exists to stop every run converging on the model's default choice — the same failure mode the DX anti-slop controls target at the pixel level).
