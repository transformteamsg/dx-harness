---
code: WU-13a
dss: WU-13
tier: L2
check: lint
surface: project
engine: custom
judgedRemainder: WU-13b
parameters:
  flows: null
  confirmFields: ["confirm-password", "confirm-email", "new-password"]
---

# WU-13a: a field does not repeat across the steps of a flow

## Statement

A field that a user fills in at one step of a flow does not appear again at a later step of the same flow.

## Check

Applies when `flows` lists flows, each with its ordered pages. For each flow, collects the `autocomplete` token, or the `name` when there is no token, of every field on every page. Reports a field that appears on two or more pages. Skips a field whose name or token is in `confirmFields`.

The rule finds candidates and does not decide. It warns and never blocks. `WU-13b` judges whether a repeat is essential.

When `flows` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Fill in a repeated field automatically, or let the user select the earlier value.
- Ask for a value again only when it is essential, such as when you confirm a new password.

## Not required for

- Re-entering information that is essential.
- Re-entering information for security, such as a password.
- Information that is no longer valid.

## Rationale

Re-entering data takes effort and causes mistakes, in particular for users with memory or motor difficulty.
