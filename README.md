# atelier

AI harness for agentic-driven product development — a single Claude Code plugin
bundling engineering-workflow skills and design skills under one `/tfx:` namespace.

- **19 skills** in two groups: 8 engineering (`code-review`, `create-issue`,
  `groom-issue`, `split-issue`, `implement-issue`, `lint-setup`, `git-hooks-setup`,
  `update-npm-dependencies`) and 11 design (`start`, `setup`, `design`, `critique`,
  `standards`, `copy`, `polish`, `motion`, `flow`, `layout`, `feedback`).
- The design skills ship with their standards catalog (`plugins/tfx/standards/`),
  deterministic checks (`plugins/tfx/checks/`), and an `evaluator` agent.

## Install

See [docs/install.md](docs/install.md) for Claude Code, Claude Desktop, and other
harnesses. Quickstart (Claude Code):

    /plugin marketplace add transformteamsg/atelier
    /plugin install tfx@atelier

Then invoke any skill as `/tfx:<name>` (e.g. `/tfx:code-review`, `/tfx:design`).

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
