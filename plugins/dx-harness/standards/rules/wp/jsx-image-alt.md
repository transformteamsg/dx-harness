---
code: WP-1b
slug: jsx-image-alt
dss: WP-1
tier: L1
check: lint
surface: source
engine: jsx-a11y `alt-text`, plus custom
parameters: {}
---

# WP-1b: JSX, Vue, and Svelte images have alt text

## Statement

Every JSX, Vue, or Svelte template element that renders an image, area, image input, or object has an alt attribute or label.

## Check

Fails an element that `jsx-a11y/alt-text` reports. The rule applies to JSX and TSX source. In `.vue` and `.svelte` files it applies the same checks to the template elements. A bound attribute, such as `:alt` or `alt={caption}`, passes. A template that does not parse is a finding, because the rule could not check it. `WP-1a` covers plain HTML through the rendered page.

## Recommendations

- Add `alt` to every `<img>`.
- Use `alt=""` for decorative images.

## Not required for

None listed.

## Rationale

The source check reports the defect at the line that causes it, before the page renders.
