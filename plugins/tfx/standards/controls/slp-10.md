---
id: SLP-10
source: TFX-DS
title: Complex multi-section tasks get a page, not a modal
tier: L1
check: judgment
phase: [intent, plan, verify]
applies_to: [flow, page]
verify: "Evaluator: any task with multiple sections, its own scrolling, or a column layout gets a page, not a modal"
waiver: documented
fails_when:
  - modal with its own scrollbar and column layout
refs:
  - https://github.com/transformteamsg/tfx-design-standard
---

## Requirement

Give any task with multiple sections, its own scrolling, or a column layout a
page of its own. Modals are for single decisions and short, focused inputs —
not for forms that have grown chapters.

## Rationale

The mega-modal is a recognisable AI-UI tell, and a genuinely worse surface: it
traps a complex task in a constrained viewport, breaks deep-linking and
back-button behaviour, stacks scrollbars, and turns an accidental backdrop
click into lost work. Teachers doing real work deserve a URL, full width, and
a browser history entry.

## Passes when / Fails when

**Passes:**

- A confirm dialog with one decision and two buttons (CMP-2 surfaces).
- A short single-purpose input in a modal — rename a class, pick a date.
- A multi-section "set up new assessment" task implemented as its own page
  with a clear way back.

**Fails:**

- A modal containing tabs, accordions, or a two-column form.
- A modal with its own scrollbar because the content outgrew the viewport.
- A wizard inside a dialog where closing it discards three steps of input.

## Evaluator guidance

Judge the *task*, not the pixel count. Signals that it needed a page: more
than one logical section or heading inside the dialog; internal scrolling at
768 width; any column layout; input that would hurt to lose on an accidental
dismiss. A long-ish but single-purpose surface (one field plus help text) can
stay a modal — flag only when sections, scrolling, or columns appear. If the
plan proposes a modal for a flow with three or more steps, raise it at the
plan phase, before implementation. This is L1: a deviation needs a documented
waiver with a named approver, e.g. a platform constraint that genuinely
prevents a routed page.
