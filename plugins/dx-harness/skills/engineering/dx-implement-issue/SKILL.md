---
name: dx-implement-issue
description: Use when someone wants an existing GitHub issue built, for example "implement #142", "pick up this issue", "build the story in #98", or when they paste an issue body and ask for the code. Reads the issue, checks it is specific enough to build, plans against its acceptance criteria, implements one scenario per commit, runs the repository's checks, and opens a draft pull request. The argument is either an issue number or a pasted markdown body: $ARGUMENTS
---

## Step 1: Fetch and read the issue

Determine the input type:

- **Issue number** (for example `42`): attempt `gh issue view $ARGUMENTS --json number,title,body,labels,state,comments` and read the returned data.
  - If the command fails with "command not found" or "'gh' is not recognized": ask the user to paste the issue body directly. Treat it as a pasted markdown body, so omit the `Closes #NNN` line from the draft PR.
  - If the command fails for any other reason: surface the real error and stop.
- **Markdown body** (pasted directly): use the pasted content as the issue body. There is no issue number, so omit the `Closes #NNN` line from the draft PR.

In both cases, work out which shape of issue this is, because it decides what you are implementing against. The headings are authoritative, because they are what you read the contract out of. A shape label (`story`, `task`, `chore`, or `bug`) and a `skill:dx-create-*` label confirm the reading, and a pasted body has neither, so never depend on them:

- **Story** (`## User story`): the acceptance criteria are the contract. `## Open questions` and `## Out of scope` bound it.
- **Task** (`## Parent`): the acceptance criteria are the contract, and the optional `## Also true when done` checklist adds conditions a reviewer confirms by looking. Read the parent too (`gh issue view <parent>`), since a task only makes sense in the context of what it delivers.
- **Chore** (`## What is changing`): the `## Done when` list is the contract. There are no Given-When-Then scenarios, and inventing them wastes the run.
- **Bug** (`## Steps to reproduce`): the reproduction path plus the expected-versus-actual gap is the contract.

Read the comments in every case. A decision, a clarification, or a narrowed scope often lives there rather than in the body, and a comment that contradicts the body wins, because it came later.

## Step 2: Check the issue is ready to implement

An issue is ready when it says what must be observably true when the work is done. Judge that against the shape, and stop rather than filling a gap with a guess: a guess made here surfaces as a rejected pull request, which costs far more than the question.

- **Story or task**: at least one acceptance criteria scenario, written as observable behaviour rather than implementation. A task also needs its parent link.
- **Chore**: done-when items a reviewer could confirm by looking. "The environment is set up" is not a finish line; "a deploy to staging succeeds and the health endpoint returns 200" is.
- **Bug**: steps that reproduce the defect, and both halves of the expected-versus-actual gap. Reproduce it before changing anything. A fix you cannot see working is a guess, and the reproduction is also the test you are about to write.

Two conditions stop the run whatever the shape:

- **Unresolved open questions.** A story carries them in `## Open questions` precisely so they are visible at this moment. Report them and ask which way to go, because they are decisions someone else owns.
- **Nothing checkable at all.** An issue written before these templates existed, or a body that is a paragraph of intent, cannot be implemented faithfully. Say what is missing and offer to shape it with `dx-create-story`, `dx-create-task`, `dx-create-chore`, or `dx-create-bug` rather than proceeding on inference.

## Step 3: Explore the codebase

Before reading implementation files, load the agent patterns that bind this session. They come from two places, read together:

- **The shipped seeds**, at `../dx-code-review/assets/agent-patterns-seed.md` relative to this skill. These are universal agent pathologies and they apply in every repository, including one that has never run a review.
- **This repository's observations**, at `review/agent-patterns.md`. This file holds only the patterns this repository has actually tripped over, so it is often absent, and its absence is normal rather than a problem.

```bash
ls review/agent-patterns.md
```

The repository's file is an overlay on the seeds. Where both carry the same `AP-NNN`, the repository's row wins, because it is the one with local counts and status. A pattern in one and not the other simply binds as it stands.

Treat every **active** row's **Prevention** column as a binding constraint for this session:
- **Skip any row whose `Status` is suppressed.** Reviewers in this repository rejected that pattern more often than they confirmed it, so it is not a constraint here. Its counts stay in the file as the record of that decision, not as an instruction to you. This is how the overlay switches a shipped seed off as well as extending it.
- **High `Confirmed by` counts** (3+ reviews): these are recurrent patterns; apply extra scrutiny before any commit that touches the same Angle. A seed with no row here has been observed nowhere in this repository, so bind it without the extra scrutiny.
- Before each commit, verify that none of the listed patterns appear in the staged diff.
- If the correct implementation naturally resembles a listed pattern, note the distinction explicitly in the commit message.

If `review/agent-patterns.md` does not exist, bind the seeds alone. If the seed file cannot be found, say so and continue on whatever the repository's file holds: a missing plugin asset is worth reporting, but it is not a reason to stop implementing.

Before writing any code, read the code you are about to change. The issue names the surface, not the implementation, so the patterns come from the repository:

- The files that already do the nearest thing, and the patterns they follow
- The current data model if you are extending it
- The existing API shape if you are adding an endpoint
- The conventions in CLAUDE.md, especially for tests and commits

