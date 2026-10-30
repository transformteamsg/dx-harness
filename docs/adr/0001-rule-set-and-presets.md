# 0001: Rule set, presets, and the product selection

**Status:** Proposed
**Date:** 2026-10-20
**Amended by:** [ADR-0002](0002-rule-categories-and-file-names.md), for the category list of D12 and the file path in decision 3. [ADR-0003](0003-rule-selection-for-a-design-run.md), for the file that selects the rules in decision 5
**Epic:** [#413](https://github.com/transformteamsg/dx-harness/issues/413) (C1 in the [design revamp spec](../specs/2026-10-05-design-revamp/README.md#catalogue))

## Context

The catalogue is portfolio-specific. Product and audience filters, Teacher Workspace values, and Radix and Tailwind scales sit inside controls that are otherwise generic. A designer or an engineer outside the Teacher & School portfolio cannot use the harness without inheriting those values.

The confirmed P1 stories (P1-2) add a requirement. A product belongs to a domain, and the domain's standards sit between the shared standards and the product's own `DESIGN.md`. The spec calls that layer a preset (D9).

A preset is the design language of a domain. A product is not a preset. Teacher Workspace is a product in the teacher domain, and Glow is a product in the professional learning domain. A product reflects its domain's design language, and the design language of a domain can be derived from its products later.

## Decisions

### Carried from the spec

The spec decided D9 to D14. This record adopts them without change:

- A design language is a preset, not a category (D9).
- `SLP` is not a category, and each anti-slop rule moves to the category it grades (D10).
- Rule codes keep the `PREFIX-N` format. A number is never reused, and `redirects` maps an old code (D11).
- There are eight categories: `A11Y`, `TOK`, `COL`, `TYP`, `CMP`, `CNT`, `LAY`, and `MOT` (D12).
- A rule that needs an unset value reports "not configured" and does not pass (D13).
- A check names the rules that it implements, and a rule file does not name its script (D14).

### 1. A preset is the file for a domain

One layer sits between the rule's default and the product. A preset is a file in `standards/presets/`. A domain is what a person chooses from a list. The list is the set of preset files. The first presets are `teacher` and `professional-learning`, one for each domain that the portfolio serves.

A preset is named for its domain, never for a product. Until a domain has a preset, its products hold their own values in `DESIGN.md`. A person who chooses a domain with no preset records the first one (P6-2).

The plugin carries domain presets only. It carries no preset for a team or a product family. A preset extends no other preset.

A team that wants its own values on top of a domain preset sets them in the `DESIGN.md` of each product. Each product repeats the team's values.

### 2. A preset cannot lower the L0 floor

A preset can set a parameter value, select more rules, and add rules. A preset cannot relax, remove, or ignore an L0 rule. If a preset tries, the L0 rule still applies, and the check reports the skipped line.

A preset can change the severity of an L1 or an L2 rule only through the waiver policy of that tier.

### 3. Rule-file schema

Each rule is one file at `standards/rules/<category>/<slug>.md`. The frontmatter holds these fields:

| Field | Value |
| --- | --- |
| `code` | `PREFIX-N` |
| `slug` | Kebab-case name |
| `category` | One of the eight categories |
| `tier` | `L0`, `L1`, or `L2` |
| `status` | `preview`, `stable`, `deprecated`, or `removed` |
| `check` | `deterministic`, `judgment`, or `hybrid` |
| `applies_to` | A list from `page`, `component`, `flow`, and `content` |
| `parameters` | A map from name to `default`, `type`, and `description`. A parameter with no `default` is required. |

The body has the fixed sections of C2. The fields `products`, `audiences`, `enforced`, `script`, `gap`, `phase`, and `refs` from `catalog.yaml` do not carry over. `redirects` is one file, `standards/rules/redirects.yaml`, and maps each old code to one or more new codes.

### 4. Preset format

A preset is a markdown file with YAML frontmatter and a prose body for people. It is not a `DESIGN.md`. A preset holds the design language of a domain, and a `DESIGN.md` holds one product's differences from it. The two files share one frontmatter grammar, so `dx-design-language` reads and writes both.

```yaml
name: teacher
select: [A11Y, TOK, COL, TYP, CMP, CNT, LAY, MOT]
add: []
parameters:
  primary-colour: "#..."
  spelling-locale: en-SG
```

`add` lists rules that the preset introduces. A rule that a preset adds carries the preset's own prefix, so a finding on it cites the preset's code.

### 5. Product selection in `DESIGN.md`

`DESIGN.md` frontmatter selects the rules for a product:

```yaml
extends: teacher
select: [A11Y, TOK]
ignore: [CMP-5]
exclude:
  - rules: [CMP-5]
    paths: [src/legacy/, src/pages/print.tsx]
parameters:
  primary-colour: "#..."
scopes:
  - paths: [src/teacher/]
    extends: teacher
    parameters:
      primary-colour: "#..."
```

- `extends` names one preset. With no `extends`, the product takes the generic categories.
- `select` and `ignore` follow ruff. `select` narrows the rules, and `ignore` removes one rule from the set. `ignore` is invalid on an L0 rule.
- `exclude` scopes a rule out of a file or a directory, as `per-file-ignores` does in ruff. Each entry names the rules and the paths. `exclude` is invalid on an L0 rule.
- `scopes` applies a different preset to a file or a directory ([#442](https://github.com/transformteamsg/dx-harness/issues/442)). A scope has `paths`, `extends`, and optional `parameters`. It has no `select` or `ignore`.
  - The first matching scope applies, and scopes do not overlap.
  - The scope's preset replaces the product preset's `select` for those paths. The product's `ignore` and `exclude` still apply.
  - A scope cannot lower the L0 floor (decision 2).
- `DESIGN.md` records only where the product differs from its preset (P1-2).
- A setting that several rules read, such as the audience, the stack, and the spelling locale, sits in the `parameters` map under a shared name.

### 6. Parameter resolution

A parameter value resolves in this order. A later layer wins.

1. The rule's default.
2. The product preset.
3. The `parameters` of the product's `DESIGN.md`.
4. The preset of the matching scope, for a file in a scope.
5. The `parameters` of the matching scope.

A value that the scope's preset sets wins over a product-level value. A value that the scope's preset does not set carries over from the product.

 A required parameter with no value at any layer reports "not configured" (D13).

A check reads the resolved values from `checklib.py`. A check never parses rule prose.

### 7. Where an edit to a preset lands

A preset lives in the plugin. A product repo holds no copy of it. A change to a preset reaches a product when the plugin updates, and the product's `DESIGN.md` does not change (P1-2).

### 8. Rule tiers

The tiers stay `L0`, `L1`, and `L2` until [#432](https://github.com/transformteamsg/dx-harness/issues/432) classifies which controls a script can decide. A later record can map the tiers to a ruff-style severity. The L0 floor in decision 2 depends only on the name `L0`.

### 9. Domain presets start from the existing products

The first presets are drafts. The `teacher` preset is derived from Teacher Workspace, and the `professional-learning` preset is derived from Glow. The design language owner of a domain can change a draft later.

The derivation reads a product's codebase and writes a `DESIGN.md`. A person then moves the values that belong to the domain into the preset. A skill for the first step is needed. It is not in the target skill table of the spec, and `dx-design-language` already drafts a `DESIGN.md` from code (P1-2). A story decides whether the skill is new or a mode of `dx-design-language`.

### 10. Who edits a preset

The harness maintainers and the collaborators assigned in the `dx-harness` repository edit presets. The change goes through a pull request.

## Options considered

- **A layer for a product family between the domain preset and `DESIGN.md`.** One edit would reach every product of the family (P6-6). Rejected: it needs a place for the family's preset outside the harness repo and a preset that extends a preset. The cost is that each product repeats the team's values.
- **A category per domain.** Rejected by D9. A domain's values would live inside rule files and break the rule that every rule is generic.
- **One preset for each product, with `exclude` only.** Rejected: a product with pages for another domain, such as a student app with teacher pages, could drop rules but could not apply the other domain's values.
- **A copy of the preset in each product repo.** Rejected: P1-2 requires that a change to a domain's standards reaches a product without an edit to its `DESIGN.md`.

## Consequences

- C2 and C3 build on decisions 3 to 5. The JSON schemas for a rule file and a preset come from this record.
- `dx-design-language` writes only `extends`, `select`, `ignore`, `exclude`, `scopes`, and `parameters`. It asks for a parameter only when no layer has a value.
- The `products` and `audiences` filters leave the catalogue, and a value of the portfolio, such as a primary colour, moves into the `DESIGN.md` of the product that owns it. A later record derives the domain presets from those products.
- The `exclude` and `scopes` fields add a path filter to every check. C14 adds the filter and a file-to-scope map to `checklib.py`.
- A rendered check runs on a page, so it needs a route-to-path map to find the scope. C14 decides how.
- `dx-design-critique` reports which preset it graded a page against.
- Every check needs a way to report a skipped L0 line. C14 adds it to `checklib.py`.
- P6-6 holds: a product from another team extends the harness through its own `DESIGN.md`. Its acceptance examples 1 and 3 assume a shared product family layer, so the P6 revision in [#420](https://github.com/transformteamsg/dx-harness/issues/420) must reword them.
