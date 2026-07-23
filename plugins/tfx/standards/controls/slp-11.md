---
id: SLP-11
source: TFX-DS
title: A card is only for an interactive unit (clickable, selectable, draggable); static content is grouped with spacing, type, and dividers
tier: L2
check: judgment
phase: [plan, implement, verify]
applies_to: [page, component]
verify: "Evaluator: every card-styled container (border or shadow + radius + background) is a discrete interactive unit; if removing the card chrome would not hurt comprehension, it should not be a card"
waiver: rationale
fails_when:
  - static content boxed in card chrome purely for visual separation
  - a card used as a section wrapper where a heading plus spacing would group it
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

## Requirement

Reach for a card only when the card itself is the interaction — a unit the teacher
clicks, selects, drags, or otherwise acts on as a whole (a class tile that opens a
roster, a selectable assignment, a draggable item). Static content — a settings
section, a page intro, a read-only summary — is grouped with spacing, typography, and
dividers, not with a border-radius-background box. The test: if removing the card
chrome would not hurt comprehension, it should not be a card.

## Rationale

Boxing everything in cards is the default AI composition, and it flattens hierarchy
into a wall of equal-weight tiles where nothing leads. Card chrome is a signal —
"this is a thing you can act on." When it is sprayed across static content the signal
goes dead, the page reads as a template rather than a considered layout, and real
interactive units no longer stand out. Whitespace, type scale, and a hairline divider
group content more clearly and more quietly than a border ever does. This completes
the harness's card trio: SLP-4 says do not nest cards, SLP-5 says do not lay them out
as an identical grid, and SLP-11 asks the prior question — should this be a card at
all? (HIG: Simplicity — let the structure come from the task, not from chrome.)

## Passes when

- A grid of class tiles, each of which opens that class — the card is the click target.
- A list of selectable assignments where each row is a card you can pick or drag.
- A settings page whose sections are separated by headings, spacing, and dividers —
  no card boxes around read-only groups.
- A page intro and a read-only summary set apart by type scale and whitespace.

## Fails when

- A static "About this page" blurb wrapped in a bordered, rounded, shaded box for no
  reason but visual separation.
- A form's sections each boxed in a card when a heading and spacing would group them.
- A dashboard where every region — interactive or not — is the same card, so nothing
  reads as more actionable than anything else.

## Evaluator guidance

For each card-styled container in the screenshots, ask: **is this a discrete thing the
teacher acts on as a unit?** If yes, it earns the card. If it is static content that
card chrome only separates visually, it is a finding — recommend grouping with
spacing, type, and dividers instead.

**Do not flag:**

- A container that *is* the interaction (clickable/selectable/draggable) — that is the
  correct use.
- An established, deliberate card pattern already shipped on the surface — the
  conservative-defaults rule (design Phase 4) presumes settled layout
  intentional; do not restyle it as a side effect. Raise it as a *proposed* change with
  rationale, never silently.
- A single content container used to set a focused task apart from page chrome, where
  it genuinely aids comprehension.

This is L2: a reasoned deviation (a platform pattern, a deliberate emphasis the team
tested) takes an inline `tfx-waive SLP-11 reason="…"`. "Looks more designed" is not a
reason.
