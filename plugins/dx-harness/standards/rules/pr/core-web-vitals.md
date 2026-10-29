---
code: PR-7b
slug: core-web-vitals
dss: PR-7
tier: L2
check: lint
surface: rendered
engine: Lighthouse largest-contentful-paint, cumulative-layout-shift, total-blocking-time (verify against installed version)
parameters:
  pages: null
  lcpMs: 2500
  clsMax: 0.1
  tbtMs: 200
---

# PR-7b: Core Web Vitals are within the limits

## Statement

Each page stays within the limits for Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and Total Blocking Time (TBT).

## Check

Applies when `pages` is set. Runs a lab audit of each page in `pages`. Fails a page when any of these holds:

- LCP is above `lcpMs`.
- CLS is above `clsMax`.
- TBT is above `tbtMs`.

When `pages` is unset, the rule reports "not configured" and does not pass.

Lighthouse is not used. The rule measures in the page with browser APIs, once for each page, in a fresh page after the first paint and a 500 ms settle:

- LCP is the last `largest-contentful-paint` entry. A page with no entry is not measured for LCP.
- CLS is the sum of the `layout-shift` entries that follow no recent input. It is not split into session windows.
- TBT is an estimate: the sum of the time above 50 ms of each long task that starts after the first contentful paint. It does not wait for Time to Interactive.

The run is a lab figure in a headless browser on a local server with no throttle, and is not a field measurement. A finding names one metric for one page. The limits are parameters.

## Recommendations

- Reserve space for images and embeds so the layout does not shift.
- Reduce script work on the main thread.
- Optimise with WOGAA and Google PageSpeed Insights.

## Not required for

None listed.

## Rationale

These three measures cover load, stability, and responsiveness. The limits are not in the DSS and default to the published "good" thresholds from Google.
