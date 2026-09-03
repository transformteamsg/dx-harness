---
name: dx-create-adr
description: 'Use when a decision about a codebase should be recorded as an architecture decision record (ADR) in the MADR format, written into the repository so the reasoning outlives the conversation. Triggers on "write an ADR", "record this decision", "document why we chose X", "add an architecture decision record", "supersede ADR-0004", and "we should write this decision down". Picks the next free number, seeds the ADR directory on first use, chooses the template variant that fits the decision, and marks a replaced record superseded. NOT for filing a GitHub issue: that is dx-create-story, dx-create-task, dx-create-chore, or dx-create-bug.'
---

You are recording a decision about a codebase as an architecture decision record: a
numbered file in the repository, written in the MADR format, never edited once
accepted.

This skill runs in whatever repository invokes it. Detect the directory name, the
tracker, and the network at each step. Assume none of them.

## Step 1: Gather the decision

Ask for each of these. Invent none of them.

1. **The decision**, stated as an action: "use Postgres for the write model", not
   "database choice".
2. **The problem that forced it.** What made the status quo untenable.
3. **The options considered**, including the ones turned down.
4. **Why the chosen option won.**
5. **The status.** `references/madr-templates.md` pins the five permitted values.
   Ask; do not default.
6. **The authors**, meaning whoever wrote the record. Not necessarily who decided.
7. **Where the decision was argued.** A link to the RFC issue or thread. If there
   was none, say what happened instead, such as "settled in grooming; no RFC issue
   was raised". Never link a delivery ticket that does not hold the argument.

If the person supplies only a conclusion, ask for the options before continuing.

**If the ask is to supersede an existing record**, read `references/supersede.md`
now. It changes steps 4 to 6.

## Step 2: Locate the ADR directory

Find the directory by filename shape, not by directory name.

```sh
git ls-files \
  | grep -E '(^|/)[0-9]{4}-[^/]+\.md$' \
  | grep -vE '(^|/)[0-9]{4}-[0-9]{2}-[0-9]{2}-' \
  | sed 's|/[^/]*$||' | sort -u        # keep filter 2: a year is four digits too
```

Confirm each candidate holds records, not just numbered files:

```sh
grep -lE '^status:|^## Decision Outcome' <candidate>/[0-9][0-9][0-9][0-9]-*.md | head -1
```

A candidate with no match is not an ADR directory. Drop it.

- **One directory**: use it, unchanged.
- **Several**: name them and ask which. Do not guess.
- **None**: create `docs/adr/`, write the record into it, and say the directory is
  new.

## Step 3: Question a change with no architectural consequence

Apply one test. Does the change do any of these?

- Change an interface that something else depends on
- Add or remove a dependency
- Constrain what someone can do later

**If it does at least one**, continue to step 4 without comment.

**If it does none**, say so once and ask. Do not refuse.

> This looks like an implementation detail rather than a decision: it changes no
> interface, no dependency, and no constraint on future work. A commit message may
> serve it better, next to the code it explains.
>
> Record it anyway?

Write the record on a yes. On a no, write nothing and say where the change belongs.

## Step 4: Check the decision against the records on file

Read the `status` and title of every record. Read the body only of those whose
subject overlaps this decision.

**If an accepted record contradicts this decision**, stop before writing anything.
Name the record, state the contradiction in one sentence, and ask:

> ADR-0004 (use Postgres for the write model) is accepted, and this decision
> reverses it. Supersede ADR-0004 rather than filing a record that opposes it?

- **On a yes**: read `references/supersede.md` and follow it.
- **On a no**: record the disagreement in the new record's context, naming the
  record it conflicts with.

Write no file and change no frontmatter until they answer.

## Step 5: Resolve the number

Check three sources and take one above the highest number found in any of them.

**1. The working tree.** List the directory found in step 2.

**2. Remote branches**, which also covers pull requests raised from this
repository:

```sh
git fetch --quiet --all
# not ls-tree: it takes ONE tree-ish, so many refs return empty at exit 0
# --diff-filter=A: a number claimed by a since-deleted record is still claimed
git log --remotes --name-only --pretty=format: --diff-filter=A -- '<dir>/*.md' \
  | grep -E '(^|/)[0-9]{4}-[^/]+\.md$' | sort -u
```

**3. Pull requests from forks.** These have no branch in this repository:

```sh
gh pr list --state open --json number,headRepositoryOwner \
  --jq '.[] | select(.headRepositoryOwner.login != "<this repo owner>") | .number'
```

Read the files of each number returned and take the claimed numbers from them.

**If a source cannot be reached**, number from what you could read and name what you
could not check:

> Numbered from the working tree and remote branches. Could not check pull requests
> from forks, because `gh` is not authenticated here. If one claims 0008, this
> record will collide with it at merge.

Never refuse to write a record because a check was unavailable.

**If the person asks for a number already taken**, refuse it, take the next free
one, and say so.

## Step 6: Choose the variant and write the record

Read `references/madr-templates.md` for both variants and their shared frontmatter.

- **Minimal**, for two or three options and a rationale that fits a paragraph.
- **Full**, for four or more options, a migration cost, or consequences worth
  separating from the rationale.

Say which you chose in one line, and change it if the person prefers the other.

Name the file `NNNN-title-with-dashes.md`. Fill every placeholder. Leave no heading
empty: a section with nothing to say gets `N/A` and a one-line reason.

## Step 7: Report

1. The path and number of the record, its variant, and its status.
2. Whether the directory was created on this run.
3. Any numbering source that could not be checked, and what that risks.
4. On a supersede, both files that changed and the chain they now form.

## Rules

- Never edit the body of an accepted record. Supersede it instead, per
  `references/supersede.md`.
- Never reuse a number, including one freed by a rejected or deleted record.
- One decision per record.
- Write nothing while a question is open. Steps 3, 4, and 5 all stop and wait.
- Do not use em dashes in a record, a filename, or a report. Use colons,
  parentheses, or separate sentences.
