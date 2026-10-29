---
code: TL-5a
slug: official-app-stores
dss: TL-5
tier: L1
check: lint
surface: project
engine: custom
parameters:
  serviceType: null
  storeListingFile: "store-listing.json"
  allowedStores: ["Apple App Store", "Google Play Store", "Huawei AppGallery"]
---

# TL-5a: a mobile app is distributed only through official app stores

## Statement

A government mobile app is distributed only through an allowed app store.

## Check

Applies when `serviceType` is `mobile-app`. Reads the `channels` list of the JSON file at `storeListingFile`, relative to the project root. Fails when the file or the list is missing, or when the list holds an entry that is not in `allowedStores`.

Skips when `serviceType` is any other value. When `serviceType` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Comply with the platform guidelines for official government endorsement.

## Not required for

None listed.

## Rationale

Users who install from an official store get an app that the agency published. `TL-5c` judges ownership and endorsement.
