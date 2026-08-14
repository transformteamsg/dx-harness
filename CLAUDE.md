# dx-harness

Open-source harness for agent-assisted product development (the `dx-harness` Claude Code plugin in `plugins/dx-harness/`) plus its documentation and standards website. It originated in TransformX's TFX and DXD practice. The website is Next.js 15 App Router + Tailwind v4 + MDX content + YAML control catalog. Package manager: pnpm.

This site must pass its own standard. Before changing UI, read [plugins/dx-harness/standards/catalog.yaml](plugins/dx-harness/standards/catalog.yaml) (the single source of truth — the site reads it directly) — especially the SLP (anti-slop) controls.

## Design constraints

- No gradient text, no nested cards, no side-tab borders, no bounce easing, no purple gradients (SLP controls).
- Tokens: only the CSS variables in `app/globals.css`. No raw hex in components (TOK-1). Product colours: `--tw-blue` #0064FF, `--casesync` (Radix indigo-9), `--glow` (Radix orange-9).
- Fonts: documentation uses Inter Variable for body and interface text, including buttons; EB Garamond 400/600 is reserved for titles/headings and owns landing-page reading; Departure Mono is for the wordmark, code, commands, data, and measured labels. Load locally via Fontsource-compatible packages (TYP-1 decision recorded in `DESIGN.md`).

## Content & copy

- Content lives in `content/`, not in components. Page chrome lives in `components/`. Don't hardcode standard content into TSX.
- Copy: second person, active voice, sentence case, plain language. Error messages say what happened and what to do next.
- When editing prose in `content/`, apply SLP-9 (AI-writing tells) — canonical lists and calibration in `plugins/dx-harness/standards/controls/slp-9.md`, carried by the dx-design-copy skill.

## Verify

- After content edits run `pnpm build` to verify MDX parses.

## Agent skills

### Issue tracker

Issues are tracked as GitHub Issues on `transformteamsg/dx-harness` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
