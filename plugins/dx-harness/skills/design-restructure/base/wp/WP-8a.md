---
code: WP-8a
dss: WP-8
tier: L2
check: lint
surface: rendered
engine: custom
parameters:
  sensoryTerms: [red, green, blue, round, square, left, right, above, below, beep, sound]
  controlTerms: [button, link, icon, field, menu, tab]
  pages: null
---

# WP-8a: instructions do not rely on sensory characteristics

## Statement

Text that refers to a control does not use shape, colour, size, location, orientation, or sound alone.

## Check

Fails a sentence that contains one word from `sensoryTerms` and one word from `controlTerms`, with no quoted control name in the same sentence. The finding is a warning to review.

## Recommendations

- Refer to a control by name, such as "Click the 'Next' button to continue".

## Not required for

None listed.

## Rationale

A word list finds candidates only. `WP-8b` judges each one.
