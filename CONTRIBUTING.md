# Contributing to dx-harness

This repository holds two things: the `dx-harness` Claude Code plugin in `plugins/dx-harness/`, and the design-standard website that renders the standard for people and agents. A change to either follows the same process.

## Set up your machine

The website needs Node 24 and pnpm 11:

```sh
pnpm install
pnpm dev
```

The full check suite needs three tools that no manifest declares, because the checks reach them as subprocesses rather than as packages:

| Tool | Version | Why |
| --- | --- | --- |
| Python 3 with PyYAML | 3.12 | `check:python` reads the control catalogue |
| ast-grep | 0.44.1 exactly | `token-audit.py` and `type-scan.py` match source structure through it |
| Playwright Chromium | Installed through pnpm | `pnpm test:e2e` renders the accessibility contract |

```sh
pip install pyyaml
pnpm add --global @ast-grep/cli@0.44.1
pnpm exec playwright install --with-deps chromium
```

If `pnpm add --global` reports that no global bin directory is set, run `pnpm setup` once and reopen your shell.

Pin ast-grep to 0.44.1 rather than tracking the latest release. The checks enforce it as a floor, and `plugins/dx-harness/checks/sgconfig.yml` is written against behaviour measured at that version. A check that cannot reach ast-grep fails with one `ERROR` line instead of reporting a clean run, because a scan that did not happen must never look like a scan that found nothing.

## Write the commit message

Commits follow this shape:

```
<type>(<scope>): <short description>
```

- **Type**: one of `feat`, `fix`, `docs`, `refactor`, `chore`, `style`, `build`, `ci`, or `test`.
- **Scope**: the area you touched, wrapped in backticks, as in ``chore(`ci`)`` or ``style(`skills`)``. Omit it when the change is repository-wide, as in `docs: adopt the Google style guide`.
- **Description**: one line, starting lowercase, with no full stop. Describe what the change does, not what you did.

Squash merging appends the pull request number, so a title lands in `main` with the number already on it. Do not add it yourself:

```
feat(`landing`): rebuild the front page          <- the pull request title
feat(`landing`): rebuild the front page (#163)   <- the commit in main
```

## Name the branch

Branches take the type of the work, then a kebab-case summary:

```
<type>/<short-description>
```

For example, `fix/container-build`, `docs/roadmap`, and `feat/aif-design-issue`. When a branch delivers one slice of a larger issue, name the parent: `split/205-audit-records-prebuild`.

