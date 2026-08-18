---
id: MOT-2
source: DX-DS
title: Motion values come from the declared motion token set — durations and easings are never hardcoded in component code
tier: L2
status: proposed
check: hybrid
phase: [implement, verify]
applies_to: [component, page]
verify: "Grep transition/animation values in component code: every duration and easing resolves to a motion token (--motion-*/--ease-* or their declared code mirror); no raw ms or cubic-bezier literals outside the token definitions"
waiver: rationale
enforced: manual
fails_when:
  - a raw duration (350ms, 0.4s) or cubic-bezier literal in component code where the token set exists
  - a surface that animates but declares no motion token set
  - the narrative tier (--motion-story) used on interface or task UI
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

> **Status: proposed.** This control is not ratified. It is recorded here so its shape is
> reviewable, and it carries an accepted gap in the catalogue for exactly that reason: the
> harness does not enforce a rule a design lead has not ratified. No check enforces it, and
> none may while its status is `proposed`.

## Requirement

Where a product declares a motion token set, every duration and easing in component code
resolves to a token from it — `--motion-*` and `--ease-*`, or their declared code mirror.
Raw millisecond values and `cubic-bezier` literals appear only in the token definitions
themselves.

A surface that animates at all is expected to have a declared token set to animate from.
The narrative motion tier (`--motion-story`) is for narrative surfaces and is not used on
interface or task UI.

## Rationale

Motion is the last part of a design system to get tokens, and the first to drift without
them. Hardcoded durations spread by copy-paste, so a system ends up with 200ms, 220ms, and
250ms doing the same job, and no way to retune the feel of a product except by finding
every literal. Tokens make motion a system property rather than a per-component decision,
in the same way TOK-1 makes colour one.

The boundary with MOT-1: MOT-1 bounds where motion may run and how long it may last;
MOT-2 bounds where the values come from. A duration can be token-sourced and still be too
long for a task flow, which is MOT-1's finding, not this one's.

## Why this is hybrid

**Static-check half.** A raw `ms`, `s`, or `cubic-bezier` literal in component code is a
literal, and separating it from the token definitions is a matter of knowing which file
declares the set. That half is mechanical.

**Judgment half.** Whether a surface *should* have declared a token set, and whether a
given surface is narrative or interface — the boundary the `--motion-story` condition
turns on — are readings the evaluator makes.

**Neither half runs today.** The control is unratified, so no script implements either
half, and the catalogue records that as its accepted gap rather than as pending work.
Ratification is a design-lead decision and is tracked separately from any check build.

## Passes when

- Every duration and easing in component code resolves to a declared motion token.
- Raw values appear only where the token set is defined.
- The narrative tier is used only on narrative surfaces.

## Fails when

- A raw duration or `cubic-bezier` literal sits in component code while a token set
  exists.
- A surface animates but declares no motion token set.
- `--motion-story` drives motion on interface or task UI.

## Evaluator guidance

While this control is `proposed`, findings are advisory: record them, and do not block on
them.

**Flag**:

- Raw motion literals in component code where a token set is declared.
- Animated surfaces with no declared token set.
- Narrative-tier motion on task UI.

**Do not flag**:

- The token definitions themselves, which are where raw values belong.
- Products with no declared motion token set at all — the control grades N/A rather than
  failing, and standing up a token set is design work, not a finding.
- Durations that are token-sourced but feel wrong for the flow — that is MOT-1.
- A recorded rationale for a deliberate raw value — this is an L2 control with
  `waiver: rationale`.
