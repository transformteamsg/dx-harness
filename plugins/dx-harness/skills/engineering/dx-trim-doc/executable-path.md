# Executable path

Step 1 settled the mode and named the gates. Five steps remain, and they run in order. The Sentence classes table in `SKILL.md` decides every classification below.

The Reference path shares Steps 3, 4 and 6 with this file. An edit to any of those three belongs in `reference-path.md` too.

## Step 2: Capture the behaviour baseline

Read [references/behaviour-baseline.md](references/behaviour-baseline.md) and follow it. It covers how to build a fixture per gate, how to run the document as it stands, and what to record. It also names two measurement traps that make a broken run look clean.

The baseline is the untrimmed document's gate outcomes. Without it there is nothing to compare against, so build a fixture per gate before you cut anything, and never the other way round.

If a baseline is not possible, say why, offer to continue on the edge test alone, and label the result an unverified trim. Do not proceed silently.

## Step 3: Classify every sentence

Walk the document and assign every sentence one class from the Sentence classes table. Report the split before you cut:

> "N sentences: N instruction, N condition, N gate rationale, N framing, N restatement. Framing and restatement come to N words, which is N% of the file."

That percentage is the safe headroom. Cutting past it takes words from gate rationale.

## Step 4: Trim

Cut framing and restatement freely. They carry no behaviour.

For every other candidate, apply the edge test from `CONTRIBUTING.md`. Remove the clause, then construct an input where the rule is ambiguous, and ask whether your answer changes. If it changes, the clause was a condition. Put it back.

Keep gate rationale where the gate resolves ambiguity, because that is the case nobody wrote down. Cut it where the rule is mechanical and a reader cannot get it wrong.

- **Keep**: why a persona gate sends work to another skill, why one cut of a split beats the other, why a finding counts as confirmed.
- **Cut**: why `--body-file` beats an inline `--body`, why `gh label create` is idempotent, why a recording goes up as a GIF.

Do not set a word budget. Compress by class, then measure what you got. Where the author names a target, say that the classification decides the number, and report what the split allows.

Do not count an extraction as a trim. Moving a step's detail into `references/` defers a cost rather than removing one, and `CONTRIBUTING.md` sets the rules for when it is worth doing. Offer it separately.

## Step 5: Verify

Re-run the Step 2 fixtures against the trimmed document, same fixtures, same run count. Compare gate outcomes to the baseline.

| Given | When | Then |
|---|---|---|
| The comparison | Every gate holds | Report the trim as verified, with the table |
| The comparison | A gate drops | Revert. Bisect the cuts in that gate's section to find the clause, restore it, and re-run |
| The comparison | A gate improves | Report it, and do not claim it. A gate that moves either way at a low run count is as likely to be noise |

Then walk the diff and name every cut by its class. Restore any cut you cannot name.

## Step 6: Report

Give the author four things and nothing else.

1. Word count before and after, and the percentage.
2. What came out, by class, with word counts.
3. The gate comparison table, or the reason there is none.
4. Every cut you reverted, and the clause that caused it.

Label the outcome exactly. A trim is **verified** when fixtures ran before and after and every gate held. It is **unverified** otherwise, and an unverified trim names what to re-check by hand. Never report an unverified trim as verified, and never describe a lint pass as a behaviour check.
