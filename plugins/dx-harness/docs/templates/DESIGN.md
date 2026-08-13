<!--
DESIGN.md - a product's design language. Human-approved, written and revised by the
dx-design-language skill; lives at the product repo root.
Regenerate the typed projection after every edit:
    python3 <harness>/scripts/generate-design-json.py .
Rules (full spec: the harness's docs/DESIGN-CONTEXT.md):
  - The Control Catalogue is always the rulebook. Never restate a control here: cite
    ids and state this product's own decisions.
  - Delete any section that does not differ from the portfolio default (absent =
    portfolio default; a repo with no DESIGN.md at all is a valid state).
  - `- key: value` bullets become machine-readable json; prose stays prose; a section
    with both keeps both.
  - Precedence: the catalogue governs portfolio rules; code governs implemented
    primitives; DESIGN.md carries this product's decisions and deviations.
Filled below with Teacher Workspace examples. Replace the values with your product's,
or delete the section if this product matches the portfolio default.
-->

# DESIGN.md - Teacher Workspace

## Essence
<!-- One or two sentences: what this product should feel like, and which instinct
     wins when two good options compete. -->
Kind Utility: useful first, kind at the surface. Calm tools for busy teachers,
never playful at the cost of clarity. When unsure, choose the quieter option.

## Colour
<!-- Cites: COL-1, COL-2. Values only. -->
- primary: --tw-blue #0064FF
- accent: none; functional colour comes from the Radix scales

## Typography
<!-- Cites: TYP controls. -->
- family: Inter, a single family; weight does the hierarchy work
- base: 16/24
- scale: 12, 14, 16, 20, 24, 32
- numerals: tabular in tables and anywhere marks appear

## Tokens
<!-- Pointers into the code; the code is the authority. Cites: TOK controls. -->
- source: src/styles/tokens.css
- prefix: --tw-
- spacing: space-1 to space-12 (4px base)
- dark-mode: class strategy, `.dark` on <html>

## Motion
<!-- Signature moves only; MOT/SLP/A11Y controls bind unstated. -->
- entrance: fade + 4px rise, 160ms, standard ease-out
- state-change: cross-fade, 120ms

## Voice & Tone
<!-- Cites: content skill §6. This product's weighting only. -->
Neutral, steady, quietly confident. Second person, plain language, Singapore
English. Empty states teach: one plain sentence about what goes here, then the
primary action.

## Layout system
<!-- Cites: LAY-1. Machine-read by the checks; keep the bullets exact. -->
- columns: 12
- gutter: space-4
- margins: space-6
- breakpoints: [360, 768, 1280]
- maxContentWidth: 1280px

## Components
<!-- Cites: CMP-1 (manifest), CMP-7 (defaults). Product decisions only. -->
- manifest: .dx/component-manifest.json
- buttons: solid primary, ghost secondary; never two solid side by side
- AvatarFallback: initials on neutral-3, never a coloured tint

## Guardrails
<!-- Product-specific instructions an agent obeys verbatim: the realities no
     catalogue control covers because they are THIS product's own. Ten bullets max.
     Never restate a control here. -->
- Check the component manifest before building anything new.
- Marks and attendance figures are load-bearing: never truncate, round, or animate them.
- Every flow must survive a 30-second interruption; teachers work between classes.

## Overrides
<!-- Standing, product-level deviations from the Control Catalogue. Starts empty:
     a deviation earns its place through the waiver promotion flow, or is
     volunteered. Format, one line per override:
       - <CONTROL-ID> (<tier>): <adjusted rule> - reason: <why>[; approver: <name>]
     L0: never allowed (the generator rejects the line). L1: approver required.
     L2: reason required. One line per control id; duplicates are rejected.
     The design reviewer grades against the adjusted rule within its stated scope;
     the deterministic checks cannot judge scope, so they keep findings on an
     overridden control visible and blocking, annotated for a manual check against
     the adjusted rule. Anything not listed binds as written. -->
