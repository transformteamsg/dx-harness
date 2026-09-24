---
name: dx-create-story
description: 'Use when you need to create a well-structured GitHub issue for user-facing feature or capability work, the "As a [user persona], I want..." story shape, for whoever delivers it: an engineer, a designer, a product manager, or a coding agent. Triggers on "create a story", "file a story for this", "raise a story", and a request that already opens "As a [persona], I want". Not for a slice of an existing parent, which is `dx-create-task`, and not for work no one outside the team observes, which is also `dx-create-task`.'
---

# Trigger phrases
Use this skill when you hear:
- "create a story"
- "file a story"
- "raise a story"
- "As a [persona], I want"

Write the issue so whoever delivers it can act on it without coming back with questions. Do not write it for an agent in particular.

The canonical structure is [references/issue-template.md](references/issue-template.md). Read it before you construct or preview a body. Fill every section: where there is nothing to say, write `N/A` or `None` rather than deleting the heading. Write every section to [House style](../../../procedures/house-style.md).

This skill creates one story, or two where Step 4 splits one. It never creates a task.

## 1. Settle the persona gate
Settle who benefits before you gather anything else.

Where the request answers the bullets below on its own, take the matching bullet without asking. Otherwise ask:

```
Who needs this, what do they get, and why does it help them?
Format: As a [user persona], I want [capability], so that [benefit].
```

Check these in order and take the first that fits.

- Names two capabilities a user would ask for separately ("bulk-upload marks, and also export the roster") -> Step 4 now, before you gather the rest
- Names only the team, the system, or the codebase ("rotate the signing keys", "bump pnpm to 10", "migrate the queue") -> say so, point the author at `dx-create-task`, and stop
- Names someone outside the team, and what they get ("so parents can see attendance", "As a teacher, I can publish to one class") -> Step 2

The persona is whoever uses the product. Never invent one to make technical work fit the shape.

Where the gate stops the run, do not gather the remaining fields and do not read the code. Offer the code read for the task issue instead.

## 2. Gather the story
Ask for each field below. Do not invent an answer: ask where the author has not given one.

1. **Scope**: which part of the product this touches (`dashboard`, `login`, `profile`). This becomes the backticked scope in the title.
2. **Background**: the problem this solves, how often it affects users, and links to specs, threads, or recordings.
3. **Open questions**: anything about these requirements still unclear or undecided, such as an ambiguous edge case, an unsettled policy, or a dependency on someone else's decision. Record these rather than guessing. Where nothing is unresolved, record `None`.
4. **Acceptance criteria**: three kinds of scenario, named outcome-first ("Assignment is created", not "Create assignment").
   - **Happy path**: the action succeeds. At least one.
   - **Unhappy path**: the action is refused or fails, and the scenario says what the user sees instead and what state they are left in. At least one, always. Rejected input, a permission denial, a timeout, and a repeated submission are the usual candidates.
   - **Edge case**: a boundary the happy path never reaches, such as an empty list, a single item, or a value at its limit. One per case that matters.

   An unhappy path and an edge case are not the same thing: an empty list is a boundary, a refused action is a failure, and a story needs both.

   Pick the format per scenario:

   - A test runner can assert the outcome -> `### <outcome-first name>` with **Given**, **When**, and **Then** bullets
   - Only a person looking at the screen can confirm the outcome -> a `- [ ]` checklist line under the heading

   One story carries both formats where its scenarios differ. One scenario takes one format, never both.

   A scenario that describes implementation rather than observable behaviour goes back to the author. Step 3 adds to what the author gives here, so do not ask them to produce every failure and boundary unaided.
5. **Out of scope**: at least one explicit exclusion. Where the author names none, ask them to confirm nothing adjacent is in scope.
6. **Design assets**: Figma links, screenshots, or a prototype. A link needs only pasting. For a screenshot or a recording, read [references/attachments.md](references/attachments.md). Where none exist, offer a Mermaid diagram of the described flow: a state diagram for a multi-step form, a sequence diagram for actor interactions.

## 3. Read the code for missed edge cases
Read the code behind the scope and surface cases the author's criteria do not cover, so the story ships with the edges they would otherwise find in QA.

Search the repository for the screen, component, or route the scope names, then read what that code does today. Look for:

