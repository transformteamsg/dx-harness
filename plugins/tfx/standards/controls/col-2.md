---
id: COL-2
source: TFX-DS
title: Functional colours (success/warning/danger) come from the shared Radix Colors scales, never ad-hoc; small functional-colour text (≤12px chips/labels) uses the scale's step-12 on a tinted background so it clears AA (A11Y-1)
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [page, component]
verify: "Success/warning/danger/info colours resolve to Radix scale tokens, and small functional-colour text on a tint resolves to step-12 (step-11 on a step-3 tint lands ~4.25:1 and fails AA); contrast computed by checks/contrast / verified manually until wired"
waiver: documented
fails_when:
  - custom green/red/amber values
  - red used decoratively
  - small functional-colour text (≤12px) on a tint uses step-11 (or lower) and falls below 4.5:1
enforced: partial
script: [checks/token-audit.py, checks/contrast.py]
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Functional colours — success, warning, danger (and info) — come from the shared **Radix
Colors** scales, never from ad-hoc hex. Use the scale by role:

- **step-9** is the saturated base (the solid chip/dot fill, the icon).
- **step-11** is the conventional "text" step — fine for normal-size text on white or a
  light surface.
- **step-12** is for **small functional-colour text (≤12px chips/labels) on a tinted
  background**: step-11 on a strong tint dips below the 4.5:1 AA floor, step-12 clears it
  with room to spare.

The trap this control names: a builder reaches for step-11 (the "text" step) on a tinted
chip, and small text lands below AA. For small text on a tint, reach for step-12.

## Rationale

The triggering evidence (issue #5 / HF-9): functional status chips and an active toggle
failed AA at ~4.25:1 — Radix step-11 text on a step-3 tint, small text — caught only by a
manually-injected axe scan because `a11y-static` has no contrast coverage. The fix was
step-12.

The site's own `app/globals.css` already encodes this: the subtle (badge) background is an
8% mix precisely so step-11 text clears AA, and `--warning` is amber-11 *darkened* because
amber-11 caps ~4.6:1 even on white and fails on a tint. This broadening writes that
hard-won knowledge into the standard.

## Radix step table (ratios computed from the actual scale hexes via `checks/contrast`)

Small text needs ≥ 4.5:1 (WCAG AA). Ratios below are computed from the Radix light-theme
scale hexes, not transcribed:

| Scale (role) | step-11 on white | step-11 on step-3 tint | step-12 on step-3 tint | step-12 on white |
|---|---|---|---|---|
| grass (success) — `#2a7e3b` text | 5.07:1 ✓ | 4.54:1 ⚠ marginal | **10.85:1 ✓** | 12.11:1 ✓ |
| amber (warning) — `#ab6400` text | 4.61:1 ✓ | **4.25:1 ✗ fails** | **10.47:1 ✓** | 11.37:1 ✓ |
| red (danger) — `#ce2c31` text | 5.21:1 ✓ | 4.68:1 ⚠ marginal | **11.16:1 ✓** | 12.44:1 ✓ |

Read it this way: step-11 is safe on white, but on a step-3 tint it is marginal at best
(grass/red) and outright fails for amber (4.25:1 — the HF-9 number). A stronger tint pushes
all three under. **Step-12 on the tint clears AA by a wide margin for every scale** — so
small functional text on a tint uses step-12.

(`#e9f6e9`/`#fff7c2`/`#ffefef` are grass-3/amber-3/red-3; `#203c25`/`#4f3422`/`#641723` are
grass-12/amber-12/red-12. Recompute with `checks/contrast` if the scale or tint changes.)

## Passes when

- Functional colours resolve to Radix scale tokens (no ad-hoc green/red/amber).
- Small functional-colour text (≤12px) on a tinted background uses step-12 and clears
  4.5:1.
- Red is reserved for danger/error, not decoration.

## Fails when

- Custom green/red/amber values instead of the Radix scale.
- Red used decoratively.
- Small functional-colour text (≤12px) on a tint uses step-11 (or lower) and falls below
  4.5:1.

## Evaluator guidance

For functional chips, badges, and labels with small text on a tinted background, confirm
the text resolves to step-12 (not step-11) and clears 4.5:1. Compute the ratio with
`checks/contrast` against the product's tokens, or verify manually and say so. This
enforces A11Y-1 (the contrast floor) inside the functional palette — a step-11-on-tint
chip is the most common way small functional text slips under AA.

## Do not flag

Semantic colour-coding itself is fine — the review skill's originality criterion already
protects it, and neutralising the colour system is never the fix. The finding is **only
the low-contrast small text**: move it to step-12, keep the colour. Normal-size functional
text on white using step-11 is fine — this rule is specifically about small text on a tint.
