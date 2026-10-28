# Design restructure

A target-state mock-up of the base layer of the design standard. Nothing here runs. The live `dx-design-*` skills and `checks/` stay frozen.

## Layers

Standards resolve in this order. A later layer overrides an earlier one.

1. **Base.** The Digital Service Standards (DSS). Every product follows it.
2. **Domain.** A domain preset in `presets/`. It sets values for every product in one domain. See [`presets/`](presets/README.md).
3. **Custom.** Not designed yet.

The base runs with no domain and no `DESIGN.md`.

## Layout

| Path | Holds |
| --- | --- |
| `base/<prefix>/README.md` | One category: the rule index, the decisions, and the open items |
| `base/<prefix>/MAPPING.md` | For each DSS control: the rules, the surface, the engine, the parameters, and the judged part |
| `base/<prefix>/<rule>.md` | One rule file |
| `presets/<name>.md` | One domain preset |
| `lint/config.md` | The config file: shape, resolution order, and page groups |
| `lint/run.md` | The `design-lint` command: flags, output, exit codes, and hooks |
| `lint/testing.md` | How the rules are tested and demonstrated: fixtures, break patches, the demo, and the tracer bullet |
| `packages/design-lint/` | The linter: 157 of the 158 lint rules have a module, a fixture pair, and a break patch |
| `dx-design-verify/`, `dx-design-start/`, `dx-design-judge/` | The skills. Not started |

## Categories

| Category | DSS section | Controls | Rules | Lintable | Judged | Out of scope |
| --- | --- | --- | --- | --- | --- | --- |
| [BD](base/bd/README.md) | Baseline Design Practices | 9 | 26 | 18 | 8 | 0 |
| [WP](base/wp/README.md) | WCAG: Perceivable | 19 | 57 | 41 | 16 | 0 |
| [WO](base/wo/README.md) | WCAG: Operable | 18 | 40 | 26 | 14 | 0 |
| [WU](base/wu/README.md) | WCAG: Understandable | 14 | 36 | 22 | 14 | 0 |
| [WR](base/wr/README.md) | WCAG: Robust | 2 | 8 | 6 | 2 | 0 |
| [PR](base/pr/README.md) | Performance and Reliability | 7 | 22 | 14 | 3 | 5 |
| [TX](base/tx/README.md) | Transactions and Payments | 15 | 29 | 16 | 11 | 2 |
| [TL](base/tl/README.md) | Trust and Legitimacy | 6 | 18 | 13 | 5 | 0 |
| [UU](base/uu/README.md) | Understand Users | 2 | 7 | 2 | 3 | 2 |
| Total | | 92 | 243 | 158 | 76 | 9 |

## Metrics

How much of the base a linter enforces. The first table counts DSS controls. The second counts rules. Both come from the `MAPPING.md` file of each category.

### Controls

A DSS control is **fully linted** when every rule under it is a lint rule. It is **hybrid** when it has a lint rule and also a judged or out-of-scope rule. It is **judged only** when it has no lint rule and has a judged rule. It is **out of scope** when it has neither.

| Category | Controls | Fully linted | Hybrid | Judged only | Out of scope |
| --- | --- | --- | --- | --- | --- |
| [BD](base/bd/README.md) | 9 | 1 | 8 | 0 | 0 |
| [WP](base/wp/README.md) | 19 | 3 | 14 | 2 | 0 |
| [WO](base/wo/README.md) | 18 | 4 | 12 | 2 | 0 |
| [WU](base/wu/README.md) | 14 | 0 | 13 | 1 | 0 |
| [WR](base/wr/README.md) | 2 | 0 | 2 | 0 | 0 |
| [PR](base/pr/README.md) | 7 | 2 | 5 | 0 | 0 |
| [TX](base/tx/README.md) | 15 | 2 | 11 | 1 | 1 |
| [TL](base/tl/README.md) | 6 | 1 | 5 | 0 | 0 |
| [UU](base/uu/README.md) | 2 | 0 | 2 | 0 | 0 |
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
| `dss` | The DSS control that the rule implements |
| `tier` | `L0`, `L1`, or `L2` |
| `check` | `lint` or `judged` |
| `surface` | `source`, `rendered`, or `project`. Present when `check` is `lint` |
| `engine` | The engine rule that decides the rule, or `custom` |
| `judgedRemainder` | Optional. The code of the judged rule that covers what this rule's script cannot decide |
| `parameters` | Every value that the check reads, with its default. A default of `null` means the value must be set |

A value that a check reads is a parameter in the frontmatter, never prose. A rendered rule has a `pages` parameter, because it cannot load a page without a list. A rule with an unset parameter reports "not configured" and does not pass.

The body has these sections, in this order: **Statement**, **Check**, **Recommendations**, **Not required for**, **Rationale**.
