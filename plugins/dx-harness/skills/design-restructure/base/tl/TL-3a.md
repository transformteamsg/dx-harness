---
code: TL-3a
dss: TL-3
tier: L0
check: lint
surface: rendered
engine: custom
parameters:
  bannerPages: null
  productUrl: null
  customisable: null
  bannerSelector: ".sgds-masthead"
---

# TL-3a: the Official Government Banner is the topmost component of every page

## Statement

Every page of a `.gov.sg` service shows the Official Government Banner as its topmost component.

## Check

Loads each page in `bannerPages`. Applies when the host of `productUrl` ends with `.gov.sg`. Fails a page when any of these holds:

- No element matches `bannerSelector`.
- The element is not the first rendered component in the `<body>`.
- The element is not visible at the top of the page.

Skips when `customisable` is `false`. When `productUrl` or `customisable` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use the Singapore Government Design System (SGDS) "Official Government Banner" component. `TL-3b` checks this.

## Not required for

SaaS and COTS products that do not allow customisation. The config sets `customisable` to `false` for these.

## Rationale

The banner tells users that the site is an official government site. `TL-1a` covers the domain.
