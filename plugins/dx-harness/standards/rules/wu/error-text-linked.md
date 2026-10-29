---
code: WU-10a
slug: error-text-linked
dss: WU-10
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  errorReferenceAttributes: ["aria-describedby", "aria-errormessage"]
  pages: null
---

# WU-10a: an invalid control points to its error text

## Statement

Each control in an error state names its error text programmatically.

## Check

Applies to each control with `aria-invalid="true"` on the pages in `pages`. Fails when none of `errorReferenceAttributes` points to an element in the document.

The check does not run axe `aria-valid-attr-value`, because `WR-1c` runs it, and a bad value would be reported twice.

## Recommendations

- Use Accessible Rich Internet Applications (ARIA) attributes as `WP-11` requires.
- Identify the field or section that caused the error.

## Not required for

None listed.

## Rationale

A screen reader user hears the error only when the field refers to it. `WU-10c` judges whether the text identifies the cause.
