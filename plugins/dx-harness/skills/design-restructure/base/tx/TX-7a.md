---
code: TX-7a
dss: TX-7
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  paymentPages: null
  amountSelector: null
---

# TX-7a: each payment page shows the amount payable

## Statement

The payment page shows the total amount before the user pays.

## Check

Applies to each page in `paymentPages`. Fails a page when no element matches `amountSelector`, or when the matched element has no currency amount in its text.

Fails when the element comes after the payment submit control in reading order.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Show the total, with a breakdown where more than one item applies.

## Not required for

None listed.

## Rationale

A user must know the amount before they commit to pay.
