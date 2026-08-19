# Plan 002: Redraw the four feature-grid figures with the icon-generator ink marks

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat bd48006..HEAD -- components/landing/feature-figure.tsx app/globals.css scripts/generate-ink-icons.mjs components/ink-icons.generated.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (001 is DONE)
- **Category**: direction
- **Planned at**: commit `bd48006`, 2026-08-17

## Why this matters

The landing's feature grid ("What the harness gives your agent.") draws each
card's argument in bespoke abstract geometry — plain circles, squares, and
triangles standing in for skills, rules, and primitives. The rest of the page
has since moved on: the skills section and the worked-example run both speak
in the icon-generator's ink marks, where the same mark means the same thing
everywhere (`skills/pattern` is the layout pass in the skill tile AND in the
run panel — the design review graded that system decision "originality:
strong"). The builder's direction, mis-recorded once and corrected in
`docs/decisions/landing-run-example.md`, is to keep the grid's
abstract-graphic *communication style* — small geometric arguments that
perform on hover — but redraw each figure from the ink marks so the cards
spell out their message in the page's one shared vocabulary: FIG 1 as
voice/prompt mark → orchestrator mark → the specialised skill marks, and the
same treatment for the other three.

## Current state

- `components/landing/feature-figure.tsx` — the only component to change.
  Four figure functions (`OrchestratorFigure`, `CatalogFigure`,
  `DesignFileFigure`, `ReviewFigure`) each return SVG children rendered
  inside one shared wrapper (lines 165–181):

  ```tsx
  export function FeatureFigure({ kind, number }: { kind: FeatureFigureKind; number: string }) {
    return (
      <figure
        className="feature-figure relative h-44 overflow-hidden"
        aria-hidden="true"
        data-feature-figure={kind}
      >
        <p className="absolute top-4 left-5 z-10 text-xs tracking-widest text-muted-foreground">{number}</p>
        <svg viewBox="0 0 360 220" className="mx-auto block h-full w-full max-w-xs">
  ```

  The wrapper, its classes, `aria-hidden`, `data-feature-figure`, the `FIG n`
  label, and the `FeatureFigureKind` union must all survive unchanged — e2e
  selectors and `app/(landing)/page.tsx` depend on them.

- `app/globals.css` lines 279–321 — the `ff-*` choreography block. The SVG
  markup holds every shape's FINAL pose; these rules pull shapes back to
  their initial pose while the card (`[data-feature-card]`) is idle. The
  whole block is gated on `(hover: hover) and (prefers-reduced-motion:
  no-preference)`, so touch and reduced-motion readers see the resolved
  final state (A11Y-5). Plumbing classes that must survive as-is:

  ```css
  .ff-anim {
    transition:
      transform var(--motion-story) var(--ease-out),
      fill var(--motion-slow) var(--ease-out);
    transform-box: fill-box;
    transform-origin: center;
  }
  .ff-draw { transition: stroke-dashoffset var(--motion-story) var(--ease-out); }
  .ff-route { stroke-dasharray: 110; }
  .ff-pick { transition-delay: var(--motion-beat-1); }
  /* FIG 1 */
  [data-feature-card]:not(:hover):not(:focus-visible) .ff-route { stroke-dashoffset: 110; }
  [data-feature-card]:not(:hover):not(:focus-visible) .ff-pick { fill: var(--surface); }
  ```

  The FIG 2 (`ff-seat-*`) and FIG 3 (`ff-prim-*`) transform rules are tied to
  coordinates this plan replaces — you will rewrite those rules. The FIG 4
  rules (`ff-ring-l/r`, `ff-check`, `ff-exit`) survive.

- `components/ink-icon.tsx` — shared Ink-preset renderer. Do NOT edit.
  Signature: `InkIcon({ name, size = 48, ink = "var(--ink)", idSuffix = "" })`.
  It renders a plain `<svg viewBox="0 0 24 24" width={size} height={size}>`
  with `aria-hidden="true"`. **It nests legally inside another `<svg>`**: an
  inner `<svg width={S} height={S}>` occupies S×S user units of the parent
  360×220 coordinate space at the position of the wrapping
  `<g transform="translate(x y)">`. At `size={48}` the baked 1.4-unit stroke
  scales to ≈2.8 parent units ≈ the visual weight of the current figures'
  `strokeWidth="2"` lines — sizes 40–56 all sit in the right weight band.
- `components/ink-icons.generated.ts` — generated icon data. Existing keys
  this plan uses: `guidelines/voice-tone`, `skills/orchestrator`,
  `skills/copy`, `skills/pattern`, `skills/polish`, `skills/execute`,
  `skills/review`, `landing/human`, `landing/machine`, `standards/catalog`,
  `foundations/colour`, `foundations/typography`, `foundations/tokens`.
  One key is missing and must be generated: a DESIGN.md file mark
  (step 1 adds `landing/design-file`).
- `scripts/generate-ink-icons.mjs` — the generator. `TOPIC_ICONS` (lines
  15–62) maps topic key → lucide icon id; it reads shape data from
  `node_modules/lucide-react/dist/esm/icons/<id>.js`. The seed is a
  deterministic per-key hash, so adding a key never changes existing
  entries. Run via `pnpm run gen:icons`.
- **Filter-id collisions**: the landing page already renders many of these
  marks — the six `skills/*` marks render with NO suffix in the skills
  section (`app/(landing)/page.tsx:253`), `landing/human` /
  `landing/machine` render with NO suffix in the three-readers section
  (`page.tsx:299`), and five skill marks render with `idSuffix="-run"` in
  `components/landing/harness-run.tsx`. Duplicate filter ids fail silently
  (one icon loses its texture), so **every `InkIcon` in
  `feature-figure.tsx` must carry a per-figure `idSuffix`**: `-fig1`,
  `-fig2`, `-fig3`, `-fig4`.
- `tests/site-contract.spec.ts:90-96` asserts the grid's shape — 4×
  `[data-feature-figure]`, 4× `[data-feature-card]`, the four eyebrows —
  and lines 119–145 assert the hover/keyboard reveal. Nothing asserts the
  figures' interior, so no test change is needed; all existing tests must
  stay green.
- `app/(landing)/page.tsx:90-135` — the `FEATURES` data (eyebrow, claim,
  what, why, `kind`). Unchanged; the four `kind` values stay
  `orchestrator | catalog | design-file | review`.

The four cards whose message each figure must spell out (from `page.tsx`):

| FIG | Eyebrow | Claim |
|---|---|---|
| 1 | Orchestrator skill | Start with a plain-language request. |
| 2 | Control catalog | Shared design guidance agents can use. |
| 3 | DESIGN.md | Your product's design language. |
| 4 | Review skill | A review against the catalog and your DESIGN.md. |

Conventions this plan must honor (from `CLAUDE.md` and
`plugins/dx-harness/standards/catalog.yaml`):

- Tokens only — no raw hex in components or the new CSS (TOK-1); colours via
  existing utilities/vars: `text-foreground`, `text-border-strong`,
  `var(--site-accent)`, `var(--surface)`, `var(--site-accent-text)`.
- Motion: only `--motion-*` durations and `--ease-*` easings; no bounce
  (SLP-8); no `animate-*` utilities. The `ff-*` block's existing gating
  (`hover: hover` + `prefers-reduced-motion: no-preference`) is the
  reduced-motion strategy — keep it.
- No gradient text, no nested cards, no purple, no sparkle-as-AI-magic
  *messaging* (the `skills/polish` sparkles mark is an accepted open
  decision — reuse it for the polish skill only, don't introduce sparkles
  anywhere else).
- Comment style: intent-carrying block comments, like the ones already in
  `feature-figure.tsx` — each figure keeps a comment stating the argument it
  draws. Match, don't strip.
- Copy rules don't bite here (figures are `aria-hidden` drawings with no
  text), but the comments still pass `content-lint.py` — write them in
  sentence case, "catalog" never "catalogue".

