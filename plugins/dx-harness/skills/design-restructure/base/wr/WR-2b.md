---
code: WR-2b
dss: WR-2
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  allowedLiveValues:
    - polite
    - assertive
    - "off"
---

# WR-2b: live region values are valid

## Statement

Each `aria-live` attribute and its companions have a value that assistive technologies support.

## Check

Applies when `pages` is set. Fails an element when any of these holds:

- `aria-live` has a value outside `allowedLiveValues`.
- `aria-atomic`, `aria-relevant`, or `aria-busy` has an invalid value.
- `role="alert"` or `role="status"` carries `aria-live` with a value that conflicts with the role.

`WR-1c` covers the general validity of ARIA attributes, through axe `aria-valid-attr-value`. This rule checks the live-region attributes only, so that a bad value is not reported twice by two rules. The source twin `eslint-plugin-jsx-a11y` `aria-proptypes` is not built.

## Recommendations

- Use `aria-live="polite"` for a message that does not need to interrupt.
- Use `aria-live="assertive"` only for a message that needs immediate attention.

## Not required for

None listed.

## Rationale

An invalid live value is ignored, and the region goes silent. `WR-2a` checks that the region exists.
