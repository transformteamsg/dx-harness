---
name: dx-create-chore
description: Use when you need to create a well-structured GitHub issue for a chore, work with no user-facing behaviour change, such as a dependency bump, cleanup, rename, config change, version upgrade, or infrastructure and environment work (standing up a dev, staging, or test environment, a deployment pipeline, a bucket or network policy), for whoever picks it up: an engineer or a coding agent.
---

You are helping create a well-structured GitHub issue for a chore: work that keeps the system healthy without changing what a user can observe in the product. Dependency bumps, renames, dead-code removal, config changes, tooling upgrades. It covers the infrastructure around the code just as much as the code: provisioning a dev, staging, or test environment, standing up a deployment pipeline, tightening a bucket policy, putting a service behind a load balancer. The issue will be picked up by an engineer or a coding agent, so it must be complete enough to act on without follow-up questions. An engineer reading it will also judge whether the change is worth making now, which is what the `Why` section is for: write it to be argued with, not just read.

A chore is deliberately lighter than a story or a task. There is no persona, because nobody outside the team experiences it directly. There are no Given-When-Then acceptance scenarios, because the value is not new behaviour but a clear change with a checkable finish line. The whole issue is three things: what is changing, why it is worth doing now, and how you know it is done.

If, while gathering the details, it becomes clear the work does change user-facing behaviour or needs behavioural acceptance criteria, this is not a chore. Say so and point the author at `dx-create-story` (for user-facing capability work) or `dx-create-task` (for a scoped slice with its own acceptance criteria) rather than forcing it through this template.

Dependencies live outside the body: link blockers and dependents with GitHub's native issue relationships (the "Relationships" panel: blocked by / blocks), so the links stay accurate as issues move and close.

## Chore, or task?

Settle this before gathering anything, because it decides which skill writes the issue. The deciding question is not which technology the work touches. It is whether something bigger already tracks it.

- **Nothing bigger tracks it and it is deliverable on its own**: a chore. "Bump `next` from 15.1 to 15.3." "Give the API a staging environment."
- **It is one slice of something already tracked**, a story or another chore: a task. Stop, say so, and point the author at `dx-create-task`, which links it to that parent so the parent's progress reflects it.
- **It is an umbrella that needs several independently deliverable pieces**: the umbrella is the chore, and each piece is a task hanging off it. "Set up the dev environment" is the chore; "provision the S3 bucket", "stand up the ECS service", "configure the ALB", "configure the WAF" are tasks under it.

Infrastructure and deployment work lands in all three, which is exactly why the technology is not the signal. Provisioning a queue so a new user-facing capability can ship is a task under that story. Provisioning the same queue to retire a cron job nobody sees is a chore. Ask what the work serves, not what it configures.

An umbrella chore is still one issue with one finish line, so keep its Done when about the end state of the whole thing ("a deploy to dev succeeds end to end and the health check returns 200") rather than restating its slices. Each slice carries its own criteria in its own task.

## Issue template

The canonical structure is in [references/issue-template.md](references/issue-template.md). Read that file when constructing or previewing an issue body. Fill every section: if there is nothing to say, write `None`, do not delete the heading.

## Workflow

### Step 1: Gather the chore

Ask for the following. Do not invent answers: ask if the author has not provided them.

1. **Scope**: what area does this touch (e.g. `deps`, `ci`, `session`, `eslint`, or for infrastructure work `infra`, `deploy`, `terraform`, `env`)? This becomes the backticked scope in the title.
2. **What is changing**: the concrete change. Be specific: which package and version, which file or symbol renamed to what, which config key, which resource in which environment. "Bump `next` from 15.1 to 15.3", not "update dependencies". "Give the API a staging environment on ECS behind an ALB", not "set up staging".
3. **Why**: the reason to do this now. A security advisory, a deprecation, unblocking another change, removing a maintenance burden, correcting drift, giving the team somewhere to test before production. If the honest answer is "no particular reason yet", that is worth surfacing: it may belong in the icebox rather than as an actionable issue.
4. **Done when**: at least one observable, independently checkable condition. Each item should be something a reviewer can confirm true or false by looking, not a restatement of the task. Prefer verifiable end states ("`pnpm build` passes with no deprecation warnings for `X`", "no references to `oldName` remain: `grep -r oldName` is empty") over effort descriptions ("updated the code").

   Infrastructure work needs the same discipline and slips out of it easily, because "the environment is set up" feels like an end state and is not one. Name what holds afterwards: "a deploy to staging from `main` succeeds and the health endpoint returns 200 from outside the VPC", "`terraform plan` reports no changes on a clean checkout", "the bucket denies public reads", "the environment is reachable only through the ALB, not by direct instance IP". Where the resource is defined as code, say so, since "created it by hand in the console" and "declared it in Terraform" are different finish lines.
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

The title must follow the commit convention from CLAUDE.md: `<type>(<scope>): <short description>` with backticks around the scope. Chores usually take the `chore` type (e.g. ``chore(`deps`): bump next from 15.1 to 15.3``), but use the type that matches the change: a build or tooling change may be `build` or `ci`, a pure refactor `refactor`, infrastructure work `chore` or `infra` if the repo's convention has it. The scope is the area from Step 1.

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

  If this is an umbrella chore, hand its pieces off explicitly rather than leaving them in the conversation, where they get lost:

  > "#NNN is the umbrella. The pieces you named are separate slices: provision the S3 bucket, stand up the ECS service, configure the ALB, configure the WAF. Create each with `dx-create-task` against #NNN and they will show as sub-issues, so this chore's progress tracks them."

  List the pieces the author actually named, in their words. Do not create those tasks here: `dx-create-task` gathers its own criteria per slice, and filing them silently would produce issues nobody has scoped.
- **If the command fails with "command not found" or "'gh' is not recognized"**: render the issue title and body as markdown and instruct the author to create the issue manually via the GitHub web interface.
- **If the command fails for any other reason**: surface the real error and stop.

## Rules

- Never leave a section blank. Every section must be explicitly filled or marked `None`.
- Keep the done-when items verifiable: a reviewer should be able to confirm each is true or false by looking, not by trusting that work happened. "The environment is set up" is not a finish line; "a deploy to staging succeeds and the health endpoint returns 200" is.
- If the work turns out to change user-facing behaviour or needs Given-When-Then scenarios, it is not a chore: redirect to `dx-create-story` or `dx-create-task`.
- Decide chore or task on whether something bigger already tracks the work, never on the technology it touches. Infrastructure and deployment work can be either.
- An umbrella chore hands its pieces to `dx-create-task` as sub-issues instead of swelling into one long done-when list that no single PR can close.
- Do not use em-dashes (`—`) in the issue title or body. Use colons, parentheses, or separate sentences instead.
- The PR that implements this issue will squash-merge using its title as the commit message, so the title must be a valid commit message.
