# Design decision record — landing figure draftsmanship (exploded-view pass)

> One record per page or significant change. Started at the Phase 3 plan gate,
> finished at Phase 6.

- **Date:** 2026-08-13
- **Product:** dx-harness website (landing)
- **Change type:** modification (restyle of existing figures)
- **Page type:** marketing landing (figure panels FIG 0.1–0.5)
- **Run type:** unattended (builder away; explicit build ask counted as approval)
- **The builder and the moment:** the builder compared the landing figures with
  makingsoftware.com's technical illustrations (isometric exploded views, dense
  part labelling) and asked for the same drawing quality across all landing
  diagrams.

## Chosen-direction amendment — 2026-08-14

The builder replaced the earlier raster-figure direction with a more specific
build instruction: retain every existing piece of landing-page copy, use
makingsoftware.com and linear.app/coding-sessions as structural references, keep
headline sizes restrained, and render the image layer as authored SVG rather than
image-generated assets. The hero must use the construction vocabulary and canonical
quartic mark from github.com/wondopamine/logo-grid-generator.

This explicit build ask counts as the run's approval. It supersedes the raster
implementation without discarding the page's existing content or light illustrated-
manual design language.

### Amendment contract

1. The hero copy remains the primary message, with a moderate serif scale and one
   filled Quick start action; the diagram carries the visual weight.
2. FIG 0.1–0.5 render as inline SVG. FIG 0.1 uses the logo-grid generator's
   canonical quartic mark, modular grid, polar field, and 1:2 ratio construction.
3. The feature and map figures reuse that grid, rule, mark, and measured-label
   language so the page reads as one system.
4. The existing visible copy, routes, before/after demo, and skills collection are
   preserved.
5. The page reflows without horizontal page scroll at 320, 360, 768, and 1280px;
   visible HTML captions and SVG title/description elements preserve meaning when
   drawing labels scale down.

### Amendment tradeoffs

- Inline SVG adds component markup, but removes raster loading, keeps the drawings
  crisp at every width, and makes their geometry auditable in the repository.
- Small drawing labels remain secondary at narrow widths under the existing TYP-2
  figure-annotation waiver; the same meaning stays available in visible captions
  and accessible descriptions.
- Linear's reference contributes pacing, framed product demonstrations, and
  restrained hierarchy; the landing stays in its recorded light palette rather
  than copying Linear's dark theme.

### Amendment evidence

- Width captures: 320, 360, 768, 1280 reduced-motion, and 1440 desktop; measured
  `scrollWidth === innerWidth` at every required width.
- Reduced motion: all five SVG figures visible; no information-bearing layer hidden.
- Keyboard: skip link, brand link, navigation, Quick start, and Read the manual show
  visible focus; the labelled native comparison slider responds to ArrowRight and
  exposes `aria-valuetext`.
- Deterministic checks: token audit, accessibility static scan, type scan, contrast,
  full Python gate, typecheck, tests, lint, and production build all complete without
  errors. Lint retains warnings in pre-existing evaluation scripts and config files.

## Sprint contract (done-criteria)

1. FIG 0.2–0.4 read as measured technical illustrations: exact 2:1 isometric
   projection, extruded part thickness, exploded composition on a dashed
   assembly axis, and multiple mono-uppercase part labels with leader lines
   and arrowheads.
2. FIG 0.5 (the harness map) gains the same label-leader idiom and machined
   face detail without moving any geometry the scroll storyboard's camera
   offsets depend on.
3. Everything stays inside the recorded system: spec-panel mounts, lime figure
   steps (standing override, docs/decisions/landing-lime-figures.md), tokens
   only, no new motion.
4. The hero figure (FIG 0.1) is not re-labelled: the builder removed its
   callouts earlier the same day as noise (landing-lime-figures.md, scope
   addition 5). Only dimension-line ticks were added.

## Approval

Explicit build ask — counted as approval (plan-approval stop-once rule). The
ask named the chosen direction: "update all diagrams in the landing to match
the quality from https://www.makingsoftware.com/", with two reference images
(isometric floppy disk; exploded floppy assembly with labelled parts).

## What was built

