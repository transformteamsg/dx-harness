---
name: dx-create-chore
description: Use when you need to create a well-structured GitHub issue for a chore, maintenance work with no user-facing behaviour change, such as a dependency bump, cleanup, rename, config change, or version upgrade, for a coding agent to implement.
---

You are helping create a well-structured GitHub issue for a chore: maintenance work that keeps the codebase healthy but does not change what a user can observe. Dependency bumps, renames, dead-code removal, config changes, tooling upgrades. The issue will be implemented by a coding agent, so it must be complete enough to act on without follow-up questions.

A chore is deliberately lighter than a story or a task. There is no persona, because nobody outside the codebase experiences it directly. There are no Given-When-Then acceptance scenarios, because the value is not new behaviour but a clear change with a checkable finish line. The whole issue is three things: what is changing, why it is worth doing now, and how you know it is done.

If, while gathering the details, it becomes clear the work does change user-facing behaviour or needs behavioural acceptance criteria, this is not a chore. Say so and point the author at `dx-create-story` (for user-facing capability work) or `dx-create-task` (for a scoped engineering slice with its own acceptance criteria) rather than forcing it through this template.

Dependencies live outside the body: link blockers and dependents with GitHub's native issue relationships (the "Relationships" panel: blocked by / blocks), so the links stay accurate as issues move and close.

## Issue template

The canonical structure is in `issue-template.md` in this skill's directory. Read that file when constructing or previewing an issue body. Fill every section: if there is nothing to say, write `None`, do not delete the heading.

## Workflow

### Step 1: Gather the chore

Ask for the following. Do not invent answers: ask if the author has not provided them.

1. **Scope**: what area of the codebase does this touch (e.g. `deps`, `ci`, `session`, `eslint`)? This becomes the backticked scope in the title.
2. **What is changing**: the concrete change. Be specific: which package and version, which file or symbol renamed to what, which config key. "Bump `next` from 15.1 to 15.3", not "update dependencies".
3. **Why**: the reason to do this now. A security advisory, a deprecation, unblocking another change, removing a maintenance burden, correcting drift. If the honest answer is "no particular reason yet", that is worth surfacing: it may belong in the icebox rather than as an actionable issue.
4. **Done when**: at least one observable, independently checkable condition. Each item should be something a reviewer can confirm true or false by looking, not a restatement of the task. Prefer verifiable end states ("`pnpm build` passes with no deprecation warnings for `X`", "no references to `oldName` remain: `grep -r oldName` is empty") over effort descriptions ("updated the code").
5. **Out of scope**: anything adjacent that someone might assume is included but is not, or `None`. Chores drift easily ("while I'm in here..."), so an explicit boundary keeps the PR small and reviewable.

### Step 1b: Identify dependencies from the backlog

Chores are often blocked (a bump waits on a migration) or blocking (a rename must land before dependent work). Attempt to fetch open issues to surface likely relationships. These are linked as GitHub relationships after creation (Step 3), not written into the body.

```sh
gh issue list --state open --json number,title,body --limit 100
```

- **If the command succeeds**: compare each issue against this chore's scope and what is changing. For any that looks related, fetch its comments, since dependencies are often mentioned in discussion rather than the body:

  ```sh
  gh issue view <number> --json comments --jq '.comments[].body'
  ```

  Flag an issue as a likely **blocker** if it must land before this chore can be done safely. Flag it as a likely **dependent** if this chore unblocks it. Present findings before asking anything:

  > "I found these potentially related open issues:
  >
  > Possible blockers (this chore may depend on them):
  >
  > - #NNN: title
  >
  > Possible dependents (they may depend on this chore):
  >
  > - #NNN: title
  >
  > Are any of these actual dependencies, or are they unrelated?"

  Let the author confirm or dismiss each. Use the confirmed ones to link in Step 3. If nothing looks related, proceed without prompting: do not ask the author to confirm a null result.

- **If the command fails with "command not found" or "'gh' is not recognized"**: skip the automated scan. Ask the author to name any blocking or dependent issues manually, or confirm "none".
- **If the command fails for any other reason**: surface the real error and stop.

### Step 2: Preview and confirm

Render the complete issue body in a markdown code block and ask for confirmation before creating it.

### Step 3: Create the issue

The title must follow the commit convention from CLAUDE.md: `<type>(<scope>): <short description>` with backticks around the scope. Chores usually take the `chore` type (e.g. ``chore(`deps`): bump next from 15.1 to 15.3``), but use the type that matches the change: a build or tooling change may be `build` or `ci`, a pure refactor `refactor`. The scope is the area from Step 1.

The body is markdown containing backticks and other shell-special characters, so pass it via a file rather than inline: an inline `--body "..."` would let the shell interpret backticks as command substitution. Write the confirmed body to a temp file and create the issue with `--body-file`.

Ensure the usage-tracking label exists (idempotent: `gh label create` exits non-zero if it already exists, which `|| true` swallows), then create the issue with it:

```sh
gh label create "skill:dx-create-chore" --color ededed --description "Created with the dx-create-chore skill" 2>/dev/null || true

gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "skill:dx-create-chore"
```

The label makes usage queryable with `gh issue list --label "skill:dx-create-chore"` (exact, unlike free-text search), and the `*🤖 Generated with dx-create-chore*` footer gives human-readable attribution.

- **If the command succeeds**: print the issue URL. Then link any dependencies confirmed in Step 1b as GitHub relationships using the GraphQL `addBlockedBy` mutation. Resolve each issue number to its node ID first, then call the mutation:

  ```sh
  # Resolve an issue number to its node ID
  gh issue view <number> --json id --jq .id

  # This issue is BLOCKED BY #NNN
  gh api graphql -f query='mutation($issue:ID!,$blocker:ID!){addBlockedBy(input:{issueId:$issue,blockingIssueId:$blocker}){clientMutationId}}' -f issue=<this-issue-id> -f blocker=<blocker-id>

  # This issue BLOCKS #NNN (set the relationship on the dependent)
  gh api graphql -f query='mutation($issue:ID!,$blocker:ID!){addBlockedBy(input:{issueId:$issue,blockingIssueId:$blocker}){clientMutationId}}' -f issue=<dependent-id> -f blocker=<this-issue-id>
  ```

  If no dependencies were confirmed, skip this.
- **If the command fails with "command not found" or "'gh' is not recognized"**: render the issue title and body as markdown and instruct the author to create the issue manually via the GitHub web interface.
- **If the command fails for any other reason**: surface the real error and stop.

## Rules

- Never leave a section blank. Every section must be explicitly filled or marked `None`.
- Keep the done-when items verifiable: a reviewer should be able to confirm each is true or false by looking, not by trusting that work happened.
- If the work turns out to change user-facing behaviour or needs Given-When-Then scenarios, it is not a chore: redirect to `dx-create-story` or `dx-create-task`.
- Do not use em-dashes (`—`) in the issue title or body. Use colons, parentheses, or separate sentences instead.
- The PR that implements this issue will squash-merge using its title as the commit message, so the title must be a valid commit message.
