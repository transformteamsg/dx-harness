---
id: CMP-2
source: TFX-DS
title: Destructive actions show consequences before executing and offer undo or explicit confirmation
tier: L0
check: hybrid
phase: [plan, implement, verify]
applies_to: [flow, component]
verify: "Script enumerates destructive actions and asserts a consequence + undo/confirm surface exists; evaluator judges the consequence copy is plain and complete"
waiver: none
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Before any destructive action executes (delete, overwrite, send, withdraw, anything
hard to reverse), show the user plainly what will happen — and either make it
undoable or require explicit confirmation. Prefer undo over confirm where the action
is reversible; confirm with plain consequences where it is not.

## Rationale

This is the "Safe" quality of Kind Utility made checkable: confidence to explore
without fear, forgiving interfaces, clear consequences before destructive actions.
A teacher who loses casework or a term's marks to a misclick loses trust in the whole
portfolio. That is why it is L0 — never waivable.

## Passes when

- Each destructive action surfaces its consequence in plain language before
  execution ("This deletes 3 student notes. This cannot be undone.").
- Reversible actions execute immediately with a visible, reachable undo.
- Irreversible actions require explicit confirmation that names the object and the
  consequence — sober and precise in tone, no drama (see tone-by-context in the
  `content` skill).

## Fails when

- Delete executes on single click with no undo and no confirmation.
- The confirmation is generic ("Are you sure?") and names neither the object nor the
  consequence.
- Undo exists but disappears too fast to use, or is only reachable via keyboard.
- The "confirm" pattern is used for a trivially reversible action (confirm fatigue
  trains users to click through).

## How to verify

Deterministic half — `checks/destructive` (planned): enumerate destructive actions in
the changed surface, assert each has a consequence + undo/confirm surface. Judgment
half — the evaluator quotes the consequence copy and grades it against: names the
object, states the consequence, says whether it is reversible. L0: a failure here
blocks output, full stop.
