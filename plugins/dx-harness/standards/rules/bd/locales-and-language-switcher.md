---
code: BD-3a
slug: locales-and-language-switcher
dss: BD-3
tier: L1
check: lint
surface: project
engine: custom
parameters:
  locales: null
---

# BD-3a: at least two locales are declared and a language switcher links to each

## Statement

The service offers content in at least two locales, and a language switcher links to each.

## Check

Fails when any of these holds:

- `locales` lists fewer than two locales.
- No page has a language switcher: a group of links with an `hreflang` attribute, or a control that sets the locale.
- A locale in `locales` has no link target, or the target does not resolve.

When `locales` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Offer language selection at key entry points, such as login or the home page, or select the language from device settings.
- Let users switch language at any time.

## Not required for

None listed.

## Rationale

Users have language preferences, and a service that offers one language excludes some of them. `BD-3b` judges translation quality and the placement of the switcher.
