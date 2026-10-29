---
code: WU-7b
slug: navigation-visible-on-desktop
dss: WU-7
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  navSelector: "nav[aria-label], [role=navigation]"
  desktopViewport: 1280
  desktopHeight: 800
  pages: null
---

# WU-7b: main navigation is visible on desktop

## Statement

The main navigation links are visible on the first screen at desktop size, with no click.

## Check

Applies when `pages` is set. Loads each page at `desktopViewport` by `desktopHeight` pixels. Fails when the navigation that matches `navSelector` has links that are not visible in the first screen without a click or a hover. A side navigation passes.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Do not hide the main navigation in an icon on desktop.

## Not required for

None listed.

## Rationale

A hidden menu costs desktop users an extra step on every page.
