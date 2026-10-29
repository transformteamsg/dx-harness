---
status: accepted
date: 2026-10-29
authors:
  - Nicholas Lim / [@nicholasjjlim](https://github.com/nicholasjjlim)
decision-makers: Nicholas Lim
discussed-in: settled during the work on [#542](https://github.com/transformteamsg/dx-harness/issues/542) on 2026-10-29; no RFC issue was raised
---

# 0002 Name each rule file by its slug, in a folder for its prefix

This record amends [ADR-0001](0001-rule-set-and-presets.md). It replaces the category list of D12, which ADR-0001 carries from the spec, and the file path in decision 3. Every other decision in ADR-0001 stands.

## Context and Problem Statement

ADR-0001 sets eight categories (D12) and puts each rule at `standards/rules/<category>/<slug>.md` (decision 3). The base layer in `skills/design-restructure/base/` does not match either:

- The base uses the nine prefixes of the Digital Service Standards (DSS), such as `BD` and `WP`. None of them is one of the eight.
- The [retirement spec](../specs/2026-10-28-catalogue-retirement.md) moves the 47 generic catalogue controls into new folders that keep the catalogue prefix, such as `cmp/` and `cnt/`.
- Each base file takes its code as its name, such as `BD-1a.md`.

[#536](https://github.com/transformteamsg/dx-harness/issues/536) moves the base layer to `standards/rules/`. It needs one category list and one file-name convention before it can move a file.

## Decision Drivers

- A contributor who adds a rule can read its folder and its prefix from one list.
- A file name tells a reader what the rule is about before the file is open.
- `pnpm check` catches a file that breaks the convention, so the convention does not drift.
- A rule code is never reused (D11). A code that changes is mapped in `redirects.yaml`.

## Considered Options

- Name a rule file by its slug, and keep both prefix sets as categories
- Name a rule file by its code, as the base layer does
- Keep the eight categories of D12, and move the DSS rules into them

## Decision Outcome

Chosen option: "Name a rule file by its slug, and keep both prefix sets as categories". A slug tells a contributor what the rule is about. A code such as `BD-1a` says nothing until the file is open.

Each rule is one file at `standards/rules/<category>/<slug>.md`:

- `<category>` is the prefix of the rule's code, in lower case. A rule coded `CMP-4a` goes in `standards/rules/cmp/`.
- `<slug>` is the kebab-case name in the rule's `slug` field, such as `viewport-meta`.
- A category folder can also hold a `README.md` and a `MAPPING.md`.
- `standards/rules/redirects.yaml` is the only file outside a category folder.

There are 17 categories: the nine DSS prefixes and the eight catalogue prefixes of D12. The `category` field of a rule file takes one of them.

| Prefix | Folder | Source | Holds |
| --- | --- | --- | --- |
| `BD` | `standards/rules/bd/` | DSS | Baseline Design Practices |
| `WP` | `standards/rules/wp/` | DSS | WCAG: Perceivable |
| `WO` | `standards/rules/wo/` | DSS | WCAG: Operable |
| `WU` | `standards/rules/wu/` | DSS | WCAG: Understandable |
| `WR` | `standards/rules/wr/` | DSS | WCAG: Robust |
| `PR` | `standards/rules/pr/` | DSS | Performance and Reliability |
| `TX` | `standards/rules/tx/` | DSS | Transactions and Payments |
| `TL` | `standards/rules/tl/` | DSS | Trust and Legitimacy |
| `UU` | `standards/rules/uu/` | DSS | Understand Users |
| `A11Y` | `standards/rules/a11y/` | Catalogue | Accessibility beyond the DSS |
| `TOK` | `standards/rules/tok/` | Catalogue | Whether a value comes from the token scale |
| `COL` | `standards/rules/col/` | Catalogue | Whether a colour has the right role |
| `TYP` | `standards/rules/typ/` | Catalogue | Typography |
| `CMP` | `standards/rules/cmp/` | Catalogue | Components |
| `CNT` | `standards/rules/cnt/` | Catalogue | Content |
| `LAY` | `standards/rules/lay/` | Catalogue | Layout |
| `MOT` | `standards/rules/mot/` | Catalogue | Motion |

`SLP` and `IDN` are not categories. Each anti-slop rule takes the prefix of the category it grades (D10). An identity control is a product control, and it stays in the placeholder catalogue until it moves to a product's `DESIGN.md`.

A folder exists only when it holds a rule. A category with no rule yet has no folder. `TOK` is an example: its controls stay in the placeholder catalogue.

### Consequences

- Good, because a folder listing tells a reader what each rule checks.
- Good, because a rule's prefix shows whether it came from the DSS or from the catalogue.
- Good, because a preset or a `DESIGN.md` can `select` a DSS category and a catalogue category the same way.
- Bad, because #536 renames all 158 base rule files. No base file has a `slug` field yet, so #536 adds one to each. `redirects.yaml` maps each old file name to its new file.
- Bad, because a file name no longer gives the code, so `design-lint` must read the code from the frontmatter. Its loader, `packages/design-lint/src/rules/load.ts`, loads only a file named by its code, and it checks that the name matches the `code` field. #536 changes both.
- Bad, because a slug can change when a rule is reworded. A changed slug is a rename, and `redirects.yaml` maps it.

### Confirmation

`pnpm check` runs `design-catalog-validate.py`, which reads `standards/rules/`. It fails on a file outside a category folder. It also fails on a rule file not named by a kebab-case slug. The error names the file. `rule-file-names.test.ts` confirms that a file named `BD-1a.md` fails.

## Pros and Cons of the Options

### Name a rule file by its slug, and keep both prefix sets as categories

- Good, because the file name says what the rule checks.
- Good, because it keeps decision 3 of ADR-0001, so the JSON schema that C2 builds from it does not change its path.
- Bad, because every base file is renamed when it moves.

### Name a rule file by its code, as the base layer does

- Good, because the 158 base rule files and the `design-lint` loader need no change.
- Good, because a code never changes, so a file never needs a redirect.
- Bad, because a contributor must open a file, or an index, to learn what `WO-13b` checks.

### Keep the eight categories of D12, and move the DSS rules into them

- Good, because the category list stays as the spec set it.
- Bad, because each DSS rule takes a new code, and `redirects.yaml` maps 243 codes.
- Bad, because a finding no longer cites the DSS control by its own prefix, so a reader cannot trace it to the standard.

## More Information

- [ADR-0001](0001-rule-set-and-presets.md): the decisions this record amends.
- [The retirement spec](../specs/2026-10-28-catalogue-retirement.md), "End state": the open placements this record settles.
- [#536](https://github.com/transformteamsg/dx-harness/issues/536) moves the files under these conventions.
