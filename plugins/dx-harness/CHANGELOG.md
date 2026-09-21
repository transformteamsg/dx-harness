# Changelog

## Unreleased

### Added

- **Code-level definition of done**: `procedures/definition-of-done.md` states the seven things a code change must make true and the evidence each is checked by, `dx-implement-issue` reports against every item before it opens a request and stops on an unsatisfied one, and `dx-create-pr` reads it instead of setting a second standard for coverage ([#317](https://github.com/transformteamsg/dx-harness/issues/317)).
- **New skill `dx-create-skill`**: it writes a `SKILL.md` from an interview or converts an existing one to the skill prose standard, baselining a conversion before it changes a line and verifying the result by running it in isolated sessions ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).

### Changed

- **Declared-manual criteria not re-reported**: `dx-code-review` no longer re-reports a criterion that the branch's coverage declaration records as manual and the request body already names ([#319](https://github.com/transformteamsg/dx-harness/issues/319)).
- **Story skill rewritten**: `dx-create-story` is eight numbered steps with every branch ending at a named destination, and its persona gate sits at Step 1 stated once instead of twice with different force ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Split offered before intake**: a request naming two capabilities reaches the split question first, so the author no longer answers six questions about a story that is then cut in half ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Criteria format picked per scenario**: a scenario a test runner can assert takes Given-When-Then, one only a person can confirm takes a checklist line, and one story carries both ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).

### Fixed

