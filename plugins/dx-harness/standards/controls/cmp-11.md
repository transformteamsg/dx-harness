---
id: CMP-11
source: DX-DS
title: A component's own nested interactive child (a focus ring, active-state fill, icon) traces that component's own container edge and radius — not a smaller box floating inside it
tier: L2
check: judgment
phase: [plan, implement, verify]
applies_to: [page, component]
verify: "Evaluator: for each interactive component, does a focus ring, active-state fill, or icon nested inside it trace the container's true edge and radius (accounting for padding), or does it float inside a smaller box than the container it's meant to outline? A self-consistency read distinct from A11Y-8 (state-tracking) — a ring can correctly track aria-pressed and still sit in the wrong box"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

**Status: proposed, pending design-lead approval.** Report violations as advisory
suggestions, not blocking or advisory findings, until this control is approved.

## Requirement

A component's own nested interactive child matches that component's own container
geometry. A focus ring, active-state fill, or icon nested inside a card, tile, or
button traces the *container's* true edge and radius (accounting for padding, per
the concentric-radius rule in `implement-craft.md`) — not a smaller box floating
inside it. This is a self-consistency check on one instance, distinct from CMP-7's
default/sibling-page checks: a component can match its own default and every
sibling page and still fail this if its own child's box model doesn't match its
own container.

## Rationale

The triggering incident: a two-independent-run efficacy report on the same issue
(`docs/tfx-design-skill-report`) found a stat-tile's active/focus ring sitting
visibly inside its card rather than flush with the card's edge — the `Card`
primitive's own `py-6` padding was never zeroed to match the inner button's
smaller `rounded-xl`, so the ring traced a box floating inside the card shell.
Both evaluator passes graded the ring's *state-tracking* (A11Y-8) as a pass and
missed the *geometry* mismatch entirely, because CMP-7's guidance is worded only
around component defaults and cross-page consistency — it never named
self-consistency between a component and its own nested child as something to
check. A second, independent implementation of the same component (built with no
shared context) got the geometry right by construction — ring on the `Card`
itself, `Card`'s own padding zeroed, matching radius throughout — which is why
this is filed as a missing check, not a hard problem.

Boundary with [[CMP-7]]: CMP-7 checks a component against its own defaults and its
sibling-page usage; CMP-11 checks a component against itself — does its own nested
interactive child trace its own container's edge and radius.

## Passes when

- A nested interactive child's ring, fill, or highlight traces its own container's
  true edge and radius — no visible gap, no radius mismatch, accounting for
  padding.

## Fails when

- A component's own nested interactive child (a focus ring, active-state fill,
  icon) does not trace that component's own container edge or radius — it reads
  as floating inside a smaller box, not outlining the container.

## Evaluator guidance

Check each interactive component against **its own nested child's geometry**, not
only against defaults and sibling pages: does a focus ring, active-state fill, or
icon trace the component's own edge and radius, or does it float inside a smaller
box than the container it's meant to outline? This is a self-consistency read on
one instance — a component can pass CMP-7 and still fail here. It's easy to miss
from a screenshot alone at a glance; look specifically at the gap (or lack of one)
between the ring/fill and the container's own edge, not just whether the ring is
present and state-tracking correctly (that's A11Y-8, a separate check — don't let
a correct A11Y-8 pass stand in for this).

**This control is proposed, pending design-lead approval** — report a violation as
an advisory suggestion, not a blocking or advisory finding, until approved.

## Do not flag

- A *deliberate, recorded* override — one with a waiver carrying a real reason, or
  a documented decision.
