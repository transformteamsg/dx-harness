---
code: WO-7a
slug: skip-link
dss: WO-7
tier: L1
check: lint
surface: rendered
engine: axe bypass
parameters:
  pages: null
---

# WO-7a: a page has a mechanism to skip repeated blocks

## Statement

Each page has a skip link, a heading, or a `main` landmark that lets users bypass repeated content.

## Check

Fails a page that has none of these:

- A skip link that targets an element on the page.
- A heading element.
- A `main` landmark.

Applies only to a page that has an `<a href>`. A page with no link has nothing to skip.

## Recommendations

- Add a visible, keyboard-accessible skip link.
- Group repeated blocks with ARIA landmarks or headings.

## Not required for

None listed.

## Rationale

Keyboard users otherwise tab through the same navigation on every page.
