---
code: WU-10d
dss: WU-10
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: [WU-10c, WU-11b]
parameters:
  genericErrors: ["invalid input", "an error occurred", "something went wrong", "error", "failed"]
  errorSelector: "[role=alert], [aria-invalid=true] ~ *, .error"
  failureFixtures: null
---

# WU-10d: an error message is not a generic message

## Statement

An error message names the cause and does not use a generic phrase.

## Check

Applies when `failureFixtures` lists the pages or states that show an error. For each fixture, reads the text of each element that matches `errorSelector`. Reports a message whose trimmed, lower-case text equals a value in `genericErrors`, or that consists only of such a value and punctuation.

The rule finds candidates and does not decide. It warns and never blocks. `WU-10c` judges whether the text identifies the cause.

When `failureFixtures` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- State which field or step failed and why.
- State what the user can do next.

## Not required for

None listed.

## Rationale

A generic message does not tell users what went wrong. The same finding serves `WU-11b`, which judges whether a message is plain and gives a next step. `WU-10c` and `WU-11b` still judge the wording that a list cannot decide.
