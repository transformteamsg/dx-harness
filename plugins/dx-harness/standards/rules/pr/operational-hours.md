---
code: PR-3c
slug: operational-hours
dss: PR-3
tier: L1
check: lint
surface: rendered
engine: custom
judgedRemainder: PR-3b
parameters:
  availability: null
  pages: null
  hoursSelector: "[data-operational-hours]"
  hoursPattern: "\\d{1,2}[:.]\\d{2}"
---

# PR-3c: a page states the operational hours when the service is not available 24/7

## Statement

When the service is not available 24/7, a page states the operational hours.

## Check

Applies when `availability` and `pages` are set. Skips when `availability` is `24/7`. Otherwise, fails when no page in `pages` has an element that matches `hoursSelector` with text that matches `hoursPattern`.

When `availability` or `pages` is unset, the rule reports "not configured" and does not pass.

The finding names the first page in `pages`. The rule checks that hours appear. `PR-3b` judges whether the hours are correct and easy to find.

## Recommendations

- State the hours in a place that users see before they start.
- Mark the element with the attribute that `hoursSelector` matches.

## Not required for

Services that are available 24/7.

## Rationale

A user who cannot tell when a service runs cannot plan around it.
