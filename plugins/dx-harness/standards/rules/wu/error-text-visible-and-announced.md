---
code: WU-10b
slug: error-text-visible-and-announced
dss: WU-10
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  errorReferenceAttributes: ["aria-describedby", "aria-errormessage"]
  announceRoles: ["alert", "status"]
  pages: null
---

# WU-10b: error text is visible text and is announced

## Statement

An error is shown as text and announced to assistive technology.

## Check

For each element that an `aria-invalid` control references, fails when any of these holds:

- Its text content is empty.
- It is not visible.
- It has no role in `announceRoles`, no `aria-live` attribute, and is not in an error summary that takes focus.

A control can reference a hint and an error text together. The announce condition fails only when none of the visible elements that the control references is announced. The empty and visible conditions apply to each element. An error summary that takes focus is an ancestor with a `tabindex` attribute.

## Recommendations

- Do not rely on colour alone to show an error.

## Not required for

None listed.

## Rationale

An error that only changes a border colour is lost to users who cannot see it.
