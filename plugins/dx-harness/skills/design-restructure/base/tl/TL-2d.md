---
code: TL-2d
dss: TL-2
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: TL-2c
parameters:
  logoFiles: null
  officialLogoHashes: null
---

# TL-2d: the logo file matches an official logo hash

## Statement

The logo file is byte-identical to an official logo of the agency or initiative.

## Check

Computes the SHA-256 hash of each file that matches the `logoFiles` glob. Fails when a hash is not in `officialLogoHashes`.

When `logoFiles` or `officialLogoHashes` is unset, the rule reports "not configured" and does not pass. Fails when the glob matches no file.

## Recommendations

- Copy the logo from the agency brand portal without editing it.
- Record the hash of each official logo file in `officialLogoHashes`.

## Not required for

None listed.

## Rationale

A modified or unofficial logo weakens trust in the service. `TL-2c` judges what a hash cannot decide, such as whether an official file is the right logo for the agency or initiative.
