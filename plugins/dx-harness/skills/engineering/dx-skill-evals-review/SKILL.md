---
name: dx-skill-evals-review
description: 'Use when asked to review an eval suite for a skill, check whether evals are any good, or audit whether a skill''s tests actually test it. Triggers on "review these evals", "are these evals any good", "audit the eval suite", "do these evals earn their place", or a request to grade the tests rather than the skill. Reviews the suite; it does not review the skill itself and it does not run the evals.'
---

# Skill evals review

Reviews an eval suite against the skill it tests, with four reviewers, and reports which evals earn their place. An eval earns its place when a competent model following the skill could plausibly fail it, and failing would mean something real.

Reads and reports only. Never rewrites an eval, never fills in a `passed` field, and never grades the skill itself: a weak skill and a weak suite are different findings, and only the second one belongs here.

---

## Getting the suite

- **Path provided** → use it.
- **Skill name provided** → the suite is that skill's `evals/evals.json`.
- **Nothing provided** → ask which suite, then wait.

Read both files before dispatching anything: the suite, and the `SKILL.md` it tests. A reviewer that has not read the skill cannot tell a hard question from a copied answer, which is the defect this skill exists to catch.

If either file is missing or unreadable, stop and name it. Do not review a suite against a skill you could not read.

---

## The standard

A suite is judged on whether it would ever fail, not on whether it is thorough. Three defects matter most, in order:

1. **The answer is in the skill.** A prompt lifted from the skill's own examples, or phrased so the skill's text answers it directly, measures recall of a document the model is reading at the same moment.
2. **The eval cannot fail.** An assertion that restates another, or that no run could contradict, is padding: it inflates the count and measures nothing.
3. **The ground truth is arguable.** When a competent model could take the other branch and defend it, the eval measures the author's opinion.

A suite that tests one behaviour nine times and the skill's main promise zero times is worse than a shorter one. Say so plainly.

---

## The sequence

### 1. Classify the suite

Note the shape before dispatching: how many evals, how many assertions, and what proportion of assertions are negative ("does not…"). Pass these counts to every reviewer as context. A suite whose assertions are 80% negative is usually padded, and the reviewers should know that before they start.

### 2. Dispatch the reviewers

Four reviewers, every run, in parallel. Each is a generic subagent seeded with the full content of its file under `references/reviewers/`:

| Reviewer | What it hunts |
| --- | --- |
| `answer-leakage` | Prompts the skill already answers |
| `falsifiability` | Evals and assertions that cannot fail |
| `ground-truth` | Expected outputs a reasonable model could contradict |
| `gap-hunter` | Behaviours the skill promises and the suite never tests |

Do not dispatch a named or registered agent. Build each payload from `references/reviewer-template.md`, and require the return format in `references/findings-schema.json`.

Every reviewer receives the whole suite and the whole `SKILL.md`. Slicing defeats the point: `answer-leakage` needs both documents side by side, and `gap-hunter` finds nothing without the skill's own promises.

If a reviewer fails or times out, carry on with the rest and name it in Coverage. Never block the review on one reviewer.

### 3. Probe the baseline

For every prompt `answer-leakage` flags, and only those, run one probe: dispatch a subagent that has **not** read the skill, give it the bare prompt, and record what it answers.

This is the check that turns an opinion into evidence. If a model with no skill loaded produces the expected output anyway, the eval measures the model, and its verdict is CUT regardless of how well written it is.

Record the probe answer against the eval. A prompt that survives the probe keeps its place even when its wording resembles the skill.

### 4. Synthesise

Merge the four returns. Drop duplicates by eval id and defect class, keeping the finding with the strongest evidence.

Give each eval one verdict:

| Verdict | When |
| --- | --- |
| **KEEP** | Could fail, judgeable from a transcript, ground truth settled |
| **TRIM** | Earns its place, but carries assertions that restate each other |
| **REWRITE** | Tests something real through a prompt the skill answers |
| **MERGE** | Probes the same failure as another eval; name the survivor |
| **CUT** | Free, unjudgeable, or measures the model rather than the skill |

Then add the gaps as **ADD** rows, each with a proposed prompt. A gap is a finding like any other and outranks most cuts: an untested promise is a bigger hole than a weak eval.

### 5. Report

Lead with the verdict table: eval id, name, verdict, and one sentence naming the specific weakness. Never a general remark, and never a compliment in the reasoning column.

Follow with:

- **Gaps**, each with the prompt that would close it.
- **Assertion count**, total against independently falsifiable, because that ratio is the suite's real size.
- **Coverage**, naming any reviewer that failed and any prompt the baseline probe could not reach.
- **Bottom line**: how many evals you would ship, and what a tighter suite looks like.

Report the findings and stop. Applying them is the author's call, and a suite rewritten by its own reviewer has no reviewer.

---

## Rules

- Review the suite, never the skill. A finding about the skill's own wording belongs in an issue, not here. The one exception is an eval whose ground truth the skill never settles: say so, because that is a hole in the skill the suite happened to find.
- Never rewrite an eval in place. Propose the prompt; leave the edit to the author.
- Never fill in `passed` or `evidence` fields. Those belong to a run, not to a review.
- A reviewer that finds nothing returns an empty findings array. An empty return is a result, not a failure, and it is never padded to look like work.
- State a fixture that the suite describes but does not arrange. A `fixture_setup` that tells the runner to state a premise in the prompt tests obedience to that premise, which is a weaker eval than it appears.
