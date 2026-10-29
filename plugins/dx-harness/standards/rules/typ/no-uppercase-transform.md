---
code: TYP-4a
slug: no-uppercase-transform
control: TYP-4
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: TYP-4b
parameters:
  pages: null
  exemptSelector: "abbr"
---

# TYP-4a: no text is set in capitals by a text transform

## Statement

Text is never set in all-caps. Acronyms are exempt.

## Check

Opens each page in `pages` at a viewport of 1280 by 800. Reads each visible element that holds text of its own. Fails the element when its computed `text-transform` is `uppercase` and it is not inside an element that matches `exemptSelector`. A child inherits the transform, so the rule reports the outermost element that has it, once.

The rule reads the computed style, so it finds a transform set in a style sheet, an inline style, or a utility class such as `uppercase`.

When a parameter is `null`, the rule reports "not configured" and does not pass. Set `exemptSelector` to an empty string when no element is exempt.

## Recommendations

- Mark an acronym with `<abbr>`.
- Use weight, size, or colour for emphasis instead of capitals.

## Not required for

- Acronyms, such as `CPF` or `NRIC`.

## Rationale

Capitals remove the shapes of words, so text in capitals is slower to read. `TYP-4b` judges text that is typed in capitals in the source, which the transform check cannot see.
