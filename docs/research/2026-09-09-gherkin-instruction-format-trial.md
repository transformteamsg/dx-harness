# Gherkin instruction format trial: `dx-create-story` and `dx-create-bug`

Date: 2026-09-09. 144 scored runs. Cost: about $38.

## The question

Does writing skill instructions in a Gherkin-style scenario form improve output and reduce unnecessary verbosity?

Given-When-Then already carries the acceptance criteria this family writes into issue bodies. It has never been the format of the instructions themselves, which are Step and prose throughout.

Two candidate causes had to be separated. Opus writes dense prose whatever it is told, so a format rewrite risked being credited for a gain that a model switch would deliver instead. A model baseline ran first.

## Answer

Gherkin tables do not reduce verbosity. They increase it, in both directions, and they cost more per run. The one measure they improve is gate compliance on Opus, by 0.28 of six gates, and a blind judge still prefers the control's issue bodies.

The trimmed prose arm is the useful result. It cut 39% of the instruction words with no detectable loss on either model, and a blind judge preferred its bodies.

Model choice dominates every format effect. The gap between Opus and Sonnet is about 1.2 gates. The largest format effect is 0.28.

## Method

Four arms, each a whole copy of `plugins/dx-harness` loaded with `claude -p --plugin-dir`. Only two files differ between arms.

| Arm | Instruction text | Words |
|---|---|---|
| `control` | Current `SKILL.md`, unmodified | 5,496 |
| `gherkin` | Scenario tables for branching decisions, prose for narrative rules, with a `Because` column wherever the source carried an explanation | 6,184 |
| `compressed` | Existing voice, explanations trimmed | 3,325 |
| `housestyle` | Identical to `control`. The arm differs by system prompt, which appends `procedures/house-style.md` | 5,496 |

Six fixtures, each a self-contained author request. Three are built to expose the failure the hypothesis risks.

| # | Skill | Fixture | Correct behaviour |
|---|---|---|---|
| 01 | story | Fully specified capability | Render a complete body |
| 02 | story | No persona, no criteria | Ask, invent nothing |
| 03 | story | Database index work framed as a story | Fail the persona gate, route to `dx-create-task`, stop |
| 04 | story | Two unrelated capabilities | Offer both cuts, recommend one by the persona test |
| 05 | bug | Export button "doesn't work", never built | Check the history, reroute, apply no `bug` label |
| 06 | bug | Intermittent, no evidence | Record `None available` with a reason, derive priority |

Every run gets the same appended system prompt. It forbids writes to GitHub. It forbids answering on the author's behalf. Where the skill says to ask, it tells the run to ask and stop. `dx-code-review`'s own eval notes set this precedent. A run records what it would post, and posts nothing.

Metrics per run:

- Gate compliance against a per-fixture checklist, drawn from each skill's `## Rules` section
- Words across every assistant turn
- `ERROR` and `WARN` counts from `scripts/house-style-lint.py` on the rendered body
- Turns and cost

Gate compliance is the deciding metric. An arm that fails fixture 03, 04, or 05 has lost, even with shorter and cleaner prose. It traded a correct decision for a tidier one.

## Stage 0: what the model owns

Control arm, both models, 24 runs.

| Metric | Opus | Sonnet |
|---|---|---|
| Gates passed, of six | 5.7 | 4.4 |
| Words across all turns | 404 | 210 |
| Turns | 9 | 5 |
| Cost per run | $0.35 | $0.14 |

Opus is about twice as verbose. The words buy gate compliance rather than padding it out.

Sonnet loses on the judgment fixtures. Fixture 04 scored 6.0 against 3.5, fixture 06 scored 5.5 against 3.0. Sonnet won one fixture, 02, the pure "ask for what is missing" case.

The mechanism is early exit. On fixture 04 Sonnet correctly caught that neither half has an unhappy path, then stopped to ask and never reached the split evaluation. Opus reported every blocker in one pass. Two fixtures end in a rendered body. Opus produced one in four of four runs, Sonnet in one of four.

