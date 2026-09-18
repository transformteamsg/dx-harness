# Definition of done (shared procedure)

This is the shared home for what must be true before a piece of code ships.
`dx-implement-issue` applies it before a pull request opens, and `dx-create-pr`
answers to it in the test plan and the manual verification it writes.

Every item here is something a change to code makes true. An item that waits on a
machine, on a schedule, or on another person is not one of them, and none appears
below.

## The items

Each item carries the evidence a reader checks it by. That evidence is on the
branch or in its output, so nobody has to take the author's word for an item.

| ID | Item | How you check it |
| --- | --- | --- |
| DoD-1 | Every acceptance criterion is covered by a test or by a written manual case. | The coverage declaration in the branch's history, read against the numbered contract items. See [commit-discipline.md](commit-discipline.md). |
| DoD-2 | The cases nobody watches are covered too: boundaries, error paths and concurrent writes. | The test files the declaration names, read for a case per boundary and per error path the code introduced. |
| DoD-3 | All of the repository's own checks pass. | The output of each command `CONTRIBUTING.md` names, run on this branch. |
| DoD-4 | The change is scoped so that the diff touches only what the issue names. | `git diff` against the default branch, read against the issue's scope and its out-of-scope list. |
| DoD-5 | The branch carries one contract item per commit, and each commit leaves the suite passing. | `git log` on the branch, one subject line per contract item. See [commit-discipline.md](commit-discipline.md). |
| DoD-6 | Any documentation and comments the change made wrong are back in line. | The documents and comments the diff touches, read for a statement the change made false. |
| DoD-7 | In the commit that adds it, every new dependency has a stated reason. | The manifest diff, and the body of the commit that adds each entry. |

## What the contributing guide owns

`CONTRIBUTING.md`, in the repository you are working in, states which checks run
and what a pull request carries. DoD-3 points at it rather than carrying a second
copy of the check list, so a correction there reaches this procedure with no edit
here.

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
