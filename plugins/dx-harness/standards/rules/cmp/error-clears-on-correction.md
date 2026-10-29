---
code: CMP-10a
slug: error-clears-on-correction
control: CMP-10
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: CMP-10b
parameters:
  validationCases: null
  submitSelector: "[type=submit]"
---

# CMP-10a: a corrected field clears its own error, and no other error

## Statement

A field's error message clears as soon as the user corrects the field. Each field clears its own error, and no other field's error.

## Check

`validationCases` lists the fields to test. Each case has a `page`, a `field` selector, an `invalid` value, a `valid` value, and an `error` selector for the field's error message. On its own copy of each page, the rule does these steps:

1. Enters the `invalid` value of each case, and activates the first element that matches `submitSelector` in the form of the first case's field. When that field has no form, the rule uses the first match on the page.
2. Fails a case whose error message is not shown, because the rule cannot then test the case.
3. Enters the `valid` value of each case in turn, with an `input` event only.
4. Fails the case when its error message is still shown, or when another case's error message is gone before that case is corrected.

An error message is shown when an element matches `error`, has text, is not hidden from view, and is not hidden from assistive technology.

When `validationCases` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Validate the current value of a field on each input, and remove the error in the same handler that sets it.

## Not required for

- An error from the server, which follows the states of `CMP-3a`.

## Rationale

An error message that stays after the user fixes the field tells the user something false. The control is proposed, so this rule is L2 and warns until a design lead approves the control. `CMP-10b` judges the fields that the cases do not list.
