---
code: TX-11b
slug: success-download-or-print
dss: TX-11
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  successPages: null
  receiptControlSelector: 'a[download], button[data-print], [data-action="print"]'
---

# TX-11b: each success page offers a download or print option

## Statement

The success page offers a way to keep the payment details.

## Check

Applies to each page in `successPages` of a product with payments. Fails a page when no element matches `receiptControlSelector`.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Offer a download or print option for the receipt.

## Not required for

None listed.

## Rationale

A user keeps a receipt as a record. `TX-13a` checks the same control for the acknowledgement.
