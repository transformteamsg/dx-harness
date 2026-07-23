---
id: CNT-13
source: TFX-DS
title: Copy is free of spelling and proofreading errors and uses Singapore English spelling (British base)
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [content]
verify: "Lint flags a curated US→UK spelling map and a common-misspelling list read from cnt-13.md; evaluator proofreads for the typos, homophones, and doubled words no word list can catch"
waiver: rationale
enforced: partial
script: checks/content-lint.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

User-facing copy is spelled correctly, proofread, and uses Singapore English (British
base). Three things this catches:

1. **No misspellings or typos.** "recieve", "seperate", "occured", "teh".
2. **British spelling, not American.** Singapore English uses the British base:
   "organise" not "organize", "colour" not "color", "centre" not "center". The high-
   frequency families are `-ise` (not `-ize`), `-our` (not `-or`), `-re` (not `-er`), and
   `-ogue` (not `-og`), plus common one-offs ("licence", "defence", "programme", "grey").
3. **No proofreading artifacts.** A doubled word ("the the"), a stray placeholder
   ("TODO", "lorem"), or a copy-paste seam left in shipped text.

This applies wherever copy appears — headings, labels, buttons, helper text, error
messages, empty states, and running prose. It grades **orthography only**: whether each
word is spelled correctly and in the house dialect, whatever the sentence is doing.

See also: this control makes `ui-text.mdx` §10 ("Check for grammar and spelling")
enforceable — it had no owning control before. The *grammar* half of §10 is already owned
elsewhere: CNT-3 (voice, length), CNT-8 (nominalisations), CNT-9 (clarity mechanics), and
CNT-12 (sentence case). CNT-13 does not re-grade any of those; it only checks spelling.

## Rationale

A spelling error breaks trust faster than any style slip — it reads as carelessness on a
tool teachers rely on. Dialect consistency matters too: mixing "color" and "colour" across
a product looks unfinished. The rule is a strong default with narrow, legitimate
exceptions (a quoted source, a branded name, a ministry term that is spelled a fixed way),
so it is L2: a deviation carries a recorded reason, not a block.

## Passes when

- "Organise your classes before the term starts." (British spelling)
- "Sync to the centre record." ("centre", not "center")
- "You'll receive a confirmation." ("receive" spelled correctly)
- A branded or ministry term keeps its fixed spelling, even where it differs from the house
  dialect, under an inline waiver.

## Fails when

- A misspelling in user-facing copy: "You will recieve a copy", "Enter your details
  seperately".
- US spelling where British is house style: "Choose a color", "Organize your marks",
  "Open the center panel".
- A doubled word or leftover artifact: "Save the the draft", a stray "TODO" in shipped
  copy.

## How to verify

**Hybrid.** Deterministic half — `checks/content-lint.py` reads two marker-delimited maps
from this file at runtime, so the lint and the catalog never diverge. Each map is
`wrong -> right`; a case-insensitive, word-boundaried hit on a `wrong` key flags the token
and suggests the `right` spelling. Scoped to multi-word user-facing copy (like CNT-5 and
CNT-6), so a bare one-word identifier in code is not flagged — a single-word label is left
to the evaluator.

US → British spelling map — flagged word-boundaried, any position:
<!-- tfx-sync:cnt13-usuk source -->
color -> colour, colors -> colours, colored -> coloured, coloring -> colouring,
behavior -> behaviour, behaviors -> behaviours, favorite -> favourite,
favorites -> favourites, favor -> favour, honor -> honour, labor -> labour,
neighbor -> neighbour, organize -> organise, organized -> organised,
organizing -> organising, organization -> organisation, recognize -> recognise,
recognized -> recognised, customize -> customise, customized -> customised,
personalize -> personalise, prioritize -> prioritise, apologize -> apologise,
analyze -> analyse, analyzed -> analysed, capitalize -> capitalise,
categorize -> categorise, emphasize -> emphasise, summarize -> summarise,
center -> centre, centered -> centred, centers -> centres,
theater -> theatre, fiber -> fibre, liter -> litre,
defense -> defence, offense -> offence,
gray -> grey, canceled -> cancelled, canceling -> cancelling,
traveler -> traveller, modeling -> modelling, labeled -> labelled,
enroll -> enrol, fulfill -> fulfil, skillful -> skilful,
<!-- /tfx-sync:cnt13-usuk -->

Common misspellings — flagged word-boundaried, any position:
<!-- tfx-sync:cnt13-typos source -->
recieve -> receive, recieved -> received, seperate -> separate,
seperately -> separately, occured -> occurred, occurence -> occurrence,
definately -> definitely, accomodate -> accommodate, wich -> which,
teh -> the, adress -> address, calender -> calendar, cancelation -> cancellation,
existance -> existence, neccessary -> necessary, occassion -> occasion,
publically -> publicly, recomend -> recommend, refered -> referred,
succesful -> successful, tommorow -> tomorrow, untill -> until,
<!-- /tfx-sync:cnt13-typos -->

Judgment half — the evaluator proofreads for what no list catches: contextual typos and
homophones ("their/there", "form/from", "its/it's"), doubled words, wrong-word slips that
are themselves valid words, and any leftover placeholder in shipped copy.

## Evaluator guidance

Quote the offending word in every finding and give the correct spelling.

**Flag:**

- A misspelled word in user-facing copy.
- US spelling where the British form is house style ("color" → "colour", "organize" →
  "organise").
- A homophone or wrong-word slip a spell-check would miss ("form" for "from").
- A doubled word or a leftover placeholder ("TODO", "lorem").

**Do not flag:**

- A word inside quoted or waived text, a code span, or a table cell — the lint skips these;
  the evaluator does too.
- A branded, product, or ministry term with a fixed spelling (a `tfx-waive CNT-13`
  reason covers a legitimate exception).
- Grammar, word choice, sentence structure, or capitalisation — those are CNT-3, CNT-8,
  CNT-9, and CNT-12, not this control.
- A US spelling inside a quoted external source or a code identifier that must match an API
  (e.g. the CSS `color` property).

## Waiver

`rationale` (L2) — inline `tfx-waive CNT-13 reason="..."` at the deviation site. A branded
or ministry term whose fixed spelling differs from the house dialect is the canonical
waiver case.
