# Base rules

The base layer of the design standard. Every product follows it. It holds two sets of rules:

- **The DSS rules.** Each implements a control of the Digital Service Standards (DSS). Their folders take the nine DSS prefixes, such as `bd/` and `wp/`.
- **The catalogue rules.** Each comes from a generic control in `catalog.yaml`. Their folders take the catalogue prefixes, such as `cmp/` and `mot/`. The tasks under [#541](https://github.com/transformteamsg/dx-harness/issues/541) write them.

[ADR-0002](../../../docs/adr/0002-rule-categories-and-file-names.md) lists the 17 categories and the file-name convention. The live `dx-design-*` skills and `checks/` do not read these rules yet.

## Layers

Standards resolve in this order. A later layer overrides an earlier one.

1. **Base.** The DSS rules and the catalogue rules.
2. **Domain.** A domain preset in `presets/`. It sets values for every product in one domain. See [Domain presets](presets/README.md).
3. **Custom.** Not designed yet.

The base runs with no domain and no `DESIGN.md`.

## Layout

| Path | Holds |
| --- | --- |
| `rules/<category>/README.md` | One category: the rule index, the decisions, and the open items |
| `rules/<category>/MAPPING.md` | For each source control: the rules, the surface, the engine, the parameters, and the judged part |
| `rules/<category>/<slug>.md` | One rule file, named by its `slug` |
| `presets/<name>.md` | One domain preset |
| `rules/redirects.yaml` | Each old rule file name, mapped to the file's path now, and each catalogue control, mapped to the rules that replace it |
| [`packages/design-lint/docs/config.md`](../../../packages/design-lint/docs/config.md) | The config file: shape, resolution order, and page groups |
| [`packages/design-lint/docs/run.md`](../../../packages/design-lint/docs/run.md) | The `design-lint` command: flags, output, exit codes, and hooks |
| [`packages/design-lint/docs/testing.md`](../../../packages/design-lint/docs/testing.md) | How the rules are tested and demonstrated: fixtures, break patches, the demo, and the tracer bullet |
| [`packages/design-lint/docs/building-a-rule.md`](../../../packages/design-lint/docs/building-a-rule.md) | How to turn a lint rule file into a working check |
| `packages/design-lint/` | The linter: 159 of the 160 lint rules have a module, a fixture pair, and a break patch |

## Categories

The DSS categories, then the catalogue categories that have a rule. A catalogue category gets a row when its first rule is written. For a catalogue category, the controls column counts its controls in `catalog.yaml`.

| Category | DSS section | Controls | Rules | Lintable | Judged | Out of scope |
| --- | --- | --- | --- | --- | --- | --- |
| [BD](rules/bd/README.md) | Baseline Design Practices | 9 | 26 | 18 | 8 | 0 |
| [WP](rules/wp/README.md) | WCAG: Perceivable | 19 | 57 | 41 | 16 | 0 |
| [WO](rules/wo/README.md) | WCAG: Operable | 18 | 40 | 26 | 14 | 0 |
| [WU](rules/wu/README.md) | WCAG: Understandable | 14 | 36 | 22 | 14 | 0 |
| [WR](rules/wr/README.md) | WCAG: Robust | 2 | 8 | 6 | 2 | 0 |
| [PR](rules/pr/README.md) | Performance and Reliability | 7 | 22 | 14 | 3 | 5 |
| [TX](rules/tx/README.md) | Transactions and Payments | 15 | 29 | 16 | 11 | 2 |
| [TL](rules/tl/README.md) | Trust and Legitimacy | 6 | 18 | 13 | 5 | 0 |
| [UU](rules/uu/README.md) | Understand Users | 2 | 7 | 2 | 3 | 2 |
| [MOT](rules/mot/README.md) | Catalogue: Motion | 3 | 5 | 2 | 3 | 0 |
| Total | | 95 | 248 | 160 | 79 | 9 |

## Metrics

How much of the base a linter enforces. The first table counts the source controls: the DSS controls, and the catalogue controls of a category that has a rule. The second counts rules. Both come from the `MAPPING.md` file of each category.

### Controls

A control is **fully linted** when every rule under it is a lint rule. It is **hybrid** when it has a lint rule and also a judged or out-of-scope rule. It is **judged only** when it has no lint rule and has a judged rule. It is **out of scope** when it has neither.

| Category | Controls | Fully linted | Hybrid | Judged only | Out of scope |
| --- | --- | --- | --- | --- | --- |
| [BD](rules/bd/README.md) | 9 | 1 | 8 | 0 | 0 |
| [WP](rules/wp/README.md) | 19 | 3 | 14 | 2 | 0 |
| [WO](rules/wo/README.md) | 18 | 4 | 12 | 2 | 0 |
| [WU](rules/wu/README.md) | 14 | 0 | 13 | 1 | 0 |
| [WR](rules/wr/README.md) | 2 | 0 | 2 | 0 | 0 |
| [PR](rules/pr/README.md) | 7 | 2 | 5 | 0 | 0 |
| [TX](rules/tx/README.md) | 15 | 2 | 11 | 1 | 1 |
| [TL](rules/tl/README.md) | 6 | 1 | 5 | 0 | 0 |
| [UU](rules/uu/README.md) | 2 | 0 | 2 | 0 | 0 |
| [MOT](rules/mot/README.md) | 3 | 0 | 2 | 1 | 0 |
| Total | 95 | 13 | 74 | 7 | 1 |
| Share | 100% | 13.7% | 77.9% | 7.4% | 1.1% |

87 of 95 controls (91.6%) have at least one lint rule. The controls with no lint rule are `WP-4`, `WP-5`, `WO-6`, `WO-12`, `WU-3`, `TX-1`, `TX-14`, and `MOT-3`. `WP-5` has none because its lint part moved into `WP-3a`, and `WO-12` has none because its lint parts are covered by `WP-6a` and `WR-1a`.

### Rules

| Lintable | Judged | Out of scope | Total |
| --- | --- | --- | --- |
| 160 (64.5%) | 79 (31.9%) | 9 (3.6%) | 248 |

The judged rules and the hybrid controls are where `dx-design-judge` carries the load. A lint rule that is tier L2 only warns, so the share of rules that can block a commit is lower than the lintable share.

## Rule file

Frontmatter fields:

| Field | Meaning |
| --- | --- |
| `code` | The rule code, for example `BD-1a` |
| `slug` | The kebab-case name of the rule, for example `viewport-meta`. It is also the file name |
| `dss` | The DSS control that the rule implements |
| `tier` | `L0`, `L1`, or `L2` |
| `check` | `lint` or `judged` |
| `surface` | `source`, `rendered`, or `project`. Present when `check` is `lint` |
| `engine` | The engine rule that decides the rule, or `custom` |
| `judgedRemainder` | Optional. The code of the judged rule that covers what this rule's script cannot decide |
| `parameters` | Every value that the check reads, with its default. A default of `null` means the value must be set |

A value that a check reads is a parameter in the frontmatter, never prose. A rendered rule has a `pages` parameter, because it cannot load a page without a list. A rule with an unset parameter reports "not configured" and does not pass.

The body has these sections, in this order: **Statement**, **Check**, **Recommendations**, **Not required for**, **Rationale**.
