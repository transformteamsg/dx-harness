---
name: dx-create-issue
description: Use when you need to create a well-structured GitHub issue with complete author and implementer sections for a coding agent to implement.
---

You are helping create a well-structured GitHub issue for the teacher-workspace repository. The issue will be implemented by a coding agent, so every section must be complete enough to act on without follow-up questions.

The issue has two parts separated by a `---` divider:

- **Author sections** (written now): user story, background, acceptance criteria, out of scope, design assets
- **Implementer sections** (filled during engineering grooming): technical context, data model, API contract, error contract, additional test scenarios, hard constraints

Dependencies live outside the body: link blockers and dependents with GitHub's native issue relationships (the "Relationships" panel: blocked by / blocks), so the links stay accurate as issues move and close.

## Issue template

The canonical structure is in `issue-template.md` in this skill's directory. Read that file when constructing or previewing an issue body. Fill every section. Until grooming, leave each implementer section as its placeholder `_Pending grooming._` (do not delete the heading).

## Workflow

### Step 1: Gather author sections

Ask for the following. Do not invent answers: ask if the user has not provided them.

1. **Issue type and scope**: what type of change is this (`feat`, `fix`, `docs`, `refactor`, `chore`) and what area of the codebase does it touch (e.g. `session`, `middleware`, `assignments`)?
2. **User story**: who needs what, and why? Format: "As a [role], I want [capability], so that [benefit]."
3. **Background**: what problem does this solve? How often does it affect users? Are there links to specs, Slack threads, or recordings?
4. **Acceptance criteria**: at minimum one happy-path scenario and one error/edge-case scenario in Given-When-Then format. Names must be outcome-first (e.g. "Assignment is created", not "Create assignment"). Push back if scenarios describe implementation rather than observable behaviour.
5. **Out of scope**: at least one explicit exclusion. If none exist, ask the user to confirm nothing adjacent is in scope.
6. **Design assets**: first, does this issue add or change a user-facing screen, page, flow, or component? If yes, ask for Figma links or screenshots; if none are available, offer to produce a Mermaid diagram based on the described flow (state diagrams suit multi-step forms; sequence diagrams suit actor interactions). If the issue is user-facing and no assets exist yet, say so explicitly in the section rather than defaulting to N/A — a UI-facing issue with nothing to show may need a design pass before implementation, not a direct implementation run. If the issue is not user-facing (backend, data, infra), mark this section N/A.

### Step 1b: Evaluate for split

After gathering the acceptance criteria scenarios, evaluate them before continuing. Check for these signals:

- **Multiple actors**: scenarios describe actions by different roles with no shared outcome
- **Unrelated starting states**: scenarios have Givens that describe completely different parts of the system
- **Multiple unrelated endpoints**: the user has described what would become two or more unrelated API endpoints

If any signal is present, pause and surface it:

> "These scenarios describe two separate capabilities: [A] and [B]. Creating one issue would make it too large for a coding agent to implement safely in a single PR. Would you like to create two linked issues instead?"

If the user confirms a split: complete the author sections for each capability separately and create them as two issues. Run Steps 2 and 3 once per issue, then link them with GitHub's blocked-by / blocks relationship if one depends on the other.

If the user wants to keep it as one issue: note it explicitly in the out of scope section and continue.

### Step 1c: Identify dependencies from the backlog

After the split evaluation, attempt to fetch open issues to surface likely blockers or dependents. These are linked as GitHub relationships after the issue is created (Step 3), not written into the body.

```sh
gh issue list --state open --json number,title,body --limit 100
```

- **If the command succeeds**: read the titles and bodies. Compare each against the new issue's scope, user story, and acceptance criteria. For any issue whose title or body looks potentially related, fetch its comments for additional context, as blocking relationships and dependencies are often mentioned in discussion rather than the issue body:

  ```
  gh issue view <number> --json comments --jq '.comments[].body'
  ```

  Flag an issue as a likely **blocker** if it must be completed before this capability can work correctly (for example, an auth issue that this feature depends on, or a data model change this feature builds on). Flag an issue as a likely **dependent** if this new issue would unblock or enable it. Present findings before asking the author anything:

  > "I found these potentially related open issues:
  >
  > Possible blockers (this issue may depend on them):
  >
  > - #NNN: title
  >
  > Possible dependents (they may depend on this issue):
  >
  > - #NNN: title
  >
  > Are any of these actual dependencies, or are they unrelated?"

  Let the author confirm or dismiss each suggestion. Use the confirmed ones to link as GitHub relationships in Step 3. If no related issues are found, proceed without prompting: do not ask the author to confirm a null result.

