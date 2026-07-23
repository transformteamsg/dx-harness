---
id: CMP-7
source: TFX-DS
title: Components stay consistent with their design-system defaults and with sibling-page usage — overriding a default's colour/contrast/shape, or breaking a control group's shared resting affordance, is a finding unless justified
tier: L2
check: judgment
phase: [plan, implement, verify]
applies_to: [page, component]
verify: "Evaluator: the surface's components use their design-system defaults; any override of a default that changes colour, contrast, or shape is flagged (and its contrast re-checked under A11Y-1), the surface's component usage matches sibling pages, and a control group's members share one resting affordance; deterministic override-detection planned once the component manifest (CMP-1) is wired"
waiver: rationale
fails_when:
  - a design-system component default is overridden in a way that changes colour, contrast, or shape with no recorded reason
  - a component is used differently here than on sibling pages with no reason
  - members of one control group (toggle set, segmented control) do not share a resting affordance — only the selected one reads as interactive
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Use design-system components at their defaults. When you override a default — a colour,
a contrast pairing, a shape (radius, border, fill) — treat that as a deliberate decision
that must be justified and recorded, not a silent one-off. Three things stay consistent:

1. **A component matches its design-system default** unless an override is recorded with a
   reason. Overriding a default's text/background colour, its contrast, or its shape is a
   finding unless justified.
2. **A component matches how the same component is used on sibling pages.** If the avatar,
   badge, button, or chip is rendered one way across the product and differently here, the
   divergence is a finding unless there is a reason.
3. **Members of one control group share a resting affordance.** In a toggle set or
   segmented control, every member reads as interactive at rest — not only the selected
   one. If the unselected members look like plain text, the group fails this control.

## Rationale

The triggering incident (attendance loop run, issue #5 / HF-19): an `AvatarFallback`
overrode the design-system default text colour (`text-primary-foreground` →
`text-foreground`) while every other page used the default. The result was dark initials
on a blue `bg-primary` — an A11Y-1 contrast fail at 3.32:1 (L0) that survived the critique
and two evaluator passes before a human caught it by eye. A companion case: a toggle where
only the *selected* option carried a resting affordance, so the unselected members read as
plain text.

A11Y-1 catches the *contrast consequence* of such an override after the fact. Nothing
caught the *consistency* class that admits it — "you overrode a default", "this differs
from sibling pages", "this control group's members don't share an affordance". CMP-7 names
that class so the divergence is caught where it starts, not only when it happens to break
contrast. It complements, not duplicates: `checks/contrast` (the mechanical contrast
backstop) and the HF-18 procedural fix (preserved elements are still graded, never waved
through).

## Passes when

- Components render at their design-system defaults; any override is recorded with a
  reason (a waiver or a decision-record note).
- The same component looks and behaves the same here as on sibling pages.
- Every member of a toggle set / segmented control shows a resting affordance, so the
  group reads as a set of choices, not one button plus some text.

## Fails when

- A design-system component default is overridden in a way that changes colour, contrast,
  or shape with no recorded reason.
- A component is used differently here than on sibling pages with no reason.
- Members of one control group do not share a resting affordance — only the selected one
  reads as interactive.

## Evaluator guidance

Judgment for now: read the surface's components against their design-system defaults and
against the same component on sibling pages. When you find an override, check whether it
is recorded with a reason; if it changes colour or contrast, re-check it under A11Y-1.
Inspect every toggle/segmented group for a shared resting affordance. The deterministic
override-detection sub-check is **planned** once the CMP-1 component manifest is wired (the
manifest is what makes "overrode a default" mechanically detectable) — until then, say
"verified manually" and name what you checked.

## Do not flag

- A *deliberate, recorded* override — one with a waiver carrying a real reason, or a
  documented decision. The control protects against silent divergence, not justified
  design decisions.
- A product's documented nuance calibration (accent / tone per `standards`).
- Semantic colour-coding itself — that is never the finding here (per the review skill's
  originality criterion). The finding is the *unjustified divergence*, not the use of
  colour or a variant.
