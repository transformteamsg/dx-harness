---
name: dx-harness website
description: Two deliberate worlds — a dark Linear-register landing and light, calm docs — sharing one token vocabulary, with TW blue as the single accent in both.
colors:
  landing-background: "#0a0a0c"
  landing-surface: "#131316"
  landing-foreground: "#f4f4f5"
  landing-muted-foreground: "#a7a7b0"
  landing-border: "#26262c"
  tw-blue: "#0064ff"
  tw-blue-text-dark: "#6ea3ff"
  docs-background: "#fafafa"
  docs-surface: "#ffffff"
  docs-foreground: "#18181b"
typography:
  display:
    fontFamily: "Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 600
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "Plus Jakarta Sans Variable, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 600
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
  section-y: "64px"
  section-y-lg: "80px"
rounded:
  panel: "0.5rem"
components:
  button-primary:
    backgroundColor: "{colors.tw-blue}"
    textColor: "#ffffff"
    rounded: "6px"
    height: "44px"
  diagram-node:
    border: "1px solid {colors.landing-border}"
    rounded: "{rounded.panel}"
    background: "none (panel surface) or --muted one step up"
---

## Overview

The repo hosts two surfaces that share one token **vocabulary** but two visual
**worlds** (decision: `docs/decisions/landing-dark.md`, 2026-08-11):

- **Landing** (`app/(landing)/`): dark, Linear-register marketing surface for
  the dx-harness plugin. The `landing-dark` scope in `app/globals.css` flips
  only the semantic tokens (`--background`, `--surface`, inks, borders) on the
  landing shell; component code stays token-only (TOK-1). Storyline: hook +
  install → how it works (the architecture diagram) → before/after demo →
  grouped skills → No-CLI close.
- **Docs** (`app/(docs)/`): the TFX Design Standard rendering, unchanged in
  the light `:root` world (docs.stripe.com register). The landing→docs
  transition is a deliberate dark→light jump, recorded as a tradeoff.

Everything on both surfaces must pass the repo's own control catalog
(`plugins/dx-harness/standards/catalog.yaml`) — the prebuild gates enforce it.

## Colors

Single-accent strategy in both worlds: TW blue is the only saturation in page
chrome. On dark, the raw brand blue is **fill-only** (button, focus outlines —
about 3.5:1, non-text); text and links use `--tw-blue-text` (#6ea3ff), a
lighter step of the same ramp that clears AA on near-black (COL-1 "or its
ramp"). SLP-1 binds hard on dark: no purple/violet, no cyan-on-dark theming,
no glow shadows — elevation is surface steps and hairline borders. The
quincunx brand mark stays the one polychrome element. The `--demo-slop-*`
tokens exist only to draw the demo's "before" specimen.

The before/after demo renders in the dark world with the rest of the landing
(user decision 2026-08-12, reversing the earlier pinned-light call): the
`landing-dark` scope carries dark functional text steps (`--success`
`#71d083`, `--danger` `#ff9592` — ≥8:1 on their subtle tints) and a dark
anti-specimen ink pair (`--demo-slop-surface` `#1c1728`, `--demo-slop-ink`
`#c4b5fd` ≈ 9.5:1). The `landing-light` scope remains available for any
future surface that must depict the light product.

## Typography

Three voices, all bound by the catalog (TYP-1, weights 400/500/600 only):
Plus Jakarta Sans 600 for display and headings (tracking −0.01em,
`text-wrap: balance`), Inter for body (1.5–1.6 line-height, ≤62ch measure),
and the sanctioned mono (`--font-mono`) for code, commands, phase badges,
diagram node names, and skill names — 12px floor, +0.08em tracking, sentence
case (TYP-4 bans all-caps).

## Layout

Content column is `max-w-[1080px]`; single column throughout; lists and
description lists, never identical card grids (SLP-5/11). Section rhythm is
64–80px vertical padding with full-width hairline separators. The hero stacks
hook → install; the architecture diagram is the second section's full panel;
everything reflows cleanly at 320px (LAY-2).

## The architecture diagram

`components/landing/harness-diagram.tsx` — the "how it works" asset. Static,
token-drawn, semantic HTML (real text, no image): You → `dx-design`
orchestrator (six phase chips from `components/diagrams/loop-data.ts`, the
contract-of-record) → dispatched skill chips; a dashed
"planned" treatment for unshipped nodes with a visible legend (CNT-4); the
context band (Control catalog L0/L1/L2, abstract↔deterministic spectrum →
primitives → DESIGN.md). Connector lines and arrowheads are `aria-hidden`
decoration; labels are real text. Boxes are diagram notation, not cards
(SLP-11). Nothing moves (MOT-3).

## Elevation & depth

On dark: no shadows, no glows — separation is hairline `--border` and the
surface/muted step. One `shadow-sm` remains on the demo's light frame chrome
where it reads as part of the depicted product.

## Motion

Two authored moments only, both reduced-motion-safe (A11Y-5): the hero's
one-time fade-up (`hero-enter`, `--motion-base`/`--ease-out`) and the demo's
one-time divider nudge (62→50). Everything else is `--motion-fast` hover
tints. Values come from the motion tokens (MOT-2); interface motion ≤300ms
(MOT-1).

## Components

- **Primary action** (one per page, CMP-5): TW-blue fill, white label
  (pinned via `--primary-foreground` in the dark scope), ≥44px tall. The
  landing's only primary is "Copy commands"; its async states announce via a
  polite live region, never a focus move (A11Y-11); "failed" holds until the
  next attempt.
- **Install panel**: `--surface` panel, hairline border, `rounded-lg`; mono
  header label + the primary action; `pre` region on `--muted`,
  keyboard-focusable.
- **SlopCompare**: the standards demo, pinned light (`landing-light`).
- **Phase chips / skill chips**: mono 12px on `--muted`, `rounded-md`;
  planned chips are dashed-border with a plain "planned" tag.
- **Skill list**: `<dl>` rows separated by hairlines, grouped by moment of
  need, inside titled group panels.

## Do's and don'ts

- Do keep chrome saturation exclusively in the TW blue ramp; a second accent
  is a system change, not a tweak.
- Do lead with the machine: the diagram and the demo outrank any decorative
  treatment.
- Don't reintroduce gradients, glows, cyan-on-dark, or card grids; don't move
  load-bearing copy into `aria-hidden` decoration.
- Landing-only styling stays in `app/(landing)/` + the `landing-dark` /
  `landing-light` scopes in `app/globals.css`; keep the two scope blocks in
  sync with `:root` when light values change.
- The catalog outranks this file: where a control and this prose disagree,
  the control wins and this file gets corrected.
