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

For every prompt `answer-leakage` flags, and only those, run one probe: dispatch a subagent that has not read the skill, give it the bare prompt, and record what it answers along with everything it consulted to answer.

The point is to turn an opinion into evidence. If a model that never saw the skill produces the expected output anyway, the eval measures the model rather than the skill.

**A probe subagent is not blind by default, and an unblinded probe is worthless.** It usually keeps file-reading tools and an ambient roster of installed skills, either of which can carry it to the skill under test or to a sibling that states the same rule. Probes have reached expected answers that way without ever opening the skill, which reads in the record as leakage and is nothing of the kind. So:

- Withhold the tools the probe does not need. Where the platform allows a tool list per dispatch, give it none: no file reads, no search, no skill invocation.
- Tell it in the prompt to answer from the prompt alone, to consult nothing, and to name anything it did consult.
- Require it to report its sources with its answer. A probe that will not say what it read has not returned a usable result.

**Void any probe that reached the skill, a sibling skill, or the installed-skills roster.** A void probe is not a pass and not a fail: it is a missing measurement, and the eval keeps whatever verdict the reviewers reached without it. Never let a void probe stand as corroboration.

Read the two directions differently, because they are not symmetric:

- **The probe reproduced the expected output, and stayed blind.** Strong evidence. The eval measures the model, and its verdict is CUT however well written it is.
- **The probe did not reproduce it.** Weak evidence, and it settles nothing on its own. One probe failing tells you this model missed this prompt once, not that the eval is sound. It removes a leakage finding's claim to certainty; it does not clear the prompt. A near lift whose probe came back clean stays a REWRITE.

Record against each probed eval: the probe's answer, what it consulted, and whether it stayed blind. When no blind probe is achievable on the platform in hand, run none and say so in Coverage. A probe you cannot trust is worse than an absent one, because the record cannot tell them apart later.

**Judge the disclosure against what the platform injects, not against what the probe says.** Where a harness puts repository instructions or a roster of installed skills into every subagent's context, no probe on it is blind, and one reporting that it consulted nothing is the least trustworthy of the set rather than the cleanest: its peers disclosed the same contamination and it did not. Void the whole set in that case. Counting the silent probe rewards non-disclosure and produces exactly the false corroboration this step exists to prevent.

Check the platform once, before probing, by reading what a subagent receives. If repository instructions or an installed-skills roster ride along, probe nothing and record that fact, because it will hold for every later run on the same platform until the platform changes.

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
- **Coverage**, naming any reviewer that failed, any prompt the baseline probe could not reach, and every probe that was voided for reaching the skill or the installed-skills roster. A CUT that rests on a probe says so, and names the probe's answer, so a later reader can tell a measured verdict from a judged one.
- **Bottom line**: how many evals you would ship, and what a tighter suite looks like.

Report the findings and stop. Applying them is the author's call, and a suite rewritten by its own reviewer has no reviewer.

---

## Rules

- Review the suite, never the skill. A finding about the skill's own wording belongs in an issue, not here. The one exception is an eval whose ground truth the skill never settles: say so, because that is a hole in the skill the suite happened to find.
- Never rewrite an eval in place. Propose the prompt; leave the edit to the author.
- Never fill in `passed` or `evidence` fields. Those belong to a run, not to a review.
- A reviewer that finds nothing returns an empty findings array. An empty return is a result, not a failure, and it is never padded to look like work.
- State a fixture that the suite describes but does not arrange. A `fixture_setup` that tells the runner to state a premise in the prompt tests obedience to that premise, which is a weaker eval than it appears.
