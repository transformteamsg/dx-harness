---
code: TX-7b
dss: TX-7
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  paymentPages: null
  startPages: null
  refundPatterns: ["refund", "refund policy", "no refund"]
---

# TX-7b: refund information is on each payment page and each start page

## Statement

The user can read the refund information before the transaction starts and before payment.

## Check

Applies to each page in `paymentPages` and `startPages`. Fails a page when its text matches none of `refundPatterns`, and the page has no link whose text matches one.

A product with no refunds states that, and the statement matches a pattern.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Make the information easy to find on the payment page.
- Make the information available before the transaction starts.

## Not required for

None listed.

## Rationale

A user decides to pay on the basis of the refund terms. `TX-7c` judges whether the information is easy to find.
