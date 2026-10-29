# TYP: Typography

Source: the typography controls of `catalog.yaml`. Status: draft. The decisions and open items are in the [category README](README.md).

The catalogue lists no "Not required for" text for these controls. Each rule file states the content that its check leaves out.

| Catalogue control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| TYP-2 Body text at least 14px, labels at least 12px, body line height 1.5 to 1.6 | [`TYP-2a`](text-size-floor.md) Body text is at least 14px, and label text is at least 12px | lint | rendered | custom | `pages`, `bodyMinSize`, `labelMinSize`, `labelSelector` |
| | [`TYP-2b`](body-line-height.md) Body text has a line height from 1.5 to 1.6 | lint | rendered | custom | `pages`, `bodySelector`, `minLineHeight`, `maxLineHeight` |
| TYP-4 Text is never set in all-caps | [`TYP-4a`](no-uppercase-transform.md) No text is set in capitals by a text transform | lint | rendered | custom | `pages`, `exemptSelector` |
| | `TYP-4b` Text typed in capitals in the source is an acronym | judged | | | |
| TYP-5 Tabular figures | [`TYP-5a`](tabular-figures-in-columns.md) A table column of numbers uses tabular figures | lint | rendered | custom | `pages`, `tableSelector`, `minRows` |
| | `TYP-5b` Figures that align or update outside a table, such as a live counter, use tabular figures | judged | | | |
| TYP-6 Comfortable measure | [`TYP-6a`](prose-measure.md) A line of running prose is no wider than 75ch | lint | rendered | custom | `pages`, `proseSelector`, `maxMeasure` |
| | `TYP-6b` Running prose outside `proseSelector` keeps to the measure, and a wider block is a deliberate exception | judged | | | |