- **States the flow can start in**: empty, partially filled, stale, already completed, or mid-way through a previous attempt
- **Ways the action can fail**: validation rejections, permission denials, timeouts, duplicate or concurrent submissions
- **Who else is affected**: other personas who read or act on the same data, and what they see once this changes
- **What exists today**: current behaviour this story would replace, especially behaviour another feature relies on

Report every finding as something a person experiences. "A teacher who double-clicks submit sends the same assignment twice" is a candidate scenario; "the submit handler has no idempotency key" is not. A finding that can only be stated in implementation terms belongs in a `dx-create-task` issue.

```
Reading the code behind `<scope>`, I found **<number>** cases the criteria do not cover yet:

- **<what a person would experience>**: <what happens today>

Which of these should become acceptance criteria? Any you would rather put out of scope, or record as an open question?
```

A confirmed case becomes an acceptance criterion. A dismissed one goes to out of scope, or to open questions where the answer is undecided. Never add a scenario the author has not confirmed.

Where the code is not available, say so and go to Step 4 rather than guessing at findings.

## 4. Evaluate for split
Check for these signals in the criteria, or in the request itself where Step 1 sent you straight here.

- Step 1 sent you here -> the split question below
- Different roles act, with no shared outcome -> the split question below
- The Givens describe completely different parts of the system -> the split question below
- Two capabilities a user would ask for separately, rather than one capability plus its edge cases -> the split question below
- None of the above -> Step 5

An edge case added in Step 3 does not justify a split on its own, even where it names a second persona or a different starting state. The same capability seen from another angle belongs in this story.

```
These scenarios cover two things, **<A>** and **<B>**, which is more than one pull request can deliver safely. Two ways to cut it:

- **Two stories**, if <A> and <B> are capabilities someone would ask for separately. Each carries its own persona, benefit, and criteria.
- **One story delivered as tasks**, if this is one capability too large for a single pull request. The criteria all stay on this story, and `dx-create-task` files the slices as sub-issues so progress tracks here.

Which fits?
```

The test that decides it: each half can be written as "As a [persona], I want [capability], so that [benefit]" without inventing a persona. Where both halves survive that, they are two stories. Where one half only makes sense as a means to the other, the whole is one story and the halves are tasks. Recommend the cut the test points to, and defer where the author disagrees.

Either cut falls on a clean seam. Each piece is independently reviewable, and no single acceptance criterion ends up half in one piece and half in the other. A seam running through a criterion is the wrong seam: move the whole criterion to one side, or cut elsewhere.

- Two stories -> run Steps 2 and 3 for each capability, then Steps 5 to 8 once per issue, then link them as blocked-by where one depends on the other
- Tasks -> keep one issue carrying all the criteria, note in out of scope that delivery is split into tasks, and hand the slices to `dx-create-task` after Step 8
- Left undivided -> note that in out of scope and go to Step 5

Where you arrived here from Step 1, run Steps 2 and 3 for the cut the author picked before you go on to Step 5.

Do not create the tasks here. `dx-create-task` verifies the parent, and it cannot verify a parent that does not exist yet.

## 5. Identify dependencies from the backlog
Fetch the open issues to surface likely blockers and dependents.

```sh
gh issue list --state open --json number,title,body --limit 100
```

- The command succeeds -> read the titles and bodies, and compare each against the new story's scope, user story, and criteria
- The command fails with "command not found" or "'gh' is not recognized" -> ask the author to name any blocking or dependent issues, or confirm `None`, then go to Step 6
- The command fails any other way -> surface the real error and stop

For an issue that looks related, fetch its comments, because a blocking relationship is often mentioned in discussion rather than in the body.

```sh
gh issue view <number> --json comments --jq '.comments[].body'
```

An issue is a likely **blocker** where it must be completed before this story can work correctly, and a likely **dependent** where this story would unblock it.

```
I found these potentially related open issues:

Possible blockers (this story may depend on them):

- #<number>: <title>

Possible dependents (they may depend on this story):

- #<number>: <title>

Are any of these actual dependencies, or are they unrelated?
```

Let the author confirm or dismiss each one, and carry the confirmed ones to Step 8. Where the scan finds nothing related, go to Step 6 without prompting: do not ask the author to confirm a null result.

