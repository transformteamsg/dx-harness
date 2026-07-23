---
id: MOT-3
source: TFX-DS
title: Motion may emphasise meaning but never carry it alone — an animated surface communicates the same information with animations off
tier: L2
check: judgment
phase: [plan, implement, verify]
applies_to: [page, component]
verify: "With prefers-reduced-motion set, every diagram and animated surface still communicates its full meaning: states, order, gates, and relationships remain legible statically"
waiver: rationale
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

## Requirement

An animated surface communicates the **same information with animations off**.
Motion may emphasise meaning — draw the eye to the next step, reinforce an
order the layout already states — but it never carries meaning alone. Every
state, order, gate, and relationship the animation expresses must also exist
statically: in numbering, position, labels, connectors, or colour.

This is information parity, not motion suppression. Turning animation off may
remove emphasis and delight; it must never remove content.

## Rationale

A meaningful fraction of users runs with `prefers-reduced-motion` set, and
every user sometimes reads a surface mid-animation, after it, or in a
screenshot. If a diagram's order lives only in a travelling dot, those readers
get a different — poorer — document. A11Y-5 already demands that a
reduced-motion variant exists; this control demands the variant be the same
document. The distinction matters because the easy implementation of reduced
motion (hide the animated thing, or freeze it at frame zero) satisfies A11Y-5
while silently dropping the diagram's point.

## How to verify

**Judgment.** No deterministic sub-check — whether meaning survives is a
reading task, not a grep.

- Set `prefers-reduced-motion` (or disable JS animation) and read the surface
  cold. The evaluator question: **read the surface with animations off — is
  anything missing, not just still?** "Still" is fine; "missing" is a finding.
- Enumerate what the animation expresses (order, causality, state change,
  grouping) and point to where each item exists statically. Any item with no
  static carrier fails.
- Check the reduced-motion branch renders the full content, not a placeholder
  or nothing.

## Passes when

- A loop diagram whose phases and gates are all legible as static markup —
  numbered chips, labelled pills, drawn connectors — with motion only staggering
  their entrance.
- A reveal that only fades: the content is identical before and after; motion
  adds emphasis, not information.
- A hover state that highlights a row the layout already delineates — the
  hover confirms a boundary that exists statically.

## Fails when

- A diagram whose order is shown only by a travelling dot along a path while
  the phases themselves are unnumbered — with motion off, the sequence is gone.
- Progress conveyed only by animation (a bar that fills, a counter that climbs)
  with no static value, label, or fraction beside it.
- A reduced-motion variant that hides a diagram wholesale instead of showing it
  settled — dropping the information along with the motion.

## Evaluator guidance

**Do not flag:** decorative motion with no informational content (a fade, a
lift) — there is nothing to lose; a static surface with no animation at all —
this control binds only surfaces that animate; a reasoned deviation carrying an
inline `tfx-waive MOT-3 reason="…"` (L2).

**Deconfliction.** A11Y-5 asks whether a reduced-motion variant exists; MOT-3
asks whether that variant loses information. MOT-1 bounds how long motion runs
and where it may run at all; MOT-3 bounds what motion is allowed to mean. MOT-2
bounds where duration and easing values come from; it says nothing about
content.
