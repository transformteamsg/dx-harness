# Plan 001: Reframe the landing run as one worked example on realistic interfaces

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 8734c27..HEAD -- components/landing/harness-run.tsx tests/site-contract.spec.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `8734c27`, 2026-08-17
- **Reconciliation (post-execution)**: executed as `01dde60`; the design
  review then directed two departures from this plan's literal text, both
  recorded in `docs/decisions/landing-run-example.md`: the replay does NOT
  stay a borderless ghost (it keeps the site's shared secondary-control
  resting border + `title` — CMP-7, round 3), and the CMP-5 note about the
  unlabeled lime block was superseded (it now carries a "Save" label —
  reviewer-directed craft, still `aria-hidden` decoration). Follow-up fix
  commits: `674415f`, `3618a45`.

## Why this matters

The landing's "From a request to a reviewed result." section currently shows a
terminal with three plain status lines and an abstract result screen. The
builder's direction: the feature grid above it stays abstract geometry, and
THIS section becomes the one worked example that shows how those parts
actually run — a happy-path sequence on realistic interfaces, where the
natural-language ask visibly triggers the Orchestrator skill, and the
orchestrator visibly runs the specialised skills (each shown with its ink
tool mark, the same marks the "skills inside the harness" section already
uses). Separately, the "Replay the run" button shrinks to an icon-only
control. This makes the mechanism legible instead of narrated.

## Current state

- `components/landing/harness-run.tsx` — the only component to change. A
  `"use client"` player: terminal + connector + abstract result on the left,
  three stage buttons on the right. Autoplays once via IntersectionObserver,
  stages scrub via `jumpTo`, reduced motion sees the finished run.
- `components/ink-icon.tsx` — shared Ink-preset icon renderer. Do NOT edit it.
  Signature (lines 12–21): `InkIcon({ name, size = 48, ink = "var(--ink)", idSuffix = "" })`.
  `idSuffix` exists because the SVG filter id derives from `name` — rendering
  the same icon twice on one page needs a suffix to keep ids unique
  (`components/ink-icon.tsx:24`).
- `components/ink-icons.generated.ts` — generated icon data. All needed keys
  already exist: `skills/orchestrator` (line 199), `skills/pattern` (218),
  `skills/polish` (226), `skills/execute` (236), `skills/review` (244),
  `harness/loop` (260 — a refresh-cw mark, used for the icon-only replay).
  Do NOT regenerate or edit.
- `tests/site-contract.spec.ts` — Playwright contract tests; two touch this
  component (see excerpts below).
- `app/(landing)/page.tsx` renders `<SectionHead title="From a request to a
  reviewed result." />` then `<HarnessRun />`. No change needed there.

Key excerpts of `components/landing/harness-run.tsx` as of `8734c27`:

```tsx
// lines 22-25 — beat model
const PROMPT = "make the settings page feel calmer";
/* beat: 0 typing · 1 passes line · 2 plan approved line · 3 review line · 4 result */
const FINAL_BEAT = 4;
const BEAT_STAGE = [0, 1, 1, 2, 2] as const;
```

```tsx
// lines 94-106 — the autoplay timeline (total must stay under 5s: WCAG 2.2.2,
// past five seconds an auto-playing animation owes a visible pause/stop)
const play = () => {
  clearTimers();
  setBeat(0);
  setTypedCount(0);
  for (let i = 1; i <= PROMPT.length; i++) {
    timers.current.push(window.setTimeout(() => setTypedCount(i), 250 + i * 26));
  }
  const t0 = 250 + PROMPT.length * 26;
  timers.current.push(window.setTimeout(() => setBeat(1), t0 + 450));
  ...
  timers.current.push(window.setTimeout(() => setBeat(4), t0 + 2300));
};
```

```tsx
// lines 166-189 — the terminal currently carries the prompt AND three status
// lines ("dx-design · layout + polish passes", "plan approved · building",
// "design review passed"); those status lines MOVE OUT into the new run panel.
```

