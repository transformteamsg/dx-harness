---
code: BD-7b
dss: BD-7
tier: L2
check: lint
surface: project
engine: custom
parameters:
  mandatoryMarker: "*"
---

# BD-7b: one marker style across the project

## Statement

All forms in the project use the same marker for a required field.

## Check

Collects the visible marker of each required control across all pages. Fails when a marker differs from `mandatoryMarker`. The finding lists each form that differs.

## Recommendations

- Use one indicator, defined once, for every form.

## Not required for

None listed.

## Rationale

A different marker on each form makes users learn the convention again. The DSS asks for consistent visual indicators.
