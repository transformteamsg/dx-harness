# dx-harness

AI harness for agentic-driven product development — a single Claude Code plugin
bundling engineering-workflow skills and design skills under one `dx-` prefix.

- **21 skills** in two groups: 8 engineering (`dx-code-review`, `dx-create-issue`,
  `dx-groom-issue`, `dx-split-issue`, `dx-implement-issue`, `dx-lint-setup`,
  `dx-git-hooks-setup`, `dx-update-npm-dependencies`) and 13 design (`dx-design`,
  `dx-design-setup`, `dx-design-execute`, `dx-design-critique`,
  `dx-design-language`, `dx-design-copy`, `dx-design-polish`, `dx-design-motion`,
  `dx-design-flow`, `dx-design-pattern`, `dx-design-feedback`, `dx-design-git`,
  `dx-design-research-brief`). The old pre-0.2.0 design names no longer resolve.
- The design skills ship with their standards catalog (`plugins/dx-harness/standards/`),
  shared procedure docs (`plugins/dx-harness/procedures/`), deterministic checks
  (`plugins/dx-harness/checks/`), and an `evaluator` agent.

**DX Harness: one prefix, every discipline.** A harness for digital excellence — born in
DXD Xperience Studio, built for everyone.

## What "DX" stands for

Deliberately open-ended, so it scales with whoever uses it — Digital Experience or
Digital Excellence for the broadest reading, Developer Experience for engineers,
Designer Experience for designers. It also echoes our own office name, DXD Xperience
Studio, which keeps the origin story without hard-coding the brand into an
open-source plugin.

The `dx` prefix is the part that matters most: type `/dx` and every skill
auto-surfaces. Plugin names can evolve; the prefix shouldn't. That is why the prefix
lives in the skill names themselves (`dx-code-review`) and not only in the plugin
namespace — a skill copied out of the plugin into a bare `.claude/skills/` folder
still announces where it came from.

## Install

### Claude Code (plugin marketplace) — primary

    /plugin marketplace add transformteamsg/dx-harness
    /plugin install dx-harness@dx-harness

Skills appear as `/dx-harness:dx-<name>` (e.g. `/dx-harness:dx-code-review`,
`/dx-harness:dx-design`). Update with `/plugin marketplace update dx-harness` then
`/reload-plugins`. Claude Code installs updates only when the version in `plugin.json`
changes.

If the update reports no changes and the installed plugin is still `0.3.0`, remove
only that version's cached plugin directory, then reinstall and reload:

    rm -rf ~/.claude/plugins/cache/dx-harness/dx-harness/0.3.0
    /plugin install dx-harness@dx-harness
    /reload-plugins

The design skills need Python 3 + PyYAML for the `checks/` scripts. Run `/dx-harness:dx-design-setup`
(or `/dx-harness:dx-design`) for the per-user tool checklist.

### Claude Desktop / web app (plugin marketplace)

No command line needed — add dx-harness as a plugin marketplace, then install it in a few
clicks. Available on paid plans in the Claude web app, Claude Desktop, and Cowork.

1. In the left sidebar, open **Customize**, then the **Plugins** tab.
2. Under **Personal plugins**, click **"+"** and choose **Add marketplace →
   Add from a repository**.
3. Enter the repository `transformteamsg/dx-harness` and confirm.
4. Find the **dx-harness** plugin in the marketplace and click **Install**.
5. Use any skill by typing **/** (or clicking the **"+"** button) in a chat — e.g.
   `/dx-harness:dx-code-review`, `/dx-harness:dx-design`.

### Other harnesses (Pi, OSS agents)

The canonical, tool-neutral sources are the `SKILL.md` files under
`plugins/dx-harness/skills/`. Point your harness at those directories directly; the
`.claude-plugin/*.json` manifests are a Claude-specific adapter and can be ignored.

## Migrating from `tfx`

This repo was called `atelier` and the plugin was called `tfx`. If you installed the
old plugin, re-add the marketplace under its new name:

    /plugin marketplace remove atelier
    /plugin marketplace add transformteamsg/dx-harness
    /plugin install dx-harness@dx-harness

Then rename these in **your product repo** — the checks no longer recognise the old
spellings:

| Old | New | Where it lives |
|---|---|---|
| `/tfx:<skill>` | `/dx-harness:dx-<skill>` | how you invoke a skill |
| `.tfx/` | `.dx/` | `config.json`, `design.json`, `component-manifest.json` |
| `tfx-waive CTL-1` | `dx-waive CTL-1` | inline waiver comments in source |
| `<!-- tfx-sync:… -->` | `<!-- dx-sync:… -->` | fragment-parity markers in docs |
| `tfx-tokens` | `dx-tokens` | token-region markers in stylesheets |
| `TFX-DS` | `DX-DS` | the control catalog's name in prose |

A one-shot sweep for a product repo:

    grep -rl 'tfx' . | xargs sed -i '' 's/tfx-waive/dx-waive/g; s/tfx-sync/dx-sync/g; s/tfx-tokens/dx-tokens/g; s/\.tfx/.dx/g; s/TFX-DS/DX-DS/g'
    git mv .tfx .dx

The upstream design-standard repo and its Notion source keep their existing
`tfx-design-standard` URLs; only the harness renamed.

## Website

This repo also hosts the design-standard website (Next.js 15, pnpm) — the
human- and agent-readable rendering of the standard, including `/llms.txt`
(with control details: `/llms-full.txt`) and `/standards/catalog.yaml`. It
reads the catalog directly from `plugins/dx-harness/standards/`.

    pnpm install
    pnpm dev      # local dev server
    pnpm build    # runs the standards gates, then builds

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the commit convention, branch naming,
the checks that must pass, and the rules for adding a skill.
