---
code: TL-4b
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
  ownerName: "Government of Singapore"
  currentYear: null
---

# TL-4b: the footer carries the copyright statement

## Statement

The footer ends with the copyright statement in the form "© YYYY, Government of Singapore".

## Check

Applies when the host of `productUrl` ends with `.gov.sg`. Skips each page listed in `transactionalPages`. Fails a page when the text of the `footerSelector` element does not contain `© <currentYear>, <ownerName>`.

`currentYear` defaults to the year of the run date when the config sets it to `auto`. A statutory board sets `ownerName` to the agency name.

When `productUrl`, `transactionalPages`, or `currentYear` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Generate the year at build time. Do not type it by hand.

## Not required for

Pages that are part of transactional services. The config lists them in `transactionalPages`.

## Rationale

The statement names the owner of the content. `TL-4a` checks the links.
