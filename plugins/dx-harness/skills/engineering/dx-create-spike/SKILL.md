---
name: dx-create-spike
description: 'Use when you need to create a GitHub issue for a spike: a time-boxed investigation that answers one question before a team commits to work, for whoever runs it: an engineer, a designer, or a coding agent. Triggers on "file a spike", "create a spike to find out whether", "raise an investigation ticket", "we need to compare X and Y before we decide", and "research spike". Files the issue with the question, the decision it unblocks, a time box, and how the answer is recorded. Not for building, fixing, or maintaining something already decided: that is dx-create-story, dx-create-task, dx-create-bug, or dx-create-chore.'
---

Create a GitHub issue for a spike: a time-boxed investigation that answers one question before a team commits to work. An engineer, a designer, or a coding agent runs it, so the issue must be complete enough to start without follow-up questions.

## Issue template

The structure is in [references/issue-template.md](references/issue-template.md). Read it when you build or preview the body. Fill every section, and write `None` where there is nothing to say. Write each section to [House style](../../../procedures/house-style.md).

## Workflow

### Step 1: Get the question

Read the request for the question the spike answers. Check these in order and take the first that fits.

- States something that an answer of one or two sentences settles ("which PDF library handles Chinese fonts", "can the queue hold a day of submissions", "is Postgres full-text search fast enough for 2 million rows") -> Step 2
- Names the change to make, with no open question ("add caching to the export", "move the marks API to Postgres") -> not a spike. Say so, and point the person at `dx-create-story`, `dx-create-task`, or `dx-create-chore`. File nothing
- Names a topic or an activity, with no question ("look into caching", "research PDF libraries", "a spike on auth") -> ask for the question, below

A request to find the cause of something that behaves wrongly is a bug, not a spike. Point the person at `dx-create-bug`.

```
What is the one question this spike answers? For example: "Which PDF library renders the marks export with Chinese fonts?"
```

File nothing until the person gives a question. An answer that still names only a topic gets the same question again. An answer with more than one question gets one spike per question: list them, and run Step 2 onward once for each one the person confirms.

### Step 2: Gather the rest

Draft each item below from what the request gives, and ask in one message for the items it gives nothing on. Do not invent an answer the request does not support. The person corrects a drafted item at the preview in Step 3.

1. **Why now**: the decision or the work that waits on the answer. Where the person names an issue that waits on it, link that issue here.
2. **Time box**: the most time to spend before reporting what was found, such as "two days".
3. **Done when**: where the answer is recorded and what it includes. Each item is something a reviewer confirms by looking: "a comment on this issue compares the three libraries on font support and bundle size, and recommends one", not "research done".
4. **Out of scope**: what the spike does not do. Where the request names nothing, draft "Building the chosen option" rather than asking.

### Step 3: Preview and confirm

The title takes the form `<verb> <thing> <context>`, with no commit prefix, for example `Compare PDF libraries for the marks export` or `Measure queue throughput for daily submissions`. Count its characters, spaces included, with `printf '%s' "<title>" | wc -m`, not by eye. Count again after each change to the title:

- **70 characters or fewer**: keep the title unchanged.
- **Over 70 characters, and you drafted it**: shorten it to 70 or fewer before the preview, and keep the question it names.
- **Over 70 characters, and the person supplied it**: propose a shorter title, say that theirs is over the 70-character limit, and file the title the person confirms.

Apply the "Before you post it" checks in [House style](../../../procedures/house-style.md) and cut anything that fails them. Render the title and the complete body in a markdown code block, and ask for confirmation before you create the issue.

### Step 4: Create the issue

Write the confirmed body to a temporary file and pass it with `--body-file`, because the body holds backticks that an inline `--body` gives to the shell.

Make sure both labels exist, then create the issue with them. `gh label create` exits non-zero when the label already exists, and `|| true` ignores that.

```sh
gh label create "skill:dx-create-spike" --color ededed --description "Created with the dx-create-spike skill" 2>/dev/null || true
gh label create "spike" --color c5def5 --description "A time-boxed investigation that answers one question" 2>/dev/null || true

gh issue create --title "<title>" --body-file /tmp/issue-body.md --label "spike" --label "skill:dx-create-spike"
```

- **The command fails because a label does not exist**: the repository can carry the label in different casing. Find it with `gh label list --limit 200 --json name --jq '.[].name' | grep -ix "spike"`, and create the issue with that name.
- **The token cannot write labels**: create the issue without labels, print the URL, and name the two labels that someone with write access adds.
- **The command succeeds**: print the issue URL.
- **The command fails with "command not found" or "'gh' is not recognized"**: render the title and the body as markdown, and tell the person to create the issue in the GitHub web interface.
- **The command fails for any other reason**: surface the real error and stop.

## Rules

- Do not use em dashes (`—`) in the title or the body. Use colons, parentheses, or separate sentences.
