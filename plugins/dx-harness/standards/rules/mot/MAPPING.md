# MOT: Motion

Source: the catalogue controls `MOT-1`, `MOT-2`, and `MOT-3` in `catalog.yaml`. Status: draft. The decisions and open items are in the [category README](README.md).

| Catalogue control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| MOT-1 Interface motion duration and placement | [`MOT-1a`](interface-motion-duration.md) Interface motion stays within the duration band and names its properties | lint | source | custom | `minMs` (100), `maxMs` (300), `narrativeFiles` |
| | `MOT-1b` Motion on a critical path is functional feedback, not decoration | judged | | | |
| MOT-2 Motion values from tokens | [`MOT-2a`](motion-values-from-tokens.md) Motion durations and easings come from the motion tokens | lint | source | custom | `tokenPrefixes` (`--motion-`, `--ease-`), `tokenFiles`, `componentFiles` |
| | `MOT-2b` A surface that animates declares a token set, and the narrative tier stays off task UI | judged | | | |
| MOT-3 Motion never carries meaning alone | `MOT-3a` An animated surface gives the same information with animations off | judged | | | |
