---
code: WU-14b
dss: WU-14
tier: L1
check: lint
surface: source
engine: custom, with jsx-a11y autocomplete-valid
parameters:
  blockedPasteHandlers: ["onPaste", "onpaste"]
  passwordAutocomplete: ["current-password", "new-password", "one-time-code"]
---

# WU-14b: credential fields allow paste and autofill

## Statement

Password and code fields accept paste and carry an autofill hint.

## Check

For each `input[type=password]` and each code field, fails when any of these holds:

- It has a handler in `blockedPasteHandlers` that calls `preventDefault` or returns `false`.
- Its `autocomplete` value is not in `passwordAutocomplete`.

## Recommendations

- Let a password manager fill the field.

## Not required for

None listed.

## Rationale

Blocked paste and missing hints force users to memorise or retype a secret.
