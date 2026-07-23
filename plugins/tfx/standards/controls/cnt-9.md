---
id: CNT-9
source: TFX-DS
title: Copy is clear — one idea per sentence, simple present tense, no double negatives, no noun stacks, short words, acronyms and technical terms have a reachable definition
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [content]
verify: "Lint copy for long-word substitutions (word-list clause); evaluator judges the remaining clauses, including whether each acronym or technical term has a reachable definition (inline, tooltip, help text, or glossary — checked on the rendered surface, not just the copy string)"
waiver: rationale
enforced: partial
script: checks/content-lint.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Copy must be clear enough to parse in one read. Six mechanics enforce this:

1. **One idea per sentence.** Keep each sentence focused on a single action or fact.
2. **Simple present tense where possible.** Prefer direct, present-tense constructions:
   "Application submitted" not "Application has been submitted."
3. **No double negatives.** Use the positive form when one exists: "I want to receive
   reminders" not "I do not want to opt out of reminders."
4. **No noun stacks.** Several nouns in a row make meaning harder to scan. Use verbs
   for actions, or adjectives to describe the main noun. For example, write "Review
   support cases" instead of "Support case review."
5. **Short and simple words.** Prefer the plain form when one exists:

| Instead of | Write | Instead of | Write |
| --- | --- | --- | --- |
| attempt | try | required | need |
| inquire | ask | prior to | before |
| initiate | begin | subsequent | next |
| terminate | end | utilise | use |
| obtain | get | purchase | buy |

6. **Acronyms and technical terms have a reachable definition.** Any acronym or
   unfamiliar technical term must let a teacher find out what it means without leaving
   the task. It need *not* be expanded on first use — an inline expansion ("Special
   Educational Needs (SEN)"), a tooltip or info affordance, help text, or a glossary link
   all satisfy this. The test is that the explanation is discoverable, not where it sits.
   Established terms teachers genuinely use — "CCE", "FAS", "MOE" — need none.

This applies wherever copy appears as prose — instructional text, help copy,
confirmations, empty states, and error messages. Labels and fragments are not
sentences and are not in scope for clauses 1–3; clauses 4–6 apply to labels too.

See also: CNT-2 catches unexplained acronyms and jargon in *names* — navigation items
and page titles, at intent/plan time. Clause 6 here is the body-prose sibling: an
acronym or technical term inside running copy whose definition a teacher cannot reach.
A surface can pass CNT-2 (every name is plain) and still fail clause 6 (a body-copy
acronym with no tooltip, help text, or glossary behind it).

## Rationale

Clarity is the terminal quality goal for UI copy. These six mechanics each reduce
parse time. They are bundled under one control because they share a single test: can
a teacher understand this in one read without backtracking? A waiver on one clause
should not silently cover a failure in another, so findings must name the clause. An
acronym a teacher cannot decode stops the read as surely as a two-idea sentence, so the
reachable-definition rule belongs in the same bundle.

Bundled (not split) by analogy with CNT-3, which bundles second person, active voice,
and the 25-word ceiling under one ID. The word-list clause is the only one with a
deterministic half; the rest are judgment.

## Passes when

- "Select a class to begin." — one idea, present tense, active, no stacking.
- "Application submitted." — simple present, concise.
- "I want to receive reminders." — no double negative.
- "Review support cases." — verb for action, not a noun stack.
- "Try again." — plain word, not "Attempt to retry."
- "Special Educational Needs (SEN)", or "SEN" beside an info affordance that expands to
  the full term — the definition is reachable.

## Fails when

- A sentence packs two instructions: "Select a class and then choose a date to begin."
- Past-perfect where present fits: "The form has been submitted."
- Double negative: "Do not opt out of reminders."
- Noun stack: "Student support case review status."
- Long word with a plain substitute: "Please attempt to initiate the process."
- An acronym or technical term in body copy with no reachable definition: "Complete the
  SEN review" where nothing on the surface — no expansion, tooltip, help text, or
  glossary — tells a teacher what SEN means.

## How to verify

Deterministic half — `checks/content-lint.py` (planned extension): scan copy strings
for words in the substitution table and flag each match. Judgment half — the evaluator
reads each sentence and checks clauses 1–5 in order, then checks clause 6 against the
rendered surface (an affordance such as a tooltip counts, so the copy string alone is
not enough to judge it), as described below.

## Evaluator guidance

Quote the offending phrase in every finding. Name the clause (1–6) that was violated.
Give the rewrite.

**Flag:**

- Clause 1 — a sentence with two distinct ideas joined by "and" or a semicolon, where
  splitting would not change the meaning.
- Clause 2 — past-perfect or passive tense where a simple present alternative exists
  ("has been submitted" → "submitted"; "will be notified" → "you'll be notified").
- Clause 3 — a negated verb paired with a negated noun or negative prefix ("do not
  opt out", "cannot fail to", "not uncommon").
- Clause 4 — three or more nouns in a row where the first or middle noun could become
  a verb or adjective ("attendance report submission" → "submit the attendance report").
- Clause 5 — a word from the substitution table when the plain form fits the context.
- Clause 6 — an acronym or unfamiliar technical term in body copy with no reachable
  definition anywhere on the surface (no inline expansion, tooltip, help text, or
  glossary).

**Do not flag:**

- Settled product names, programme names, or quoted ministry text carrying a
  `tfx-waive CNT-9 reason="..."` — confirm the waiver and move on.
- Labels and fragments for clauses 1–3 — "Save", "Due date", "Class Planner" are not
  sentences.
- Technical terms with no plain equivalent — "utilise" flagged only when "use" works;
  if the technical form is the precise term, it stands.
- Established terms teachers genuinely use — "CCE", "FAS", "MOE" — which need no
  expansion (clause 6), and any term whose definition is one tooltip, help link, or
  glossary entry away.
- Deliberate past tense for tone: "Your session has ended" (closure framing) is
  acceptable when the alternative sounds abrupt. Document with a waiver.

## Waiver

`rationale` (L2) — inline `tfx-waive CNT-9 reason="..."` at the deviation site. Name
the clause being waived in the reason. Ministry-mandated verbatim text is the
canonical case.
