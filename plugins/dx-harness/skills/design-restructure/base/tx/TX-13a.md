---
code: TX-13a
dss: TX-13
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  successPages: null
  acknowledgementControlSelector: 'a[download], button[data-print], [data-action="print"]'
  channelPatterns: ["email", "SMS", "notification"]
---

# TX-13a: each success page offers an acknowledgement to download or names the channel that carries it

## Statement

After success, the user can download an acknowledgement, or the page says where it was sent.

## Check

Applies to each page in `successPages`. Passes a page when an element matches `acknowledgementControlSelector`, or the page text names a channel that matches `channelPatterns` together with the word "sent".

Fails otherwise. `TX-13b` covers the sending itself.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Include the key submission details in the acknowledgement.

## Not required for

None listed.

## Rationale

A user keeps the acknowledgement as proof of submission.
