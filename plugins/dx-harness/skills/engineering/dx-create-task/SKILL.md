---
name: dx-create-task
description: Use when you need to create a well-structured GitHub issue for a single-discipline slice of an existing user story, engineering or design (a CI job, a migration, a frontend screen, a component's visual states), with no persona or user-facing benefit clause of its own, for a coding agent or a designer to implement.
---

You are helping create a well-structured GitHub issue for a task: work that delivers part of an existing story but has no user-facing framing of its own. A task is one discipline's slice of the story. It might be engineering (add a CI job, write a migration script, instrument logging) or design (lay out a frontend screen, define a component's visual states, produce the responsive treatment for a flow). Unlike a story, a task has no role or benefit clause: forcing one onto this kind of work produces a fabricated persona. The issue will be picked up by whoever does that discipline, a coding agent or a designer, so every section must be complete enough to act on without follow-up questions.

A task only makes sense in the context of the story it delivers. Every task must link back to a parent story as a native GitHub sub-issue, so the story's progress tracking reflects it automatically. Never create an orphaned task.

## Issue template

The canonical structure is in `issue-template.md` in this skill's directory. Read that file when constructing or previewing an issue body. Fill every section: if there is nothing to say, write `N/A` or `None`, do not delete the heading.

## Workflow

### Step 1: Identify the parent story

Ask which story this task delivers, if not already given (an issue number, or a description you can look up). Then verify it:

```sh
gh issue view <number> --json number,title,body,state
```

- **If the issue does not exist or the command errors on an invalid number**: tell the user, and offer to run `dx-create-story` first rather than proceeding without a parent.
- **If the issue exists but is closed**: flag this before continuing. "Story #NNN is closed. Are you sure this is the right parent, or has this task's scope already shipped?"
- **If the issue exists, is open, but its body has no `## User story` heading**: it may not actually be a story (could be a chore, bug, or something else). Flag it: "Issue #NNN doesn't look like a story (no User story section). Is this really the parent, or did you mean a different issue?" Proceed only once the user confirms.
- **If the command fails with "command not found" or "'gh' is not recognized"**: ask the user to paste the parent story's number and confirm its title manually; you cannot verify it, so say so.
- **If the command fails for any other reason**: surface the real error and stop.

### Step 2: Gather the task

Ask for the following. Do not invent answers: ask if the user has not provided them.

1. **Scope**: what area does this touch (a part of the codebase like `ci` or `assignments`, or a surface like the assignments list screen)?
2. **Description**: what is this task, and why does the parent story need it? A task is a means to an end, not an end in itself: tie it back to what the story requires.
3. **Acceptance criteria**: how you will know the task is done. Pick the shape that fits the work, do not force both:
   - **Given-When-Then scenarios** for work whose result is observable system behaviour (an endpoint, a migration, a job). At minimum one happy-path and one error/edge-case scenario, describing the observable outcome rather than the implementation, with outcome-first names (e.g. "Migration applies cleanly", not "Write migration").
   - **A done-when checklist** for work whose result is a deliverable or a set of states rather than a runtime behaviour, which is usually the case for design and other artifact-producing tasks. Each item must be independently checkable by looking (e.g. "empty, loading, and error states are designed", "layout holds at the mobile, tablet, and desktop breakpoints", "uses only tokens from `app/globals.css`, no raw hex", "passes the SLP anti-slop controls"). Prefer verifiable end states over effort descriptions ("designed the screen").

   If a design task genuinely has behavioural acceptance criteria (an interaction with clear before/after states), Given-When-Then expressed as UI states is fine too. Choose the one that makes the finish line clearest; use the checklist when Given-When-Then would feel forced.
4. **Out of scope**: at least one explicit exclusion, or confirm nothing adjacent is in scope.

There is no user story section here: a task is described from the doing discipline's perspective, not a persona's. A design task may reference or attach the design context it needs (a parent Figma frame, the story's design assets); an engineering task usually will not.

### Step 3: Preview and confirm

Render the complete issue body in a markdown code block, including the `Part of #NNN` line linking it to the parent story, and ask for confirmation before creating the issue.

### Step 4: Create the issue and link it to the parent

The title must follow the commit convention from CLAUDE.md: `<type>(<scope>): <short description>` using backticks around the scope. Pick the type (`feat`, `fix`, `chore`, `refactor`, `docs`) that matches what the task actually does; it does not have to match the parent story's type. For a design task, pick the type that fits the tracked deliverable (`design` if the repo's convention allows it, otherwise `feat` for new UI or `docs` for design documentation), and keep the title a valid commit message so the implementing PR can reuse it.

The body is markdown containing backticks and other shell-special characters, so pass it via a file rather than inline (an inline `--body "..."` would let the shell interpret backticks as command substitution). Write the confirmed body to a temp file and create the issue with `--body-file`.

Ensure the usage-tracking label exists (idempotent, `gh label create` exits non-zero if it already exists, which `|| true` swallows), then create the issue with it:

```sh
gh label create "skill:dx-create-task" --color ededed --description "Created with the dx-create-task skill" 2>/dev/null || true

gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "skill:dx-create-task"
```

- **If the command succeeds**: print the issue URL, then link it to the parent story as a native GitHub sub-issue. Resolve both issues' node IDs first, then call the mutation:

  ```sh
  # Resolve the parent story and the new task to their node IDs
  gh issue view <parent-number> --json id --jq .id
  gh issue view <new-task-number> --json id --jq .id

  # Link the new task as a sub-issue of the parent story
  gh api graphql -f query='mutation($parent:ID!,$sub:ID!){addSubIssue(input:{issueId:$parent,subIssueId:$sub}){subIssue{number}}}' -f parent=<parent-story-id> -f sub=<new-task-id>
  ```

  Confirm the link succeeded (the mutation response echoes the sub-issue number) and tell the user the parent story's progress will now reflect this task.
- **If the command fails with "command not found" or "'gh' is not recognized"**: render the issue title and body as markdown and instruct the user to create the issue manually via the GitHub web interface, then manually add it as a sub-issue of the parent story from the GitHub UI.
- **If the command fails for any other reason**: surface the real error and stop.

## Rules

- Never leave a section blank. Every section must be explicitly filled or marked `N/A` / `None`.
- Never create a task without a verified parent story linked as a sub-issue.
- Acceptance criteria use whichever shape fits: Given-When-Then scenarios (outcome-first named) for observable system behaviour, or a done-when checklist of independently verifiable items for a deliverable. Do not force both.
- Do not describe implementation in acceptance criteria: write what is observably true when the task is done (the system's behaviour, or the state of the deliverable), not how it was built.
- Pick one term per concept and use it consistently across all scenarios or checklist items.
- Do not use em-dashes (`—`) in the issue title or body. Use colons, parentheses, or separate sentences instead.
- The PR that implements this issue will squash-merge using its title as the commit message, so titles must be valid commit messages.
