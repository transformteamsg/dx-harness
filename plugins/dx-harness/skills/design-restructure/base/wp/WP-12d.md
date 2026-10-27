---
code: WP-12d
dss: WP-12
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: WP-12c
parameters:
  maxTabStops: 3
  audioControlNames: [pause, stop, mute]
  pages: null
---

# WP-12d: an audio control is among the first tab stops

## Statement

On a page that plays audio automatically, a control to pause, stop, or mute the audio is among the first `maxTabStops` tab stops.

## Check

For each page in `pages`, detects audio that autoplays. On such a page, presses Tab up to `maxTabStops` times. Reports the page when no focused element has an accessible name that contains a word from `audioControlNames`. The autoplaying element with its native `controls` counts as an audio control. Audio that plays automatically is an `<audio>` or `<video>` element with `autoplay` that is not muted. When `pages` is unset, the rule reports "not configured".

The rule finds candidates and does not decide. It warns and never blocks. `WP-12c` judges whether the control is near the start of the service.

## Recommendations

- Place the audio control at the start of the page.
- Do not play audio automatically where the user can choose to start it.

## Not required for

None listed.

## Rationale

A user of a screen reader cannot hear the page over autoplaying audio. A control that is late in the tab order is hard to reach. The tab count finds the likely cases.
