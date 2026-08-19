---
name: dx-create-task
description: Use when you need to create a well-structured GitHub issue for a single-discipline slice of an existing story or chore, engineering or design (a CI job, a migration, a frontend screen, a component's visual states), with no persona or user-facing benefit clause of its own, for whoever picks it up: an engineer, a designer, or a coding agent.
---

You are helping create a well-structured GitHub issue for a task: work that delivers part of a larger piece of work but has no user-facing framing of its own. A task is one discipline's slice of that parent. It might be engineering (add a CI job, write a migration script, instrument logging) or design (lay out a frontend screen, define a component's visual states, produce the responsive treatment for a flow). Unlike a story, a task has no role or benefit clause: forcing one onto this kind of work produces a fabricated persona. The issue will be picked up by whoever does that discipline, an engineer, a designer, or a coding agent, so every section must be complete enough to act on without follow-up questions. Write for a specialist as readily as for an agent: a designer reading a design task will judge whether the criteria describe the right screen, and that judgment is cheaper here than after the work is built.

A task only makes sense in the context of the work it delivers, so every task links back to a parent as a native GitHub sub-issue and the parent's progress tracking reflects it automatically. That parent is usually a story. It can also be a chore: a chore is a piece of work in its own right rather than something that sits under a story, and a large chore gets delivered by discipline slices the same way a story does. What a task never is, is orphaned. Work with no parent is a story or a chore itself, so create it with `dx-create-story` or `dx-create-chore` instead of filing a task that tracks nothing.

## Issue template

The canonical structure is in [references/issue-template.md](references/issue-template.md). Read that file when constructing or previewing an issue body. Fill every section: if there is nothing to say, write `N/A` or `None`, do not delete the heading. The one exception is the optional `Also true when done` checklist described in Step 2, which you delete outright when it is empty, because a heading standing over an empty list reads as an oversight rather than a decision.

## Workflow

### Step 1: Identify the parent

Ask which story or chore this task delivers, if not already given (an issue number, or a description you can look up). Then verify it:

```sh
gh issue view <number> --json number,title,body,state,labels
```

- **If the issue does not exist or the command errors on an invalid number**: tell the user, and offer to run `dx-create-story` or `dx-create-chore` first rather than proceeding without a parent.
- **If the issue exists but is closed**: flag this before continuing. "#NNN is closed. Are you sure this is the right parent, or has this task's scope already shipped?"
- **If the issue exists and is open, check that it reads as a story or a chore.** The reliable signal is a `skill:dx-create-story` or `skill:dx-create-chore` label. Issues written before these skills existed will not carry one, so fall back to the body: a story has a `## User story` heading, a chore has `## What is changing` with `## Done when`. Either shape is a valid parent.
- **If it reads as neither**: it may be a bug report, or a task itself. Flag it rather than guessing: "Issue #NNN doesn't look like a story or a chore. Is this really the parent, or did you mean a different issue?" A task parented to another task is worth questioning specifically, since a task is already the smallest slice one discipline can deliver: ask whether the real parent is that task's own parent. Proceed only once the user confirms.
- **If the command fails with "command not found" or "'gh' is not recognized"**: ask the user to paste the parent's number and confirm its title manually; you cannot verify it, so say so.
- **If the command fails for any other reason**: surface the real error and stop.

### Step 2: Gather the task

Ask for the following. Do not invent answers: ask if the user has not provided them.

