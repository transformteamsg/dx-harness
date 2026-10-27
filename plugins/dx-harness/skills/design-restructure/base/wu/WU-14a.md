---
code: WU-14a
dss: WU-14
tier: L1
check: lint
surface: project
engine: custom
parameters:
  authMethods: null
  accessibleMethods: ["singpass-qr", "otp-sms", "otp-email", "passkey", "magic-link"]
---

# WU-14a: one login method needs no memory or transcription

## Statement

A login offers at least one method that does not need memorising, solving, or typing a code by hand.

## Check

Applies when `authMethods` lists the login methods of the service. Fails when no entry is in `accessibleMethods`.

An unset `authMethods` reports "not configured". A service with no login lists none, and the rule does not apply.

## Recommendations

- Offer Singpass QR login.
- Offer a one-time code that arrives by text message or email.

## Not required for

None listed.

## Rationale

A cognitive test at login excludes some users. `WU-14c` judges tests that a method list does not show.
