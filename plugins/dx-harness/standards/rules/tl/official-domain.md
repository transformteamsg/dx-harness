---
code: TL-1a
slug: official-domain
dss: TL-1
tier: L0
check: lint
surface: project
engine: custom
parameters:
  productUrl: null
  institutionType: null
  agencySuffix: ".gov.sg"
  educationSuffix: ".edu.sg"
---

# TL-1a: the service uses an official domain

## Statement

A web-based digital service uses a `.gov.sg` domain. An education institution may use `.edu.sg`.

## Check

Reads the host of `productUrl`. Passes when the host ends with `agencySuffix`. When `institutionType` is `education`, the host may end with `educationSuffix` instead.

Also reads the host of each `<link rel="canonical">` with an absolute `href` on a page, and applies the same test, so that a page cannot declare another domain. A relative canonical link has no host and is skipped.

When `productUrl` or `institutionType` is unset, the rule reports "not configured" and does not pass. Valid values of `institutionType` are `agency` and `education`.

## Recommendations

- Register `.gov.sg` and `.edu.sg` domain names on the Whole of Government Domain Name Server (DNS) portal.
- Register them on the IT Service Management (ITSM) portal.

## Not required for

None listed.

## Rationale

Users recognise an official service by its domain. `TL-1b` judges whether the domain is registered.
