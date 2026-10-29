---
code: WP-10a
slug: autocomplete-rendered
dss: WP-10
tier: L1
check: lint
surface: rendered
engine: axe `autocomplete-valid`
parameters:
  pages: null
---

# WP-10a: autocomplete values are valid on the rendered page

## Statement

Every `autocomplete` attribute holds a valid token.

## Check

Fails an element that axe `autocomplete-valid` reports.

## Recommendations

- Specify the purpose of each common input with an `autocomplete` token.

## Not required for

None listed.

## Rationale

Browsers fill in a field only when the token is valid.
