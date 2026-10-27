---
code: WP-13b
dss: WP-13
tier: L1
check: lint
surface: project
engine: custom
parameters:
  tokenPairs: null
  normalRatio: 4.5
---

# WP-13b: declared colour token pairs meet the minimum contrast ratio

## Statement

Each foreground and background token pair that the project declares for text meets `normalRatio`.

## Check

Resolves each pair in `tokenPairs` and fails a pair below `normalRatio`. When `tokenPairs` is unset, the rule reports "not configured". The check ports `contrast.py`.

## Recommendations

- Check each token pair once, at the token.

## Not required for

- Text that is decorative and conveys no meaningful information.
- Text that is part of a component in an inactive state.

## Rationale

A token pair fails once for every page that uses it. The token check finds it earlier than the rendered check.
