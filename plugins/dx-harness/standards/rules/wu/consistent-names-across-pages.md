---
code: WU-8c
slug: consistent-names-across-pages
dss: WU-8
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: WU-8b
parameters:
  pages: null
  ignoreNames: []
---

# WU-8c: a link target has the same accessible name across pages

## Statement

A link target carries the same accessible name on every page that links to it.

## Check

Applies when `pages` lists pages. Groups links by resolved target across all listed pages. Fails when a group has more than one accessible name, except for names in `ignoreNames`. A page that uses two names for one target is a finding of `WU-8a`, so this rule compares only the pages that use one name. The first listed page that links to the target sets the name. A link with an `hreflang` attribute forms its own group.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use one name for one target on every page.

## Not required for

None listed.

## Rationale

A target with different names on different pages makes users doubt that the links match. `WU-8a` checks within the project by `href` and form action. `WU-8b` still judges functions that have no shared target.
