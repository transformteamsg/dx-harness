---
name: dx-create-adr
description: 'Use when a decision about a codebase should be recorded as an architecture decision record (ADR) in the MADR format, written into the repository so the reasoning outlives the conversation. Triggers on "write an ADR", "record this decision", "document why we chose X", "add an architecture decision record", "supersede ADR-0004", and "we should write this decision down". Picks the next free number, seeds the ADR directory on first use, chooses the template variant that fits the decision, and marks a replaced record superseded. NOT for filing a GitHub issue: that is dx-create-story, dx-create-task, dx-create-chore, or dx-create-bug.'
---

You are recording a decision about a codebase as an architecture decision record,
so that the reasoning survives the conversation that produced it. The record is a
file in the repository, written in the MADR format, numbered in sequence, and
never edited once accepted.

The thing that makes a record worth writing is the part people leave out: what
else was considered, and why it lost. A record that states only the conclusion
tells a reader what the code already tells them. A record that states the options
tells them whether the decision still holds, which is the question they actually
arrived with.

This skill runs in whatever repository it is invoked in. Detect what you need at
each step. Do not assume a directory name, a tracker, a network connection, or a
convention from the repository this skill was written in.

## Step 1: Gather the decision

Ask for what the record needs, and do not invent any of it:

1. **The decision.** What was chosen, stated as an action: "use Postgres for the
   write model", not "database choice".
2. **The problem that forced it.** What made the status quo untenable. This is
   what lets a future reader judge whether the decision still applies.
3. **The options considered**, including the ones turned down.
4. **Why the chosen option won.**
5. **The status**, either `proposed` or `accepted`. Ask rather than defaulting,
   because a proposal recorded as accepted reads as settled to everyone who finds
   it later.

If the person supplies only a conclusion, ask for the options before continuing. A
record with one option hides the fact that no alternative was weighed, and that is
the fact a reader most needs.

**If the ask is to supersede an existing record**, read `references/supersede.md`
now. It changes steps 4 to 6, and its first check can end the run before any file
is written.

## Step 2: Locate the ADR directory

Find the directory by the shape of the filenames rather than by the directory
name, because a repository names its directory what it likes and a name-based
search finds the wrong thing as often as the right one:

```sh
git ls-files \
  | grep -E '(^|/)[0-9]{4}-[^/]+\.md$' \
  | grep -vE '(^|/)[0-9]{4}-[0-9]{2}-[0-9]{2}-' \
  | sed 's|/[^/]*$||' | sort -u
```

The second filter drops date-prefixed files such as `2026-08-14-notes.md`. A year
is also four digits, so without it a repository that keeps dated plans or specs
reports directories holding no records at all, and the run stops to ask which of
them to use.

Confirm each remaining candidate actually holds records, because a directory of
numbered plans passes the filename test too:

```sh
grep -lE '^status:|^## Decision Outcome' <candidate>/[0-9][0-9][0-9][0-9]-*.md | head -1
```

A candidate with no match is not an ADR directory. Drop it and carry on.

- **One directory**: use it, unchanged.
- **Several**: name them and ask which one this record belongs in. Do not guess,
  because a record filed in the wrong directory is invisible to the people who
  need it.
- **None**: create `docs/adr/` and write a README into it from
  `references/adr-readme.md`. Tell the person the directory is new, so they know a
  convention was established on their behalf and can move it before it spreads.

Write the README only on the run that creates the directory. A later run leaves it
alone, because a team will have edited it.

## Step 3: Question a change with no architectural consequence

Not every change deserves a record. A directory that fills with routine notes
stops being read, and then the decisions that mattered are lost inside it.

Apply one test. Does the change do any of these?

- Change an interface that something else depends on
- Add or remove a dependency
- Constrain what someone can do later

**If it does at least one**, continue to step 4 without comment.

**If it does none**, say so once and ask. Do not refuse: the person knows
constraints in their codebase that this test cannot see, and a refusal they
disagree with sends them to write the file by hand, which loses the format and the
numbering this skill exists to keep.

> This looks like an implementation detail rather than a decision: it changes no
> interface, no dependency, and no constraint on future work. A commit message may
> serve it better, next to the code it explains.
>
> Record it anyway?

Write the record on a yes. Write nothing on a no, and say where the change belongs
instead.