1. **Scope**: what area does this touch (a part of the codebase like `ci` or `assignments`, or a surface like the assignments list screen)?
2. **Description**: what is this task, and why does the parent need it? A task is a means to an end, not an end in itself: tie it back to what the parent requires.
3. **Acceptance criteria**: how you will know the task is done. Given-When-Then scenarios are the spine, whatever the discipline: at minimum one happy path and one error or edge case, named outcome-first (e.g. "Migration applies cleanly", not "Write migration"), stating the observable outcome rather than the implementation.

   Design work fits this shape more often than it first looks, because a visual state is something you can observe. "Given a teacher has no assignments, When they open the assignments list, Then they see the empty state with a create button" pins down what that state actually contains, which "empty state is designed" never does. Reach for scenarios first for design tasks too.

   Some criteria have no trigger, though. Colours drawn only from tokens, a frame per breakpoint, no remaining references to an old symbol: you confirm these by looking, not by acting. Forcing them into Given-When-Then produces a hollow "When you inspect it", and hollow criteria stop being read. Record those under an optional `### Also true when done` checklist below the scenarios, each item independently checkable by a reviewer (e.g. "colours come only from tokens in `app/globals.css`, no raw hex", "the layout holds at the mobile, tablet, and desktop breakpoints", "passes the SLP anti-slop controls"). Prefer verifiable end states over effort descriptions ("designed the screen").

   The checklist supplements the scenarios, it does not replace them: a task with only a checklist and no scenario usually means either the behaviour has not been thought through yet, or the work is maintenance that belongs in `dx-create-chore`. When nothing invariant needs recording, delete the heading rather than filling it with `None`.
4. **Out of scope**: at least one explicit exclusion, or confirm nothing adjacent is in scope.

There is no user story section here: a task is described from the doing discipline's perspective, not a persona's. A design task may reference or attach the design context it needs (a parent Figma frame, the parent's design assets); an engineering task usually will not.

### Step 3: Preview and confirm

Render the complete issue body in a markdown code block, including the `Part of #NNN` line linking it to the parent, and ask for confirmation before creating the issue.

### Step 4: Create the issue and link it to the parent

The title must follow the commit convention from CLAUDE.md: `<type>(<scope>): <short description>` using backticks around the scope. Pick the type (`feat`, `fix`, `chore`, `refactor`, `docs`) that matches what the task actually does; it does not have to match the parent's type. For a design task, pick the type that fits the tracked deliverable (`design` if the repo's convention allows it, otherwise `feat` for new UI or `docs` for design documentation), and keep the title a valid commit message so the implementing PR can reuse it.

The body is markdown containing backticks and other shell-special characters, so pass it via a file rather than inline (an inline `--body "..."` would let the shell interpret backticks as command substitution). Write the confirmed body to a temp file and create the issue with `--body-file`.

Ensure the usage-tracking label exists (idempotent, `gh label create` exits non-zero if it already exists, which `|| true` swallows), then create the issue with it:

```sh
gh label create "skill:dx-create-task" --color ededed --description "Created with the dx-create-task skill" 2>/dev/null || true

gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "skill:dx-create-task"
```

- **If the command succeeds**: print the issue URL, then link it to the parent as a native GitHub sub-issue. Resolve both issues' node IDs first, then call the mutation:

  ```sh
  # Resolve the parent and the new task to their node IDs
  gh issue view <parent-number> --json id --jq .id
  gh issue view <new-task-number> --json id --jq .id

  # Link the new task as a sub-issue of the parent
  gh api graphql -f query='mutation($parent:ID!,$sub:ID!){addSubIssue(input:{issueId:$parent,subIssueId:$sub}){subIssue{number}}}' -f parent=<parent-id> -f sub=<new-task-id>
  ```

  Confirm the link succeeded (the mutation response echoes the sub-issue number) and tell the user the parent's progress will now reflect this task.
- **If the command fails with "command not found" or "'gh' is not recognized"**: render the issue title and body as markdown and instruct the user to create the issue manually via the GitHub web interface, then manually add it as a sub-issue of the parent from the GitHub UI.
- **If the command fails for any other reason**: surface the real error and stop.

## Rules

- Never leave a section blank. Every section must be explicitly filled or marked `N/A` / `None`.
- Never create a task without a verified parent, a story or a chore, linked as a sub-issue.
- Acceptance criteria lead with Given-When-Then scenarios, outcome-first named, for both engineering and design tasks. The `Also true when done` checklist is optional, is only for criteria with no trigger, and never stands in for the scenarios.
- Do not describe implementation in acceptance criteria: write what is observably true when the task is done (the system's behaviour, or the state of the deliverable), not how it was built.
- Pick one term per concept and use it consistently across all scenarios or checklist items.
- Do not use em-dashes (`—`) in the issue title or body. Use colons, parentheses, or separate sentences instead.
- The PR that implements this issue will squash-merge using its title as the commit message, so titles must be valid commit messages.
