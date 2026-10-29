---
code: WP-2d
slug: caption-file-quality
dss: WP-2
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: WP-2c
parameters:
  captionFiles: null
  maxLineCharacters: 42
  maxLines: 2
---

# WP-2d: caption files parse, cues do not overlap, and lines stay within the limit

## Statement

Each WebVTT caption file is valid. Its cues do not overlap in time. Each cue stays within `maxLines` lines of `maxLineCharacters` characters.

## Check

Resolves the glob in `captionFiles` and parses each file as WebVTT. Fails a file that does not parse. Fails a cue that starts before the previous cue ends. Fails a cue with more than `maxLines` lines. Fails a cue line longer than `maxLineCharacters` characters. When `captionFiles` is unset, the rule reports "not configured".

`WP-2c` judges whether the captions are accurate and aligned with the audio.

## Recommendations

- Split a long cue into two cues.
- Break a line at a phrase boundary.

## Not required for

None listed.

## Rationale

A caption file that does not parse shows no captions. Overlapping cues and long lines are hard to read. A script decides these. It cannot decide whether the text matches the speech.
