---
code: MOT-2a
slug: motion-values-from-tokens
dss: MOT-2
tier: L2
check: lint
surface: source
engine: custom
judgedRemainder: MOT-2b
parameters:
  tokenPrefixes: [--motion-, --ease-]
  tokenFiles: []
  componentFiles: ["**/*"]
---

# MOT-2a: motion durations and easings come from the motion tokens

## Statement

Where a product declares a motion token set, each duration and easing in component code comes from a token of that set.

## Check

Applies when the project declares a motion token set: a custom property definition whose name starts with a prefix in `tokenPrefixes`, or a file that matches a glob in `tokenFiles`.

Reads the files that match a glob in `componentFiles`: CSS files, `<style>` blocks, inline `style` attributes, and the Tailwind classes of markup and script files. Fails each of these:

- A raw duration that is not zero. In a `transition` or `animation` shorthand, the first time of each item is the duration.
- A `cubic-bezier()` easing.
- The Tailwind class `duration-[...]` or `ease-[...]`, which holds a raw value.

Skips these, because they define the tokens:

- A file that matches a glob in `tokenFiles`.
- A custom property definition.
- A region between the comments `/* dx-tokens */` and `/* /dx-tokens */`.

The control is proposed, not ratified. The rule is tier L2, so it reports a warning and never blocks.

## Recommendations

- Use a motion token for each duration and easing, such as `transition: opacity var(--motion-fast) var(--ease-standard)`.
- Put the raw values in the token definitions only.

## Not required for

- A product that declares no motion token set. The rule does not apply, because a token set is design work, not a finding.
- A raw value with a recorded rationale.

## Rationale

Raw durations spread by copy and paste, so a product ends up with 200ms, 220ms, and 250ms for the same job. Tokens make motion a property of the system. The rule finds the raw values. `MOT-2b` judges whether a surface that animates declares a token set, and whether the narrative tier stays off task UI.
