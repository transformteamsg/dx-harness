---
id: TOK-3
source: TFX-DS
title: Corner radii come from the shadcn default radius scale
tier: L1
check: deterministic
phase: [implement, verify]
applies_to: [component]
verify: "No off-scale border-radius values; checks/token-audit"
waiver: documented
enforced: partial
script: checks/token-audit.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Corner radii must be on-scale ({0, 2, 4, 6, 8, 12, 16, 24, 9999} px) and nesting
must be concentric (child radius ≤ parent radius). The working rule for a nested
element is `inner radius = outer radius − padding`: a card at `rounded-2xl` (16px)
with 8px of padding wants an inner control at `rounded-lg` (8px), not another 16px.
Mismatched radii on nested surfaces are the most common thing that makes a layout
feel off; snap the result to the nearest scale step. **Additionally**, peer containers
of the same kind (cards, sections, tiles) share a single corner radius, anchored by
default to the product's `Card` component radius / `--radius` token (0.5rem = 8px in
this product's `app/globals.css`).

## Rationale

Two on-scale radii can still read as careless when peers disagree. A `rounded-lg`
(8px) section beside `rounded-3xl` (24px) cards — both on scale, both valid in
isolation — looks inconsistent side by side. Consistency across peers is what makes a
surface feel deliberate rather than assembled from independent parts. The product's
Card radius is the natural anchor because cards are the most common peer container.

## Fails when

- Ad-hoc or off-scale radius values (e.g. `border-radius: 10px` where 10 is not in
  the scale).
- Child radius larger than parent (non-concentric nesting).
- Peer containers of the same kind using different corner radii on the same surface
  with no deliberate hierarchy reason (e.g. a profile section at `rounded-lg` beside
  metric cards at `rounded-3xl`).

## How to verify

**Deterministic half (static, per element):** run `checks/token-audit <path>…` —
the scanner flags off-scale values and concentric-nesting violations line-by-line.

> **Coverage caveat (utility-first / Tailwind products).** `token-audit` resolves
> raw `border-radius` in CSS properties, arbitrary utilities (`rounded-[10px]`), and
> palette-bypass classes — but it does **not** map *named* Tailwind radius utilities
> to px, so an off-scale named class such as `rounded-4xl` (32px, not on the
> {0,2,4,6,8,12,16,24,9999} scale) **passes the deterministic check**. Until a
> Tailwind-class→value resolver lands, treat off-scale named radius utilities as an
> evaluator-judged item, not a covered-by-gate one — and do not report TOK-3 as
> "mechanically clean" for a Tailwind product without eyeballing the named classes.
> The same blind spot applies to TYP-3 (named size utilities) and TOK-2 (named
> spacing utilities).

**Peer-consistency (evaluator-judged — no cross-element static check):** there is no
script that compares two different elements' radii. The evaluator compares peer
containers visible in the screenshots against the product's Card/`--radius` anchor.
The reference anchor for this product is `--radius: 0.5rem` (`app/globals.css`).

## Evaluator guidance

**Flag:** peer cards, sections, or tiles on the same surface that use visibly
different corner radii without a deliberate hierarchy purpose — e.g. a summary card
at `rounded-3xl` beside a detail section at `rounded-lg`.

**Do not flag:** a deliberately different radius that signals a different element
*class* — e.g. a full-bleed hero image (no radius or `rounded-none`) beside inset
cards (standard card radius). Hierarchy is a reason; unexplained drift is not.
