# UU: Understand Users

Source: [DSS Understand Users](https://info.standards.tech.gov.sg/control-catalog/dss/uu/). Status: draft.

The category has 2 DSS controls and 7 rules: 2 lintable, 3 judged, and 2 out of scope for the design linter. The rule format is in the [top-level README](../../README.md). The control-to-rule table is in [MAPPING.md](MAPPING.md).

## Rules

A rule file exists only for a lintable rule.

| Rule | Title | Check |
| --- | --- | --- |
| `UU-1a` | Users' needs and context are understood before a solution is chosen | judged |
| `UU-1b` | Users' needs and context are documented | judged |
| [`UU-1c`](UU-1c.md) | A research record exists at the configured path and is not empty | lint |
| `UU-2a` | Usability testing is run with representative users | out of scope |
| `UU-2b` | Findings are documented in a structured report ranked by severity | judged |
| `UU-2c` | Each finding is remediated or its risk is accepted within the set days | out of scope |
| [`UU-2d`](UU-2d.md) | A findings report exists at the configured path and each finding has a severity from the scale | lint |

## Decisions

- Both controls ask for research activity and records. Two rules, `UU-1c` and `UU-2d`, check that a record or report exists at a configured path. They test presence and structure, not quality.
- A rule is out of scope when it concerns a process or a tracker that the design linter cannot see.
- A judged rule reads evidence that the team supplies. `dx-design-judge` defines the rubric, and the rule asks for a link to the research record.
- The DSS page lists no "Not required for" text for either control, so the rules define no exemption parameter.
- The DSS leaves the day count of `UU-2c` to the parameter `uu-2_prm_1`. The mock-up does not set a default.
- A letter suffix splits one DSS control into several rules. ADR 0001 uses `PREFIX-N`, so the ADR needs to cover the suffix.
- Tiers are provisional until [#432](https://github.com/transformteamsg/dx-harness/issues/432) classifies which controls a script can decide.

## Reviewed decisions

- Second pass: UU-1c added as lint.
- Second pass: UU-2d added as lint.

## Open

- `UU-2c`: decide where the remediation dates are read from, such as the issue tracker, before the rule moves from out of scope to judged.
- The judged rules need rubrics from `dx-design-judge`: `UU-1a`, `UU-1b`, and `UU-2b`.

## Built

Both lint rules have a module in `packages/design-lint/src/modules/uu/`.

- Both paths are relative to the project root.
- `UU-1c` fails a missing file and a file that holds only whitespace. It does not read the content.
- `UU-2d` reads a Markdown report or a JSON report. In Markdown, each level-3 heading is a finding, and a line `severity: value` in its section carries the severity. The label is not case-sensitive, and it may be a list item or in bold. In JSON, the report is a list, or an object with a `findings` list, and a finding is an object with the `severityField` key. A JSON finding is reported at line 1. The severity is compared without regard to case. The module does not check the sort order that the rule file recommends.
- The demo files are `demo/site/uu/research-record.md` and `demo/site/uu/findings-report.md`.

Rules not built: none.
