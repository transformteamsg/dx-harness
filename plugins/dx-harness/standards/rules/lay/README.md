# LAY: Layout

Source: the LAY controls of [`catalog.yaml`](../../catalog.yaml), from the DX design standard. Status: draft.

This folder holds 5 controls and 6 rules: 1 lintable and 5 judged. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

A rule file exists only for a lintable rule.

| Rule | Title | Check |
| --- | --- | --- |
| [`LAY-1a`](declared-column-count.md) | Column counts fit the declared grid | lint |
| `LAY-1b` | The column structure reads as coherent | judged |
| `LAY-3a` | A surface follows the page template of its page type, or says why no template fits | judged |
| `LAY-5a` | Density suits the task: tight for data entry, open for reading and scanning | judged |
| `LAY-6a` | Shared edges align, and optical alignment is used where geometry misleads | judged |
| `LAY-7a` | The page has one primary focal region, and its reading order matches the task's priority order | judged |

## Decisions

- `LAY-1` is hybrid. `LAY-1a` checks the column counts that the source states, and `LAY-1b` judges the structure.
- `LAY-1a` does not check gutters or margins. They come from the spacing scale, which the token rules check, so a second check reports the same fault twice.
- A product that declares no grid does not set `gridColumns`. The rule then reports "not configured", which takes the place of the N/A grade of the control.
- `LAY-3`, `LAY-5`, `LAY-6`, and `LAY-7` are judgment controls, so each becomes one judged rule.
- The rules name the user of the product, so that they apply to any product.
- `LAY-4` waits for the decision of [#545](https://github.com/transformteamsg/dx-harness/issues/545), which moves `TYP-6` or `LAY-4`. It has no rule and no redirect yet.
- `LAY-2` is not in this folder. It ports to the existing rules `WP-16a`, `WP-16b`, `BD-1b`, and `WP-7b`, per the [retirement spec](../../../../../docs/specs/2026-10-28-catalogue-retirement.md).

## Open

- `LAY-4`: write its rules, or record that it does not move, after #545 decides.
- The judged rules need rubrics from `dx-design-judge`: `LAY-1b`, `LAY-3a`, `LAY-5a`, `LAY-6a`, and `LAY-7a`.

## Built

`LAY-1a` has a module in `packages/design-lint/src/modules/lay/`.

- It reads `grid-template-columns` in stylesheets, `<style>` elements, and `style` attributes, and Tailwind `grid-cols-N` classes, with or without a variant prefix.
- It counts `repeat(N, ...)` as N times its tracks, and skips a value with `auto-fill`, `auto-fit`, `var()`, or `subgrid`.
- A finding in a stylesheet is at the start of the value. A finding in a `style` attribute or a class is at the element.
- The demo file is `demo/site/lay/grid.css`.

Rules not built: none.
