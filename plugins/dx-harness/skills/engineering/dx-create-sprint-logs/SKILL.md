---
name: dx-create-sprint-logs
description: 'Use when someone needs a sprint log written at the end of a sprint, one per workstream, for the squad that picks the work up next. Triggers on "write the sprint log", "log this sprint", "sprint handover", "what did we ship this sprint", or a request to record a sprint before handing a workstream over. Produces a terse record of what closed, what carried over, what was decided, and what risk transfers, every row linking out. Not for writing the reasoning behind any of it: that belongs in the issue or the decision record, which this log links to.'
---

# Write a sprint log

A sprint log is a handover. It records what one squad hands to whoever holds the
workstream next: what closed, what did not, what was decided, and what risk
transfers with it.

**It is a record, not an account.** Every row is a clause and a link. The
reasoning behind a decision, the analysis behind a finding, and the argument for
why work slipped all live somewhere with an owner and a URL. The log points at
them.

That is the whole discipline, and it is what stops a sprint log growing into a
document nobody reads at the moment it is needed most.

## The template

The canonical structure is in
[references/sprint-log-template.md](references/sprint-log-template.md). Read that
file before you write or preview a log. Fill every field: a field with nothing in
it takes `None`, which is a finished answer.

One log per workstream. A squad holding two workstreams writes two logs.

## Where narrative goes

Nothing in this table belongs in the log. Each row says where it does belong, and
what the log carries instead.

| What you are about to write | Where it goes | What the log carries |
|---|---|---|
| Why a decision was taken, and what was rejected | A decision record in the product repository | The decision in one clause, and a link to the record |
| Why an item slipped, and what blocked it | The issue itself | One clause, and a link |
| Analysis of a test result or an incident | The issue, or a decision record | The finding in one clause, and a link |
| What a risk means in detail, and who should act | Its own issue | The risk in one clause, its owner, and a link |
| A correction to a previous sprint's log | An issue against that log | One clause, and a link |

**A row with no link is the finding.** If a decision has no record, or a risk has
no issue, the log has caught something: write the record or raise the issue, then
link it. Do not use the log as the place of record, because a reader planning from
the issue tracker will never see it, and a log entry cannot be assigned, closed,
or carried forward.

## Concision

Match the register of the template's own examples. They are single clauses:
*"Mid-sprint reassignment"*, *"Dependency on external API delayed; partially
completed story accepted by Beta."*

- **Keep every cell to 20 words or fewer.** One clause where one clause will do.
- **If a cell needs a second sentence to justify itself, that sentence belongs
  somewhere else.** Move it, and link the cell to where it went.
- **Write no prose sections.** The log is its tables and its header. It has no
  background, no summary, and no closing note.
- The rest of the prose rules are in
  [House style](../../../procedures/house-style.md).

## Workflow

### Step 1: Establish the sprint and the workstreams

Ask, and do not infer:

1. **Sprint dates**, start and end, ISO 8601.
2. **Workstreams** the squad held, and the repository for each.
3. **Squad**, and who is receiving each workstream next. `Unassigned` is an
   answer, and a more useful one than a guess.

### Step 2: Read the repositories, not your memory

Gather the evidence before writing anything. For each workstream, over the sprint
window:

- Issues closed, with their point values.
- Pull and merge requests merged.
- Issues still open that were committed at Sprint Planning, and issues raised
  mid-sprint that are still open. These are different things and the template
  separates them.
- Decision records added or changed.

State plainly which sources you could not search. An unsearchable source is a gap
in the log, not something to leave unmentioned.

### Step 3: Route the narrative before you write

Work through what you have gathered and split it in two:

- **Facts with a link** go in the log.
- **Everything else** goes to the table above. For each one, name where it should
  live and say so to the author, because most of these will not exist yet.

Do this before filling the template, not after. Routing afterwards means writing
the narrative first and then deleting it, and it rarely survives.

### Step 4: Fill the template

Fill every field. Keep each cell inside 20 words. Where a cell wants more, it is
carrying narrative that Step 3 should have routed: route it now.

### Step 5: Preview and confirm

Render the complete log in a markdown code block. Before showing it, apply the
"Before you post it" checks in [House style](../../../procedures/house-style.md)
and cut anything that fails them.

Say plainly, in one line each:

- Every row that has no link, and what needs creating to give it one.
- Every source you could not search.

Then ask for confirmation.

### Step 6: Write it

Write the log where the product repository keeps them, following the naming its
existing logs use. Where the repository has a frontmatter convention, follow it,
and never add a second schema beside one a check already enforces.

If there are no existing logs to follow, ask where they should live rather than
choosing a path.

## Rules

- One log per workstream. Never merge two workstreams into one log.
- Every row carries a link. A row with no link is a finding, reported in Step 5.
- Every cell is 20 words or fewer.
- The log has no prose sections: no background, no summary, no closing note.
- `None` is a finished answer for a field with nothing in it.
- Committed-at-planning and raised-mid-sprint are recorded separately, because
  only the first is spillage against a commitment.
- Report what could not be searched. Never present partial evidence as a sweep.
- Do not edit a previous sprint's log to correct it. Raise an issue against it and
  link that from this log.
