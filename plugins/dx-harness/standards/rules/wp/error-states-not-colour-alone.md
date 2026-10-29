---
code: WP-11b
slug: error-states-not-colour-alone
dss: WP-11
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  errorSelector: "[aria-invalid='true'], .error, [role='alert']"
---

# WP-11b: error states carry text or an icon

## Statement

An error state does not rely on colour alone.

## Check

Fails an element matching `errorSelector` that has no text content and no child icon (`svg`, `img`, or an element with `aria-label`). An element with no area on the page, such as an empty alert region that waits for a message, is skipped. A form control cannot hold a child, so for a control the text or icon is in the element that its `aria-errormessage` or `aria-describedby` names.

## Recommendations

- Combine shape, colour, and text for an error message.

## Not required for

None listed.

## Rationale

The DSS names error messages as essential content.
