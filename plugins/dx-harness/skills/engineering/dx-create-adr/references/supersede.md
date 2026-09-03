# Superseding a record

Read this file when a run supersedes an existing record. Two paths reach it: the
person asked to supersede a record by number, or step 4 of `SKILL.md` found a
contradiction and they chose to supersede rather than file an opposing record.

A supersede writes two files: the new record, and the frontmatter of the record it
replaces. Both changes land together or neither does, so the chain is never left
half-updated.

## Step A: Walk the chain to the live record

A record can already be superseded. Superseding it again forks the chain, and a
reader following the links then arrives at two different answers depending on
which fork they take.

Start at the record named and follow its `status` field:

1. Read `status`. If it is not `superseded by ADR-NNNN`, this is the live record.
   Continue to step B.
2. If it is `superseded by ADR-NNNN`, the record named is not live. Read that
   record next and repeat.
3. Stop if a record appears twice. That is a cycle, which means the chain is
   already broken. Report the loop with every number in it and change nothing.

Cap the walk at the number of records in the directory. A chain longer than that
is a cycle by definition.

**If the walk ends somewhere other than where it started**, refuse. Name the live
record, show the chain that leads to it, and offer to supersede that one instead:

> ADR-0002 was already superseded by ADR-0005, which is the live record in this
> chain (0002 to 0005). Superseding 0002 now would fork it. Supersede 0005
> instead?

Write nothing and change no frontmatter until they answer. On a yes, restart at
step A with the live record, which will pass on the first check.

## Step B: Write the new record

Return to `SKILL.md` steps 5 and 6 for the number and the template. Two additions
for a superseding record:

- The frontmatter carries `supersedes: ADR-0002`. This field is the reason the
  chain reads in both directions, so it is never left out and never replaced by a
  sentence in the body. Stock MADR has no equivalent, which is why a record written
  against plain MADR cannot say what it changed.
- The context says what changed since the earlier decision. A superseding record
  that only restates the new choice leaves the reader unable to tell what moved.

## Step C: Update the record being replaced

Change one field in its frontmatter, and nothing else:

```yaml
status: superseded by ADR-0009
```

Leave `date` as it was. It records when that decision was made, not when it was
replaced, and moving it destroys the ordering. Leave the body untouched: a
superseded record stays readable as the decision it was, which is the reason it
was kept rather than deleted.

## Step D: Confirm both ends point at each other

Before reporting, read both files back and confirm two things:

- The replaced record's `status` reads `superseded by ADR-NNNN`, naming the new
  number.
- The new record's `supersedes` frontmatter field names the replaced one.

A link in only one direction is the failure this step exists to catch. A reader
arriving at the old record needs to find the new one, and a reader arriving at the
new one needs to find what it changed.
