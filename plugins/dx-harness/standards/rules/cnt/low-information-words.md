---
code: CNT-6a
slug: low-information-words
control: CNT-6
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: CNT-6b
parameters:
  openers: [there is, there are, it is, this is]
  fillerWords: [just, really, very, please]
  pages: null
---

# CNT-6a: copy has no empty openers and no filler words

## Statement

Visible copy does not start a sentence with an empty opener, and does not use a filler word.

## Check

Applies when `pages` is set. Reads the visible English text of each page in `pages`, and splits it into sentences at `.`, `!`, and `?`. Reports:

- Each sentence that starts with a phrase from `openers`.
- Each word from `fillerWords`, at any position in a sentence.

Both match as whole words in any case. An opener in the middle of a sentence is not reported, because it is often the subject and verb of a clause. The rule does not read `code`, `pre`, `kbd`, `samp`, `script`, or `style` content.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Write "A field needs your attention", not "There is a problem with your form".
- Remove "just", "really", and "very". If the sentence then says less, choose a more exact word.
- Keep "in order to" out of `fillerWords`. `SLP-9` already reports it.

## Not required for

None listed.

## Rationale

An empty opener and a filler word make a sentence longer and say nothing more. `CNT-6b` judges the words that are too common to list, such as "that" and "the", and the cases where a word helps clarity.
