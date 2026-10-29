---
code: WO-17a
slug: motion-listeners
dss: WO-17
tier: L1
check: lint
surface: source
engine: custom
parameters:
  motionEvents: [devicemotion, deviceorientation, ondevicemotion, ondeviceorientation]
  motionEssential: null
---

# WO-17a: motion listeners are flagged

## Statement

Each listener for a device motion event is reported so that the author confirms an alternative control.

## Check

Applies when `motionEssential` is set. Fails each `addEventListener` call, or handler property, for an event in `motionEvents`.

Skips when `motionEssential` is `true`. A value of `false` runs the rule. When `motionEssential` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Provide a setting that disables motion actuation.
- Offer a user interface control that does the same thing.

## Not required for

- A feature where motion is essential, such as a pedometer that needs device motion to count steps.

## Rationale

The rule finds the listener. `WO-17b` judges whether a setting and an alternative control exist.
