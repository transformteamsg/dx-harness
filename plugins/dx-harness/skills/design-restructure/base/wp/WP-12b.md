---
code: WP-12b
dss: WP-12
tier: L1
check: lint
surface: source
engine: custom
parameters: {}
---

# WP-12b: autoplay media is muted or has controls

## Statement

A media element with `autoplay` is muted or has `controls`.

## Check

Fails an `<audio>` or `<video>` that has `autoplay` and has neither `muted` nor `controls`.

## Recommendations

- Add `controls` to media that starts on its own.

## Not required for

None listed.

## Rationale

The source check reports the defect before the page renders.
