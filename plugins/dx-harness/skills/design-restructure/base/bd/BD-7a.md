---
code: BD-7a
dss: BD-7
tier: L1
check: lint
surface: source
engine: custom
parameters:
  mandatoryMarker: "*"
  optionalLabel: "optional"
  loginException: true
---

# BD-7a: every required control has a visible marker and a programmatic marker

## Statement

Each form control that is required has a visible marker and a programmatic marker.

## Check

For each form control with `required` or `aria-required="true"`, fails when any of these holds:

- Its label has no `mandatoryMarker` and no text that says "required".
- The control has no `required` or `aria-required` attribute.
- The visible marker is the only signal and has no accessible equivalent. A marker that is hidden from assistive technology passes only when the control carries the programmatic marker.

When most controls in a form are required, the rule also expects each optional control to carry `optionalLabel`.

When `loginException` is `true`, a form with only a username control (`autocomplete="username"`) and a password control is skipped.

## Recommendations

- Use a consistent visual indicator, such as an asterisk, for required fields.
- If most fields are required, label the optional fields as optional.
- Make the indicators accessible to screen readers.

## Not required for

Login pages that ask for a unique identifier (a username) and a password.

## Rationale

Users must know which fields to fill before they submit. A signal that screen readers cannot read leaves some users without it. `BD-7b` checks that one style is used across the project.
