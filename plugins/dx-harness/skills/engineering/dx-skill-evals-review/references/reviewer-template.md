# Reviewer dispatch payload

Build one payload per reviewer by filling every slot. Send the whole thing as the subagent prompt.

```
{reviewer_prompt}

<suite-context>
Skill under test: {skill_name}
Evals in the suite: {eval_count}
Assertions in the suite: {assertion_count}
Assertions phrased negatively ("does not..."): {negative_assertion_count}
</suite-context>

<the-skill>
{skill_md_content}
</the-skill>

<the-suite>
{suite_content}
</the-suite>

Return JSON matching this schema and nothing else. No prose before or after it.

{schema}
```

## Filling the slots

| Slot | Value |
| --- | --- |
| `{reviewer_prompt}` | Full content of this reviewer's file under `reviewers/` |
| `{skill_name}` | The skill the suite tests, from the suite's `skill_name` field |
| `{eval_count}`, `{assertion_count}`, `{negative_assertion_count}` | Counted in step 1, so no reviewer counts them again and reaches a different number |
| `{skill_md_content}` | The whole `SKILL.md`. Never a slice: a reviewer given part of the skill reports leakage it cannot see, and misses promises it was never shown |
| `{suite_content}` | The whole suite file |
| `{schema}` | Full content of `findings-schema.json` |

## Rules that bind every reviewer

- Reviewers read. They never write a file, never edit the suite, and never run the evals.
- Every finding carries a quote. A reviewer that cannot quote the passage it objects to has an impression, not a finding.
- An empty findings array is a valid return. Do not pad a return to look like work.
- Judge the suite, not the skill. When the skill itself is the problem, say so in `notes` rather than filing it as a finding, unless the defect is that the suite asserts something the skill never settles.
