---
id: CMP-1
source: TFX-DS
title: Where a Base UI-based component exists for the need, it is used; one-offs require a waiver
tier: L1
check: hybrid
phase: [plan, implement, verify]
applies_to: [page, component]
verify: "Component usage diffed against the product manifest; evaluator judges 'exists for the need' edge cases; record carries one of the three fixed CMP-1 verdict forms (see controls/cmp-1.md)"
waiver: documented
enforced: partial
script: checks/component-manifest.py
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

Compose UI from the existing Base UI-based component stack (Base UI components,
Radix Colors, shadcn default tokens). When a need arises that no stack component
covers, the first response is a documented waiver or a design-system request — not
a one-off custom implementation.

## Rationale

Hallucinated and duplicate components are the top agent failure mode on this
portfolio. Every custom element an agent invents is an untested surface that deviates
from the token grid, introduces its own accessibility characteristics, and corrodes
cross-product consistency. Consistency is portfolio trust: teachers moving between
Teacher Workspace, CaseSync, and Glow should recognise patterns, not re-learn them.
Unwarranted novelty is flagged as readily as generic output — a custom pattern where
a stack component exists is a finding, not a feature.

## Passes when

- Each interactive or display need is served by a stack component, possibly
  composed with other stack components into a new layout.
- A one-off element carries a recorded `tfx-waive CMP-1` with a named approver and
  a stated reason (e.g. a product-specific pattern awaiting DS promotion).
- Composition — arranging existing components in a layout not used before — is
  present and unremarkable.

## Fails when

- A custom-built element replicates ≥ 90% of an existing stack component's function
  with no waiver.
- A component is copy-pasted and locally modified instead of using the stack
  component and overriding via props or tokens.
- A one-off exists and no `tfx-waive CMP-1` annotation can be found.

## How to verify

Deterministic half — `checks/component-manifest` (planned): diff component usage in
changed files against the product's declared component manifest; surface any element
that resolves outside the stack. Judgment half — the evaluator grades the "exists for
the need" edge cases described below.

## Evaluator guidance

**Flag** (quoting the element and location):

- A custom-built element when a stack component covers ≥ 90% of the need. The
  residual 10% gap belongs in a waiver or a DS request, not a fork. The test is
  functional overlap, not visual match.
- Copy-pasted variants of an existing component — a button with an inlined hover
  colour, a modal with a hand-rolled close gesture.
- Any one-off without a traceable `tfx-waive CMP-1` annotation carrying a named
  approver.

**Do not flag**:

- Composition: arranging existing components in a new layout is not a custom
  component. Wrapping a `<Button>` and a `<Dialog>` into a `<ConfirmRow>` is fine.
- A one-off that carries `tfx-waive CMP-1` with a named approver — the waiver
  process worked; record the waiver is present, do not re-flag the deviation.

**CMP-1 verdict vocabulary.** Any record that lists CMP-1 in scope must carry
**exactly one** of these three fixed forms in its Verify verdict section:

- `CMP-1: verified against .tfx/component-manifest.json (generated: <date>, coverage: <complete|partial>)`
- `CMP-1: asserted, no manifest — manifest absent for <product>`
- `CMP-1: waived — tfx-waive CMP-1 reason="..."`

Zero forms → `audit-record.py` reports an error; two or more forms → error. This is
machine-checkable via `audit-record.py`; a paraphrase fails the check.

**Products with a manifest.** For a product that has adopted `.tfx/component-manifest.json`,
the evaluator uses the "verified against …" verdict form — stating the `generated` date
and `coverage` level — and the three-surrogate fallback is retired for that product:
the manifest is the evidence source. Run `checks/component-manifest.py <manifest.json>`
to validate the manifest; when `coverage: "complete"` the import-diff activates
automatically. When `coverage: "partial"`, the diff stays off and the verdict reads
"verified against partial manifest (generated: `<date>`) — diff not run".

**Absent a manifest.** When no manifest exists for the product, use the "asserted, no manifest"
verdict form and state which of these evidence sources was used: (a) reviewed the product
codebase directly, (b) the agent asserted the component exists and the evaluator accepted the
assertion, or (c) the evaluator applied general knowledge of the Base UI / shadcn
catalog. Label the evidence source so the verdict is auditable. This soft-pass remains
available indefinitely for products that have not yet authored a manifest.

## Waiver

`documented` (L1) — one-offs that pass design-lead review enter the waiver registry
with a named approver. Inline: `<!-- tfx-waive CMP-1 approver="..." reason="..." -->`.
