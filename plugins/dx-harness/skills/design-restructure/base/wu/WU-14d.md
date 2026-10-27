---
code: WU-14d
dss: WU-14
tier: L1
check: lint
surface: source
engine: custom
judgedRemainder: WU-14c
parameters:
  captchaPatterns: ["recaptcha", "hcaptcha", "turnstile", "funcaptcha"]
  loginPages: null
---

# WU-14d: the login page has no known CAPTCHA

## Statement

A login page loads no known Completely Automated Public Turing test to tell Computers and Humans Apart (CAPTCHA).

## Check

Applies when `loginPages` lists pages. For each page, fails when it loads a script or embeds a frame whose URL contains a value in `captchaPatterns`.

The paste and `autocomplete` conditions on the password field are checked by `WU-14b` on every page, so this rule does not repeat them.

When `loginPages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Replace the CAPTCHA with a method that needs no cognitive test, such as a passkey or an email link.
- Let a password manager fill the password field.

## Not required for

None listed.

## Rationale

A CAPTCHA asks users to solve a puzzle or transcribe text. `WU-14c` still judges the cognitive tests that a script cannot find.
