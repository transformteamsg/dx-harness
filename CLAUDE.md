# dx-harness

AI harness for agentic-driven product development: the `dx-harness` Claude Code plugin, in `plugins/dx-harness/`. The package manager is pnpm, and it installs only what the tests and the checks need.

The design standard website lives in the private repository `transformteamsg/dx-harness-website`.

## Spelling

Spelling is Commonwealth English in all prose. Write `colour`, `behaviour`, `catalogue`, `organise`, `prioritise`, `centre`, and `-ise` rather than `-ize`. Identifiers keep the spelling they already have, such as `catalog.yaml` and the CSS `color` property. The one settled exception in prose is `judgment`, which is what `docs/` already uses.

## Technical documents

- Prose in `docs/`, `CONTEXT.md`, decision records, READMEs, GitHub issue bodies, PR descriptions, and the plugin's `SKILL.md` files follows the [Google developer documentation style guide](https://developers.google.com/style). It is the only authority for these documents. The catalogue controls do not apply: `CNT-3`'s 25-word sentence limit and the rest were written for UI strings, and enforcing them on instructional prose is the wrong bar.
- Issue bodies, PR descriptions, decision records, and code review comments carry a stricter concision bar on top of Google's mechanics: the [house style](plugins/dx-harness/procedures/house-style.md), carried by the `dx-create-issue` family and the `dx-create-pr` skill. It does not apply to UI copy, which SLP-9 already governs.
- In a `SKILL.md` or a shared procedure, state the rule and the condition it applies under, never the argument for it. Keep a clause only where removing it changes what the rule does at an edge; CONTRIBUTING states the same test from the trimming side.
- Second person, active voice, present tense. Google permits `will` to mark an action that happens later.
- Sentence case for headings and titles. Serial commas. Code-related text in code font, UI elements in bold.
- Em dashes take no space before or after. For separating an item from its description, use a colon or a period instead.
- Do not use `e.g.` or `i.e.` Write "for example" and "that is".
- Avoid the word-list terms that add nothing: `just`, `simply`, `easy`, `easily`, `please`, `in order to`, and `leverage` where you mean `use`.
- Spell out zero to nine and use numerals for 10 and above, except for version numbers, step numbers, and technical quantities, which always take numerals. Spell out ordinals.
- Spell out an abbreviation on first use.
- Write for a global audience: short sentences, and no idioms, colloquialisms, or slang.
- Use descriptive link text, never "here" or "this link".
- Where Google collides with `CONTEXT.md`, the vocabulary there wins.
- One deliberate deviation, and only one: spelling stays Commonwealth English per Spelling. Commonwealth spelling is not a mistake to correct.
- Apply this to documents you write or substantially revise. Don't retrofit files you are only passing through; a retrospective sweep is its own piece of work.

## Contributing

- The contribution process is in [CONTRIBUTING.md](CONTRIBUTING.md): how to set up the tools the checks need, the commit convention, branch naming, what a pull request must carry, the checks that must pass, and the rules for adding a skill.
- Commit messages take `<type>(<scope>): <short description>` with the scope in backticks. CONTRIBUTING.md states the convention in full, including the types in use and how squash merging appends the pull request number.

## Verify

- After a change, run `pnpm test` and `pnpm check`. CI runs the same commands, plus `pnpm typecheck`.

## Agent skills

### Issue tracker

Issues are tracked as GitHub Issues on `transformteamsg/dx-harness` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
