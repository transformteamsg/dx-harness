---
name: dx-create-pr
description: Use when you need to open a pull request or a GitLab merge request for the current branch, bring an already-open one's description back in line with the commits pushed since it opened, mark a draft ready for review, or install the repository's pull request template file.
---

You are helping open a pull request for the current branch and keep it describing that branch for as long as it stays open. Work in the developer's platform: a GitLab repository gets a merge request, and you call it one.

This skill is the single owner of pull request creation in this plugin. Other skills call it rather than carrying their own version, so every pull request reads the same way whichever skill or agent asked for it. When a calling skill needs something the standard sections do not carry, it adds a named section of its own; it does not fork the template.

A body written once goes stale on the next push. Opening a request is therefore only half of what this skill does: the other half is updating one that already exists, so the description still matches the branch by the time a reviewer arrives. Check for an open request before you consider opening one. Two requests for one branch is a worse outcome than a stale description.

A repository may already have decided how a pull request reads there. When it has its own template, that template wins on structure and this skill supplies the discipline: the sections come from the repository, and the standard governs how well they are filled in. This skill never writes a template file into a repository, because installing one changes how everyone working there opens a pull request, and that decision belongs to the people who work there.

## Pull request template

The canonical structure is in [references/pr-template.md](references/pr-template.md). Read that file before you write or preview a body. Fill every section: if a section has nothing in it, say why in one line rather than deleting the heading. Never leave the template's comment placeholders in the body you submit, on any path through this skill. A placeholder that reaches a reviewer reads as an unfinished request.

The `Closes #NNN` line is conditional: it belongs only in a request that an issue tracks.

## Shared mechanics

Platform detection, the GitHub and GitLab command map, the usage label, passing a body through a file, and the three failure cases all live in [../../../procedures/pr-mechanics.md](../../../procedures/pr-mechanics.md). Read that file before running any command below, and follow its failure handling at every step rather than inventing a local variation.

What is specific to this skill: the usage label is `skill:dx-create-pr`, described as "Opened with the dx-create-pr skill", and the footer is `*🤖 Generated with dx-create-pr*`.

## Workflow

### Step 1: Name the platform, then look for an open request

Establish the platform from the remote, per the shared mechanics. Then get the current branch and look for a request already open on it:

```sh
git branch --show-current
```

Search for an open request whose source branch is that branch, using the command for the platform. Then take one of two paths, and say which one you are taking before you do anything else:

- **A request is already open**: you are updating it. Tell the developer its number, its title, and its URL, so they know you found the one they meant rather than opening a second. Go to Step 3.
- **No request is open**: you are opening one. Go to Step 2.

Never open a request without running this check first. A branch pushed twice in one session is the ordinary case, not the rare one.

### Step 2: Adopt the repository's own template if it has one

Look for the template the repository already keeps. The shared mechanics carry the path for each platform: `.github/pull_request_template.md` on GitHub, and `.gitlab/merge_request_templates/Default.md` on GitLab.

- **The repository has a template**: follow it. Its sections and their order win, because a reviewer there expects that shape. Fill every section it defines, and apply the standard to whatever it asks for: name each acceptance criterion in whichever section covers testing, describe what changed rather than restating the title, and replace every comment placeholder. If it omits something the standard needs, such as a test plan or a manual verification step, add that section rather than dropping the requirement. Say in one line that you followed the repository's template.
- **The repository has no template**: use the canonical template as the body and continue.

Never write a template file into the repository, on either path. Do not offer to, and do not treat a missing template as a gap to fix while opening a request. If the developer would be better off with one, say so once and leave the decision with them.

### Step 3: Find the issue the branch tracks

The issue supplies the title and the acceptance criteria the test plan answers to, so establish it before writing anything. Look in this order, and stop at the first that gives an answer:

1. The number the developer gave you, if they gave one.
2. A number in the branch name, which on GitLab is the leading number in a `123-slug` branch.
3. A `Closes #NNN` or `Part of #NNN` line in the commits on the branch.
4. Ask the developer, naming what you already looked at.

Once you have a number, read the issue so the title is exact and the criteria are the real ones:

```sh
gh issue view <number> --json number,title,body,state
```

- **If the issue exists**: use its title verbatim as the request title, and take the acceptance criteria for the test plan from its body.
- **If no issue tracks this branch**: say so and continue. Open the request without a `Closes` line, and describe it from the commits instead. An untracked branch still gets a usable description, so this is not a reason to stop or to leave sections empty.
- **If the command fails**: follow the failure handling in the shared mechanics. Without `gh` you cannot read the issue, so ask the developer to paste its title and acceptance criteria, and say that you could not verify them.

### Step 4: Write the body

