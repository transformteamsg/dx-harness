---
code: BD-2d
dss: BD-2
tier: L1
check: lint
surface: rendered
engine: custom
judgedRemainder: BD-2b
parameters:
  serviceType: null
  pages: null
  searchSelector: "[role=search], input[type=search]"
  headerSelector: "header, [role=banner]"
  positionTolerancePx: 40
---

# BD-2d: the search form is on every page, in the header, in the same place

## Statement

Each page that the config names has the search form in the header region, and the form keeps its position from page to page.

## Check

Applies only when `BD-2a` applies and the site has a search form. A site with no search form gets one finding from `BD-2a`, not one from each page. Loads each page in `pages`. Fails a page when any of these holds:

- No element that matches `searchSelector` is on the page.
- The element has no ancestor that matches `headerSelector`.
- The top-left corner of the element differs by more than `positionTolerancePx` pixels from its position on the first page, at the same viewport width.

Skips when `serviceType` is `mobile-app`, `transactional`, or `search-service`. When `serviceType` or `pages` is unset, the rule reports "not configured" and does not pass.

The default of `positionTolerancePx` is not from the DSS. A product can change it.

## Recommendations

- Show the search form on every page, fully visible in the header.
- Keep the form in the same place on every page.

## Not required for

- Mobile applications.
- Transactional services.
- Websites where search is the service offered.

## Rationale

Users look for search where they found it before. A form that moves, or appears on some pages only, costs them a second search for the form. The DSS asks for search that is easy to access and discover. `BD-2b` judges whether users find it.
