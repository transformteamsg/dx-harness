---
code: TL-6a
slug: store-account-agency-name
dss: TL-6
tier: L1
check: lint
surface: project
engine: custom
parameters:
  serviceType: null
  agencyName: null
  storeListingFile: "store-listing.json"
---

# TL-6a: the store developer account carries the agency name

## Statement

A mobile app is published under a developer account that has the agency name.

## Check

Applies when `serviceType` is `mobile-app`. Reads `developerName` from the JSON file at `storeListingFile`, relative to the project root. Fails when the file or the field is missing, or when the name does not equal `agencyName`, compared without case or surrounding whitespace.

Skips when `serviceType` is any other value. When `serviceType` or `agencyName` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Use the full agency name.

## Not required for

None listed.

## Rationale

Users check the developer name in a store listing. `TL-6b` judges whether the name is the full official name.
