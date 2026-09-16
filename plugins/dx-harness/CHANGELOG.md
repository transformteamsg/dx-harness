# Changelog

## Unreleased

## 0.7.0 (2026-09-14)

- A new skill, `dx-trim-doc`, shortens a document without changing what it does: it cuts only framing, illustration, and restatement, measures an executable document against one fixture per judgment gate, declines a word target the classification cannot pay for, and labels a trim it could not measure unverified ([#340](https://github.com/transformteamsg/dx-harness/pull/340)).
- A new skill, `dx-trim-leakage`, deletes prose that resolves only inside the session that wrote it, such as a dead plan citation, request-vantage phrasing, change narration, or an undated hedge, and restates any real fact from the repository's own vantage ([#340](https://github.com/transformteamsg/dx-harness/pull/340)).
- The plugin ships a bundled output style, `dx-house-style`, which sets the writing rules for a whole session and stays opt-in ([#303](https://github.com/transformteamsg/dx-harness/pull/303)).
- A new skill, `dx-house-style-setup`, turns that style on at the scope you pick and reads back the value Claude Code resolves rather than guessing at one ([#303](https://github.com/transformteamsg/dx-harness/pull/303)).
- A shared house style, `procedures/house-style.md`, governs every artifact the issue, pull request, review, and feedback skills write, and `scripts/house-style-lint.py` enforces its closed word lists ([#313](https://github.com/transformteamsg/dx-harness/pull/313)).
- `dx-code-review` raises everything each of its eight angles finds and trims afterwards, so the six-candidate ceiling bounds what gets posted rather than what gets examined ([#313](https://github.com/transformteamsg/dx-harness/pull/313)).
- A new skill, `dx-create-sprint-logs`, writes one sprint log per workstream with one clause and a link per row, and treats a row you cannot link as the finding itself ([#313](https://github.com/transformteamsg/dx-harness/pull/313), [#323](https://github.com/transformteamsg/dx-harness/issues/323)).
- `dx-implement-issue` now runs `dx-write-tests` before `dx-write-implementation`, so a criterion's test is written before its code rather than after it, and either half runs on its own ([#316](https://github.com/transformteamsg/dx-harness/issues/316), [#337](https://github.com/transformteamsg/dx-harness/pull/337)).
- `dx-write-tests` records a criterion it cannot honestly automate as manual with the reason, rather than writing an assertion that passes without exercising the behaviour ([#337](https://github.com/transformteamsg/dx-harness/pull/337)).
- A repository with no test runner is told so rather than quietly given one, and adding a test setup is offered as separate work ([#337](https://github.com/transformteamsg/dx-harness/pull/337)).
- A new skill, `dx-create-adr`, records an architecture decision as a numbered MADR file, never reuses a number, and questions a change with no architectural consequence rather than filing it ([#315](https://github.com/transformteamsg/dx-harness/issues/315), [#321](https://github.com/transformteamsg/dx-harness/pull/321)).
- The decision-record check, `checks/audit-record.py`, requires a verification ledger with a row for every control in scope and no L0 control sitting in it as `unverified` ([#304](https://github.com/transformteamsg/dx-harness/pull/304), [#339](https://github.com/transformteamsg/dx-harness/pull/339)).
- The content lint, `checks/content-lint.py`, reads an inline `dx-waive <CTL-ID> reason=...` marker at the deviation site, so an L2 waiver passes while an L1 still fails ([#302](https://github.com/transformteamsg/dx-harness/pull/302)).

## 0.6.0 (2026-09-01)

- A new skill, `dx-create-pr`, opens your pull request and keeps its description matching the branch as you push, and every other skill calls it so each request reads the same way on GitHub and GitLab ([#225](https://github.com/transformteamsg/dx-harness/pull/225), [#251](https://github.com/transformteamsg/dx-harness/pull/251)).
- `dx-code-review` reviews a pull request you name and no longer falls back to whatever your working directory holds ([#283](https://github.com/transformteamsg/dx-harness/pull/283)).
- The review says what blocks and what does not: only a red Important finding blocks, and it never tells you the change is good to merge ([#265](https://github.com/transformteamsg/dx-harness/pull/265)).
- Each finding shows its evidence, and a finding with no evidence behind it is dropped instead of posted ([#266](https://github.com/transformteamsg/dx-harness/pull/266)).
- The review looks for security problems too, which brings it to eight passes over your diff ([#267](https://github.com/transformteamsg/dx-harness/pull/267)).
- The review works on GitLab merge requests and reads the repository the request belongs to rather than the folder you are sitting in ([#269](https://github.com/transformteamsg/dx-harness/pull/269), [#264](https://github.com/transformteamsg/dx-harness/pull/264)).
- You can tune the review per repository with a `REVIEW.md` at the root, which adds rules of your own or names paths to leave alone ([#244](https://github.com/transformteamsg/dx-harness/pull/244)).
- The review posts at most five nits and holds back new ones on a re-review, so a second review is shorter than the first ([#243](https://github.com/transformteamsg/dx-harness/pull/243)).
- The review knows the common coding-agent mistakes out of the box, and your repository can add its own or switch off any that keep firing ([#246](https://github.com/transformteamsg/dx-harness/pull/246), [#247](https://github.com/transformteamsg/dx-harness/pull/247), [#255](https://github.com/transformteamsg/dx-harness/pull/255)).
- Creating a story or a task spots work that needs a designer first, labels it `needs-design-review`, and `dx-design` can start from the issue and read its acceptance criteria itself ([#37](https://github.com/transformteamsg/dx-harness/pull/37)).
- Design work is verified against the page as it renders, with two new checks shipping in the plugin: an accessibility scan across both screen sizes and both themes, and one that catches a table with missing headers ([#259](https://github.com/transformteamsg/dx-harness/pull/259)).
- Eleven standards controls were relabelled to say honestly whether a script or a person checks them, one control was added, and the type-hierarchy rule now asks for less difference between steps ([#258](https://github.com/transformteamsg/dx-harness/pull/258)).
- Three fixes to the checks: the accessibility lint layer can gate a build, colour contrast is measured on this site again, and decision records are audited in CI ([#210](https://github.com/transformteamsg/dx-harness/pull/210), [#211](https://github.com/transformteamsg/dx-harness/pull/211), [#212](https://github.com/transformteamsg/dx-harness/pull/212)).

## 0.5.0 (2026-08-21)

- Issue creation splits into the four shapes the work comes in, so `dx-create-story`, `dx-create-task`, `dx-create-chore`, and `dx-create-bug` each own their own intake and template ([#101](https://github.com/transformteamsg/dx-harness/issues/101), [#105](https://github.com/transformteamsg/dx-harness/issues/105), [#106](https://github.com/transformteamsg/dx-harness/issues/106), [#124](https://github.com/transformteamsg/dx-harness/issues/124), [#22](https://github.com/transformteamsg/dx-harness/issues/22)).
- `dx-create-issue` is now a router that makes one decision, which shape the work is, and hands off to the skill that owns it ([#180](https://github.com/transformteamsg/dx-harness/issues/180)).
- `dx-groom-issue` is deleted with no stub, because it filled the implementer sections of a template that no longer exists.
- `dx-split-issue` is rewritten for the sub-issue model: it reads the parent, proposes the cut, and hands each confirmed slice to `dx-create-task`.
- `dx-implement-issue`'s readiness gate reads the shape from the headings and judges against it, rather than demanding a grooming checklist none of the four shapes produces.
- Every created issue carries a shape label, `story`, `task`, `chore`, or `bug`, alongside its `skill:dx-create-*` label, so the shape is filterable rather than inferable.
- Screenshots and recordings go on the issue and never into the repository, with recordings going up as GIFs under 10 MB.
- A story and a task each need an unhappy path, which now gets its own heading separate from an edge case.
- Splitting a story offers both cuts, two stories or one story delivered as tasks, and says which one fits.

## 0.4.0 (2026-08-13)

- The 11 deprecated stub skills from the 0.2.0 rename are deleted, so the pre-0.2.0 design names no longer resolve; use the `dx-design-*` names in the 0.2.0 table below.
- The 13 design skill directories are renamed to match their frontmatter names, which completes the 0.2.0 rename, because until then every renamed skill collided with its own former name ([#121](https://github.com/transformteamsg/dx-harness/issues/121)).
- `checks/validate.py` resolves its sync consumers against the real tree, and a declared consumer it cannot find is an error rather than a skip ([#122](https://github.com/transformteamsg/dx-harness/issues/122)).
- `checks/contrast.py` composites a Tailwind opacity modifier over the page ground before measuring, so a tinted background no longer measures a token against itself ([#122](https://github.com/transformteamsg/dx-harness/issues/122)).
- First-run gaps in the standards are closed: `docs/catalog-changes/` exists and carries the normative async-evidence record, the checks are resolvable from a product repo, and the catalogue gains an `other` product identity ([#123](https://github.com/transformteamsg/dx-harness/issues/123)).

## 0.3.0 (2026-08-12)

- Six shared procedure docs now live in `procedures/` at the plugin root, loaded by the loop skill, the orchestrator, the five passes, critique, and the `dx-design-review` agent.
- `dx-standards` is deleted with no stub, and its content is relocated to `procedures/catalogue-mechanics.md` and `procedures/rule-proposal.md`.
- Rule 5 in `standards/README.md` sanctions standing overrides declared in a product's DESIGN.md, where an L0 is never overridable, an L1 needs a named approver, and an L2 needs a reason.

## 0.2.0 (2026-08-12)

- The design skills take the `dx-design-*` family names, with only the frontmatter changed, so relative cross-references still resolve.
- Two names are reused: `dx-design` now opens the front door, and the six-phase loop is `dx-design-execute`.
- Every old name except `dx-design` keeps a deprecated stub naming its replacement, the `dx-evaluator` agent becomes `dx-design-review`, and an install that stays on 0.1.0 keeps the old names.

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

- Initial release: 8 engineering skills, 13 design skills, the `dx-evaluator` agent, the standards catalogue, and the deterministic checks.
