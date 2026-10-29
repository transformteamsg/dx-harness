---
code: WP-1a
slug: text-alternatives
dss: WP-1
tier: L1
check: lint
surface: rendered
engine: axe `image-alt`, `input-image-alt`, `role-img-alt`, `svg-img-alt`, `object-alt`, `area-alt`
parameters:
  pages: null
---

# WP-1a: non-text content has a text alternative

## Statement

Every image, image button, image map area, SVG with an image role, and object has a text alternative or is marked decorative.

## Check

Fails an element that axe reports under any engine rule in the `engine` field. An image with `alt=""`, `role="presentation"`, or `role="none"` passes as decorative.

## Recommendations

- Write accurate, concise alt text for images, charts, and media.
- Mark purely decorative content so that assistive technology ignores it.

## Not required for

None listed.

## Rationale

A user who cannot see an image needs its text alternative. `WP-1c` limits the length, and `WP-1d` judges the quality.
