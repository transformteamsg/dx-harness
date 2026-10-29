---
code: PR-6b
slug: browser-smoke-checks
dss: PR-6
tier: L2
check: lint
surface: rendered
engine: Playwright multi-engine
parameters:
  engines: [firefox, webkit]
  smokeChecks: [loads-without-errors, no-horizontal-scroll, axe-critical]
  viewports: [320, 768, 1280]
  pages: null
  runOn: ci
---

# PR-6b: the service passes smoke checks in the listed browser engines

## Statement

Each page in `pages` passes the checks in `smokeChecks` in every engine in `engines`.

## Check

Runs only when the command runs in CI, because `runOn` is `ci`. The pre-commit and pre-push hooks skip the rule.

For each page and each engine, runs these checks:

- `loads-without-errors`: the page loads and logs no uncaught script error.
- `no-horizontal-scroll`: the page does not scroll sideways at each width in `viewports`, which copies the default of `BD-1b`.
- `axe-critical`: axe finds no violation of critical impact.

Fails a page and an engine that fail a check. The finding names the engine.

`engines` also accepts `chromium`. Set `DESIGN_LINT_FIREFOX` or `DESIGN_LINT_WEBKIT` to an executable to override the Playwright build. The runner has no channel for a note from a module, so "not run" is a finding that starts with "Not run".

When `pages` is unset, the rule reports "not configured" and does not pass. When an engine is not installed, the rule reports "not run" for it and does not pass. A page does not pass in an engine that did not start.

The `webkit` engine is the Playwright build of WebKit. A pass on it does not prove a pass in Safari.

## Recommendations

- Test the service in the latest major versions of the browsers that the support list names.
- Test on real devices before launch. `PR-6a` checks that the list exists.

## Not required for

None listed.

## Rationale

A service that works in one engine can fail in another. The smoke checks find the most common failures without the cost of a full test run in each engine.
