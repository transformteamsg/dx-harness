---
id: LAY-1
source: TFX-DS
title: Layout uses the product's declared column grid and gutter scale; ad-hoc column counts and off-scale gutters are findings — N/A where no grid is declared
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [page, component]
verify: "Where a product declares a grid (.tfx/design.json layout_system), gutter/margin values resolve to the TOK-2 spacing scale and column count matches the declared value; evaluator judges whether the column structure reads as coherent; grades N/A where no grid is declared (checks/layout-scan planned)"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Where a product **declares a grid**, its layout uses that declared column count and gutter
scale — ad-hoc column counts and off-scale gutters are findings. Where a product declares
**no** grid, this control grades **N/A**, not fail: it never penalises a product for
lacking a declaration it was never asked to write (the same honest v0 pattern as CMP-1's
"asserted, no manifest").

## The declaration

The grid lives in the product repo's `.tfx/design.json` under a `layout_system` key
(generated from the human-owned `DESIGN.md`; spec at `docs/DESIGN-CONTEXT.md`):

```json
{
  "layout_system": {
    "columns": 12,
    "gutter": "space-4",
    "margins": "space-6",
    "breakpoints": [360, 768, 1280],
    "maxContentWidth": "1280px"
  }
}
```

- `columns` — integer column count for the product's primary grid.
- `gutter` / `margins` — a TOK-2 spacing-scale **token name**, not a raw value.
- `breakpoints` — widths the grid restructures at; defaults to the portfolio-wide
  `[360, 768, 1280]`, but a product may declare its own.
- `maxContentWidth` — the grid's outer cap; distinct from LAY-4's prose measure (~66ch).

## Rationale

A declared grid turns "does this feel aligned?" into a checkable claim, and lets alignment
(LAY-6) tighten back to referencing the grid once one exists. Until a product declares one,
alignment is judged against the surface's own visible structure. The control stays
honest-but-inert without a declaration, like CMP-1 without a component manifest.

## How to verify

**Deterministic half** (once `.tfx/design.json` `layout_system` exists and
`checks/layout-scan` is built): gutter/margin values resolve to the TOK-2 scale and the
column count matches the declared value.

**Judgment half:** the evaluator confirms the resulting column structure reads as coherent
(a page can use on-scale gutters in an incoherent arrangement).

Say **"N/A — no declared grid"** rather than "pass" when no declaration exists; do not
infer a grid from a page's incidental spacing.

## Passes when

- A declared grid exists and the layout follows its column count and on-scale gutters.
- No grid is declared (grades N/A — not a finding).

## Fails when

- A declared grid exists and the layout uses an ad-hoc column count not drawn from it.
- A declared grid exists and gutters/margins don't match the spacing scale (TOK-2) with no
  deliberate reason.

## Evaluator guidance

**Do not flag:** a product with no declared grid (N/A, not a finding); a deliberate
asymmetric or non-grid layout with a stated reason (the L2 `rationale` waiver covers it).

**Deconfliction.** TOK-2 checks per-element spacing values; this control checks whether the
resulting grid is coherent as a whole. LAY-4 caps prose measure; this caps the grid's outer
edge. LAY-6 requires shared edges to align within whatever structure exists; this requires
that structure be a *declared* grid the layout follows — it sits upstream of LAY-6. SLP-5
bans the cookie-cutter card grid; this requires the declared grid be followed when a grid is
used — complementary.
