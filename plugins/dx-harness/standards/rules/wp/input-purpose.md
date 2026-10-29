---
code: WP-10c
slug: input-purpose
dss: WP-10
tier: L1
check: lint
surface: rendered
engine: custom
parameters:
  pages: null
  purposeMap: { email: email, tel: tel, given-name: given-name, family-name: family-name, postal-code: postal-code, street-address: street-address }
---

# WP-10c: common inputs declare their purpose

## Statement

An input that collects common personal data carries the matching `autocomplete` token.

## Check

For each input whose `name`, `id`, or `type` matches a key of `purposeMap`, fails when `autocomplete` is missing or differs from the mapped token.

## Recommendations

- Add the token for each input that collects the user's own data.

## Not required for

None listed.

## Rationale

The DSS asks for the purpose of common inputs to be specified in code.
