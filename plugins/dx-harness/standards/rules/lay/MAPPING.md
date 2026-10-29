# LAY: Layout

Source: the LAY controls of [`catalog.yaml`](../../catalog.yaml), from the DX design standard. Status: draft. The decisions and open items are in the [category README](README.md).

The LAY controls list no "Not required for" text, so no row has an exemption parameter. `LAY-4` has no row: it maps to the `TYP-6` rules ([#545](https://github.com/transformteamsg/dx-harness/issues/545)).

| Control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| LAY-1 Declared column grid | [`LAY-1a`](declared-column-count.md) Column counts fit the declared grid. Lint part of LAY-1b. | lint | source | custom | `gridColumns` (unset) |
| | `LAY-1b` The column structure reads as coherent. Lint part: [LAY-1a](declared-column-count.md). | judged | | | |
| LAY-3 Known page template | `LAY-3a` A surface follows the page template of its page type, or says why no template fits | judged | | | |
| LAY-5 Density suits the task | `LAY-5a` Density suits the task: tight for data entry, open for reading and scanning | judged | | | |
| LAY-6 Shared edges align | `LAY-6a` Shared edges align, and optical alignment is used where geometry misleads | judged | | | |
| LAY-7 One focal region | `LAY-7a` The page has one primary focal region, and its reading order matches the task's priority order | judged | | | |

## Judged reasons

| Rule | Reason |
| --- | --- |
| `LAY-1b` | Whether columns read as one structure is a visual judgment. `LAY-1a` checks the counts that the source states. |
| `LAY-3a` | The page type comes from the design contract, and the match to a template is a judgment about the whole surface. |
| `LAY-5a` | The right density depends on the task the user does. No single spacing value is correct for all tasks. |
| `LAY-6a` | Optical alignment can differ from geometric alignment on purpose, so a measurement cannot decide it. |
| `LAY-7a` | The focal region and the task's priority order come from the task, not from the source. |
