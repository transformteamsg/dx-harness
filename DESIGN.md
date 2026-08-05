---
name: dx-harness website
description: Print-flat dark landing world (Hex×Grafana direction) over a light, calm docs shell — one repo, two deliberately separate surfaces.
colors:
  canvas: "#101012"
  canvas-raised: "#17171a"
  canvas-ink: "#fafafa"
  canvas-muted: "#a6a6ad"
  canvas-line: "#26262b"
  canvas-line-soft: "#1c1c20"
  tape-pink: "#f572da"
  tape-yellow: "#f7c948"
  tape-green: "#8fd94d"
  tape-blue: "#6cb8f5"
  tape-orange: "#f5863d"
  tape-ink: "#131316"
  docs-background: "#fafafa"
  docs-foreground: "#18181b"
  tw-blue: "#0064ff"
typography:
  display:
    fontFamily: "Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(3.75rem, 8vw, 8rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  heading:
    fontFamily: "Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter Variable, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "12px"
    letterSpacing: "0.08em"
spacing:
  cell: "72px"
  section: "144px"
rounded:
  none: "0px"
  docs: "8px"
components:
  button-primary:
    backgroundColor: "{colors.canvas-ink}"
    textColor: "{colors.tape-ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.none}"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.tape-yellow}"
  tape-chip:
    backgroundColor: "{colors.tape-pink}"
    textColor: "{colors.tape-ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
  terminal-block:
    backgroundColor: "{colors.canvas-raised}"
    textColor: "{colors.canvas-ink}"
    rounded: "{rounded.none}"
---

## Overview

The repo hosts two surfaces with deliberately separate visual worlds:

- **Landing** (`app/(landing)/`): the marketing surface for the dx-harness
  plugin. A print-flat spec sheet on a near-black ruled canvas — oversized
  extrabold display type crossed by flat vivid "tape" strips carrying mono
  phase labels. Pinned direction: Hex's Grafana identity work. No gradients,
  no glows, no cards, no shadows; hierarchy comes from scale, weight, and the
  five tape colours.
- **Docs** (`app/(docs)/`): the TFX Design Standard rendering — light, calm,
  sidebar-navigated, governed by the incumbent token set in `app/globals.css`
  (`--background`, `--foreground`, section inks, shadcn compatibility layer).
  This file's frontmatter records the landing world; the docs world's
  normative source stays `app/globals.css` and the standard itself.

Everything on both surfaces must pass the repo's own control catalog
(`plugins/dx-harness/standards/catalog.yaml`) — the prebuild gates enforce it.

## Colors

Landing colour strategy: **full palette on a dark ground**. The canvas trio
(`canvas`, `canvas-raised`, `canvas-line`) is the surface; the five tape
colours are the only saturation and each is bound to a loop phase — pink =
intent, yellow = diverge, green = plan gate, blue = implement, orange =
verify. Tape colours always render as flat fills with `tape-ink` text (AA at
12px mono). `canvas-muted` is the only secondary ink on canvas (7:1). Never
mix docs tokens onto the landing or tape tokens into docs.

## Typography

Three voices, all bound by the catalog (TYP-1): Plus Jakarta Sans for display
(800 on the h1, 700 on section headings, tracking −0.03em to −0.01em), Inter
for body (1.5–1.6 line-height, ≤58ch measure), and the sanctioned mono
(`--font-mono`) for code, commands, tape labels, and skill names — 12px floor,
+0.08em tracking, sentence case (TYP-4 bans all-caps; the reference's caps
were deliberately traded away).

## Layout

The landing is ruled by a 72px grid drawn from `--canvas-line-soft`; the grid
is a drawing surface, not wallpaper — section paddings sit on the rule
(72/144px) and the hero tape strips register to it (top 72/144/216px inside
the hero block). Content column is `max-w-[1200px]`; single column throughout;
lists and description lists, never card grids (SLP-5/11). Tape strips are
finite, staggered, full-bleed-clipped bands that physically cross the display
type — never "near" it. At `max-sm` the third strip drops and the second
crosses the headline mid-line.

## Elevation & Depth

None on the landing: flat fills and 1px `canvas-line` hairlines only. The
docs surface keeps its own hairline-border convention. No shadows, no glass,
no glow anywhere.

## Shapes

Landing chrome is square-cornered (radius 0) — buttons, chips, terminal
block. Docs keep the incumbent `--radius: 0.5rem` family. The wordmark glyph
is five 6px squares in a quincunx on a 3×3 grid — one square per loop phase
(pure geometry, not an icon).

## Components

- **Primary action** (one per page, CMP-5): white fill, `tape-ink` mono
  label, ≥44px tall, hover flips to `tape-yellow`. The landing's only primary
  is "Copy commands"; its async states (copied / failed) announce via a
  polite live region, never a focus move (A11Y-11).
- **Tape strip**: decorative `aria-hidden` band, mono 12px on a tape fill,
  content repeated to overflow; entrance is the page's single authored motion
  (600ms ease-out slide, removed under reduced motion).
- **Tape chip**: the phase label unit in lists — same anatomy as a strip,
  `w-fit`.
- **Terminal block**: `canvas-raised` panel, hairline border, mono 14px at
  1.6, header row with a mono label and the primary action.
- **Skill list**: `<dl>` rows separated by hairlines; 10px tape-coloured
  square markers for the design set, outlined muted squares for the quieter
  engineering set.

## Do's and Don'ts

- Do keep the landing's saturation exclusively in the five tape colours;
  a sixth accent is a system change, not a tweak.
- Do register new landing elements to the 72px rule.
- Don't reintroduce caps, gradients, glows, cards, or shadows on the landing;
  don't soften the tape-over-headline overlap.
- Don't let the two worlds bleed: docs tokens stay out of `app/(landing)/`,
  canvas/tape tokens stay out of `app/(docs)/`.
- The catalog outranks this file: where a control and this prose disagree,
  the control wins and this file gets corrected.
