---
code: WP-9a
slug: css-orientation-lock
dss: WP-9
tier: L1
check: lint
surface: rendered
engine: axe `css-orientation-lock`
parameters:
  orientationRequired: null
  pages: null
---

# WP-9a: CSS does not lock the orientation

## Statement

CSS does not restrict the page to one orientation.

## Check

Fails a page that axe `css-orientation-lock` reports. Skips when `orientationRequired` is `true`. When `orientationRequired` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Avoid locking orientation to one view.

## Not required for

- Content for which a specific display orientation is necessary to provide the content accurately and functionally.

## Rationale

Users who mount a device in one orientation cannot rotate it. `WP-9b` covers locks in scripts and manifests.
