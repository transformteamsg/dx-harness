---
code: WP-1e
slug: alt-text-not-placeholder
dss: WP-1
tier: L1
check: lint
surface: source
engine: jsx-a11y `img-redundant-alt`, plus custom
judgedRemainder: WP-1d
parameters:
  placeholderWords: [image, photo, picture, graphic, icon, untitled]
---

# WP-1e: alt text is not a file name, an extension, or a placeholder word

## Statement

Alt text describes the image. It is not a file name, a file extension, or a word from `placeholderWords`.

## Check

Reads HTML, JSX, and TSX. Fails an `<img>` whose `alt` ends in a file extension, matches a file name, or consists only of words from `placeholderWords`. In JSX and TSX it also fails an `alt` that `jsx-a11y/img-redundant-alt` reports. `jsx-a11y/alt-text` is `WP-1b`, so it is not repeated here. When `placeholderWords` is unset, the rule reports "not configured".

`WP-1d` judges whether the alt text is accurate and whether decorative content is marked.

## Recommendations

- Describe the purpose of the image.
- Use an empty `alt` for a decorative image.

## Not required for

None listed.

## Rationale

A screen reader reads a file name or a placeholder word aloud and tells the user nothing about the image. A script finds these cases. It cannot decide whether the text is accurate.
