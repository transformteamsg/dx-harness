---
id: CNT-12
source: TFX-DS
title: Copy uses sentence case — capitalise the first word and proper or branded nouns only
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [content]
verify: "Lint headings/labels/buttons for Title-Case patterns (planned content-lint heuristic); evaluator judges sentence-case compliance and the proper-noun / branded-term exemptions"
waiver: rationale
enforced: partial
script: checks/content-lint.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Set all UI copy in sentence case — capitalise the first word and any proper or branded
noun, and lowercase everything else. This holds everywhere text appears: headings, page
titles, buttons, labels, menu items, tab names, and running prose. Do not use Title Case
("Submit Your Marks", "View Class Details") and do not capitalise a mid-sentence word for
emphasis.

Sentence case is easier to read and scan, sounds more human than the shouty register of
Title Case, and reserves capitals for the words that genuinely carry them — the names of
people, products, programmes, and places. When only proper nouns are capitalised, the
capital itself becomes a signal.

This applies to user-facing copy. Genuine acronyms (CCE, MOE) and product, programme, and
feature names (Teacher Workspace, CaseSync, Glow) keep their established capitalisation.

See also: TYP-4 bans all-caps text (a styling transform, or a shouted string); CNT-12 is
the neighbouring rule for the other capitalisation failure — Title Case, which passes
TYP-4 because it uses no uppercase transform yet still breaks sentence case. TYP-4 catches
`SUBMIT`; CNT-12 catches `Submit Your Marks`. This control also makes the
`grammar-mechanics.mdx` "sentence case everywhere" rule enforceable.

## Rationale

Title Case reads as a heading style borrowed from print mastheads; on a working teacher
tool it adds visual noise and a faint corporate tone without adding meaning. Sentence case
matches how people actually write, keeps buttons and labels calm, and — because capitals
are rationed — lets a proper noun stand out where it should. The rule is a strong default
with narrow, well-defined exceptions (proper nouns, branded names, genuine acronyms), so
it is L2: deviate only with a recorded reason, not silently.

## Passes when

- A heading reads "Submit your marks", not "Submit Your Marks".
- A button reads "View class details", not "View Class Details".
- A proper or branded noun keeps its capital mid-sentence: "Open in Teacher Workspace",
  "Sync to CaseSync".
- A genuine acronym stays capitalised: "Upload the CCE record".

## Fails when

- Title Case in a heading, label, button, tab, or menu item: "Submit Your Marks",
  "View Class Details", "Manage All Students".
- A common (non-proper) mid-sentence word capitalised for emphasis: "Please Confirm before
  you continue", "This is a Draft".
- A page or section title that capitalises every significant word rather than just the
  first word and any proper noun.

## How to verify

**Hybrid.** Deterministic half — a planned `checks/content-lint.py` heuristic flags
headings, labels, and button strings where multiple words begin with a capital (a
Title-Case signal), leaving proper-noun exemption to review. Until the heuristic ships,
verify manually against the rendered copy and label it "verified manually". Judgment half —
the evaluator reads each heading, label, button, and sentence and confirms only the first
word and genuine proper or branded nouns are capitalised.

## Evaluator guidance

Quote the offending string in every finding and give the sentence-case rewrite.

**Flag:**

- Title Case on any heading, label, button, tab, or menu item where the extra capitals are
  not proper nouns: "Submit Your Marks" → "Submit your marks".
- A common mid-sentence word capitalised for emphasis: "This is a Draft" → "This is a
  draft".

**Do not flag:**

- Proper nouns — names of people, schools, places, ministries.
- Product, programme, and feature names with established capitalisation: "Teacher
  Workspace", "CaseSync", "Glow", "Form Class" where it is the branded term.
- Genuine acronyms (CCE, MOE, HDP) — already exempt under TYP-4.
- The first word of a heading or sentence, which is always capitalised.

## Waiver

`rationale` (L2) — inline `tfx-waive CNT-12 reason="..."` at the deviation site. A
ministry-mandated title or programme name that must appear verbatim in Title Case is the
canonical waiver case.
