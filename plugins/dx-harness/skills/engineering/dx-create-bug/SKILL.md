---
name: dx-create-bug
description: 'Use when you need to create a well-structured GitHub issue for a defect, something that is broken or behaving wrongly, with reproduction steps and an expected-versus-actual delta, for whoever fixes it: an engineer, a designer, or a coding agent.'
---

You are helping create a well-structured GitHub issue for a bug: something that already exists and is behaving wrongly. The issue will be fixed by whoever picks it up, an engineer, a designer for a visual defect, or a coding agent, so it must be complete enough to act on without follow-up questions. A person will also judge whether the behaviour is really wrong, or whether the product is doing what it was asked to do and the ask was wrong. Give them enough to make that call: that is what the expected-versus-actual split is for.

A bug is shaped differently from the other issue types. There is no persona and no "I want" clause, because nobody wants this: the value is not a new capability but the removal of a wrong behaviour. What a fixer needs instead is a path back to the failure. That is the reproduction steps, the gap between what should happen and what does, and ideally something visual that proves it. If someone cannot reproduce a bug, they cannot confirm they have fixed it.

Before accepting a report as a bug, confirm the behaviour was ever built. A report that something "doesn't work" often means it was never there, and the two need opposite responses. Check the code and the history (`git log -S` for the feature's key terms) rather than inferring from the report alone: an author who cannot find a button has not established that it once existed.

If nothing is actually broken and the request is for behaviour that was never built, this is not a bug. Say so and route the author to the skill that fits: `dx-create-story` for user-facing capability work, or `dx-create-task` for a scoped slice of an existing story. If those skills are not installed, fall back to `dx-create-issue`, which routes to whichever is available. Do not file the report as a defect, and do not apply this skill's `bug` or `skill:dx-create-bug` label to it: one records the shape and the other records what this skill produced, and a rerouted report is neither.

Dependencies live outside the body: link blockers and dependents with GitHub's native issue relationships (the "Relationships" panel: blocked by / blocks), so the links stay accurate as issues move and close.

## Issue template

The canonical structure is in [references/issue-template.md](references/issue-template.md). Read that file when constructing or previewing an issue body. Fill every section: if there is nothing to say, write `None`, do not delete the heading. Write every section following [House style](../../../procedures/house-style.md): the reproduction steps and the expected-versus-actual gap carry the report, not a narrative of how it was found.

## Attaching screenshots and recordings

Images and recordings belong on the issue, never in the repository. Upload one by dragging the file into the issue or comment box in GitHub's web interface, which stores it on GitHub's own CDN and returns a URL to paste into the body. `gh` cannot attach binaries, so this step stays manual: say so rather than leaving the author to find out when the link does not resolve.

Never commit a screenshot or a video to the repository so that an issue can link to it. It sits in every clone from then on, it outlives the issue that needed it, and deleting it later does not shrink the history. This applies to a coding agent at least as much as to a person: if you are the one holding the file, hand it to the author to upload instead of writing it into the working tree.

Convert a screen recording to a GIF and keep it under 10 MB, which is GitHub's ceiling for an image or a GIF on an issue. If the GIF is unreadable at that size, trim the recording to the few seconds that matter rather than raising the resolution.

## Workflow

### Step 1: Gather the report

Ask for the following. Do not invent answers: ask if the author has not provided them. Reproduction details in particular are worth pressing on, since a vague report costs the fixer more time than it saved the reporter.

1. **Scope**: what area of the codebase does this touch (for example `auth`, `session`, or `catalogue`)? This becomes the backticked scope in the title.
2. **Summary**: one sentence naming what is broken and where.
3. **Steps to reproduce**: a numbered path from a state anyone can reach to the moment it fails. If the author gives you a rough description, turn it into concrete numbered steps and read them back to confirm. Watch for missing preconditions: a specific account, role, feature flag, or seeded data that the author has and a fixer will not.
4. **Expected behaviour**: what should have happened at the final step.
5. **Actual behaviour**: what happens instead. Ask for error messages verbatim, including stack traces or console output, rather than paraphrased.
6. **Evidence**: a screenshot or screen recording showing the bug reproducing. This is often the fastest way for a fixer to confirm they are looking at the same behaviour, so ask for it directly rather than treating it as optional. If the author does not have one, record that explicitly with the reason (`None available: intermittent, not captured yet`) instead of leaving the section blank, so a reader can tell the difference between "nobody looked" and "we tried and could not catch it". Where the evidence goes matters as much as having it, so follow the rules in Attaching screenshots and recordings above.
7. **Environment**: browser and version, OS, device, app version or commit, and any account or role that matters. A bug that only reproduces in one environment is a different bug from one that reproduces everywhere, and the fixer needs to know which they have.
8. **Impact**: who is affected, how often, and whether a workaround exists. This is what a triager reads to decide whether this is fixed today or next quarter, so avoid a bare severity label with nothing behind it.
9. **Priority**: a single level from `P0` to `P4`, following Google's Issue Tracker convention (`P0` = drop everything, `P4` = trivial). This is the one-glance signal a triager sorts the backlog by, and it should follow from the impact described above rather than being asserted on its own: derive a suggested level from the impact and read it back for the author to confirm or override, since they may know of business context the report does not carry.
10. **Out of scope**: any related problem this fix will not address, or `None`. Bug reports attract adjacent complaints, so an explicit boundary keeps the fix reviewable.

### Step 1b: Check whether this is already reported

Duplicate bug reports fragment the discussion and the fix, so scan before creating. Attempt to fetch open issues:

```sh
gh issue list --state open --json number,title,body --limit 100
```

- **If the command succeeds**: compare each against this report's scope, symptom, and error text. Existing reports of the same defect often use different wording for the same symptom, so match on behaviour rather than phrasing. For any that looks close, fetch its comments, since a known cause or workaround is often only in discussion:

  ```sh
  gh issue view <number> --json comments --jq '.comments[].body'
  ```

  Present findings before asking anything:

  > "This may already be reported:
  >
  > - #NNN: title
  >
  > Is this the same defect, or is yours distinct? If it is the same, adding your reproduction details and environment as a comment there is usually more useful than a second issue."

  Let the author decide. If they say it is a duplicate, help them write the comment instead of creating the issue. If nothing looks related, proceed without prompting: do not ask the author to confirm a null result.

- **If the command fails with "command not found" or "'gh' is not recognized"**: skip the automated scan. Ask the author whether they know of an existing report.
- **If the command fails for any other reason**: surface the real error and stop.

### Step 2: Preview and confirm

Before rendering the body, apply the "Before you post it" checks in [House style](../../../procedures/house-style.md) and cut anything that fails them. Then render the complete issue body in a markdown code block and ask for confirmation before creating it.

If the Evidence section is `None available`, or the reproduction steps do not lead to a definite failure (for example, the author says it happens "sometimes"), call that out before creating:

> "This report has no evidence attached and the failure is intermittent. It can still be filed, but expect the first thing a fixer asks for to be a recording. Do you want to file it now, or try to capture one first?"

Ask for confirmation either way. An intermittent bug with thin detail is still worth filing rather than losing, so long as everyone can see what is missing.

### Step 3: Create the issue

The title must follow the commit convention from CLAUDE.md: `fix(<scope>): <short description>` using backticks around the scope. Describe the defect, not the fix: the person reading the backlog knows what is broken, not yet how it will be repaired.

The body is markdown containing backticks and other shell-special characters, so pass it via a file rather than inline (an inline `--body "..."` would let the shell interpret backticks as command substitution). Write the confirmed body to a temp file and create the issue with `--body-file`.

Ensure both labels exist, the shape label and the usage-tracking label (both idempotent, `gh label create` exits non-zero if a label already exists, which `|| true` swallows), then create the issue with them:

```sh
gh label create "skill:dx-create-bug" --color ededed --description "Created with the dx-create-bug skill" 2>/dev/null || true
gh label create "bug" --color d73a4a --description "Something already built behaves wrongly" 2>/dev/null || true

gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "bug" --label "skill:dx-create-bug"
```

The label makes usage queryable with `gh issue list --label "skill:dx-create-bug"` (exact, unlike free-text search), and the `*🤖 Generated with dx-create-bug*` footer in the body template gives human-readable attribution.

The shape label is the taxonomy: it answers what kind of work this is, and `gh issue list --label "bug"` matches it exactly, so a `skill:dx-create-bug` label never gets pulled in by the same filter. The skill label answers a different question, which is what wrote the issue, so set both.

If `gh issue create` fails because a label does not exist, the repository probably already carries it under different casing (`Task` and `Feature` predate this vocabulary in some repos). List the labels and reuse the one that matches, rather than creating a near-duplicate:

```sh
gh label list --limit 200 --json name --jq '.[].name' | grep -ix "bug"
```

If label creation is refused outright because the token cannot write labels, create the issue without labels, print the URL, and say which two labels someone with write access should add.

Most repositories already have a `bug` label, because GitHub creates one by default. The `gh label create` above then exits non-zero, `|| true` swallows it, and the existing label is used with whatever description it already carries. That is the intended outcome: reuse beats a second label meaning the same thing.

- **If the command succeeds**: print the issue URL. Then link any dependencies confirmed in Step 1b as GitHub relationships using the GraphQL `addBlockedBy` mutation. Resolve each issue number to its node ID first, then call the mutation:

  ```sh
  # Resolve an issue number to its node ID
  gh issue view <number> --json id --jq .id

  # This issue is BLOCKED BY #NNN
  gh api graphql -f query='mutation($issue:ID!,$blocker:ID!){addBlockedBy(input:{issueId:$issue,blockingIssueId:$blocker}){clientMutationId}}' -f issue=<this-issue-id> -f blocker=<blocker-id>
  ```

  If no dependencies were confirmed, skip this.

  If the author has a screenshot or recording but has not attached it, remind them to upload it now, following Attaching screenshots and recordings. An issue whose Evidence section says "see the recording" with nothing attached claims evidence that is not there, which is worse than an honest `None available`.
- **If the command fails with "command not found" or "'gh' is not recognized"**: render the issue title and body as markdown and instruct the author to create the issue manually via the GitHub web interface.
- **If the command fails for any other reason**: surface the real error and stop.

## Rules

- Never leave a section blank. Every section must be explicitly filled or marked `None`.
- Reproduction steps must be numbered and start from a state a fixer can reach without the author's machine.
- Record error messages verbatim, not paraphrased. The exact string is often what makes a bug searchable.
- Attach evidence to the issue, never commit it to the repository. Recordings go up as GIFs under 10 MB.
- Distinguish `None` (there is nothing to say) from `None available` (there is something, but we do not have it), especially for evidence.
- Describe the defect, never the presumed fix. A report that says "the session cache needs clearing" hides what was actually observed, and it may be wrong about the cause.
- Confirm the behaviour existed before filing a regression against it. Verify in the code and history, not from the report's framing.
- Do not use em-dashes (`—`) in the issue title or body. Use colons, parentheses, or separate sentences instead.
- The PR that fixes this issue will squash-merge using its title as the commit message, so the title must be a valid commit message.
