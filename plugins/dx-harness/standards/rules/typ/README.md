# TYP: Typography

Source: the typography controls of `catalog.yaml`. Status: draft.

The category has four catalogue controls and eight rules: five lintable and three judged. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md). `redirects.yaml` maps each control code to its rules.

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [TYP-2a](text-size-floor.md) | Body text is at least 14px, and label text is at least 12px | rendered |
| [TYP-2b](body-line-height.md) | Body text has a line height from 1.5 to 1.6 | rendered |
| [TYP-4a](no-uppercase-transform.md) | No text is set in capitals by a text transform | rendered |
| [TYP-5a](tabular-figures-in-columns.md) | A table column of numbers uses tabular figures | rendered |
| [TYP-6a](prose-measure.md) | A line of running prose is no wider than 75ch | rendered |

The three judged rules have no file yet. Each needs a rubric from `dx-design-judge`: `TYP-4b`, `TYP-5b`, and `TYP-6b`.

## Decisions

- TYP-6 moves, and LAY-4 does not. They state one control twice. The measure is a property of the text, and #529 settled one measure of 45 to 75 characters with no 80ch ceiling. `redirects.yaml` maps `LAY-4` to the TYP-6 rules ([#545](https://github.com/transformteamsg/dx-harness/issues/545)).
- TYP-1 and TYP-3 do not move. They are a product control and a stack control, and they stay in `catalog.yaml`.
- Every lint rule is rendered. A rule reads the computed style, so a value set in any unit, through `var()`, or by a utility class is read the same way. `checks/type-scan.py` reads the source, so it misses a `var()` chain that leaves the file and a measure in any unit but `ch`.
- `TYP-2a` and `TYP-2b` are fully linted. The catalogue check of TYP-2 is `deterministic`. The label floor applies inside an element that matches `labelSelector`, so the product names its label and caption styles.
- `TYP-4a` reads the transform only. Text typed in capitals is `TYP-4b`, because only a person can tell an acronym from a shout.
- `TYP-5a` reads table columns only. The TYP-5 gap says that a static scan flags every table cell. A rendered column whose data cells all hold numbers is a column of figures, and it does not cry wolf on a column of names. A live counter is `TYP-5b`.
- `TYP-6a` measures in `ch`, in the font of each element, and not in characters. A paragraph capped at `65ch` holds 87 to 92 characters for each line in Chromium at 16px, and TYP-6 names that cap as a pass.
- The rules name the user. The catalogue controls named one kind of user, and these rules apply to every user.
- Tiers follow the catalogue: TYP-2 is L1, and TYP-4, TYP-5, and TYP-6 are L2.

## Open

- `TYP-2a` and `TYP-2b` read the page at one viewport of 1280 by 800. A size that a media query sets for a small screen is not read.
- `TYP-6a` reads the elements that match `proseSelector`. Prose in a `<div>` with no paragraph is not read, and `TYP-6b` judges it.
- `checks/type-scan.py` still decides TYP-2, TYP-4, and TYP-6 for the live design skills. The catalogue retirement spec narrows it to TYP-1 and TYP-3 once these rules replace it.

## Built

All five lint rules have a module, a fixture pair, and a break patch. The modules are in `packages/design-lint/src/modules/typ/`. The demo page is `demo/site/typ/`.
