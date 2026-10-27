---
code: WP-1c
dss: WP-1
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  maxAltLength: 125
  pages: null
---

# WP-1c: alt text is within the length limit

## Statement

Alt text is concise.

## Check

Fails an `<img>` whose `alt` is longer than `maxAltLength` characters. An `alt` that repeats the file name is `WP-1e`, so that one fault is reported once.

## Recommendations

- Move a long description into the page text and refer to it from the alt text.
- Describe the purpose of the image, not its appearance alone.

## Not required for

None listed.

## Rationale

The DSS asks for concise alt text. A length limit is the part that a script can decide.
