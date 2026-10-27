---
code: WO-8a
dss: WO-8
tier: L1
check: lint
surface: rendered
engine: axe document-title
parameters:
  pages: null
---

# WO-8a: each page has a non-empty title

## Statement

Each page has a `<title>` element that is not empty.

## Check

Fails a page that has no `<title>` element, or whose `<title>` has no text.

## Recommendations

- Write a clear, short title that describes the purpose of the page.
- Use a title such as "Budget 2024 Support Schemes Calculator".

## Not required for

None listed.

## Rationale

The title is the first thing that a screen reader announces and the label of a browser tab. `WO-8c` judges whether it describes the purpose.
