---
code: WU-7a
slug: consistent-navigation-order
dss: WU-7
tier: L1
check: lint
surface: project
engine: custom
parameters:
  navSelector: "nav[aria-label], [role=navigation]"
  pages: null
---

# WU-7a: main navigation links keep the same order on every page

## Statement

The links of the main navigation appear in the same order on every page.

## Check

Applies when `pages` is set. Reads the links inside the first element that matches `navSelector` on each page. Fails when the order of link targets differs between two pages. A page may add or drop a link: the check compares the order of the targets that the two pages share.

A page with no match fails. An unset `pages` reports "not configured".

## Recommendations

- Keep the main navigation at or near the top of the site.
- Test the navigation with users.

## Not required for

None listed.

## Rationale

Users learn where a link sits and expect it there. `WU-7b` checks placement and `WU-7c` judges the result with users.
