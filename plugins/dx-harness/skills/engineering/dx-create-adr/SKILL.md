---
name: dx-create-adr
description: 'Use when a decision about a codebase should be recorded as an architecture decision record (ADR) in the MADR format, written into the repository so the reasoning outlives the conversation. Triggers on "write an ADR", "record this decision", "document why we chose X", "add an architecture decision record", "supersede ADR-0004", and "we should write this decision down". Picks the next free number, seeds the ADR directory on first use, chooses the template variant that fits the decision, and marks a replaced record superseded. NOT for filing a GitHub issue: that is dx-create-story, dx-create-task, dx-create-chore, or dx-create-bug.'
---

You are recording a decision about a codebase as an architecture decision record: a
numbered file in the repository, written in the MADR format, whose body is never
edited once accepted.

This skill runs in whatever repository invokes it. Detect the directory name, the
tracker, and the network at each step. Assume none of them.

## Step 1: Gather the decision

Settle the mode first: is the decision made?

- **Made**: gather everything below and write the record in one run.
- **Not made**: the person is scoping a decision, often before a spike. Gather items
  1 to 5, 8, and 10, skip 6, set the status to `draft`, and read
  `## Working on an open record` before writing anything.
- **Neither, they are returning to a record already open**: go straight to
  `## Working on an open record`.

Ask for each of these. Invent none of them.

1. **The decision**, stated as an action: "use Postgres for the write model", not
   "database choice".
2. **The context, and the problem it forces.** Two things, not one: the background
   a reader needs, and the constraint that makes the status quo untenable.
3. **The requirements it must address**, functional and non-functional. Ask for both
   by name. Latency, availability, cost, and security are the ones people leave out,
   and they are usually what decided the choice.
4. **The user journey it touches**, if any. Skip this where the decision reaches no
   user-facing surface, which is most infrastructure decisions. Do not record `N/A`
   for it.
5. **The options considered**, including the ones turned down.
6. **Why the chosen option won.**
7. **The status.** `references/madr-templates.md` pins the five permitted values.
   Ask; do not default.
8. **The authors**, meaning whoever wrote the record. Not necessarily who decided.
9. **Where the decision was argued.** A link to the RFC issue or thread. If there
   was none, say what happened instead, such as "settled in grooming; no RFC issue
   was raised". Never link a delivery ticket that does not hold the argument.
10. **The date the decision was settled.** Use today's date when none is given. Do
    not leave it blank and do not ask twice: a record with no date cannot be read as
    current or historic. Say which date you used when you inferred it.

If the person supplies only a conclusion, ask for the options before continuing.

**If the ask is to supersede an existing record**, read `references/supersede.md`
now. It adds a chain-walk check, extends step 6, and continues after step 6, before
the report in step 7.

## Step 2: Locate the ADR directory

Find the directory by filename shape, not by directory name. Scan remote branches
as well as the working tree: a repository's records can exist only on an unmerged
branch, which is exactly when writing a second directory does the most damage.

```sh
git fetch --quiet --all
{ git ls-files; git log --remotes --name-only --pretty=format: --diff-filter=A; } \
  | grep -E '(^|/)[0-9]{4}-[^/]+\.md$' \
  | grep -vE '(^|/)[0-9]{4}-[0-9]{2}-[0-9]{2}-' \
  | grep '/' \
  | sed 's|/[^/]*$||' | sort -u        # keep filter 2: a year is four digits too
```

Steps 4 and 5 reuse this fetch.

Confirm each candidate holds records rather than numbered files. Test every record,
not only the newest: one unusual record must not condemn a directory. `git grep`
reads from refs, so this covers records that exist only on a branch.

```sh
# match any ADR format, not only MADR: narrowing this drops a real directory,
# and step 5 then numbers against nothing and reuses a number
git grep -lE '^status:|^\*\*Status:\*\*|^## Decision' \
  $(git for-each-ref --format='%(refname)' refs/remotes) HEAD \
  -- '<candidate>/[0-9][0-9][0-9][0-9]-*.md' \
     ':(exclude)<candidate>/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*'
```

No output means numbered files that are not records. Drop the candidate.

- **One directory**: use it.
- **Several**: name them and ask which. Do not guess.
- **None**: create `docs/adr/`, write the record into it, and say the directory is
  new.

Once you settle on an existing directory, read its highest-numbered record, which
the next section needs. A record on a branch is not in the working tree, so fall
back to the ref that added it:

