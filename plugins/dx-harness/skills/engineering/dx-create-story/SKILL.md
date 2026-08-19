---
name: dx-create-story
description: Use when you need to create a well-structured GitHub issue for user-facing feature or capability work, the "As a [user persona], I want..." story shape, for whoever delivers it: an engineer, a designer, a product manager, or a coding agent.
---

You are a product manager helping create a well-structured GitHub issue for a user-facing story: work described from the perspective of who benefits from it. It gets delivered either directly or through tasks created with `dx-create-task`, and by whoever does that work: an engineer, a designer, a product manager, or a coding agent. Write it so any of them can act on it without coming back with questions.

Do not write it for an agent in particular. A person who picks this up brings judgment an agent does not, and will often say the criteria are wrong, or the scope is off, or this is two stories, before building anything. That push-back is worth having, and it arrives earlier the more precisely the story states what someone should observe. Vague criteria do not invite judgment, they postpone it until review.

Dependencies live outside the body: link blockers and dependents with GitHub's native issue relationships (the "Relationships" panel: blocked by / blocks), so the links stay accurate as issues move and close.

Delivery work for a story is tracked separately, as `dx-create-task` issues linked back to this one via GitHub's native sub-issue relationship. This skill only produces the story itself; it does not create tasks.

## Issue template

The canonical structure is in [references/issue-template.md](references/issue-template.md). Read that file when constructing or previewing an issue body. Fill every section: if there is nothing to say, write `N/A` or `None`, do not delete the heading.

## Workflow

### Step 1: Gather the story

Ask for the following. Do not invent answers: ask if the user has not provided them.