```tsx
// lines 218-230 — the replay button to shrink (currently a labeled outline
// button, min-h-11 for the 44px A11Y-4 mobile floor)
<button
  type="button"
  onClick={play}
  /* min-h-11: 44px is this page's mobile target floor (A11Y-4) ... */
  className={`mt-6 inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-(--prose-body) transition-colors duration-(--motion-fast) hover:border-border-strong ${focusRing}`}
>
  Replay the run
</button>
```

Test excerpts (`tests/site-contract.spec.ts`, as of `8734c27`):

```ts
// lines 148-161 — reduced-motion + scrub test. It asserts:
//   getByText("design review passed") visible          ← text must survive
//   stage button "The harness at work" → aria-current "step"
//   getByRole("button", { name: "Replay the run" }) visible
//     ← name must survive; an icon-only button keeps it via aria-label
```

Conventions this plan must honor (from `CLAUDE.md` and the control catalog at
`plugins/dx-harness/standards/catalog.yaml`):

- Tokens only — no raw hex/colour in components (TOK-1); colours via the
  existing Tailwind token utilities (`text-foreground`, `bg-surface`,
  `border-border`, `text-site-accent-text`, `bg-site-accent-wash`, …).
- Motion: durations/easing only via `--motion-*` / `--ease-*` tokens (the file
  already does this — `duration-(--motion-base)` etc.); no `animate-*`
  utilities; every transition carries `motion-reduce:transition-none`; no
  bounce (SLP-8); autoplay total stays **under 5 seconds** including the final
  transition.
- A11Y-4: every interactive target ≥44px on mobile — the icon-only replay
  button must keep a 44×44 hit area (`size-11`).
- A11Y-3 / a11y-static NAME rule: an icon-only button MUST carry
  `aria-label` — the static check errors otherwise.
- CMP-5: the hero holds the page's only filled primary — the replay stays a
  ghost control, and nothing in the drawing becomes a real filled button.
- Copy: sentence case, second person; spell it "catalog", never "catalogue";
  no em-dash pairs inside one sentence (SLP-9 lint); actors are "you" and
  "your agent".
- Text floor: labels may be `text-xs` (12px); never smaller.
- Comment style: this repo writes intent-carrying block comments (see the
  existing comments in `harness-run.tsx`) — match that, don't strip them.

## Commands you will need

Run from the repo root. A fresh worktree has no `node_modules` — install first.

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit` | exit 0, no output |
| Build (runs standards gate + CSP postbuild) | `pnpm build` | "Compiled successfully", postbuild "[csp] Externalized …" |
| Unit tests | `pnpm test` | 12 files / 92 tests pass |
| E2E | `pnpm test:e2e` | 43 pass (count may grow if you add assertions) |
| Token audit | `python3 plugins/dx-harness/checks/token-audit.py app components lib` | exit 0, silent |
| A11y static | `python3 plugins/dx-harness/checks/a11y-static.py app components` | exit 0, silent |
| Type scan | `python3 plugins/dx-harness/checks/type-scan.py app components` | exit 0, silent |
| Content lint | `python3 plugins/dx-harness/checks/content-lint.py components/landing/harness-run.tsx` | exit 0, silent |

If `pnpm test:e2e` fails with a missing-browser error, run
`pnpm exec playwright install chromium` once and retry.

## Scope

**In scope** (the only files you may modify):
- `components/landing/harness-run.tsx`
- `tests/site-contract.spec.ts`

**Out of scope** (do NOT touch, even though they look related):
- `components/landing/feature-figure.tsx` — the builder explicitly keeps the
  abstract feature figures as they are.
- `components/ink-icon.tsx`, `components/ink-icons.generated.ts`,
  `scripts/generate-ink-icons.mjs` — every icon this plan needs already
  exists; regeneration would churn unrelated output.
- `app/(landing)/page.tsx`, `app/globals.css`, `content/sections/landing.mdx`
  — the section heading, stage copy, and markdown twin stay as they are.
- `docs/decisions/*` — the reviewer maintains the decision record.

## Git workflow

- You are in a dedicated worktree branch — commit there.
- One commit is fine. Message style: conventional commits as in `git log`,
  e.g. `feat(\`landing\`): play the run on realistic interfaces and shrink replay to an icon`.
- Do NOT push or open a PR.

## Steps

### Step 1: Extend the beat model

In `components/landing/harness-run.tsx`, replace the beat constants:

```tsx
/* beat: 0 typing · 1 orchestrator picks the passes · 2 layout pass ·
   3 polish pass · 4 plan approved, building · 5 review passed + result */
