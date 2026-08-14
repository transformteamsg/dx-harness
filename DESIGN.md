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

One light world with one clear type hierarchy. Inter carries quiet, compact
body and interface text across the site; EB Garamond is reserved for titles and
headings. Departure Mono identifies the harness and marks code, commands, and
measured labels. The landing reads as an illustrated service manual: Radix gray
paper and ink, Radix lime instrumentation, restrained serif headings, and exact
labels. Useful first, kind at the surface; when two good options compete, the
lighter, quieter one wins.
(Decision 2026-08-13: reverses the dark landing in docs/decisions/landing-dark.md.)

## Colour

<!-- Single-line bullets: the design-json generator projects each bullet as one
     key and truncates wrapped lines. -->
- primary action: ink — --primary resolves to --foreground; buttons are black with white labels (--primary-hover lightens on hover); COL-1 standing override, approver rezailmi, 2026-08-13
- link & code accent: --tw-blue #0064FF (links, small code accents, focus ring)
- accent: --dxd-lime #BDEE63 (Radix lime-9) — the harness's own identity, confined to the quartic brand mark and the landing's technical figures; never interactive chrome; COL-1 standing override, approver rezailmi, 2026-08-13
- figure steps: --dxd-lime-ink (Radix lime-11 darkened, ≥4.5:1 on page and wash — strokes, figure labels); --dxd-lime-deep (Radix lime-10 — the nav mark's fill); --dxd-lime-wash / --dxd-lime-line / --dxd-lime-dot (derived tints — fills, construction lines, graph paper)
- functional colour comes from the success/warning/danger tokens
- landing palette: Radix gray steps for paper, ink, rules, and fills; Radix lime steps are its only accent, including links and focus rings

Chrome saturation lives in the TW blue ramp alone (COL-1, COL-2): links,
focus rings, and small code accents — the primary action is ink, not blue
(builder decision 2026-08-13). The lime accent is a
recorded standing override of that one-accent rule
(docs/decisions/landing-lime-figures.md): the brand mark and the landing's
spec-sheet figures draw in the lime steps, and lime never appears on
interactive chrome. Everything else is neutral ink and border steps.
The --demo-slop-* tokens exist only to draw the demo's "before" specimen.

## Typography

- docs display: EB Garamond 400/600 for page titles and headings only
- docs body and interface: Inter Variable 400/500/600, 16px body floor, line-height 1.5–1.6, 45–70ch reading measure; buttons and controls inherit Inter
- landing display: EB Garamond 400/600 for titles and headings only
- landing body and interface: Inter Variable 400/500/600, 16px minimum, line-height 1.45–1.6, 45–70ch reading measure
- mono: Departure Mono 400, 12px floor; brand, code, commands, data, and technical labels only
- site type decision: Inter is intentional for all body/interface text; EB Garamond replaces Plus Jakarta Sans for titles and headings only; Departure Mono is confined to literal technical roles; approver rezailmi, 2026-08-14
- figure annotations: mono, uppercase, tracked — the spec-sheet register of the landing figures (FIG 0.1–0.6) only; a recorded TYP-4 deviation (reason: technical-drawing annotation register), never body or UI text
- figure annotation sizing: ≥12px rendered at the desktop layout; at md and below the labels scale with the figure and render smaller — TYP-2 waiver, approver rezailmi, 2026-08-13 (docs/decisions/landing-lime-figures.md)

Large plain headings do the serif-register work: size and space carry the
hierarchy, not colour or decoration (TYP-1, TYP-4 bind; the figure-annotation
register above is the one recorded deviation).

## Tokens

- source: app/globals.css
- dark-mode: none — one light world; the landing-dark and landing-light scopes are retired

The light :root block is the only world. Code catch-up is tracked on the
design ticket, never hand-edited into this file.

## Motion

- entrance: hero one-time fade-up, --motion-base / --ease-out
- state-change: hover tints, --motion-fast
- brand: the canonical quartic mark is static inside the hero's SVG construction field; the authored drawing carries full meaning without motion
- story: the harness map's staged reveal, --motion-story / --motion-story-step; reduced-motion and no-JS render the complete static map

## Voice & Tone

Second person, active voice, sentence case, plain language, Singapore English.
Empty states and errors say what happened and what to do next.

## Layout system

- columns: 1; landing hero becomes a narrow-reading-column + dominant-figure spread at lg
- minWidth: 320px
- breakpoints: [480, 640, 768, 1024, 1280]
- maxContentWidth: 1200px landing; 1080px docs
- sectionPaddingY: 64px
- sectionPaddingYLarge: 80px

Four of the five are Tailwind's defaults, uncustomised — `sm` 640, `md` 768,
`lg` 1024, `xl` 1280 — because that is what the code actually uses (65 `sm:`,
13 `md:`, 14 `lg:`, 2 `xl:`). Declaring anything else here would describe a
system nobody wrote against.

480 is the one deliberate addition, used only by the standards demo
(`components/compare.tsx`, 8 `min-[480px]:` utilities). It is where the
before/after wipe stops being readable: below it each half is under ~220px and
clips mid-word, so the frame rests fully on the "after" panel instead of
mid-wipe, and the audience rows stop right-anchoring. It is a property of that
one component's content, not of the page grid — which is why it is not a
general step and nothing else may reach for it. If a second component ever
wants it, that is the signal to reconsider rather than to spread it.

`minWidth` is the reflow floor, not a breakpoint: nothing has a media query at
320px, everything simply has to work there (LAY-2). `maxContentWidth` is the
column cap, also not a breakpoint.

Landing: a single column with full-width hairline separators; at `lg`, the hero
becomes a narrow reading column beside a dominant figure. Docs: top nav + left
sidebar + right table of contents — the seed docs shell. Wide content
(tables, code) scrolls in its own container; everything reflows at 320px (LAY-2).

## Components

- primary action: ink fill (--primary → --foreground), white label, ≥44px tall, one per page (CMP-5); async states announce via a polite live region (A11Y-11)
- install panel: --surface panel, hairline border, rounded-lg, mono header; command variants render as tabs on the block when more than one form exists
- spec panel: .spec-panel (app/globals.css) — hairline frame, graph-paper dots, lime corner ticks, rotated mono edge caption; mounts the hero and harness-map figures; feature figures integrate into the four-cell grid below
- hero orchestration flow: components/landing/orchestration-hero.tsx — authored inline SVG using the logo-grid generator's canonical quartic mark, modular and polar grids, ratio field, three specialist paths, inspection, and one reviewed output; visible HTML caption carries its meaning
- feature diagrams: components/landing/feature-cards.tsx — a two-by-two grid of four authored inline SVG drawings for the orchestrator, control catalog, DESIGN.md, and fresh-context review; visuals and copy share one border matrix in the same grid, rule, and quartic construction language
- architecture diagram: components/landing/full-map-diagram.tsx — authored five-stage inline SVG beside a compact ordered explanation; no raster asset or sticky scroll machinery
- SlopCompare (components/compare.tsx): renders both states as short popups over a report queue; the compliant Teacher Workspace specimen uses Inter and fixed --tw-blue-brand steps while the outer landing stays gray/lime
- phase chips / skill chips: mono 12px on --muted, rounded-md
- skill list: <dl> rows separated by hairlines, grouped by moment of need

## Guardrails

- One world: never reintroduce a scoped dark surface without a new decision record.
- A second accent is a system change, not a tweak. The lime figure accent is
  that change, recorded in docs/decisions/landing-lime-figures.md; it never
  spreads to interactive chrome.
- Lead with the machine: the diagram and the demo outrank decorative treatment.
- Never move load-bearing copy into aria-hidden decoration.
- Elevation is hairline borders and surface steps; shadows at most shadow-sm on overlays.
- The demo's slop tokens never appear outside the "before" specimen.
