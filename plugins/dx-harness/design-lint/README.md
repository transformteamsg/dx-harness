# design-lint

A linter for the design standard of `dx-harness`. It enforces the lintable rules of the base layer.

Status: every lint rule has a module, a fixture pair, and a break patch. The package loads the rule files, resolves their parameters from a config file, runs the rule modules, and reports. Four rules, `WO-9a`, `WO-12a`, `WO-12b`, and `WO-12c`, are retired because another rule already runs the same check, so they are not counted. A run shows a lint rule with no module as "no linter module yet".

The design is in `docs/`, and the rules are in `plugins/dx-harness/standards/rules/`:

- [`docs/run.md`](docs/run.md): the command, the output, and the exit codes.
- [`docs/config.md`](docs/config.md): the config file and how a rule gets a value.
- [`docs/testing.md`](docs/testing.md): the fixtures, the break patches, and the demo.
- [`docs/building-a-rule.md`](docs/building-a-rule.md): how to turn a lint rule file into a working check.
- [`standards/rules.md`](../standards/rules.md): the rule files.

## Run it

```sh
pnpm --filter design-lint design-lint list
pnpm --filter design-lint design-lint demo/site --config demo/design-lint.config.json --rendered
pnpm --filter design-lint demo -- BD-1a
```

The package ships inside the `dx-harness` plugin, so an installed plugin carries it. It reads the rule files and the presets from the plugin's own `standards/` folder. From a product repository, run it as `node <plugin>/design-lint/src/cli.ts`, after `npm install --omit=dev --prefix <plugin>/design-lint`. Node 22.18 or later runs the TypeScript source directly.

The last command is the live demo. It breaks one rule on a copy of the site, lints, and restores the site. The rendered rules need a browser: Playwright's Chromium, or an installed Chrome.

The tests and the typecheck run from the repository root with `pnpm test` and `pnpm typecheck`.

## Layout

| Path | Holds |
| --- | --- |
| `src/types.ts` | The shapes that the other files share |
| `src/rules/load.ts` | Reads and validates the rule files |
| `src/config.ts` | Loads the config and resolves each parameter |
| `src/preset.ts` | Loads the domain preset that the config names |
| `src/run.ts` | Selects the rules, resolves them, and runs their modules |
| `src/registry.ts` | The rule modules |
| `src/modules/` | One file for each rule that has a check |
| `src/engines/axe.ts` | The axe-core wrapper: it injects axe and runs a set of axe rules |
| `src/engines/jsx-a11y.ts` | The jsx-a11y wrapper: it lints JSX and TSX files with a set of jsx-a11y rules |
| `src/engines/combine.ts` | Makes one rule of several checks, such as a plain HTML check and a jsx-a11y check |
| `src/lint.ts` | The entry point that the command and the tests share |
| `src/files.ts`, `src/html.ts` | File collection, and HTML parsing with source positions (parse5) |
| `src/templates.ts` | Reads the template elements and the style blocks of Vue and Svelte files, with source positions, and reports a file that does not parse |
| `src/project.ts`, `src/forms.ts`, `src/css.ts`, `src/readability.ts` | Helpers that several rules share: pages and links, form controls, raw colours in CSS, and readability |
| `src/rendered.ts` | The static server and the browser session (playwright-core) |
| `src/patch.ts` | Applies a break patch |
| `src/report.ts` | Formats findings and notes, and picks the exit code |
| `src/cli.ts` | The command |
| `docs/` | The design of the command, the config, the tests, and how to build a rule |
| `fixtures/<CODE>/` | A passing site, a failing site, and the expected findings, for one rule |
| `demo/` | The passing site, the break patches, the demo script, and its config. `demo/config.d/` holds one config fragment for each category, and `demo/new-page.ts` makes a page that passes every rule |

## A rule module

A module implements one rule. It has a `code`, a `surface`, a `locate` function that finds candidates, and a `decide` function that applies the policy and the parameters. The rule file never names its module.

## Not built yet

- `design-lint init`.
- ast-grep for the existing locators. `source` rules parse with parse5. The plan also names ast-grep, and no rule uses it yet.
- The CDP-only adapter. A rendered rule sees only `evaluate`, so the engine can change, but Playwright is called directly.
- Mixed projects: the JSX and TSX path (`eslint-plugin-jsx-a11y` with ESLint 9) is built, and a source rule that names a jsx-a11y rule checks plain HTML and JSX together. `WP-1b` and `BD-6b` also read `.vue` and `.svelte` files. A template that does not parse is reported as unreadable, and the finding blocks. The other source rules do not read Vue or Svelte templates yet.
- A JSON Schema for the config file.
- A build step. Node strips types only outside `node_modules`, so the package must compile before it is published.
