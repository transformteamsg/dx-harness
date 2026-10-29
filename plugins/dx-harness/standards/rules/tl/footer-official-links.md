---
code: TL-4a
slug: footer-official-links
dss: TL-4
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  productUrl: null
  transactionalPages: null
  footerSelector: "footer"
  footerLinks: ["Contact", "Feedback", "FAQ", "Sitemap", "Report Vulnerability", "Privacy Statement", "Terms of Use"]
  conditionalLinks: ["FAQ", "Sitemap"]
  hasFaq: null
  hasSitemap: null
---

# TL-4a: the footer carries the official links in order

## Statement

Every page of a `.gov.sg` service has the Official Global Footer with the required links, in order.

## Check

Applies when the host of `productUrl` ends with `.gov.sg`. Skips each page listed in `transactionalPages`. Fails a page when any of these holds:

- No element matches `footerSelector`.
- The footer lacks a link whose text matches an entry of `footerLinks`.
- The matched links are not in the order of `footerLinks`.
- A link has an empty `href`, or an `href` of `#`.

An entry in `conditionalLinks` is required only when the matching parameter, `hasFaq` or `hasSitemap`, is `true`. The Contact link is the contact channel that `BD-9a` expects.

When `productUrl`, `transactionalPages`, `hasFaq`, or `hasSitemap` is unset, the rule reports "not configured" and does not pass. An empty list in `transactionalPages` means no page is exempt.

## Recommendations

- Use the basic footer from SGDS.

## Not required for

Pages that are part of transactional services. The config lists them in `transactionalPages`.

## Rationale

A footer in a fixed order lets users find contact, privacy, and terms content on any government site. `TL-4c` judges where each link leads.
