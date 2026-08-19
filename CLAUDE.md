# dx-harness

AI harness for agentic-driven product development (the `dx-harness` Claude Code plugin, in `plugins/dx-harness/`) plus the TFX Design Standard website (TransformX, Teacher & School portfolio). The website runs on Next.js 15 App Router, Tailwind v4, MDX content, and a YAML control catalogue. The package manager is pnpm.

This site must pass its own standard. Before changing UI, read [plugins/dx-harness/standards/catalog.yaml](plugins/dx-harness/standards/catalog.yaml), especially the SLP (anti-slop) controls. The catalogue is the single source of truth, and the site reads it directly.

## Design constraints

- No gradient text, no nested cards, no side-tab borders, no bounce easing, no purple gradients (SLP controls).
- Tokens: only the CSS variables in `app/globals.css`. No raw hex in components (TOK-1). Product colours: `--tw-blue` #0064FF, `--casesync` (Radix indigo-9), `--glow` (Radix orange-9).
- Fonts: Plus Jakarta Sans Variable (display), Inter Variable (body) via Fontsource. No other typefaces (TYP-1).

## Content and copy

- Content lives in `content/`, not in components. Page chrome lives in `components/`. Don't hardcode standard content into TSX.
- Copy: second person, active voice, sentence case, plain language. Error messages say what happened and what to do next.
- The standards catalogue controls govern product code and user-facing copy: components, UI strings, and `content/`. They do not govern technical documents, whose rules are in the next section. When editing prose in `content/`, apply SLP-9 (AI-writing tells). The canonical lists and calibration live in `plugins/dx-harness/standards/controls/slp-9.md`, carried by the dx-design-copy skill.
- Spelling is Commonwealth English in all prose: UI copy, `content/`, and docs. Write `colour`, `behaviour`, `catalogue`, `organise`, `prioritise`, `centre`, and `-ise` rather than `-ize`. Identifiers keep the spelling they already have, such as `catalog.yaml` and the CSS `color` property. The one settled exception in prose is `judgment`, which is what `docs/` already uses.
- Published docs intentionally have no `settled`/`proposed` status axis. Keep unresolved proposals in decision records or issues and label them there; don't add status frontmatter or badges to published pages.

## Technical documents

- Prose in `docs/`, `CONTEXT.md`, decision records, READMEs, PR descriptions, and the plugin's `SKILL.md` files follows the [Google developer documentation style guide](https://developers.google.com/style). It is the only authority for these documents. The catalogue controls do not apply: `CNT-3`'s 25-word sentence limit and the rest were written for UI strings, and enforcing them on instructional prose is the wrong bar.
- Second person, active voice, present tense. Google permits `will` to mark an action that happens later, so present tense is the default rather than a ban.
- Sentence case for headings and titles. Serial commas. Code-related text in code font, UI elements in bold.
- Em dashes take no space before or after. For separating an item from its description, use a colon or a period instead.
- Do not use `e.g.` or `i.e.` Write "for example" and "that is".
- Avoid the word-list terms that add nothing: `just`, `simply`, `easy`, `easily`, `please`, `in order to`, and `leverage` where you mean `use`.
- Spell out zero to nine and use numerals for 10 and above, except for version numbers, step numbers, and technical quantities, which always take numerals. Spell out ordinals.
- Spell out an abbreviation on first use.
- Write for a global audience: short sentences, and no idioms, colloquialisms, or slang.
- Use descriptive link text, never "here" or "this link".
- Where Google collides with `CONTEXT.md`, the vocabulary there wins: it names the terms this repo avoids.
- One deliberate deviation, and only one: spelling stays Commonwealth English per Content and copy. Google is US English and this repo is not, so a Commonwealth spelling you find here is not a mistake to correct.
- Apply this to documents you write or substantially revise. Don't retrofit files you are only passing through; a retrospective sweep is its own piece of work.

## Verify

- After content edits, run `pnpm build` to verify that MDX parses.

## Agent skills

### Issue tracker

Issues are tracked as GitHub Issues on `transformteamsg/dx-harness` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Deploy

The website deploys as a container to Airbase (staging only so far). See `docs/agents/deploy.md`.
