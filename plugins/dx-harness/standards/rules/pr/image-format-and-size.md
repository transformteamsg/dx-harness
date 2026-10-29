---
code: PR-7d
slug: image-format-and-size
dss: PR-7
tier: L2
check: lint
surface: rendered
engine: Lighthouse modern-image-formats, uses-responsive-images (verify against installed version)
parameters:
  pages: null
  imageFormats: ["avif", "webp"]
  maxImageBytes: null
---

# PR-7d: images use a modern format and are not oversized

## Statement

Each raster image uses a modern format, is no larger than needed for its display size, and stays within the byte limit.

## Check

Applies when `pages` and `maxImageBytes` are set. For each raster image on each page in `pages`, fails when any of these holds:

- The format is not in `imageFormats`.
- The intrinsic width is more than twice the rendered width.
- The transfer size is above `maxImageBytes`.

The format is the file extension of the image that the browser chose, so a `<picture>` source counts. The size check needs an image that the browser has loaded, so it skips an image that has not loaded. The byte size comes from resource timing. A finding names one image and one condition. Lighthouse is not used. Skips SVG images. When `pages` or `maxImageBytes` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Serve a modern format with a fallback through `<picture>`.
- Provide `srcset` and `sizes` so the browser picks the right size.

## Not required for

None listed.

## Rationale

Images are the largest part of most pages. This rule supports `PR-7a` and `PR-7c`.
