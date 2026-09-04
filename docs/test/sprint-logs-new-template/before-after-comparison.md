# The template, tested against the Squad Charlie logs

The three Squad Charlie sprint logs from
[tfx-brain#40](https://github.com/transformteamsg/tfx-brain/pull/40), rewritten
into the template in
[`references/sprint-log-template.md`](../../../plugins/dx-harness/skills/engineering/dx-create-sprint-logs/references/sprint-log-template.md).

**Nothing in `transformteamsg/tfx-brain` was modified.** These are evaluation
copies.

## Three treatments of the same three logs

| Folder | What it holds | Words |
| --- | --- | --- |
| [`sprint-logs-sample/`](../sprint-logs-sample/) | The originals, as merged | 7,275 |
| [`sprint-logs-housestyle/`](../sprint-logs-housestyle/) | Prose edited to the house style, structure untouched | 7,234 |
| `sprint-logs-new-template/` | Rewritten into the template | 3,191 |

Read the three side by side. They isolate what each intervention does.

## The result

**The house style cut 0.6%. The template cut 56%.**

| Log | Original | House style | Template | Log only |
| --- | --- | --- | --- | --- |
| FSBB | 1,170 | 1,164 | 694 | 536 |
| MySEI | 4,292 | 4,264 | 1,594 | 1,203 |
| TCI | 1,813 | 1,806 | 903 | 656 |
| **Total** | **7,275** | **7,234** | **3,191** | **2,395** |

"Log only" excludes the Step 5 report, which each file carries after a rule and
which is not part of the written log. By that measure the cut is 67%.

This confirms what the earlier benchmarks found three times: **editing prose does
not shorten an artifact. Deciding what does not belong in it does.** The house
style corrected 35 passages and left the length alone. The template moved a
category of content out, and the length followed.

## Where the original content went

Every passage of the originals reached one of four destinations.

| Destination | What went there |
| --- | --- |
| A table row | Anything with a link: an issue, a PR, a merge request, a decision record |
| Out, to an issue or a decision record | Reasoning, analysis, and argument. Each file's Step 5 report lists its own, eight passages in all |
| Out, to the retrospective | Observations about how the squad worked, such as MySEI running closer to kanban than to a fixed commitment |
| Dropped | The roster, the absences, and prose that restated a table |

The rewrite does not move text, so these are not word counts. The 4,880 words the
originals hold above the rewritten rows are compressed, routed, or dropped, and
the Step 5 reports name every routed passage.

The largest single move is MySEI's load test analysis, roughly 1,000 words:
the measurement table, the saturated-thread diagnosis, four qualifications on
the numbers, and the suggested next steps. Under the template it becomes one
carried-over row and one risk row, both linking
[#626](https://github.com/String-dxd/my-sec/issues/626).

**That is the change a reviewer should argue with.** The analysis is the most
valuable thing in the sprint. The skill's position is that its value is exactly
why it must not live in a log: `#626` shows no results today, so anyone planning
from the issue tracker never sees it, and if
[PR #635](https://github.com/String-dxd/my-sec/pull/635) closes unmerged the
write-up goes with it. The original log says so about itself, in risk 3.

## What the logs were hiding

A row with no link is a finding. The rewrite surfaced 23.

| Log | Rows | Rows with no link |
| --- | --- | --- |
| FSBB | 32 | 6 |
| MySEI | 61 | 11 |
| TCI | 38 | 6 |

These were all present in the originals as prose, and none was actionable there.
The sharpest is MySEI's: **internal testing was committed at Sprint Planning,
never started, and has no issue of any kind.** In the original it is a bold
sentence in the middle of the longest section. In the template it is a
carried-over row whose Link cell reads `No issue`, which is hard to file past.

## What the template could not hold

Four gaps, found by running it rather than by reading it. Each needs a decision
before the template is used for real.

1. **No value for work carried in from an earlier sprint.** The Committed at
   planning? column offers `Yes` or `Raised mid-sprint`. FSBB's six carried-over
   rows are neither: they arrived from the 4–17 Aug sprint. The rewrite uses
   `Carried in` as a third value.
2. **No roster.** "Who worked on it" has no field, so it is dropped. The squad is
   stable across logs, so this is defensible, but it also drops the absences, and
   MySEI's original names those absences as the reason OTEL and the load test
   both stopped.
3. **No reserve or planned distinction.** Delivered absorbs both. FSBB's entire
   sprint was reserve work, and TCI's largest item was, so the template loses a
   distinction those two logs are built on.
4. **Sign-off has no receiver when nothing was handed over.** FSBB's To cell
   reads `Unassigned`, which is accurate and also the whole finding.

Gaps 1 and 3 are worth fixing in the template. Gap 2 is worth arguing about. Gap
4 is the template working.
