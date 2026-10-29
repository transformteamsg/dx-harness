---
code: WR-1a
slug: control-accessible-name
dss: WR-1
tier: L0
check: lint
surface: rendered
engine: axe button-name, link-name, input-button-name, select-name, label, aria-command-name, aria-input-field-name, aria-toggle-field-name, aria-dialog-name, aria-meter-name, aria-progressbar-name, aria-tooltip-name, aria-treeitem-name
redirects: [WO-12c]
parameters:
  pages: null
---

# WR-1a: every control has an accessible name

## Statement

Each control and custom component has a name that assistive technologies can read.

## Check

Applies when `pages` is set. Fails a control when the rendered page gives it no accessible name. When `pages` is unset, the rule reports "not configured" and does not pass. The engine rules cover native controls and elements with an ARIA widget role. The source twin is `eslint-plugin-jsx-a11y` `control-has-associated-label`, `label-has-associated-control`, and `anchor-has-content`, mapped to `WR-1a`.

## Recommendations

- Name a custom control with visible text, `aria-label`, or `aria-labelledby`.
- Use a standard HTML control where one exists.

## Not required for

None listed.

## Rationale

A control with no name is announced as "button" or "edit text". Users of assistive technologies cannot tell what it does. `WR-1e` judges whether the name describes the purpose.
