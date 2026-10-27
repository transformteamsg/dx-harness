---
code: BD-8a
dss: BD-8
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  authenticatedPages: []
  accountSelector: "[data-account-name]"
---

# BD-8a: the account identifier is visible in the header of each authenticated page

## Statement

After sign-in, each authenticated page shows the name or identifier of the account holder in a prominent place.

## Check

Loads each page in `authenticatedPages`. Fails a page when the element that matches `accountSelector` is missing, hidden, empty, or outside the header region or the top of the page.

When `authenticatedPages` is empty, the rule does not apply. The default of `accountSelector` is a convention that a product can change.

## Recommendations

- Show the name or identifier in a clear, accessible location, such as the header or near the top of the page.

## Not required for

None listed. A product with no sign-in lists no authenticated pages.

## Rationale

Users must see which account they use, in particular on a shared device. `BD-8b` judges how clear the location is.
