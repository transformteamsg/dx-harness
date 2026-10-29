---
code: CMP-8a
slug: exit-on-each-step
control: CMP-8
tier: L1
check: lint
surface: rendered
engine: custom
judgedRemainder: CMP-8b
parameters:
  flows: null
  exitPatterns: ["cancel", "back", "previous", "exit", "save and close"]
---

# CMP-8a: each step of a multi-step flow has a visible exit

## Statement

Each step of a multi-step task offers a visible way to leave that does not destroy the work.

## Check

Applies when `flows` maps each flow name to the ordered paths of its pages, the same shape as `WU-12a` reads. Loads each page of each flow. Fails a page that has no visible button or link whose accessible name contains one of `exitPatterns`, as a case-insensitive substring.

When `flows` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Put the exit control where the user expects it, near the other controls of the step.
- A quiet style for the exit control is correct. It need not compete with the primary action.

## Not required for

- A form of one step that is not destructive and has an obvious exit.

## Rationale

A user who cannot leave a step without losing work closes the browser and loses it anyway. `CMP-8b` judges whether the work survives an interruption, and whether a discard is a choice that the user confirms.
