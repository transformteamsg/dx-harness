---
code: UU-1c
dss: UU-1
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: UU-1b
parameters:
  researchRecordPath: null
---

# UU-1c: a research record exists

## Statement

The project holds a research record of users' needs and context, and the record is not empty.

## Check

Fails when no file exists at `researchRecordPath`, or when the file is empty or holds only whitespace.

When `researchRecordPath` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Record who the users are, what they need, and the context in which they use the service.
- Keep the record in the repository so that the team can find it and update it.

## Not required for

None listed.

## Rationale

A team cannot show that it understands its users without a record. The check tests presence, not quality. `UU-1b` judges whether the record documents users, needs, and context.
