---
code: WU-6a
dss: WU-6
tier: L1
check: lint
surface: source
engine: custom
parameters:
  inputHandlers: ["onChange", "onchange", "change"]
  inputControls: ["select", "input[type=checkbox]", "input[type=radio]", "input[type=text]"]
  contextChangeCalls: ["submit", "requestSubmit", "window.open", "location.assign", "location.href"]
---

# WU-6a: input does not change context without a confirm control

## Statement

A change of input does not submit, navigate, or open a window unless the form offers a confirm control.

## Check

Finds each handler in `inputHandlers` on a control that matches `inputControls`. Fails when its body calls a member of `contextChangeCalls`.

Passes when the same form has a submit button that performs the action.

## Recommendations

- Provide an explicit button to confirm the action.
- Tell users in advance when input changes the context.

## Not required for

None listed. Clicking a link or a button is not input for this control.

## Rationale

A control that acts on input surprises users who step through options. `WU-6b` judges whether an advance warning is clear.
