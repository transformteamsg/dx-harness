---
code: TX-6a
slug: autocomplete-tokens
dss: TX-6
tier: L1
check: lint
surface: source
engine: custom, with jsx-a11y autocomplete-valid on JSX and TSX
parameters:
  flowPages: null
  autocompleteFields: {"name": "name", "email": "email", "tel": "tel", "address": "street-address", "postal": "postal-code", "cc-number": "cc-number", "cc-exp": "cc-exp", "cc-name": "cc-name"}
---

# TX-6a: personal and payment fields carry a valid autocomplete token

## Statement

A form control that asks for data the browser can pre-fill carries an `autocomplete` token.

## Check

For each control on a page in `flowPages` whose `type`, `name`, or `id` matches a key in `autocompleteFields`, fails when any of these holds:

- The control has no `autocomplete` attribute.
- The token is not valid for the control, as the WHATWG token list decides.
- The token is `off` on a payment field.

## Recommendations

- Use the standard `autocomplete` tokens for name, contact, address, and payment fields.
- Pre-fill known data from an earlier step.

## Not required for

None listed.

## Rationale

Pre-fill reduces typing and errors. `TX-6b` judges whether MyInfo and Enterprise Data Hub pre-filling is offered where SingPass or CorpPass is used.
