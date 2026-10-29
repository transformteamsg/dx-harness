---
code: TL-5b
slug: no-free-distribution-licence
dss: TL-5
tier: L2
check: lint
surface: project
engine: custom
parameters:
  serviceType: null
  manifestFile: "package.json"
  allowedLicences: ["UNLICENSED"]
---

# TL-5b: a mobile app is not released under a free-distribution licence

## Statement

A government mobile app declares a licence that keeps intellectual property rights with the agency.

## Check

Applies when `serviceType` is `mobile-app`. Fails when the `license` field of the JSON manifest at `manifestFile`, relative to the project root, is missing or not in `allowedLicences`.

Skips when `serviceType` is any other value. When `serviceType` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Avoid licences that permit free distribution.

## Not required for

None listed.

## Rationale

A manifest licence is the one signal that a script can read. `TL-5c` judges ownership in full.
