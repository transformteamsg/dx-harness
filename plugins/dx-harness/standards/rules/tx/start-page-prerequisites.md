---
code: TX-2a
slug: start-page-prerequisites
dss: TX-2
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  startPages: null
  prerequisiteTopics: null
---

# TX-2a: each start page states the prerequisites that the product config lists

## Statement

The page that starts a transaction gives the information that a user needs before they begin.

## Check

Applies to each page in `startPages`. `prerequisiteTopics` maps a topic to its text patterns. The topics are `eligibility`, `time`, `documents`, `costs`, and `paymentModes`.

Fails a page when the page text matches none of the patterns for a listed topic.

A topic that the product does not need is left out of `prerequisiteTopics`.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Show eligibility criteria, the estimated time to complete, and the required documents and file formats.
- Show the costs and the payment modes.

## Not required for

None listed.

## Rationale

A user who learns of a missing document halfway through the transaction abandons it. `TX-2b` judges whether the information is accurate and complete.
