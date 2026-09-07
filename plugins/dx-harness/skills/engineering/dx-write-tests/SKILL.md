---
name: dx-write-tests
description: 'Use when someone wants the tests for an issue written before any implementation exists, for example "write the tests for 142 first", "give me a failing test per acceptance criterion", "red branch for this issue", or "TDD this issue". Writes one failing test per contract item, records the items automation cannot settle instead of faking an assertion, and commits the branch in that failing state with a coverage declaration. Runs alone, or as the first half of `dx-implement-issue`. Picked up by an engineer or a coding agent. The argument is either an issue number or a pasted markdown body, given as $ARGUMENTS'
---

You write the tests and nothing else. No production code leaves this run, and that
is the point: a test written before the implementation exists cannot be shaped to
fit code that already passes.

The run ends with a branch that builds, tests that fail for the reasons the issue
states, and a written declaration of which contract items you covered and which you
could not. `dx-write-implementation` reads that declaration and works against it.

## Step 1: Get the contract

**Called by `dx-implement-issue`**: it has already run the intake and hands you the
numbered contract items, the shape, and the bound agent patterns. Use them. Do not
re-derive them.

**Invoked alone**: run [../../../procedures/issue-contract.md](../../../procedures/issue-contract.md)
yourself, all six steps. It settles the input, the shape, the numbered contract
items, readiness, the agent patterns, and the code you are about to touch.

Either way, stop if the contract is not ready. A readiness gap is a question for
whoever wrote the issue, and writing tests against a guess produces tests that pass
against the wrong behaviour.

## Step 2: Check the branch

You are about to commit. Run `git status` and `git branch --show-current`.

- **On the repository's default branch**: create a branch before writing anything. Take the type from the issue title prefix and a kebab-case summary after it, following the repository's own naming convention.
- **On a branch that already carries a coverage declaration**: a test half has run here before. Read it with the command in [../../../procedures/commit-discipline.md](../../../procedures/commit-discipline.md), say which items it already covers, and ask whether you are adding to it or replacing it. Do not silently write a second set of tests for the same item.

## Step 3: Judge each contract item

Take the items in order. For each one, decide whether an automated test can settle
it in this repository, and say which on what evidence.

An item is automatable when a test can observe the thing the criterion names. Look
at what the repository already tests before you decide, because the answer is a
property of the repository and not of the criterion. A repository with a browser
test runner can automate "the banner turns amber"; one with a unit runner only
cannot.

An item is not automatable when settling it needs a person to look, to judge, or to
reach something the test environment does not have. The recurring cases:

- **Visual appearance** with no rendering test runner present
- **A third-party system** with no sandbox, no fixture, and no recorded interaction
- **A judgement call**, such as whether an error message is clear enough to act on
- **A condition a reviewer confirms by looking**, which is what many `Also true when done` items on a task are
- **Something the test environment cannot reach**, such as production data or a device capability

Write no test for an item in that group. Record it as manual with the reason, and
carry it to Step 6.

The one thing you must not do is write an assertion that passes without exercising
the behaviour. A test that asserts a function was called, when the criterion is
about what the user sees, reports coverage the run does not have. That is worse than
the honest gap, because the gap is visible and the false pass is not.

## Step 4: Write one failing test per automatable item

Read a neighbouring test before you write the first one. Naming, structure, and
assertion style are the repository's call, not this skill's.

Write the test against the behaviour the criterion names, not against an
implementation you are imagining. A Given-When-Then scenario translates directly:
the Given is the setup, the When is the call, and the Then is the assertion.

Where the criterion is a bug reproduction, the reproduction is the test. Write it so
it fails on the current code in the way the bug report describes.

## Step 5: Confirm each test fails for the right reason

Run the suite and read each failure message. A test must fail because the behaviour
is absent, not because the file does not compile.

| Failure | Verdict |
| --- | --- |
| The assertion ran and the value was wrong or missing | Correct. This is the state to commit |
| A missing import, an undefined symbol, or a syntax error | Not yet correct. Fix the test so it reaches its assertion |
| The test passed | Either the behaviour is already there, or the assertion is vacuous. Settle which before continuing |

A test that passed needs an answer, not a note. If the behaviour already exists,
say so and ask whether the criterion is already met. If the assertion is vacuous,
rewrite it.

Where a test cannot reach its assertion without the production code existing, write
the smallest declaration the compiler needs, such as an exported signature that
throws. Commit that as a preparation commit, per
[../../../procedures/commit-discipline.md](../../../procedures/commit-discipline.md),
and keep the behaviour out of it. A signature is not an implementation.

## Step 6: Commit the red branch with the declaration

Commit per [../../../procedures/commit-discipline.md](../../../procedures/commit-discipline.md).
One contract item, one commit, and the coverage declaration in the body of the final
commit.

The declaration is the handoff, so it has to be complete. Every contract item
appears exactly once, either as covered with the `file:line` of its test, or as
manual with the reason automation could not settle it.

## Step 7: Report, and name what continues

Say plainly what state the branch is in, because someone reading this later has to
know that the failing tests are deliberate:

1. **Branch**: the branch name, and that it carries failing tests and no implementation
2. **Covered**: each contract item with the test that covers it
3. **Manual**: each item you could not automate, with the reason
4. **Continue with**: `/dx-harness:dx-write-implementation <the same argument>`

Report the manual items even when the person seems to want only the tests. They are
the half of the contract no test will ever cover, and they are what the pull request
body and the review both read later.

Never report the work as implemented. Nothing on this branch implements anything,
and a report that reads as finished is how a red branch reaches review.

## Rules

- Write tests only. No production code, beyond the minimum declaration a test needs to reach its assertion.
- Every contract item ends up covered or recorded as manual. An item in neither place means the run is not finished.
- Never write an assertion that passes without exercising the behaviour the criterion names.
- Confirm each test fails on its assertion before committing, not on a compile error.
- The coverage declaration goes in the final commit body, never into a new file in the repository.
- Report the branch as failing by design, and name the command that continues.
