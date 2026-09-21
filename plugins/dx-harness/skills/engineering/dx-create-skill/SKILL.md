---
name: dx-create-skill
description: 'Use when someone wants a new skill written, or an existing `SKILL.md` rewritten to the harness standard, for example "write a skill for X", "turn this workflow into a skill", "convert this SKILL.md", or "this skill reads badly". Interviews for the flow, places the file, writes it to the skill prose standard, then verifies it by running it in isolated sessions and fixing every rule that two runs read differently. Not for making a skill shorter without changing what it does: that is `dx-trim-doc`.'
---

# Trigger phrases
Use this skill when you hear:
- "write a skill"
- "create a skill"
- "turn this into a skill"
- "convert this SKILL.md"
- "I want Claude doing this the same way every time"

## 1. Read the standard and settle the mode
Read `../../../procedures/skill-prose.md` end to end first. It holds the rules, the structure, and the verification method that Step 6 runs.

Read the request before asking. Where it names a skill or a folder but gives no path to a `SKILL.md`, look for `skills/engineering/dx-<name>/SKILL.md` and `skills/design/dx-<name>/SKILL.md` before you route. The bullets below turn on whether that file is there.

Check these in order and take the first that fits. Where one settles the mode, say which mode and why in one line.

- The file exists, and the request asks in so many words for it converted to the standard ("convert `dx-create-pr`", "run the standard over this skill", "rewrite this one the way `dx-create-issue` reads") -> Step 3
- The file exists, and the request names only its length or its cost ("it is 500 lines", "it costs too much per run", "get it down to half") -> `dx-trim-doc`
- The file exists, and the request names only how it reads or how it is ordered ("this skill reads badly", "I cannot tell what order it happens in", "the rules are scattered all over it") -> Step 3
- The file exists, and the request names both ("541 lines of rambling prose, clean it up") -> the mode question below, and say that cutting its length and rewriting it are different jobs
- The folder exists and holds no `SKILL.md` ("I made the folder and never filled it in") -> Step 2
- The request names no skill and no folder, and describes work someone repeats and wants run the same way each time ("make a skill that writes release notes", "turn this workflow into a skill", "I want Claude running our handover") -> Step 2

Where nothing above settles it, use AskUserQuestion for the user to select the mode:

```
**Question: Select what you want:**
Options:
    - Shorter: "Cut its length and keep what it does"
    - Convert: "Rewrite it to the standard and keep what it does"
    - New skill: "Write a SKILL.md from scratch"
```
"Shorter" goes to `dx-trim-doc`. "Convert" goes to Step 3. "New skill" goes to Step 2.

## 2. Interview for a new skill
Ask before you draft. Where this conversation already answers a question, say the answer back for the user to confirm rather than asking it again.

```
1. What does the skill do, from the first thing it reads to the thing it hands back?
2. What does someone say when they want it? Give me the phrases in your own words.
3. What does it produce: a file, an issue, a report, or a set of edits?
4. Where does it stop, and which skill takes over there?
```

Turn the answer to question 1 into a numbered sequence, one action per step, before you write any prose. Go to Step 4.

## 3. Baseline the skill you are converting
Record what the skill does now, before you change a line. Run the verification method in the "How to verify a skill" section of `skill-prose.md` against the current file, and keep the four answers per prompt. Step 6 compares against them.

Then list, rule by rule from the Rules section of `skill-prose.md`, which lines break it and what replaces them.

A conversion holds behaviour and changes prose. Name any destination you intend to move before Step 5, and let the user decide. Go to Step 4.

## 4. Place the file and write the frontmatter
Put the file one level deep inside a category folder, at `skills/engineering/dx-<name>/SKILL.md` or `skills/design/dx-<name>/SKILL.md`. Never place a skill directly under `skills/`.

- The folder already exists -> keep the category it sits in
- Works on a product interface, a page, or a design pass -> `design`
- Anything else -> `engineering`

`name:` matches the folder name, `dx-` prefix and all. A skill is invoked by name, so check that the name is unused in both category folders.

Single-quote the `description:`. Unquoted, YAML reads a colon followed by a space as a nested mapping and fails to parse, and reads a space followed by `#` as a comment, which truncates the description silently. Double an apostrophe inside single quotes.

The description decides whether the skill fires. Write the phrases from question 2, what the skill does, and the neighbouring skill it is not.

## 5. Write the steps
Write the body to the Structure section of `skill-prose.md`.

`SKILL.md` carries the flow. A reader gets the whole sequence from it alone: what runs, in what order, and what each step hands the next.

- A step needs a template, a checklist, a schema, a rubric, or an output format to do its work -> `references/<name>.md`
- A branch settled early runs to the end without returning -> one file per branch
- A reader would leave the file mid-sequence and come back -> keep it in `SKILL.md`

A reference file passes only where a reader opens it at one step, finishes that step, and returns with a result.

Keep the body tool-neutral: no assumptions about one agent, and no absolute install paths. Reference a sibling file relatively.

Write the Rules section last, and put in it only what no step covers. Go to Step 6.

## 6. Run the skill and compare
Run the verification method in `skill-prose.md`. Use the Step 3 prompts where you converted a skill, and three prompts that appear nowhere in the file where you wrote one.

- Two runs read the same rule differently -> Step 7
- A converted skill reaches a destination its baseline did not -> Step 7, and say which rule moved
- Every run agrees, and a converted skill matches its baseline -> Step 8

## 7. Fix a rule two runs read differently
Change one rule, then re-run every prompt, not only the case the change targets. Re-run twice any prompt that split in an earlier round.

Where a fix puts a test prompt's own wording into the file as an example, that prompt now measures lookup. Replace it with a fresh one before the next round.

Report each round: the rule you changed, and what the runs did after it. Return to Step 6.

## 8. Record the change
Give the change one line under `## Unreleased` in the plugin's `CHANGELOG.md`, in the voice of the lines above it, and cite the issue or the pull request.

Leave the `version` field in the plugin manifest alone. A new skill folder needs no manifest change, because the `skills` array scans both category folders.

## Rules
- Do not commit, and do not open a pull request -> `dx-create-pr`
- Where this skill and `skill-prose.md` disagree, `skill-prose.md` wins
- Report a skill you could not verify as unverified, never as done