## Commands you will need

Run from the repo root. A fresh worktree has no `node_modules` — install first.

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Regenerate icons | `pnpm run gen:icons` | exit 0, rewrites `components/ink-icons.generated.ts` |
| Typecheck | `pnpm exec tsc --noEmit` | exit 0, no output |
| Build (standards prebuild + CSP postbuild) | `pnpm build` | "Compiled successfully", postbuild "[csp] Externalized …" |
| Unit tests | `pnpm test` | 12 files / 92 tests pass |
| E2E | `pnpm test:e2e` | 43 pass |
| Token audit | `python3 plugins/dx-harness/checks/token-audit.py app components lib` | exit 0, silent |
| A11y static | `python3 plugins/dx-harness/checks/a11y-static.py app components` | exit 0, silent |
| Type scan | `python3 plugins/dx-harness/checks/type-scan.py app components` | exit 0, silent |
| Contrast | `python3 plugins/dx-harness/checks/contrast.py --tokens app/globals.css app components lib` | exit 0 |
| Content lint | `python3 plugins/dx-harness/checks/content-lint.py components/landing/feature-figure.tsx` | exit 0, silent |

If `pnpm test:e2e` fails with a missing-browser error, run
`pnpm exec playwright install chromium` once and retry.

## Scope

**In scope** (the only files you may modify):
- `components/landing/feature-figure.tsx`
- `app/globals.css` — ONLY the `ff-*` block (lines 279–321); nothing else in
  the file.
