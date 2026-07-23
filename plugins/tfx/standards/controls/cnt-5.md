---
id: CNT-5
source: TFX-DS
title: UI action words name the action, not the input device — "choose", "select", "view", never "click", "tap", "swipe", or "press"
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [content]
verify: "Lint flags device-bound verbs (click/tap/swipe) in user-facing copy; evaluator confirms the word is a UI action instruction and judges the harder calls (press, see) and ambiguous link text"
waiver: rationale
enforced: partial
script: checks/content-lint.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Write action words that describe the action, not the input device. Say "choose",
"select", "open", or "view"; never "click", "tap", "swipe", or "press". Link and
button text names where the action goes or what it does — never "click here" or
"read more". Applies to all user-facing copy: buttons, links, instructions, help
text, empty states.

## Rationale

Teachers reach TFX products on laptops, tablets, and phones, and through screen
readers and switch devices. "Click the button" is wrong for a teacher on a tablet
and meaningless to someone navigating by voice — the instruction names an input the
reader may not use. Device-agnostic verbs work everywhere at once, which is the
kind thing to do: the copy is correct for every teacher without a variant per
device. Ambiguous link text ("click here") fails the same test twice — it names the
device *and* tells a screen-reader user nothing about the destination when links are
read out of context.

This control was mapped from the HDB e-services UX-writing guide (Step 9,
accessibility) during the writing-guide port, and complements A11Y-7 (link text
makes sense out of context) on the content side.

## Passes when / Fails when

**Passes:**

- "Choose a class to begin."
- "Select the students to mark present."
- "View the full report" (link text names the destination).
- "Open Student Notes."

**Fails:**

- "Click here to view your class list." (device verb + ambiguous link text)
- "Tap to continue." / "Swipe to see more."
- "Press the button to submit." (device verb; "press" is the evaluator's call)
- "Read more" / "Click here" as standalone link text.

## How to verify

**Deterministic half (lint):** case-insensitive, word-boundaried scan of user-facing
copy for the device-verb list —
<!-- tfx-sync:cnt5-verbs source -->
click, clicks, clicked, clicking, tap, taps, tapped, tapping, swipe, swipes, swiped, swiping
<!-- /tfx-sync:cnt5-verbs -->
— each hit is a candidate finding. The list is read at runtime by
`checks/content-lint.py` from this file, so the lint and the catalog never diverge.
The lint stays out of code identifiers (`onClick`, `element.click()`) by scanning
only multi-word user-facing strings and MDX prose, not bare tokens.

**Evaluator half:** the lint is scoped to the unambiguous verbs; the harder calls
need judgment — see below.

## Evaluator guidance

Quote the offending copy in every finding.

**Flag:**

- Any device verb (click, tap, swipe, press) used as a UI action instruction — the
  imperative CTA case is the core of this control.
- "See" used as a UI action ("see the report") where "view" carries the meaning.
- Ambiguous link text — "click here", "read more", "learn more" as the whole link —
  even when no device verb is present (the link must name its destination; A11Y-7).

**Do not flag:**

- Incidental, non-UI prose where the word is not an instruction: "press release",
  "the press", "click rate", "tap water", "a firm tap on the shoulder". The lint
  will surface these as candidates; dismiss them — they are advisories, not blocks.
- Device verbs inside a waiver (`tfx-waive CNT-5 reason="..."`) — e.g. quoting a
  third-party UI or OS gesture that must be named verbatim.
- Code identifiers and API names (`onClick`, `onTap`, event names) — these are not
  copy.

This is L2 — a deliberate deviation carries an inline rationale, not a rewrite war.
