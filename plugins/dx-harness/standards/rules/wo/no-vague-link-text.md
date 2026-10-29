---
code: WO-10c
slug: no-vague-link-text
dss: WO-10
tier: L1
check: lint
surface: source
engine: jsx-a11y anchor-ambiguous-text
parameters:
  vagueLinkWords: ["click here", "here", "read more", "more", "learn more", "link"]
---

# WO-10c: link text is not vague

## Statement

Link text does not match a word from the vague-word list.

## Check

Fails a link whose text, ignoring case and punctuation, equals an entry in `vagueLinkWords`.

## Recommendations

- Avoid vague link text such as "click here" or "read more".
- Write link text that makes sense on its own.

## Not required for

None listed.

## Rationale

Users who list the links on a page see only the link text. `WO-10d` judges whether the text names the purpose.
