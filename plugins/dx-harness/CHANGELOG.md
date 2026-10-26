# Changelog

## Unreleased

### Added

- **In-scope rule list**: `python3 scripts/in-scope-rules.py <repo-root>` prints the catalogue rules in scope for a product and a run, with the path to each rule's detail. The first line names the selection it came from. `--dimension` keeps one pass dimension's rules plus the L0 floor, and a `DESIGN.md` that names a rule code the catalogue does not have stops the list. The resolution is in `checks/checklib.py`, so the checks can use the same one ([#457](https://github.com/transformteamsg/dx-harness/issues/457)).
- **Check coverage file**: each check script declares the controls it decides and what it misses, `python3 checks/design-catalog-validate.py --write-coverage` generates `checks/COVERAGE.md` from those declarations, and the design skills and the reviewer agent read it instead of `checks/README.md`, which cuts that read from 22,160 to 2,962 tokens. `pnpm check` fails when the committed file is stale ([#461](https://github.com/transformteamsg/dx-harness/issues/461)).
- **Surface assessment on an issue**: `procedures/surface-assessment.md` decides whether an issue's work touches the frontend, the backend, both, or neither, the issue contract derives it before the code is read so it bounds what a run explores, and `dx-implement-issue` plans within it and states it in the report and in the request body ([#318](https://github.com/transformteamsg/dx-harness/issues/318)).
- **Code-level definition of done**: `procedures/definition-of-done.md` states the seven things a code change must make true and the evidence each is checked by, `dx-implement-issue` reports against every item before it opens a request and stops on an unsatisfied one, and `dx-create-pr` reads it instead of setting a second standard for coverage ([#317](https://github.com/transformteamsg/dx-harness/issues/317)).
- **New skill `dx-create-skill`**: it writes a `SKILL.md` from an interview or converts an existing one to the skill prose standard, baselining a conversion before it changes a line and verifying the result by running it in isolated sessions ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Skill token budget**: `docs/token-budget.md` holds the method and the cluster comparison, and a document per team maps every skill to the files it reads and counts the tokens in each ([#379](https://github.com/transformteamsg/dx-harness/issues/379)).

### Changed

- **Scaled captures and wireframe directions**: `python3 scripts/scale-capture.py --width 1280 <frame>...` writes a copy of each capture that is no wider than 1280, and every agent that judges, the reviewer included, reads that copy. The report crops from the full-size file. When Pillow is not installed, the command names the install step and the capture procedure stops before any agent judges. When a person asks for rough directions, diverge writes each direction as a wireframe page instead of a styled page ([#480](https://github.com/transformteamsg/dx-harness/issues/480)).
- **Shared design rules have one copy**: the return-to-caller payload is in `procedures/return-to-caller.md`, and execute, the orchestrator, the passes, and the capture procedure name it. `verify.md` points at `critique.md` for the capture order and at `procedures/design-review.md` for EVD-1. No skill lists the L0 floor or the layout controls: each takes them from the in-scope list, and the L0 tier in `procedures/catalogue-mechanics.md` binds the floor whatever the dimension. The validator drops `[L0-SYNC]` and `[LAY-SYNC]`, which checked the removed copies ([#459](https://github.com/transformteamsg/dx-harness/issues/459)).
- **Checks resolve rules through checklib**: every check gets the rules that apply, their tiers, and their categories from `checks/checklib.py`, with the resolution that `scripts/in-scope-rules.py` uses, and no check reads the catalogue itself. `detect.py` gets its L0 set from the catalogue, so it is no longer an `[L0-SYNC]` consumer. When the catalogue cannot be read, a check prints `ERROR <check>: could not resolve the rules that apply` and exits 1, and no longer falls back to an embedded tier table ([#479](https://github.com/transformteamsg/dx-harness/issues/479)).
- **Catalogue validator renamed**: `checks/validate.py` is `checks/design-catalog-validate.py`, because it validates only the design control catalogue and the files that restate it. A repository that calls the script by path, such as the design standard website's `check:python` script, must use the new path ([#466](https://github.com/transformteamsg/dx-harness/pull/466)).
- **Copy writing rules split out**: `procedures/copy-rules.md` holds the rules for writing user-facing text, and `dx-design-copy/SKILL.md` keeps the review method. `dx-design-execute` reads the writing rules at implement only when a build writes or changes user-facing text, so a build reads 2,422 tokens of copy rules instead of 3,728, and a build with no copy reads none ([#460](https://github.com/transformteamsg/dx-harness/issues/460)).
- **Execute phases read on demand**: `dx-design-execute` keeps the entry rules, the gates, and the run order in `SKILL.md`, and reads each phase from `references/` when the run enters that phase. A modification with a fixed structure reads no diverge file and no flow file, and the plan gate and the branch guard bind from `SKILL.md`. `SKILL.md` went from 5,953 to 2,577 tokens, and a modification run reads 983 fewer tokens ([#458](https://github.com/transformteamsg/dx-harness/issues/458)).
- **Research brief reads references**: `dx-design-research-brief` asks for the research goal before it writes any part of a plan, reads its component guidance from `references/`, and reads only the study-type guidance and the intake form that a run needs. A plan run reads 375 to 776 fewer tokens ([#462](https://github.com/transformteamsg/dx-harness/issues/462)).
- **One capture for each run**: in improve mode, `dx-design` captures the surface and resolves the rules once with `procedures/capture.md`, gives each dimension the capture set and its subset, judges one or two dimensions without a subagent, and gives a width that did not capture a `verify` verdict instead of a second capture ([#453](https://github.com/transformteamsg/dx-harness/issues/453)).
- **Rule detail by reader**: `python3 scripts/rule-detail.py <detail> --for build` prints the part of a rule's detail that a builder needs, and `--for review` adds the evaluator guidance and the "Do not flag" list for the reviewer. A `judgment` or `hybrid` rule with no evaluator part stops `--for review` as a catalogue defect. The list marks a rule that a check covers fully with `Covered by:`, and the builder reads no detail for it when that check is clean. A `tw` build reads 18,102 tokens of rule detail, against 52,820 ([#451](https://github.com/transformteamsg/dx-harness/issues/451)).
- **Design runs read their listed rules**: the design skills, the capture procedure, and the reviewer agent get their rules from `scripts/in-scope-rules.py` instead of reading all of `standards/catalog.yaml`, report the `Selection:` line, read the detail of listed rules only, and stop when the command exits with an error. A build reads 7,028 tokens of rules and a pass reads 621 to 2,015, against 19,051 ([#478](https://github.com/transformteamsg/dx-harness/issues/478)).
- **Waiver rules read on a waiver**: the design skills read `standards/README.md` only when someone asks about or proposes a waiver, and read it in that turn, so a build with no waiver no longer loads its 2,700 tokens ([#454](https://github.com/transformteamsg/dx-harness/issues/454)).
- **Declared-manual criteria not re-reported**: `dx-code-review` no longer re-reports a criterion that the branch's coverage declaration records as manual and the request body already names ([#319](https://github.com/transformteamsg/dx-harness/issues/319)).
- **Review verifies only postable findings**: `dx-code-review` applies the nit cap and the re-review rule before it verifies a finding, and checks a suggestion against the manifest only where it names a library, a library API, or a shell command, which cut a measured review's tokens by 12.9% ([#370](https://github.com/transformteamsg/dx-harness/issues/370), [#375](https://github.com/transformteamsg/dx-harness/pull/375)).
- **No overlay, no classification**: `dx-code-review` skips pattern classification and suppression when the reviewed repository has no `review/agent-patterns.md`, no longer loads the registry schema, and stops the review when that file's fetch fails for any reason other than a 404 ([#371](https://github.com/transformteamsg/dx-harness/issues/371)).
- **Story skill rewritten**: `dx-create-story` is eight numbered steps with every branch ending at a named destination, and its persona gate sits at Step 1 stated once instead of twice with different force ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Split offered before intake**: a request naming two capabilities reaches the split question first, so the author no longer answers six questions about a story that is then cut in half ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Criteria format picked per scenario**: a scenario a test runner can assert takes Given-When-Then, one only a person can confirm takes a checklist line, and one story carries both ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Contents list dropped**: a `SKILL.md` carries no table of contents, because the whole file is in context before an agent acts and a second copy of the step names goes stale on a renumber ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Attachment guidance extracted**: `dx-create-story` keeps its screenshot and recording rules in `references/attachments.md`, which a run opens only where the author has a file to upload ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **House style is one file**: `procedures/house-style.md` holds 1,704 tokens rather than 2,392. It keeps the cut tests, the test for length, and the evidence bar on a claim, and takes Google's mechanics from `CLAUDE.md` rather than restating them. The sentence-length caps are gone ([#379](https://github.com/transformteamsg/dx-harness/issues/379)).
- **Changelog read scoped**: `dx-create-skill` Step 8 reads the `## Unreleased` section through `sed` rather than opening the whole file, at 930 tokens rather than 3,979 ([#379](https://github.com/transformteamsg/dx-harness/issues/379)).
- **Trim verification points at the procedure**: `dx-trim-doc` checks a trimmed file against `procedures/house-style.md` instead of running the deleted lint ([#379](https://github.com/transformteamsg/dx-harness/issues/379)).
- **Attachment guidance centralised**: `procedures/attachments.md` holds the wording once; `dx-create-task`, `dx-create-bug`, and `dx-create-story` all point at it instead of carrying their own copy ([#385](https://github.com/transformteamsg/dx-harness/issues/385)).
- **Reviewer routing is a procedure**: `procedures/reviewer-routing.md` holds the four routing criteria, and `dx-create-story`, `dx-create-task`, and `dx-design` all read it. The two issue skills loaded all 2,203 tokens of `dx-design/issue-intake.md` to reach that table and now read 412, saving 1,791 per run ([#380](https://github.com/transformteamsg/dx-harness/issues/380)).

### Removed

- **House style lint and its mechanics file**: `scripts/house-style-lint.py` and `procedures/house-style-mechanics.md` are deleted. Run against 16 merged artifacts, the lint returned nothing on eight issue bodies and 56 findings on eight request bodies, of which 48 per cent came from one rule firing on eval score cells in tables ([#379](https://github.com/transformteamsg/dx-harness/issues/379)).

### Fixed

- **Self-test outside the website**: `validate.py --self-test` no longer carries two cases that checked the design standard website, so it passes in a repository that has a `package.json` but no website ([#401](https://github.com/transformteamsg/dx-harness/issues/401)).
- **Axe row runs as written**: both axe commands in `dx-design-setup`'s checklist take the plugin's directory from `PLUGIN_ROOT` and abort when it is empty or unset, rather than installing into the repository you are checking ([#305](https://github.com/transformteamsg/dx-harness/issues/305), [#307](https://github.com/transformteamsg/dx-harness/pull/307)).
- **Story template repaired**: it no longer offers two acceptance-criteria formats with no rule for choosing, and its Open questions line no longer runs two words together ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Stray bracket in `dx-create-issue`**: its first step heading no longer carries a bracket that broke it as a heading ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Shape label corroborates only**: `dx-split-issue` reads a story from its heading, and treats a `story` or `skill:dx-create-story` label as confirmation where one is present rather than a second requirement ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Sentence case in `dx-create-issue`**: its two guiding-question headings and its Step 5 table headers follow the standard, so the skill prose standard no longer documents them as defects to work around ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).
- **Emoji headings read correctly**: `dx-create-task`, `dx-split-issue`, and `dx-code-review` match a story on its heading text and ignore a leading emoji ([#366](https://github.com/transformteamsg/dx-harness/pull/366)).

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
