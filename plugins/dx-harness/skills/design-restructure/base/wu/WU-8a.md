---
code: WU-8a
dss: WU-8
tier: L2
check: lint
surface: project
engine: custom
parameters:
  ignoreHrefs: []
---

# WU-8a: links to the same target have the same name

## Statement

Components with the same function carry the same accessible name on every page.

## Check

Groups the links of one page by `href`, and the submit buttons of the whole site by `form action`. Fails when a group has more than one accessible name, except for targets in `ignoreHrefs`. A link with an `hreflang` attribute forms its own group, because a language switcher and a home link can share an address and have different functions.

The names of one link target on different pages are `WU-8c`'s finding, so this rule does not compare pages for links. The reverse case, where one name points to two targets, is not part of this rule.

## Recommendations

- Use identical labels, names, and text alternatives for the same function.

## Not required for

None listed.

## Rationale

Different names for one function make users doubt that the controls match. `WU-8b` judges functions that have no shared target.
