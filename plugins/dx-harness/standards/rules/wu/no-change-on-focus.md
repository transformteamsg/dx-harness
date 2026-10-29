---
code: WU-5a
slug: no-change-on-focus
dss: WU-5
tier: L1
check: lint
surface: source
engine: custom
parameters:
  focusHandlers: ["onFocus", "onfocus", "focus"]
  contextChangeCalls: ["submit", "requestSubmit", "window.open", "location.assign", "location.href", "focus"]
---

# WU-5a: focus does not change context

## Statement

Moving focus to a component does not submit a form, open a window, navigate, or move focus elsewhere.

## Check

Finds each handler named in `focusHandlers`. Fails when its body calls a member of `contextChangeCalls`.

## Recommendations

- Run the action on a button press or on an explicit confirm.
- Do not move focus from a handler that listens for focus.

## Not required for

None listed.

## Rationale

A change of context on focus disorients keyboard and screen reader users. `WU-5b` judges behaviour that a static check cannot trace.
