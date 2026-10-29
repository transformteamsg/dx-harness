# CMP: Components

Source: the generic CMP controls of `catalog.yaml`. Status: draft. The decisions and open items are in the [category README](README.md).

A judged rule has no file. `dx-design-judge` judges it.

| Source control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| CMP-2 Destructive actions confirm or undo | [`CMP-2a`](destructive-action-confirmation.md) A destructive control asks for confirmation or offers undo | lint | rendered | custom | `pages`, `destructivePatterns`, `confirmSelector`, `undoPatterns` |
| | `CMP-2b` The confirmation names the object, states the consequence, and says whether the action can be reversed | judged | | | |
| CMP-3 Async loading, success, and error states | `CMP-3a` A loading state shows for a minimum time and says what is happening, and each outcome is perceivable | judged | | | |
| CMP-4 Empty state distinct from loading and error | `CMP-4a` An empty state reads as empty, with no loading chrome beside it | judged | | | |
| CMP-5 One primary action per view | [`CMP-5a`](one-primary-action.md) A region has no more than one primary action, and no destructive primary | lint | source | custom | `primarySelector`, `regionSelector`, `destructivePatterns` |
| | `CMP-5b` The region boundaries are right, and two primary actions are a deliberate pair | judged | | | |
| CMP-6 Data table pattern | [`CMP-6a`](numeric-column-alignment.md) Numeric table columns are right-aligned with tabular figures | lint | rendered | custom | `pages`, `numericPattern`, `identifierColumnSelector` |
| | [`CMP-6b`](sticky-table-header.md) A long table keeps its header row visible while it scrolls | lint | rendered | custom | `pages` |
| | `CMP-6c` Identifier columns, density, empty and loading states, and pattern fit | judged | | | |
| CMP-8 Exit at every step, work preserved | [`CMP-8a`](exit-on-each-step.md) Each step of a multi-step flow has a visible exit | lint | rendered | custom | `flows`, `exitPatterns` |
| | `CMP-8b` Work survives an interruption, or the user confirms its discard | judged | | | |
| CMP-10 Error clears on correction | [`CMP-10a`](error-clears-on-correction.md) A corrected field clears its own error, and no other error | lint | rendered | custom | `validationCases`, `submitSelector` |
| | `CMP-10b` Fields that the cases do not list clear their errors in the same way | judged | | | |
| CMP-11 Nested child traces the container | `CMP-11a` A nested ring, fill, or icon traces the edge and radius of its container | judged | | | |

CMP-9 does not move. The [category README](README.md) records why.
