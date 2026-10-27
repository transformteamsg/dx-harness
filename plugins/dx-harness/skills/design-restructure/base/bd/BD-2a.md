---
code: BD-2a
dss: BD-2
tier: L1
check: lint
surface: project
engine: custom
parameters:
  serviceType: null
---

# BD-2a: a multi-page site has a search form

## Statement

A site with more than one page has a search form.

## Check

Applies when `serviceType` is set and the project has two or more pages. Fails when no page has an element with `role="search"` or an `<input type="search">`.

Skips when `serviceType` is `mobile-app`, `transactional`, or `search-service`. When `serviceType` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Provide a search function such as SearchSG, and make it accessible and discoverable.
- Review search analytics regularly to improve search.

## Not required for

- Mobile applications.
- Transactional services.
- Websites where search is the service offered.

## Rationale

Users of a multi-page site find content faster with search than by browsing. `BD-2b` judges how easy the search is to find.
