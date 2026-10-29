---
code: BD-3c
slug: language-switcher-on-entry-pages
dss: BD-3
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: BD-3b
parameters:
  entryPages: null
  switcherSelector: "[hreflang], [data-language-switcher]"
---

# BD-3c: the language switcher appears on each entry page

## Statement

The language switcher appears on each entry page that the config names.

## Check

Checks each page in `entryPages`. Fails a page when no element that matches `switcherSelector` is present. The finding names the page.

When `entryPages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Offer language selection at key entry points, such as login or the home page.
- Let users switch language at any time.

## Not required for

None listed.

## Rationale

Users who cannot read the entry page need the switcher there. This rule decides the part that a script can find: presence on each named page. `BD-3b` judges translation quality and the placement of the switcher.
