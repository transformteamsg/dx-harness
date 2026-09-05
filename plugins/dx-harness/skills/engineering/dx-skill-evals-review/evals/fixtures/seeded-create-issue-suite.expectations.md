# Expectations: seeded-create-issue-suite.json

Answer key for this fixture. Never referenced from the fixture body: the fixture must read as an ordinary eval suite to any reviewer.

## Where this fixture came from

It is not synthetic. It is a real first draft of an eval suite for `dx-create-issue`, written in one pass and then reviewed by a human-directed reviewer that had the skill in front of it. The verdicts below are that review's conclusions. Six of the twelve prompts turned out to be the skill's own worked examples retyped, which is the defect this fixture exists to detect.

Use it against the shipped suite at `../../dx-create-issue/evals/evals.json`, which is what the suite became after the review. A reviewer run against the fixture should find most of what the table records; a run against the shipped suite should find much less.

## The planted defects

| # | Eval | Defect | Expected class | Expected verdict |
| --- | --- | --- | --- | --- |
| 1 | 0 story-not-bug-when-never-built | The skill's classifying step already warns "be careful with 'X doesn't work': that often means X was never built", and the worked-examples table carries the same teacher-filter scenario | answer-in-the-skill | CUT |
| 2 | 1 task-parent-named-without-number | Real failure mode, but the prompt reuses the skill's own parenthetical example phrase "part of the export work" | answer-in-the-skill | REWRITE |
| 3 | 2 same-technology-different-shape | The skill states this case and its answer: "provisioning a queue is a task when it delivers part of a tracked story, and a chore when it retires a cron job nobody sees" | answer-in-the-skill | CUT or MERGE with 11 |
| 4 | 2 same-technology-different-shape | Assertion "does not let the shared technology decide either shape" cannot fail any run that passes the two classification assertions | cannot-fail | TRIM |
| 5 | 3 author-names-wrong-shape | The skill supplies the correct response almost verbatim, teacher and all: "You said chore, but this adds something a teacher can see and use, which makes it a story. Story?" | answer-in-the-skill | REWRITE |
| 6 | 4 author-names-plausible-shape-is-taken | Confounded: dead flag plumbing is a chore by independent derivation too, so a transcript cannot show whether the model deferred to the author or re-derived. The headline assertion "takes the author's named shape" is unjudgeable | unjudgeable-from-transcript | CUT |
| 7 | 6 no-question-when-request-answers-it | Prompt is a word-for-word copy of a worked-examples row, and the same `#142` example is repeated in the skill's Ambiguity section | answer-in-the-skill | CUT |
| 8 | 6 no-question-when-request-answers-it | Assertion "does not treat the design discipline as a reason to route elsewhere" cannot fail a run that classified correctly | cannot-fail | TRIM |
| 9 | 7 missing-leaf-skill-does-not-improvise | `fixture_setup` arranges nothing: it instructs the runner to state the premise in the prompt, so the eval tests obedience to a stated premise rather than behaviour on a genuinely absent skill | fixture-not-arranged | REWRITE |
| 10 | 8 no-bounce-back-to-the-sender | Ground truth is arguable and wrong as written: `dx-create-story` redirects a no-user-benefit story to `dx-create-task`, not to chore, and the skill tells the front door to "route to the skill it names". A model routing to `dx-create-task` satisfies assertion 2 and fails assertions 3 and 4 | arguable-ground-truth | REWRITE or CUT |
| 11 | 9 umbrella-chore-keeps-its-pieces | Prompt copies the worked-examples row "Set up a staging environment: ECS, its own database, an ALB", and that row spells out the expected reasoning | answer-in-the-skill | REWRITE |
| 12 | 9 umbrella-chore-keeps-its-pieces | Assertion "does not classify infrastructure work as a story for lack of a better fit" cannot fail a correct run | cannot-fail | TRIM |
| 13 | 10 shape-label-versus-skill-label | Pure transcription of the skill's Shape labels section, and any model answers `gh issue list --label "chore"` correctly with no skill loaded at all | measures-the-model | CUT |
| 14 | 11 mixed-request-splits-by-shape | The skill states this exact case and its answer: "'Add the export button and bump the SDK while you're in there' is two issues: a story and a chore" | answer-in-the-skill | CUT or MERGE with 2 |
| 15 | 11 mixed-request-splits-by-shape | Assertions 1, 2 and 3 state split-detection three ways; a run failing one fails all three | assertion-restates-another | TRIM |

## The gaps

These are absences, so no eval id carries them. A `gap-hunter` run should propose an eval for each.

| # | Untested promise | Why it is the most serious gap |
| --- | --- | --- |
| G1 | Context carry-across on handoff: the skill promises scope, parent number, links, constraints, exclusions, and the author's wording all survive, so "they should never repeat themselves because the front door forgot" | The suite tests classification nine times and handoff fidelity zero times. This is the skill's central promise |
| G2 | The bug-versus-parent ordering conflict: a genuine regression that is also a slice of tracked work satisfies both question 1 and question 3, and the skill never says which wins | Finds a hole in the skill itself, not only in the suite |
| G3 | Refusing to file it directly under pressure: every eval asserting "runs no `gh`" gives the model no reason to want to run one | An untested "never" is an untested rule. This is the one a competent model is most likely to actually fail |
| G4 | Over-triggering when the shape is already clear, which the skill's own description says the front door is not needed for | Untested |
| G5 | The other three leaf-skill bounce-backs, particularly `dx-create-bug` sending work back when nothing was ever built | Only the story bounce is tested, and it is the one with arguable ground truth |
| G6 | A request that is not an issue at all, such as "why is the marking screen so slow?" | Filing a speculative issue is the expensive wrong answer, and nothing tests against it |

## What a passing reviewer run looks like

The point of this fixture is detection rate, not exact agreement.

- **Strong:** finds all six answer-in-the-skill defects (rows 1, 2, 3, 5, 7, 11, 14), catches G1, and flags at least two of the four cannot-fail assertions.
- **Adequate:** finds the two verbatim lifts (rows 7 and 14), catches G1, and reports the assertion ratio.
- **Failing:** reports fewer than half the leakage rows, or misses G1. A reviewer that grades this suite as sound has not done its job, whatever else it found.

Two rows are deliberately harder than the rest. Row 6 requires noticing that two different processes produce one identical transcript. Row 10 requires reading a sibling skill, `dx-create-story`, to see that the redirect target contradicts the expected output. A reviewer that catches either is doing better than adequate.
