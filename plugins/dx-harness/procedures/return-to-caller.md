# Return-to-caller contract (shared procedure)

This file holds every payload that a design skill passes in `return-to-caller` mode:
the input each dispatched skill receives, and the output it returns. A skill that
dispatches another skill, or that is dispatched, names this file and lists no field
of its own.

A skill that needs a new payload field adds it to this file, not to its own text.

## The mode token

The caller passes the token `mode:return-to-caller` with the payload. The token
suppresses the dispatched skill's own interview, so nobody answers the same question
twice. Whoever started the run spawns the design reviewer once, per
`design-review.md`, beside this file. A dispatched skill never spawns it.

## The build input

A caller that dispatches `dx-design-execute` passes:

- The sprint contract, or the one-line intent for a modification
- The approved plan, or the accepted findings list with any granted waivers and the
  L1 approver, or the verbatim ask when it names a specific plan or chosen direction
- The surface's design ticket reference: an issue number or a local markdown path

## The pass input

A caller that dispatches a focused pass passes:

- The mode token
- The accepted issues for that pass
- The run's capture set, and its subset of the rules, per `capture.md`, beside this
  file

## The pass handoff

A pass that hands accepted findings to `dx-design-execute` passes the mode token,
the accepted findings, and the design-ticket reference. The person's acceptance of
each finding is the approval context that execute works from.

## The review bundle

`dx-design-execute` in this mode returns the review bundle to the caller: the built
changes, the sprint contract (or the one-line intent), the approved plan, the
component inventory, the in-scope judgment and hybrid controls, the waivers applied,
and the evidence captured.

The bundle is every input that reviewer dispatch in `design-review.md` requires. A
return of the changes and the evidence alone leaves the caller unable to dispatch
the reviewer.
