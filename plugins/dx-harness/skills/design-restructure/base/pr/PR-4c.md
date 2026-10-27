---
code: PR-4c
dss: PR-4
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: PR-4b
parameters:
  noticeSelector: "[data-downtime-notice]"
  requiredFields: ["date", "time", "duration", "reason", "affectedFeatures"]
  pages: null
---

# PR-4c: a downtime notice carries each required field

## Statement

A downtime notice carries the date, time, duration, reason, and affected features.

## Check

Applies when `pages` is set. This check finds candidates and does not decide. It warns and never blocks.

For each page in `pages`, the rule finds each element that matches `noticeSelector`. It warns on a notice that has no text for one of the fields in `requiredFields`. A field has text when a child element marked `data-field="<field>"` has text, or when the notice has the label of the field followed by a colon and text. The label is the field name split into lower-case words, so `affectedFeatures` has the label "affected features".

When `pages` is unset, the rule reports "not configured" and does not pass. A page with no matching element has no notice, so the rule has nothing to check there.

The rule cannot decide whether the text is accurate or clear. `PR-4b` covers that.

## Recommendations

- Name each field in the notice.
- Mark the notice with the attribute that `noticeSelector` matches.

## Not required for

None listed.

## Rationale

A notice that omits a field leaves the user to guess. A script finds the gap but cannot read the meaning.