- `scripts/generate-ink-icons.mjs` — ONLY adding one `TOPIC_ICONS` entry.
- `components/ink-icons.generated.ts` — ONLY via `pnpm run gen:icons`; never
  by hand.

**Out of scope** (do NOT touch, even though they look related):
- `components/ink-icon.tsx` — the renderer is shared; wrap, don't modify.
- `app/(landing)/page.tsx`, `components/landing/data.ts`,
  `content/sections/landing.mdx` — card copy, kinds, and the markdown twin
  stay as they are.
- `components/landing/harness-run.tsx` — the run section is DONE (plan 001)
  and review-passed; do not "align" it.
- `tests/site-contract.spec.ts` — no assertions change; the suite is the
  regression gate.
- `docs/decisions/*` — the reviewer maintains the decision record.

## Git workflow

- You are in a dedicated worktree branch — commit there.
- One commit is fine. Message style: conventional commits as in `git log`,
  e.g. `feat(\`landing\`): redraw the feature-grid figures in the ink-mark vocabulary`.
- Do NOT push or open a PR.

## Steps

### Step 1: Generate the DESIGN.md file mark

In `scripts/generate-ink-icons.mjs`, inside `TOPIC_ICONS`, after the
`"landing/machine": "bot",` line, add:

```js
  "landing/design-file": "file-pen-line",
```

Run `pnpm run gen:icons`.

**Verify** (all three):
- `grep -c '"landing/design-file"' components/ink-icons.generated.ts` → `1`
- `git diff components/ink-icons.generated.ts | grep -c '^-[^-]'` → `0`
  (the regeneration is purely additive — no existing entry changed; if this
  is non-zero, STOP)
- `pnpm exec tsc --noEmit` → exit 0

### Step 2: Rebuild FIG 1 — the orchestrator selects

Replace `OrchestratorFigure`'s body. The argument stays exactly what the
current comment says — "One ask in, only the right skills out" — but the
players become marks: the plain-words ask is the speech-bubble mark, the
selector is the orchestrator mark inside its ring, and the five skill marks
sit where the abstract shapes were; three get a route and an accent disc,
two stay faint.

Import at the top of the file:

```tsx
import { InkIcon } from "@/components/ink-icon";
```

Target shape (coordinates are the intended layout; tune ±a few units for
optical balance, keep the structure and class names exact):

