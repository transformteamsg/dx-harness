# Design decision record — landing feature grid

- **Date:** 2026-08-14
- **Product:** dx-harness website (landing)
- **Change type:** focused modification
- **Page type:** marketing feature section
- **Approval:** explicit build ask from rezailmi; counted as plan approval

## Sprint contract

1. Replace the three horizontal feature rows with a two-by-two grid of four
   substantial feature objects, following the composition of the supplied
   Linear Coding Sessions references without copying their dark theme.
2. Keep each cell left-aligned: one authored visual above one concise claim and
   its supporting copy. Avoid oversized headings.
3. Preserve the existing orchestrator, catalog, and DESIGN.md claims and add one
   grounded capability already promised elsewhere on the page: independent,
   fresh-context design review.
4. Keep the landing's light manual palette, Inter body copy, EB Garamond
   headings, Departure Mono annotations, and lime figure instrumentation.
5. Reflow to one column without horizontal overflow at 320 and 360 CSS px.

## Controls in scope

LAY-2, LAY-5, LAY-6, LAY-7, TOK-1 through TOK-3, TYP-1 through TYP-5,
A11Y-1, A11Y-5, A11Y-7, SLP-5, SLP-6, SLP-9, and SLP-11. No new
interactive or async state is introduced.

## Tradeoffs

The four-cell matrix is denser than the previous full-width rows, so the claims
step down from 3xl to 2xl and supporting copy from lg to the body scale. This
keeps the section scannable while giving each authored visual enough room.
The new review figure takes FIG 0.5; the harness map moves to FIG 0.6.

## Verification

- **Responsive evidence:**
  `review/evidence/landing-comparison-2026-08-14/1280-feature-grid.png`,
  `768-feature-grid.png`, and `360-feature-grid.png`.
- **Layout:** four feature cells render as a two-by-two matrix at 1280 and
  768 CSS px, then reflow to one column at 360px. Measured horizontal overflow
  is zero at all three widths.
- **Content:** the existing orchestrator, control-catalog, and DESIGN.md claims
  remain; the fourth cell adds the promised fresh-context review capability.
- **Deterministic controls:** `pnpm run check:python`, focused token,
  accessibility, type, content, and contrast checks pass.
- **Repo gates:** `pnpm run typecheck`, `pnpm run test` (71/71), and
  `pnpm run build` pass. ESLint reports 0 errors and 16 warnings in inherited
  evaluation/config files; none are in the changed surface.
- **Async evidence:** N/A — the feature grid introduces no async state.
- **Dark mode:** N/A — the product declares one light world.
- **Independent design review:** not dispatched in this session because the
  active repository instructions require subagent work to run sequentially in
  the main thread. Mechanical and rendered evidence are complete; the formal
  fresh-context reviewer gate remains pending.
