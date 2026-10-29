---
code: TX-5a
slug: save-draft
dss: TX-5
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  flowPages: null
  minStepsForDraft: null
  saveDraftPatterns: ["save draft", "save and continue later", "save for later"]
---

# TX-5a: a long flow offers a save-draft control on each step

## Statement

A long transaction lets the user save a draft.

## Check

`flowPages` lists the pages of the flow, one for each step. Applies when it holds `minStepsForDraft` or more pages. Fails a page in it when it has no button or link whose accessible name matches `saveDraftPatterns`.

Fails when the control is hidden at the default viewport.

When a parameter is `null`, the rule reports "not configured" and does not pass. An empty list means the product has no such page, and the rule does not apply.

## Recommendations

- Make the save option clearly visible.
- Make drafts easy to retrieve and resume.

## Not required for

None listed.

## Rationale

A user who loses a long entry does not return. `TX-5b` judges the confirmation message and whether a draft can be resumed.
