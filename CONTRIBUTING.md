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

## Open the pull request

Title the pull request with the issue title, character for character. Squash merging uses that title as the commit message in `main`, so a title that is not a valid commit message becomes a bad commit.

Open it as a draft until the checks pass and you have walked through the change by hand. The body comes from the repository's pull request template. Where no template file is present yet, the body needs a `Closes #NNN` line, a summary, the list of changes with the reason for each, and a test plan naming every acceptance criterion or done-when item with the automated test that covers it.

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
- Keep the body tool-neutral. No Claude-only assumptions, and no absolute install paths such as `~/.claude/...`. Reference sibling files relatively.
- Every skill is invoked as `/dx-harness:dx-<name>`, so names must be unique across both groups.
- Design skills reach the catalogue through `../../../standards/`, three levels up from the skill directory. Preserve that depth when you move a file.
- Adding a skill folder needs no manifest change. The `skills` array in `plugin.json` scans both category directories.
- Bump the `version` field in `plugins/dx-harness/.claude-plugin/plugin.json` when a change should reach installed users. Claude Code installs an update only when that version changes.
