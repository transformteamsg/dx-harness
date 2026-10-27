---
code: WP-6a
dss: WP-6
tier: L1
check: lint
surface: rendered
engine: axe `list`, `listitem`, `definition-list`, `dlitem`, `th-has-data-cells`, `td-headers-attr`, `td-has-header`, `scope-attr-valid`, `table-fake-caption`, `heading-order`, `empty-heading`
redirects: [WO-12a, WO-12b]
parameters:
  pages: null
---

# WP-6a: lists, tables, and headings are marked up correctly

## Statement

The page uses semantic elements so that its structure and relationships can be determined by assistive technology.

## Check

Fails an element that axe reports under any engine rule in the `engine` field.

## Recommendations

- Use headings, lists, and tables for their purpose.
- Use ARIA only where HTML has no element.

## Not required for

None listed.

## Rationale

Assistive technology reads structure from the markup. `WP-6d` judges whether the structure is the right one.