- **Axe row runs as written**: both axe commands in `dx-design-setup`'s checklist take the plugin's directory from `PLUGIN_ROOT` and abort when it is empty or unset, rather than installing into the repository you are checking ([#305](https://github.com/transformteamsg/dx-harness/issues/305), [#307](https://github.com/transformteamsg/dx-harness/pull/307)).
- **Story template repaired**: it no longer offers two acceptance-criteria formats with no rule for choosing, and its Open questions line no longer runs two words together ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
## 0.7.0 (2026-09-14)

### Added

- **New skill `dx-trim-doc`**: it shortens a document without changing what it does; it cuts only framing, illustration, and restatement, measures an executable document against one fixture per judgment gate, declines a word target the classification cannot pay for, and labels a trim it could not measure unverified ([#340](https://github.com/transformteamsg/dx-harness/pull/340)).
- **New skill `dx-trim-leakage`**: it deletes prose that resolves only inside the session that wrote it, such as a dead plan citation, request-vantage phrasing, change narration, or an undated hedge, and restates any real fact from the repository's own vantage ([#340](https://github.com/transformteamsg/dx-harness/pull/340)).
- **Output style `dx-house-style`**: the plugin ships a bundled output style that sets the writing rules for a whole session and stays opt-in ([#303](https://github.com/transformteamsg/dx-harness/pull/303)).
- **New skill `dx-house-style-setup`**: it turns that style on at the scope you pick and reads back the value Claude Code resolves rather than guessing at one ([#303](https://github.com/transformteamsg/dx-harness/pull/303)).
- **Shared house style**: `procedures/house-style.md` governs every artifact the issue, pull request, review, and feedback skills write, and `scripts/house-style-lint.py` enforces its closed word lists ([#313](https://github.com/transformteamsg/dx-harness/pull/313)).
- **New skill `dx-create-sprint-logs`**: it writes one sprint log per workstream with one clause and a link per row, and treats a row you cannot link as the finding itself ([#313](https://github.com/transformteamsg/dx-harness/pull/313), [#323](https://github.com/transformteamsg/dx-harness/issues/323)).
- **New skill `dx-create-adr`**: it records an architecture decision as a numbered MADR file, never reuses a number, and questions a change with no architectural consequence rather than filing it ([#315](https://github.com/transformteamsg/dx-harness/issues/315), [#321](https://github.com/transformteamsg/dx-harness/pull/321)).
- **Inline `dx-waive` markers**: the content lint, `checks/content-lint.py`, reads an inline `dx-waive <CTL-ID> reason=...` marker at the deviation site, so an L2 waiver passes while an L1 still fails ([#302](https://github.com/transformteamsg/dx-harness/pull/302)).

### Changed

- **Review trims after finding**: `dx-code-review` raises everything each of its eight angles finds, so the six-candidate ceiling bounds what gets posted rather than what gets examined ([#313](https://github.com/transformteamsg/dx-harness/pull/313)).
- **Tests before implementation**: `dx-implement-issue` runs `dx-write-tests` before `dx-write-implementation`, so a criterion's test is written before its code rather than after it, and either half runs on its own ([#316](https://github.com/transformteamsg/dx-harness/issues/316), [#337](https://github.com/transformteamsg/dx-harness/pull/337)).
- **Manual criteria named as manual**: `dx-write-tests` records a criterion it cannot automate as manual with the reason, rather than writing an assertion that passes without exercising the behaviour ([#337](https://github.com/transformteamsg/dx-harness/pull/337)).
- **Missing test runner reported**: a repository that has none is told so rather than quietly given one, and adding a test setup is offered as separate work ([#337](https://github.com/transformteamsg/dx-harness/pull/337)).
- **Ledger required in records**: the decision-record check, `checks/audit-record.py`, requires a verification ledger with a row for every control in scope and no L0 control sitting in it as `unverified` ([#304](https://github.com/transformteamsg/dx-harness/pull/304), [#339](https://github.com/transformteamsg/dx-harness/pull/339)).

## 0.6.0 (2026-09-01)

### Added

- **New skill `dx-create-pr`**: it opens your pull request and keeps its description matching the branch as you push, and every other skill calls it so each request reads the same way on GitHub and GitLab ([#225](https://github.com/transformteamsg/dx-harness/pull/225), [#251](https://github.com/transformteamsg/dx-harness/pull/251)).
- **Security pass in the review**: the review looks for security problems too, which brings it to eight passes over your diff ([#267](https://github.com/transformteamsg/dx-harness/pull/267)).
- **GitLab merge requests**: the review works on them, and it reads the repository the request belongs to rather than the folder you are sitting in ([#269](https://github.com/transformteamsg/dx-harness/pull/269), [#264](https://github.com/transformteamsg/dx-harness/pull/264)).
- **Per-repository `REVIEW.md`**: a `REVIEW.md` at the repository root tunes the review, and it adds rules of your own or names paths to leave alone ([#244](https://github.com/transformteamsg/dx-harness/pull/244)).
- **Coding-agent mistake checks**: the review knows the common ones out of the box, and your repository can add its own or switch off any that keep firing ([#246](https://github.com/transformteamsg/dx-harness/pull/246), [#247](https://github.com/transformteamsg/dx-harness/pull/247), [#255](https://github.com/transformteamsg/dx-harness/pull/255)).
- **Design work flagged at intake**: creating a story or a task spots work that needs a designer first, labels it `needs-design-review`, and `dx-design` can start from the issue and read its acceptance criteria itself ([#37](https://github.com/transformteamsg/dx-harness/pull/37)).
- **Two rendered-page design checks**: design work is verified against the page as it renders, by an accessibility scan across both screen sizes and both themes, and by a check that catches a table with missing headers ([#259](https://github.com/transformteamsg/dx-harness/pull/259)).

### Changed

- **Review targets a named request**: `dx-code-review` reviews a pull request you name and no longer falls back to whatever your working directory holds ([#283](https://github.com/transformteamsg/dx-harness/pull/283)).
- **Only Important findings block**: a red Important finding is the one thing that blocks, and the review never tells you the change is good to merge ([#265](https://github.com/transformteamsg/dx-harness/pull/265)).
- **Findings carry their evidence**: each finding shows its evidence, and a finding with no evidence behind it is dropped instead of posted ([#266](https://github.com/transformteamsg/dx-harness/pull/266)).
- **Nits capped at five**: the review posts at most five nits and holds back new ones on a re-review, so a second review is shorter than the first ([#243](https://github.com/transformteamsg/dx-harness/pull/243)).
- **Control labels corrected**: eleven standards controls were relabelled to say whether a script or a person checks them, one control was added, and the type-hierarchy rule now asks for less difference between steps ([#258](https://github.com/transformteamsg/dx-harness/pull/258)).

### Fixed

- **Three fixes to the checks**: the accessibility lint layer can gate a build, colour contrast is measured on this site again, and decision records are audited in CI ([#210](https://github.com/transformteamsg/dx-harness/pull/210), [#211](https://github.com/transformteamsg/dx-harness/pull/211), [#212](https://github.com/transformteamsg/dx-harness/pull/212)).

## 0.5.0 (2026-08-21)

### Added

- **Four issue-shape skills**: issue creation splits into the four shapes the work comes in, so `dx-create-story`, `dx-create-task`, `dx-create-chore`, and `dx-create-bug` each own their own intake and template ([#101](https://github.com/transformteamsg/dx-harness/issues/101), [#105](https://github.com/transformteamsg/dx-harness/issues/105), [#106](https://github.com/transformteamsg/dx-harness/issues/106), [#124](https://github.com/transformteamsg/dx-harness/issues/124), [#22](https://github.com/transformteamsg/dx-harness/issues/22)).
- **Shape labels on issues**: every created issue carries `story`, `task`, `chore`, or `bug` alongside its `skill:dx-create-*` label, so the shape is filterable rather than inferable.

### Changed

- **`dx-create-issue` routes by shape**: it makes one decision, which shape the work is, and hands off to the skill that owns it ([#180](https://github.com/transformteamsg/dx-harness/issues/180)).
- **`dx-split-issue` cuts sub-issues**: it reads the parent, proposes the cut, and hands each confirmed slice to `dx-create-task`.
- **Readiness gate reads the shape**: `dx-implement-issue` takes it from the headings and judges against it, rather than demanding a grooming checklist none of the four shapes produces.
- **Media attached to the issue**: screenshots and recordings never go into the repository, and a recording goes up as a GIF under 10 MB.
- **Unhappy path gets a heading**: a story and a task each need one, under a heading separate from an edge case.
- **Split offers both cuts**: splitting a story offers two stories or one story delivered as tasks, and says which one fits.

### Removed

- **`dx-groom-issue` deleted**: it goes with no stub, because it filled the implementer sections of a template that no longer exists.

## 0.4.0 (2026-08-13)

### Changed

- **Design directories renamed**: all 13 of them now match their frontmatter names, which completes the 0.2.0 rename, because until then every renamed skill collided with its own former name ([#121](https://github.com/transformteamsg/dx-harness/issues/121)).

### Removed

- **Deprecated stubs deleted**: the 11 left by the 0.2.0 rename go, so the pre-0.2.0 design names no longer resolve; use the `dx-design-*` names in the 0.2.0 table below.

### Fixed

- **Unresolvable sync consumer fails**: `checks/validate.py` resolves its sync consumers against the tree on disk, and a declared consumer it cannot find is an error rather than a skip ([#122](https://github.com/transformteamsg/dx-harness/issues/122)).
- **Opacity composited before measuring**: `checks/contrast.py` composites a Tailwind opacity modifier over the page ground before measuring, so a tinted background no longer measures a token against itself ([#122](https://github.com/transformteamsg/dx-harness/issues/122)).
- **First-run gaps closed**: `docs/catalog-changes/` exists and carries the normative async-evidence record, the checks are resolvable from a product repository, and the catalogue gains an `other` product identity ([#123](https://github.com/transformteamsg/dx-harness/issues/123)).

## 0.3.0 (2026-08-12)

### Added

- **Shared procedure documents**: six of them live in `procedures/` at the plugin root, loaded by the loop skill, the orchestrator, the five passes, critique, and the `dx-design-review` agent.
- **Standing overrides in `DESIGN.md`**: Rule 5 in `standards/README.md` sanctions them, where an L0 is never overridable, an L1 needs a named approver, and an L2 needs a reason.

### Removed

- **`dx-standards` deleted**: it goes with no stub, and its content is relocated to `procedures/catalogue-mechanics.md` and `procedures/rule-proposal.md`.

## 0.2.0 (2026-08-12)

### Changed

- **Design skills renamed `dx-design-*`**: the design skills take the family names, with only the frontmatter changed, so relative cross-references still resolve.
- **Two names reused**: `dx-design` now opens the front door, and the six-phase loop is `dx-design-execute`.

### Deprecated

- **Old names kept as stubs**: every one except `dx-design` keeps a stub naming its replacement, the `dx-evaluator` agent becomes `dx-design-review`, and an install that stays on 0.1.0 keeps the old names.

| Old name | New name |
|---|---|
| dx-start | dx-design |
| dx-design | dx-design-execute |
| dx-critique | dx-design-critique |
| dx-copy | dx-design-copy |
| dx-flow | dx-design-flow |
| dx-layout | dx-design-pattern |
| dx-motion | dx-design-motion |
| dx-polish | dx-design-polish |
| dx-setup | dx-design-setup |
| dx-git-buddy | dx-design-git |
| dx-feedback | dx-design-feedback |
| dx-research-brief | dx-design-research-brief |

## 0.1.0

### Added

- **Initial release**: 8 engineering skills, 13 design skills, the `dx-evaluator` agent, the standards catalogue, and the deterministic checks.
