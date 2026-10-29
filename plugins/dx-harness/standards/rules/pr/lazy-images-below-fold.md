---
code: PR-7e
slug: lazy-images-below-fold
dss: PR-7
tier: L1
check: lint
surface: source
engine: custom, with Lighthouse offscreen-images as a rendered cross-check (verify against installed version)
parameters:
  foldViewports: 1
---

# PR-7e: images below the fold load lazily

## Statement

An image that starts below the first viewport carries `loading="lazy"`.

## Check

For each `<img>` and `<iframe>` that sits after the first `foldViewports` viewport heights of content, fails when it has no `loading="lazy"`.

Fails an image that is in the first viewport and has `loading="lazy"`, because it delays the largest paint.

When the source gives no layout, the rule treats the first element in document order as above the fold and reports the others for review. The source check has no layout, so it makes this choice and does not read `foldViewports`. The rendered cross-check that would use `foldViewports` is not built.

## Recommendations

- Add `width` and `height` to each image.
- Do not lazy-load the main image of the page.

## Not required for

None listed.

## Rationale

Lazy loading cuts the bytes that a first view requests. This rule supports `PR-7a`.
