---
name: dx-create-task
description: Use when you need to create a well-structured GitHub issue for engineering-only work that delivers part of an existing user story, with no persona or user-facing benefit clause, for a coding agent to implement.
---

You are helping create a well-structured GitHub issue for an engineering task: work that delivers part of an existing story but has no user-facing framing of its own (add a CI job, write a migration script, instrument logging). Unlike a story, a task has no role or benefit clause: forcing one onto this kind of work produces a fabricated persona. The issue will be implemented by a coding agent, so every section must be complete enough to act on without follow-up questions.

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

1. **Scope**: what area of the codebase does this touch?
2. **Description**: what is this task, and why does the parent story need it? A task is a means to an end, not an end in itself: tie it back to what the story requires.
3. **Acceptance criteria**: at minimum one happy-path scenario and one error/edge-case scenario in Given-When-Then format, describing the observable outcome, not the implementation. Outcome-first names (e.g. "Migration applies cleanly", not "Write migration").
4. **Out of scope**: at least one explicit exclusion, or confirm nothing adjacent is in scope.

There is no user story or design assets section here: a task is described from the system's perspective, not a persona's.

### Step 3: Preview and confirm

Render the complete issue body in a markdown code block, including the `Part of #NNN` line linking it to the parent story, and ask for confirmation before creating the issue.

### Step 4: Create the issue and link it to the parent

The title must follow the commit convention from CLAUDE.md: `<type>(<scope>): <short description>` using backticks around the scope. Pick the type (`feat`, `fix`, `chore`, `refactor`, `docs`) that matches what the task actually does; it does not have to match the parent story's type.

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
- Acceptance criteria must use Given-When-Then format and be outcome-first named.
- Do not describe implementation in acceptance criteria: write what the system does, not how.
- Pick one term per concept and use it consistently across all scenarios.
- Do not use em-dashes (`—`) in the issue title or body. Use colons, parentheses, or separate sentences instead.
- The PR that implements this issue will squash-merge using its title as the commit message, so titles must be valid commit messages.
