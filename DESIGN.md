<!--
DESIGN.md — the dx-harness website's design language. Human-approved; revised by
the dx-design-language skill. Regenerate the typed projection after every edit:
    python3 <harness>/scripts/generate-design-json.py .
The Control Catalogue is the rulebook: this file cites ids and carries this
product's own decisions. Where a control and this prose disagree, the control
wins and this file gets corrected.
-->

# DESIGN.md — dx-harness website

## Essence

One light world. The landing and the docs share the same calm documentation
register — near-monochrome, generous whitespace, hairline borders — with
seed-design.io's docs pages as the reference register. Useful first, kind at
the surface; when two good options compete, the lighter, quieter one wins.
(Decision 2026-08-13: reverses the dark landing in docs/decisions/landing-dark.md.)

## Colour

- primary: --tw-blue #0064FF
- accent: none; functional colour comes from the success/warning/danger tokens

Chrome saturation lives in the TW blue ramp alone (COL-1, COL-2): the primary
action, links, focus rings, and small code accents. Everything else is neutral
ink and border steps. The quincunx brand mark stays the one polychrome element.
The --demo-slop-* tokens exist only to draw the demo's "before" specimen.

## Typography

- display: Plus Jakarta Sans Variable 600, clamp(2.25rem, 5vw, 3.75rem), -0.01em
- heading: Plus Jakarta Sans Variable 600, clamp(1.5rem, 3vw, 1.875rem), -0.01em
- body: Inter Variable, 16px, line-height 1.5–1.6, ≤62ch measure
- mono: --font-mono, 12px floor, +0.08em tracking, sentence case

Large plain headings do the seed-register work: size and space carry the
hierarchy, not colour or decoration (TYP-1, TYP-4 bind).

## Tokens

- source: app/globals.css
- dark-mode: none — one light world; the landing-dark and landing-light scopes are retired

The light :root block is the only world. Code catch-up is tracked on the
design ticket, never hand-edited into this file.

## Motion

- entrance: hero one-time fade-up, --motion-base / --ease-out
- state-change: hover tints, --motion-fast

## Voice & Tone

Second person, active voice, sentence case, plain language, Singapore English.
Empty states and errors say what happened and what to do next.

## Layout system

- columns: 1
- minWidth: 320px
- breakpoints: [640, 768, 1024, 1280]
- maxContentWidth: 1080px
- sectionPaddingY: 64px
- sectionPaddingYLarge: 80px

The breakpoints are Tailwind's defaults, uncustomised — `sm` 640, `md` 768,
`lg` 1024, `xl` 1280 — because that is what the code actually uses (65 `sm:`,
13 `md:`, 14 `lg:`, 2 `xl:`). Declaring anything else here would describe a
system nobody wrote against. `minWidth` is the reflow floor, not a breakpoint:
nothing has a media query at 320px, everything simply has to work there
(LAY-2). `maxContentWidth` is the column cap, also not a breakpoint.

Landing: a single column with full-width hairline separators. Docs: top nav +
left sidebar + right table of contents — the seed docs shell. Wide content
(tables, code) scrolls in its own container; everything reflows at 320px (LAY-2).

## Components

- primary action: TW-blue fill, white label, ≥44px tall, one per page (CMP-5); the landing's is "Copy commands"; async states announce via a polite live region (A11Y-11)
- install panel: --surface panel, hairline border, rounded-lg, mono header; command variants render as tabs on the block when more than one form exists
- architecture diagram: components/landing/full-map-diagram.tsx — static, token-drawn, real text; connectors aria-hidden; planned nodes dashed with a visible legend (CNT-4); nothing moves (MOT-3)
- SlopCompare (components/compare.tsx): renders in the light world with the page
- phase chips / skill chips: mono 12px on --muted, rounded-md
- skill list: <dl> rows separated by hairlines, grouped by moment of need

## Guardrails

- One world: never reintroduce a scoped dark surface without a new decision record.
- A second accent is a system change, not a tweak.
- Lead with the machine: the diagram and the demo outrank decorative treatment.
- Never move load-bearing copy into aria-hidden decoration.
- Elevation is hairline borders and surface steps; shadows at most shadow-sm on overlays.
- The demo's slop tokens never appear outside the "before" specimen.
