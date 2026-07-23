---
id: COL-1
source: TFX-DS
title: Primary actions and brand moments use the product's own primary brand colour (or its ramp)
tier: L1
check: hybrid
phase: [implement, verify]
applies_to: [page, component]
verify: "Deterministic half: primary-action and brand-moment colours resolve to the active product's primary token or its ramp (checks/token-audit). Judgment half: the evaluator confirms the view's single primary action is the product primary (dovetails CMP-5) and no other product's primary appears for emphasis; see controls/col-1.md for the per-product table and the foreground pairing"
waiver: documented
enforced: partial
script: checks/token-audit.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Each product anchors its primary actions and brand moments in its **own** primary
brand colour and that colour's ramp. Do not import another product's primary for
emphasis on a different product's surface. The active product is established in
Phase 1 of the design-ui loop.

## Per-product primary

| Product | Primary | Token | Value |
|---|---|---|---|
| Teacher Workspace | Teacher & School Blue | `--tw-blue` | `#0064FF` |
| CaseSync | Radix indigo-9 | `--casesync` | `#3E63DD` (proposed) |
| Glow | Radix orange-9 | `--glow` | `#F76B15` |
| TW surfaces (Posts / PG Staff Portal) | Teacher & School Blue | `--tw-blue` | `#0064FF` |

Glow's primary is **confirmed** at Radix orange-9 `#F76B15` (design lead, 2026-07-01 —
see `docs/catalog-changes/glow-pilot-col1-typ1-tok3.md`). A product still marked
"(proposed)" awaits the design lead's settle; each consuming product mirrors the
confirmed value in its own token layer (`--primary`).

## Foreground pairing (A11Y-1)

A product's primary is a **background** for its label text, so the primary and its
paired foreground must clear A11Y-1 together — this is not automatic, and a light or
mid-luminance primary cannot carry white text.

- **Glow orange-9 `#F76B15` takes a dark foreground, not white.** White on `#F76B15`
  is **2.97:1 — it fails** the 4.5:1 body floor (and the 3:1 large-text floor). Pair it
  with the scale's high-contrast dark step (Radix orange "contrast" / step-12, a
  near-black brown) → ~5.7:1. This is the Radix convention for the light-hue solids
  (orange, amber, lime, yellow): step-9 is a dark-text background, not a white-text one.
- Teacher & School Blue `#0064FF` and CaseSync indigo-9 take **white** text (both clear AA).

When a product adopts a light-hue primary, the brand variant's `--primary-foreground`
must be the dark contrast colour, and the evaluator re-checks label contrast.

## Same-hue collision (A11Y-1)

Applying COL-1 can *create* an A11Y-1 failure: when the product primary would sit on a
**same-hue field**, the button's fill can lose the 3:1 boundary against its background.
The foreseeable case is Glow's orange primary on an orange tint or splash
(orange-on-orange — e.g. a `tag-*-50` topic tint or the login splash). Before
recolouring a primary onto a coloured field:

- change the **container** so the button sits on a neutral / near-white surface (the
  Glow login CTA moved into a white card for exactly this — orange-on-white clears AA), **or**
- keep the action neutral on that surface and record the deviation.

Never recolour a primary onto a same-hue field without re-checking the 3:1
UI-component boundary; a mechanical "make it brand" that ignores this ships an
inaccessible control.

## Rationale

The portfolio is **independent products**: Glow's primary is orange, CaseSync's is
indigo. As written before this plan, COL-1 pointed every product at Teacher & School
Blue — a rule that would mark a correct Glow orange CTA as a violation. The
correction: each product's primary is its own brand colour. Teachers recognise a
product partly by its colour; forcing a single blue across the portfolio erases that
identity and mis-grades correct work.

## How to verify

**Deterministic half:** the active product's primary CTA and brand-moment colours
resolve to that product's primary token (not a raw hex bypassing the token layer).
The `checks/token-audit` allowlist already knows the product's `--color-*` names
from its CSS — see plan 011 for the project-token-aware mechanism.

**Judgment half (why this control is `hybrid`, not `deterministic`):** the colour
resolving to *a* valid token passes the mechanical half trivially — the real question
is whether the view's **single primary action** (per CMP-5) carries the product
primary, or a legitimately-tokenised *neutral* is sitting where the brand belongs. The
evaluator confirms: (1) the one primary action per view resolves to the product
primary; (2) its label/background pairing clears A11Y-1 (see Foreground pairing);
(3) no *other* product's primary appears for emphasis (Glow orange on a Teacher
Workspace screen is a finding; Teacher & School Blue on a Glow CTA is a finding).
