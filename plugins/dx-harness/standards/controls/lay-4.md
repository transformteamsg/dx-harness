---
id: LAY-4
source: DX-DS
title: "Body-text columns cap at a comfortable measure — target ~66ch, never above 80ch (WCAG 1.4.8); full-bleed running text is a finding"
tier: L2
check: hybrid
phase: [implement, verify]
applies_to: [page, component]
verify: "Prose/body containers carry a max-width and the measure is <= 80ch (target ~66ch); checks/type-scan measure rule (built in #161) judges ch caps already present, and the evaluator judges the rendered measure"
waiver: rationale
refs:
  - https://www.w3.org/TR/WCAG21/#visual-presentation
---

## Requirement

Prose and body-text containers must carry an explicit `max-width`. The line measure must
not exceed 80ch (characters). The target is approximately 66ch, grounded in Baymard
Institute research (comfortable range: 50–75 characters per line). Full-bleed running
text — body copy that spans the full viewport width at 1280 px — is always a finding.

This is a *layout* property, complementary to typography (TYP-1..3). A correctly typed
body that runs full-bleed still violates LAY-4.

## Rationale

Long line measures increase return-sweep errors and fatigue readers — critical for
teachers reading detailed student records or lengthy reports. WCAG SC 1.4.8 (Visual
Presentation, Level AAA) recommends ≤80 characters; the harness adopts this ceiling as
a strong default (L2) because it is straightforwardly checkable and because Baymard's
research grounds the 66ch target in empirical reading data.

**Product anchor**: `app/globals.css` in the DX-DS website sets `.prose { max-width: 70ch }`,
which is within the target range and shows the intent is already operationalised.

## How to verify

**Deterministic half** — the `checks/type-scan.py` measure rule, built in #161. It judges
`ch` caps that are already present against the 80ch ceiling; it never flags a missing cap,
because a container with no declared cap may still render inside the ceiling.

Until it ships: inspect prose containers in the component source, check for a `max-width`
rule, and estimate the rendered measure at 1280 px. Label findings "verified manually."

**Judgment half** — the evaluator:

- Confirms that body-text passages are not full-bleed at 1280 px.
- Flags containers where the rendered measure visibly exceeds 80ch.

## Evaluator guidance

**Flag**:
- Body text that spans the full viewport width at 1280 px (no `max-width`, or
  `max-width: 100%` / `max-width: none` on a prose container).
- Any `max-width` on a prose container that exceeds 80ch in the rendered output.

**Do not flag**:
- Short UI labels, captions, error messages, data-table cells, or button text.
- Full-width layout containers that are structural (grid wrappers, section backgrounds) —
  only flag the inner prose container if it lacks a measure constraint.
- Deliberately wide non-text elements (images, data visualisations, code blocks) that
  are not running prose.
- A 70–80ch measure that is within the acceptable ceiling even if above the 66ch ideal.
