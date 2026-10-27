---
code: TL-3b
dss: TL-3
tier: L1
check: lint
surface: source
engine: custom
parameters:
  pages: null
  productUrl: null
  customisable: null
  bannerSelector: ".sgds-masthead"
  bannerText: "A Singapore Government Agency Website"
---

# TL-3b: the banner is the SGDS component

## Statement

The banner comes from the SGDS "Official Government Banner" component, with its text intact.

## Check

Applies when the host of `productUrl` ends with `.gov.sg`. Reads the HTML page files that `pages` lists. Fails a template when any of these holds:

- No element matches `bannerSelector`.
- The element does not contain `bannerText`.
- The element has an inline `style` attribute.

Skips when `customisable` is `false`. When `productUrl` or `customisable` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Import the component from the SGDS package. Do not copy its markup.

## Not required for

SaaS and COTS products that do not allow customisation. The config sets `customisable` to `false` for these.

## Rationale

A copy that drifts from the component no longer matches the banner that users know. `TL-3a` checks position.
