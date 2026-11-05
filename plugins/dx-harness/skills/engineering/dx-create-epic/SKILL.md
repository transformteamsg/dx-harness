---
name: dx-create-epic
description: 'Use when you need to create a GitHub issue for an epic: one outcome too large for a single story, delivered by several stories and chores. Triggers on "create an epic" and "file an epic for this". Files the epic with its outcome. Not for filing the child stories and chores: that is dx-create-story and dx-create-chore.'
---

# Trigger phrases
Use this skill when you hear:
- "create an epic"
- "file an epic"

The issue template is in [references/issue-template.md](references/issue-template.md). Fill every section, and write `None` where there is nothing to say. Write every section to [House style](../../../procedures/house-style.md).

## 1. Gather the epic
Ask for each item the request does not already give. Do not invent an answer.

1. **Outcome**: what is true for the people the product serves once every sub-issue closes ("teachers can export marks as CSV and as PDF").
2. **Why**: the reason to track this outcome as one piece of work.
3. **Out of scope**: anything adjacent that a reader could assume is included, or `None`.

Check the request in order and take the first that fits:

- Describes one capability that a single pull request delivers -> stop, and point the person at `dx-create-story` or `dx-create-chore`
- Asks for the child stories or chores to be written as well -> continue here for the epic only, and Step 4 hands the children over
- Anything else -> Step 2

Do not ask who the audience is, what the promise is, or what the deadline is.

## 2. Preview and confirm
Apply the "Before you post it" checks in [House style](../../../procedures/house-style.md). Then show the title, the body, and the sub-issue plan, and ask for confirmation:

```
**Title:** <title>

<the complete issue body in a markdown code block>

```

Write the title as an imperative verb followed by the outcome, with no commit prefix, for example `Let teachers export marks as CSV and PDF`.

A change to the title or the body goes back to the top of Step 2. A confirmation goes to Step 3.

## 3. Create the epic
Write the confirmed body to a temporary file, and pass it with `--body-file`. Make sure both labels exist, then create the issue:

```sh
gh label create "epic" --color 5319e7 --description "Tracking issue with linked sub-issues" 2>/dev/null || true
gh label create "skill:dx-create-epic" --color ededed --description "Created with the dx-create-epic skill" 2>/dev/null || true

gh issue create --title "<title>" --body-file <body file> --label "epic" --label "skill:dx-create-epic"
```

- The command prints the issue URL -> Step 4
- It fails because a label does not exist -> find the label under other casing with `gh label list --limit 200 --json name --jq '.[].name' | grep -ix "epic"`, reuse that name, and run `gh issue create` again
- The token cannot write labels -> create the issue without labels, and name the two labels for someone with write access to add. Then Step 4
- `gh` reports "command not found" or "'gh' is not recognized" -> show the title and the body as markdown. Tell the person to create the issue on GitHub. Then Step 4
- Any other failure -> surface the error and stop

## 4. Report
Report the epic URL.

Where the person named child stories or chores that are not filed yet, list them in their own words, and hand them over:

```
#<epic number> is the epic. File each piece with dx-create-story or dx-create-chore, then add it as a sub-issue on the epic's page:
- <piece, in the person's words>
```

Do not file those children from this skill.

## Rules
- Do not use em dashes (`—`) in the title or the body. Use a colon, parentheses, or a new sentence instead.
