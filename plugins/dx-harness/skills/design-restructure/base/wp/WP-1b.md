---
code: WP-1b
dss: WP-1
tier: L1
check: lint
surface: source
engine: jsx-a11y `alt-text`
parameters: {}
---

# WP-1b: JSX images have alt text

## Statement

Every JSX element that renders an image, area, image input, or object has an alt attribute or label.

## Check

Fails an element that `jsx-a11y/alt-text` reports. The rule applies to JSX and TSX source. `WP-1a` covers plain HTML through the rendered page.

## Recommendations

- Add `alt` to every `<img>`.
- Use `alt=""` for decorative images.

## Not required for

None listed.

## Rationale

The source check reports the defect at the line that causes it, before the page renders.