## Step 4: Check the decision against the records on file

A new record that reverses an accepted one, with neither naming the other, leaves
two live decisions in opposition and a reader with no way to tell which governs.

Read the `status` and title of every record in the directory. Read the body only
of those whose subject overlaps this decision, so the check stays cheap on a
directory that has grown.

**If an accepted record contradicts this decision**, stop before writing anything.
Name the record, state the contradiction in one sentence, and ask:

> ADR-0004 (use Postgres for the write model) is accepted, and this decision
> reverses it. Supersede ADR-0004 rather than filing a record that opposes it?

- **On a yes**: read `references/supersede.md` and follow it.
- **On a no**: record the disagreement in the new record's context, naming the
  record it conflicts with, so the next reader sees both.

Write no file and change no frontmatter until they answer.

## Step 5: Resolve the number

Records are numbered in sequence and a number is never reused, including by a
record that was rejected or abandoned, because a reused number breaks every link
written before the change.

Check three sources, cheapest first, and take one above the highest number found
in any of them.

**1. The working tree.** List the directory found in step 2.

**2. Remote branches.** A number claimed on a branch that has not merged yet is
still claimed. This also covers every open pull request raised from this
repository, because those have a branch here:

```sh
git fetch --quiet --all
git log --remotes --name-only --pretty=format: --diff-filter=A -- '<dir>/*.md' \
  | grep -E '(^|/)[0-9]{4}-[^/]+\.md$' | sort -u
```

Do not reach for `git ls-tree` here. It takes one tree-ish, so passing it every
remote ref makes it read the first as the tree and the rest as pathspecs that
match nothing: it returns an empty list and exit status 0, which reads exactly
like a clean scan that found no claimed numbers.

`--diff-filter=A` catches a number claimed by a record that was later deleted on
that branch. The number stays claimed, because links written against it do not
disappear when the file does.

**3. Pull requests from forks.** These have no branch in this repository, so they
are the one case the previous source cannot see:

```sh
gh pr list --state open --json number,headRepositoryOwner \
  --jq '.[] | select(.headRepositoryOwner.login != "<this repo owner>") | .number'
```

Read the files of each number returned, and take the claimed numbers from them.

**If a source cannot be reached**, do not stop. A failed fetch, a missing `gh`, an
unauthenticated client, or no network all mean the same thing: number from what
you could read, and name what you could not check.

> Numbered from the working tree and remote branches. Could not check pull
> requests from forks, because `gh` is not authenticated here. If one claims 0008,
> this record will collide with it at merge.

Never refuse to write a record because a check was unavailable. The person cannot
fix the network from inside this run, and a decision unrecorded is worse than a
number resolved at merge.

**If the person asks for a number that is already taken**, refuse that number and
take the next free one. Say which number you used and why.

## Step 6: Choose the variant and write the record

Read `references/madr-templates.md`. It holds both variants and the frontmatter
they share.

Choose by the weight of the decision:

- **Minimal**, for two or three options and a rationale that fits a paragraph.
  Most records are this shape.
- **Full**, for four or more options, a migration cost, or consequences worth
  separating from the rationale.

Say which you chose and why in one line, and change it if the person prefers the
other. The variant is a judgment about the decision, and they know it better.

Name the file `NNNN-title-with-dashes.md`: the number from step 5, then the title
lowercased with dashes for spaces. Fill every placeholder. Leave no heading empty:
a section with nothing to say gets `N/A` and a one-line reason.

## Step 7: Report

Say what now exists:

1. The path and number of the record, its variant, and its status.
2. Whether the directory was created on this run, and whether a README went with
   it.
3. Any numbering source that could not be checked, and what that risks.
4. On a supersede, both files that changed and the chain they now form.

## Rules

- Never edit the body of an accepted record. A decision that changes is superseded,
  which is what `references/supersede.md` is for.
- Never reuse a number, including one freed by a rejected or deleted record.
- One decision per record. Two decisions in one file cannot be superseded
  separately, and one of them always outlives the other.
- Write nothing while a question is open. Steps 3, 4, and 5 all stop and wait.
- Detect, do not assume. The directory name, the tracker, and the network are all
  things this skill finds out rather than expects.
- Do not use em dashes in a record, a filename, or a report. Use colons,
  parentheses, or separate sentences.