const FINAL_BEAT = 5;
const BEAT_STAGE = [0, 1, 1, 1, 1, 2] as const;
```

Update the stage `beat` targets in `STAGES`: stage 01 keeps `beat: 0`,
stage 02 becomes `beat: 4`, stage 03 becomes `beat: 5`. The stage headings and
body copy do not change.

Update `play()`'s timeline (keep the existing structure; total stays < 5s):

```tsx
const t0 = 250 + PROMPT.length * 26;   // ≈ 1134ms
timers.current.push(window.setTimeout(() => setBeat(1), t0 + 400));
timers.current.push(window.setTimeout(() => setBeat(2), t0 + 850));
timers.current.push(window.setTimeout(() => setBeat(3), t0 + 1300));
timers.current.push(window.setTimeout(() => setBeat(4), t0 + 1750));
timers.current.push(window.setTimeout(() => setBeat(5), t0 + 2250));
```

(Last beat ≈ 3.4s; with the result's `--motion-story` 600ms settle ≈ 4.0s —
under the 5-second boundary. Do not exceed these offsets.)

Keep the file-top comment block, `jumpTo`, the IntersectionObserver effect,
and the reduced-motion behaviour exactly as they are (SSR initial state stays
`FINAL_BEAT` so no-JS readers see the finished run).

**Verify**: `pnpm exec tsc --noEmit` → exit 0.

### Step 2: Slim the terminal to the ask alone

The three status `<p>` lines (`dx-design · layout + polish passes`,
`plan approved · building`, `design review passed`) move out of the terminal
(they are replaced by the run panel in step 3). After this step the terminal
window contains only the chrome bar and the prompt line with its caret. Remove
the `min-h-[104px]` from the terminal's inner flex container (it existed to
reserve room for the departed lines). Keep the caret logic
(`beat < FINAL_BEAT`) unchanged.

**Verify**: `grep -c "layout + polish passes" components/landing/harness-run.tsx` → `0`.

### Step 3: Add the orchestrator run panel

Import the icon renderer at the top of the file:

```tsx
import { InkIcon } from "@/components/ink-icon";
```

Between the terminal and the existing connector/result, insert: a connector
(same pattern as the existing one — `mx-auto h-4 w-px bg-blueprint-ink` with
the shared `lineTransition`, visible from beat 1 via `lineOn(1)`), then the
run panel. The panel reuses the terminal's surface language so it reads as a
real interface, not a diagram:

```tsx
{/* the orchestrator at work: dx-design reads the ask, then visibly runs the
    specialised skills — each with the same ink tool mark the skills section
    uses. This panel is the "one worked example" for the parts above. */}
<div className={`rounded-lg border border-border bg-surface p-3 shadow-sm ${lineTransition} ${lineOn(1)}`}>
  <p className={statusLine}>
    <InkIcon name="skills/orchestrator" size={18} ink="var(--site-accent-text)" idSuffix="-run" />
    <span className="font-semibold text-foreground">dx-design</span>
    <span className="text-muted-foreground">picks the passes</span>
  </p>
  <div className="mt-2 flex flex-col gap-1.5 border-l border-border pl-3">
    <p className={`${statusLine} text-muted-foreground ${lineTransition} ${lineOn(2)}`}>
      <InkIcon name="skills/pattern" size={18} ink="var(--foreground)" idSuffix="-run" />
      <span>layout pass · reads catalog + DESIGN.md</span>
    </p>
    <p className={`${statusLine} text-muted-foreground ${lineTransition} ${lineOn(3)}`}>
      <InkIcon name="skills/polish" size={18} ink="var(--foreground)" idSuffix="-run" />
      <span>polish pass · reads catalog + DESIGN.md</span>
    </p>
    <p className={`${statusLine} text-muted-foreground ${lineTransition} ${lineOn(4)}`}>
      <InkIcon name="skills/execute" size={18} ink="var(--foreground)" idSuffix="-run" />
      <span>plan approved · building</span>
    </p>
  </div>
