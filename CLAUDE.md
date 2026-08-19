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
- When editing prose in `content/`, apply SLP-9 (AI-writing tells). The canonical lists and calibration live in `plugins/dx-harness/standards/controls/slp-9.md`, carried by the dx-design-copy skill.
- Spelling is Commonwealth English in all prose: UI copy, `content/`, and docs. Write `colour`, `behaviour`, `catalogue`, `organise`, `prioritise`, `centre`, and `-ise` rather than `-ize`. Identifiers keep the spelling they already have, such as `catalog.yaml` and the CSS `color` property. The one settled exception in prose is `judgment`, which is what `docs/` already uses.
- Published docs intentionally have no `settled`/`proposed` status axis. Keep unresolved proposals in decision records or issues and label them there; don't add status frontmatter or badges to published pages.

## Technical documents

- Prose in `docs/`, `CONTEXT.md`, decision records, READMEs, and PR descriptions follows the [Google developer documentation style guide](https://developers.google.com/style).
- The rules that come up most often: second person, active voice, present tense (not "will"), descriptive sentence-case headings, one idea per sentence, and no idioms or figures of speech.
- Em dashes: never chained, never spaced. Use a colon, a comma, or a second sentence. Density counts, so two or three in a short paragraph is too many even when no single sentence holds two.
- Tables hold short cells. Paragraph-length content becomes a section with a heading.
- Numerals for 10 and above. Expand an acronym on first use.
- Google is US English and this repo is not. Keep the Commonwealth spelling rule in Content and copy, and follow every other Google rule as it stands. Do not "correct" a Commonwealth spelling you find in this repo.
- Where Google's phrasing collides with `CONTEXT.md`, the vocabulary there wins: it names the terms this repo avoids.
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
