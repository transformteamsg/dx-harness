---
name: dx-create-epic
description: 'Use when you need to create a GitHub issue for an epic: one outcome too large for a single story, delivered by several stories and chores that link to it as native sub-issues. Triggers on "create an epic", "file an epic for this", "group these issues under an epic", and "make #12, #14 and #15 sub-issues of a new epic". Files the epic with its outcome, then links the open stories and chores the person names. Not for filing the child stories and chores: that is dx-create-story and dx-create-chore.'
---

# Trigger phrases
Use this skill when you hear:
- "create an epic"
- "file an epic"
- "group these issues under an epic"

The issue template is in [references/issue-template.md](references/issue-template.md). Fill every section, and write `None` where there is nothing to say. Write every section to [House style](../../../procedures/house-style.md).

## 1. Gather the epic
Ask for each item the request does not already give. Do not invent an answer.

1. **Outcome**: what is true for the people the product serves once every sub-issue closes ("teachers can export marks as CSV and as PDF").
2. **Why**: the reason to track this outcome as one piece of work.
3. **Sub-issues**: the open stories and chores in this repository that belong under the epic, by number, or "none yet".
4. **Out of scope**: anything adjacent that a reader could assume is included, or `None`.

Check the request in order and take the first that fits:

- Describes one capability that a single pull request delivers -> stop, and point the person at `dx-create-story` or `dx-create-chore`
- Asks for the child stories or chores to be written as well -> continue here for the epic only, and Step 5 hands the children over
- Anything else -> Step 2

Do not ask who the audience is, what the promise is, or what the deadline is.

## 2. Preview and confirm
Apply the "Before you post it" checks in [House style](../../../procedures/house-style.md). Then show the title, the body, and the sub-issue plan, and ask for confirmation:

```
**Title:** <title>

<the complete issue body in a markdown code block>

**Sub-issues to link:** #<number>, ...
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
- `gh` reports "command not found" or "'gh' is not recognized" -> show the title and the body as markdown. Tell the person to create the issue on GitHub, and to add each issue from Step 1 as a sub-issue on the epic's page. Then Step 5
- Any other failure -> surface the error and stop

## 4. Link the sub-issues
Read the epic's node ID:

```sh
gh issue view <epic number> --json id --jq .id
```

Link each issue from Step 1, one at a time:

```sh
gh api graphql -f query='mutation($parent:ID!,$sub:ID!){addSubIssue(input:{issueId:$parent,subIssueId:$sub}){subIssue{number}}}' -f parent=<epic id> -f sub=<issue id>
```

- The response returns the sub-issue number -> linked
- The command fails -> surface the error and stop

## 5. Report
Report the epic URL and each linked issue.

Where the person named child stories or chores that are not filed yet, list them in their own words, and hand them over:

```
#<epic number> is the epic. File each piece with dx-create-story or dx-create-chore, then add it as a sub-issue on the epic's page:
- <piece, in the person's words>
```

Do not file those children from this skill.

## Rules
- Do not use em dashes (`—`) in the title or the body. Use a colon, parentheses, or a new sentence instead.
