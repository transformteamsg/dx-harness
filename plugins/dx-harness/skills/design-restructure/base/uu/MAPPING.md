# UU: Understand Users

Source: [DSS Understand Users](https://info.standards.tech.gov.sg/control-catalog/dss/uu/). Status: draft. The decisions and open items are in the [category README](README.md).

The DSS page lists no "Not required for" text for UU-1 or UU-2, so no row has an exemption parameter.

| DSS control | Rule | Check | Surface | Engine | Parameters |
| --- | --- | --- | --- | --- | --- |
| UU-1 Understand user needs | `UU-1a` Users' needs and context are understood before a solution is chosen | judged | | | |
| | `UU-1b` Users' needs and context are documented. Lint part: [`UU-1c`](UU-1c.md). | judged | | | |
| | [`UU-1c`](UU-1c.md) A research record exists at the configured path and is not empty. Lint part of `UU-1b`. | lint | project | custom | `researchRecordPath` (unset) |
| UU-2 Test with users | `UU-2a` Usability testing is run with representative users | out of scope | | | |
| | `UU-2b` Findings are documented in a structured report ranked by severity. Lint part: [`UU-2d`](UU-2d.md). | judged | | | |
| | `UU-2c` Each finding is remediated or its risk is accepted within the set days | out of scope | | | `uu-2_prm_1` (days, unset) |
| | [`UU-2d`](UU-2d.md) A findings report exists at the configured path and each finding has a severity from the scale. Lint part of `UU-2b`. | lint | project | custom | `findingsReportPath` (unset), `severityField` (`severity`), `severityScale` (`critical`, `high`, `medium`, `low`) |

## Judged and out-of-scope reasons

| Rule | Reason |
| --- | --- |
| `UU-1a` | The order of research and design is a team process. A judge can read the research record and its dates. |
| `UU-1b` | A judge reads the record for users, needs, and context. `UU-1c` checks that the record exists. The judged part is its content. |
| `UU-2a` | Testing with people happens outside the product, and no source, page, or project file shows it. |
| `UU-2b` | [`UU-2d`](UU-2d.md) checks that the report exists and each finding has a severity. A judge reads the report for structure and ranking quality. |
| `UU-2c` | Remediation lives in a tracker and in risk sign-off, which the design linter cannot read. |
