---
id: CNT-1
source: TFX-DS
title: Error messages state what happened and what to do next; no raw error codes as the primary message
tier: L1
check: hybrid
phase: [implement, verify]
applies_to: [content]
verify: "Script finds error surfaces and flags raw codes; evaluator judges 'what happened -> what it means -> what to do next'"
waiver: documented
enforced: partial
script: checks/content-lint.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Every error message answers, in order: what happened, what it means for the teacher,
and what to do next. Calm and helpful in tone. Raw error codes never appear as the
primary message (they may appear as secondary detail for support).

## Rationale

Kind at Surface: gentle error states with clear next steps, never technical error
codes or dismissive generic errors. An error moment is where a tired teacher decides
whether this tool is on their side.

## Passes when

- "We could not save your notes — the connection dropped. Your draft is kept on this
  device; try again when you're back online."
- A failed action keeps the user's entered data and says so.
- Where a code aids support, it is secondary: "…contact support and quote ref 4031."

## Fails when

- "Error 500" / "Something went wrong" as the whole message.
- The message blames the user ("You entered invalid data") instead of stating the
  problem ("We don't recognise this date format — use DD/MM/YYYY").
- The message states what happened but not what to do next.
- An error discards the user's input silently.

## How to verify

Deterministic half — `checks/content-lint` (planned): find error-state strings, flag
raw codes appearing as primary copy. Judgment half — the evaluator quotes each error
message and grades it against the three questions, using the tone-by-context table in
the `content` skill (error tone: calm, helpful).