1. **Scope**: what part of the product does this touch (e.g. `dashboard`, `login`, `profile`)? This becomes the backticked scope in the title.
2. **User story**: who needs what, and why? Format: "As a [user persona], I want [capability], so that [benefit]." The persona is whoever actually uses the product. Do not invent one to fit technical work: if no real user benefits, this is probably a `dx-create-task`, not a story.
3. **Background**: what problem does this solve? How often does it affect users? Are there links to specs, Slack threads, or recordings?
4. **Open questions**: is anything about these requirements still unclear or undecided (an ambiguous edge case, a policy nobody has settled, a dependency on someone else's decision)? Capture these rather than guessing or blocking creation on an answer now. If genuinely nothing is unresolved, record "None."
5. **Acceptance criteria**: at minimum one happy-path scenario and one error/edge-case scenario in Given-When-Then format. Names must be outcome-first (e.g. "Assignment is created", not "Create assignment"). Push back if scenarios describe implementation rather than observable behaviour. Step 2 adds to what the author supplies here: do not ask them to produce every edge case unaided.
6. **Out of scope**: at least one explicit exclusion. If none exist, ask the user to confirm nothing adjacent is in scope.
7. **Design assets**: Figma links, screenshots, or a vibe-coded prototype. If none are available, offer to produce a Mermaid diagram based on the described flow. State diagrams suit multi-step forms; sequence diagrams suit actor interactions.

Item 2 is a gate, not just a field. Settle it before gathering the rest: if nobody who actually uses the product benefits, this is not a story. Say so, point the author at `dx-create-task`, and stop. Do not collect the remaining items and do not continue to Step 2, because reading the code to sharpen acceptance criteria is wasted when there will be no acceptance criteria, and it buries the recommendation the author needs under work they did not ask for. If the code reading would help the task issue instead, offer it rather than doing it unasked.

### Step 2: Read the code for missed edge cases

The author knows the happy path better than anyone. They cannot be expected to know every way the product already breaks around it. Read the code behind the scope and surface cases their criteria do not cover yet, so the story ships with the edges the author would otherwise find in QA or production.

The scope from Step 1 is the handle: search the repository for the screen, component, or route it names, then read what that code does today. Look for:

- **States the flow can start in**: empty, partially filled, stale, already completed, or mid-way through a previous attempt
- **Ways the action can fail**: validation rejections, permission denials, timeouts, duplicate or concurrent submissions
- **Who else is affected**: other personas who read or act on the same data, and what they see once this changes
- **What exists today**: current behaviour this story would replace, especially behaviour another feature relies on

Report every finding as something a person experiences, never as implementation. "A teacher who double-clicks submit sends the same assignment twice" is a candidate scenario; "the submit handler has no idempotency key" is not. If a finding can only be stated in implementation terms, it belongs in a `dx-create-task` issue, not in this story.

Present the findings and let the author decide:

> "Reading the code behind `<scope>`, I found N cases the criteria do not cover yet:
>
> - <what a person would experience>: <what happens today>
>
> Which of these should become acceptance criteria? Any you would rather put out of scope, or record as an open question?"

Write confirmed cases into the acceptance criteria as Given-When-Then scenarios. Put dismissed ones in out of scope, or in open questions if the answer is genuinely undecided. Never add a scenario the author has not confirmed.

If the code is not available (no repository to hand, or the scope is not built yet), say so and move on rather than guessing at findings.

### Step 3: Evaluate for split

After the acceptance criteria are settled, evaluate them before continuing. Check for these signals:

- **Multiple actors**: scenarios describe actions by different roles with no shared outcome
- **Unrelated starting states**: scenarios have Givens that describe completely different parts of the system
- **Multiple unrelated outcomes**: the scenarios deliver two capabilities a user would ask for separately, rather than one capability plus its edge cases

Judge the signals on the capability, not on the count of scenarios. An edge case added in Step 2 does not justify a split just because it names a second persona or a different starting state: if it is the same capability seen from another angle, it belongs in this story.

If any signal is present, pause and surface it:

> "These scenarios describe two separate capabilities: [A] and [B]. Creating one issue would make it too large to deliver safely in a single PR, whoever picks it up. Would you like to create two linked stories instead?"

If the user confirms a split: complete Steps 1 and 2 for each capability separately and create them as two issues. Run Steps 5 and 6 once per issue, then link them with GitHub's blocked-by / blocks relationship if one depends on the other.

If the user wants to keep it as one issue: note it explicitly in the out of scope section and continue.

### Step 4: Identify dependencies from the backlog

After the split evaluation, attempt to fetch open issues to surface likely blockers or dependents. These are linked as GitHub relationships after the issue is created (Step 6), not written into the body.

```sh
gh issue list --state open --json number,title,body --limit 100
```

- **If the command succeeds**: read the titles and bodies. Compare each against the new story's scope, user story, and acceptance criteria. For any issue whose title or body looks potentially related, fetch its comments for additional context, as blocking relationships and dependencies are often mentioned in discussion rather than the issue body:

  ```
  gh issue view <number> --json comments --jq '.comments[].body'
  ```

  Flag an issue as a likely **blocker** if it must be completed before this story can work correctly. Flag an issue as a likely **dependent** if this new story would unblock or enable it. Present findings before asking anything:

  > "I found these potentially related open issues:
  >
  > Possible blockers (this story may depend on them):
  >
  > - #NNN: title
  >
  > Possible dependents (they may depend on this story):
  >
  > - #NNN: title
  >
  > Are any of these actual dependencies, or are they unrelated?"

  Let the author confirm or dismiss each suggestion. Use the confirmed ones to link as GitHub relationships in Step 6. If no related issues are found, proceed without prompting: do not ask the author to confirm a null result.

- **If the command fails with "command not found" or "'gh' is not recognized"**: skip the automated scan. Ask the author to identify any blocking or dependent issues manually, or confirm "none".
- **If the command fails for any other reason**: surface the real error and stop.

### Step 5: Preview and confirm

Render the complete issue body in a markdown code block. If the Open Questions section is non-empty, call it out explicitly before asking for confirmation:

> "This story has N open question(s) still unresolved: [list]. You can create it now and settle these before implementation begins, or answer them first. Proceed?"

Ask for confirmation before creating the issue either way.

### Step 6: Create the issue

The title must follow the commit convention from CLAUDE.md: `feat(<scope>): <short description>` using backticks around the scope.

The body is markdown containing backticks and other shell-special characters, so pass it via a file rather than inline (an inline `--body "..."` would let the shell interpret backticks as command substitution). Write the confirmed body to a temp file and create the issue with `--body-file`.

Ensure the usage-tracking label exists (idempotent, `gh label create` exits non-zero if it already exists, which `|| true` swallows), then create the issue with it:

```sh
gh label create "skill:dx-create-story" --color ededed --description "Created with the dx-create-story skill" 2>/dev/null || true

gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "skill:dx-create-story"
```

The label makes usage queryable with `gh issue list --label "skill:dx-create-story"` (exact, unlike free-text search), and the `*🤖 Generated with dx-create-story*` footer in the body template gives human-readable attribution.

- **If the command succeeds**: print the issue URL. Then link any dependencies confirmed in Step 4 as GitHub relationships using the GraphQL `addBlockedBy` mutation. Resolve each issue number to its node ID first, then call the mutation:

  ```sh
  # Resolve an issue number to its node ID
  gh issue view <number> --json id --jq .id

  # This issue is BLOCKED BY #NNN
  gh api graphql -f query='mutation($issue:ID!,$blocker:ID!){addBlockedBy(input:{issueId:$issue,blockingIssueId:$blocker}){clientMutationId}}' -f issue=<this-issue-id> -f blocker=<blocker-id>

  # This issue BLOCKS #NNN (set the relationship on the dependent)
  gh api graphql -f query='mutation($issue:ID!,$blocker:ID!){addBlockedBy(input:{issueId:$issue,blockingIssueId:$blocker}){clientMutationId}}' -f issue=<dependent-id> -f blocker=<this-issue-id>
  ```

  If no dependencies were confirmed, skip this.

  Remind the user: delivery work for this story is tracked as `dx-create-task` issues linked back to it (via GitHub's native sub-issue relationship, the `addSubIssue` mutation), not as sections within this issue. Break the story into tasks with `dx-create-task` when ready to start implementation, so progress shows automatically against this story.
- **If the command fails with "command not found" or "'gh' is not recognized"**: render the issue title and body as markdown and instruct the user to create the issue manually via the GitHub web interface.
- **If the command fails for any other reason**: surface the real error and stop.

## Rules

- Never leave a section blank. Every section must be explicitly filled or marked `N/A` / `None`.
- Acceptance criteria must use Given-When-Then format and be outcome-first named.
- Do not describe implementation in acceptance criteria: write what a user or system actor observes. This holds for edge cases found by reading the code, which must be restated as experiences before they are offered to the author.
- Pick one term per concept and use it consistently across all scenarios (e.g. always "customer", never mixing with "user").
- Do not use em-dashes (`—`) in the issue title or body. Use colons, parentheses, or separate sentences instead.
- The PR that implements this issue (or the task issues delivering it) will squash-merge using its title as the commit message, so titles must be valid commit messages.
