---
status: accepted
date: 2026-10-30
authors:
  - Nicholas Lim / [@nicholasjjlim](https://github.com/nicholasjjlim)
decision-makers: Nicholas Lim
discussed-in: settled during the work on [#554](https://github.com/transformteamsg/dx-harness/issues/554) on 2026-10-30; no RFC issue was raised
---

# 0003 Select a design run's base rules from the dimension list and the lint configuration

This record amends decision 5 of [ADR-0001](0001-rule-set-and-presets.md): the file that selects the rules for a product. Every other decision in ADR-0001 and [ADR-0002](0002-rule-categories-and-file-names.md) stands.

## Context and Problem Statement

A design run gets its rules from `scripts/in-scope-rules.py`. The script reads `catalog.yaml` and filters on five flags: `--dimension`, `--phase`, `--surface`, `--product`, and `--audience`. [#537](https://github.com/transformteamsg/dx-harness/issues/537) changes it to resolve the base rules in `standards/rules/`. Three things block that change:

- **The flags.** A base rule has no `phase`, `products`, or `audiences` field (ADR-0001 decision 3). Its `surface` takes `source`, `rendered`, or `project`, and `--surface` takes `page`, `component`, `flow`, or `content`. `DIMENSION_RULES` in `checks/checklib.py` lists catalogue codes only.
- **The judged rules.** A judged rule has no file. The script cannot print its title, its tier, or a detail path.
- **The configuration file.** ADR-0001 decision 5 puts the selection in the `DESIGN.md` frontmatter. `design-lint` reads its selection from `design-lint.config.json`. A product with both files can name two selections.

Two facts bound the flags. No catalogue control carries `audiences`. Only `IDN-4` carries `products`, and it stays in the placeholder catalogue.

## Decision Drivers

- A pass gets the same rules, judged and lint, that its old catalogue controls covered.
- A design run and a `design-lint` run on one product select the same rules.
- The L0 floor holds: every L0 rule is on every list (ADR-0001 decision 2).
- A judged rule needs no file before a run can list it. Rule files for the judged rules are separate work.

## Considered Options

For the dimension:

- A list of base codes in `DIMENSION_RULES`
- A `dimension` field in each lint rule file, and a column in `MAPPING.md` for each judged rule
- One set of categories for each dimension

For the flags that have no base-rule field:

- Retire `--phase` and `--surface`, and keep `--product` and `--audience` for the placeholder catalogue
- Retire all four now
- Retire `--phase`, and map `--surface content` to the `CNT` rules

For the judged rules:

- List them, with the title and the tier from `MAPPING.md`
- List them, with the tier of the source control or of the lint rule that names them in `judgedRemainder`
- Leave them off the list until each has a rule file

For the configuration file:

- `design-lint.config.json` selects the rules
- The `DESIGN.md` frontmatter selects the rules
- `DESIGN.md` is the source, and `dx-design-language` writes `design-lint.config.json` from it

## Decision Outcome

### 1. A pass reads its base rules from `DIMENSION_RULES`

Chosen option: "A list of base codes in `DIMENSION_RULES`". One list holds the judged rules too, and a judged rule has no file to carry a field.

`DIMENSION_RULES` in `checks/checklib.py` lists base rule codes. Each old catalogue code is replaced by the codes that `redirects.yaml` maps it to. A control that ports in full is replaced by the DSS rules that the [retirement spec](../specs/2026-10-28-catalogue-retirement.md) names for it. A placeholder control keeps its catalogue code until it leaves `catalog.yaml`.

| Pass | Base rules | Placeholder controls |
| --- | --- | --- |
| `copy` | `CNT-2a`, `CNT-3a`, `CNT-4a`, `CNT-5a`, `CNT-5b`, `CNT-6a`, `CNT-6b`, `CNT-7a`, `CNT-8a`, `CNT-9a`, `CNT-11a`, `CNT-12a`, `CNT-12b`, `CNT-13a`, `CNT-13b`, `CNT-15a`, `CNT-15b`, `WU-10c`, `WU-10d`, `WU-11a`, `WU-11b`, `TX-10a`, `TX-10b`, `WU-8a`, `WU-8b`, `WU-8c` | `CNT-14`, `IDN-3`, `IDN-4` |
| `flow` | `CMP-2a`, `CMP-2b`, `CMP-3a`, `CMP-8a`, `CMP-8b`, `CMP-14a`, `WO-1a`, `WO-1b`, `WO-1c`, `WO-13a`, `WO-13b`, `WR-2a`, `WR-2b`, `WR-2c`, `WO-9c`, `A11Y-11a`, `A11Y-11b`, `A11Y-11c` | None |
| `motion` | `MOT-1a`, `MOT-1b`, `MOT-2a`, `MOT-2b`, `MOT-3a`, `MOT-4a`, `A11Y-5a`, `A11Y-5b` | None |
| `pattern` | `LAY-1a`, `LAY-1b`, `LAY-3a`, `LAY-5a`, `LAY-6a`, `LAY-7a`, `LAY-8a`, `TYP-6a`, `TYP-6b`, `WP-16a`, `WP-16b`, `BD-1b`, `WP-7b`, `CMP-13a`, `CMP-15a` | None |
| `polish` | `TYP-2a`, `TYP-2b`, `TYP-4a`, `TYP-4b`, `TYP-5a`, `TYP-5b`, `TYP-7a`, `TYP-7b`, `COL-3a`, `COL-3b`, `COL-4a`, `CMP-12a`, `LAY-9a` | `TOK-1`, `TOK-2`, `TOK-3`, `TYP-1`, `TYP-3`, `COL-1`, `COL-2` |

A base rule that no row lists is outside every pass. A run with no `--dimension` gets it. Every L0 rule is on every list, whatever the pass.

### 2. `--phase` and `--surface` retire

Chosen option: "Retire `--phase` and `--surface`, and keep `--product` and `--audience` for the placeholder catalogue". No base rule carries a value for either retired flag. The two kept flags still scope a placeholder control.

| Flag | Fate | Base rules |
| --- | --- | --- |
| `--dimension` | Keeps | Reads `DIMENSION_RULES` (decision 1) |
| `--phase` | Retires | None. A base rule has no phase. A verify run and a build run get the same list |
| `--surface` | Retires | None. A content-only change passes `--dimension copy` |
| `--product` | Keeps, until `catalog.yaml` retires | None. It filters the placeholder controls only, which today is `IDN-4` |
| `--audience` | Keeps, until `catalog.yaml` retires | None. It filters the placeholder controls only. No control carries `audiences` today |

The `surface` field of a base rule stays a field for `design-lint`. It says where the linter reads the rule, and it selects nothing.

### 3. A judged rule is on the list, with its tier from `MAPPING.md`

Chosen option: "List them, with the title and the tier from `MAPPING.md`". A pass that grades its dimension needs its judged rules. A tier that a person sets is clearer than a tier that a script infers.

A judged rule that a selection keeps is on the in-scope list. The `MAPPING.md` of its category is the source:

- The title is the text after the code in the rule's row.
- The tier is a new `Tier` column in each `MAPPING.md`. Each row of a judged rule fills it. The column is added before `in-scope-rules.py` lists a judged rule.
- The `Detail:` path is the `MAPPING.md` file, until the rule has a rubric.

A lint rule takes its title and its tier from its rule file, and its `Detail:` path is the rule file.

### 4. `design-lint.config.json` selects the rules

Chosen option: "`design-lint.config.json` selects the rules", because `design-lint` already reads it, and one file gives the lint run and the design run one selection.

When `design-lint.config.json` and `DESIGN.md` name different selections, `design-lint.config.json` wins. `in-scope-rules.py` reads the same keys that `design-lint` reads: `preset` and `select` in the configuration, and `ignore` in the preset. It ignores a selection in the `DESIGN.md` frontmatter, and prints a note that names the file and each key it skipped.

`DESIGN.md` keeps the design language of the product: its values and its prose. It selects no rules. This replaces the `extends`, `select`, and `ignore` keys of ADR-0001 decision 5. `exclude` and `scopes` have no key in `design-lint.config.json` yet. A later record places them.

A product with no `design-lint.config.json` gets every base rule and the placeholder controls. The `Selection:` line names the configuration file, or says that the product has none.

### Consequences

- Good, because a lint run and a design run read one selection, so they cannot drift apart.
- Good, because a pass lists its judged rules, and no rule file is needed first.
- Good, because the list of a pass is in one place, beside the checks that read it.
- Bad, because `DIMENSION_RULES` changes when a rule is added, renamed, or split. A new rule is outside every pass until someone adds it to a row.
- Bad, because each `MAPPING.md` gets a `Tier` column, and a judged rule's tier sits apart from the tier of its lint rule.
- Bad, because ADR-0001 decision 5 changes. `dx-design-language` writes the selection to `design-lint.config.json` and not to `DESIGN.md`. A product that names rules in `DESIGN.md` moves them to the configuration.
- Bad, because a skill that passes `--phase` or `--surface` fails until #537 removes the flag from it. Today `dx-design-critique` passes `--phase verify`, and `catalogue-mechanics.md` tells a content-only change to pass `--surface content`.

### Confirmation

`rule-selection-adr.test.ts` checks four things in this record:

- It lists the base rules for each pass.
- It settles each flag.
- It names the file that wins.
- It names the source of a judged rule's title and tier.

The test does not check `in-scope-rules.py`. The tests of #537 confirm that the script follows this record.

## Pros and Cons of the Options

### A list of base codes in `DIMENSION_RULES`

- Good, because it covers a judged rule, which has no file.
- Good, because `checklib.py` already holds the list, and the checks read it.
- Bad, because a new rule is outside every pass until the list names it.

### A `dimension` field in each lint rule file, and a column in `MAPPING.md` for each judged rule

- Good, because a rule carries its own pass.
- Bad, because the dimension lives in two places, one for each kind of rule.

### One set of categories for each dimension

- Good, because a new rule joins a pass with no edit.
- Bad, because the SLP rules change pass. `CMP-12a` comes from `SLP-3`, a polish control, but `CMP` would go to the flow pass.
- Bad, because a DSS rule that ports a catalogue control, such as `WO-1a`, joins no pass.

### Retire `--phase` and `--surface`, and keep `--product` and `--audience` for the placeholder catalogue

- Good, because no base rule loses a filter it had.
- Good, because `IDN-4` stays scoped to CaseSync.
- Bad, because two flags stay that filter one control between them.

### Retire all four now

- Good, because the script has one flag.
- Bad, because `IDN-4` applies to every product until it moves to the `DESIGN.md` of CaseSync.

### Retire `--phase`, and map `--surface content` to the `CNT` rules

- Good, because a content-only change keeps its flag.
- Bad, because `--surface` then means a category, and `--dimension copy` already selects the content rules.

### List them, with the title and the tier from `MAPPING.md`

- Good, because each title is already in a `MAPPING.md` row.
- Bad, because each `MAPPING.md` needs a new column.

### List them, with the tier of the source control or of the lint rule that names them in `judgedRemainder`

- Good, because no file changes.
- Bad, because a judged rule with no lint rule and a DSS source has no tier to inherit.

### Leave them off the list until each has a rule file

- Good, because every listed rule has a file.
- Bad, because a pass grades only its lint rules. 115 of the 311 base rules are judged.

### `design-lint.config.json` selects the rules

- Good, because `design-lint` reads it today, so the lint run does not change.
- Bad, because it amends ADR-0001 decision 5.

### The `DESIGN.md` frontmatter selects the rules

- Good, because it keeps ADR-0001 decision 5.
- Bad, because `design-lint` must parse the `DESIGN.md` frontmatter, and the `select` key of its configuration retires.

### `DESIGN.md` is the source, and `dx-design-language` writes `design-lint.config.json` from it

- Good, because a person edits one file.
- Bad, because the configuration is generated, and a hand edit to it needs a check that catches it.

## More Information

- [ADR-0001](0001-rule-set-and-presets.md): decision 5, which this record amends.
- [The retirement spec](../specs/2026-10-28-catalogue-retirement.md): the DSS rules that port each catalogue control.
- [`packages/design-lint/docs/config.md`](../../packages/design-lint/docs/config.md): the keys of `design-lint.config.json`.
- [#537](https://github.com/transformteamsg/dx-harness/issues/537) changes `in-scope-rules.py` to follow this record.
