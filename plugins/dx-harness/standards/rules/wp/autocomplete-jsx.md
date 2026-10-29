---
code: WP-10b
slug: autocomplete-jsx
dss: WP-10
tier: L1
check: lint
surface: source
engine: jsx-a11y `autocomplete-valid`
parameters: {}
---

# WP-10b: autocomplete values are valid in JSX

## Statement

Every JSX `autoComplete` attribute holds a valid token.

## Check

Fails an element that `jsx-a11y/autocomplete-valid` reports. The rule reads JSX and TSX. `WP-10a` covers plain HTML on the rendered page.

## Recommendations

- Use the tokens of the HTML specification.

## Not required for

None listed.

## Rationale

The source check reports the defect before the page renders.
