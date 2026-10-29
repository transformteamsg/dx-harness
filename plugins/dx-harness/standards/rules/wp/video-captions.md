---
code: WP-2a
slug: video-captions
dss: WP-2
tier: L1
check: lint
surface: rendered
engine: axe `video-caption`
parameters:
  mediaAlternativeSelector: null
  pages: null
---

# WP-2a: every video has a captions track

## Statement

Each prerecorded `<video>` carries a captions track.

## Check

Fails a `<video>` that axe `video-caption` reports. Skips an element that matches `mediaAlternativeSelector`. When `mediaAlternativeSelector` is unset, the rule reports "not configured" and does not pass. Set it to an empty string when no exemption applies.

## Recommendations

- Generate captions with a transcription or captioning tool.
- Align captions with the audio and keep them readable.

## Not required for

- Content that is a media alternative for text and is clearly labelled as such.

## Rationale

Users who cannot hear the audio need captions. `WP-2c` judges whether the captions are accurate and aligned.
