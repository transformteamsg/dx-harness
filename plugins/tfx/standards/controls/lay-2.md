---
id: LAY-2
source: TFX-DS
title: Layout reflows to a single column with no loss at 320 CSS px (WCAG 2.2 SC 1.4.10); reading order and controls hold at 360/768/1280
tier: L1
check: judgment
phase: [verify]
applies_to: [page]
verify: "Evaluator confirms single-column reflow with no two-dimensional scrolling at 320 CSS px (= 1280 at 400% zoom) and a usable reading order at each captured width"
waiver: documented
refs:
  - https://www.w3.org/WAI/WCAG21/Understanding/reflow.html
---

## Requirement

Content must reflow to a single column at 320 CSS px with no two-dimensional (horizontal
+ vertical) scrolling. 320 CSS px is the canonical WCAG reflow target, equivalent to a
1280 px viewport viewed at 400% browser zoom. Reading order and all primary controls must
remain intact and unambiguous at this width and at the three harness capture widths
(360/768/1280 px).

## Rationale

Low-vision users routinely zoom to 400%. The 360 px captures the harness takes by default
do not prove the 320 px target — a layout that survives 360 may still produce horizontal
scroll or lose controls at 320. Enforcing WCAG 2.2 SC 1.4.10 (Reflow, Level AA) here makes
the standard explicit and graded.

**WCAG exemption**: content that requires two-dimensional layout for its use or meaning —
data tables, maps, diagrams, complex spreadsheet-style views — is exempt from the reflow
requirement. The exemption is narrow; use it only for genuinely 2-D content, not for layouts
that could reflow with effort.

## How to verify

The evaluator resizes the browser viewport to 320 px width (or zooms a 1280 px viewport to
400%) and walks the layout:

1. Does the content reflow to a single column? (No horizontal scroll on the page body.)
2. Are all primary controls and interactive elements still reachable?
3. Does the reading order make sense at 320 px (no content crossing or reversing)?
4. Repeat the reading-order check at 360 px and 768 px from the harness captures.

A reflow scan tool (`checks/layout-reflow`) is future work. Until built: verify manually
and label findings "verified manually."

## Evaluator guidance

**Flag**:
- Horizontal scrollbar on the page body at 320 px (not inside a data table).
- A primary action (submit, save, navigation) that becomes unreachable or hidden at 320 px.
- Reading order that reverses or becomes ambiguous (e.g. a two-column layout whose columns
  collapse in the wrong order).

**Do not flag**:
- Data tables, maps, or diagrams that scroll horizontally — the WCAG 2-D exemption applies.
- Truncated long strings that are recoverable (tooltip, expand, scroll within a bounded box).
- The harness's 360 captures: they do not prove or disprove the 320 target — note the gap
  and flag if the 320 test is not run.