```tsx
/* One ask in, only the right skills out: the speech-bubble mark (your plain
   words) feeds the orchestrator mark in its selector ring; three of five
   skill marks get a route and an accent disc, two stay faint. The
   orchestrator selects — it does not broadcast. */
function OrchestratorFigure() {
  return (
    <>
      {/* the ask, in your words */}
      <g transform="translate(28 88)">
        <InkIcon name="guidelines/voice-tone" size={44} ink="var(--site-accent-text)" idSuffix="-fig1" />
      </g>
      <path d="M78 110h36" {...line} className="text-foreground" strokeWidth="2" />
      {/* the selector ring, with the orchestrator mark inside */}
      <circle cx="160" cy="110" r="38" {...line} className="text-foreground" strokeWidth="2" fill="var(--surface)" />
      <g transform="translate(138 88)">
        <InkIcon name="skills/orchestrator" size={44} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      {/* routes to the three picked passes */}
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M193 91 L272 52" className="ff-draw ff-route" />
        <path d="M198 110 L272 110" className="ff-draw ff-route" />
        <path d="M193 129 L272 168" className="ff-draw ff-route" />
      </g>
      {/* picked: accent disc fills behind the mark on hover (ff-pick) */}
      <circle cx="300" cy="44" r="20" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <circle cx="300" cy="110" r="20" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <circle cx="300" cy="176" r="20" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <g transform="translate(286 30)">
        <InkIcon name="skills/pattern" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <g transform="translate(286 96)">
        <InkIcon name="skills/polish" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <g transform="translate(286 162)">
        <InkIcon name="skills/execute" size={28} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      {/* not picked this run: copy and review wait, faint */}
      <g transform="translate(334 62)" opacity=".3">
        <InkIcon name="skills/copy" size={22} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
      <g transform="translate(334 136)" opacity=".3">
        <InkIcon name="skills/review" size={22} ink="var(--foreground)" idSuffix="-fig1" />
      </g>
    </>
  );
}
```

Notes that matter:
- The `line` const already exists at the top of the file — keep using it for
  drawn strokes.
- The accent discs reuse the existing `ff-pick` CSS rule verbatim: it fills
  `var(--surface)` at idle, which is invisible on the near-white ground, and
  `var(--site-accent)` on hover. The routes reuse `ff-route`. **No CSS change for
  FIG 1.** Route path lengths must stay ≤ 110 units (the `ff-route`
  dasharray) or the idle state won't fully hide them.
- Marks never carry `ff-anim`/transform choreography themselves — the discs
  and routes animate, the marks hold still. (The nested `<svg>` elements
  don't obey `transform-box: fill-box` consistently across engines; keeping
  choreography on plain shapes sidesteps that.)

**Verify**: `pnpm exec tsc --noEmit` → exit 0, and
`grep -c 'idSuffix="-fig1"' components/landing/feature-figure.tsx` → `7`.

### Step 3: Rebuild FIG 2 — one catalog, two readers

Replace `CatalogFigure`'s body AND its CSS rules. The argument shifts from
"rules turn scatter into alignment" to the card's actual claim — shared
guidance both of you read: the human mark and the machine mark sit apart
with the catalog mark between them on a drawn sheet; on hover both slide
toward the sheet and their connectors draw in.

Target shape:

```tsx
/* Shared guidance both of you read: the human mark and the machine mark
   approach the same drawn catalog sheet — the list-checks mark on it — and
   their connectors meet it. One catalog, two readers, no drift. */
function CatalogFigure() {
  return (
    <>
      {/* the catalog: a drawn sheet carrying the list-checks mark */}
      <rect x="150" y="55" width="60" height="110" rx="6" {...line} className="text-foreground" strokeWidth="2" fill="var(--surface)" />
      <g transform="translate(158 88)">
        <InkIcon name="standards/catalog" size={44} ink="var(--site-accent-text)" idSuffix="-fig2" />
      </g>
      {/* the readers: you and your agent, converging on it */}
      <g className="ff-anim ff-share-l">
        <g transform="translate(44 88)">
          <InkIcon name="landing/human" size={44} ink="var(--foreground)" idSuffix="-fig2" />
        </g>
      </g>
      <g className="ff-anim ff-share-r">
        <g transform="translate(272 88)">
          <InkIcon name="landing/machine" size={44} ink="var(--foreground)" idSuffix="-fig2" />
        </g>
      </g>
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M96 110h46" className="ff-draw ff-route" />
        <path d="M218 110h46" className="ff-draw ff-route" />
      </g>
    </>
  );
}
```