## 6. Triage the design need
Decide whether this story can go to an engineer, or needs a designer before implementation starts. Read the reviewer-routing table in `../../design/dx-design/issue-intake.md`, the canonical copy, and judge each scenario against it.

- Design assets is `N/A`, because the story has no user-facing surface -> Step 7
- The surface is user-facing but no assets exist yet -> judge the scenarios against the table anyway, because the absence of assets is itself a reason a designer may be needed
- Any scenario is "strongly recommended" -> note it, so Step 8 writes a "Design routing: needs designer input before an engineer starts" line into Design assets and applies the `needs-design-review` label
- Every scenario "can defer" -> Step 7 with no line and no label

Where the routing table cannot be read, say so and treat the story as "can defer" rather than guessing at the table's contents.

## 7. Preview and confirm
Apply the "Before you post it" checks in [House style](../../../procedures/house-style.md) and cut anything that fails them. Then render the complete body in a markdown code block.

- Open questions is non-empty -> the callout below, then ask for confirmation
- Open questions is `None` -> ask for confirmation

```
This story has **<number>** open question(s) still unresolved: <list>. You can create it now and settle these before implementation begins, or answer them first. Proceed?
```

## 8. Create the issue
The title follows the commit convention: `feat(<scope>): <short description>`, with backticks around the scope.

Write the confirmed body to a temp file and create the issue with `--body-file`, never an inline `--body`.

Ensure the shape label and the usage-tracking label exist, plus the routing label where Step 6 flagged design routing.

```sh
gh label create "skill:dx-create-story" --color ededed --description "Created with the dx-create-story skill" 2>/dev/null || true
gh label create "story" --color 0e8a16 --description "A capability someone outside the team observes" 2>/dev/null || true

# Only where Step 6 flagged design routing:
gh label create "needs-design-review" --color d4c5f9 --description "Flagged at creation: route to a designer before an engineer starts building" 2>/dev/null || true
```

Then create the issue once. The shape label answers what kind of work this is, and the skill label answers what wrote the issue.

```sh
gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "story" --label "skill:dx-create-story"
# Where Step 6 flagged design routing, add: --label "needs-design-review"
```

- Creation fails because a label does not exist -> list the labels and reuse the one that matches, rather than creating a near-duplicate
- Label creation is refused because the token cannot write labels -> create the issue without labels, print the URL, and name the two labels someone with write access should add
- The command fails with "command not found" or "'gh' is not recognized" -> render the title and body as markdown, and tell the author to create the issue through the web interface
- The command fails any other way -> surface the real error and stop

```sh
gh label list --limit 200 --json name --jq '.[].name' | grep -ix "story"
```

On success, print the issue URL, then link each dependency confirmed in Step 5. Resolve each issue number to its node ID first, then call the mutation.

```sh
# Resolve an issue number to its node ID
gh issue view <number> --json id --jq .id

# This issue is BLOCKED BY #NNN
gh api graphql -f query='mutation($issue:ID!,$blocker:ID!){addBlockedBy(input:{issueId:$issue,blockingIssueId:$blocker}){clientMutationId}}' -f issue=<this-issue-id> -f blocker=<blocker-id>

# This issue BLOCKS #NNN (set the relationship on the dependent)
gh api graphql -f query='mutation($issue:ID!,$blocker:ID!){addBlockedBy(input:{issueId:$issue,blockingIssueId:$blocker}){clientMutationId}}' -f issue=<dependent-id> -f blocker=<this-issue-id>
```

Then tell the author that delivery work is tracked as `dx-create-task` issues linked back to this one as native sub-issues, not as sections inside it.

## Rules
- Every story carries at least one happy path and at least one unhappy path. An edge case does not stand in for an unhappy path: an empty list is a boundary, a refused action is a failure, and a reader needs both
- An edge case found by reading the code is restated as an experience before it is offered to the author
- Link a blocker or a dependent with GitHub's Relationships panel, never as a line in the body, so the link stays accurate as issues move and close
- Pick one term per concept and hold it across every scenario, so always "customer" and never "user" alongside it
- Do not use an em dash in the title or the body. Use a colon, parentheses, or separate sentences
- The pull request that implements this issue squash-merges using its title as the commit message, so the title must be a valid commit message
