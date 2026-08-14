# Design decision record — landing comparison report review

- **Date:** 2026-08-14
- **Product:** dx-harness website (landing)
- **Change type:** focused modification
- **Page type:** standards before/after demonstration
- **Approval:** explicit build ask from rezailmi; counted as plan approval

## Sprint contract

1. Preserve the native range-input comparison, keyboard behaviour, panel labels,
   divider, and responsive reveal.
2. Restore the quarantined before panel's original violet/fuchsia AI-slop token
   palette. The landing around it remains Radix grey and lime.
3. Replace the broadcast example with a report-comment review on both sides.
4. The before panel visibly labels its deliberate SLP-1, SLP-2, SLP-4, SLP-5,
   SLP-9, CMP-5, and CNT-2 failures.
5. The after panel demonstrates the quality bar through plain copy, review
   progress, source evidence, a specific comment, and one primary approval action.
6. Change no other landing content or structure.

## Scope addition

After the comparison implementation, rezailmi clarified that the landing body
must continue to use Inter. The landing type contract now reserves EB Garamond
for titles and headings, uses Inter for body and interface copy, and keeps
Departure Mono for technical labels. `DESIGN.md`, the landing scope, and the
emitted direction contract were updated together.

The next review moved both specimens into short popups rendered over a report
queue. The compliant popup is left-aligned, uses Inter throughout, and scopes
its primary action and status treatment to the fixed Teacher Workspace blue.
The before popup keeps the purple anti-specimen treatment. The comparison
slider, copy task, and responsive reveal remain unchanged.

## Intended diff

- `components/compare.tsx` — new report-comment anti-specimen and compliant
  review example; existing slider mechanism preserved.
- `app/globals.css` — remove the landing-only grey override of the existing
  `--demo-slop-*` tokens so the anti-specimen returns to purple; restore Inter
  as the landing body family.
- `DESIGN.md`, `.dx/design.json`, and `app/layout.tsx` — record and project the
  clarified type hierarchy.
- This record — fixed plan and verification evidence.

## Controls in scope

The compliant surface is held to A11Y-1, A11Y-2, A11Y-5, A11Y-7, A11Y-8,
TOK-1, TOK-2, TOK-3, TYP-2, TYP-5, CMP-5, SLP-1 through SLP-9, CNT-2, and
LAY-2. The before panel is a quarantined anti-specimen: the existing inline
waivers name each deliberate failure. No async or destructive operation exists,
so CMP-2 and CMP-3 are not applicable.

## Verification

- **Final popup evidence:**
  `review/evidence/landing-comparison-2026-08-14/1280-popup-comparison.png`,
  `1280-popup-before.png`, and `360-popup-comparison.png`. The earlier
  `768-comparison.png` verifies the comparison shell at the intermediate width;
  a final 768px popup capture was blocked by the local browser sandbox after
  the browser automation approval limit was reached.
- **Layout:** rendered viewport and document widths match at 360 and 1280 CSS
  px with zero horizontal overflow. The divider rests at 38% on the wide view
  and at 0% on the narrow view, where the compliant popup remains fully
  readable without an internal scroll region.
- **Typography and colour:** the implementation applies `font-body` throughout
  both specimens and the fixed `--tw-blue-brand` token to the compliant status
  and primary action. The final screenshots verify the rendered treatment; an
  additional computed-style probe was unavailable after the browser automation
  approval limit was reached.
- **Slider semantics:** the native range input starts at `62% on standard` on
  wider views and `100% on standard` at 360px. An ArrowRight keyboard step
  updates its value from 38 to 39 and `aria-valuetext` from 62% to 61%.
- **Deterministic controls:** `pnpm run check:python`, focused token audit,
  accessibility scan, type scan, content lint, and contrast scan all pass.
- **Repo gates:** `pnpm run typecheck`, `pnpm run test` (71/71), and
  `pnpm run build` pass. ESLint reports 0 errors and 16 warnings in inherited
  evaluation/config files; none are in the changed surface.
- **Async evidence:** N/A — this comparison has no async state.
- **Dark mode:** N/A — the product declares one light world.
- **Independent design review:** not dispatched in this session because the
  active repository instructions require subagent work to run sequentially in
  the main thread. Mechanical and rendered evidence are complete; the formal
  fresh-context reviewer gate remains pending.
