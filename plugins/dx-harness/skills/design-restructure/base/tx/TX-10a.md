---
code: TX-10a
dss: TX-10
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  failurePages: null
  reasonSelector: null
  reasonWithheld: null
---

# TX-10a: each failure page states the reason for the failure

## Statement

A failure page gives the reason for the failure or rejection.

## Check

Applies to each page in `failurePages`. Fails a page when no element matches `reasonSelector`, or the matched element has no text.

Skips when `reasonWithheld` is `true`. Set it only where policy limits the reason.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Make the explanation as clear and detailed as policy allows.

## Not required for

None listed.

## Rationale

A user can act only on a failure that they understand. `TX-10c` judges the quality of the reason.
