---
code: WO-8d
slug: page-titles-unique
dss: WO-8
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: [WO-8c, BD-5b]
parameters:
  genericTitles: [Untitled, Home, Page, Document, New Tab]
---

# WO-8d: page titles are unique and not generic

## Statement

No two pages share a title, and no title is a generic word.

## Check

Fails two or more pages with the same title. Fails a page whose title, compared without case, equals a value in `genericTitles`.

## Recommendations

- Start each title with the page purpose.
- Add the site name after the page purpose.

## Not required for

None listed.

## Rationale

A repeated or generic title does not tell pages apart. The rule finds these titles. `WO-8c` and `BD-5b` judge whether a title describes the purpose of its page.