A model switch is therefore not a free verbosity fix. It costs 1.3 gates of six.

## Stage 1: what the format owns

120 runs. Opus at three runs per cell, Sonnet at two.

### Opus

| Arm | Skill words | Gates of six | Range | Output words | Turns | $/run |
|---|---|---|---|---|---|---|
| `gherkin` | 6,184 | 5.83 | 5-6 | 469 | 8.7 | 0.403 |
| `compressed` | 3,325 | 5.61 | 5-6 | 389 | 8.2 | 0.370 |
| `housestyle` | 5,496 | 5.61 | 4-6 | 367 | 9.2 | 0.368 |
| `control` | 5,496 | 5.56 | 5-6 | 410 | 8.7 | 0.373 |

### Sonnet

| Arm | Skill words | Gates of six | Range | Output words | Turns | $/run |
|---|---|---|---|---|---|---|
| `compressed` | 3,325 | 4.58 | 3-6 | 226 | 6.3 | 0.124 |
| `gherkin` | 6,184 | 4.42 | 1-6 | 261 | 7.2 | 0.176 |
| `control` | 5,496 | 4.33 | 2-6 | 210 | 5.2 | 0.142 |
| `housestyle` | 5,496 | 4.08 | 1-6 | 222 | 4.8 | 0.127 |

### Fixtures won against control

Counted on per-fixture means, which is the only reading the run count supports.

| Arm | Opus | Sonnet |
|---|---|---|
| `gherkin` | 4 won, 1 lost, 1 tied | 2 won, 3 lost, 1 tied |
| `compressed` | 3 won, 3 lost | 3 won, 2 lost, 1 tied |
| `housestyle` | 2 won, 2 lost, 2 tied | 1 won, 5 lost |

### Rendered bodies, lint counts

Only fixtures 01 and 06 end in a rendered body. This rests on six or seven bodies per arm.

| Arm | Errors | Over-length sentences | Body words |
|---|---|---|---|
| `gherkin` | 1.4 | 0.6 | 294 |
| `housestyle` | 1.8 | 0.6 | 274 |
| `control` | 2.0 | 1.0 | 295 |
| `compressed` | 2.8 | 1.5 | 310 |

### Blind pairwise grading

Each rendered Opus body was compared against the control body from the same fixture and run. Both orderings ran for every pair, and the rubric came from each skill's own `## Rules` section.

| Arm | Arm won | Control won | Tied |
|---|---|---|---|
| `compressed` | 5 | 3 | 4 |
| `gherkin` | 2 | 6 | 3 |
| `housestyle` | 1 | 6 | 3 |

The judge favoured the second slot, 16 against 7. Running both orderings for every pair cancels that in the totals.

## Findings

1. **Gherkin does not reduce verbosity, it adds it.** The instructions grew 13%. Output grew 14% on Opus and 24% on Sonnet. Cost per run rose 8% on Opus and 24% on Sonnet. This is the clearest result in the trial and it holds on both models.

2. **Gherkin's only win is gate compliance on Opus.** It scored 5.83 against 5.56 and won four of six fixtures. At three runs per cell, read that as suggestive rather than settled.

3. **A blind judge prefers the control's issue bodies to gherkin's**, 6 to 2. Gate compliance and artifact quality disagree here, which is why both were measured.

4. **Trimming the skill by 39% cost nothing measurable.** `compressed` matched control on gates on both models, and its bodies won the blind comparison 5 to 3. Its rendered bodies do carry more lint errors, 2.8 against 2.0.

5. **Appending the house style at generation time made things worse.** `housestyle` was the weakest Sonnet arm at 4.08. It lost five of six fixtures, and lost the blind comparison 6 to 1. The system prompt appears to dilute the skill's own instructions rather than reinforce them.

