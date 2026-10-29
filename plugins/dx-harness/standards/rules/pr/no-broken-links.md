---
code: PR-5a
slug: no-broken-links
dss: PR-5
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  linkScope: ["internal", "external"]
  linkTimeoutMs: 5000
---

# PR-5a: no link on a page is broken

## Statement

Every link on a page resolves.

## Check

Applies when `pages` is set. For each page in `pages`, the rule collects each `<a href>` in the scope of `linkScope` and requests it with a timeout of `linkTimeoutMs`.

Fails a link when any of these holds:

- The response status is 400 or above.
- The request times out or fails to connect.
- The link is a same-page anchor with no element that has the matching `id`. A hash route that starts with `/` or `!`, such as `#/overview`, is not an anchor. A single-page app handles it, so the rule skips it.

The rule requests an internal link from inside the page and an external link from Node, and requests each address once for each page. Skips `mailto:`, `tel:`, and every other scheme that is not HTTP or HTTPS. When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use automated tools, such as the WOGAA broken link scanner, to scan regularly.
- Cover both internal and external links.

## Not required for

None listed.

## Rationale

A broken link stops a user from completing a task. `PR-5b` covers the fix time, which a design linter cannot decide.