- **If the command fails with "command not found" or "'gh' is not recognized"**: skip the automated scan. Ask the author to identify any blocking or dependent issues manually, or confirm "none".
- **If the command fails for any other reason**: surface the real error and stop.

Ask: "Are the technical sections already known, or will engineers fill those in during grooming?"

Note the answer: it determines what happens after the issue is created (see step 3).

### Step 1d: Design-need triage

Before the issue is created, decide whether it can be safely handed to an engineer without a designer in the loop, or should be routed to one *before* implementation starts. This is a coarser, earlier version of the same judgment `dx-harness:dx-design`'s Phase 3 reviewer-routing table makes per acceptance-criteria scenario — running it here catches the need before Intent and Diverge happen solo, not after. Read the reviewer-routing table in `../../design/dx-design/issue-intake.md` (the canonical copy — do not duplicate it here) and judge each acceptance-criteria scenario from Step 1 against it. If any scenario is "strongly recommended": note it now, so Step 3 can write a "Design routing: needs designer input before an engineer starts" line into the Design assets section and apply the `needs-design-review` label. If every scenario "can defer", no line or label is needed — the default is silent. Skip this step entirely when Design assets is already N/A (no user-facing surface).

### Step 2: Preview and confirm

Render the complete issue body in a markdown code block and ask for confirmation before creating the issue. Leave implementer sections with their placeholder text regardless of whether technical details are known; those will be filled in after creation.

### Step 3: Create the issue

The title must follow the commit convention from CLAUDE.md: `<type>(<scope>): <short description>` using backticks around the scope.

The body is markdown containing backticks and other shell-special characters, so pass it via a file rather than inline (an inline `--body "..."` would let the shell interpret backticks as command substitution). Write the confirmed body to a temp file and create the issue with `--body-file`.

Ensure the usage-tracking label exists (idempotent — `gh label create` exits non-zero if it already exists, which `|| true` swallows). If Step 1d flagged design routing, also ensure the routing label exists:

```sh
gh label create "skill:create-issue" --color ededed --description "Created with the create-issue skill" 2>/dev/null || true

# Only if Step 1d flagged design routing:
gh label create "needs-design-review" --color d4c5f9 --description "Flagged at creation: route to a designer before an engineer starts building" 2>/dev/null || true
```

Then create the issue once, adding `--label "needs-design-review"` only if Step 1d flagged design routing:

```sh
gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "skill:create-issue"
```

The label makes usage queryable with `gh issue list --label "skill:create-issue"` (exact, unlike free-text search), and the `*🤖 Generated with create-issue*` footer in the body template gives human-readable attribution.

- **If the command succeeds**: print the issue URL. Then link any dependencies confirmed in Step 1b/1c as GitHub relationships using the GraphQL `addBlockedBy` mutation. Resolve each issue number to its node ID first, then call the mutation:

  ```sh
  # Resolve an issue number to its node ID
  gh issue view <number> --json id --jq .id

  # This issue is BLOCKED BY #NNN
  gh api graphql -f query='mutation($issue:ID!,$blocker:ID!){addBlockedBy(input:{issueId:$issue,blockingIssueId:$blocker}){clientMutationId}}' -f issue=<this-issue-id> -f blocker=<blocker-id>

  # This issue BLOCKS #NNN (set the relationship on the dependent)
  gh api graphql -f query='mutation($issue:ID!,$blocker:ID!){addBlockedBy(input:{issueId:$issue,blockingIssueId:$blocker}){clientMutationId}}' -f issue=<dependent-id> -f blocker=<this-issue-id>
  ```

  If no dependencies were confirmed, skip this. If the user indicated that technical sections are already known, immediately invoke the `groom-issue` skill on the newly created issue number to fill in the implementer sections now.
- **If the command fails with "command not found" or "'gh' is not recognized"**: render the issue title and body as markdown and instruct the user to create the issue manually via the GitHub web interface.
- **If the command fails for any other reason**: surface the real error and stop.

## Rules

- Never leave a section blank. Every section must be explicitly filled or marked `N/A`.
- Acceptance criteria must use Given-When-Then format and be outcome-first named.
- Do not describe implementation in acceptance criteria: write what a user or system actor observes.
- Pick one term per concept and use it consistently across all scenarios (e.g. always "teacher", never mixing with "user").
- Do not use em-dashes (`—`) in the issue title or body. Use colons, parentheses, or separate sentences instead.
- The PR that implements this issue will squash-merge using the issue title as the commit message, so the title must be a valid commit message.
