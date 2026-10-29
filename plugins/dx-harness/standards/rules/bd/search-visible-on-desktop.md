---
code: BD-2c
slug: search-visible-on-desktop
dss: BD-2
tier: L1
check: lint
surface: rendered
engine: custom
judgedRemainder: BD-2b
parameters:
  serviceType: null
  desktopViewport: 1280
  desktopHeight: 800
  searchSelector: "[role=search], input[type=search]"
  pages: null
---

# BD-2c: the search form is visible in the first screen at desktop size

## Statement

Each page that the config names shows the search form in the first screen at desktop size, without a click.

## Check

Applies only when `BD-2a` applies and the site has a search form. A site with no search form gets one finding from `BD-2a`, not one from each page. Loads each page in `pages` at a viewport `desktopViewport` pixels wide and `desktopHeight` pixels high. Fails a page when no element that matches `searchSelector` is visible within that viewport without a click, a hover, or a scroll. An element inside a collapsed menu or behind a toggle is not visible. The finding names the page.

Skips when `serviceType` is `mobile-app`, `transactional`, or `search-service`. When `serviceType` or `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Place the search form in the header, where users expect it.
- Do not hide the search form behind an icon that needs a click to open it.

## Not required for

- Mobile applications.
- Transactional services.
- Websites where search is the service offered.

## Rationale

A search form that users must hunt for does not help them. This rule decides the part that a script can measure: visibility in the first screen. `BD-2b` judges the rest of how easy the search is to find.
