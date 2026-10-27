---
code: WU-2a
dss: WU-2
tier: L0
check: lint
surface: rendered
engine: axe valid-lang
parameters:
  pages: null
---

# WU-2a: A `lang` attribute on part of a page is valid

## Statement

Every `lang` attribute on an element inside the page holds a valid language tag.

## Check

Applies to the pages in `pages`. Fails when axe reports `valid-lang` for any element.

## Recommendations

- Use the `lang` attribute on the element that wraps the foreign-language text.
- Use `WU-2b` to find text that has no tag.

## Not required for

None listed.

## Rationale

Assistive technology switches pronunciation only when the tag is valid. `WU-2b` judges whether each passage in another language is tagged.
