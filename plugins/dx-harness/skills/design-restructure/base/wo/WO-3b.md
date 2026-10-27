---
code: WO-3b
dss: WO-3
tier: L2
check: lint
surface: source
engine: custom
judgedRemainder: WO-3a
parameters:
  keyEvents: [onKeyDown, onKeyPress, keydown, keypress]
  exemptSelectors: []
---

# WO-3b: key handlers do not test a single character without a modifier

## Statement

A key handler does not act on a single printable character with no modifier key held.

## Check

Finds a handler for an event in `keyEvents` that tests a single printable character, such as `key === "s"`, and does not test `ctrlKey`, `altKey`, or `metaKey`. Skips an element that matches a selector in `exemptSelectors`.

The rule finds candidates and does not decide. It warns and never blocks. `WO-3a` judges whether the shortcut can be disabled or remapped.

## Recommendations

- Require a modifier key for each shortcut.
- Provide a setting that turns single-key shortcuts off or remaps them.
- Limit a single-key shortcut to when its component has focus.

## Not required for

None listed.

## Rationale

A single-key shortcut can fire by mistake for speech input and keyboard users. A handler on a text field is often not a shortcut, so the rule leaves the decision to the author.
