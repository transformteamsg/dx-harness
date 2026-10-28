# design-lint

A linter for the design standard of `dx-harness`. It enforces the lintable rules of the base layer.

Status: 157 of the 158 lint rules have a module, a fixture pair, and a break patch. The package loads the rule files, resolves their parameters from a config file, runs the rule modules, and reports. One lint rule has none: `WP-15a` needs an OCR library that the package does not have. Four more, `WO-9a`, `WO-12a`, `WO-12b`, and `WO-12c`, are retired because another rule already runs the same check, so they are not counted. A run shows a lint rule with no module as "no linter module yet".

The design is in `plugins/dx-harness/skills/design-restructure/`:

- [`lint/run.md`](../../plugins/dx-harness/skills/design-restructure/lint/run.md): the command, the output, and the exit codes.
- [`lint/config.md`](../../plugins/dx-harness/skills/design-restructure/lint/config.md): the config file and how a rule gets a value.
- [`base/`](../../plugins/dx-harness/skills/design-restructure/base/README.md): the rule files.

## Run it

```sh
pnpm --filter design-lint design-lint list
pnpm --filter design-lint design-lint demo/site --config demo/design-lint.config.json --rendered
pnpm --filter design-lint demo -- BD-1a
```

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
| `src/project.ts`, `src/forms.ts`, `src/css.ts`, `src/readability.ts` | Helpers that several rules share: pages and links, form controls, raw colours in CSS, and readability |
| `src/rendered.ts` | The static server and the browser session (playwright-core) |
| `src/patch.ts` | Applies a break patch |
| `src/report.ts` | Formats findings and notes, and picks the exit code |
| `src/cli.ts` | The command |
| `fixtures/<CODE>/` | A passing site, a failing site, and the expected findings, for one rule |
| `demo/` | The passing site, the break patches, the demo script, and its config. `demo/config.d/` holds one config fragment for each category, and `demo/new-page.ts` makes a page that passes every rule |

## A rule module

A module implements one rule. It has a `code`, a `surface`, a `locate` function that finds candidates, and a `decide` function that applies the policy and the parameters. The rule file never names its module.

## Not built yet

- `design-lint init`.
- The module of `WP-15a`, which needs an OCR library. `source` rules parse with parse5. The plan also names ast-grep for the existing locators, and no rule uses it yet.
- The CDP-only adapter. A rendered rule sees only `evaluate`, so the engine can change, but Playwright is called directly.
- Mixed projects: the JSX and TSX path (`eslint-plugin-jsx-a11y` with ESLint 9) is built, and a source rule that names a jsx-a11y rule checks plain HTML and JSX together. Vue and Svelte templates are not read.
- A JSON Schema for the config file.
- A build step. Node strips types only outside `node_modules`, so the package must compile before it is published.
- Shipping the rule files and the presets inside the package. Today the command reads them from the mock-up.
