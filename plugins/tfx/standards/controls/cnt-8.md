---
id: CNT-8
source: TFX-DS
title: Copy replaces nominalised verbs and "to be" constructions with plain action verbs
tier: L2
check: judgment
phase: [implement, verify]
applies_to: [content]
verify: "Evaluator checks prose for noun endings (-ance, -ment, -sion, -tion, -ure, etc.) paired with a 'to be' verb and flags each; quotes the noun phrase and gives the plain-verb rewrite"
waiver: rationale
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Copy must use the plain action verb instead of burying it in a noun paired with a
"to be" verb (is, are, was, were, will be). When a noun ending signals a hidden verb,
pull the verb out and use it directly.

Common noun endings and their plain verbs:

| Look for | For example | Use the verb |
| --- | --- | --- |
| -al | denial | deny |
| -ance | maintenance | maintain, keep |
| -ence | concurrence | concur, agree |
| -ment | assignment | assign |
| -sion | transmission | transmit, send |
| -tion | recommendation | recommend |
| -ure | failure | fail |

This applies to prose — instructional text, help copy, error messages, empty states,
descriptions. Labels and fragments are not in scope.

See also: CNT-3 (active voice and second person) — that control catches general
passive voice; this control targets the specific pattern of nominalisation.

## Rationale

Nominalisation hides the actor and the action. "Is a requirement" buries the verb
"require"; "are in maintenance" buries "maintain". Pulling the verb out shortens the
sentence, removes the "to be" auxiliary, and makes the actor and action explicit. A
sentence can be grammatically active and still contain a buried verb — "We made a
recommendation" is active but weaker than "We recommended". CNT-3's active-voice
clause does not catch this pattern, so a waiver on sentence length or person could
silently cover a verb-burial finding without this separate control.

## Passes when

- "You must submit the form before the deadline." (not "Submission is a requirement
  before the deadline.")
- "The system failed to save." (not "There was a failure to save.")
- "Assign the task to a teacher." (not "Be in assignment of the task.")
- "We recommend using sentence case." (not "Our recommendation is to use sentence
  case.")

## Fails when

- A "to be" verb carries a nominalised action: "is a requirement", "are in
  maintenance", "was in transmission", "will be in receipt of".
- An action is buried in a noun when the plain verb is available: "give a
  recommendation" instead of "recommend", "make an assignment" instead of "assign".
- A noun ending (-tion, -ment, -ure, etc.) appears next to a "to be" verb in prose
  where the verb could replace the construction.

## How to verify

Judgment only — there is no deterministic half. The evaluator scans prose for "to be"
verbs (is, are, was, were, will be, be) followed by or paired with a noun whose
ending appears in the table above. For each, check whether pulling the verb out
produces a shorter, more direct sentence.

## Evaluator guidance

Quote the offending phrase in every finding and give the plain-verb rewrite.

**Flag:**

- A "to be" verb + nominalised noun where the underlying verb exists and fits the
  context: "is a requirement" → "require", "are in agreement" → "agree",
  "was in failure" → "failed".
- An action buried in a noun even without a "to be" verb, when the verb is shorter
  and clearer: "make a recommendation" → "recommend", "provide an explanation" →
  "explain".

**Do not flag:**

- Proper nouns that happen to end in a matching suffix: "Education", "Singapore",
  "Glow", "Transmission" (product or programme names). These are identities, not
  nominalised verbs.
- Quoted ministry or programme text that must appear verbatim and carries an inline
  `tfx-waive CNT-8 reason="..."`.
- Cases where the noun form is the natural, established term and pulling the verb out
  would sound unnatural or change the meaning (rare — document the exception with a
  waiver).
- Labels and fragments: "Save", "Class assignment", "Due date" are not prose sentences
  and are not in scope.

## Waiver

`rationale` (L2) — inline `tfx-waive CNT-8 reason="..."` at the deviation site.
Verbatim ministry or programme text is the canonical waiver case.
