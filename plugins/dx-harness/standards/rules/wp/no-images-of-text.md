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
  pages: null
  minWords: 4
  minConfidence: 70
  ocrLanguages: [eng]
  exemptSelector: "[data-image-of-text='logo'], [data-image-of-text='essential']"
---

# WP-15a: images do not hold text

## Statement

An image that holds `minWords` or more words of text is a candidate for an image of text. The author marks a logo or an essential image as exempt.

## Check

Runs optical character recognition (OCR) on each rendered `<img>`, SVG `<image>`, and element with a CSS background image, on each page in `pages`, in the languages in `ocrLanguages`. Before it reads a background image, the check hides the element's own text, so real text over the image does not count. A word counts when OCR gives it a confidence of `minConfidence` or more out of 100, and it holds a letter or a digit. The check reports an image with `minWords` or more such words that does not match `exemptSelector`, and does not sit inside an element that matches it. The finding names the image and the recognised text.

The rule finds candidates and does not decide. It warns and never blocks. `WP-15b` judges whether a necessary image has a text equivalent.

When OCR cannot start, the rule reports that it did not run and why, and the run does not pass. The common cause is a language in `ocrLanguages` with no data installed.

### The OCR library

The check uses [`tesseract.js`](https://github.com/naptha/tesseract.js), which runs the Tesseract OCR engine as WebAssembly. The reasons:

- It needs no native build step. The package's one install script prints a donation message, and `pnpm-workspace.yaml` does not allow it.
- It runs offline. The language data comes from the `@tesseract.js-data/<language>` packages, which the linter reads from disk. The check never fetches data from the network.
- It is maintained. Version 7.0.0 came out in December 2025, under the Apache 2.0 licence.
- It gives the same text on each run for the same image, and reads an image in about 150 milliseconds.

The package installs the English data only. To check another language, install `@tesseract.js-data/<language>`, or set `DESIGN_LINT_OCR_DATA` to a directory that holds `<language>.traineddata.gz` for each language in `ocrLanguages`.

## Recommendations

- Use real text, styled with CSS, instead of an image of text.
- Where an image of text is necessary, give it a text equivalent.

## Not required for

- Logotypes.
- Images of text that are essential to the information.

## Rationale

An image of text does not scale, reflow, or take a user's colours and font. OCR finds the images that most likely break these needs.
