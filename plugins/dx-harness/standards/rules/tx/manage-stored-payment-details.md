---
code: TX-8a
slug: manage-stored-payment-details
dss: TX-8
tier: L1
check: lint
surface: project
engine: custom
parameters:
  storesPaymentDetails: null
  managePage: null
  updateSelector: null
  removeSelector: null
---

# TX-8a: a product that stores payment details has a page to update and remove them

## Statement

Users can update and remove stored payment details.

## Check

Applies when `storesPaymentDetails` is `true`. Fails when `managePage` is unset or the page does not exist.

Fails the page when no element matches `updateSelector`, or no element matches `removeSelector`.

When `storesPaymentDetails` is `false`, the rule does not apply.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Give clear instructions on the page.
- Ask for confirmation before a removal.

## Not required for

None listed.

## Rationale

A stored card that the user cannot change or delete stays on file against their wishes. `TX-8b` judges the confirmation prompts.
