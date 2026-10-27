---
code: TX-10b
dss: TX-10
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  failurePages: null
  alternativeActionSelector: null
  contactPatterns: ["mailto:", "tel:", "/contact", "/appeal", "/feedback"]
---

# TX-10b: each failure page offers an alternative action and a channel for appeals or enquiries

## Statement

A failure page offers the user a next step and a way to appeal or ask.

## Check

Applies to each page in `failurePages`. Fails a page when any of these holds:

- No element matches `alternativeActionSelector`.
- No link or form on the page matches `contactPatterns`.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Offer an alternative action, such as retry or a different payment method.
- Name the channel for appeals or enquiries.

## Not required for

None listed.

## Rationale

A failed transaction with no next step leaves the user stuck.
