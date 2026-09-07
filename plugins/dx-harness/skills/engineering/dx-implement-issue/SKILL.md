---
name: dx-implement-issue
description: 'Use when someone wants an existing GitHub issue built, for example "implement issue 142", "pick up this issue", "build the story in issue 98", or when they paste an issue body and ask for the code. Reads the issue, checks it is specific enough to build, plans against its acceptance criteria, then runs `dx-write-tests` and `dx-write-implementation` in that order so the tests exist before the code, runs the checks the repository defines, and opens a draft pull request through `dx-create-pr`. Picked up by an engineer or a coding agent. The argument is either an issue number or a pasted markdown body, given as $ARGUMENTS'
---

You are the front door for building an issue. You own the intake, the plan, the
decision about whether the issue is one change, and the pull request at the end. You
own no test writing and no code writing: those are two skills behind you, and they
run in a fixed order.

The order is the point. `dx-write-tests` runs first and leaves a branch whose tests
fail for the reasons the issue states. `dx-write-implementation` runs second and
works against those tests. A test written before the implementation exists cannot be
shaped to fit code that already passes, and that is what makes the coverage this run
reports mean something.

## Step 1: Read the issue and check it is ready

Run [../../../procedures/issue-contract.md](../../../procedures/issue-contract.md),
all six steps. It settles the input, the shape, the numbered contract items,
readiness, the agent patterns that bind this session, and the code the work touches.

You run this once. Both halves accept the result from you, so neither repeats it.

Stop if the contract is not ready. The procedure says what each shape needs and what
to offer when something is missing.

## Step 2: Plan

For each numbered contract item, state:

- What code needs to change or be created
- Which files are affected
- What the corresponding test will assert

State the plan before either half runs. If a half deviates from it, say why.

### Split evaluation

Evaluate the plan against these signals before anything is written:

- **No shared files**: two or more groups of items touch completely separate files, with no overlap
- **Independent data changes**: the plan needs more than one unrelated migration or schema change
- **Conflicting constraints**: hard constraints in the issue pull in opposite directions across items

If any signal is present, stop. Do not create a branch, write a test, or write code.
Report:

1. The proposed split: capability A with these items and these files, capability B with these items and these files
2. Which signal triggered the recommendation
3. The instruction: run `/dx-harness:dx-split-issue $ARGUMENTS` to cut the issue into task sub-issues, then return to `/dx-harness:dx-implement-issue` on each slice. The parent stays open and tracks them

This evaluation belongs here rather than in either half, because it decides whether
to build the work at all. Neither half can make that call from inside its own
part of it.

## Step 3: Create the branch

Derive the branch name from the issue title, following the repository's own naming
convention:

```
<type>/<short-description>
```

`<type>` matches the issue title prefix, such as `feat`, `fix`, `docs`, `refactor`,
`chore`, or `test`, and `<short-description>` is a kebab-case summary. Then:

```
git checkout -b <branch-name>
```

## Step 4: Run the test half

Run [../dx-write-tests/SKILL.md](../dx-write-tests/SKILL.md) and pass it the
numbered contract items, the shape, and the bound agent patterns, so it does not
repeat Step 1.

It returns a branch whose tests fail on their assertions, and a coverage declaration
in its final commit body naming which items it covered and which it recorded as
manual.

- **It reports items it could not automate**: that is the expected outcome, not a failure. Those items travel to the pull request body in Step 7.
- **It stops on a readiness gap or an ambiguous criterion**: surface that and stop. Do not proceed to the implementation half against a contract nobody has settled.

## Step 5: Run the implementation half

Run [../dx-write-implementation/SKILL.md](../dx-write-implementation/SKILL.md) and
pass it the same three things.

It reads the declaration, implements against the named tests, adds tests for the
paths its own code introduced, and runs the repository's checks.

- **It reports a contract item with no test**: carry that forward. Do not send it back to write the test, because a test written after the code does not carry the property Step 4 exists to produce. Decide with the developer whether the item ships uncovered, is recorded as manual, or sends the run back to Step 4 for a fresh test.
- **A check fails and it cannot fix it**: surface the failure and stop. Opening a pull request with a failing suite moves the work backwards, because the next person has to decide whether the failure is yours or theirs.

## Step 6: Open a draft pull request

Do not open it from here. `dx-create-pr` owns pull request creation, including the
body template, the draft state, the difference between a pull request and a GitLab
merge request, and the check for a request already open on the branch. Run
[../dx-create-pr/SKILL.md](../dx-create-pr/SKILL.md) and pass it:

- The issue number, so the title matches the issue title verbatim and the body carries a `Closes` line. If Step 1 worked from a pasted markdown body, say there is no issue number
- The contract items the two halves covered, and the test that covers each, so its test plan names them
- The manual items from the coverage declaration, in the words the test half wrote, for its Manual verification section
- The label `skill:implement-issue`, so this skill's usage stays queryable alongside the one `dx-create-pr` applies

Do not write a body template here. A second template is how the two drift apart.

- **The request opens**: go to Step 7.
- **`dx-create-pr` stops on an error**: surface that error and stop. Do not fall back to opening the request yourself.

## Step 7: Report

1. **Branch**: the branch name
2. **Files changed**: each file, and what changed
3. **Contract coverage**: each contract item, the test that covers it, and that it passes. On a task, each `Also true when done` item too, with how you checked it
4. **Uncovered**: any contract item neither half covered, and what you agreed to do about it
5. **Manual verification**: the manual items from the declaration, as what the developer walks through before marking the request ready. Name the repository's own dev command, taken from its scripts, rather than assuming one
6. **Pull request**: the draft request URL

## Running the halves yourself

Either half runs alone, and someone will do that. The common cases:

- **Tests first, code later or by someone else**: run `/dx-harness:dx-write-tests <issue>`. It leaves a committed red branch and names what continues.
- **The tests already exist**: run `/dx-harness:dx-write-implementation <issue>`. It reads the declaration from the history, so it works on a branch someone else left days ago.

Each half runs the intake itself when it is invoked directly. Nothing about this
skill is required for either to work, and neither half needs a second copy of what
it already read.

## Rules

- Run the halves in order. Tests first, always. An issue built code-first loses the only guarantee this split provides.
- Own the intake once. Pass the contract to both halves rather than letting either repeat it.
- The split evaluation runs before either half, and a signal stops the run.
- Never write a test or a line of production code from here.
- Carry an uncovered contract item into the report and the pull request. Do not resolve it by writing the test after the code.
- Carry the manual items through in the test half's own words, and never report manual verification as done because the suite passed.
