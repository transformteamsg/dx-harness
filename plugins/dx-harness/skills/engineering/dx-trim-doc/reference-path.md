# Reference path

Step 1 settled the mode and named the gates. Step 2 does not apply here: a person reads this document, so there are no behaviour fixtures to build. Four steps remain, and they run in order. The Sentence classes table in `SKILL.md` decides every classification below.

Every trim on this path is unverified, because verified means fixtures ran before and after. Step 6 says how to label it.

The Executable path shares Steps 3, 4 and 6 with this file. An edit to any of those three belongs in `executable-path.md` too.

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

Run the house style lint, and read every cut back against the edge test.

```sh
python3 <harness>/scripts/house-style-lint.py <the trimmed file>
```

Fix every `ERROR` and judge each `WARN`. A trim that introduces a lint error has traded length for quality.

Then walk the diff and name every cut by its class. Restore any cut you cannot name.

## Step 6: Report

Give the author four things and nothing else.

1. Word count before and after, and the percentage.
2. What came out, by class, with word counts.
3. The reason there is no gate comparison: this path builds no fixtures.
4. Every cut you reverted, and the clause that caused it.

Label the outcome exactly. This trim is **unverified**, and an unverified trim names what to re-check by hand. Never report it as verified, and never describe a lint pass as a behaviour check.
