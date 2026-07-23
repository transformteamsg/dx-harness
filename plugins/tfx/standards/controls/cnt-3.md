---
id: CNT-3
source: TFX-DS
title: Copy uses second person and active voice, and keeps sentences to 25 words or fewer
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [content]
verify: "Lint sentence length; evaluator judges voice and person"
waiver: rationale
enforced: partial
script: checks/content-lint.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

UI copy addresses the user directly in second person ("you", "your") and uses active
voice. Sentences are 25 words or fewer. These mechanics are enforced wherever copy
appears as prose — instructional text, help copy, confirmation messages, empty states,
and error messages. Labels and fragments are not sentences and are not in scope for
the word-count or voice rules.

See also: CNT-7 (descriptive copy leads with its purpose before the mechanism) —
split out of this control on 2026-07-03; the purpose rule for titles, descriptions,
and intros lives there now.

## Rationale

Teachers read UI copy at a glance, between other tasks. Long passive sentences make
the user decode the message before acting on it. Second person and active voice keep
the interface conversational and directive: it is clear who does what. The 25-word
ceiling is a lintable proxy for clarity — it does not guarantee good copy, but it
reliably prevents run-on explanations that belong in documentation, not UI.

## Passes when

- Instructions address the user directly: "Select a class to begin."
- Active voice: "We could not save your notes." (not "Your notes could not be saved.")
- No sentence exceeds 25 words.
- Settled product names and quoted programme text carrying a waiver appear verbatim
  without triggering a flag.

## Fails when

- Passive instructions: "The form should be submitted before the deadline."
- Third-person reference to the user: "Teachers can export their class list."
- A sentence exceeds 25 words.
- Second-person is absent throughout a screen's instructional copy.

## How to verify

Deterministic half — `checks/content-lint` (planned): tokenise copy strings, count
words per sentence, exit 1 on sentences > 25 words. Judgment half — the evaluator
reads the copy for person and voice, as described below.

## Evaluator guidance

Quote the offending sentence in every finding. Do not paraphrase.

**Flag**:

- Passive-voice instructions: "The form should be submitted", "Attendance can be
  marked here", "Students will be notified".
- Third-person references to the user: "Teachers can…", "Users must…", "Staff
  should…".
- Any sentence exceeding 25 words (the lint check catches these, but flag on sight
  if the check has not run).

**Do not flag**:

- Settled product names (Teacher Workspace, CaseSync, Glow, SEAB, CCE) — these are
  identities, not copy failures.
- Quoted ministry or programme text: copy that must appear verbatim and carries an
  inline `tfx-waive CNT-3 reason="..."` is out of scope — confirm the waiver is
  present and move on.
- Labels and fragments: "Save", "Class Planner", "Due date" are not sentences and
  the 25-word and voice rules do not apply.
- Passive voice used for genuine tone reasons in a negative or sensitive context
  ("Your account has been suspended" is intentionally distancing — prefer active
  reframes, but do not flag if the tone is deliberate and documented).

## Waiver

`rationale` (L2) — inline `tfx-waive CNT-3 reason="..."` at the deviation site.
Ministry-mandated copy that must appear verbatim is the canonical waiver case.
