---
name: dx-create-issue
description: 'Use when someone wants to file a GitHub issue but has not said which kind, and routes it to the right issue creation skill based on issue type, for example "create an issue for this", "raise a ticket", "file this in the backlog", or when a request mixes several kinds of work.'
---

# Trigger Phrases
Use this skill when you hear:
- "create issue"
- "raise ticket"
- "add github issue"

## 1. Ask user to select issue type
Read the request before asking. Check these in order and take the first that fits. Where one settles the issue type, say which type and why in one line, then go to Step 5.
- Describes more than one piece of work -> Step 4b
- Names the type ("create a bug for the mark total") -> that type
- Names a parent issue ("part of #142", "under the login flow story") -> 🔨 Task
- Describes something that already exists but is behaving wrongly, including too slowly -> 🐞 Bug
- Names who benefits and what they get from something that does not exist yet ("so teachers can download their marks", "As a parent, I can see my child's results") -> 📖 Story
- Describes technical or operational work with no parent issue named, where nothing a user outside the team would observe changes ("rotate the signing keys", "bump pnpm to 10") -> 🔨 Task

A request that says only what should happen describes something never built, which is a story or a task, not a bug.

Where nothing above settles it, use AskUserQuestion for the user to select the issue type:

```
**Question: Select the issue type:**
Options:
    - 📖 Story: "What outcome are we trying to deliver?"
    - 🔨 Task: "What work needs to be completed?"
    - 🐞 Bug: "What is not working as expected?"
    - 💭 Help me decide
```
"Story", "Task" or "Bug" goes to Step 5 with that issue type selected. Where your own read of the request disagrees with the pick, go to Step 4a instead and state both. "Help me decide" goes to Step 2.

## 2. Guide issue type selection
Use AskUserQuestion for each [guiding question](#guiding-questions). For each, use options in [guiding question options](#guiding-question-options).

### Guiding questions

Q1: If yes, go to Step 4a with 'Bug' selected.
```
Is it something that already exists but is behaving wrongly?
Examples:
- login button is not showing on mobile browser
- mark total shows 0 for submissions that have marks
```
"X doesn't work" often means X was never built, which is a story or a task.

Q2: If yes, go to Step 4a with 'Story' selected.
```
Does it deliver value to the user directly?
Examples:
- As a teacher, I can view my past announcements to see what I've published before
- As a student, I can filter my test history by date range to find specific past tests
- As a teacher, I can publish an announcement to a single class so that other classes don't see it
```

Q3: If yes, go to Step 4a with 'Task' selected.
```
Is it a piece of technical or operational work to be carried out? This can be related to a parent story, or unrelated at all.
Examples:
- test automation
- server migration
- environment setup
- dependency updates
- security audits
```

### Guiding question options
```
- Yes
- No
- Not sure
```
"No" or "Not sure" moves to the next question. If no question remains, go to Step 3.

## 3. Suggest issue from user description
Prompt user to get issue description. Determine if there is one or more issues from the description, then suggest the issue type(s). For one issue, go to Step 4a. For more than one, go to Step 4b.

```
Describe the issue. Be as specific as you like, I'll ask follow-ups if needed.
```

## 4a. Clarify selected issue type
Use AskUserQuestion to clarify the user's selected issue type.

```
Question: It sounds like this is a <emoji> <issue type> <add reason in one line if Step 3 was used>. Is that right?
Options:
    - Yes -> Go to Step 5
    - No: I would like to give more details -> Go to Step 3
    - No: I would like to select issue type -> Go to Step 1
```

## 4b. Clarify multiple identified issue types
Where more than one issue type was identified, from Step 1 or Step 3, list the suggested issue types.

Question:
```
It sounds like you are thinking of **<number of issues>** issues:
1. **<title of issue 1>**: Based on <reason>, this sounds like a **<emoji> <issue 1 type>**
2. **<title of issue 2>**: Based on <reason>, this sounds like a **<emoji> <issue 2 type>**
...
Is this correct?

Options:
    - Yes -> Go to Step 5
    - No -> Go to the further options
```

Further options:
```
**Question: Which issue type is incorrect?**
- multiSelect: true
- Options:
    - <title of issue 1>: <emoji> <issue 1 type>
    - <title of issue 2>: <emoji> <issue 2 type>
```

For each selected option, use AskUserQuestion tool for the below.
```
Question: <title of issue>: <emoji> <issue type>
Options:
    - I would like to give more details -> Carry the issue title through from Step 3 onwards until Step 4a returns Yes, then repeat for next selected issue title
    - I would like to select issue type -> Carry the issue title through from Step 1 onwards until Step 4a returns Yes, then repeat for next selected issue title
```

## 5. Load skills for execution
Load the selected skill. Run one skill per confirmed issue.
| Issue type | Skill name |
| ---------- | ---------- |
| Story | dx-create-story |
| Task | dx-create-task |
| Bug | dx-create-bug |

## Rules
- Do not file issues or run `gh`
- Pair each issue type with its emoji everywhere the user sees it: 📖 Story, 🔨 Task, 🐞 Bug
- Carry the scope, parent number, links and exclusions across on handoff, so the user does not repeat themselves