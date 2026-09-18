# Definition of done (shared procedure)

This is the shared home for what must be true before a piece of code ships.
`dx-implement-issue` applies it before a pull request opens, and `dx-create-pr`
answers to it in the test plan and the manual verification it writes.

Every item here is something a change to code makes true. An item that waits on a
machine, on a schedule, or on another person is not one of them, and none appears
below.

## What the contributing guide owns

`CONTRIBUTING.md`, in the repository you are working in, states which checks run
and what a pull request carries. Two items point at it rather than carrying a
second copy of either list, so a correction there reaches this procedure with no
edit here.

Where the repository has no such file, take the checks from its continuous
integration configuration, because that is the set which gates a merge.

## Report against every item

State the result item by item, in the report that ends the run:

```
Definition of done, contract #142:
  DoD-1 satisfied: criteria 1 and 2 by tests/due-date.test.ts, criterion 3 by the manual case below
  DoD-2 satisfied: the boundary and the error path at tests/due-date.test.ts:44
  DoD-3 satisfied: lint, typecheck, and the suite pass
  DoD-4 satisfied: the diff reaches src/invoice.js and its test only
  DoD-5 satisfied: three commits, and each leaves the suite passing
  DoD-6 satisfied: no document states the old behaviour
  DoD-7 not applicable: the branch adds no dependency
```

Three rules hold:

- **Name every item.** An item left out of the report reads as satisfied.
- **Give the evidence, not the verdict.** Name the test, the file, the command output, or the commit that a reader looks at.
- **Mark an item the change does not reach as not applicable, and say why.** A branch that adds no dependency has nothing to state a reason for.

## An unsatisfied item stops the run

Where an item is not satisfied, say which item it is and why, and open no pull
request. A criterion with no test and no manual case is the recurring case.

A run that stops here is a complete outcome, not a failed one. The gap is a
decision for the developer: cover the item, record it as manual, or accept it and
say so.
