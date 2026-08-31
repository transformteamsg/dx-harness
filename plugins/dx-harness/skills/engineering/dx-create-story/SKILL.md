---
name: dx-create-story
description: Use when you need to create a well-structured GitHub issue for user-facing feature or capability work, the "As a [user persona], I want..." story shape, for whoever delivers it: an engineer, a designer, a product manager, or a coding agent.
---

You are a product manager helping create a well-structured GitHub issue for a user-facing story: work described from the perspective of who benefits from it. It gets delivered either directly or through tasks created with `dx-create-task`, and by whoever does that work: an engineer, a designer, a product manager, or a coding agent. Write it so any of them can act on it without coming back with questions.

Do not write it for an agent in particular. A person who picks this up brings judgment an agent does not, and will often say the criteria are wrong, or the scope is off, or this is two stories, before building anything. That push-back is worth having, and it arrives earlier the more precisely the story states what someone should observe. Vague criteria do not invite judgment, they postpone it until review.

Dependencies live outside the body: link blockers and dependents with GitHub's native issue relationships (the "Relationships" panel: blocked by / blocks), so the links stay accurate as issues move and close.

Delivery work for a story is tracked separately, as `dx-create-task` issues linked back to this one via GitHub's native sub-issue relationship. This skill only produces the story itself; it does not create tasks.

## Issue template

The canonical structure is in [references/issue-template.md](references/issue-template.md). Read that file when constructing or previewing an issue body. Fill every section: if there is nothing to say, write `N/A` or `None`, do not delete the heading. Write every section following [Writing style](../../../procedures/writing-style.md): a story earns its length from its acceptance criteria, not from background a reader could get elsewhere.

## Attaching screenshots and recordings

Images and recordings belong on the issue, never in the repository. Upload one by dragging the file into the issue or comment box in GitHub's web interface, which stores it on GitHub's own CDN and returns a URL to paste into the body. `gh` cannot attach binaries, so this step stays manual: say so rather than leaving the author to find out when the link does not resolve.

Never commit a screenshot or a video to the repository so that an issue can link to it. It sits in every clone from then on, it outlives the issue that needed it, and deleting it later does not shrink the history. This applies to a coding agent at least as much as to a person: if you are the one holding the file, hand it to the author to upload instead of writing it into the working tree.

Convert a screen recording to a GIF and keep it under 10 MB, which is GitHub's ceiling for an image or a GIF on an issue. If the GIF is unreadable at that size, trim the recording to the few seconds that matter rather than raising the resolution.

## Workflow

### Step 1: Gather the story

Ask for the following. Do not invent answers: ask if the user has not provided them.

