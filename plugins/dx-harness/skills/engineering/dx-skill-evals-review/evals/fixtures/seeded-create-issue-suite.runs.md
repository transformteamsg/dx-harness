# Run record: seeded-create-issue-suite.json

What happened when the reviewers ran against this fixture. Each entry is a baseline: a later run that finds materially less has regressed, and one that finds materially more has either improved or started reporting noise, which the entry should say.

Record a run whenever the reviewer prompts, the schema, or the orchestration change. Do not record a run that read the answer key.

---

## 2026-09-05, first run

Four reviewers, one pass each, against the 12-eval fixture. Every reviewer was told not to open `*.expectations.md`, and each confirmed in its `notes` that it had not.

**Result: exceeds the strong bar in the answer key.** Both rows the key marks as deliberately harder were caught.

### Detection against the key

| Category | Planted | Filed | Notes |
| --- | --- | --- | --- |
| answer-in-the-skill | 7 | 7 | All at confidence 100 except eval 8 at 75 |
| cannot-fail | 4 | 4 | |
| unjudgeable-from-transcript (eval 4) | 1 | 1 | Confidence 100, reasoned independently |
| arguable-ground-truth (eval 8) | 1 | 1 | Required reading `dx-create-story` to see |
| fixture-not-arranged (eval 7) | 1 | 0 | **Miss.** Three reviewers raised it in `notes`; none had a home for it |
| Gaps | 6 | 3 | G1, G3, G5. One reasoned decline, two not found |

31 findings in total.

### Per reviewer

| Reviewer | Findings | What it got right |
| --- | --- | --- |
| `answer-leakage` | 10 | Every leakage row, each with the eval prompt and the skill passage quoted side by side. Declined evals 4 and 5 with reasons |
| `falsifiability` | 14 | All four cannot-fail assertions, plus eval 4's unjudgeable assertion at confidence 100 |
| `ground-truth` | 3 | The `dx-create-story` redirect contradiction, quoting "point the author at `dx-create-task`, and stop" |
| `gap-hunter` | 4 | The central gap (handoff payload fidelity) at confidence 100 |

### Findings not in the key

These came out of the run, not from the planted set. They are recorded here rather than added to the key: a key updated from the run it grades stops being an independent check.

- **A gap the key does not contain.** An author naming "task" when nothing bigger exists, where the skill's "take the author's shape" rule collides with "a task needs a parent". The argument is that eval 3's contradiction is visible from the persona alone, so no eval separates a model applying the parent rule from one pattern-matching on whether a user observes the result.
- **Two further arguable ground truths**, in evals 0 and 5. The eval 0 argument is the stronger: the prompt never establishes the filter was never built, and `dx-create-bug` treats checking history as its own job, so handing off to it follows the skill and still fails five of six assertions.
- **An assertion ratio of 46 of 60** independently falsifiable. The human review that produced the key estimated roughly 25. The reviewer showed its working and the human estimate did not.

### Reasoned declines

Both are correct behaviour, not misses.

- `gap-hunter` refused to propose an eval for the classifying questions running in order, because no ordering violation is visible in a transcript that stops at a one-line handoff. This is also an argument against eval 2 of the shipped suite.
- `answer-leakage` declined eval 5, noting its resemblance to the skill points the model toward the answer the eval marks wrong. It classed that as a bias risk rather than leakage.

### What the run changed

The `fixture-not-arranged` miss was a hole in the reviewer prompts, not in the schema: the defect class existed and no reviewer owned it. `falsifiability` now hunts it. A later run should file it against eval 7, and a run that does not has regressed against this baseline.

### Deviations from the skill as written

Both apply to this run only and should be closed before it is treated as a clean baseline.

- Reviewers read the skill and the suite from disk rather than receiving them inlined per `reviewer-template.md`. Same content, different delivery.
- Step 3, the baseline probe, did not run. `answer-leakage` nominated evals 10 and 4 for it and could not run it itself. Eval 10 in particular is a plain `gh` question that a model with no skill loaded answers correctly, so the probe would likely have confirmed `measures-the-model`.
