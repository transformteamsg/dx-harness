---
id: CNT-4
source: TFX-DS
title: Content that models a real-world artifact is faithful to it (scope, terminology, structure) or explicitly labelled illustrative
tier: L2
check: judgment
phase: [intent, implement, verify]
applies_to: [content]
verify: "Evaluator + named domain reviewer sign-off before user testing, or the illustrative label present in-product and in the decision record"
waiver: rationale
fails_when:
  - a curriculum/subject/level detail a practitioner would recognise as wrong (e.g. a subject graded at a level where it isn't taught)
  - invented specifics presented as real in a user-testing surface
  - placeholder content with no illustrative label
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

When a surface presents content that models a real-world artifact — a curriculum, a
form, a policy document, a report — the content must be faithful to that artifact:
correct scope, terminology, and structure. Where full fidelity is not yet available,
the content must be explicitly labelled illustrative or placeholder, in-product and in
the decision record. "Format is right but the specifics are invented" is a fail for any
surface used in user testing, because testers judge credibility on the specifics, not
the shell.

## Rationale

The triggering incident: a mock P1 report graded learning outcomes for Science (which
starts at P3 in Singapore, not P1) and showed a P1 Mathematics learning outcome
"Statistics & Probability" — both read as fake to a real P1 teacher. The Science case
was caught and fixed by hand; the wording case remained flagged as illustrative pending
HOD confirmation. Two evaluator passes graded this ad hoc against the sprint contract
because no control named the failure mode — a naming/voice/tone-clean surface can still
read as fake if the domain details inside it are wrong. CNT-1..3 grade error anatomy,
naming, and voice mechanics; none of them checks whether the *content* is true to the
thing it claims to model.

## Passes when

- A domain detail matches the real-world artifact it models (correct level, subject,
  terminology, structure) — verifiable against the source, or by a named domain
  reviewer.
- Content that cannot yet be verified is explicitly labelled illustrative/placeholder,
  both in the UI and in the decision record.
- A named domain reviewer (e.g. a Head of Department) has signed off before the surface
  is shown to real practitioners for user testing.

## Fails when

- A curriculum/subject/level detail a practitioner would recognise as wrong — e.g. a
  subject graded at a school level where it is not taught.
- Invented specifics presented as real in a surface used for user testing, with no
  illustrative label.
- Placeholder content ships with no label at all, so a tester cannot tell it from real
  data.

## Evaluator guidance

Judgment, with a domain-reviewer dependency the evaluator cannot substitute for: read
the content against the real-world artifact it claims to model (a national curriculum,
a form, a policy). Where the evaluator lacks the domain expertise to judge a detail
directly — most curriculum specifics will be exactly this — say so and flag the item
for a named domain reviewer rather than guessing. Confirm either (a) a named domain
reviewer's sign-off is recorded before the surface reaches user testing, or (b) the
content carries an explicit illustrative/placeholder label, in-product and in the
decision record. A surface with neither is a finding regardless of how polished it
otherwise reads.

## Do not flag

- Content explicitly labelled illustrative/placeholder, in-product and in the decision
  record — the label is the control working as intended, not a defect to chase away.
- A detail that looks unusual to a non-specialist evaluator but carries a named domain
  reviewer's recorded sign-off. The reviewer's judgment settles the question; do not
  override it with a generalist read.
- Settled, verified reference facts restated verbatim from an authoritative source
  (e.g. a quoted syllabus line) — the fidelity requirement is about invented specifics,
  not about the source material itself.
