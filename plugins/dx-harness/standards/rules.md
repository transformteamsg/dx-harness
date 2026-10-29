# Base rules

The base layer of the design standard. Every product follows it. It holds two sets of rules:

- **The DSS rules.** Each implements a control of the Digital Service Standards (DSS). Their folders take the nine DSS prefixes, such as `bd/` and `wp/`.
- **The catalogue rules.** Each comes from a generic control in `catalog.yaml`. Their folders take the catalogue prefixes, such as `cmp/` and `cnt/`. The tasks under [#541](https://github.com/transformteamsg/dx-harness/issues/541) write them. `cmp/` is the first.

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
| `rules/redirects.yaml` | Each old rule file name, mapped to the file's path now. Each catalogue control, mapped to the codes of its rules, or to the reason it does not move |
| [`packages/design-lint/docs/config.md`](../../../packages/design-lint/docs/config.md) | The config file: shape, resolution order, and page groups |
| [`packages/design-lint/docs/run.md`](../../../packages/design-lint/docs/run.md) | The `design-lint` command: flags, output, exit codes, and hooks |
| [`packages/design-lint/docs/testing.md`](../../../packages/design-lint/docs/testing.md) | How the rules are tested and demonstrated: fixtures, break patches, the demo, and the tracer bullet |
| [`packages/design-lint/docs/building-a-rule.md`](../../../packages/design-lint/docs/building-a-rule.md) | How to turn a lint rule file into a working check |
| `packages/design-lint/` | The linter: 157 of the 158 lint rules have a module, a fixture pair, and a break patch |

## Categories

The DSS categories. The catalogue categories get a row when their first rule is written.

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
| Total | | 92 | 243 | 158 | 76 | 9 |

The catalogue categories. A control that does not move is not counted.

| Category | Source | Controls | Rules | Lintable | Judged | Out of scope |
| --- | --- | --- | --- | --- | --- | --- |
| [CMP](rules/cmp/README.md) | Components | 8 | 14 | 6 | 8 | 0 |

## Metrics

How much of the DSS rules a linter enforces. The first table counts DSS controls. The second counts rules. Both come from the `MAPPING.md` file of each DSS category. The catalogue rules are not counted here.

### Controls

A DSS control is **fully linted** when every rule under it is a lint rule. It is **hybrid** when it has a lint rule and also a judged or out-of-scope rule. It is **judged only** when it has no lint rule and has a judged rule. It is **out of scope** when it has neither.

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
| Total | 92 | 13 | 72 | 6 | 1 |
| Share | 100% | 14.1% | 78.3% | 6.5% | 1.1% |

85 of 92 controls (92.4%) have at least one lint rule. The controls with no lint rule are `WP-4`, `WP-5`, `WO-6`, `WO-12`, `WU-3`, `TX-1`, `TX-14`. `WP-5` has none because its lint part moved into `WP-3a`, and `WO-12` has none because its lint parts are covered by `WP-6a` and `WR-1a`.

### Rules

| Lintable | Judged | Out of scope | Total |
| --- | --- | --- | --- |
| 158 (65.0%) | 76 (31.3%) | 9 (3.7%) | 243 |

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