1. **Scope**: what part of the product does this touch (for example `dashboard`, `login`, or `profile`)? This becomes the backticked scope in the title.
2. **User story**: who needs what, and why? Format: "As a [user persona], I want [capability], so that [benefit]." The persona is whoever actually uses the product. Do not invent one to fit technical work: if no real user benefits, this is probably a `dx-create-task`, not a story.
3. **Background**: what problem does this solve? How often does it affect users? Are there links to specs, Slack threads, or recordings?
4. **Open questions**: is anything about these requirements still unclear or undecided (an ambiguous edge case, a policy nobody has settled, a dependency on someone else's decision)? Capture these rather than guessing or blocking creation on an answer now. If genuinely nothing is unresolved, record "None."
5. **Acceptance criteria**: Given-When-Then scenarios, named outcome-first, for example "Assignment is created" rather than "Create assignment". Three kinds, and the first two are both required:

   - **Happy path**: the action succeeds. At least one.
   - **Unhappy path**: the action is refused or fails, and the scenario says what the user sees instead and what state they are left in. At least one, always. A story that describes only success hands the failure behaviour to whoever implements it, and they will invent it. Rejected input, a permission denial, a timeout, and a repeated submission are the usual candidates.
   - **Edge case**: a boundary the happy path never reaches, such as an empty list, a single item, or a value at its limit. One scenario per case that matters.

   An unhappy path and an edge case are not the same thing, and a story that folds them together usually loses the unhappy path. Push back if scenarios describe implementation rather than observable behaviour. Step 2 adds to what the author supplies here, so do not ask them to produce every failure and boundary unaided.
6. **Out of scope**: at least one explicit exclusion. If none exist, ask the user to confirm nothing adjacent is in scope.
7. **Design assets**: Figma links, screenshots, or a vibe-coded prototype. A link needs nothing more than pasting; a screenshot or a recording follows Attaching screenshots and recordings above. If none are available, offer to produce a Mermaid diagram based on the described flow. State diagrams suit multi-step forms; sequence diagrams suit actor interactions.

Item 2 is a gate, not only a field. Settle it before gathering the rest: if nobody who actually uses the product benefits, this is not a story. Say so, point the author at `dx-create-task`, and stop. Do not collect the remaining items and do not continue to Step 2, because reading the code to sharpen acceptance criteria is wasted when there will be no acceptance criteria, and it buries the recommendation the author needs under work they did not ask for. If the code reading would help the task issue instead, offer it rather than doing it unasked.

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

Judge the signals on the capability, not on the count of scenarios. An edge case added in Step 2 does not justify a split on its own, even when it names a second persona or a different starting state: if it is the same capability seen from another angle, it belongs in this story.

If any signal is present, pause and offer both cuts, because there are two and they are not interchangeable:

> "These scenarios cover two things, [A] and [B], which is more than one PR can deliver safely. Two ways to cut it:
>
> - **Two stories**, if [A] and [B] are capabilities someone would ask for separately. Each carries its own persona, benefit, and criteria.
> - **One story delivered as tasks**, if this is one capability that is too large for a single PR rather than two capabilities. The criteria all stay on this story, and `dx-create-task` files the slices as sub-issues so progress tracks here.
>
> Which fits?"

The test that decides it: can each half be written as "As a [persona], I want [capability], so that [benefit]" without inventing a persona to make it fit? If both halves survive that, they are two stories. If one half only makes sense as a means to the other, the whole thing is one story and the halves are tasks. Recommend the cut this test points to rather than leaving the author to weigh it cold, and defer if they disagree: they know the backlog.

Either cut has to fall on a clean seam. Each piece must be independently reviewable, and no single acceptance criterion may end up half in one piece and half in the other. A seam running through a criterion is the wrong seam: move the whole criterion to one side, or cut somewhere else.

- **If the user chooses two stories**: complete Steps 1 and 2 for each capability separately and create them as two issues. Run Steps 5 and 6 once per issue, then link them with GitHub's blocked-by / blocks relationship if one depends on the other.
- **If the user chooses tasks**: keep one issue and carry all the criteria on it. Note in out of scope that delivery is split into tasks, and hand the slices to `dx-create-task` after Step 7. Do not create the tasks here: `dx-create-task` verifies the parent and gathers criteria per slice, and it cannot verify a parent that does not exist yet.
- **If the user wants it left as one undivided issue**: note that explicitly in the out of scope section and continue.

### Step 4: Identify dependencies from the backlog

After the split evaluation, attempt to fetch open issues to surface likely blockers or dependents. These are linked as GitHub relationships after the issue is created (Step 7), not written into the body.

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

  Let the author confirm or dismiss each suggestion. Use the confirmed ones to link as GitHub relationships in Step 7. If no related issues are found, proceed without prompting: do not ask the author to confirm a null result.

- **If the command fails with "command not found" or "'gh' is not recognized"**: skip the automated scan. Ask the author to identify any blocking or dependent issues manually, or confirm "none".
- **If the command fails for any other reason**: surface the real error and stop.

### Step 5: Design-need triage

Decide whether this story can be handed to an engineer without a designer in the loop, or should be routed to one *before* implementation starts. This is a coarser, earlier version of the same judgment `dx-harness:dx-design`'s Phase 3 reviewer-routing table makes per acceptance-criteria scenario — running it here catches the need before Intent and Diverge happen solo, not after. Read the reviewer-routing table in `../../design/dx-design/issue-intake.md` (the canonical copy — do not duplicate it here) and judge each acceptance-criteria scenario against it. If any scenario is "strongly recommended": note it now, so Step 7 can write a "Design routing: needs designer input before an engineer starts" line into the Design assets section and apply the `needs-design-review` label. If every scenario "can defer", no line or label is needed — the default is silent. Skip this step entirely when Design assets is `N/A` (no user-facing surface).

### Step 6: Preview and confirm

Before rendering the body, apply the "Before you post it" checks in [Writing style](../../../procedures/writing-style.md) and cut anything that fails them. Then render the complete issue body in a markdown code block. If the Open Questions section is non-empty, call it out explicitly before asking for confirmation:

> "This story has N open question(s) still unresolved: [list]. You can create it now and settle these before implementation begins, or answer them first. Proceed?"

Ask for confirmation before creating the issue either way.

### Step 7: Create the issue

The title must follow the commit convention from CLAUDE.md: `feat(<scope>): <short description>` using backticks around the scope.

The body is markdown containing backticks and other shell-special characters, so pass it via a file rather than inline (an inline `--body "..."` would let the shell interpret backticks as command substitution). Write the confirmed body to a temp file and create the issue with `--body-file`.

Ensure both labels exist, the shape label and the usage-tracking label (both idempotent, `gh label create` exits non-zero if a label already exists, which `|| true` swallows). If Step 5 flagged design routing, also ensure the routing label exists:

```sh
gh label create "skill:dx-create-story" --color ededed --description "Created with the dx-create-story skill" 2>/dev/null || true
gh label create "story" --color 0e8a16 --description "A capability someone outside the team observes" 2>/dev/null || true

# Only if Step 5 flagged design routing:
gh label create "needs-design-review" --color d4c5f9 --description "Flagged at creation: route to a designer before an engineer starts building" 2>/dev/null || true
```

Then create the issue once, adding `--label "needs-design-review"` only if Step 5 flagged design routing:

```sh
gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "story" --label "skill:dx-create-story"
# If Step 5 flagged design routing, add: --label "needs-design-review"
```

The label makes usage queryable with `gh issue list --label "skill:dx-create-story"` (exact, unlike free-text search), and the `*🤖 Generated with dx-create-story*` footer in the body template gives human-readable attribution.

The shape label is the taxonomy: it answers what kind of work this is, and `gh issue list --label "story"` matches it exactly, so a `skill:dx-create-story` label never gets pulled in by the same filter. The skill label answers a different question, which is what wrote the issue, so set both.

If `gh issue create` fails because a label does not exist, the repository probably already carries it under different casing (`Task` and `Feature` predate this vocabulary in some repos). List the labels and reuse the one that matches, rather than creating a near-duplicate:

```sh
gh label list --limit 200 --json name --jq '.[].name' | grep -ix "story"
```

If label creation is refused outright because the token cannot write labels, create the issue without labels, print the URL, and say which two labels someone with write access should add.

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
- Every story carries at least one happy path and at least one unhappy path. An edge case does not stand in for an unhappy path: an empty list is a boundary, a refused action is a failure, and a reader needs both.
- Do not describe implementation in acceptance criteria: write what a user or system actor observes. This holds for edge cases found by reading the code, which must be restated as experiences before they are offered to the author.
- Attach design assets to the issue, never commit them to the repository. Recordings go up as GIFs under 10 MB.
- Pick one term per concept and use it consistently across all scenarios, for example always "customer" and never mixing in "user".
- Split on a clean seam or not at all. Whether the cut makes two stories or one story with tasks, every piece must be independently reviewable and no acceptance criterion may be divided across pieces.
- Do not use em-dashes (`—`) in the issue title or body. Use colons, parentheses, or separate sentences instead.
- The PR that implements this issue (or the task issues delivering it) will squash-merge using its title as the commit message, so titles must be valid commit messages.
