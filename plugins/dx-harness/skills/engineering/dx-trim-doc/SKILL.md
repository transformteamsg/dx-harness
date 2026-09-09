---
name: dx-trim-doc
description: 'Use when a document is too long and someone wants it shorter without changing what it does: a `SKILL.md`, a shared procedure, a reference file, a step file a skill loads from its own directory, a decision record, a README, or `CONTEXT.md`. Triggers on "this skill is too long", "trim this doc", "compress this SKILL.md", "reduce the token cost of this skill", "tighten this reference", or a review comment that a file is verbose. Builds a behaviour baseline before cutting and re-runs it after, so a trim that changes what an agent does gets caught and reverted rather than shipped.'
---

You are trimming a document without changing what it does.

A sentence that looks like decorative explanation can still be the reason a rule works. `CONTRIBUTING.md` records what happens when one goes missing: `dx-code-review` lost one clause, "because they are the cases worth raising precisely when they cannot be settled by reading", and the rule above it went from a conditional default to a blanket one, so a bug the review could prove got reported as a maybe. Before you cut anything, read two rules in the Add a skill section of `CONTRIBUTING.md`: "When you trim a skill", and "Remember that an agent reads differently from you". That section is the authority; this skill is the procedure that enforces it.

This skill protects behaviour, not resolvability. A passage can read correctly at `HEAD`, cost nothing extra in length, and still leak this session's own vantage: a dead plan citation, first-person narration of what you decided, an undated hedge. `dx-trim-leakage` catches that separately; it is not this skill's job to hunt it during a length trim.

## Two modes

The mode decides how Step 5 verifies the trim. Settle it in Step 1.

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

> "This is a [mode] document. I count N gates: [list]. I will build a fixture per gate before I cut anything. Word count now: N."

A document with no gates is either pure reference or a document whose rules are all mechanical. Say which, because it changes what Step 4 may cut.

### Step 2: Capture the behaviour baseline

Executable mode only. Reference mode skips to Step 3.

Read [references/behaviour-baseline.md](references/behaviour-baseline.md) and follow it. It covers how to build a fixture per gate, how to run the document as it stands, and what to record. It also names two measurement traps that make a broken run look clean.

The baseline is the untrimmed document's gate outcomes. Without it there is nothing to compare against, so do not start cutting first and build fixtures later.

If a baseline is not possible, say why, offer to continue on the edge test alone, and label the result an unverified trim. Do not proceed silently.

### Step 3: Classify every sentence

Walk the document and assign every sentence one class from the table above. Report the split before you cut:

> "N sentences: N instruction, N condition, N gate rationale, N framing, N restatement. Framing and restatement come to N words, which is N% of the file."

That percentage is the safe headroom. Cutting past it takes words from gate rationale.

### Step 4: Trim

Cut framing and restatement freely. They carry no behaviour.

For every other candidate, apply the edge test from `CONTRIBUTING.md`. Remove the clause, then construct an input where the rule is ambiguous, and ask whether your answer changes. If it changes, the clause was a condition. Put it back.

Keep gate rationale where the gate resolves ambiguity, because that is the case nobody wrote down. Cut it where the rule is mechanical and a reader cannot get it wrong.

- **Keep**: why a persona gate sends work to another skill, why one cut of a split beats the other, why a finding counts as confirmed.
- **Cut**: why `--body-file` beats an inline `--body`, why `gh label create` is idempotent, why a recording goes up as a GIF.

Do not set a word budget. Compress by class, then measure what you got.

Do not count an extraction as a trim. Moving a step's detail into `references/` defers a cost rather than removing one, and `CONTRIBUTING.md` sets the rules for when it is worth doing. Offer it separately.

### Step 5: Verify

**Executable mode.** Re-run the Step 2 fixtures against the trimmed document, same fixtures, same run count. Compare gate outcomes to the baseline.

| Given | When | Then |
|---|---|---|
| The comparison | Every gate holds | Report the trim as verified, with the table |
| The comparison | A gate drops | Revert. Bisect the cuts in that gate's section to find the clause, restore it, and re-run |
| The comparison | A gate improves | Report it, and do not claim it. A gate that moves either way at a low run count is as likely to be noise |

**Reference mode.** Run the house style lint, and read every cut back against the edge test.

```sh
python3 <harness>/scripts/house-style-lint.py <the trimmed file>
```

Fix every `ERROR` and judge each `WARN`. A trim that introduces a lint error has traded length for quality.

**Both modes.** Walk the diff and name every cut by its class. Restore any cut you cannot name.

### Step 6: Report

Give the author four things and nothing else.

1. Word count before and after, and the percentage.
2. What came out, by class, with word counts.
3. The gate comparison table, or the reason there is none.
4. Every cut you reverted, and the clause that caused it.

Label the outcome exactly. A trim is **verified** when fixtures ran before and after and every gate held. It is **unverified** otherwise. Never report an unverified trim as verified, and never describe a lint pass as a behaviour check.

## Rules

- Behaviour is the constraint, length is the target. A shorter document that changes what an agent does is a failed trim, not a trade-off.
- Build the baseline before the first cut. A baseline captured after trimming measures nothing.
- Never cut a clause that adds a case, an exception, or a limit. Apply the edge test to decide, not a read-through.
- Cut gate rationale only where a reader cannot get the rule wrong. Where the gate resolves ambiguity, the rationale is the rule.
- Do not set or accept a word budget. If the author names a target, say that the classification decides the number, and report what the split allows.
- Do not count extracted words as trimmed. Extraction defers a cost; trimming removes one.
- Trim the document you were asked to trim. Do not retrofit a file you are only passing through.
- A structured test fixture, such as `evals/*.json`, is not this skill's target. Its assertions verify behaviour; they are not prose to compress.
- Label an unverified trim as unverified, and name what to re-check by hand.
- Report the classification split before cutting, so the author can stop you at the safe headroom.
