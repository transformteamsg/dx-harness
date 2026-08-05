<!--
DESIGN.md — per-product visual parameters. Human-owned; lives at the product repo root.
Regenerate the machine twin after every edit:
    python3 <harness>/scripts/generate-design-json.py .
Rules (full spec: the harness's docs/DESIGN-CONTEXT.md):
  - Parameters only. Never restate a catalog rule — state the value and cite its source.
  - Delete any section that does not differ from the portfolio default (absent = default).
  - `- key: value` bullets become machine-readable json; a section of prose stays prose.
Filled below with Teacher Workspace examples — replace the values with your product's,
or delete the section if this product matches the portfolio default.
-->

# DESIGN.md — Teacher Workspace

## Colour
<!-- Normative source: COL-1. Give the product's primary token + hex; note accent usage. -->
- primary: --tw-blue #0064FF
- accent: none — functional colour comes from the Radix scales (COL-2)

## Tone weighting
<!-- Normative source: content skill §6. State only THIS product's weighting; don't copy the table. -->
Follows content §6. Teacher Workspace: neutral, steady, quietly confident.

## Motion
<!-- Product motion conventions only. MOT-1 (timing), SLP-8 (no bounce), and A11Y-5
     (reduced-motion) still bind — do not restate them; name this product's signature moves. -->
- entrance: fade + 4px rise, 160ms, standard ease-out
- state-change: cross-fade, 120ms

## Layout system
<!-- The declared column grid (absorbs the LAY-1 proposal's .tfx/layout-system.json;
     see docs/catalog-changes/lay-1-grid.md). Absent = grades N/A. gutter/margins are
     TOK-2 spacing-scale tokens, never raw values. -->
- columns: 12
- gutter: space-4
- margins: space-6
- breakpoints: [360, 768, 1280]
- maxContentWidth: 1280px

## Components
<!-- Product-specific component notes only — defaults and variants you standardise on.
     Sources: CMP-1 (manifest), CMP-7 (component defaults). -->
- AvatarFallback: initials on neutral-3, never a coloured tint
