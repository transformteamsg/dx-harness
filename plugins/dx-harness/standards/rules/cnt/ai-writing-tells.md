---
code: CNT-15a
slug: ai-writing-tells
control: SLP-9
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: CNT-15b
parameters:
  pages: null
  buzzwords: ["streamline", "streamlined", "empower", "supercharge", "effortless", "effortlessly", "seamless", "seamlessly", "world-class", "revolutionise", "leverage", "unlock", "elevate"]
  aiVocabulary: ["delve", "robust", "intricate", "foster", "vibrant", "pivotal", "testament", "landscape"]
  filler: ["in order to", "it is important to note", "at this point in time", "due to the fact that"]
  chatbot: ["great question", "i hope this helps", "let me know if", "certainly!", "you're absolutely right"]
  maxEmDashes: 1
---

# CNT-15a: copy has no buzzword, filler, chatbot phrase, or em dash chain

## Statement

Visible text does not use a marketing buzzword, a word from the AI vocabulary list, a filler phrase, or a chatbot phrase. A sentence has no chain of em dashes.

## Check

Applies when `pages` is set. Renders each page in `pages` at 1280 by 800 pixels, and reads the visible text of each text node.

- Fails a word from `buzzwords` or `aiVocabulary`, as a whole word with no case.
- Fails a phrase from `filler` or `chatbot`, as a substring with no case.
- Fails a sentence that has more than `maxEmDashes` em dashes.

A text node is read on its own, so a phrase that crosses an inline element is not found.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Say what the product does, once, in plain words. "Save marks" is better than "Effortlessly streamline your workflow".
- Remove a filler phrase. "To" does the work of "in order to".
- Split a sentence with an em dash chain into two or more sentences.

## Not required for

None listed.

## Rationale

Buzzword copy reads as generated and tells the user nothing. The lists are parameters, so a product can add the words of its own domain. `CNT-15b` judges the tells that a list cannot find: negative parallelism, forced triads, copula avoidance, significance inflation, a label and a helper text that say the same thing, and a marketing tone.