</div>
```

Layout details that matter: `statusLine` already exists in the file
(`flex items-baseline gap-2 text-xs leading-relaxed`) — icons inside it need
`items-center` alignment, so if baselines misalign visually, give the icon
rows `items-center` via a local variant rather than editing `statusLine` for
the terminal too. Add `shrink-0` styling to the icons if the row wraps
(`InkIcon` renders a plain `<svg>`; wrap it in a `<span className="shrink-0">`
if needed — do not modify `ink-icon.tsx`).

`idSuffix="-run"` is REQUIRED on all four: the same icons render in the
skills section, and duplicate SVG filter ids would collide.

**Verify**: `grep -c 'idSuffix="-run"' components/landing/harness-run.tsx` → `4`.

### Step 4: Make the result screen a realistic settings surface

Replace the abstract result screen's interior (grey bars + boxes) with a
miniature but real settings interface, and move the review line onto it as a
badge. Keep the outer container's classes and its beat-5 reveal transition
exactly as they are (`rounded-lg border border-blueprint-ink bg-surface p-3
shadow-sm`, `--motion-story` reveal — only the gate changes from `beat >= 4`
to `beat >= 5`). Interior:

```tsx
<p className="text-xs font-semibold text-foreground">Settings</p>
<div className="mt-2.5 flex flex-col gap-2">
  <div>
    <p className="text-xs text-muted-foreground">Display name</p>
    <div className="mt-1 h-6 rounded-md border border-border bg-background" />
  </div>
  <div>
    <p className="text-xs text-muted-foreground">Reminders</p>
    <div className="mt-1 h-6 rounded-md border border-border bg-background" />
  </div>
</div>
<div className="mt-3 flex justify-end">
  <div className="h-6 w-16 rounded-md bg-site-accent" />
</div>
```

The lime block stays an unlabeled drawn block (it is `aria-hidden` decoration
inside the `role="img"` figure — giving it button text would re-open a CMP-5
argument; don't).

Below the screen (still inside the `aria-hidden` wrapper, before the
figcaption), add the review badge, revealed at beat 5:

```tsx
<p className={`mt-2 ${statusLine} font-semibold text-site-accent-text ${lineTransition} ${lineOn(5)}`}>
  <InkIcon name="skills/review" size={18} ink="var(--site-accent-text)" idSuffix="-run" />
  <span>design review passed</span>
</p>
```

(The literal text `design review passed` must exist on the page — a contract
test asserts it.)

Update the second connector's gate from `lineOn(4)` to `lineOn(5)`, and widen
the figure column from `max-w-[13rem]` to `max-w-[15rem]` so the richer
panels breathe (the round-1 design review flagged the old figure as
underweight in its column).

Update the figure's `aria-label` to narrate the new sequence, one plain
sentence chain, e.g.: `A Claude Code session played end to end: you type a
request in plain words — make the settings page feel calmer. The dx-design
orchestrator picks layout and polish passes, each reads the control catalog
and your DESIGN.md, the plan is approved, the build runs, the design review
passes, and a small finished settings screen comes back underneath.`

**Verify**: `grep -c 'idSuffix="-run"' components/landing/harness-run.tsx` → `5`.

### Step 5: Shrink the replay to an icon-only control

Replace the labeled replay button with an icon-only ghost button. The 44px
hit area and the accessible name are load-bearing (A11Y-4 L1; A11Y-3/NAME):

```tsx
<button
  type="button"
  onClick={play}
  aria-label="Replay the run"
  /* Icon-only, but never under the floor: size-11 keeps the 44px hit area
     (A11Y-4) and the aria-label keeps the accessible name (A11Y-3) that an
     icon-only control otherwise loses. */
  className={`mt-4 inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--motion-fast) hover:bg-accent hover:text-foreground ${focusRing}`}