A release branch is the one exception to that shape. It takes `release/<version>`, as in `release/0.7.0`, because a release is not one of the types above. See [Cut a release](#cut-a-release).

## Open the pull request

Every pull request links to an issue. File the issue first, then carry the link in the body: `Closes #NNN`, or `Part of #NNN` when the branch delivers one slice and the issue stays open. Nothing reaches `main` that no issue documents.

The two documents answer different questions, and a reviewer needs both. The pull request says what changed; the issue says what it was for and what "done" meant. Once a pull request merges the diff is what survives, so a change with no issue behind it leaves its reasoning nowhere. If you are partway into work no issue covers, file one with the `/dx-harness:dx-create-*` skills before you open the request.

Title the pull request with the issue title, character for character. Squash merging uses that title as the commit message in `main`, so a title that is not a valid commit message becomes a bad commit.

Open it as a draft until the checks pass and you have walked through the change by hand. The body comes from the repository's pull request template. Where no template file is present yet, the body needs the issue link, a summary, the list of changes with the reason for each, and a test plan naming every acceptance criterion or done-when item with the automated test that covers it.

## Keep it to one reviewable change

A pull request is one change a reviewer can hold in their head at once and say yes or no to as a unit. That is the test, and size is only its proxy: a large change that does one thing is fine, and a small change that does three is not.

Split it when the honest description of it needs an "and", when a reviewer would have to hold two unrelated parts of the system at once to judge it, or when half of it could ship without the other half.

As a rough trigger, 600 changed lines in code files or 25 changed files is the point at which you owe the reviewer a sentence on why this is still one change. Markdown, lockfiles, and snapshots do not count towards it, because 1,000 lines of documentation and 1,000 lines of TypeScript are not the same review. Over the trigger, a clean commit sequence is usually the honest answer: one contract item per commit, each building and passing, in an order that tells the story. A reviewer can work through that commit by commit however long it runs.

This binds an agent harder than it binds you. An agent pays nothing to write 5,000 lines, and the reviewer pays what they always paid without having chosen the size. So an agent working in this repository does not decide for itself that an oversized change is acceptable. It reports the measure and asks you.

## Pass the checks

Run these before you push. CI runs the same set, so a green local run predicts a green pull request:

| Command | What it covers |
| --- | --- |
| `pnpm lint` | ESLint across the repository |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm build` | The standards gate, the Next.js build, and the CSP externalization, in that order |
| `pnpm test:e2e` | The rendered accessibility contract in Chromium |

`pnpm build` carries more than a build. Its `prebuild` step runs `check-standards.mjs`, `check:python`, and `check:notices`, and its `postbuild` step moves Next.js inline scripts into external files so the deployed site satisfies Airbase's `script-src 'self'` policy. Never run `next build` directly for a deployable artefact: it skips both.

**No git hook runs any of this.** The repository has no `lefthook.yml` and no `.husky/`, so nothing checks your work on commit or on push. CI runs on pushes to `main` and on pull requests targeting `main`, which means an unchecked commit reaches CI before it reaches a reviewer. Run the commands yourself.

## Work through an issue

Issues live as GitHub issues on `transformteamsg/dx-harness` and are managed with the `gh` CLI. `docs/agents/issue-tracker.md` holds the command conventions.

- **File one** with the `/dx-harness:dx-create-*` skills. They ask for the sections their issue shape needs, then create the issue with a label that records which skill wrote it.
- **Link related work** through GitHub's own relationships rather than prose in the body. Use the Relationships panel for blocked by and blocks, and sub-issues for the slices of a larger piece. Links written into the body go stale as issues close; native relationships do not.
- **Triage** with the label vocabulary in `docs/agents/triage-labels.md`: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`.
- **Implement one** with `/dx-harness:dx-implement-issue`, which reads the issue, plans against its acceptance criteria, and opens a draft pull request.

An issue is ready to pick up when it says what must be observably true once the work is done. If it does not, ask rather than guess. A guess costs a rejected pull request; a question costs a comment.

## Write the prose

The rules for technical documents live in the Technical documents section of [CLAUDE.md](CLAUDE.md), and that section is the authority. It covers the [Google developer documentation style guide](https://developers.google.com/style), em dashes, numerals, abbreviations, and the word list. Two points come up often enough to repeat here:

- Spelling is Commonwealth English in all prose, so `colour`, `behaviour`, `catalogue`, and `-ise` rather than `-ize`. Identifiers keep the spelling they already have, such as `catalog.yaml`. This is a deliberate deviation from Google, which is US English.
- The standards catalogue does not govern technical documents. Its controls were written for interface strings, so applying them to instructional prose is the wrong bar.

Apply these to documents you write or substantially revise. Do not retrofit a file you are only passing through.

## Add a skill

Skills are the canonical, tool-neutral source of the harness. The `.claude-plugin` manifests are a Claude-specific adapter over them.

- Add a skill under `plugins/dx-harness/skills/engineering/` or `plugins/dx-harness/skills/design/` as `dx-<skill-name>/SKILL.md`. Keep each skill one level deep inside its category folder, and never place a skill directly under `skills/`.
- `SKILL.md` frontmatter needs a `name:` matching the folder, so it carries the `dx-` prefix too, and a trigger-rich `description:`. The description is what decides whether the skill fires, so write the phrases a person would actually say.
- Quote a `description:` that contains a colon followed by a space, or a space followed by `#`. Unquoted, YAML reads the first as a nested mapping and fails to parse, and the second as a comment, which silently truncates the description and quietly degrades what the skill triggers on. Single quotes are the house style; double an apostrophe inside them.
- Keep the body tool-neutral. No Claude-only assumptions, and no absolute install paths such as `~/.claude/...`. Reference sibling files relatively.
- Every skill is invoked as `/dx-harness:dx-<name>`, so names must be unique across both groups.
- Design skills reach the catalogue through `../../../standards/`, three levels up from the skill directory. Preserve that depth when you move a file.
- **`SKILL.md` states the flow; `references/` holds the detail each step consumes.** A reader gets the whole sequence, in order, from `SKILL.md` alone: what runs, in what order, and what each step hands to the next. Anything a single step needs in order to do its work goes in `references/`.
- **The test is whether a reader enters the file once and comes out finished.** A checklist, a template, a schema, a rubric, or an output format all pass: you open them at one step, complete that step, and return with a result. What fails is a file that contains part of the sequence itself and sends the reader back mid-task, so following one run means jumping between two files. `dx-code-review` is the worked example both ways: its review angles and its summary format are extracted, and its two former `*-review-path.md` files were folded back in because each ran a few steps, bounced to `SKILL.md` for a shared phase, then resumed.
- Length alone neither forces nor forbids an extraction: a long step detail extracts because it is a leaf, not because it is long, and a short branch of the sequence stays because it is flow, not because it is short.
- **Do not split a reference by a condition every run satisfies.** Extraction defers a cost; it only avoids one when some runs skip the file. Nine angles that every review runs still cost the same tokens whichever file they sit in, so justify that split on the flow being readable rather than on tokens saved.
- A shared procedure under `plugins/dx-harness/procedures/` is judged differently: it is consumed by many skills rather than read end to end by a person, so loading only the applicable part can be worth a split. State which of the two a file is before deciding its shape.
- **When you trim a skill, keep the "why" that changes what the rule does.** Cutting the explanation and leaving the bare instruction is usually the right call, and it makes a skill much easier to follow. Some of those clauses are quietly holding the rule up, though: they say when it applies and when it does not. `dx-code-review` lost one that read "because they are the cases worth raising precisely when they cannot be settled by reading", and the rule above it went from a conditional default to a blanket one, so a bug the review could prove got reported as a maybe. Before you delete a clause, take it out and ask whether the rule still behaves the same way at the edges. If the answer changes, it was never an explanation.
- **Remember that an agent reads differently from you.** You skim past a "because" and get on with the instruction. An agent leans on it to settle the case nobody thought to write down. Keep that in mind when a skill looks too wordy: trim it, then go back and check that nothing moved that you did not mean to move.
- Adding a skill folder needs no manifest change. The `skills` array in `plugin.json` scans both category directories.
- Leave the `version` field in `plugins/dx-harness/.claude-plugin/plugin.json` alone. Record what your change gives the user under the `## Unreleased` heading in `plugins/dx-harness/CHANGELOG.md`, and let the release carry the bump. See [Cut a release](#cut-a-release).

## Cut a release

A release is its own pull request, and it is the only pull request that bumps the plugin version. Branch it as `release/<version>`.

The release pull request carries three things and nothing else:

1. The `version` field in `plugins/dx-harness/.claude-plugin/plugin.json`, set to the new version.
2. The `## Unreleased` heading in `plugins/dx-harness/CHANGELOG.md`, renamed to the version with the date it went out, as in `## 0.7.0 (2026-09-04)`.
3. A fresh empty `## Unreleased` heading above it, ready for the next change.

Nothing else belongs in it. A release that also fixes a skill cannot be reverted without reverting the fix, and the version then stops marking a set of changes anyone can name.
