# Issue contract (shared procedure)

This is the shared home for reading an issue and turning it into a contract you can
build against. `dx-implement-issue` runs it once and passes the result to both
halves. `dx-write-tests` and `dx-write-implementation` run it themselves when
someone invokes them alone, so neither depends on the router having gone first.

Run it once per session. A half that receives the contract from the router does not
re-derive it.

## Step 1: Establish the input

The argument is either an issue number or a pasted markdown body.

- **Issue number**, such as `42`: run `gh issue view <number> --json number,title,body,labels,state,comments` and read what comes back.
  - If the command reports "command not found" or "'gh' is not recognized", ask the person to paste the issue body. Treat it as a pasted body, so omit the `Closes #NNN` line from the pull request.
  - If the command fails any other way, surface the real error and stop.
- **Pasted markdown body**: use it as the issue body. There is no issue number, so omit the `Closes #NNN` line from the pull request.

Read the comments in every case. A decision, a clarification, or a narrowed scope
often lives there rather than in the body, and a comment that contradicts the body
wins, because it came later.

## Step 2: Read the shape

The shape decides what you build against. The headings are authoritative, because
they are what you read the contract out of. A shape label (`story`, `task`, `chore`,
or `bug`) and a `skill:dx-create-*` label confirm the reading. A pasted body carries
neither, so never depend on them.

| Heading present | Shape | The contract |
| --- | --- | --- |
| `## User story` | Story | The acceptance criteria. `## Open questions` and `## Out of scope` bound it |
| `## Parent` | Task | The acceptance criteria, plus the optional `## Also true when done` checklist. Read the parent too with `gh issue view <parent>`, because a task only makes sense in the context of what it delivers |
| `## What is changing` | Chore | The `## Done when` list. There are no Given-When-Then scenarios, and inventing them wastes the run |
| `## Steps to reproduce` | Bug | The reproduction path plus the expected-versus-actual gap |

## Step 3: List the contract items

Write the items out in order: acceptance criteria scenarios on a story or a task,
done-when items on a chore, the reproduction path on a bug. Number them. Both halves
refer to an item by its number, and the coverage declaration in
[commit-discipline.md](commit-discipline.md) is keyed on it, so the numbering has to
be stable across the whole run.

An `## Also true when done` item on a task is a contract item too. It is a condition
a reviewer confirms by looking, so it might end up recorded as manual rather than
covered by a test.

## Step 4: Check the issue is ready

An issue is ready when it says what must be observably true once the work is done.
Judge that against the shape, and stop rather than filling a gap with a guess. A
guess made here surfaces as a rejected pull request, which costs far more than the
question.

- **Story or task**: at least one acceptance criteria scenario, written as observable behaviour rather than implementation. A task also needs its parent link.
- **Chore**: done-when items a reviewer could confirm by looking. "The environment is set up" is not a finish line. "A deploy to staging succeeds and the health endpoint returns 200" is.
- **Bug**: steps that reproduce the defect, and both halves of the expected-versus-actual gap. Reproduce it before changing anything. A fix you cannot see working is a guess, and the reproduction is also the first test you are about to write.

Two conditions stop the run whatever the shape:

- **Unresolved open questions.** A story carries them in `## Open questions` precisely so they are visible at this moment. Report them and ask which way to go, because they are decisions someone else owns.
- **Nothing checkable at all.** An issue written before these templates existed, or a body that is a paragraph of intent, cannot be implemented faithfully. Say what is missing and offer to shape it with `dx-create-story`, `dx-create-task`, `dx-create-chore`, or `dx-create-bug` rather than proceeding on inference.

## Step 5: Bind the agent patterns

Load the patterns that bind this session. They come from two places, read together:

- **The shipped standard**, at `../skills/engineering/dx-code-review/references/agent-pattern-standard.md` relative to this file. These are universal agent pathologies and they apply in every repository, including one that has never run a review.
- **The repository's observations**, at `review/agent-patterns.md` in the repository you are working in. This file holds only the patterns that repository has tripped over, so it is often absent, and its absence is normal rather than a problem.

```bash
ls review/agent-patterns.md
```

The repository's file is an overlay on the standard. Where both carry the same
`AP-NNN`, the repository's row wins, because it is the one with local counts and
status. A pattern in one and not the other binds as it stands.

Treat every active row's Prevention column as a binding constraint:

- **Skip any row whose `Status` is suppressed.** Reviewers in that repository rejected the pattern more often than they confirmed it, so it is not a constraint there. Its counts stay in the file as the record of that decision, not as an instruction to you.
- **A high `Confirmed by` count**, three reviews or more, marks a recurrent pattern. Apply extra scrutiny before any commit that touches the same angle. A pattern from the standard with no row in the overlay has been observed nowhere in that repository, so bind it without the extra scrutiny.
- Before each commit, verify that none of the bound patterns appear in the staged diff.
- If the correct implementation resembles a bound pattern, note the distinction in the commit message.

If `review/agent-patterns.md` does not exist, bind the standard alone. If the
standard cannot be found, say so and continue on whatever the repository's file
holds. A missing plugin asset is worth reporting, but it is not a reason to stop.

## Step 6: Read the code you are about to change

The issue names the surface, not the implementation, so the patterns come from the
repository:

- The files that already do the nearest thing, and the patterns they follow
- The current data model, if you are extending it
- The existing API shape, if you are adding an endpoint
- The conventions in the repository's own agent instructions, such as `CLAUDE.md` or `AGENTS.md`, especially for tests and commits

Do not skip this step. An agent that skips exploration produces code that compiles
but diverges from the patterns already in the repository.

## Step 7: Name the test stack

A contract item is testable only if something in this repository can run a test.
Settle that before anyone judges an item or writes a line, because the answer
decides both.

Record four things, and say where each came from:

| What | Where to look |
| --- | --- |
| The runner | The test dependencies in the package manifest, and the imports at the top of a test file already in the repository |
| The command that runs it | The repository's continuous integration configuration first, because that command is the one that gates a merge. Its package scripts second. Its agent instructions third |
| Where test files live | The paths of the tests already there: beside the source, or under a test directory |
| The naming convention | The filenames of those same tests, such as `*.test.ts`, `*_test.go`, or `test_*.py` |

Prefer what the repository does over what its documentation says. A `README` goes
stale; a test file that runs in continuous integration does not.

Then run the command once, before writing anything:

- **It runs and the suite is green.** The stack is confirmed. Continue.
- **It runs and something already fails.** Record which tests those are. A later step judges a new test by whether it fails, and it cannot tell your failure from one that was already there.
- **It does not run at all**, for example because dependencies are not installed. Say so and stop. This is a setup problem, and a test you write against a command you never ran is a guess.

### More than one runner

Many repositories have two or three: a unit runner, a browser or component runner,
and an end-to-end runner. Record each one with the command that invokes it, because
they answer different questions. A criterion about what a user sees needs the runner
that renders, and the unit runner cannot settle it however green it is.

### When there is no runner at all

Record it, and say what you looked at to reach that finding. Every contract item is
manual in a repository that cannot run a test.

Never install a runner, add a test dependency, or write a configuration file to
close this gap. Choosing a test framework sets how everyone in that repository
writes tests from then on, and that decision belongs to the people who work there.
Offer to file it as its own piece of work instead.

Do not decide the run's outcome here. This procedure reports the finding, and the
skill that called it says what happens next. A chore in a repository with no tests
is still buildable, so a blanket stop would refuse work that was never going to
carry a test.