Do not skip this step. Agents that skip exploration produce code that compiles but diverges from established patterns.

## Step 4: Create the branch

Derive the branch name from the issue title following the naming convention in CLAUDE.md:

```
<type>/<short-description>
```

Where `<type>` matches the issue title prefix (`feat`, `fix`, `docs`, `refactor`, `chore`, `test`) and `<short-description>` is a kebab-case summary.

Run:

```
git checkout -b <branch-name>
```

## Step 5: Plan before coding

List the contract items in order: acceptance criteria scenarios on a story or task, done-when items on a chore, the reproduction path on a bug. For each one, identify:

- What code needs to change or be created
- Which file(s) are affected
- What the corresponding test will assert

State this plan before writing any code. If you deviate from it during implementation, note why.

### Split evaluation

After completing the plan, evaluate it against these signals before writing any code:

- **No shared files**: two or more groups of scenarios touch completely separate files with no overlap
- **Independent data changes**: the plan requires more than one unrelated migration or schema change
- **Conflicting constraints**: hard constraints in the issue pull in opposite directions across scenarios

If any signal is present, stop. Do not create a branch or write code. Report:

1. The proposed split: capability A (these scenarios, these files) and capability B (these scenarios, these files)
2. Which signal triggered the recommendation
3. The instruction: run `/dx-harness:dx-split-issue $ARGUMENTS` to cut the issue into task sub-issues, then return to `/dx-harness:dx-implement-issue` on each slice. The parent stays open and tracks them.

If no signal is present, proceed to Step 6.

## Step 6: Implement

Work through the contract items in order, one at a time. For each:

1. Write the production code
2. Write the test
3. Confirm internally that the scenario is satisfied before moving to the next
4. Commit before moving to the next scenario

Follow the conventions in CLAUDE.md precisely, and where it is silent, follow what the surrounding code already does. Naming, test structure, and assertion style are the repo's call, not this skill's, so read a neighbouring test before writing the first one. Two conventions hold regardless: commit messages are `<type>(<scope>): <message>` with a backticked scope, and no em-dashes in code, comments, or documentation.

Respect every constraint the issue states, including the `Also true when done` items on a task and the out-of-scope list on any shape. If a constraint conflicts with an acceptance criteria scenario, stop and surface the conflict rather than resolving it silently.

### Commit discipline

One contract item, one commit. Each commit must leave the branch in a buildable, passing state. Never commit code that breaks the test suite, even temporarily.

Commit messages are the primary history record that whoever comes next will use to understand what was built and why, whether that is an engineer, a designer tracing a visual change, or a coding agent. Write them with that reader in mind. The subject line names the behavior added, not the mechanism: `feat(\`assignments\`): reject submission after due date`not`feat(\`assignments\`): add due date check`. The subject line must be enough to understand the change without reading the diff.

If a scenario requires preparatory work (a new type, a schema change, a helper) that is not itself a user-observable behavior, commit the preparation separately before the scenario commit. Label it clearly: `refactor(\`assignments\`): extract due date validation into standalone function`. A future agent bisecting history needs to tell setup commits from behavior commits at a glance.

## Step 7: Cover what the criteria do not

Acceptance criteria describe what someone observes, so they rarely cover the cases nobody watches: concurrent writes, boundary values, internal error paths. Add tests for the ones that apply to what you built, following the repo's assertion conventions.

On a task, the `Also true when done` checklist belongs here too. Those items are conditions a reviewer confirms by looking, so confirm each one yourself and say so in the report. An item that can be tested rather than eyeballed is better as a test.

## Step 8: Run the checks the repository runs

Run what CI runs, so a green local run means a green pull request. CLAUDE.md and the `scripts` block in `package.json` (or the equivalent for the stack) name them: typically a lint, a typecheck, and the test suite.

All of them must pass. If one fails, fix it before proceeding. Opening a pull request with a failing suite moves the work backwards, because the next person has to decide whether the failure is yours or theirs.

## Step 9: Open a draft PR

Do not open the PR from here. `dx-create-pr` owns pull request creation, including the body template, the draft state, the platform difference between a pull request and a GitLab merge request, and the check for a request already open on this branch. Run [../dx-create-pr/SKILL.md](../dx-create-pr/SKILL.md) and pass it:

- The issue number, so the title matches the issue title verbatim and the body carries a `Closes` line. If Step 1 worked from a pasted markdown body, say there is no issue number.
- The acceptance criteria you covered in Steps 6 and 7, so its test plan names each one against the test that covers it.
- The label `skill:implement-issue`, so this skill's usage stays queryable alongside the one `dx-create-pr` applies.

Do not write a body template here. A second template is how the two drift apart.

- **If the PR opens**: proceed to Step 10.
- **If `dx-create-pr` stops on an error**: surface that error and stop. Do not fall back to opening the PR yourself.

## Step 10: Report to the developer

After the draft PR is open, report:

1. **Branch**: the branch name created
2. **Files changed**: each file and what changed
3. **Contract coverage**: for each acceptance criterion or done-when item, confirm it has an automated test. On a task, confirm each `Also true when done` item too, and say how you checked it
4. **PR**: the draft PR URL
5. **Manual verification required**: describe exactly what the developer must walk through before marking the PR ready for review, naming the repository's own dev command from its scripts rather than assuming one
