---
name: dx-write-implementation
description: 'Use when a branch already carries failing tests and someone wants the code that satisfies them, for example "make these tests pass", "implement against the red branch", "write the code for 142, the tests are already there", or "go green". Reads the coverage declaration the test half committed, writes production code against those tests only, and reports any contract item it found no test for instead of quietly writing one. Runs alone, or as the second half of `dx-implement-issue`. Picked up by an engineer or a coding agent. The argument is either an issue number or a pasted markdown body, given as $ARGUMENTS'
---

You write the production code that turns a red branch green. The tests are already
written, so what you have to satisfy is settled before you start.

## Step 1: Get the contract

**Called by `dx-implement-issue`**: it has already run the intake and hands you the
numbered contract items, the shape, the bound agent patterns, and the test stack.
Use them.

**Invoked alone**: run [../../../procedures/issue-contract.md](../../../procedures/issue-contract.md)
yourself, all seven steps.

## Step 2: Read the coverage declaration

Recover the declaration the test half wrote, with the command in
[../../../procedures/commit-discipline.md](../../../procedures/commit-discipline.md).
It tells you which contract items have a test, where each test is, and which items
were recorded as manual.

Three states, and each has a defined answer:

- **A declaration is present.** Use it as your work list. Go to Step 3.
- **No commit carries a declaration, and the suite has failing tests anyway.** Somebody wrote tests without the test half. Say so, list the failing tests you found, and treat them as the work list. Note in your report that no declaration backs them, so the manual items are unknown.
- **No declaration and no failing tests.** The test half never ran on this branch. Stop. Say that there is nothing to implement against, and that `/dx-harness:dx-write-tests <the same argument>` produces it. Do not write tests here to fill the gap.

## Step 3: Reconcile the declaration against the contract

Compare the declaration's items against the numbered contract items from Step 1.
This check runs before any code.

| What you find | What you do |
| --- | --- |
| Every contract item is covered or recorded as manual | Proceed to Step 4 |
| A contract item appears in neither place | Report it as an uncovered item and ask whether to proceed without it. Do not write its test |
| The declaration names an item the contract does not | Report it. The issue changed after the test half ran |

Report an uncovered contract item. Never close the gap by writing the missing test
yourself.

## Step 4: Implement against the tests

Take the covered items in the declaration's order. For each one:

1. Read the test named in the declaration, and read it as the specification. It is what the criterion means, in this repository's terms
2. Write the production code that makes it pass
3. Run the command the issue contract recorded. Confirm that test passes, and that nothing that was passing now fails
4. Commit, per [../../../procedures/commit-discipline.md](../../../procedures/commit-discipline.md)

Follow the conventions in the repository's own agent instructions, and where they
are silent, follow what the surrounding code already does.

Two limits hold throughout:

- **Do not edit a test to make it pass.** A test that is wrong is a question back to whoever wrote it, not something to adjust. The one exception is a test that does not compile, and even then you fix the compile error and leave the assertion exactly as it was.
- **The diff touches only what the contract names.** Respect every constraint the issue states, including its out-of-scope list. If a constraint conflicts with a contract item, stop and surface the conflict rather than resolving it silently.

## Step 5: Cover what the implementation revealed

Your code has paths nobody named: an internal error branch, a boundary the happy
path never reaches, a concurrent write. Add tests for the ones your implementation
introduced, following the repository's assertion conventions.

Keep the line between this and Step 3 clear:

- **A path your code introduced** is yours to test. It did not exist when the test half ran.
- **A contract item with no test** is not. That is Step 3's gap, and it gets reported.

List every test you added here in your report, separately from the ones the test
half wrote.

## Step 6: Run the checks the repository runs

Run what its continuous integration runs. The repository's agent instructions and
its package scripts name them: usually a lint, a typecheck, and the test suite.

All of them pass before you report. If one fails, fix it.

## Step 7: Report

1. **Branch**: the branch name
2. **Files changed**: each file, and what changed
3. **Coverage**: each contract item, the test that covers it, and that it now passes
4. **Uncovered**: any contract item with no test, from Step 3, and that you did not write one
5. **Tests you added**: the ones from Step 5, marked as written after the code
6. **Manual items**: carried through from the declaration, in the words the test half wrote
7. **Checks**: each command you ran and its result

**Called by `dx-implement-issue`**: hand this back and stop. The router opens the
pull request.

**Invoked alone**: say that the branch is green and that
`/dx-harness:dx-create-pr` opens the request. Do not open it yourself.

## Rules

- Read the coverage declaration before writing any code. It is the work list.
- Report a contract item with no test. Never write the missing test yourself.
- Never edit a test to make it pass. A wrong test is a question, not a task.
- A test you add covers a path your own implementation introduced, and your report says so.
- Every commit leaves the suite passing, and the checks pass before you report.
- Carry the manual items through unchanged.