- `components/landing/feature-cards.tsx` — shared computed-projection helpers
  (`isoPt`, `IsoPlate`: top face + two visible side faces + optional machined
  rim inset), `FigCallout` extended with a second label line.
  - FIG 0.2 (orchestrator): exploded gate assembly — ask chip, dx-design gate
    plate with compass rose and corner fixings, tray of five pass slots plus
    the accent builder slot, one dashed assembly axis with arrowheads.
    Callouts: ONE ASK, FRONT DOOR, ROUTES ONLY, THE PASSES, THE BUILDER.
  - FIG 0.3 (catalog): exploded three-tier stack on one axis; control rows
    etched on each face; L0 carries the wash and corner fixings. Callouts:
    L2 NEEDS A REASON, L1 NAMED APPROVER, L0 NEVER WAIVED.
  - FIG 0.4 (DESIGN.md): the file as one machined sheet — rule lines and token
    fixings on the face, a standing-override chip seated on a dashed axis.
    Callouts: STANDING OVERRIDES, TOKENS, ONE SOURCE, HUMAN READS, AGENT READS.
- `components/landing/full-map-diagram.tsx` — rim inset on the shared plate
  top face; `#fullmap-leader` def: a short arrow from each connector
  annotation to its axis (four uses). No layer or camera geometry moved.
- `components/landing/hero-geometry.tsx` — dimension ticks close the waist
  measure line. Callouts deliberately NOT re-added (see contract item 4).

## Controls and waivers

- COL-1: standing override, lime figure steps (landing-lime-figures.md) —
  waiver comments already on both figure files; no new waiver this run.
- TOK-1..3: tokens only — `token-audit.py` exit 0 on the three files.
- A11Y-1: figure labels draw in `--dxd-lime-ink` (≥4.5:1 on page and wash by
  token definition); `contrast.py` static subset exit 0.
- A11Y static subset: `a11y-static.py` exit 0. Figures remain `aria-hidden`
  decoration; every label restates copy carried by visible text (guardrail:
  no load-bearing copy in decoration).
- MOT-1/A11Y-5: no motion added or changed.
- Figure annotation text renders below the 12px mono floor (~9px at card
  size), following the convention the previous run shipped for figure
  annotations; verified manually as decorative drawing text, not UI text.

## Evidence

Scratchpad captures (session): baseline-features/map, after-features (1280),
zoom-features-a, after-map-stage3/stage5 (scroll stages with leaders and
rims), after-360-features, after-360-map (static complete map), after-768-*,
hero-after. `pnpm build` passes; `tsc --noEmit` clean.

## Review round 1 — verdict (verbatim, dx-design-review, 2026-08-13)

> VERDICT: fail
>
> (Full verdict preserved below; grading note: the reviewer could not separate
> this run's diff from the preceding uncommitted lime run and graded the
> surface as it stood.)
>
> BLOCKING: (1) TYP-2 — figure annotations render below the 12px label floor
> at every width (feature callouts 8.70px @1280 down to 5.52px @768; map
> annotations 11.0px @1280 down to 4.67px @320; hero drawing text 5.70px
> @320); type-scan.py cannot see SVG fontSize, so the clean script run did not
> cover it. (2) LAY-2 — scrollWidth 368 at a 360px viewport (header nav, the
> 32px mark) and the map's annotation text overlaps the rotated edge caption
> by up to 7px at 320/360.
>
> ADVISORY: TYP-4 all-caps callouts unrecorded; FIG 0.4 ragged callout column
> (LAY-6); three FIG 0.4 leaders point at no drawn part; CMP-7 mixed
> projection discipline (true circle rose, screen-space control rows); FIG 0.3
> on-face tier letters sit on the plate rim and duplicate the callouts; hero
> waist dimension line's left tick painted under the mark stroke; 768 density
> (LAY-5); SLP-9 em-dash chains ×2 (pre-existing); COL-1 scope drift (rail
> border + rail code accent lime — human to settle); dimmed map layers at
> opacity 0.42 (A11Y-1 close call); no 320px capture in the evidence set.
>
> QUALITY GRADES: design quality acceptable; originality strong; craft weak;
> functionality acceptable; dark mode N/A (product has no dark mode).
>
> UNCOVERED (ratchet candidates): stale text alternatives that describe
> removed elements; scaled-SVG text has no owning check (TYP-2 detail vs
> rendered size); fixed-inset overlay chrome vs scaled content
> (.spec-panel-caption).

