# Commit discipline (shared procedure)

This is the shared home for how `dx-write-tests` and `dx-write-implementation`
commit, and for the coverage declaration that passes between them. Both halves
reference this file rather than restating it, so a correction lands once.

## One contract item, one commit

Work through the contract items from [issue-contract.md](issue-contract.md) in
order, one at a time, and commit before moving to the next.

What "passing" means differs between the halves, and this is the one place the
difference matters:

- **`dx-write-tests` commits a red branch.** Each of its commits leaves the branch building, with the new tests failing for the reason the criterion states. That is the intended state, not a broken one.
- **`dx-write-implementation` commits a green branch.** Each of its commits leaves the branch building and the whole suite passing. Never commit code that breaks a test that was passing before you started.

## Subject lines

Commit messages are the primary history record for whoever comes next, whether that
is an engineer, a designer tracing a visual change, or a coding agent. Write them
with that reader in mind.

Follow the repository's own convention. Where it has none, use
`<type>(<scope>): <message>`. The subject line names the behaviour, not the
mechanism, and must be enough to understand the change without reading the diff:

```
feat(`assignments`): reject submission after due date     <- names the behaviour
feat(`assignments`): add due date check                   <- names the mechanism
```

Use no em dashes in a commit message, in code, or in a comment.

## Preparation commits

If an item needs preparatory work that nobody observes, such as a new type, a schema
change, or a helper, commit the preparation separately and first. Label it so the
difference is visible:

```
refactor(`assignments`): extract due date validation into standalone function
```

Someone bisecting the history needs to tell a setup commit from a behaviour commit
at a glance.

## The coverage declaration

`dx-write-tests` ends by declaring what it covered and what it could not. The
declaration goes in the body of its final commit. Nothing is written to a new file,
so nothing has to be cleaned out of the repository afterwards, and the record
survives a session boundary because it is in the history.

Write it in this shape:

```
test(`assignments`): cover the due-date criteria, failing

Covered by an automated test:
  1 reject submission after the due date -> tests/due-date.test.ts:12
  2 accept submission before the due date -> tests/due-date.test.ts:31

Recorded as manual, no automated test written:
  3 the overdue banner turns amber -> no headless renderer in this repository

Contract: #142. Written by dx-write-tests. No implementation on this branch yet.
```

When no test file was written at all, because every item is manual, the declaration
still needs a commit to live in. Make an empty one:

```bash
git commit --allow-empty -F <the message file>
```

An empty commit reads oddly until you know why it is there, so its subject says so:
`test(\`assignments\`): record every criterion as manual, no runner in this repository`.

Three rules hold:

- **Every contract item appears exactly once**, under one of the two headings, keyed by the number it has in the contract. An item under neither heading means the declaration is incomplete, and an item under both is a defect.
- **A manual item states why automation could not cover it**, not merely that it could not. "No headless renderer in this repository" is a reason. "Hard to test" is not.
- **Omit an empty heading.** A run that automated everything writes no manual section at all, rather than a heading with nothing under it.

## Reading the declaration back

`dx-write-implementation` recovers the declaration from the history rather than from
the session, so a half that ran days earlier is still readable:

```bash
git log --format='%H%n%B' origin/main..HEAD
```

Look for the commit whose body carries `Written by dx-write-tests`. If more than one
commit carries it, the newest wins, because a repeated test half means the earlier
declaration was superseded.

If no commit carries it, the test half never ran on this branch. That is a defined
state, and each half says what to do about it in its own steps.

The manual items are what a later run hands to the pull request body and to review.
Carry each one across with its action, its expected result, and its reason intact.
`dx-create-pr` owns the body and trims it to the house style, so a case can get
shorter on the way. It must never lose one of those three parts, get replaced by a
summary of the set, or be dropped.
