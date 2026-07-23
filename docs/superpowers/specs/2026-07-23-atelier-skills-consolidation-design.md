# Atelier — Skills Consolidation Design

**Date:** 2026-07-23
**Status:** Draft for approval
**Owner:** Nicholas Lim

## Purpose

Consolidate the Claude Code skills from two source repositories into `atelier`, a
single home distributed as **one Claude Code plugin** via a marketplace, importable
into **Claude Desktop**, and **tool-neutral** enough for non-Claude harnesses (Pi and
other OSS agents) to consume the same skill sources.

Sources:

- **`github.com/string-dxd/gh-ai-first-taskforce` (AIF)** — 8 engineering-workflow
  skills, currently prefixed `aif-*`, distributed as a `gh` CLI extension that copies
  skills into `~/.claude/skills/`.
- **`github.com/transformteamsg/tfx-design-standard` (TFX)** — 11 design skills,
  currently distributed as a Claude Code plugin (`/tfx:*`). These skills are **coupled**
  to a supporting bundle: a standards catalog, deterministic check scripts, and an
  evaluator agent.

## Decisions (locked)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Distribution | Single Claude Code plugin marketplace; also Claude Desktop importable; tool-neutral sources for Pi/OSS |
| 2 | Grouping | **One plugin** named `tfx`, single `/tfx:` namespace (not two plugins) |
| 3 | Scope | Skills + only the deps the design skills require (standards catalog, checks, evaluator agent). Leave behind everything else. |
| 4 | Namespace | Single `tfx` namespace; drop the `aif-` prefix from engineering skills — the plugin namespace supplies it (`/tfx:code-review`) |
| 5 | Skill folder layout | Skills grouped into two flat category folders — `skills/engineering/` and `skills/design/` — each one level deep. Loaded via the `skills` array in `plugin.json`. Verified: the `skills` field accepts an array of directory paths and scans each for `<name>/SKILL.md`. |

### Consequences

- One plugin means install is all-or-nothing — there is no "design-only" or
  "engineering-only" install. Accepted in exchange for a single namespace to maintain.
- Dropping the `aif-` prefix requires editing each engineering skill's frontmatter
  `name:` and any cross-references between those skills.
- Claude Code always also scans a bare `skills/` root in addition to the listed array
  paths. To avoid duplicate/failed scans, **no skill folder may sit directly under
  `skills/`** — every skill lives inside `skills/engineering/` or `skills/design/`.

## Target repository structure

```
atelier/
├── README.md                     # what atelier is; install for Claude Code, Claude Desktop, and other tools
├── LICENSE
├── .claude-plugin/
│   └── marketplace.json          # marketplace "atelier" → one plugin: tfx
├── plugins/
│   └── tfx/                       # the single plugin — namespace /tfx:
│       ├── .claude-plugin/
│       │   └── plugin.json        # skills: ["./skills/engineering/", "./skills/design/"]; agents: ["./agents/evaluator.md"]
│       ├── skills/
│       │   ├── engineering/       # flat one level in — from gh-ai-first-taskforce (aif- prefix dropped)
│       │   │   ├── code-review/
│       │   │   ├── create-issue/
│       │   │   ├── groom-issue/
│       │   │   ├── split-issue/
│       │   │   ├── implement-issue/
│       │   │   ├── lint-setup/
│       │   │   ├── git-hooks-setup/
│       │   │   └── update-npm-dependencies/
│       │   └── design/            # flat one level in — from tfx-design-standard
│       │       ├── start/
│       │       ├── setup/
│       │       ├── design/
│       │       ├── critique/
│       │       ├── standards/
│       │       ├── copy/
│       │       ├── polish/
│       │       ├── motion/
│       │       ├── flow/
│       │       ├── layout/
│       │       └── feedback/
│       ├── agents/
│       │   └── evaluator.md       # design generator/evaluator split
│       ├── standards/             # catalog.yaml, schema.json, controls/  (required by design skills)
│       ├── checks/                # *.py + fixtures/                       (required by design skills)
│       └── README.md              # documents the engineering vs design grouping and the loop
└── docs/
    ├── install.md                 # Claude Code (/plugin), Claude Desktop (folder import), generic/Pi
    └── CONTRIBUTING.md            # one convention for adding/modifying a skill
```

### Skill inventory (19 total, all invoked `/tfx:<name>`)

**Engineering (8):** `code-review`, `create-issue`, `groom-issue`, `split-issue`,
`implement-issue`, `lint-setup`, `git-hooks-setup`, `update-npm-dependencies`.

**Design (11):** `start`, `setup`, `design`, `critique`, `standards`, `copy`, `polish`,
`motion`, `flow`, `layout`, `feedback`.

No name collisions exist across the two sets.

## How each goal is satisfied

- **Marketplace install (primary):** `.claude-plugin/marketplace.json` declares the
  `atelier` marketplace with one plugin whose `source` is `./plugins/tfx`.
  `/plugin marketplace add transformteamsg/atelier` → `/plugin install tfx@atelier`.
  Skills become `/tfx:code-review`, `/tfx:design`, etc.
- **Claude Desktop:** each `skills/<category>/<skill>/` is a self-contained folder.
  Design skills that need the catalog/checks work because the whole plugin folder ships
  together.
- **Tool-neutral / Pi:** the canonical source *is* `plugins/tfx/skills/`. Non-Claude
  tools point at the `SKILL.md` files directly; the `.claude-plugin/*.json` files are a
  thin adapter they ignore. Nothing Claude-specific lives inside a skill body.

## What is explicitly left behind

From AIF: the `gh` extension entry point, `lefthook.yml` + `hooks/`, `templates/`,
`trials/`, `sample/`, `tests/fixtures/`, `interviews/`, `docs/` prose.

From TFX: the entire Next.js website (`app/`, `components/`, `lib/`, `content/`,
`public/`, config), `plans/`, `evals/`, `docs/`, and the website's own tooling — none
of which the skills require at runtime.

## Migration risks / cleanup required at execution time (not in this spec)

1. **Path references in design skills.** 10 of 11 design skills reference `standards/…`
   or `checks/…` relative to the old `harness/` root. After the move to
   `plugins/tfx/`, these must be verified and rewritten to resolve from the new plugin
   root. This is the highest-risk item.
2. **`/tfx:` cross-references.** Design skills already use the `/tfx:` namespace; keep
   these working (namespace is unchanged).
3. **Engineering prefix drop.** Rename each engineering skill's frontmatter `name:`
   (`aif-code-review` → `code-review`, etc.) and update inter-skill references and
   description text that name the old `aif-*` skills.
4. **`~/.claude/skills` references.** AIF skills authored for the gh-extension install
   path may reference `~/.claude/skills`; reconcile with the plugin install model.
5. **Fresh JSON.** Author `marketplace.json` and `plugin.json` new for atelier — do not
   copy TFX's verbatim (different name, source path, skills array, version reset).
6. **No stray root skills.** Because a bare `skills/` root is always scanned, ensure no
   skill folder lands directly under `skills/` — all live under a category folder.
7. **Overlap note (no action):** `code-review` (engineering diff review) and `critique`
   (design review) are conceptually adjacent but distinct; both are retained.

## Out of scope

- Rewriting or improving any individual skill's content beyond what the move requires.
- Re-authoring the design standards catalog or check scripts.
- Any auto-update / CI wiring for the marketplace.

## Next step

On approval of this spec, produce a step-by-step migration plan (file moves, JSON
authoring, reference sweeps, and a smoke test of `/plugin install tfx@atelier` plus a
`/tfx:` invocation) via the writing-plans skill. No skills move until the plan is
approved.
