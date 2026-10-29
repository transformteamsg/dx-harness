---
code: WP-15a
slug: no-images-of-text
dss: WP-15
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: WP-15b
parameters:
  minWords: 4
  ocrLanguages: [eng]
  exemptSelector: "[data-image-of-text='logo'], [data-image-of-text='essential']"
---

# WP-15a: images do not hold text

## Statement

An image that holds `minWords` or more words of text is a candidate for an image of text. The author marks a logo or an essential image as exempt.

## Check

Runs optical character recognition (OCR) on each rendered `<img>`, `<svg>` raster, and CSS background image, in the languages in `ocrLanguages`. Reports an image where OCR finds `minWords` or more words, and the image does not match `exemptSelector`. The finding names the image and the recognised text.

The rule finds candidates and does not decide. It warns and never blocks. `WP-15b` judges whether a necessary image has a text equivalent.

**Not built.** The linter has no OCR library, and a check that guesses at text in an image is not an honest check. The rule has no module, so a run reports it as "no linter module yet". Build it when an OCR library is added to the linter.

## Recommendations

- Use real text, styled with CSS, instead of an image of text.
- Where an image of text is necessary, give it a text equivalent.

## Not required for

- Logotypes.
- Images of text that are essential to the information.

## Rationale

An image of text does not scale, reflow, or take a user's colours and font. OCR finds the images that most likely break these needs.