In `app/globals.css`, replace the three FIG 2 rules (`ff-seat-sq`,
`ff-seat-ci`, `ff-seat-tr`, currently lines 306–309) with:

```css
    /* FIG 2 — the two readers apart, their lines to the catalog undrawn */
    [data-feature-card]:not(:hover):not(:focus-visible) .ff-share-l { transform: translateX(-16px); }
    [data-feature-card]:not(:hover):not(:focus-visible) .ff-share-r { transform: translateX(16px); }
```

The choreography classes go on OUTER plain `<g>` wrappers (as shown), never
on the nested `<svg>` itself — same reason as step 2. `ff-anim` already
carries the transform transition; the connectors reuse `ff-route`.

**Verify**: `grep -c 'ff-seat' app/globals.css components/landing/feature-figure.tsx | grep -c ':0'` → `2`
(no `ff-seat-*` remains anywhere), and
`grep -c 'idSuffix="-fig2"' components/landing/feature-figure.tsx` → `3`.

### Step 4: Rebuild FIG 3 — your foundations compose your product

Replace `DesignFileFigure`'s body AND its CSS rules. The argument keeps its
direction, which is that your primitives arranged your way become your
product. What changes is the players: the primitives become the foundation
marks (colour, typography, tokens)
routing into the miniature interface, which stays a drawn frame (the same
realistic-interface language the run section established).

Target shape:

```tsx
/* Your foundations compose your product: the colour, type, and token marks —
   what DESIGN.md holds — route into the drawn interface and take effect as
   its avatar, its field, its action. Same parts, your arrangement. */
function DesignFileFigure() {
  return (
    <>
      {/* the foundations DESIGN.md holds */}
      <g transform="translate(36 24)">
        <InkIcon name="foundations/colour" size={36} ink="var(--foreground)" idSuffix="-fig3" />
      </g>
      <g transform="translate(36 92)">
        <InkIcon name="foundations/typography" size={36} ink="var(--foreground)" idSuffix="-fig3" />
      </g>
      <g transform="translate(36 160)">
        <InkIcon name="foundations/tokens" size={36} ink="var(--foreground)" idSuffix="-fig3" />
      </g>
      {/* three routes funnel into the one interface */}
      <g className="text-site-accent-text" {...line} strokeWidth="2">
        <path d="M84 42 C120 42 130 90 162 96" className="ff-draw ff-route" />
        <path d="M84 110 L162 110" className="ff-draw ff-route" />
        <path d="M84 178 C120 178 130 130 162 124" className="ff-draw ff-route" />
      </g>
      {/* the product: the same miniature interface language as the run's result */}
      <g className="text-foreground" {...line} strokeWidth="2">
        <rect x="170" y="30" width="160" height="160" rx="10" fill="var(--surface)" />
      </g>
      <g className="text-border-strong" {...line} strokeWidth="1.5">
        <rect x="216" y="52" width="76" height="5" rx="2.5" fill="var(--border-strong)" stroke="none" />
        <rect x="186" y="86" width="128" height="42" rx="6" fill="var(--site-accent-wash)" />
        <rect x="198" y="98" width="60" height="5" rx="2.5" fill="var(--border-strong)" stroke="none" />
        <rect x="198" y="110" width="42" height="5" rx="2.5" fill="var(--border-strong)" stroke="none" />
      </g>
      {/* the primitives land as real parts: avatar, field mark, action */}
      <circle cx="196" cy="56" r="9" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
      <rect x="186" y="144" width="52" height="26" rx="6" {...line} className="text-foreground" strokeWidth="1.5" fill="var(--surface)" />
      <path d="M206 150 L216 157 L206 164 Z" className="ff-anim ff-pick" fill="var(--site-accent)" stroke="none" />
    </>
  );
}
```

