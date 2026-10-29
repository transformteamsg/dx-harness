---
code: PR-6a
slug: browser-support-list
dss: PR-6
tier: L1
check: lint
surface: project
engine: custom
parameters:
  minBrowsers: null
  browserSupportSource: ["browserslist", "package.json", ".browserslistrc"]
---

# PR-6a: the browser support list is declared and meets the minimum

## Statement

The project declares the browsers it supports, and the list names at least the minimum number of browsers.

## Check

Applies when `minBrowsers` is set. Reads the support list from `browserSupportSource`. Fails when any of these holds:

- No source declares a list.
- The list resolves to fewer than `minBrowsers` distinct browser families.

When `minBrowsers` is unset, the rule reports "not configured" and does not pass.

The rule reads Browserslist queries and counts the browser families that the queries name, such as `chrome`, `firefox`, `safari`, and `edge`. The Browserslist data is not installed, so a query that names no browser, such as `defaults` or `> 0.5%`, counts for no family. Name each browser in the list. A query that starts with `not` is ignored.

## Recommendations

- Test the latest two major versions of popular browsers, such as Chrome, Firefox, Safari, and Edge.
- Take browser usage data from analytics tools.
- Consider automated testing tools, such as BrowserStack or LambdaTest.

## Not required for

None listed.

## Rationale

A declared list gives build tools and reviewers one target. `PR-6b` covers the test in each browser, which needs engines beyond Chromium.
