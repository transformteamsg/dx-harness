---
code: TL-6c
dss: TL-6
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: TL-6b
parameters:
  agencyName: null
  manifestFiles:
    - AndroidManifest.xml
    - Info.plist
    - app.json
    - manifest.json
---

# TL-6c: the manifest developer name equals the agency name

## Statement

The developer name in the app manifest is the agency name.

## Check

Reads the developer name from each file in `manifestFiles` that exists. Each entry is a path relative to the project root. JSON files: the first key `developerName`, `developer`, or `author`. Property list files: the key `DeveloperName`. Android XML files: a `<meta-data>` element named `developerName` or `developer`. Fails when a name does not equal `agencyName`, compared without case or surrounding whitespace.

When `agencyName` is unset, the rule reports "not configured" and does not pass. Fails when none of the files exists or none holds a developer name.

## Recommendations

- Use the full official agency name.
- Keep the name in the manifest the same as the name in the store listing.

## Not required for

None listed.

## Rationale

Users check the developer name of an app. `TL-6b` judges what a script cannot decide, whether the name is the full official name.