In `app/globals.css`, delete the three FIG 3 rules (`ff-prim-ci`,
`ff-prim-sq`, `ff-prim-tr`, currently lines 310–313) and their comment line —
FIG 3 now choreographs entirely through the shared `ff-route`
(routes draw in) and `ff-pick` (the accent parts fill) rules. Curved route
path lengths must stay ≤ 110 units; the curves above measure ≈ 96.

**Verify**: `grep -c 'ff-prim' app/globals.css components/landing/feature-figure.tsx | grep -c ':0'` → `2`,
and `grep -c 'idSuffix="-fig3"' components/landing/feature-figure.tsx` → `3`.

### Step 5: Rebuild FIG 4 — the review closes over both sources

Replace `ReviewFigure`'s body only — its CSS rules (`ff-ring-l`, `ff-ring-r`,
`ff-check`, `ff-exit`) survive verbatim. The two rings keep their closing
choreography, but each now carries the mark of what it stands for: the
catalog mark in the left ring, the DESIGN.md file mark (from step 1) in the
right ring.

Target shape:

```tsx
/* Passes both sources before it returns: the catalog ring and the DESIGN.md
   ring close over the work — each carrying its mark — the check draws where
   they agree, and only then does the arrow leave for you. */
function ReviewFigure() {
  return (
    <>
      <g className="ff-anim ff-ring-l">
        <circle cx="142" cy="110" r="58" {...line} className="text-foreground" strokeWidth="2" />
        <g transform="translate(96 88)" opacity=".6">
          <InkIcon name="standards/catalog" size={40} ink="var(--foreground)" idSuffix="-fig4" />
        </g>
      </g>
      <g className="ff-anim ff-ring-r">
        <circle cx="218" cy="110" r="58" {...line} className="text-foreground" strokeWidth="2" />
        <g transform="translate(224 88)" opacity=".6">
          <InkIcon name="landing/design-file" size={40} ink="var(--foreground)" idSuffix="-fig4" />
        </g>
      </g>
      <g className="text-site-accent-text" {...line}>
        <path d="m165 110 11 12 21-26" className="ff-draw ff-check" strokeWidth="3.5" />
        <path d="M284 110h44" className="ff-draw ff-exit" strokeWidth="2" />
        <path d="m321 103 8 7-8 7" className="ff-draw ff-exit" strokeWidth="2" />
      </g>
    </>
  );
}
```

Position each mark inside its ring but clear of the overlap zone where the
check draws (the marks sit toward the outer halves). The marks ride INSIDE
the `ff-ring-*` groups so they slide with their rings.

**Verify**: `grep -c 'idSuffix="-fig4"' components/landing/feature-figure.tsx` → `2`,
and `pnpm exec tsc --noEmit` → exit 0.

### Step 6: Visual sanity pass

Start the dev server (`pnpm dev`) and view `/` at 1280 and 360 wide, idle
and hovered per card (or, headless, capture with Playwright). Confirm:

- All fifteen marks render WITH their ink texture (a missing texture means a
  filter-id collision — recheck `idSuffix`).
- Idle: FIG 1 shows no routes and no accent discs; FIG 2's readers sit
  apart; FIG 3 shows no routes and no accent parts; FIG 4's rings sit
  apart with no check.
- Hover: each figure resolves to its final pose with `--motion-story`
  ease-out and nothing overflows the `h-44` figure box (`overflow-hidden`
  would clip it silently — look for clipped mark edges, especially FIG 1's
  faint right-column marks near x=356).
- Nothing in the figure moves on hover EXCEPT the choreographed shapes.

Fix coordinate overflows by nudging positions, not by resizing the figure
box.

