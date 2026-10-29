---
code: WU-1a
slug: page-language-source
dss: WU-1
tier: L0
check: lint
surface: source
engine: jsx-a11y html-has-lang, lang
parameters: {}
---

# WU-1a: language of the page is declared in source

## Statement

Every HTML document declares a valid `lang` attribute on the `<html>` element.

## Check

Fails a page when any of these holds:

- The `<html>` element has no `lang` attribute.
- The `lang` value is not a valid language tag as defined by Best Current Practice 47 (BCP 47).

## Recommendations

- Set `lang` to the primary language of the page, for example `lang="en-SG"`.
- Use `WU-1b` to check the rendered page.

## Not required for

None listed.

## Rationale

Screen readers and translation tools choose a voice or a language from this attribute. `WU-1c` covers PDF files and mobile applications.
