---
code: WU-4a
dss: WU-4
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  commonAbbreviations: ["PDF", "SMS"]
  abbreviationPattern: "\\b[A-Z]{2,}\\b"
  expansionElements: ["abbr"]
  pages: null
---

# WU-4a: the first use of an abbreviation is expanded

## Statement

The first use of an abbreviation on a page has an expansion.

## Check

Applies to the pages in `pages`. Finds each token that matches `abbreviationPattern` and is not in `commonAbbreviations`. Fails when its first occurrence on the page meets none of these:

- It sits inside an element listed in `expansionElements` that has a `title`.
- It follows its expansion in text, as in "Central Provident Fund (CPF)". The check accepts the bracket form when the first letters of the words before it spell the abbreviation, and it ignores small words such as "of" and "the".
- It sits in an element with an `aria-describedby` that points to a definition.

An unset `pages` reports "not configured".

## Recommendations

- Expand the abbreviation on first use, or give contextual help.
- Do not expand common abbreviations, because expansion can hinder reading.

## Not required for

- Common abbreviations such as PDF and SMS.

## Rationale

Readers who do not know an abbreviation cannot look it up in context. This check is a heuristic, and `WU-4b` judges whether the help suffices.
