---
code: TL-2a
slug: logo-top-left-links-home
dss: TL-2
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  logoSelector: null
  homepagePath: "/"
  maxLogoTop: 200
  logoHalf: "left"
---

# TL-2a: the logo is at the top left and links to the homepage

## Statement

Every page shows the agency or initiative logo at the top left. The logo links to the homepage.

## Check

Finds the element that matches `logoSelector` on each page. Fails when any of these holds:

- No element matches.
- The element is not in the `logoHalf` of the viewport.
- The top of the element is more than `maxLogoTop` pixels from the top of the page.
- The element is not inside a link to `homepagePath`.

When `logoSelector` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Render the logo clearly, without distortion or pixellation. `TL-2b` checks this.

## Not required for

None listed.

## Rationale

A logo in a fixed position tells users which organisation runs the service. `TL-2c` judges whether it is the right logo.
