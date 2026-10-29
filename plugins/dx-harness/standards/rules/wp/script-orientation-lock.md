---
code: WP-9b
slug: script-orientation-lock
dss: WP-9
tier: L1
check: lint
surface: source
engine: custom
parameters:
  orientationRequired: null
---

# WP-9b: scripts and manifests do not lock the orientation

## Statement

No script or web app manifest locks the orientation.

## Check

Fails a call to `screen.orientation.lock(`, and a manifest `orientation` value other than `any` or `natural`. Skips when `orientationRequired` is `true`. When `orientationRequired` is unset, the rule reports "not configured".

## Recommendations

- Test the layout in landscape and portrait.

## Not required for

- Content for which a specific display orientation is necessary to provide the content accurately and functionally.

## Rationale

A lock in a script has the same effect as a lock in CSS.
