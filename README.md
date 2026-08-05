# dx-harness

AI harness for agentic-driven product development — a single Claude Code plugin
bundling engineering-workflow skills and design skills under one `/dx:` namespace.

- **19 skills** in two groups: 8 engineering (`code-review`, `create-issue`,
  `groom-issue`, `split-issue`, `implement-issue`, `lint-setup`, `git-hooks-setup`,
  `update-npm-dependencies`) and 11 design (`start`, `setup`, `design`, `critique`,
  `standards`, `copy`, `polish`, `motion`, `flow`, `layout`, `feedback`).
- The design skills ship with their standards catalog (`plugins/dx/standards/`),
  deterministic checks (`plugins/dx/checks/`), and an `evaluator` agent.

## Install

### Claude Code (plugin marketplace) — primary

    /plugin marketplace add transformteamsg/dx-harness
    /plugin install dx@dx-harness

Skills appear as `/dx:<name>` (e.g. `/dx:code-review`, `/dx:design`). Update with
`/plugin marketplace update dx-harness` then `/reload-plugins`.

The design skills need Python 3 + PyYAML for the `checks/` scripts. Run `/dx:setup`
(or `/dx:start`) for the per-user tool checklist.

### Claude Desktop / web app (plugin marketplace)

No command line needed — add dx-harness as a plugin marketplace, then install it in a few
clicks. Available on paid plans in the Claude web app, Claude Desktop, and Cowork.

1. In the left sidebar, open **Customize**, then the **Plugins** tab.
2. Under **Personal plugins**, click **"+"** and choose **Add marketplace →
   Add from a repository**.
3. Enter the repository `transformteamsg/dx-harness` and confirm.
4. Find the **dx** plugin in the marketplace and click **Install**.
5. Use any skill by typing **/** (or clicking the **"+"** button) in a chat — e.g.
   `/dx:code-review`, `/dx:design`.

### Other harnesses (Pi, OSS agents)

The canonical, tool-neutral sources are the `SKILL.md` files under
`plugins/dx/skills/`. Point your harness at those directories directly; the
`.claude-plugin/*.json` manifests are a Claude-specific adapter and can be ignored.

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
