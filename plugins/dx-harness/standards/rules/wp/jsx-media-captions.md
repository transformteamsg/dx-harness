---
code: WP-2b
slug: jsx-media-captions
dss: WP-2
tier: L1
check: lint
surface: source
engine: jsx-a11y `media-has-caption`
parameters:
  mediaAlternativeSelector: null
---

# WP-2b: JSX media elements have a captions track

## Statement

Each JSX `<audio>` and `<video>` has a `<track kind="captions">` child.

## Check

Fails an element that `jsx-a11y/media-has-caption` reports. In plain HTML it fails an `<audio>` element with no captions track and no `muted` attribute. A plain HTML `<video>` is `WP-2a`. Skips an element that matches `mediaAlternativeSelector`. When `mediaAlternativeSelector` is unset, the rule reports "not configured" and does not pass. Set it to an empty string when no exemption applies.

## Recommendations

- Add a `<track kind="captions">` child to each media element.
- A muted video with no audio needs no captions track.

## Not required for

- Content that is a media alternative for text and is clearly labelled as such.

## Rationale

The source check reports the defect before the page renders. The rendered check is `WP-2a`.