>
  <InkIcon name="harness/loop" size={20} ink="currentColor" idSuffix="-replay" />
</button>
```

**Verify**: `grep -c 'aria-label="Replay the run"' components/landing/harness-run.tsx` → `1`.

### Step 6: Update and extend the contract tests

In `tests/site-contract.spec.ts`, the test
`"the harness run scrubs by stage and respects reduced motion"` (lines
148–161) keeps working as written — `getByText("design review passed")`,
the stage scrub, and `getByRole("button", { name: "Replay the run" })` all
survive by construction. Extend it with two assertions after the existing
ones:

```ts
// The orchestrator visibly runs the specialised skills.
await expect(page.getByText("layout pass · reads catalog + DESIGN.md")).toBeVisible();
await expect(page.getByText("polish pass · reads catalog + DESIGN.md")).toBeVisible();
```

**Verify**: `pnpm build && pnpm test:e2e` → all pass (43+).

### Step 7: Full gate

Run, in order, expecting every one clean:

1. `python3 plugins/dx-harness/checks/token-audit.py app components lib` → exit 0
2. `python3 plugins/dx-harness/checks/a11y-static.py app components` → exit 0
3. `python3 plugins/dx-harness/checks/type-scan.py app components` → exit 0
4. `python3 plugins/dx-harness/checks/content-lint.py components/landing/harness-run.tsx` → exit 0
5. `pnpm exec tsc --noEmit` → exit 0
6. `pnpm test` → 92 pass
7. `pnpm test:e2e` → all pass

Then commit per the git workflow above.

## Test plan

- Extended e2e test (step 6) covers: the run-panel skill rows exist and are
  visible under reduced motion (the finished-state render), alongside the
  pre-existing assertions for the review line, stage scrub `aria-current`,
  and the replay button's accessible name.
- Pattern to follow: the existing reduced-motion test at
  `tests/site-contract.spec.ts:148` — same `emulateMedia` + `getByText` style.
- No unit tests apply (the component has no extracted logic module).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm build` succeeds (standards prebuild + CSP postbuild included)
- [ ] `pnpm test` → 92 pass; `pnpm test:e2e` → all pass including the two new assertions
- [ ] All four `checks/` scripts in step 7 exit 0
- [ ] `grep -c 'idSuffix="-run"' components/landing/harness-run.tsx` → 5
- [ ] `grep -c 'aria-label="Replay the run"' components/landing/harness-run.tsx` → 1
- [ ] `grep -c "Replay the run</button>" components/landing/harness-run.tsx` → 0 (no visible label remains)
- [ ] `git status --short` shows changes ONLY in the two in-scope files
- [ ] Autoplay's last timer offset ≤ `t0 + 2250` (grep the `play()` body)

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows in-scope files changed since `8734c27`, and the
  "Current state" excerpts no longer match.
- `InkIcon` does not accept `ink` or `idSuffix` props (the component drifted)
  — do not edit `ink-icon.tsx` to compensate.
- Any icon key named in step 3/4/5 is missing from
  `components/ink-icons.generated.ts` — do not regenerate.
- `pnpm test:e2e` fails twice after a reasonable fix attempt on the same step.
- Satisfying a step appears to require touching an out-of-scope file.

## Maintenance notes

- The 5-second autoplay ceiling is a hard constraint (WCAG 2.2.2): anyone
  adding beats later must re-total the timeline including the result's 600ms
  settle, or add a visible pause control.
- The `idSuffix` discipline matters whenever an ink icon appears twice on one
  page; a duplicate filter id fails silently (one icon loses its texture).
- A design-review pass (the `dx-design-review` agent) runs after this lands;
  expect findings on visual weight/alignment of the new panel to be handled
  by the reviewer's loop, not pre-emptively here.
- Deferred deliberately: any change to stage copy, the section heading, or
  the markdown twin (`content/sections/landing.mdx`) — the panel is drawing,
  not copy, and the twin's prose already describes the same sequence.
