---
code: TX-9a
dss: TX-9
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  successPages: null
  failurePages: null
  statusSelector: '[role="status"], [role="alert"]'
---

# TX-9a: each outcome page has a status message

## Statement

Each page that ends a transaction states whether the transaction succeeded or failed.

## Check

Applies to each page in `successPages` and `failurePages`. Fails a page when any of these holds:

- No element matches `statusSelector`.
- The matched element has no text.
- The outcome appears only in an icon or a colour, and not in text.

A product with no failure state lists no page in `failurePages`, and the rule skips that outcome.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Use clear copy, an icon, and colour together.
- Make the message unambiguous.

## Not required for

None listed.

## Rationale

A user who cannot tell whether a payment went through submits it again. `TX-9b` judges whether the cues are familiar and unambiguous.