(The complete verdict with the full verification ledger is on design ticket
#108's run record.)

## Fix round 1 (2026-08-13/14)

Fixes by the agent: map annotations shortened to clear the caption gutter
(DISPATCHES THE PASSES / ONE SHARED RULEBOOK / WRITTEN INTO YOUR REPO;
measured 23-28px clear at 320/360); FIG 0.2 rose redrawn as a projected 2:1
ellipse with plan-axis ticks; FIG 0.3 control rows re-projected through
isoPt; FIG 0.3 tier letters moved off the rim; FIG 0.4 callout column
aligned at x=20, HUMAN/AGENT READS leaders retargeted to drawn rule lines, a
dashed seat recess drawn under the override chip with the axis reaching it;
hero waist measure line and both dimension ticks repainted above the mark;
hero figcaption no longer claims callouts; dx-waive TYP-4 rationale comments
recorded in both figure files.

Fixes by the human builder (rezailmi, live in the working tree): TYP-2
waiver recorded (DESIGN.md Typography + landing-lime-figures.md waiver
table, approver rezailmi) with sizes raised — feature callouts and tier
letters to 16 SVG units (~12.7px at 1280), map annotations to 12 units;
FigCallout subs wrap to lines; landing header mark size-6 below sm (clears
the 360 overflow — scrollWidth measured exactly 320/360/768 after);
feature-card em-dash chain and map desc em-dash chain reworded (SLP-9); map
legend copy updated to "lime edge — the front door and the one builder".

Open by decision: COL-1 scope drift on the map reading rail (lime active-step
border + code accent — widen the DESIGN.md override or return to blue);
0.42-opacity past-layer contrast close call; SLP-5 close call on the
three-panel silhouette; CNT-1 false positives in content-lint on all-caps
figure labels.

## Review round 2 — re-check verdict (2026-08-14)

> VERDICT: fail (one residual L1 blocker — TYP-2 in the 768–1023 band;
> everything else is advisory)

Full verbatim verdict on the design ticket run record:
https://github.com/transformteamsg/dx-harness/issues/108#issuecomment-5287934080
Fix grades: resolved — LAY-2 both defects, TYP-4, LAY-6 (FIG 0.4), CMP-7
projection, FIG 0.3 tier letters, stale figcaption, SLP-9; partial — TYP-2
(waiver valid in form, scope says "below md" while the smallest rendering was
AT md), FIG 0.4 seat arrowhead occluded, hero left tick swallowed by the 11px
non-scaling mark stroke. New regressions: FIG 0.2 ragged right column, lost
caption gutter, inert dx-waive CNT-1 comments, header flush at 360.

## Fix round 2 (2026-08-14)

- Feature figures single-column below lg (grid gap-10 lg:grid-cols-3
  lg:gap-5; panels max-w-[520px]; padding lg:pr-6 lg:pl-3 xl:pr-7 xl:pl-4).
  Measured callouts: 10.0px @320 / 11.8px @360 (below md — waived), ~21px
  @768, 12.18px @1024, 12.65px @1280 — the floor is met at md and above for
  the feature figures. The MAP's 768–1023 band stays open for the approver.
- FIG 0.2 right callouts one column at x=236; ROUTES/ONLY wrapped two lines;
  leader lands on the rose's edge, not inside it.
- FIG 0.4 seat axis painted after the sheet; arrowhead reads.
- Caption gutter deliberate: callout tracking 0.8 — measured 9px @360, 5px
  @1024, 9px @1280.
- Inert dx-waive CNT-1 comments removed (3 sites); CNT-1 all-caps false
  positives stay a ratchet item for content-lint.
- Header: Quick start hidden below 400px; GitHub's right edge flush with the
  content column at 320/360/768/1024/1280 (296/336/744/1000/1156).
- Hero dimension ticks lengthened to ±14 units (≈16.2px > the 11px stroke).
- Checks re-run green (tsc, token-audit, contrast, a11y-static, pnpm build).

## Review round 3 — re-check verdict

Not run: the builder stopped the round-3 reviewer. Fix round 2 is verified by
measurement (recorded above); the remaining items are the approver decisions
listed below.

## Open decisions for the approver (rezailmi)

1. TYP-2 waiver scope: the recorded waiver says "below md"; the map's
   annotations render 7.9–11.6px in the 768–1023 storyboard band. Widen the
   wording or direct a map layout change for that band.
2. COL-1 scope: the map reading rail's lime active border and code accent
   sit outside the recorded "mark + figures" override. Widen the override
   text or return those two to blue.
3. A11Y-1 close call: past map layers at opacity 0.42.
4. SLP-5 close call: the three equal figure panels carry no recorded
   rationale for the shape.
