---
code: WP-12a
dss: WP-12
tier: L1
check: lint
surface: rendered
engine: axe `no-autoplay-audio`
parameters:
  pages: null
  maxAutoplaySeconds: 3
---

# WP-12a: audio that plays automatically can be stopped

## Statement

Audio that plays for more than `maxAutoplaySeconds` has a control to pause, stop, or adjust the volume.

## Check

Fails a media element that axe `no-autoplay-audio` reports. The engine reports a failure as "incomplete" for review, so the module counts an incomplete result as a failure when the media has a known length. The `allowedDuration` option of the engine takes `maxAutoplaySeconds`.

## Recommendations

- Play sound only on user request.

## Not required for

None listed.

## Rationale

Autoplaying audio talks over a screen reader.
