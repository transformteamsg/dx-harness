# Interface craft — Phase 4 reference

The small details that read as care (HIG: Craft). `design` Phase 4 points here
during build. These **refine** the in-scope controls; they never replace them, and the
evaluator grades Craft on whether they were applied. Apply the ones the surface calls
for as you build — not as a cleanup pass.

- **Tabular figures** on any column of numbers or any number that updates in place —
  `tabular-nums` (TYP-5). Grade tables, attendance counts, and live totals must hold
  still, not jitter as digits change.
- **Concentric radius**: a nested control's radius is the parent's minus the padding
  (`inner = outer − padding`), snapped to the scale (TOK-3).
- **Property-scoped, interruptible transitions**: animate named properties
  (`transition-property: opacity, transform`), never `transition: all`; reserve
  keyframes for one-shot staged sequences. Direction carries meaning — entrances
  `ease-out`, exits `ease-in` and softer than the entrance, state/view changes
  `ease-in-out`. Duration and easing per MOT-1, no bounce (SLP-8), always a
  reduced-motion variant (A11Y-5). Keyboard navigation is instant — no animation on
  tab/arrow movement.
- **Press feedback**: a subtle `scale(0.96)` on press where a tactile cue helps —
  never below 0.95, never a bounce, disabled under reduced motion (A11Y-5).
- **Hit targets**: where a control reads smaller than its A11Y-4 floor (24px, 44px on
  mobile), expand the hit area with padding or a pseudo-element rather than enlarging
  the visible glyph.
- **Feels-instant feedback**: respond within ~400ms; when the real work takes longer,
  show a skeleton or an optimistic result, not a bare spinner — CMP-3's loading state,
  built to feel fast (Doherty threshold).
- **Shadows for depth, not decoration**: layer two or three low-alpha shadows rather
  than one hard one; keep a single consistent light direction across the surface; tint
  toward a neutral, never pure black; size the shadow to the elevation. This is
  constructive depth — distinct from the SLP-1 glow/aura tell, which stays banned.
- **Type polish**: `text-wrap: balance` on headings and `text-wrap: pretty` on body to
  remove orphans; `-webkit-font-smoothing: antialiased` set once at the root;
  `font-synthesis: none` so no weight is ever faked (TYP-1 ships 400/500/600 only).
- **Image edges**: a 1px low-opacity outline on photos — pure black in light, pure
  white in dark, never a tinted neutral (a tint reads as dirt on the edge).
- **will-change** only on `transform`/`opacity`/`filter`, and only to fix observed
  first-frame stutter — never `will-change: all`, never pre-emptively.
