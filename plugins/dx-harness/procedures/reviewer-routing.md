# Reviewer routing (shared procedure)

Flag, per acceptance-criteria scenario, whether the work needs a human designer's
review before merge. This answers "can an engineer implement a PM-written UI issue
without designer input", and it is a judgment three skills make at different moments:

- `dx-create-story` and `dx-create-task` run it at intake, before Intent and Diverge
  happen solo, so the need is caught early rather than after the fact.
- `dx-design` runs it per scenario during its issue-initiated intake, where it feeds
  Phase 3's plan and Phase 6's pull request body.

Skip it for work with no user-facing surface: a CI job, a migration, backend
instrumentation.

## The table

| Criterion | Recommendation |
|---|---|
| New pattern not seen elsewhere in the codebase | Strongly recommended — route to designer |
| New user flow (not just a new component) | Strongly recommended — route to designer |
| Destructive or irreversible action | Strongly recommended — route to designer |
| Modification to existing UI with clear AC | Can defer — engineer reviews and ships directly |

Judge every scenario against all four criteria. One "strongly recommended" scenario
routes the work to a designer, and the default is silent: where every scenario can
defer, the run records nothing.

## What to do with the result

Write the recommendation and its reason where the calling skill puts it. This extends
the validation-needs flagging that a CMP-1 waiver already does for a new component not
in the manifest. The missing piece was turning that flag into an explicit
who-reviews-this decision, written down rather than left implicit.

This flags for review; it does not schedule an actual user-test session. That
scheduling mechanism does not exist in atelier today, and building one is out of
scope here: an open question for a future, separate decision, not a side effect of
this loop.