**Verify**: your own eyes on the six states; then stop the dev server.

### Step 7: Full gate

Run, in order, expecting every one clean:

1. `python3 plugins/dx-harness/checks/token-audit.py app components lib` → exit 0
2. `python3 plugins/dx-harness/checks/a11y-static.py app components` → exit 0
3. `python3 plugins/dx-harness/checks/type-scan.py app components` → exit 0
4. `python3 plugins/dx-harness/checks/contrast.py --tokens app/globals.css app components lib` → exit 0
5. `python3 plugins/dx-harness/checks/content-lint.py components/landing/feature-figure.tsx` → exit 0
6. `pnpm exec tsc --noEmit` → exit 0
7. `pnpm build` → success
8. `pnpm test` → 92 pass
9. `pnpm test:e2e` → 43 pass

Then commit per the git workflow above.

## Test plan

- No new tests: the figures are `aria-hidden` decoration whose interior the
  contract deliberately doesn't pin (the grid-shape assertions at
  `tests/site-contract.spec.ts:90-96` and the hover-reveal test at 119–145
  are the regression net, and both survive by construction).
- The full e2e suite (43) is the gate — especially the two feature-card
  tests, which exercise the hover path the choreography rides on.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` → 92 pass; `pnpm test:e2e` → 43 pass
- [ ] All five `checks/` scripts in step 7 exit 0
- [ ] `grep -c 'InkIcon' components/landing/feature-figure.tsx` → ≥ 16 (import + 15 uses)
- [ ] `grep -c 'idSuffix="-fig' components/landing/feature-figure.tsx` → 15
- [ ] `grep -c '"landing/design-file"' components/ink-icons.generated.ts` → 1
- [ ] `grep -cE 'ff-(seat|prim)' app/globals.css` → 0
- [ ] `git diff bd48006 -- components/ink-icons.generated.ts | grep -c '^-[^-]'` → 0 (regeneration purely additive)
- [ ] `git status --short` shows changes ONLY in the four in-scope files
- [ ] `plans/README.md` status row updated (unless the dispatcher maintains it)

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows in-scope files changed since `bd48006` and the
  "Current state" excerpts no longer match.
- `pnpm run gen:icons` changes or deletes any EXISTING entry in
  `ink-icons.generated.ts` (the additive-only check in step 1 fails).
- `node_modules/lucide-react/dist/esm/icons/file-pen-line.js` does not exist
  (the lucide version drifted) — do not substitute another icon without
  reporting.
- `InkIcon` no longer accepts `ink` or `idSuffix`, or no longer renders a
  nestable `<svg>` — do not edit `ink-icon.tsx` to compensate.
- Marks render without texture after correct `idSuffix` values (a renderer
  behaviour you cannot fix in scope).
- `pnpm test:e2e` fails twice after a reasonable fix attempt on the same
  step.
- Satisfying a step appears to require touching an out-of-scope file.

## Maintenance notes

- **The same-mark-same-meaning system now spans three sections** (skills
  grid, run panel, feature figures). Anyone changing a skill's mark in
  `TOPIC_ICONS` re-skins all three at the next `gen:icons` — that's the
  point, but reviewers should check all three sections after any icon
  change.
- The `idSuffix` discipline: any FUTURE section that renders these marks on
  the landing page needs its own suffix.
- `ff-route`'s dasharray (110) is a shared ceiling for every drawn route in
  the grid — a longer path needs its own class with its own dasharray, not
  a bumped shared value (bumping it slows the draw of every shorter path).
- A design-review pass (the `dx-design-review` agent) runs after this lands;
  expect findings on optical balance and mark sizing to be handled by that
  loop, not pre-emptively here.
- Deferred deliberately: any change to the cards' copy or the hover-reveal
  behaviour; the sparkles-mark open decision (a third site would raise its
  cost — it stays at two sites plus this grid's reuse for the polish skill,
  which resolves from the same one line in `scripts/generate-ink-icons.mjs`).
