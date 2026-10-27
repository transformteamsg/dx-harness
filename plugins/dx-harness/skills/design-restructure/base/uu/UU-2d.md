---
code: UU-2d
dss: UU-2
tier: L1
check: lint
surface: project
engine: custom
judgedRemainder: UU-2b
parameters:
  findingsReportPath: null
  severityField: "severity"
  severityScale: ["critical", "high", "medium", "low"]
---

# UU-2d: a findings report exists and ranks each finding by severity

## Statement

The project holds a usability findings report, and each finding carries a severity from the agreed scale.

## Check

Fails when no file exists at `findingsReportPath`, when the report holds no findings, or when a finding has no `severityField` or a value that is not in `severityScale`.

When `findingsReportPath` is unset, the rule reports "not configured" and does not pass.

## Recommendations

- Give every finding a severity, and sort the report from the most severe finding to the least.
- Use one severity scale across all reports.

## Not required for

None listed.

## Rationale

A report without severity values cannot be ranked or acted on. The check tests structure, not judgment. `UU-2b` judges whether the report is structured and ranked well.
