---
code: WO-10b
slug: anchor-content
dss: WO-10
tier: L1
check: lint
surface: source
engine: jsx-a11y anchor-has-content
parameters: {}
---

# WO-10b: each anchor has content in source

## Statement

Each `<a>` element has content.

## Check

Fails an `<a>` element with no children and no accessible label.

## Recommendations

- Put the link text inside the anchor.

## Not required for

None listed.

## Rationale

The source check finds an empty anchor before the page is built.
