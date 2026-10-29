---
code: CNT-12a
slug: sentence-case
control: CNT-12
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: CNT-12b
parameters:
  labelSelector: "h1, h2, h3, h4, h5, h6, button, label, legend, summary, caption, th, [role=tab], [role=menuitem]"
  properNouns: []
  pages: null
---

# CNT-12a: headings, labels, and buttons use sentence case

## Statement

Each heading, label, button, tab, and menu item capitalises its first word, its proper nouns, and its acronyms only.

## Check

Applies when `pages` is set. Reads the visible English text of each element that matches `labelSelector` on each page in `pages`. Removes each phrase from `properNouns`, and then reports the element when a word after the first starts with a capital letter and continues in lower case.

A word in capitals only, such as "CCE", is an acronym and is not reported. The word "I" is not reported. A word that starts a new sentence, after `.`, `!`, `?`, or `:`, is not reported.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Write "Submit your marks", not "Submit Your Marks".
- Add the name of each product, programme, and place that the copy uses to `properNouns`, such as `["Example Portal"]`.
- `TYP-4` reports text in capitals only. This rule reports Title Case, which `TYP-4` does not catch.

## Not required for

None listed.

## Rationale

Sentence case is easier to read and scan. When only proper nouns have a capital, the capital tells the user that a word is a name. Running prose holds many names that no list knows, so `CNT-12b` judges capitals in prose and in the labels that the selector misses.
