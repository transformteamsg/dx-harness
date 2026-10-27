---
code: TL-4d
dss: TL-4
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: TL-4c
parameters:
  footerSelector: "footer"
  timeoutSeconds: 10
  checkExternal: false
---

# TL-4d: each footer link resolves

## Statement

Each footer link leads to a page that loads, and is not a placeholder.

## Check

For each `<a href>` inside the element that matches `footerSelector`, sends a request and fails when either of these holds:

- The response is not a success status after redirects, or no response arrives within `timeoutSeconds`.
- The `href` is empty or holds only a fragment, so that the link leads back to the page that carries it. A footer that every page shares links to its own page on that page, so a link with a real path to its own page passes.

A link to an external host needs network access. The rule checks it only when `checkExternal` is `true`, and skips it otherwise.

## Recommendations

- Point each link at its own page.
- Replace a placeholder `#` or empty `href` with the real destination.

## Not required for

None listed.

## Rationale

A broken or circular footer link fails users who look for official information. `TL-4c` judges what a script cannot decide, whether the destination matches the label.
