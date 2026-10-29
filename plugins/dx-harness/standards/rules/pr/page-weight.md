---
code: PR-7c
slug: page-weight
dss: PR-7
tier: L2
check: lint
surface: rendered
engine: Lighthouse total-byte-weight (verify against installed version)
parameters:
  pages: null
  maxPageBytes: null
---

# PR-7c: page weight is at or below the limit

## Statement

The total transfer size of a page stays at or below the limit.

## Check

Applies when `pages` and `maxPageBytes` are set. Loads each page in `pages` and sums the transfer size of every request. Fails a page when the sum is above `maxPageBytes`.

When either parameter is unset, the rule reports "not configured" and does not pass.

Lighthouse is not used. The rule sums resource timing for the page and its requests, in a fresh page after the first paint and a 500 ms settle. Each entry counts its transfer size, or its body size when the browser cache returns a transfer size of zero. A local server sends no compression, so the figure is close to the raw size. It is a lab figure and not a field measurement. The limit is a parameter.

## Recommendations

- Compress images, scripts, and style sheets.
- Remove code that the page does not use.

## Not required for

None listed.

## Rationale

Page weight drives load time on a slow network. The DSS sets no weight limit, so the parameter has no default.
