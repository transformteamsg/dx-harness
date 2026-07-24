# atelier landing page — wireframe

Low-fidelity, greyscale wireframe for the atelier landing page (issue #3, Option A:
single-column narrative scroll). The rendered mockup is [`mock.html`](./mock.html) — a
throwaway sign-off artifact. This document records the structure, the real component
each region maps to for the React build (#7), and the standards control each decision
satisfies.

Fidelity is deliberately low: greyscale, system fonts, no committed colour/tokens.
Colour (COL-1/2), colour tokens (TOK-1), and the Plus Jakarta Sans / Inter fonts
(TYP-1) are **deferred to #7**; this artifact locks structure and hierarchy only.

## Structure (top to bottom)

| # | Section | Content | Real component for #7 | Controls |
|---|---------|---------|-----------------------|----------|
| — | Skip link + landmarks | "Skip to content"; `<header>/<main>/<footer>`; one `<h1>`; page `<title>` | Layout shell | A11Y-6, A11Y-7, A11Y-9, A11Y-10 |
| 1 | Hero | Wordmark, `<h1>` tagline, one-line lede. The single focal region. | Section + heading + lede | LAY-7, TYP (hierarchy), SLP-6 |
| 2 | Install | Two labelled paths in one section: **Claude Code** (two `/plugin` commands in a code block + a "Copy commands" button as the one primary action) and **Claude Desktop or web** (a 3-step ordered list for the no-command-line plugin flow); a shared follow-up line on `/tfx:` usage. | shadcn Button (primary) + code block + ordered list | CMP-5, SLP-5, SLP-11, SLP-6, A11Y-7, A11Y-2, A11Y-4 (44px target), CNT-2 |
| 3 | How it works | Three stepped-down points (one namespace; standards enforced; generator/evaluator split) as an ordered list, not cards. | Ordered list | SLP-5, SLP-11, SLP-6, SLP-7 |
| 4 | Skill catalogue | Two groups (Engineering 8, Design 11), each a description list of name + one-line summary. Not a card grid. | Description list (`<dl>`) per group | SLP-5, SLP-11, A11Y-7 |
| 5 | Footer | Repo link + license link. | Footer | A11Y-1, CNT-12 |

## Reading order (LAY-7 squint test)

The visual reading order matches the newcomer's task priority: understand what atelier
is (hero) -> install it (install) -> understand how it holds together (how it works) ->
browse what it ships (catalogue) -> find the source (footer). One primary focal region
(hero); one primary action (Copy commands).

## Content inventory (issue #3 acceptance)

- Hero: what atelier is. Present.
- Install: the two `/plugin` commands (Claude Code) plus a no-command-line Claude
  Desktop / web plugin path (3-step list). Present.
- Skill catalogue: 19 skills, 8 engineering + 11 design, names matching `plugins/tfx/skills/`. Present.
- How it works: one `/tfx:` namespace, standards + checks, evaluator split. Present.
- Footer: repo link + license. Present.

## Control traceability

- **LAY-2** (reflow at 320px): single column with a fluid `max-width` measure; no
  fixed multi-column layout to break. Verify at capture.
- **LAY-4 / TYP-6** (measure): body column capped at `--measure: 42rem` (~66ch).
- **LAY-7** (one focal region, reading order): hero is the sole focal region; order
  above.
- **SLP-5 / SLP-11** (no card slop): the Claude Desktop install path and how-it-works
  are ordered lists; the catalogue is grouped description lists. The two install paths
  are grouped by spacing (`.path` margin only — no border/shadow/radius). No card chrome
  anywhere.
- **SLP-6 / SLP-7** (hierarchy, rhythm): hierarchy from size/weight; related items
  grouped tighter than unrelated (section padding vs in-list spacing).
- **A11Y-1** (contrast): greys are AA on white (ink ~16:1, muted ~7:1); primary button
  is white on near-black.
- **A11Y-2 / A11Y-4**: links and the button are keyboard-reachable with a visible
  focus ring; the button is >=44px tall.
- **A11Y-6/7/9/10**: skip link, semantic landmarks, headings in order, descriptive
  `<title>`.
- **CMP-5** (one primary action): only "Copy commands" is a filled button.
- **CNT-2 / CNT-9 / CNT-12**: plain skill names, one idea per line, sentence case.
- **SLP-9** (no AI-writing tells): summaries avoid buzzwords, em-dash chains, and
  forced triads.

## Deferred to #7 (documented, not waived)

COL-1/COL-2 (colour), TOK-1 (colour tokens), TYP-1 (Plus Jakarta Sans / Inter), and
TYP-2/TYP-3 (Tailwind type scale + size floors). The mockup is a greyscale throwaway on
an ad-hoc rem scale with no Tailwind/token infrastructure; these controls attach to the
shipped React app in #7. A11Y-1 still binds here and is satisfied by the greys chosen.

## Not applicable

IDN-2/3/4 and CaseSync controls (this is the atelier landing page, not a Teacher &
School product surface); CMP-2/CMP-3/A11Y-11 (no async or destructive actions);
CMP-6 (the catalogue is a list, not tabular comparison data).
