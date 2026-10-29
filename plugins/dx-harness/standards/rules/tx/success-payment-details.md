---
code: TX-11a
slug: success-payment-details
dss: TX-11
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  successPages: null
  paymentDetailFields: null
---

# TX-11a: each success page shows the payment details

## Statement

After payment, the success page shows the details of the payment.

## Check

Applies to each page in `successPages` of a product with payments. `paymentDetailFields` maps each field to a text pattern. The fields are `referenceNumber`, `date`, `items`, `method`, and `amount`.

Fails a page when the page text matches none of the patterns for a listed field.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Show the acknowledgement or receipt number, the date, the items, the method, and the amount.

## Not required for

None listed.

## Rationale

A user needs proof of what they paid. A field that the product does not collect is left out of `paymentDetailFields`.
