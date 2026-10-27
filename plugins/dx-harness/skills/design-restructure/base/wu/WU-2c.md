---
code: WU-2c
dss: WU-2
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: WU-2b
parameters:
  minCharacters: 60
  pages: null
---

# WU-2c: a text block in another language has a `lang` attribute

## Statement

A text block in a language other than the page language has a `lang` attribute.

## Check

Applies when `pages` lists pages. For each text block of at least `minCharacters` letters, detects the script of the block: the Unicode script with the most letters. Reports a block when that script is not a script of the page language and neither the block nor an ancestor has a `lang` attribute.

The detector is a script heuristic, because the project has no language-detection library. It finds Chinese text on an English page, and English text on a Chinese page. It cannot tell apart two languages that share a script, such as English and Malay, so it never reports a French passage on an English page. A page whose language has no known script is skipped.

The rule finds candidates and does not decide. It warns and never blocks. `WU-2b` judges each passage.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Add a `lang` attribute to the element that holds the passage.

## Not required for

- Proper names, technical terms, and words that have become part of the surrounding language.

## Rationale

Screen readers pronounce a passage with the page language unless it is tagged. Detection by script does not separate languages that share a script. `WU-2b` judges what the detector misses.
