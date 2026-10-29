# CMP: Components

Source: the generic CMP controls of `catalog.yaml`. Status: draft.

The category moves 8 of the 9 generic CMP controls, as 14 rules: 6 lintable and 8 judged. CMP-9 does not move. The rule format is in the [top-level README](../../rules.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

| Rule | Title | Surface |
| --- | --- | --- |
| [CMP-2a](destructive-action-confirmation.md) | A destructive control asks for confirmation or offers undo | rendered |
| [CMP-5a](one-primary-action.md) | A region has no more than one primary action, and no destructive primary | source |
| [CMP-6a](numeric-column-alignment.md) | Numeric table columns are right-aligned with tabular figures | rendered |
| [CMP-6b](sticky-table-header.md) | A long table keeps its header row visible while it scrolls | rendered |
| [CMP-8a](exit-on-each-step.md) | Each step of a multi-step flow has a visible exit | rendered |
| [CMP-10a](error-clears-on-correction.md) | A corrected field clears its own error, and no other error | rendered |

The 8 judged rules have no file. Each needs a rubric from `dx-design-judge`: `CMP-2b`, `CMP-3a`, `CMP-4a`, `CMP-5b`, `CMP-6c`, `CMP-8b`, `CMP-10b`, and `CMP-11a`.

## Decisions

- CMP-9 does not move. It requires that content one user writes is sanitised before another user sees it. That is a security rule, outside the design standard, and no base rule takes it. CMP-9 stays in `catalog.yaml` until [#540](https://github.com/transformteamsg/dx-harness/issues/540) decides where it goes. `redirects.yaml` records it under `notMoved`.
- Each control was re-evaluated before it moved, as the [catalogue retirement spec](../../../../../docs/specs/2026-10-28-catalogue-retirement.md) sets out. The catalogue check is where the re-evaluation starts, not its result.
- CMP-2, CMP-3, and CMP-6 port in part to DSS rules. A CMP rule covers only the remainder. `WU-12a` checks the review step, `WO-15b` judges cancellation, `TX-9a` and `WR-2a` check the outcome message, and `WP-6a` checks the table semantics. No CMP rule checks them again.
- CMP-3 is judged only. Its remainder is a loading state with a minimum display time. A static page shows no loading state, and the linter cannot slow the network for one request, so no script can see it.
- CMP-4 and CMP-11 are judged only, as the catalogue has them. Whether a skeleton row and an empty-state heading show together depends on the runtime state, and whether a ring sits in the wrong box is a reading of the geometry.
- CMP-5 was hybrid with no script, because a view has no marker in source. `CMP-5a` takes the boundary as a parameter, `regionSelector`, and `CMP-5b` judges whether the boundary is right. The control is L2, so `CMP-5a` warns and never blocks.
- CMP-8 is `judgment` in the catalogue, but a visible exit on each step is a script check. `CMP-8a` reads the same `flows` shape as `WU-12a`. Draft safety stays judged in `CMP-8b`.
- CMP-10 and CMP-11 are status proposed. `CMP-10a` is a lint rule at tier L2, so it warns and never blocks until a design lead approves the control. `CMP-11a` is judged and reports an advisory suggestion until then.
- `CMP-2a` stays at L1, not the L0 of CMP-2. An L0 rule takes no override, and a product needs `destructivePatterns` in its own words and its own locale. The tier of CMP-2 itself does not change.
- The DSS lists no exemption for these controls. Each "Not required for" section carries the exemption that the catalogue control states in its **Do not flag** list.

## Open

- `CMP-2a`, `CMP-8a`, and `CMP-10a` match English text. A product in another locale sets its own patterns.
- `CMP-6b` scrolls the page. A table that scrolls inside its own container is not checked.
- `CMP-10a` reads one case for each field. Check whether a flow declaration in the config can supply the cases for more than one rule.

## Built

All 6 lint rules have a module, a fixture pair, and a break patch. The modules are in `packages/design-lint/src/modules/cmp/`. Every rule that is not listed below was built as its rule file states.

- `CMP-2a` activates each destructive button on a page of its own, and replaces `window.confirm` so that a native confirmation answers "cancel". A click that goes to another page passes. The demo sets `pages` for `CMP-2a` alone, because `tx/payment-methods.html` has a remove button that no rule of TX requires to confirm.
- `CMP-6a` and `CMP-6b` report one finding for each table, on the table. A finding sits at the table's position on the page, because a rendered finding has no source position.
- `CMP-8a` reports one finding for each page of a flow, on its `<main>` element.
- `CMP-10a` waits 100 milliseconds after each step before it reads the error messages. It activates the submit control of the form that holds the first case's field, so that the search form in the header is not submitted.
