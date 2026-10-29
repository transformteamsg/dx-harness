---
code: WU-1b
slug: page-language-rendered
dss: WU-1
tier: L0
check: lint
surface: rendered
engine: axe html-has-lang, html-lang-valid, html-xml-lang-mismatch
parameters:
  pages: null
---

# WU-1b: language of the page is declared on the rendered page

## Statement

The rendered page exposes a valid primary language.

## Check

Applies to the pages in `pages`. Fails a rendered page when axe reports any of `html-has-lang`, `html-lang-valid`, or `html-xml-lang-mismatch`.

## Recommendations

- Set the language on the server so that client rendering does not drop it.

## Not required for

None listed.

## Rationale

A page that sets `lang` in a template can lose it after client-side rendering. This rule reads the page that the user receives.
