---
id: CNT-6
source: TFX-DS
title: Copy carries no low-informational-value words — no empty openers, filler words, or droppable articles and conjunctions, unless removing them hurts clarity
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [content]
verify: "Lint flags sentence-initial empty openers (There is, There are, It is, This is) and the safe filler subset (just, really, very, please); evaluator judges the context-dependent words (such, that, articles and conjunctions) and the clarity exception"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Remove words with low informational value ONLY if it does not reduce clarity and
readability:

- Empty openers (e.g. "There is," "There are," "It is," "This is," and "In order to")
- Filler words (e.g. "such," "just," "that," "really," "very," and "please")
- Articles and conjunctions (e.g. "a," "the," "and")

Applies to all user-facing copy: instructions, helper text, error messages, empty
states, confirmations.

## Rationale

Teachers scan the interface between other tasks, and every no-information word is
scan cost — an empty opener delays the point of the sentence; filler blurs the
instruction it decorates. Removing them is the cheapest clarity gain available,
which is why the rule carries its own exception: cut only when clarity survives.

Boundary with SLP-9: SLP-9 catches how AI writing sounds — buzzwords, phrase
filler, negative parallelism, copula avoidance, forced triads. CNT-6 catches no-op
words in any copy regardless of author. The lint lists stay disjoint, so one token
never fires two controls; a string can fail both, but never twice for the same
words.

## Passes when

- "Incorrect postal code. Enter valid postal code e.g. 310480." (openers and filler
  already cut)
- "Save marks. Marks are saved as a draft until you submit."
- "Please note this action cannot be undone" rewritten as "This can't be undone."
- A retained word is doing real work: "Please" softening a sensitive moment, "that"
  needed for the sentence to parse.

## Fails when

- "There is a problem with your form." ("A field needs your attention" says it
  sooner.)
- "Just enter your postal code to really get started." (filler carrying no meaning)
- "It is required that you select a class." ("Select a class.")

## How to verify

**Deterministic half (lint):** `checks/content-lint.py` reads two marker-delimited
lists from this file at runtime, so the lint and the catalog never diverge.

Empty openers — flagged only at the start of a sentence:
<!-- tfx-sync:cnt6-openers source -->
there is, there are, it is, this is
<!-- /tfx-sync:cnt6-openers -->

Filler words — flagged word-boundaried, any position:
<!-- tfx-sync:cnt6-filler source -->
just, really, very, please
<!-- /tfx-sync:cnt6-filler -->

Deliberately NOT in the lint lists:

- "In order to" — already on SLP-9's filler-phrase list, which flags it anywhere in
  a sentence; listing it here too would fire two controls on one token. It remains
  part of this control's requirement for human readers.
- "such," "that," and the articles and conjunctions ("a," "the," "and") — far too
  context-dependent to lint; a scan of every "the" would be all noise. These are
  the evaluator's half, together with the clarity exception on every hit.

**Evaluator half:** the harder calls need judgment — see below.

## Evaluator guidance

Quote the offending copy in every finding, and show the cut version so the clarity
exception can be judged on the spot.

**Flag:**

- A sentence-initial empty opener where the sentence reads fine without it.
- Filler words (such, just, that, really, very, please) that can be deleted with no
  loss of meaning.
- Droppable articles and conjunctions in space-tight surfaces (labels, buttons,
  table headers) where the fragment reads cleanly without them.

**Do not flag:**

- Any cut that hurts clarity or readability — the exception is part of the rule,
  not a waiver.
- "Please" softening a sensitive or destructive moment; kindness is doing work
  there (Kind Utility).
- "That" as a relative pronoun the sentence needs to parse ("the class that meets
  on Mondays").
- "It is" / "This is" openers carrying real weight ("This is permanent." in a
  destructive confirmation).
- Words inside quoted or waived text, code spans, and tables — the lint already
  skips these; the evaluator does too.

This is L2 — a deliberate deviation carries an inline rationale
(`tfx-waive CNT-6 reason="..."`), not a rewrite war.
