---
code: BD-4a
slug: readability-grade
dss: BD-4
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  maxGrade: null
  locale: null
  contentSelector: "main p, main li, article p, article li"
  exemptSelector: "[data-legal], [data-readability-exempt]"
  pages: null
---

# BD-4a: readability grade of each text block is at or below the limit

## Statement

Each block of visible body text has a readability grade at or below `maxGrade`.

## Check

Applies when `pages` is set. Extracts the visible text of each element in each page that matches `contentSelector`, and skips an element that matches `exemptSelector`. Tests only blocks with at least 20 words. Computes the Flesch-Kincaid grade level. Fails a block with a grade above `maxGrade`.

The formula applies to English only. When `locale` is not an English locale, or when `maxGrade`, `locale`, or `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use readability measures such as the Flesch Reading Ease score or the Flesch-Kincaid grade level to find text to simplify.
- Confirm clarity with user testing. `BD-4c` judges this.

## Not required for

None listed.

## Rationale

The DSS asks for content that most people can read and understand. A grade level finds the blocks most likely to fail that aim.
