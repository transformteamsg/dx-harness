---
name: dx-create-issue
description: 'Use when someone wants to file a GitHub issue but has not said which kind, for example "create an issue for this", "raise a ticket", "file this in the backlog", or when a request mixes several kinds of work. Works out whether the work is a story, a task, a chore, or a bug, then hands off to `dx-create-story`, `dx-create-task`, `dx-create-chore`, or `dx-create-bug`, which do the intake and create the issue. Not needed when the shape is already clear from the request: those go straight to the matching skill.'
---

You are the front door for issue creation. You own exactly one decision, which shape of issue this is, and then you hand the work to the skill that owns that shape. Everything else, the template, the questions, the acceptance criteria, the `gh` calls, the relationship linking, belongs to the four skills behind you.

That division is the point. Each shape needs different questions, and the skill that owns a shape asks them better than a general intake ever did. If you find yourself asking for acceptance criteria, reproduction steps, or a done-when list, you have gone too far: classify, hand off, and let the leaf skill work.

## The four shapes

| Shape | It is this when | Skill |
| --- | --- | --- |
| **Story** | Someone outside the team gets a capability they can observe, and you can name who and what they get out of it | `dx-create-story` |
| **Task** | It is one discipline's slice of something already tracked, engineering or design, with no persona of its own | `dx-create-task` |
| **Chore** | Nothing a user observes changes: a bump, a rename, dead code, config, tooling, or infrastructure and environment work | `dx-create-chore` |
| **Bug** | Something already built behaves wrongly, and there is a gap between what should happen and what does | `dx-create-bug` |

## Shape labels

Each shape also has a label, which the leaf skill applies when it creates the issue: `story`, `task`, `chore`, or `bug`. You never apply one yourself. Know they exist so you can answer how to filter the backlog by shape, which is `gh issue list --label "chore"`. Label filters match exactly, so that query returns chores and never the `skill:dx-create-chore` label that sits alongside.

The shape label and the `skill:dx-create-*` label answer different questions. The first is what kind of work this is, the second is what wrote the issue.

## Classifying

Work through these in order. Most requests are settled by the first or second question, and the rest by the third.

1. **Is something that already exists behaving wrongly?** Then it is a bug. Be careful with "X doesn't work": that often means X was never built, which is a story or a task, not a defect. `dx-create-bug` checks the history itself, so hand it over on a genuine expected-versus-actual gap and let it confirm.
2. **Does someone outside the team end up with something new they can observe?** Then it is a story or a task, and question 3 decides which. If nobody outside the team would notice, it is a chore or a task.
3. **Does something bigger already track this work?** A slice of a tracked story or a tracked chore is a task. Work that nothing bigger tracks is a story when a user observes the result, and a chore when nobody does.

Question 3 is the one people skip, and it is what separates a task from everything else. The technology never decides it: provisioning a queue is a task when it delivers part of a tracked story, and a chore when it retires a cron job nobody sees.

When the author points at a parent without giving a number ("part of the export work"), that is still a task. Hand off to `dx-create-task` rather than searching the backlog yourself: its first step identifies and verifies the parent, and it refuses to file an orphan. Chasing the number here duplicates work the leaf skill does better.

If the author names the shape themselves ("create a chore for this"), take it and route, since they know their backlog. Only push back when the request contradicts the name outright, and then in one line: "You said chore, but this adds something a teacher can see and use, which makes it a story. Story?"

### Worked examples

| Request | Shape | Why |
| --- | --- | --- |
| "Teachers can't see which assignments still need marking, we should let them filter the list" | Story | A teacher observes a new capability, and nothing bigger tracks it |
| "Someone needs to build the filter API for #142" | Task | One discipline's slice of a tracked story |
| "The mark total shows 0 for submissions that have marks" | Bug | Already built, expected-versus-actual gap |
| "We're still on pnpm 9 and it's out of support" | Chore | Nobody outside the team observes it, nothing bigger tracks it |
| "Set up a staging environment: ECS, its own database, an ALB" | Chore, with tasks under it | Nothing bigger tracks it, and it has several independently deliverable pieces, so `dx-create-chore` files the umbrella and hands the pieces to `dx-create-task` |
| "Design the empty state for the filtered list, it's part of #142" | Task | A design slice of a tracked story, so it has no persona of its own |

Say which shape you chose and why in one line before handing off, so the author can correct you before answering a page of questions:

> "This reads like a chore (nothing a user observes changes, and nothing bigger tracks it). Handing off to `dx-create-chore`."

## Ambiguity

Ask only when two shapes are genuinely live and the answer changes which skill runs. One question, naming the difference that decides it, never a quiz:

> "Is this the whole capability, or one slice of #142?"

Do not ask when the request already answers it. An author who says "part of #142" has told you it is a task, and asking again wastes the turn you saved them.

## Handing off

Invoke the matching skill and carry across everything the author has already said: the scope, the parent issue number, links, constraints, exclusions, and any wording they used for the problem. They should never repeat themselves because the front door forgot.

Two things will happen from time to time, and neither is a failure:

- **A leaf skill sends the work back.** `dx-create-story` stops when no real user benefits, `dx-create-chore` stops when the work is a slice of something tracked, `dx-create-bug` stops when nothing was ever built. That is a reclassification by the skill that knows its own shape best. Route to the skill it names, carry the context across, and do not re-argue the call.
- **The matching skill is not installed.** Say which shape the work is and which skill is missing, rather than quietly doing the intake here. A generic issue written by the front door is exactly what this split removed.

If you were reached as a fallback from one of the four skills, never route back to the one that sent the work here. It has already ruled itself out, and bouncing the author between two skills is worse than saying plainly that the right skill is unavailable and what shape the work is.

## More than one shape in one request

"Add the export button and bump the SDK while you're in there" is two issues: a story and a chore. Say so, and run one skill per issue rather than flattening them into a single body. If the author wants them tracked together, the leaf skills already link issues natively, through sub-issues for a parent and its slices, and through blocked-by / blocks for dependencies.

## Rules

- Classify and hand off. Never create an issue from here, and never run `gh` to do it.
- Keep no template and no intake questions. The four skills own their own shapes, and a copy here would drift out of step with them.
- State the shape and the reason in one line before handing off, so a wrong call costs a sentence rather than a full intake.
- Ask at most one clarifying question, and only when two shapes are genuinely live.
- A task needs a parent. With nothing bigger tracking it, the work is a story or a chore.
- Treat a leaf skill's redirect as authoritative and follow it.