6. **Model choice dominates.** Opus scored 5.56 to 5.83 across all four arms. Sonnet scored 4.08 to 4.58. The 1.2-gate gap between models is four times the largest format effect.

## A hypothesis about why gherkin lost the blind comparison

The judge repeatedly cited the **Priority** section. The control bodies fill it with a reasoned `P2`; the gherkin bodies more often leave it awaiting confirmation.

The `gherkin` arm moved one rule out of intake item 9 and into a table row. That rule: derive a suggested level from the impact, then read it back for the author to confirm. The prose version states the rule and its reason in one sentence. The table version separates them.

This resembles the regression `CONTRIBUTING.md:134` records, where trimming an explanation from `dx-code-review` turned a conditional rule into a blanket one. Here the explanation survived in a `Because` column, but relocating the rule appears to have cost it force. A body-level check of this was too crude to confirm the effect, so treat it as a hypothesis worth a targeted follow-up.

## Recommendation

Do not adopt Gherkin phrasing for skill instructions. It costs words and money on both models, and a blind judge prefers what the current prose produces.

Keep prose, and take the concision from trimming rather than from restructuring. The `compressed` arm is the evidence: 39% fewer instruction words, no gate loss, better-liked bodies. Trim per skill, and keep the three judgment fixtures as a regression check. A trim that drops a gate is the failure mode that matters.

Do not append `house-style.md` to the system prompt as a quality lever. It measured worse than doing nothing.

Treat the model as the real quality dial. Sonnet costs a third of Opus and gives up 1.2 gates of six, concentrated in the judgment cases. That is a defensible trade for routine intake and a bad one for a story that might need splitting.

## What this trial cannot support

- Two runs per cell on Sonnet and three on Opus. Effects below about 0.5 gates are inside the noise. Only findings 1, 5, and 6 hold consistently across fixtures.
- Two skills, not the family. Nothing here transfers to `dx-design-execute`, which carries six phases and dual entry modes.
- Single-shot runs. The interview never happens across turns, so the trial cannot see whether a format helps or hurts multi-turn gathering.
- Lint counts rest on six or seven rendered bodies per arm, because four of six fixtures correctly stop before rendering.
- Gate compliance and the blind grading are both LLM-scored against fixed rubrics. Spot checks matched, and no human scored the full set.

## Side finding: a house style rule enforced nowhere

`CLAUDE.md`, `procedures/house-style.md`, and `output-styles/dx-house-style.md` all tell a writer to cut `just`, `simply`, `easy`, `easily`, `please`, and `leverage`.

`scripts/house-style-lint.py` cannot flag any of them. It parses its four word lists at runtime from the tables in `procedures/house-style-mechanics.md`, and that file carries none of those six terms. Of the seven words `CLAUDE.md` names, only `in order to` is enforced.

The lint is not wrong: it reports 96 rules and its 41 self-test cases pass. The tables it reads are incomplete. Fixing it means adding rows to `house-style-mechanics.md`, which is its own piece of work.

## Reproducing it

The harness lives outside this repository, in the session scratchpad, and is not committed. It holds four arm copies, six fixtures, `runner.py`, `gates.py`, `grade.py`, `rebuild.py`, and the per-run transcripts.

Three notes for whoever rebuilds it.

1. `--output-format json` returns only the final assistant message. Measuring verbosity needs `--output-format stream-json --verbose`, which yields every turn. The first pass here scored final messages only and was rerun.
2. A 429 returns `subtype: success` with `is_error: true`. A runner that reads `subtype` alone records a rate-limited run as a terse one. Check `is_error` and `api_error_status`.
3. `claude plugin eval` is the right long-term runner, with `case.yaml`, `graders/*.md`, `--runs`, and an `--ablation with-without` baseline. It is gated behind early access and was unavailable here. The four existing `evals/evals.json` files use an older shape the current runner does not read, and every assertion in them still carries `passed: null`.
