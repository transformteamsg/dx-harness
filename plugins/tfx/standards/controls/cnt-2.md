---
id: CNT-2
source: TFX-DS
title: Feature and page names use plain language; no invented portmanteaus, no internal codenames in UI
tier: L1
check: judgment
phase: [intent, plan, verify]
applies_to: [content]
verify: "Evaluator: would a teacher understand the name without explanation? Portmanteaus and codenames are findings"
waiver: documented
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Name features, pages, and labels in plain language teachers already use. Name by
function, not metaphor. A name that requires explanation has already failed.

## Rationale

Every feature, page, and label is a brand touchpoint. Teachers navigate dozens of
platforms; a clever name is one more thing to decode between classes. This control
applies at *intent and plan time* — the cheapest moment to catch a bad name is before
it spreads into navigation, copy, and training material.

## Evaluator guidance

Flag, quoting the name:

- Invented portmanteaus: "SyncFlow", "InsightHub", "EduConnect".
- Internal codenames or project names leaking into UI.
- Technical jargon or unexplained acronyms in navigation or page titles.
- Metaphor over function: "Compass" for a settings page.
- Cleverness that needs a tooltip to explain.

Good names name the job: "Class Planner", "Student Notes", "Mark Attendance".

Do not flag: product names that passed the identity rule (Teacher Workspace,
CaseSync, Glow — these are settled identities), or terms teachers genuinely use
even when they look like jargon to outsiders (e.g. "CCE", "Form Class").

## Waiver

`documented` — a name that fails the plain-language test but is retained needs a
named approver and the reason in the decision record (e.g. a ministry-mandated
programme name that must appear verbatim).
