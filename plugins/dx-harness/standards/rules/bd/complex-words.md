---
code: BD-4b
slug: complex-words
dss: BD-4
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  complexWords: null
  pages: null
---

# BD-4b: words from the complex-word list are flagged

## Statement

Visible text does not use a word from `complexWords`.

## Check

Applies when `pages` is set. Extracts the visible text of each page in `pages`. Reports each word from `complexWords` with its position and the list entry. The list pairs each complex word with a simpler word, so each finding carries a suggestion.

When `complexWords` or `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Choose simple words that most people can understand.

## Not required for

None listed.

## Rationale

A word list finds specific wording that a readability grade misses. The list is a parameter, because the right words depend on the audience.
