---
name: dx-split-issue
description: Use when an issue that already exists turns out to be too big to deliver in one pull request, for example "this story is too large", "break #142 into pieces", "split this issue up", or when `dx-implement-issue` stops and reports that a plan covers two unrelated capabilities. Reads the parent, proposes how to cut it into single-discipline slices, and creates each confirmed slice with `dx-create-task` as a sub-issue so the parent keeps tracking progress. Not for work that has not been filed yet: a new piece of work goes to `dx-create-story`, `dx-create-chore`, or `dx-create-issue`.
---

You are splitting a piece of work that is already filed and has turned out too big. The parent stays open and keeps its scope; what changes is that the delivery work moves into slices hanging off it.

Two things make this skill worth having, and both are about judgment rather than typing. The first is the cut itself: deciding which acceptance criteria belong together is the whole decision, and getting it wrong produces slices that fight over the same files. The second is that a split happens to work someone already filed, often mid-implementation, so the author needs to see the proposed cut before anything is created.

You do not own the issue template. Once a slice is confirmed, `dx-create-task` creates it, because it owns the task shape, the sub-issue link, and its own intake. Keeping a second copy of that template here is how the two drift apart.

## Workflow

### Step 1: Read the parent

```sh
gh issue view <number> --json number,title,body,state,labels,comments
```

- **If the command fails with "command not found" or "'gh' is not recognized"**: ask the author to paste the issue body, and say plainly that you cannot create the slices for them either. You can still propose the cut, which is the part that needs a person.
- **If the command fails for any other reason**: surface the real error and stop.

Check what shape the parent is, because it decides what you are grouping:

- **A story** (`## User story`, or a `skill:dx-create-story` label): group the Given-When-Then acceptance criteria.
- **A chore** (`## What is changing` with `## Done when`): group the done-when items.
- **A task** (`## Parent`): stop. A task is already one discipline's smallest slice, so splitting it usually means the parent was cut wrongly. Say so and ask whether the real fix is to re-cut the task's own parent.
- **A bug** (`## Steps to reproduce`): stop. A defect with one reproduction path is one fix. Several unrelated defects filed together should be separate bug reports rather than slices of one, so point the author at `dx-create-bug` for each.

Read the comments too. A decision that narrowed or widened the scope often lives there rather than in the body, and splitting against a stale body cuts the wrong work.

### Step 2: Propose the cut

Group the criteria into slices. Criteria belong in the same slice when they share an actor, an area of the system, and the files a change would touch. They belong in different slices when either could ship without the other.

A slice is one discipline's piece of work, so the discipline is part of the cut. Laying out a screen and building the endpoint behind it are two slices even when they serve the same criterion, because a designer delivers one and an engineer the other.

Prefer few, coherent slices. Cutting a story into six pieces to make each one small usually means the pieces stop being independently deliverable, and then every slice is blocked on another.

Present the proposal and stop for confirmation:

```
Proposed split of #142 into 2 tasks:

1. Filter controls on the assignments list (design)
   Criteria: "Filters are visible", "Selected filter is obvious"
   Depends on: nothing

2. Filtered query behind the assignments list (engineering)
   Criteria: "List shows only matching assignments", "Empty result explains itself"
   Depends on: 1
```

Name what each slice delivers, which criteria it carries, and what it waits on. Then ask the author to confirm or adjust the grouping. Create nothing until they do, because a wrong cut costs more to unpick than to redraw.

If the criteria do not group, say so rather than inventing a cut. Criteria that all touch one screen and one endpoint are one task, and the honest answer is that the issue is already the right size.

### Step 3: Create each confirmed slice with `dx-create-task`

Run `dx-create-task` once per slice, giving it the parent number and everything you already know: the slice's scope, the criteria assigned to it, the discipline, and the parent's out-of-scope list. It gathers whatever is missing, files the issue, and links it to the parent as a native sub-issue.

Carry the criteria across in the author's words. Rewriting them here is how a split quietly changes what was agreed.

If `dx-create-task` is not installed, say which slices you would have created and stop. Filing them from here with an improvised template is exactly the drift this split prevents.

### Step 4: Record the split on the parent

The parent stays open. It now tracks its slices through GitHub's sub-issue progress, and closing it would throw away the scope, the background, and the discussion.

Add a comment so the split is visible to anyone reading the issue rather than only in the sub-issue panel:

```sh
gh issue comment <number> --body "Split into tasks:
- #NNN Filter controls on the assignments list (design)
- #NNN Filtered query behind the assignments list (engineering)

This issue stays open and tracks them as sub-issues."
```

Then record that this skill did the split, so the pattern is queryable later:

```sh
gh label create "skill:dx-split-issue" --color ededed --description "Split with the dx-split-issue skill" 2>/dev/null || true
gh issue edit <number> --add-label "skill:dx-split-issue"
```

The label goes on the parent, not on the slices: the slices are `dx-create-task` issues and carry its label already.

### Step 5: Report

Say what exists now: each slice with its number and URL, the order they can be picked up in, and that the parent is still open and tracking them. If the author came here from `dx-implement-issue`, name the slice to start with so they can carry straight on.

## Rules

- Propose before creating. The cut is the decision, and the author owns it.
- Never close the parent. It holds the scope and the history, and its progress now comes from its sub-issues.
- Hand creation to `dx-create-task` rather than keeping a template here.
- One slice is one discipline's deliverable piece. Design and engineering split even when they serve the same criterion.
- Say when an issue does not need splitting. "This is already the right size" is a useful answer.
- Do not split a task or a bug. Re-cut the task's parent instead, or file separate bugs.
- Do not use em-dashes (`—`) in issue titles, bodies, or comments. Use colons, parentheses, or separate sentences instead.
