---
id: CMP-9
source: TFX-DS
title: Content authored by one user and rendered to another is sanitised at the render boundary; author-time schema constraints are not sufficient
tier: L1
check: hybrid
phase: [implement, verify]
applies_to: [component, flow]
verify: "Deterministic: grep detector (planned) finds dangerouslySetInnerHTML/v-html on any surface rendering another user's authored content, and checks whether a sanitiser call sits in the render path. Judgment: evaluator reads the render boundary and confirms sanitisation holds there, not only at author/editor time; a mock-data prototype deferral is acceptable only if explicitly flagged in the decision record"
waiver: documented
fails_when:
  - dangerouslySetInnerHTML/v-html renders another user's authored content with no sanitiser in the render path
  - sanitisation is claimed at editor time only ("schema-constrained output") with nothing enforced at render
  - a prototype defers sanitisation with no recorded flag noting the deferral
refs:
  - https://moediva.notion.site/Tfx-design-standard-draft-37b970a387f2800e930ce0ee646c6cfb
---

## Requirement

When content authored by one user is rendered to a different user, the HTML must be
sanitised (e.g. an allowlist sanitiser such as DOMPurify) before render. The guarantee
must hold at the render boundary — the point where the content actually reaches the
other user's screen — not only at author time. An editor's output being
"schema-constrained" when it was written is not sufficient on its own; a schema
constraint can drift, be bypassed, or simply not cover every field that later gets
rendered raw.

## Rationale

No control covered untrusted-HTML rendering across a trust boundary before this one.
The triggering evidence: teacher-authored rich-text comments rendered to parents via
`dangerouslySetInnerHTML` (`src/components/reports/report-preview.tsx` in the consumer
repo), labelled in-code "schema-constrained Tiptap output (prototype)" — a claim made
at author time, with nothing enforcing it at the render boundary where it actually
matters. The same pattern was also noted for an announcements composer. This surfaced
as an UNCOVERED finding across two separate evaluator passes: a ship-blocking security
gap the catalog was silent on, not a style preference.

## Passes when

- Content authored by one user and rendered to a different user passes through an
  allowlist sanitiser immediately before render.
- The sanitisation guarantee is enforced at the render boundary, not asserted only from
  the editor's schema constraints.
- A mock-data prototype defers sanitisation only with an explicit, recorded flag noting
  the deferral and that it must be resolved before any real-user-content ship.

## Fails when

- `dangerouslySetInnerHTML` or `v-html` renders another user's authored content with no
  sanitiser call anywhere in the render path.
- Sanitisation is claimed only at editor/author time ("schema-constrained output") with
  nothing enforced at render.
- A prototype defers sanitisation with no recorded flag — silent deferral, not a
  documented one.

## Evaluator guidance

Two halves, one hybrid check:

1. **Deterministic sub-check** (grep detector planned, not built this round — manual
   until it exists): search the changed surface for `dangerouslySetInnerHTML` / `v-html`
   or equivalent, and identify whether the content it renders originates from a
   *different* user than the one viewing it. If so, confirm a sanitiser call sits in
   the render path (not merely at the editor).
2. **Judgment sub-check**: read the render boundary directly — the component or
   function that actually outputs HTML to the screen — and confirm the sanitisation
   guarantee holds there. An in-code comment claiming "schema-constrained" is not
   evidence of render-time sanitisation; find the actual sanitiser call, or the
   finding stands.

Cite the specific file and render call in every finding, per this catalog's evidence
requirement.

## Do not flag

- Content authored and rendered back to the *same* user — no trust boundary is
  crossed, so this control does not apply.
- A mock-data prototype whose sanitisation deferral is explicitly flagged in the
  decision record — the flag is the control working as intended.
- Sanitisation implemented via a render-time allowlist regardless of which library
  performs it (DOMPurify is the named example, not a requirement to use that specific
  library).
