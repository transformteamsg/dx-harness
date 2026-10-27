---
code: WO-11b
dss: WO-11
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: WO-11a
parameters:
  minWays: 2
  wayKinds: [navigation, search, sitemap, index]
  serviceType: null
---

# WO-11b: the site offers at least two ways to reach content

## Statement

A multi-page site offers at least two ways to reach its content: navigation, search, a sitemap page, or an A-Z index.

## Check

Applies when `serviceType` is set and the project has two or more pages. Counts the kinds in `wayKinds` that the project provides. Fails when the count is below `minWays`.

A kind counts when the project has the matching element:

- `navigation`: a `<nav>` element or an element with `role="navigation"`.
- `search`: an element with `role="search"` or an `<input type="search">`.
- `sitemap`: a page whose path or title names a sitemap.
- `index`: a page whose path or title names an A-Z index.

Skips when `serviceType` is `single-page` or `transactional`. When `serviceType` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Add search to a site that has only navigation.
- Link a sitemap page from the footer.

## Not required for

- A single-page service.
- A transactional service.

## Rationale

Users reach content in different ways. The rule counts the ways. `WO-11a` judges whether the ways reach the same content.
