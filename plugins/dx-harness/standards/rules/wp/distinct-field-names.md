---
code: WP-10d
slug: distinct-field-names
dss: WP-10
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
---

# WP-10d: similar fields have distinct accessible names

## Statement

Two controls in one form do not share an accessible name.

## Check

Fails a form in which two controls compute the same accessible name, unless each sits in its own `<fieldset>` with a different legend.

## Recommendations

- Name similar fields apart, such as "Billing address" and "Shipping address".

## Not required for

None listed.

## Rationale

Identical names leave a screen reader user unable to tell the fields apart.
