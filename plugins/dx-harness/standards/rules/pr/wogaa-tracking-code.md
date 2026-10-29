---
code: PR-2a
slug: wogaa-tracking-code
dss: PR-2
tier: L1
check: lint
surface: source
engine: custom
parameters:
  trackingScriptPattern: null
  customisable: null
  pages: null
---

# PR-2a: the WOGAA tracking code is present on each public page

## Statement

Each public-facing HTML page loads the Whole-of-Government Application Analytics (WOGAA) tracking code.

## Check

Applies when `trackingScriptPattern`, `customisable`, and `pages` are set. Fails a page in `pages` when no `<script>` tag has a `src` that matches `trackingScriptPattern`.

`trackingScriptPattern` is a regular expression tested against `src`. Skips when `customisable` is `false`. When any of the three parameters is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Register all public-facing digital services.
- Implement the WOGAA tracking code.
- Enable Sentiments. `PR-2c` judges this.

## Not required for

SaaS and COTS products that do not allow customisation. They still register with WOGAA. `PR-2b` covers registration.

## Rationale

The tracking code reports usage to WOGAA. A page without it sends no data.