Read the commits and the diff on the branch, not just the issue. The issue says what was asked for; the branch says what was done, and the body describes the branch.

```sh
git log <base>..HEAD --oneline
git diff <base>...HEAD --stat
```

Fill the sections from the canonical template:

- **Summary**: what this branch changes, for a reviewer who has not read the issue.
- **Changes**: each file or area, and why it changed. Group related files rather than listing every path.
- **Test plan**: one line per acceptance criterion from the issue, naming the criterion and the automated test that covers it. Name a criterion you did not cover rather than omitting it. For an untracked branch, say what you verified and how.
- **Manual verification**: what a reviewer runs by hand, and what they should see. Take the command from the repository's own scripts and check that it exists before naming it. Do not carry over a command from another repository or from this skill.

If a calling skill supplied extra content, add it as its own named section below Manual verification. Leave the shared sections as they are.

Then cut it down, following [House style](../../../procedures/house-style.md). A body orients a reviewer; it is not a record of the work. The diff already shows what changed, the issue holds the reasoning, and the commit message holds the history, so a body that repeats any of them costs a reviewer time and buries the part only you could tell them. Write to these limits:

- Summary: at most three bullets, one line each.
- Changes: one line per file or area, with related files grouped under one line rather than listed path by path.
- Test plan: one line per criterion, with no preamble.
- Manual verification: a few lines on what is still to do.

Cut anything that meets one of these tests: it restates another section, it restates the issue, it argues a decision rather than naming it, or it reports work you have already finished. A check you ran and passed is not a reviewer's task, so it does not belong here. Name a deviation from the issue in one line and let the issue carry the rest.

If the body runs past roughly one screen, it is too long. Cut it rather than reaching for subheadings, which make a long body look organised without making it shorter.

Render the finished body in a markdown code block and ask for confirmation before you submit it.

### Step 5: Open the draft, or update the one that is open

Follow the shared mechanics for the label, the body file, and the failure cases.

**Opening a new request.** Open it as a draft. A draft says the branch is not asking for review yet, and leaving draft state is Step 6's deliberate act.

```sh
gh label create "skill:dx-create-pr" --color ededed --description "Opened with the dx-create-pr skill" 2>/dev/null || true

gh pr create --draft --title "<issue title verbatim>" --body-file <path> --label "skill:dx-create-pr"
```

The title must match the issue title exactly, because it becomes the squash-merge commit message on the default branch.

**Updating a request that is already open.** Rewrite the sections the new commits changed, which is normally Summary, Changes, and Test plan. Leave a section that is still accurate exactly as it is: an unnecessary rewrite costs a reviewer a re-read and buries the part that did change. Preserve any named section a calling skill added, and preserve edits a human made to the body, unless the developer asks you to replace them.

```sh
gh pr edit <number> --body-file <path>
```

Report which request you updated, by number and URL, and say what changed in the body. Do not change the title of an open request unless the issue title itself changed, and say so when you do.

### Step 6: Mark it ready for review only when asked

Leaving draft state is the developer's call, never a step you take because the checks went green. When they ask:

```sh
gh pr ready <number>
```

Then restate the manual verification the body asks for, as something still to do rather than something done:

> "#NNN is out of draft. Its body asks a reviewer to run `<command>` and walk through `<scenario>`. Automated tests cover correctness; that walk-through covers integration and visual behaviour. Has anyone done it?"

Never report the manual verification as complete on the strength of a passing test suite. The body asks for it because the tests do not cover it.

## Calling this skill from another skill

A skill that needs a pull request calls this one and supplies three things: the issue number if an issue tracks the branch, its own usage label if it wants its own attribution as well, and any extra content as a named section with a heading. It does not supply a body template.

That is the whole extension point. A calling skill that finds the shared sections do not fit its work should say so as a change to [references/pr-template.md](references/pr-template.md), because a second template is how the versions drift apart again.

## Rules

- Check for an open request on the branch before opening one. Update the existing request instead, and say which one you updated.
- Every request opens as a draft. Only Step 6 takes one out of draft, and only when the developer asks.
- The title of a tracked request matches the issue title verbatim, because it becomes the squash-merge commit message.
- Never leave a comment placeholder from the template in a submitted body.
- Keep the body to roughly one screen. It orients a reviewer, so do not restate the issue or the diff, and do not report checks you already ran.
- Report in the platform's own vocabulary. A GitLab repository has merge requests, not pull requests.
- Never write a template file into a repository. Follow the one it has, or use the canonical template when it has none.
- Name a verification command only after confirming the repository defines it.
- A calling skill adds a named section. It never carries its own template.
- Do not use em-dashes (`—`) in a title or body. Use colons, parentheses, or separate sentences instead.
