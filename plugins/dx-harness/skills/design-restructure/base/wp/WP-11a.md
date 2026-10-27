---
code: WP-11a
dss: WP-11
tier: L1
check: lint
surface: rendered
engine: axe `link-in-text-block`
parameters:
  pages: null
---

# WP-11a: links in text are not distinguished by colour alone

## Statement

A link inside a block of text differs from the surrounding text by more than colour.

## Check

Fails a link that axe `link-in-text-block` reports.

## Recommendations

- Underline links in text, or add another non-colour cue.

## Not required for

None listed.

## Rationale

Users who cannot tell colours apart miss a link that only differs in colour.
