# Design revamp: spec

**Date:** 2026-10-05
**Supersedes:** [Design skills restructure](../2026-08-12-design-skills-restructure.md) (Shape C)

## Purpose

This spec rebuilds the design side of `dx-harness` around the people who use it. It covers two things:

- The control catalogue, rebuilt as a rule set modelled on the Python linter ruff.
- The design skills, rebuilt from 13 skills to seven, each serving the user stories of named personas.

Shape C organised the skills around the steps of a loop: an orchestrator, a builder, five passes, and a critique. Over several months the skills and the catalogue gathered duplicated rules, files that reach into other skills' folders, contradictions, and argument prose. The [evaluation](#appendix-evaluation-of-the-current-skills) lists the findings.

The work runs in three stages:

1. Define the personas and their use cases.
2. Write the user stories and map the current skills to them.
3. Derive the catalogue and skill architecture that fulfils the stories.

## Personas and stories

The personas and user stories live in [stories/](stories/README.md), one file per persona. This file cites stories by ID, such as `P6-3`, and never restates them.

### Story gate

- Each persona has one confirmation issue under [#413](https://github.com/transformteamsg/dx-harness/issues/413). The issue confirms the persona's stories and writes their acceptance examples. A persona's stories are confirmed when its issue closes.
- A skill sub-issue is filed only after every story it serves is confirmed.
- The P6 refinement issue blocks C1, because the selection grammar in C1 carries D1.
- A new or changed story that no skill serves needs a pull request to the [target skill table](#target-skill-set) in this file.

### How to contribute

- **A story:** open a pull request that changes the persona's file in `stories/`, against that persona's issue. Follow the rules in [stories/README.md](stories/README.md).
- **A decision or the architecture:** comment on #413, or add an entry under [Open decisions](#open-decisions). A story pull request does not edit this file.
- **Everything else:** follow [CONTRIBUTING.md](../../../CONTRIBUTING.md).

## Decisions

- **D1: three ways to adopt a design language (P6-2, P6-3).** P6 can adopt the TFX standard alone, a portfolio product's language (for example Glow), or the team's own design system. The catalogue's rule selection carries this choice. See [Selection](#selection).
- **D2: engineers build through `dx-implement-issue` (P2-1, P2-2).** `dx-implement-issue` builds UI for engineers and calls the design check as one of its steps. `dx-design-execute` stays shaped for designers.
- **D3: a prototype path (P1-5).** A prototype runs on mock data. It skips the formal plan approval and the design review, keeps the L0 floor, and can be promoted to a full build.
- **D4: the catalogue becomes a rule set modelled on ruff.** See [Catalogue](#catalogue-a-rule-set-modelled-on-ruff).
- **D5: build in parallel, then cut over.** The new catalogue builds in `standards/rules/`, and the new skills build in `skills/design-revamp/`. See [Build strategy](#build-strategy).
- **D6: agents read the rule files in the plugin.** Skills, the reviewer agent, and the checks read `standards/rules/`, not the published website. `DESIGN.md` selects the rules for a product. This supersedes [#407](https://github.com/transformteamsg/dx-harness/issues/407).
- **D7: the website is an outside client.** The website left this repository in [#405](https://github.com/transformteamsg/dx-harness/pull/405) and reads the rule files from its own repository ([#389](https://github.com/transformteamsg/dx-harness/issues/389)). The catalogue work publishes a stable rule format; the site work happens in that repository.
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
| Rule options in the project configuration, such as the docstring convention | A `parameters` block in the rule's frontmatter, such as the allowed type scale or a list of banned words. A check reads the parameters and never parses the prose. |

### Selection

A product's `DESIGN.md` selects the rules that apply to it. The selection supports the three choices in D1:

- **The TFX standard alone:** select the generic categories.
- **A portfolio product's language:** extend that product's selection.
- **The team's own design system:** select the generic categories and record the team's own values in `DESIGN.md`.

A critique dimension, such as polish or copy, is a named selection of categories and rules. It replaces the hand-kept lists of control IDs in the pass skills.

### Location

The rule set stays at the plugin root in `standards/`. The skills are one client among several:

- The website, which reads the rule files from its own repository (D7).
- The check scripts in `plugins/dx-harness/checks/`.
- `plugins/dx-harness/scripts/generate-design-json.py`.
- The reviewer agent, `plugins/dx-harness/agents/dx-design-review.md`.
- From D2, the engineering skill `dx-implement-issue`.

### Checks

The check scripts in `plugins/dx-harness/checks/` depend on the catalogue in three ways:

| Group | Scripts | What they read | During the rebuild |
| --- | --- | --- | --- |
| Independent | `skill-locators.py`, `skill-audit.py` | Markdown paths and skill folders | Unaffected |
| IDs and tiers | `a11y-eslint.py`, `audit-record.py`, `rendered-check.py`, `structure-scan.py`, `reaudit-scope.py`, `waiver-reconcile.py` | Which rules exist, their tiers, and their bodies | Read through one `checklib.py` module (C14a), which C14b switches to `standards/rules/` |
| Parameters | `type-scan.py`, `content-lint.py` | The type scale in TYP-3's `verify` text, thresholds in rule titles, and the word lists in `slp-9.md`, `cnt-5.md`, `cnt-6.md`, and `cnt-13.md` | Switch to rule parameters in the port of their category |

`validate.py` is rebuilt by the scaffold (C3) and loses its `dx-sync` parity checks at the skills cutover.

Until C14b, how a check reads the catalogue is frozen. A check's detection logic still takes bug fixes.

## Target skill set

The 13 design skills become seven, and git help moves to a shared skill (D8). Each skill serves the jobs that a persona names, and no skill exists only because a loop step exists.

| Skill | Stories | Change from today |
| --- | --- | --- |
| `dx-design` | P1-11, P2-3, P3-1, P6-4, unclear asks | Front door and rule questions only. The improve-mode fan-out moves to `dx-design-critique`. Brainstorming moves to the diverge step of `dx-design-execute`. |
| `dx-design-execute` | P1-3, P1-4, P1-5, P1-8, P1-10, A1-2 | Three modes: prototype (D3), build, and frontend hand-off on mock data ([#41](https://github.com/transformteamsg/dx-harness/issues/41)). Offers rendered directions for visual changes ([#134](https://github.com/transformteamsg/dx-harness/issues/134)). Drops the restated controls, the stack, and the flow section. |
| `dx-design-critique` | P1-6, P1-7, P2-2, P3-3, A1-1 | Absorbs the five passes as a dimension scope: all, copy, flow, pattern, motion, or polish. A whole-page run produces the report. A single-dimension run or a check-only run returns findings. `dx-implement-issue` calls the check-only mode (D2). |
| `dx-design-language` | P1-2, P3-1, P6-2, P6-3 | Writes the rule selection into `DESIGN.md` (D1). Owns standing overrides. |
| `dx-design-setup` | P1-1, P6-1 | Supports repos outside the portfolio. Commit signing stays until a harness-wide setup skill exists. |
| `dx-git-ops`, in `skills/shared/` | P1-9 | Replaces `dx-design-git` (D8). Keeps plain explanations, the confirmation gate, and the branch guard. Drops the designer framing and the memory file in `~/.claude`. Hands pull request creation to `dx-create-pr`. |
| `dx-design-feedback` | P1-12, P6-5 | No change. |
| `dx-design-research-brief` | P4-1 | Rewritten to `plugins/dx-harness/procedures/skill-prose.md` and the house style. |

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

Until the clients migrate, `catalog.yaml` stays the file that the site, the check scripts, and the live skills read. A port pull request adds rule files and keeps the matching `catalog.yaml` entries consistent. A parity check in `validate.py` fails when a ported rule's metadata differs from its `catalog.yaml` entry, or when a rule parameter differs from the value a check reads today.

| ID | Sub-issue | Scope |
| --- | --- | --- |
| C1 | Decision record: the rule-file schema, the category list (with the opt-in portfolio category), the selection grammar in `DESIGN.md`, `status`, `redirects`, `parameters`, the code format, and which side owns the link between a rule and its check | Document |
| C2 | Rule-writing standard: the fixed sections of a rule file and how to write each one. A value that a check reads is a parameter in the frontmatter, never prose | Document |
| C3 | Scaffold: `standards/rules/`, the rule-file JSON schema, a template, and the parity check | Code, no rules |
| C4 | Port the accessibility category, `A11Y` | 11 rules |
| C5 | Port the components and patterns category, `CMP` | 11 rules |
| C6 | Port the content category, `CNT-1` to `CNT-7`. Moves the word lists of CNT-5 and CNT-6 to parameters, and switches `content-lint.py` to read them | 7 rules |
| C7 | Port the content category, `CNT-8` to `CNT-14`. Moves the CNT-13 word list to parameters, and switches `content-lint.py` to read it. Carries the CNT-14 grading change from [#308](https://github.com/transformteamsg/dx-harness/pull/308) | 7 rules |
| C8 | Port the layout category, `LAY` | 7 rules |
| C9 | Port the anti-slop category, `SLP`. Moves the SLP-9 word lists to parameters, and switches `content-lint.py` to read them | 11 rules |
| C10 | Port the typography category, `TYP`. Moves the type scale and thresholds to parameters, and switches `type-scan.py` to read them | 6 rules |
| C11 | Port the tokens and colour categories, `TOK` and `COL`. Settles where `token-audit.py` and `contrast.py` disagree with COL-2 ([#128](https://github.com/transformteamsg/dx-harness/issues/128), [#352](https://github.com/transformteamsg/dx-harness/issues/352), [#295](https://github.com/transformteamsg/dx-harness/issues/295)) | 5 rules |
| C12 | Port the motion category, `MOT` | 3 rules |
| C13 | Port the portfolio category, from `IDN` and the rules scoped by `products:`. Removes IDN-4 ([#285](https://github.com/transformteamsg/dx-harness/issues/285)) | 4 or more rules |
| C14a | Read the catalogue through one `checklib.py` module ([#425](https://github.com/transformteamsg/dx-harness/issues/425)). Can start before C1 | Code |
| C14b | Switch `checklib.py` and `validate.py` to `standards/rules/`, and generate `checks/COVERAGE.md` from the rule files | Code |
| C15 | Move `scripts/generate-design-json.py` to the rule files and the `DESIGN.md` selection | Code |
| C16 | Publish the rule format for the website: a documented, stable read contract over `standards/rules/` that the website's repository builds from (D7) | Document and schema |
| C17 | Move the reviewer agent, the design procedures, and the live skills to the rule files | Prose |
| C18 | Delete `catalog.yaml`, `standards/controls/`, and the parity check | Deletion |

C1 and C2 come first. A port can start after C3 merges, and the ports run in any order. C13 depends on the category list from C1. C14a can start at any time, and C14b follows the last port.

### Stories

One task per persona confirms its stories in `stories/`: P1 ([#415](https://github.com/transformteamsg/dx-harness/issues/415)), P2 ([#416](https://github.com/transformteamsg/dx-harness/issues/416)), P3 ([#417](https://github.com/transformteamsg/dx-harness/issues/417)), P4 ([#418](https://github.com/transformteamsg/dx-harness/issues/418)), A1 ([#419](https://github.com/transformteamsg/dx-harness/issues/419)), and P6 ([#420](https://github.com/transformteamsg/dx-harness/issues/420)). See the [story gate](#story-gate).

### Skills

The epic gets one sub-issue for each draft skill, filed after C1 settles the categories and the stories it serves are confirmed. A skill issue that grows past one reviewable job splits with `dx-split-issue`. `dx-design-critique` is the likely case: the core run, dimensions as selections, the report, and the check-only mode.

## Holding context

Each place holds one kind of fact, and no place restates another.

| Place | Holds | Changes when |
| --- | --- | --- |
| This file | Why and what: decisions, the target architecture, the build strategy, and open decisions | A decision changes |
| [stories/](stories/README.md) | Personas, stories, and acceptance examples, one file per persona | A persona issue merges |
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
| [#306](https://github.com/transformteamsg/dx-harness/issues/306), [#129](https://github.com/transformteamsg/dx-harness/issues/129): portfolio content hardcoded in skills | Superseded by principle 1. No team outside the portfolio uses the live skills, so they get no interim fix. |
| [#308](https://github.com/transformteamsg/dx-harness/pull/308): the pull request for #306 | Closed unmerged. Its `procedures/design-essence.md`, and its rule that `## Essence` has no portfolio default, are input to the `dx-design-language` draft. Its CNT-14 change goes to C7, and its locator check to [#423](https://github.com/transformteamsg/dx-harness/issues/423). |
| [#285](https://github.com/transformteamsg/dx-harness/issues/285): remove IDN-4 | Folded into C1 and C13 |
| [#407](https://github.com/transformteamsg/dx-harness/issues/407), with [#408](https://github.com/transformteamsg/dx-harness/issues/408) to [#410](https://github.com/transformteamsg/dx-harness/issues/410): agents read the catalogue from the website | Superseded by D6 |
| [#389](https://github.com/transformteamsg/dx-harness/issues/389): move the website to a private repository | The website left this repository in #405 (D7). #389 tracks the rest of the move. |
| [#128](https://github.com/transformteamsg/dx-harness/issues/128), [#352](https://github.com/transformteamsg/dx-harness/issues/352), [#295](https://github.com/transformteamsg/dx-harness/issues/295): checks that disagree with COL-2 | Folded into C11 |
| [#296](https://github.com/transformteamsg/dx-harness/issues/296), [#126](https://github.com/transformteamsg/dx-harness/issues/126), [#27](https://github.com/transformteamsg/dx-harness/issues/27), [#133](https://github.com/transformteamsg/dx-harness/issues/133): detection bugs in the checks | Fixed on their own. Detection logic is not frozen. |
| [#364](https://github.com/transformteamsg/dx-harness/issues/364): delete the design-ticket mechanism | Adopted; the skill drafts carry no design tickets |
| [#273](https://github.com/transformteamsg/dx-harness/issues/273): move git help to `skills/shared/` | Adopted as D8 |

## Open decisions

- **Rule code format.** Keep the current codes, such as `A11Y-1`, or renumber in ruff's style, such as `A11Y001`, with redirects. C1 decides.
- **Category list.** Whether `IDN` survives as a category, and the name of the portfolio category. C1 decides.
- **Rule-to-check link.** Whether a rule file names the script that checks it, as controls do today, or a check declares the rules it implements, as in ruff. The owning side generates `checks/COVERAGE.md`. C1 decides.
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
- A run of `dx-design-execute` reads about 83,000 tokens before it reads a product file, and a pass reads about 39,000 ([Design skill token budget](../../../plugins/dx-harness/docs/token-budget-design.md)).
