---
code: TYP-7a
slug: adjacent-size-ratio
control: SLP-6
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: TYP-7b
parameters:
  pages: null
  minRatio: 1.1
  ignoreSelector: "button, input, select, textarea"
---

# TYP-7a: adjacent text sizes on a page differ by the minimum ratio

## Statement

Two adjacent text sizes that a page uses differ by a ratio of `minRatio` or more.

## Check

Applies when `pages` is set. Renders each page in `pages` at 1280 by 800 pixels. Collects the computed font size of each visible text node, and sorts the distinct sizes. Text inside an element that matches `ignoreSelector` is not read, because a form control often keeps the default size of the browser. Fails each pair of adjacent sizes where the larger size divided by the smaller size is less than `minRatio`. The finding is at the first text that uses the larger size.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use the sizes of the type scale, and skip a step between two levels when the two steps are close.
- Use one size for text at one level.

## Not required for

None listed.

## Rationale

A heading, a subheading, and body text at almost the same size have no hierarchy. The default of 1.10 lets a page use any adjacent pair of the `TYP-3` scale, where the closest pair is 20 to 18. `TYP-7b` judges what a ratio does not show: a flat hierarchy where the sizes differ, but weight, spacing, and position do not separate the levels.
