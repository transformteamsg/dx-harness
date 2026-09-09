---
name: dx-trim-doc
description: 'Use when a document is too long and someone wants it shorter without changing what it does: a `SKILL.md`, a shared procedure, a reference file, a step file a skill loads from its own directory, a decision record, a README, or `CONTEXT.md`. Triggers on "this skill is too long", "trim this doc", "compress this SKILL.md", "reduce the token cost of this skill", "tighten this reference", or a review comment that a file is verbose. Builds a behaviour baseline before cutting and re-runs it after, so a trim that changes what an agent does gets caught and reverted rather than shipped.'
---

You are trimming a document without changing what it does.

A sentence that looks like decorative explanation can still be the reason a rule works. `CONTRIBUTING.md` records what happens when one goes missing: `dx-code-review` lost one clause, "because they are the cases worth raising precisely when they cannot be settled by reading", and the rule above it went from a conditional default to a blanket one, so a bug the review could prove got reported as a maybe. Before you cut anything, read two rules in the Add a skill section of `CONTRIBUTING.md`: "When you trim a skill", and "Remember that an agent reads differently from you". That section is the authority; this skill is the procedure that enforces it.

This skill protects behaviour, not resolvability. A passage can read correctly at `HEAD`, cost nothing extra in length, and still leak this session's own vantage: a dead plan citation, first-person narration of what you decided, an undated hedge. `dx-trim-leakage` catches that separately; it is not this skill's job to hunt it during a length trim.

## Two modes

The mode decides which path you follow after Step 1, and how that path verifies the trim.

| Mode | The document | Verification |
|---|---|---|
| Executable | An agent reads it and acts: a `SKILL.md`, a file under `procedures/`, a `references/` file that carries rules, or another file a `SKILL.md` loads from its own directory | Behaviour fixtures, run before and after |
| Reference | A person reads it: a decision record, a research record, a README, `CONTEXT.md` | The edge test and the lint. No fixtures |

An executable document trimmed without fixtures is an unverified trim. That is a valid outcome when no baseline is possible, but it must be labelled, never reported as verified.

## Sentence classes

| Class | What it is | Cut? |
|---|---|---|
| Instruction | Tells the reader to do something | Never |
| Condition | Adds a case, an exception, or a limit that changes what the reader does | Never |
| Gate rationale | Says why a judgment call resolves one way | Only when the rule is mechanical. See Step 4 |
| Framing | Says why the work matters, who reads the output, or why the document is arranged as it is | Cut |
| Restatement | Stated in full elsewhere in the same file | Cut, and keep one |

Check whether a clause that reads as a gloss adds a case. "Other personas who read or act on the same data, and what they see once this changes" reads as one item with a trailing gloss. The trailing clause is a second thing to look for. Cutting it narrows the step.

Classify by what a sentence protects, not by where it sits. A condition placed in the opening paragraph is still a condition; position argues nothing about class.

## Workflow

### Step 1: Establish the mode and name the gates

Read in two passes, and settle one thing in each.

1. **The mode**, from a structural pass: the frontmatter, the headings, and who the document addresses. The table above decides it. Structure alone cannot settle a `references/` file that may or may not carry rules, so read its body before you call it Reference. Default to Executable while the mode is open, because the two errors do not cost the same: a wrong Executable call builds fixtures you did not need, and a wrong Reference call ships an unverified trim as a finished one.
2. **The gates**, at the depth the mode sets. In Executable mode, read the whole document and name every judgment call it tells a reader to make against an ambiguous or wrong input, because Step 2 builds one fixture per gate. In Reference mode there are no fixtures to feed, so confirm the count rather than listing them. Record the word count either way, and leave the sentence-by-sentence read to Step 3.

State both back before continuing:

> "This is a [mode] document. I count N gates: [list]. Word count now: N. I am following the [path] path."

A document with no gates is either pure reference or a document whose rules are all mechanical. Say which, because it changes what Step 4 may cut.

### Step 2 onwards: follow one path

The mode picks the path. Read that file and do not read the other: each runs to the end without returning here.

- **Executable** → [executable-path.md](executable-path.md), Steps 2 to 6. Builds the baseline, then verifies the trim against it.
- **Reference** → [reference-path.md](reference-path.md), Steps 3 to 6. No baseline, so every trim on it is unverified.

## Rules

- Trim the document you were asked to trim. Do not retrofit a file you are only passing through.
- A structured test fixture, such as `evals/*.json`, is not this skill's target. Its assertions verify behaviour; they are not prose to compress.
