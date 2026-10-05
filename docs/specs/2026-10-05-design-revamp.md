# Design revamp: spec

**Date:** 2026-10-05
**Supersedes:** [Design skills restructure](2026-08-12-design-skills-restructure.md) (Shape C)

## Purpose

This spec rebuilds the design side of `dx-harness` around the people who use it. It covers two things:

- The control catalogue, rebuilt as a rule set modelled on the Python linter ruff.
- The design skills, rebuilt from 13 skills to eight, each serving the user stories of named personas.

Shape C organised the skills around the steps of a loop: an orchestrator, a builder, five passes, and a critique. Over several months the skills and the catalogue gathered duplicated rules, files that reach into other skills' folders, contradictions, and argument prose. The [evaluation](#appendix-evaluation-of-the-current-skills) lists the findings.

The work runs in three stages:

1. Define the personas and their use cases.
2. Write the user stories and map the current skills to them.
3. Derive the catalogue and skill architecture that fulfils the stories.

## Personas

Persona P1 is primary. Where the needs of two personas conflict, the architecture optimises for P1.

| ID | Persona | Background | What they want from the harness |
| --- | --- | --- | --- |
| P1 | Designer who builds in code | UI or UX designer with no engineering background. New to git. May use Claude Desktop. | Turn a design idea into working UI that meets the standard, without an engineer and without breaking the codebase. The harness decides where a default exists and uses no harness vocabulary ([#164](https://github.com/transformteamsg/dx-harness/issues/164)). |
| P2 | Frontend engineer in the portfolio | Builds UI from issues. Fluent in git and code. | UI that passes the standard without waiting for a designer, with few questions. |
| P3 | Design lead | Owns the catalogue, each product's `DESIGN.md`, and L1 waivers. | Consistent quality across products, and a controlled way for rules to change. |
| P4 | Product manager or researcher | Plans studies and requirements. | A research plan that aligns stakeholders. |
| P6 | Engineer from another team | Works on an app outside the Teacher & School portfolio. | Adopt a design language for their app, and have the harness hold their UI to it. |
| A1 | Calling agent | Another skill, a subagent, or an unattended run. | One contract: inputs, outputs, and no questions to a human. |
| P5 | Harness maintainer | Maintains `dx-harness`. | Feedback from any session. P5 receives feedback only; no skill is designed for P5. |

The evidence for these personas:

- The owner roles in the `docs/ROADMAP.md` flowchart.
- The three designer modes (prototype, revamp, and frontend hand-off) in `content/getting-started/plan.mdx`.
- `plugins/dx-harness/docs/ONBOARDING.md` and `CONTEXT.md`.
- The unattended-run rules in the current skills.
- Harness-feedback issues [#41](https://github.com/transformteamsg/dx-harness/issues/41), [#134](https://github.com/transformteamsg/dx-harness/issues/134), and [#164](https://github.com/transformteamsg/dx-harness/issues/164).

## User stories

Each story names the skill that serves it today and the gap. **Gap** marks a story that no skill serves today.

### Getting started

| ID | Story | Today | Gap |
| --- | --- | --- | --- |
| S1 | As P1, I want my machine set up for the harness in one guided session, so that my first design run does not fail on a missing tool. | `dx-design-setup` | Commit signing is not design-specific. |
| S2 | As P6, I want to install the harness in a repo outside the portfolio, so that I can use it on my own app. | `ONBOARDING.md`, `dx-design-setup` | **Gap.** Onboarding assumes the portfolio stack. |
| S3 | As P1 or P6, I want to record my product's design language from my code, Figma, or brand documents, so that every run builds to it. | `dx-design-language` | Fits. |
| S4 | As P6, I want to adopt an existing design language for my app, so that I do not define one from nothing. | None | **Gap.** See decision D1. |

### Making something new

| ID | Story | Today | Gap |
| --- | --- | --- | --- |
| S5 | As P1, I want to see two or three rendered directions for a new page or a visual change, so that I choose between things I can see. | `dx-design-execute` diverge step | The diverge step skips visual changes ([#134](https://github.com/transformteamsg/dx-harness/issues/134)). |
| S6 | As P1, I want to build a working frontend on mock data and hand the backend to an engineer, so that I can test the design end to end. | None | **Gap** ([#41](https://github.com/transformteamsg/dx-harness/issues/41)). The hand-off modes were in `issue-intake.md`, which no skill links to. |
| S7 | As P2, I want to build the UI for an issue to the standard with few questions, so that I do not wait for a designer. | `dx-implement-issue` or `dx-design-execute` | Two builders overlap, and neither clearly owns UI. |
| S8 | As P1, I want a quick prototype without the full loop, so that I can test an idea before I commit to it. | None | **Gap.** `dx-design-execute` runs every gate. |

### Improving what exists

| ID | Story | Today | Gap |
| --- | --- | --- | --- |
| S9 | As P1, I want to ask what is wrong with a page and get ranked suggestions, so that I know where to start. | `dx-design-critique` | Fits. The report is heavy. |
| S10 | As P1, I want to improve one dimension of a page (spacing, copy, motion, flow, or structure), so that I fix it without a full critique. | Five pass skills | Five skills do one job. |
| S11 | As P1, I want to make a stated edit, such as "change the label to Save", with the standard still applied, so that small changes stay safe. | `dx-design-execute` modification path | Fits. |
| S12 | As P2, I want to check my UI against the standard before review, so that the reviewer sees no standard failures. | `dx-design-critique`, `checks/` | No fast path that only checks. |

### Working safely

| ID | Story | Today | Gap |
| --- | --- | --- | --- |
| S13 | As P1, I want git explained and done with me safely, so that I never break the shared branch. | `dx-design-git` | Fits. The persona voice is heavy. |
| S14 | As P1, I want the harness to keep its records without asking me where they go, so that I can focus on the design. | `procedures/design-tickets.md` | Partial ([#164](https://github.com/transformteamsg/dx-harness/issues/164)). The rebuild deletes design tickets and keeps the decision record as the only record ([#364](https://github.com/transformteamsg/dx-harness/issues/364)). |

### Governing the standard

| ID | Story | Today | Gap |
| --- | --- | --- | --- |
| S15 | As P1, P2, or P6, I want to ask whether a rule applies or how to waive it, so that I proceed without guessing. | `dx-design` section 6 | The answer is buried in the router. |
| S16 | As P3, I want to approve a waiver or promote a repeated waiver to a standing override, so that exceptions stay controlled. | `dx-design`, `dx-design-language` | Split across two skills. |
| S17 | As P3, I want a gap that the harness found proposed as a new rule, so that the catalogue grows from real failures. | `procedures/rule-proposal.md` | Fits. |
| S18 | As P3, I want shipped surfaces re-audited after the catalogue changes, so that old pages meet new rules. | `dx-design-critique` re-audit | Fits. |

### Planning and feedback

| ID | Story | Today | Gap |
| --- | --- | --- | --- |
| S19 | As P4, I want a research plan for a study, so that stakeholders agree on its goals before recruitment starts. | `dx-design-research-brief` | Fits, but the skill does not use the harness. |
| S20 | As any persona, I want to report a problem with the harness during a task, so that the maintainers hear about it. | `dx-design-feedback` | Fits. |

### Agent contract

| ID | Story | Today | Gap |
| --- | --- | --- | --- |
| S21 | As A1, I want to dispatch a review of one surface and get findings back, with no questions to a human. | `return-to-caller` mode in the passes | The contract is defined in four places. |
| S22 | As A1, I want to dispatch a build with an approved plan and get a review bundle back. | `return-to-caller` mode in `dx-design-execute` | The same. |

## Decisions

- **D1: three ways to adopt a design language (P6, S4).** P6 can adopt the TFX standard alone, a portfolio product's language (for example Glow), or the team's own design system. The catalogue's rule selection carries this choice. See [Selection](#selection).
- **D2: engineers build through `dx-implement-issue` (P2, S7).** `dx-implement-issue` builds UI for engineers and calls the design check as one of its steps. `dx-design-execute` stays shaped for designers.
- **D3: a prototype path (S8).** A prototype runs on mock data. It skips the formal plan approval and the design review, keeps the L0 floor, and can be promoted to a full build.
- **D4: the catalogue becomes a rule set modelled on ruff.** See [Catalogue](#catalogue-a-rule-set-modelled-on-ruff).
- **D5: build in parallel, then cut over.** The new catalogue builds in `standards/rules/`, and the new skills build in `skills/design-revamp/`. See [Build strategy](#build-strategy).
- **D6: agents read the rule files in the plugin.** Skills, the reviewer agent, and the checks read `standards/rules/`, not the published website. `DESIGN.md` selects the rules for a product. This supersedes [#407](https://github.com/transformteamsg/dx-harness/issues/407).
- **D7: the website is an outside client.** The spec assumes the website moves to a private repository and reads the rule files through a submodule ([#389](https://github.com/transformteamsg/dx-harness/issues/389)). The catalogue work publishes a stable rule format; the site work happens in that repository.
- **D8: git help moves to a shared layer.** `dx-design-git` becomes `dx-git-ops` in `skills/shared/` ([#273](https://github.com/transformteamsg/dx-harness/issues/273)), because anyone who commits uses it.

## Catalogue: a rule set modelled on ruff

The catalogue today is `standards/catalog.yaml` (72 controls) plus 57 detail files in `standards/controls/`. Each detail file repeats the metadata of its catalogue entry in its frontmatter. Catalogue entries carry change history in YAML comments and status notes inside the `verify` field. Portfolio specifics, such as the product colour table and the Base UI stack, sit inside controls that are otherwise generic.

The rebuild models the catalogue on ruff: clear rule categories, one documented page per rule, and a project-level selection of the rules that apply.

### Model

| Ruff | Catalogue |
| --- | --- |
| A code and a slug, for example `F401` `unused-import` | A code and a slug, for example `A11Y-1` `text-contrast` |
| A category prefix for each source linter | A category prefix for each domain, plus an opt-in category for Teacher & School rules |
| One documentation page per rule, with fixed sections | One file per rule. Metadata sits in the frontmatter. The body has fixed sections: what the rule checks, why it matters, a failing example, a passing example, and how it is checked. |
| `select`, `ignore`, and `extend` in the project configuration | A rule selection in `DESIGN.md`. It replaces the `products:` and `audiences:` fields. |
| `# noqa` | `dx-waive`, unchanged |
| `per-file-ignores` | Standing overrides in `DESIGN.md` |
| Preview, stable, deprecated, and removed rules | A `status` field on each rule. It replaces the history comments. |
| Redirects from an old code to a new one | A `redirects` map. Old waivers in product repos still resolve. |

### Selection

A product's `DESIGN.md` selects the rules that apply to it. The selection supports the three choices in D1:

- **The TFX standard alone:** select the generic categories.
- **A portfolio product's language:** extend that product's selection.
- **The team's own design system:** select the generic categories and record the team's own values in `DESIGN.md`.

A critique dimension, such as polish or copy, is a named selection of categories and rules. It replaces the hand-kept lists of control IDs in the pass skills.

### Location

The rule set stays at the plugin root in `standards/`. The skills are one client among several:

- The website, which reads the rule files through a submodule once it moves to its own repository (D7). Today it reads them through `lib/catalog.ts`, `lib/control-detail.ts`, `lib/llms.ts`, the catalogue pages, and `scripts/check-standards.mjs`.
- The check scripts in `plugins/dx-harness/checks/`.
- `plugins/dx-harness/scripts/generate-design-json.py`.
- The reviewer agent, `plugins/dx-harness/agents/dx-design-review.md`.
- From D2, the engineering skill `dx-implement-issue`.

## Target skill set

The 13 design skills become seven, and git help moves to a shared skill (D8). Each skill serves the jobs that a persona names, and no skill exists only because a loop step exists.

| Skill | Stories | Change from today |
| --- | --- | --- |
| `dx-design` | S15, S16, unclear asks | Front door and rule questions only. The improve-mode fan-out moves to `dx-design-critique`. Brainstorming moves to the diverge step of `dx-design-execute`. |
| `dx-design-execute` | S5, S6, S8, S11, S22 | Three modes: prototype (D3), build, and frontend hand-off on mock data ([#41](https://github.com/transformteamsg/dx-harness/issues/41)). Offers rendered directions for visual changes ([#134](https://github.com/transformteamsg/dx-harness/issues/134)). Drops the restated controls, the stack, and the flow section. |
| `dx-design-critique` | S9, S10, S12, S18, S21 | Absorbs the five passes as a dimension scope: all, copy, flow, pattern, motion, or polish. A whole-page run produces the report. A single-dimension run or a check-only run returns findings. `dx-implement-issue` calls the check-only mode (D2). |
| `dx-design-language` | S3, S4, S16 | Writes the rule selection into `DESIGN.md` (D1). Owns standing overrides. |
| `dx-design-setup` | S1, S2 | Supports repos outside the portfolio. Commit signing stays until a harness-wide setup skill exists. |
| `dx-git-ops`, in `skills/shared/` | S13 | Replaces `dx-design-git` (D8). Keeps plain explanations, the confirmation gate, and the branch guard. Drops the designer framing and the memory file in `~/.claude`. Hands pull request creation to `dx-create-pr`. |
| `dx-design-feedback` | S20 | No change. |
| `dx-design-research-brief` | S19 | Rewritten to `plugins/dx-harness/procedures/skill-prose.md` and the house style. |

The rebuild removes `dx-design-copy`, `dx-design-polish`, `dx-design-motion`, `dx-design-flow`, and `dx-design-pattern`. Their trigger phrases move into the description of `dx-design-critique`.

### Principles

1. Skills carry no catalogue content and no portfolio content, such as the Kind Utility essence, the teacher audience, or the stack. They cite rule codes and read `DESIGN.md` ([#306](https://github.com/transformteamsg/dx-harness/issues/306), [#129](https://github.com/transformteamsg/dx-harness/issues/129)).
2. A skill reads only its own folder, `procedures/`, and the plugin-root folders. It never reads another skill's folder.
3. The agent contract (A1) is defined once, in `procedures/design-run-contract.md`.
4. A skill never shows P1 harness vocabulary or asks P1 a bookkeeping question. It drafts first, then asks for a yes or no ([#164](https://github.com/transformteamsg/dx-harness/issues/164)).
5. Each skill has evals for the stories it serves.

### Where a reference lives

The readers of a file decide where it sits.

| Readers | Location | Examples |
| --- | --- | --- |
| Code, the website, or agents outside the skills | Plugin root: `standards/`, `checks/`, `agents/` | The rule files, `layout-patterns.md` |
| Two or more skills | `procedures/` | The run contract, the capture procedure, the copy rules |
| One skill | That skill's `references/` folder | The verify procedure of `dx-design-execute` |

The files that move under this rule:

- `procedures/design-run-contract.md` is new. It replaces the four definitions of the `return-to-caller` contract.
- `procedures/capture.md` is new. It holds the capture fallback order and the rendered check, which are now in `critique.md` and `verify.md`.
- `procedures/copy-rules.md` is new. It holds the voice, tone, and writing mechanics from the body of `dx-design-copy/SKILL.md`.
- `implement-craft.md` moves to `standards/craft.md`. It is guidance on what good work looks like, and both `dx-design-critique` and `dx-design-execute` read it.
- The coverage table in `checks/README.md` moves to `checks/COVERAGE.md`. The script internals stay in the README for maintainers.
- `procedures/design-tickets.md` is deleted. The decision record is the only record of a run, and findings stay in the session ([#364](https://github.com/transformteamsg/dx-harness/issues/364)).

## Build strategy

The new catalogue and the new skills build beside the live ones. The live versions keep working until the cutover.

### Why parallel folders work here

- `plugins/dx-harness/.claude-plugin/plugin.json` loads only `./skills/engineering/` and `./skills/design/`. A skill in `skills/design-revamp/` never reaches users and never collides with a live skill name.
- `skills/design-revamp/` sits at the same depth as `skills/design/`. Paths such as `../../../procedures/` resolve the same way, and the cutover is a folder rename.
- `checks/skill-audit.py` and `checks/validate.py` walk every folder under `skills/`, so they check the drafts from the start.

### Guardrails

1. **The live design skills are frozen.** They take bug fixes only.
2. **A draft adds shared files and never edits live ones.** A new procedure gets a new file. A live procedure changes only at the cutover.
3. **A draft passes its evals before the cutover.** Load it for a session with a local skill link that stays out of git, then run its evals.
4. **One cutover at the end.** When every draft passes its evals, one pull request deletes `skills/design/` and renames `skills/design-revamp/` to `skills/design/`. The same pull request updates `validate.py`, `CONTEXT.md`, `ONBOARDING.md`, and `CHANGELOG.md`. The website's skill list changes in the website's own repository (D7).
5. **The draft folder's README holds rules, not status.** `skills/design-revamp/README.md` states these guardrails and links to this spec and the epic. Status lives on the epic.

### Order

1. Catalogue: decision records, scaffold, category ports, client migration, and deletion of the old files.
2. Scaffold for the skills: `skills/design-revamp/README.md` and `procedures/design-run-contract.md`.
3. `dx-design-critique`, with `procedures/capture.md` and `procedures/copy-rules.md`.
4. `dx-design-execute`.
5. `dx-design-language`.
6. `dx-design`, after the skills that it routes to.
7. `dx-design-research-brief`, `dx-design-setup`, and `dx-design-feedback`, in any order. `dx-git-ops` moves to `skills/shared/` on its own issue ([#273](https://github.com/transformteamsg/dx-harness/issues/273)) and does not wait for the cutover.
8. Cutover.
9. `dx-implement-issue` calls the check-only mode of `dx-design-critique` (D2).

## Issue breakdown

One epic, **Design revamp**, links to this spec. Each sub-issue is one pull request with one reviewable job.

### Catalogue

Until the clients migrate, `catalog.yaml` stays the file that the site, the check scripts, and the live skills read. A port pull request adds rule files and keeps the matching `catalog.yaml` entries consistent. A parity check in `validate.py` fails when a ported rule's metadata differs from its `catalog.yaml` entry.

| ID | Sub-issue | Scope |
| --- | --- | --- |
| C1 | Decision record: the rule-file schema, the category list (with the opt-in portfolio category), the selection grammar in `DESIGN.md`, `status`, `redirects`, and the code format | Document |
| C2 | Rule-writing standard: the fixed sections of a rule file and how to write each one | Document |
| C3 | Scaffold: `standards/rules/`, the rule-file JSON schema, a template, and the parity check | Code, no rules |
| C4 | Port the accessibility category, `A11Y` | 11 rules |
| C5 | Port the components and patterns category, `CMP` | 11 rules |
| C6 | Port the content category, `CNT-1` to `CNT-7` | 7 rules |
| C7 | Port the content category, `CNT-8` to `CNT-14` | 7 rules |
| C8 | Port the layout category, `LAY` | 7 rules |
| C9 | Port the anti-slop category, `SLP` | 11 rules |
| C10 | Port the typography category, `TYP` | 6 rules |
| C11 | Port the tokens and colour categories, `TOK` and `COL` | 5 rules |
| C12 | Port the motion category, `MOT` | 3 rules |
| C13 | Port the portfolio category, from `IDN` and the rules scoped by `products:`. Removes IDN-4 ([#285](https://github.com/transformteamsg/dx-harness/issues/285)) | 4 or more rules |
| C14 | Move `validate.py`, `checks/checklib.py`, and the check scripts to `standards/rules/` | Code |
| C15 | Move `scripts/generate-design-json.py` to the rule files and the `DESIGN.md` selection | Code |
| C16 | Publish the rule format for the website: a documented, stable read contract over `standards/rules/` that the website's repository builds from (D7) | Document and schema |
| C17 | Move the reviewer agent, the design procedures, and the live skills to the rule files | Prose |
| C18 | Delete `catalog.yaml`, `standards/controls/`, and the parity check | Deletion |

C1 and C2 come first. A port can start after C3 merges, and the ports run in any order. C13 depends on the category list from C1.

### Skills

The epic gets one sub-issue for each draft skill, filed after C1 settles the categories. A skill issue that grows past one reviewable job splits with `dx-split-issue`. `dx-design-critique` is the likely case: the core run, dimensions as selections, the report, and the check-only mode.

## Holding context

Each place holds one kind of fact, and no place restates another.

| Place | Holds | Changes when |
| --- | --- | --- |
| This spec | Why and what: personas, stories, decisions, the target architecture, the build strategy, and open decisions | A decision changes |
| Decision records in `docs/adr/` | One hard-to-reverse decision each, with its options | Never. A new record supersedes an old one. |
| The epic | Progress | Each pull request |
| A sub-issue | One step: the section of this spec it implements, the stories it serves, and its acceptance criteria | Before work starts |
| `skills/design-revamp/README.md` | The guardrails, and links to this spec and the epic | Rarely |
| `CONTEXT.md` | New terms, such as rule, category, selection, and redirect, and retired ones, such as pass | When the term ships |

## Related issues

These open issues predate this spec. Each one is superseded, folded into a sub-issue, or adopted.

| Issue | Outcome |
| --- | --- |
| [#362](https://github.com/transformteamsg/dx-harness/issues/362): rewrite the catalogue prose | Superseded by the category ports, C4 to C13 |
| [#306](https://github.com/transformteamsg/dx-harness/issues/306), [#129](https://github.com/transformteamsg/dx-harness/issues/129): portfolio content hardcoded in skills | Superseded by principle 1 |
| [#285](https://github.com/transformteamsg/dx-harness/issues/285): remove IDN-4 | Folded into C1 and C13 |
| [#407](https://github.com/transformteamsg/dx-harness/issues/407), with [#408](https://github.com/transformteamsg/dx-harness/issues/408) to [#410](https://github.com/transformteamsg/dx-harness/issues/410): agents read the catalogue from the website | Superseded by D6 |
| [#389](https://github.com/transformteamsg/dx-harness/issues/389): move the website to a private repository | Assumed by D7; stays its own work |
| [#364](https://github.com/transformteamsg/dx-harness/issues/364): delete the design-ticket mechanism | Adopted; the skill drafts carry no design tickets |
| [#273](https://github.com/transformteamsg/dx-harness/issues/273): move git help to `skills/shared/` | Adopted as D8 |

## Open decisions

- **Rule code format.** Keep the current codes, such as `A11Y-1`, or renumber in ruff's style, such as `A11Y001`, with redirects. C1 decides.
- **Category list.** Whether `IDN` survives as a category, and the name of the portfolio category. C1 decides.
- **Rule tiers.** Whether L0, L1, and L2 stay as they are, or map to a ruff-style severity. C1 decides.
- **Harness-wide skills.** Whether `dx-design-feedback` and commit signing in `dx-design-setup` also move to `skills/shared/`, as git help does (D8). Out of scope for this spec.

## Appendix: evaluation of the current skills

| Skill | Lines, with references | Job | Finding |
| --- | --: | --- | --- |
| `dx-design` | 352 | Router, improve-mode fan-out, brainstorming, and waiver questions | Four jobs in one skill |
| `dx-design-execute` | 670 | The only builder | Too large, and restates the catalogue |
| `dx-design-critique` | 307 | Whole-page graded review | Holds the procedure for the passes |
| `dx-design-polish`, `dx-design-motion`, `dx-design-flow`, `dx-design-pattern` | 36 to 61 each | Review of one dimension | A list of control IDs plus the same boilerplate |
| `dx-design-copy` | 244 | Copy pass, and a reference for building | Two roles, and restates the `CNT` controls |
| `dx-design-language` | 232 | Writes `DESIGN.md` | Sound |
| `dx-design-setup` | 221 | Machine setup | Sound. Commit signing is not design-specific. |
| `dx-design-git` | 184 | Git help and the branch guard | Heavy persona voice. Its memory path in `~/.claude` breaks the rule in `CONTRIBUTING.md` against absolute install paths. |
| `dx-design-feedback` | 49 | Files harness feedback | Sound |
| `dx-design-research-brief` | 388 | Research plan template | Does not use the harness |

No design skill has evals.

The findings across the skills:

- The five passes run one procedure, `dx-design-critique/pass.md`, which matches `critique.md` without the report.
- Skills read files in other skills' folders: `pass.md`, `implement-craft.md`, one section of the `dx-design-execute` `SKILL.md`, `critique.md`, and `setup.md`.
- No `SKILL.md` has linked to `dx-design/issue-intake.md` since [#380](https://github.com/transformteamsg/dx-harness/issues/380). The hand-off mode, the mapping from acceptance criteria to E2E tests, and the designer walkthrough no longer run.
- The `return-to-caller` contract is defined in four places, each with a different payload.
- Routing lives in 13 descriptions of 400 to 900 characters each, mostly clauses of the form "NOT for X".
- The skills contradict each other:
  - Two grilling procedures set opposite pacing.
  - The passes hand findings to the builder at once, but the critique waits for a later run.
  - `dx-design-execute` and `dx-design-critique` can call each other.
  - `pass.md` cites the wrong step of `critique.md`.
  - The loop has five phases in one place and six in another.
- Skill prose restates catalogue content. The `dx-sync` markers in `validate.py` exist to keep those copies consistent, and the copy of the L0 floor in `pass.md` has no marker.
- The prose breaks `procedures/skill-prose.md`: argument clauses, identity framing, modal verbs in capitals, and portfolio specifics written into the skills.
- A run of `dx-design-execute` reads about 83,000 tokens before it reads a product file, and a pass reads about 39,000 ([Design skill token budget](../../plugins/dx-harness/docs/token-budget-design.md)).
