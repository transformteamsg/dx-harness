---
name: dx-implement-issue
description: Use when you need to Implement a GitHub issue in this repository. The argument is either an issue number or a pasted markdown body: $ARGUMENTS
---

## Step 1: Fetch and read the issue

Determine the input type:

- **Issue number** (e.g. `42`): attempt `gh issue view $ARGUMENTS --json number,title,body,labels,state,comments` and read the returned data.
  - If the command fails with "command not found" or "'gh' is not recognized": ask the user to paste the issue body directly. Treat it as a pasted markdown body — omit the `Closes #NNN` line from the draft PR.
  - If the command fails for any other reason: surface the real error and stop.
- **Markdown body** (pasted directly): use the pasted content as the issue body. There is no issue number — omit the `Closes #NNN` line from the draft PR.

In both cases, identify from the body and comments:

- The user story and acceptance criteria (author section)
- The grooming checklist state (checkboxes before the IMPLEMENTER divider)
- All implementer sections: technical context, data model, API contract, error contract, additional test scenarios, hard constraints
- Any clarifications, decisions, or additional constraints added in comments after grooming — these take precedence over the issue body if they conflict

## Step 2: Validate the grooming checklist

Find the grooming checklist in the issue. It has three items:

- `[ ] API contract filled or N/A confirmed`
- `[ ] Data model filled or N/A confirmed`
- `[ ] Patterns to follow named`

If any item is unchecked, stop. Report which items are unchecked and tell the developer to complete grooming before implementation begins. Do not proceed past this step until all items are checked.

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

Before writing any code, read the files named in the technical context sections. Understand:

- The existing patterns you are expected to follow (read the referenced files)
- The current data model if you are extending it
- The existing API shape if you are adding an endpoint
- The test conventions in CLAUDE.md

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

List the acceptance criteria scenarios in order. For each scenario, identify:

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
3. The instruction: run `/dx-harness:dx-split-issue $ARGUMENTS` to decompose the issue, groom the child issues, then return to `/dx-harness:dx-implement-issue` on each

If no signal is present, proceed to Step 6.

## Step 6: Implement

Work through the acceptance criteria scenarios in order, one at a time. For each:

1. Write the production code
2. Write the test
3. Confirm internally that the scenario is satisfied before moving to the next
4. Commit before moving to the next scenario

Follow all conventions in CLAUDE.md precisely:

- Keyed struct literals (field names always explicit)
- Test structure: one parent `Test<Func>` or `Test<Type>_<Method>`, all cases as `t.Run` subtests
- Assertion style: `want/got`, `want` on the left, failure message format `"want: %q; got: %q"`
- No em-dashes in code, comments, or documentation
- Commit message format: `<type>(<scope>): <message>` with backtick scope

Respect every hard constraint listed in the issue. If a constraint conflicts with an acceptance criteria scenario, stop and surface the conflict rather than resolving it silently.

### Commit discipline

One scenario, one commit. Each commit must leave the branch in a buildable, passing state — never commit code that breaks the test suite, even temporarily.

Commit messages are the primary history record that future coding agents will use to understand what was built and why. Write them with that reader in mind. The subject line names the behavior added, not the mechanism: `feat(\`assignments\`): reject submission after due date`not`feat(\`assignments\`): add due date check`. The subject line must be enough to understand the change without reading the diff.

If a scenario requires preparatory work (a new type, a schema change, a helper) that is not itself a user-observable behavior, commit the preparation separately before the scenario commit. Label it clearly: `refactor(\`assignments\`): extract due date validation into standalone function`. A future agent bisecting history needs to tell setup commits from behavior commits at a glance.

## Step 7: Cover additional test scenarios

After the acceptance criteria are implemented, add tests for the additional test scenarios listed in the implementer section. These cover non-user-observable cases (concurrent writes, boundary values, internal error paths) and follow the same assertion conventions.

## Step 8: Run the test suite

Run the exact commands listed in the issue's "Commands to run before marking ready for review" section. If that section is blank, run:

```
go test ./...
pnpm test
```

All tests must pass. If any test fails, fix it before proceeding. Do not open a PR with a failing test suite.

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
3. **Acceptance criteria coverage**: for each scenario, confirm it has an automated test
4. **PR**: the draft PR URL
5. **Manual verification required**: describe exactly what the developer must walk through before marking the PR ready for review, naming the repository's own dev command from its scripts rather than assuming one
