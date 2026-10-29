---
code: CMP-5a
slug: one-primary-action
dss: CMP-5
tier: L2
check: lint
surface: source
engine: custom
judgedRemainder: CMP-5b
parameters:
  primarySelector: null
  regionSelector: "main, form, dialog, [role=dialog], [role=toolbar], section, aside"
  destructivePatterns: ["delete", "remove", "discard", "withdraw", "erase"]
---

# CMP-5a: a region has no more than one primary action, and no destructive primary

## Statement

Each view or region has one primary action at most. The primary action is never destructive.

## Check

Reads each HTML page. A primary action is an element that matches `primarySelector`. Its region is the nearest ancestor that matches `regionSelector`, or the page when it has none. Fails a region that holds more than one primary action. Fails a primary action whose text or `aria-label` contains one of `destructivePatterns`, as a case-insensitive substring.

`primarySelector` and `regionSelector` are each one compound selector or a comma list, with no combinator.

When `primarySelector` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Give the primary action the filled style, and step the other actions down to outline, ghost, or link styles.
- Give a destructive action its own destructive style, with the confirmation of `CMP-2a`.

## Not required for

- A deliberate pair of equal actions, such as **Approve** and **Reject**. Record the pair with a waiver that states the reason.

## Rationale

When two buttons in one view both read as the main action, the user stops to choose. This rule counts the primary actions in each region. `CMP-5b` judges where a region starts and ends, and whether two primary actions are a deliberate pair.
