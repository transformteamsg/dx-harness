# COL: Colour

Source: the SLP controls of `catalog.yaml`. Status: draft. SLP is not a category, so each SLP control moves to the category that it grades (ADR-0001 D10).

A judged rule has no file. `dx-design-judge` judges it.

## From the SLP controls

| Source control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| SLP-1 No purple gradients, cyan-on-dark theming, or glow accents | [`COL-3a`](purple-gradient-and-glow.md) No purple gradient and no glow shadow. | lint | source | custom | `hueRange`, `minSaturation`, `minGlowBlur` |
| | `COL-3b` No cyan-on-dark theming, and the palette is a decision, not the default look. Lint part: [`COL-3a`](purple-gradient-and-glow.md). | judged | | | |
| SLP-2 No gradient text | [`COL-4a`](gradient-text.md) No gradient text | lint | source | custom | |
