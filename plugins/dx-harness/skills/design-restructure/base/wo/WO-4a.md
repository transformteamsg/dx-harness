---
code: WO-4a
dss: WO-4
tier: L1
check: lint
surface: rendered
engine: axe meta-refresh
parameters:
  maxRefreshDelaySeconds: 72000
  timeLimitExemption: null
  pages: null
---

# WO-4a: no timed page refresh or redirect

## Statement

A page does not refresh or redirect after a time limit that the user cannot control.

## Check

Applies when `timeLimitExemption` is set. Fails a page that has `<meta http-equiv="refresh">` with a delay above 0 and at or below `maxRefreshDelaySeconds`.

Skips when `timeLimitExemption` is `legal` or `real-time`. A value of `none` runs the rule. When `timeLimitExemption` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Avoid time-dependent functions unless they are necessary.
- Make each timer non-disruptive, and adjustable or extendable.

## Not required for

- A time limit that is mandatory for legal reasons.
- A time limit that is part of a real-time event, where an extension would invalidate the activity.
- A time limit longer than 20 hours.

## Rationale

Users who read or type slowly lose their work when a page moves on without them. `WO-4b` judges timers that are set in script.