```sh
P=$( { git ls-files '<dir>/*.md'; \
       git log --remotes --name-only --pretty=format: --diff-filter=A -- '<dir>/*.md'; } \
     | grep -E '/[0-9]{4}-[^/]+\.md$' | grep -vE '/[0-9]{4}-[0-9]{2}-[0-9]{2}-' \
     | sort -u | tail -1 )
cat "$P" 2>/dev/null || git show "$(git log --remotes --format=%H -1 -- "$P"):$P"
```

Note its format per the section below.

### Note the format when it differs

This skill writes MADR. It never adopts another template, because the rest of it
depends on the shape: `supersede.md` marks a record replaced by editing the
`status:` field in its frontmatter, and a record written in a template without
frontmatter could never be superseded by the procedure that wrote it.

The record read above tells you what the directory already uses. If its first line
is not `---`, say so in the step 7 report, once, naming what follows:

> `docs/adr/` holds 3 records in another template: they carry `**Status:**` rather
> than YAML frontmatter. This record is MADR, so the directory now holds two
> conventions, and superseding one of the older three is not something this skill
> can do.

Report it and continue. Do not ask, and do not change template.

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

Read every record in the directory, and say so when there are none:

```sh
git ls-files '<dir>/*.md' \
  | grep -E '/[0-9]{4}-[^/]+\.md$' | grep -vcE '/[0-9]{4}-[0-9]{2}-[0-9]{2}-'
```

Read the title and status of each. Read the body only of those whose subject
overlaps this decision.

Step 2's fetch means the listing below reaches records on unmerged branches, but
they are not in the working tree, so this check names them without reading them:

```sh
git log --remotes --name-only --pretty=format: --diff-filter=A -- '<dir>/*.md' \
  | sort -u
```

Name any record that listing returns but the working tree does not hold, and say it
was not read. A check that examined nothing must never report as a clean pass:

> Checked 0 records: `docs/adr/` does not exist on this branch. 0001 and 0002 exist
> on unmerged branches and were not read, so a contradiction with either would not
> have been caught.

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
# step 2 already fetched
# not ls-tree: it takes ONE tree-ish, so many refs return empty at exit 0
# --diff-filter=A: a number claimed by a since-deleted record is still claimed
git log --remotes --name-only --pretty=format: --diff-filter=A -- '<dir>/*.md' \
  | grep -E '(^|/)[0-9]{4}-[^/]+\.md$' | sort -u
```

**3. Requests from forks.** These have no branch in this repository. Settle the
forge first, per `../../../procedures/pr-mechanics.md`: never assume GitHub, read it
from `git remote get-url origin`, and stop rather than guess if it names neither.

On GitHub:

```sh
owner=$(gh repo view --json owner --jq .owner.login)
gh pr list --state open --json number,headRepositoryOwner \
  --jq ".[] | select(.headRepositoryOwner.login != \"$owner\") | .number" \
  | while read -r n; do gh pr view "$n" --json files --jq '.files[].path'; done
```

On GitLab the equivalent is `glab mr list` filtered to merge requests whose source
project differs from the target. `glab` moves its flags between versions, so confirm
the exact form with `glab mr list --help` before running it. Do not guess a flag.

Take the claimed numbers from the paths returned.

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
2. Whether the directory was created on this run, and whether it already held
   records in another template.
3. Any numbering source that could not be checked, and what that risks.
4. On a supersede, both files that changed and the chain they now form.

## Working on an open record

A record whose status is `draft` or `proposed` is not finished, and its body may be
edited. The rule against editing applies to an `accepted` record only.

### Adding what a spike found

Route each finding to the section that owns it, rather than appending everything to
the end:

| The finding | Goes to |
| --- | --- |
| An option nobody had considered | `Considered Options` |
| Evidence for or against an option | `Pros and Cons of the Options` |
| A constraint discovered on the way | `Decision Drivers` |
| The spike, its branch, its numbers | `More Information` |
| What was tried and what happened | a dated `Research log` entry |

The status does not change. Say which sections you touched.

### Promoting it

Re-run step 4 before anything else. A spike takes weeks, and the directory can gain a
record that contradicts this one while it runs.

Then fill `Decision Outcome` with the chosen option and the reason it won, replacing
the `Settled by` line, and set the status to `accepted` or `rejected`. Keep the
research log.

From that point the body is frozen and a change means superseding it, per
`references/supersede.md`.

## Rules

- Never edit the body of an accepted record. Supersede it instead, per
  `references/supersede.md`. A `draft` or `proposed` record is not accepted, so it is
  edited in place.
- Never reuse a number, including one freed by a rejected or deleted record.
- One decision per record.
- Write nothing while a question is open. Steps 3, 4, and 5 all stop and wait.
- Do not use em dashes in a record, a filename, or a report. Use colons,
  parentheses, or separate sentences.
