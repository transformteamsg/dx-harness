---
code: BD-6a
dss: BD-6
tier: L1
check: lint
surface: project
engine: custom
parameters:
  designSystem: null
---

# BD-6a: the declared design system is imported

## Statement

The project declares one design system or style guide, and its code imports that system.

## Check

Fails when any of these holds:

- `designSystem` names no package or stylesheet.
- The named package is not in the dependencies, or the named stylesheet does not exist.
- No source file imports from the named package or stylesheet.

When `designSystem` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use a design system such as the Singapore Government Design System (SGDS).

## Not required for

None listed.

## Rationale

One design system keeps the interface consistent across the whole service. `BD-6b` checks that values come from the system's tokens, and `BD-6c` judges the consistency that tokens cannot show.
