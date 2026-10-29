---
code: PR-2d
slug: wogaa-sentiments-script
dss: PR-2
tier: L2
check: lint
surface: source
engine: custom
judgedRemainder: PR-2c
parameters:
  sentimentsScriptPattern: null
  pages: null
---

# PR-2d: the page loads the WOGAA Sentiments script

## Statement

Each public-facing HTML page loads the Whole-of-Government Application Analytics (WOGAA) Sentiments script.

## Check

Applies when `sentimentsScriptPattern` and `pages` are set. This check finds candidates and does not decide. It warns and never blocks.

Warns on a page in `pages` when no `<script>` tag has a `src` that matches `sentimentsScriptPattern`.

When `sentimentsScriptPattern` or `pages` is unset, the rule reports "not configured" and does not pass. The pattern is a regular expression tested against `src`. It is not published.

The rule cannot tell whether Sentiments is enabled in the WOGAA registration. `PR-2c` covers that.

## Recommendations

- Enable Sentiments for each registered service.
- Set `sentimentsScriptPattern` from the WOGAA setup guide.

## Not required for

None listed.

## Rationale

A page without the script cannot collect Sentiments. The script is a sign that Sentiments is on, not proof.
