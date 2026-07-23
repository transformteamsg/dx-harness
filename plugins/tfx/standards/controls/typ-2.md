---
id: TYP-2
source: TFX-DS
title: Body text at least 14px; labels at least 12px; body line-height 1.5-1.6
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [page, component]
verify: "Type-scale scan; checks/type-scan"
waiver: documented
enforced: partial
script: checks/type-scan.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Set body copy at 14px or larger in Inter, UI labels at 12px or larger, and body
line-height between 1.5 and 1.6. Sizes come from the Tailwind default type scale
(TYP-3); this control sets the floors.

## Rationale

Readability is kindness. Teachers scan between classes — already tired, already
behind. Type below these floors trades their legibility for layout convenience, which
inverts Utility by Default.

## Passes when

- All body copy is ≥ 14px (Body Small is the 14px floor; Body 16, Body Large 18).
- Labels and captions are ≥ 12px (Label/Caption 12 styles).
- Body text line-height computes to 1.5–1.6.

## Fails when

- Body copy below 14px — including "just this dense table".
- UI labels below 12px.
- Line-height under 1.5 on body copy.

## How to verify

`checks/type-scan` (planned): walk computed styles for text nodes; report any below
the floors with selector and computed size. Until the script exists, verify manually
against rendered output and label it "verified manually".
