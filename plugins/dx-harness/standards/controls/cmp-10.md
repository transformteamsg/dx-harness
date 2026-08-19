---
id: CMP-10
source: DX-DS
title: An input-validation error message clears as soon as the field is corrected, with no separate action required; each field's error clears independently among multiple simultaneous errors
tier: L1
check: hybrid
phase: [implement, verify]
applies_to: [component]
verify: "Deterministic: for each in-scope field, enter an invalid value, confirm the error message renders, then correct it and confirm the error message is removed from the DOM (planned interaction script, manual until built). Judgment: with multiple simultaneous field errors, correct one field and confirm only that field's error clears while the others remain visible."
waiver: documented
enforced: manual
gap: "No script: the control is status proposed, and the harness does not enforce a rule a design lead has not ratified."
---

## Requirement

Validate a field's current value, not the fact that it was once invalid. The
moment a field's input satisfies its validation rule again, remove that
field's error message — do not wait for a submit, a blur elsewhere, or a
navigation to clear it. Where more than one field is invalid at once, clear
each field's error independently: correcting one field must never clear, or
fail to clear, any other field's error.

## Rationale

An error message is a promise about the current state of the field. A
message that outlives the error it names stops being informative and starts
being noise the teacher has to consciously override — "it still says I got
this wrong, but I know I fixed it." That gap between what the UI claims and
what is actually true is exactly the kind of small trust erosion daily-use
tools cannot afford. This is a real, shipped defect (see the origin PR in
`docs/catalog-changes/cmp-10-input-validation-error-clearing.md`), not a
hypothetical: it is easy to wire error state as "set true on invalid" without
a matching "set false on now-valid" path in the same handler, and the bug is
invisible in code review unless someone traces the clearing path explicitly.

## Passes when / Fails when

**Passes:**
- Typing a valid value into a field that previously showed an error removes
  that field's error message on the same input event that made it valid
  (`onChange`, not only `onBlur` or submit).
- Two fields each show independent errors; correcting field A removes only
  field A's error, and field B's error is untouched.

**Fails when:**
- The error message for a corrected field remains visible after the input
  satisfies the validation rule again.
- Correcting one field's input clears another field's error message, or
  clears every visible error at once.
- The error only clears on an unrelated action — submitting the form,
  blurring to a different field, or navigating away — rather than on the
  correction itself.

Out of scope: server-side / async validation errors, which follow CMP-3's
async-state lifecycle (loading / success / error) instead of this control.

## How to verify

Deterministic half (planned, manual until a script or interaction runner
exists): for each in-scope field, enter a value that fails validation and
confirm the error message renders; then correct the value and confirm the
error message's DOM node is gone — not merely visually hidden, unless hidden
from assistive technology too.

Judgment half: with two or more fields simultaneously invalid, correct one
and confirm only that field's error clears while the others remain visible.
Quote the field(s) and the before/after state you observed.
