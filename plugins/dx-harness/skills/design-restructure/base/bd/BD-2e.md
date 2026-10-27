---
code: BD-2e
dss: BD-2
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: BD-2b
parameters:
  serviceType: null
  pages: null
  searchInputSelector: "input[type=search], [role=search] input"
  minChars: 27
  maxTabStops: 5
---

# BD-2e: the search input is wide enough and early in the tab order

## Statement

The search input fits `minChars` characters, and a keyboard user reaches it within `maxTabStops` tab stops.

## Check

Applies only when `BD-2a` applies and the site has a search form. A site with no search form gets one finding from `BD-2a`, not one from each page. Loads each page in `pages`. Finds candidates when any of these holds:

- The width of the element that matches `searchInputSelector` is less than the width of `minChars` characters in the font of the input.
- The input is the `maxTabStops` plus first tab stop or later.

The rule finds candidates and does not decide. It warns and never blocks.

Skips when `serviceType` is `mobile-app`, `transactional`, or `search-service`. When `serviceType` or `pages` is unset, the rule reports "not configured" and does not pass.

The defaults are not from the DSS. The width of 27 characters comes from usability guidance that is attributed to the Nielsen Norman Group, and the number of tab stops has no published source. A product can change both.

## Recommendations

- Make the input wide enough that a typical query does not scroll.
- Place the search form early in the page, so keyboard users reach it quickly.

## Not required for

- Mobile applications.
- Transactional services.
- Websites where search is the service offered.

## Rationale

A narrow input hides most of a query, and a late tab stop costs keyboard users many key presses. These measures stand in for easy to find. `BD-2b` judges the rest.
