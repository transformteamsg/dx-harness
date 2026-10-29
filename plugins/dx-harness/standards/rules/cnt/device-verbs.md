---
code: CNT-5a
slug: device-verbs
control: CNT-5
tier: L2
check: lint
surface: rendered
engine: custom
judgedRemainder: CNT-5b
parameters:
  deviceVerbs: [click, clicks, clicked, clicking, tap, taps, tapped, tapping, swipe, swipes, swiped, swiping]
  pages: null
---

# CNT-5a: action words do not name the input device

## Statement

Visible copy names the action, such as "select", "choose", or "view", and not the input device.

## Check

Applies when `pages` is set. Reads the visible English text of each page in `pages`. Reports each word from `deviceVerbs`, matched as a whole word in any case, with the block of text that holds it.

The rule does not read link text. `WO-10c` checks link text, so a second check reports the same fault twice. The rule also does not read `code`, `pre`, `kbd`, `samp`, `script`, or `style` content, because that text is not copy.

When `pages` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Write "Select **Save**", not "Click **Save**".
- Write "Choose a card", not "Tap a card".
- Keep "press" and "see" out of `deviceVerbs`. They have common meanings that are not device actions, so `CNT-5b` judges them.

## Not required for

None listed.

## Rationale

A user can act with a mouse, a finger, a keyboard, or a voice. A device verb tells some users an action that they cannot do. `CNT-5b` judges the cases that a word list cannot decide.
