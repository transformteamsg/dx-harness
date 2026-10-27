---
code: WP-3a
dss: WP-3
tier: L1
check: lint
surface: source
engine: custom
redirects: [WP-5a]
parameters: {}
---

# WP-3a: media has a text alternative

## Statement

Each `<audio>` and `<video>` element has a captions track, a descriptions track, or a described text alternative.

## Check

Passes an element that has one of these:

- A `<track>` with `kind="captions"` or `kind="descriptions"`.
- An `aria-describedby` or `aria-details` attribute that points to an element with text.

Reads HTML, JSX, and TSX. A dynamic value in JSX passes, because the check cannot read it. Fails any other `<audio>` or `<video>` element. To pass with a transcript, link the transcript from the element with `aria-describedby` or `aria-details`.

## Recommendations

- Provide a text transcript for audio-only content.
- Provide a text alternative or an audio description for video-only and synchronised media.
- Provide an audio description for prerecorded video as a selectable audio track. `WP-5b` judges it.

## Not required for

- Content that is a media alternative for text and is clearly labelled as such. Mark it with a `data-media-alternative` attribute.

## Rationale

A script finds only whether an alternative is present. `WP-3b` judges whether it is equivalent, and `WP-5b` judges the audio description.
