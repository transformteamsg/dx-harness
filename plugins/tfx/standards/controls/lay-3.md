---
id: LAY-3
source: TFX-DS
title: A surface maps to a known page template (workspace view, form, flow step, dashboard, settings, empty state, onboarding) rather than an ad-hoc shell
tier: L2
check: judgment
phase: [plan, verify]
applies_to: [page]
verify: "Evaluator matches the surface to its declared page type (Phase 1) and flags a bespoke shell where a known template applies"
waiver: rationale
fails_when:
  - a surface invents a bespoke shell structure when an existing template applies
  - information hierarchy does not match the declared page type
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Build a surface as the page template its type implies, not as a fresh shell each time.
The Phase 1 contract already declares the page type — workspace view, form, flow step,
dashboard, settings, empty state, onboarding. Each carries a familiar shell (where the
title sits, where the primary action lives, how the body is organised). Adopt it.
Invent structure only when no template fits, and say so.

## Rationale

Teachers move between Teacher Workspace, CaseSync, and Glow all day; templates are what
let them carry muscle memory across surfaces (HIG: Familiarity). A settings page that
puts its save button somewhere new, or a form laid out like a dashboard, makes the
teacher re-learn the surface before they can use it — the opposite of Kind Utility. The
page type is decided in Phase 1; LAY-3 holds the build to it so the declared type is a
promise, not a label.

## Passes when

- A settings surface uses the settings template — grouped sections, labels left, a
  consistent save affordance — like every other settings surface in the product.
- An empty state uses the empty-state template (heading + subtext + single CTA), not a
  half-built list shell.
- A form follows the form template: fields top to bottom, labels above, one primary
  submit (CMP-5), errors inline (CNT-1).
- A genuinely novel surface with no matching template introduces structure
  deliberately, and the plan notes why no template applied.

## Fails when

- A dashboard-style grid used for what the contract calls a form.
- A bespoke shell invented for a settings page when the settings template already
  exists in the product.
- Information hierarchy that contradicts the declared page type — a flow step that
  reads like a dashboard, burying the one next action.

## How to verify

**Judgment.** The evaluator reads the Phase 1 declared page type and checks the built
surface against it: does the structure match the template that type implies, or did it
re-invent the shell? There is no static check — IA-template matching is a judgment read
of the screenshots plus the plan.

## Evaluator guidance

**Flag:** a surface whose structure does not match its declared page type; a bespoke
shell where a known template clearly applies; a hierarchy that fights the page type.

**Do not flag:**

- A surface that legitimately has no matching template and says so in the plan —
  novelty with a stated reason is not a violation.
- Per-product nuance within a template (Glow's and TW's settings can differ in accent
  and tone; the *template* is shared, the skin is not).

**Deconfliction.** LAY-3 is the positive statement; SLP-10 is the specific anti-pattern
(a multi-section task must be a page, not a modal). A11Y-7 is HTML-element semantics —
a page can pass A11Y-7 (correct headings/lists) yet fail LAY-3 (wrong IA template).
This is L2: a reasoned deviation takes an inline `tfx-waive LAY-3 reason="…"`.
