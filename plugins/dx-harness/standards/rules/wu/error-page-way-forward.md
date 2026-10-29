---
code: WU-11a
slug: error-page-way-forward
dss: WU-11
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  errorPages: null
  requireHeading: true
  requireRecoveryLink: true
---

# WU-11a: system error pages give a way forward

## Statement

Each system error page states the error and links to a next step.

## Check

Applies when `errorPages` is set to a list of paths such as 404 and 500. Fails a page when any of these holds:

- It has no `<h1>` and `requireHeading` is `true`.
- It has no link to the home page, to search, or to a contact channel and `requireRecoveryLink` is `true`.

An unset `errorPages` reports "not configured".

## Recommendations

- Explain what went wrong in plain language.
- Say how to fix the problem, or what to do instead.

## Not required for

None listed.

## Rationale

A dead end gives users no recovery. `WU-11b` judges the wording of each message.
