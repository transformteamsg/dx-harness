---
code: PR-1b
slug: review-date-current
dss: PR-1
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: PR-1a
parameters:
  lastReviewDate: null
  reviewIntervalDays: null
  reviewDateFile: ""
---

# PR-1b: the review date in the config is not older than the interval

## Statement

The product config records the date of the last service review, and that date is not older than the review interval.

## Check

Applies when `lastReviewDate` and `reviewIntervalDays` are set. Fails when today's date minus `lastReviewDate` is greater than `reviewIntervalDays` days, or when `lastReviewDate` is not a valid date.

When either parameter is unset, the rule reports "not configured" and does not pass.

When `reviewDateFile` names a JSON file under the project root and the file holds `lastReviewDate`, the rule reads the date from the file instead of the config. An empty `reviewDateFile` reads the config only.

The rule checks the recorded date only. It does not decide whether a review took place. `PR-1a` covers that.

## Recommendations

- Review the service at the interval that the DSS sets.
- Update `lastReviewDate` when a review ends.

## Not required for

None listed.

## Rationale

A stale date shows that a review is overdue. A current date does not prove that a review happened, so `PR-1a` stays out of scope for the design linter.
