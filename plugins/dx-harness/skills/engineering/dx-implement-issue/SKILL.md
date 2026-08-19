---
name: dx-implement-issue
description: Use when someone wants an existing GitHub issue built, for example "implement #142", "pick up this issue", "build the story in #98", or when they paste an issue body and ask for the code. Reads the issue, checks it is specific enough to build, plans against its acceptance criteria, implements one scenario per commit, runs the repository's checks, and opens a draft pull request. The argument is either an issue number or a pasted markdown body: $ARGUMENTS
---

## Step 1: Fetch and read the issue

Determine the input type:

- **Issue number** (e.g. `42`): attempt `gh issue view $ARGUMENTS --json number,title,body,labels,state,comments` and read the returned data.
  - If the command fails with "command not found" or "'gh' is not recognized": ask the user to paste the issue body directly. Treat it as a pasted markdown body, so omit the `Closes #NNN` line from the draft PR.
  - If the command fails for any other reason: surface the real error and stop.
- **Markdown body** (pasted directly): use the pasted content as the issue body. There is no issue number, so omit the `Closes #NNN` line from the draft PR.

In both cases, work out which shape of issue this is, because it decides what you are implementing against. The headings tell you, and a `skill:dx-create-*` label confirms it:

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

Before reading implementation files, check whether this project has accumulated agent-pattern history:

```bash
ls review/agent-patterns.md
```

If the file exists, read its full contents. Treat every row's **Prevention** column as a binding constraint for this session:
- **High `Confirmed by` counts** (3+ reviews): these are recurrent patterns; apply extra scrutiny before any commit that touches the same Angle.
- Before each commit, verify that none of the listed patterns appear in the staged diff.
- If the correct implementation naturally resembles a listed pattern, note the distinction explicitly in the commit message.

If the file does not exist, proceed normally.

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

Acceptance criteria describe what someone observes, so they rarely cover the cases nobody watches: concurrent writes, boundary values, internal error paths. Add tests for the ones that apply to what you just built, following the repo's assertion conventions.

On a task, the `Also true when done` checklist belongs here too. Those items are conditions a reviewer confirms by looking, so confirm each one yourself and say so in the report. An item that can be tested rather than eyeballed is better as a test.

## Step 8: Run the checks the repository runs

Run what CI runs, so a green local run means a green pull request. CLAUDE.md and the `scripts` block in `package.json` (or the equivalent for the stack) name them: typically a lint, a typecheck, and the test suite.

All of them must pass. If one fails, fix it before proceeding. Opening a pull request with a failing suite moves the work backwards, because the next person has to decide whether the failure is yours or theirs.

## Step 9: Open a draft PR

The title must match the issue title exactly, because it becomes the squash-merge commit message in `main`. Fill in the body sections before running this command.

Ensure the usage-tracking label exists first (idempotent, because `|| true` swallows the error if it already exists):

```
gh label create "skill:implement-issue" --color ededed --description "Opened with the implement-issue skill" 2>/dev/null || true
```

Then create the PR with the label. The label makes usage queryable with `gh pr list --label "skill:implement-issue"`, and the footer in the body gives human-readable attribution.

```
gh pr create --draft \
  --title "<issue title verbatim>" \
  --label "skill:implement-issue" \
  --body "$(cat <<'EOF'
Closes #$ARGUMENTS

## Summary

<!-- 1-3 bullet points describing what was implemented -->

## Changes

<!-- Concrete list: file changed and why -->

## Test plan

<!-- For each acceptance criterion, done-when item, or the bug's reproduction: name it and confirm it has an automated test -->

---

> **Before marking ready for review**: run `pnpm dev:all` and manually walk through the golden-path scenario. Automated tests cover correctness; this step covers integration and visual behaviour.

*🤖 Generated with implement-issue*
EOF
)"
```

- **If the command succeeds**: proceed to Step 10.
- **If the command fails with "command not found" or "'gh' is not recognized"**: render the PR title and body as markdown and instruct the user to create the draft PR manually via the GitHub web interface.
- **If the command fails for any other reason**: surface the real error and stop.

## Step 10: Report to the developer

After the draft PR is open, report:

1. **Branch**: the branch name created
2. **Files changed**: each file and what changed
3. **Contract coverage**: for each acceptance criterion or done-when item, confirm it has an automated test. On a task, confirm each `Also true when done` item too, and say how you checked it
4. **PR**: the draft PR URL
5. **Manual verification required**: describe exactly what the developer must walk through in `pnpm dev:all` before marking the PR ready for review
