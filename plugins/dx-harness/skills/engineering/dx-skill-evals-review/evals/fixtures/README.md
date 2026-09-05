# Fixtures

Inputs for this skill's own eval suite. Each pair is a skill and the suite that tests it, so a run has real files to review rather than a description of some.

**Nothing here is a real skill.** The skill files are named `fixture-skill.md` rather than `SKILL.md` so that no skill scanner, now or later, can mistake one for a skill this plugin ships. Keep that naming if you add a fixture.

Nothing here is a real defect report either. Two of these fixtures contain deliberate flaws, and one is deliberately vague. Do not fix them.

| Fixture | Used by | What it is |
| --- | --- | --- |
| `seeded-create-issue-suite.json` | Manual runs, and evals 0, 2 and 7 | A real first draft of the `dx-create-issue` suite, with its review as an answer key in `.expectations.md` and the baseline run in `.runs.md` |
| `unarranged-fixture/` | Eval 4 | A sound small suite with one `fixture_setup` that arranges nothing |
| `untested-promise/` | Eval 5 | Five well-made evals, none of which tests the skill's central promise |
| `vague-skill/` | Eval 6 | An under-specified skill, faithfully tested by its suite |

The answer key for the seeded suite is never given to a run. The other three carry no key: what a correct run should find is stated in the eval that uses them.
