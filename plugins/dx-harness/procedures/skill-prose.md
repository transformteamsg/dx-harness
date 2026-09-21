# Skill prose (shared procedure)

This file sets the prose standard for a `SKILL.md`: the text an agent reads and
then acts on, repeatedly. Read it end to end when you write a new skill or
convert an existing one. Unlike the other files in this directory, no skill loads
this one at run time.

Every rule here fixed a defect that measured runs found. The rules are not
stylistic preferences, and the section on how to verify a skill is part of the
standard rather than an appendix to it.

## Scope

This file does not govern:

- **Issue bodies, pull request descriptions, decision records, and code review
  comments.** [House style](house-style.md) governs those. Never graft it onto a
  skill instead of this file: a repository trial found that makes output worse,
  and `house-style.md` records the finding.
- **Product UI copy.** SLP-9 governs it, carried by `dx-design-copy`.
- **Published technical documents.** `docs/`, `CONTEXT.md`, and READMEs follow
  the Google developer documentation style guide, which the Technical documents
  section of `CLAUDE.md` names. Write this file's own prose to that guide too.

Three rules that apply to a `SKILL.md` live elsewhere and are not repeated here:

- State the rule and the condition it applies under, never the argument for it:
  the Technical documents section of `CLAUDE.md`.
- Sentence case for headings and titles: the same section.
- Where a rule appears twice, find out which copy an agent quotes before you cut
  either: the Add a skill section of `CONTRIBUTING.md`.

## The standard in one sentence

Give the agent a test it can apply to the text in front of it, and name where
each answer goes.

## Rules

### Instruct, do not assign an identity

Write the action, not the role.

| Instead of | Write |
| --- | --- |
| You are the front door for issue creation. You own exactly one decision. | Read the request before asking. Check these in order and take the first that fits. |

An identity leaves the agent to infer the behaviour. An instruction states it.

### Write a test on the text, not a judgment call

A rule an agent applies by looking at the request holds across runs. A rule it
applies by judging does not.

| Instead of | Write |
| --- | --- |
| Does someone outside the team end up with something new they can observe? | Names who benefits and what they get from something that does not exist yet |

Measured: rules in the second form produced identical routes across independent
runs of the same prompt. Rules in the first form stayed consistent only where a
worked-example table happened to carry the answer, and diverged on any request
the table did not name.

### Make ordering explicit

Where rules are checked in sequence, say so and say that the first match wins.

> Check these in order and take the first that fits.

Measured: without that sentence, runs invented their own precedence and reached
opposite conclusions on the same request. With it, they quoted it and converged.

### Name the destination of every branch

Each rule ends in where it goes, so a reader can trace any request to a handoff
without interpreting a paragraph.

```
- Names a parent issue ("part of #142") -> 🔨 Task
- Describes more than one piece of work -> Step 4b
```

Name the step number, not "the next step". A renumber then breaks visibly rather
than silently.

### Put examples in the user's own words, inline

Quote the fragment a person would actually type, inside the rule it triggers.

```
- Describes technical or operational work with no parent issue named ("rotate the signing keys", "bump pnpm to 10") -> 🔨 Task
```

Measured: these fragments are what runs cited when a rule fired, and a rule
carrying no example fired inconsistently. A separate table of paraphrased
examples does not substitute, because it sits away from the rule that needs it.

### Fence the literal prompt, and keep routing outside the fence

Inside a fenced block goes only what the user sees. Outside it goes what the
agent does with each answer.

```
**Question: Select the issue type:**
Options:
    - 📖 Story: "What outcome are we trying to deliver?"
    - 🔨 Task: "What work needs to be completed?"
```

Then, as prose below the fence: `"Story" or "Task" goes to Step 5 with that issue
type selected.`

Found as a live defect: routing arrows written inside the option labels would
have rendered in the picker a person reads.

### Put a guard in the same step as the rule it guards

A sentence that narrows a rule belongs directly under it. This extends the Add a
skill rule in `CONTRIBUTING.md` that a rule belongs at the step that invokes it,
and adds the measured case.

A guard reading "a request that says only what should happen describes something
never built, which is a story or a task, not a bug" sat one step below the
decision it needed to narrow. It could not bind that decision, and a story
resolved to a bug with no question asked. Moved up beside the rule, it held.

A guard is scoped by where it sits, not by what it says.

### Keep prose to one sentence between rules

Every line that is not a rule does one job in one sentence. A multi-sentence
paragraph of rationale between rules reads as cuttable, and an agent treats it
that way.

### Cut commentary about the skill itself

Remove lines that describe the design rather than instruct: "that division is
the point", "this binds an agent harder than it binds you", "question 3 is the
one people skip".

### Let the Rules section hold only what no step covers

Before you add a rule, check whether a step already states it. A Rules section
that restates its steps trains a reader to skim both.

## Structure

```
---
name: <matches the folder name, dx- prefixed>
description: '<when to use it, the phrases a person says, and what it does>'
---

# Trigger phrases
Use this skill when you hear:
- "<bare phrase>"

## <n>. <step name>
<one imperative line: what this step does>

- <test on the request> -> <destination>
- <test on the request> -> <destination>

<guard sentence, where one is needed>

<instruction naming the tool to use>

```
<the literal text the user sees>
Options:
    - <option label>
```
<routing prose: which answer goes where>

## Rules
- <only what no step covers>
```

### Step numbering

Whole numbers for a sequence. Letter suffixes for branches off one point, as in
`4a` and `4b`. Where a branch condition can be reached from more than one step,
name each one: "from Step 1 or Step 3", not "from Step 3".

### Placeholders

Lowercase, in angle brackets, describing the content: `<issue type>`,
`<title of issue 1>`, `<number of issues>`. Bold them in text the user sees where
they carry the answer.

## How to verify a skill

Run the skill in isolated sessions, one per test prompt. Give each run the skill
file and a request, and tell it to read only that file. Ask each for four things:

1. The target it handed off to, or that it could not reach one.
2. How many questions it would put to the user.
3. Which rule fired, quoted.
4. Any rule where a reasonable reading could go either way, with both targets.

The fourth answer is what finds the defects. A rule that two runs read
differently routes the same request to two places, and it does so without asking
anyone, so nothing surfaces the disagreement at run time.

Choose prompts that appear nowhere in the file. A prompt that the file already
carries as a worked example measures lookup, not classification.

Two method rules:

- **Re-run every prompt after every change, not only the cases the change
  targets.** A reorder that touched neither of two rules still surfaced a live
  disagreement between them.
- **Re-run a prompt twice where an earlier round showed it splitting.** One clean
  run is not evidence of determinism.

Each rule you add buys reliable resolution for its own class of request and risks
claiming an adjacent one. Three rounds of defects in the first file converted to
this standard were all that same failure, so test each new rule against the case
it targets and the case it might capture by mistake.

## Path resolution

This procedure ships with the harness plugin. From a skill directory,
`skills/engineering/<dir>/SKILL.md` or `skills/design/<dir>/SKILL.md`, it sits
three levels up at `../../../procedures/skill-prose.md`.
