# Plan 003: Show only the selected step's graphic in the landing run

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 03fecc6..HEAD -- components/landing/harness-run.tsx tests/site-contract.spec.ts`
> If either in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED — the section this touches carries a five-round review history
  and several hard-won properties that are easy to break silently. Read
  "Properties you must not break" before writing code.
- **Depends on**: none (independent of plan 002 — different file)
- **Category**: direction
- **Planned at**: commit `03fecc6`, 2026-08-17

## Why this matters

The landing's "From a request to a reviewed result." player has three stage
buttons that scrub the run. Selecting a stage currently reveals that stage's
graphic **and leaves the other two visible as faint ghost frames** at 40%
opacity. The builder's request: selecting a step should show **only that
step's graphic**, not the other steps sitting there empty.

The ghost frames are not an accident — they were added on a reviewer's
instruction, because the state before them showed roughly 340px of empty
column that read as a rendering failure. So this change must not simply delete
them. The reconciliation: **the ghosts answer a different question than
selection does.** During autoplay the reader is watching one run assemble, and
a reserved-but-faint region correctly says "this part is still coming". When a
reader explicitly picks step 02, they are asking to look at step 02 alone, and
a ghost of step 03 is then noise. So ghosts stay in the autoplay path and
disappear in the explicit-selection path.

## Current state

`components/landing/harness-run.tsx` — a `"use client"` player, the only
component to change. Layout: a two-column grid; the left column holds the
figure, the right column holds three stage buttons in an `<ol>`.

State model as of `03fecc6`:

```tsx
// lines 26-27
const FINAL_BEAT = 5;
const BEAT_STAGE = [0, 1, 1, 1, 1, 2] as const;
```

```tsx
// line 92 — the only view state today
const [beat, setBeat] = useState(FINAL_BEAT);
```

```tsx
// lines 122-128
/* Jump straight to a stage's end beat; a reader's pick always beats the timer. */
const jumpTo = (target: number) => {
  played.current = true;
  clearTimers();
  setTypedCount(PROMPT.length);
  setBeat(target);
};
```

```tsx
// lines 151-155
const activeStage = BEAT_STAGE[beat];
const lineOn = (lineBeat: number) =>
  beat >= lineBeat ? "opacity-100" : "opacity-0";
const lineTransition =
  "transition-opacity duration-(--motion-base) ease-(--ease-out) motion-reduce:transition-none";
```

```tsx
// line 87 — the ghost class this plan keeps for autoplay and drops for selection
const ghost = "opacity-40";
```

The three `STAGES` entries (lines 29-64) each carry `n`, `heading`, `beat`,
`body`. Their `beat` targets are **0**, **4**, and **5**.

The figure's structure (line 163 onward), with each region's owning stage:

| Region | Lines | Owning stage |
|---|---|---|
| `<figure role="img" aria-label="…">` | 163-167 | — |
| `<div aria-hidden="true">` (the chain wrapper) | 168 | — |
| terminal window | 170-196 | **0** |
| connector 1 (`mx-auto h-4 w-px bg-blueprint-ink`) | 198-200 | chain only |
| orchestrator run panel | 205-250 | **1** |
| connector 2 | 253-255 | chain only |
| result frame (Settings screen) | 265-292 | **2** |
| `design review passed` badge | 293-300 | **2** |
| `<figcaption>` | 302-304 | — |

The stage buttons (lines 322-338) call `jumpTo(s.beat)` and mark the current
one with `aria-current={activeStage === index ? "step" : undefined}`.
The replay button (lines 306-320) calls `play`.

The figure element itself:

```tsx
// line 164
className="m-0 flex w-full max-w-[15rem] flex-col gap-2"
```

Because the figure is width-capped at `max-w-[15rem]`, its text wraps
identically at every viewport, and a prior review measured the figure at a
**constant 545px at 320, 360, 768 and 1280**. That constancy is what makes
step 4 below safe.

Conventions (from `CLAUDE.md` and `plugins/dx-harness/standards/catalog.yaml`):

- Tokens only, no raw hex (TOK-1). Colour via existing utilities.
- Motion only via `--motion-*` / `--ease-*`; no `animate-*`; no bounce
  (SLP-8); every transition carries `motion-reduce:transition-none`.
- Text floor 12px (`text-xs`); never smaller (TYP-2).
- Copy: sentence case, second person, "catalog" never "catalogue"; no
  em-dash pairs inside one sentence (SLP-9 lint runs on this file).
- Comment style: intent-carrying block comments. This file is dense with
  them and they encode review history — **extend them, never strip them.**

## Properties you must not break

Each of these was won by a specific review finding on this exact component.
Breaking one silently re-opens a closed finding.

1. **Server-rendered and no-JS readers get the complete composition.** Initial
   state is `beat = FINAL_BEAT` with nothing focused. Do not make the initial
   render depend on client state.
2. **Reduced-motion readers get the complete composition** at rest, with
   working stage buttons and no animation (A11Y-5, MOT-3).
3. **The figure never changes height.** A constant 545px is why the caption,
   the replay button, and everything below them do not move. Selection must
   not reflow the column.
4. **Exactly one `aria-current="step"` at all times** (A11Y-8).
5. **Autoplay stays under five seconds** total (WCAG 2.2.2). You are not
   touching the timeline; do not.
6. **The literal text `design review passed` exists on the page** in the
   default state — a contract test asserts it.
7. **The replay control keeps its 44px hit area, `aria-label`, `title`, and
   resting border** (A11Y-3, A11Y-4, CMP-7).

## Commands you will need

Run from the repo root. A fresh worktree has no `node_modules` — install first.

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit` | exit 0, no output |
| Build | `pnpm build` | "Compiled successfully" + postbuild `[csp] Externalized …` |
| Unit tests | `pnpm test` | 92 pass |
| E2E | `pnpm test:e2e` | 43 pass before your new assertions; more after |
| Token audit | `python3 plugins/dx-harness/checks/token-audit.py app components lib` | exit 0 |
| A11y static | `python3 plugins/dx-harness/checks/a11y-static.py app components` | exit 0 |
| Type scan | `python3 plugins/dx-harness/checks/type-scan.py app components` | exit 0 |
| Contrast | `python3 plugins/dx-harness/checks/contrast.py --tokens app/globals.css app components lib` | exit 0 |
| Content lint | `python3 plugins/dx-harness/checks/content-lint.py components/landing/harness-run.tsx` | exit 0 |

If e2e fails on a missing browser, run `pnpm exec playwright install chromium`
once and retry.

## Scope

**In scope** (the only files you may modify):
- `components/landing/harness-run.tsx`
- `tests/site-contract.spec.ts`

**Out of scope** (do NOT touch):
- `components/landing/feature-figure.tsx` and `app/globals.css` — another
  agent is working on the feature grid on a different branch; leave both alone.
- `components/ink-icon.tsx`, `components/ink-icons.generated.ts`,
  `scripts/generate-ink-icons.mjs` — every mark needed already exists.
- `app/(landing)/page.tsx`, `content/sections/landing.mdx` — the section
  heading, stage copy, and markdown twin stay as they are.
- `docs/decisions/*`, `plans/*` other than your status row — the reviewer
  maintains the records.

## Git workflow

- You are on a dedicated branch in a dedicated worktree — commit there.
- One commit. Conventional-commit style, e.g.
  `feat(\`landing\`): isolate the selected step in the run player`.
- Do NOT push and do NOT open a PR.

## Steps

### Step 1: Add the focused-stage state

Add a second piece of view state beside `beat` (line 92):

```tsx
/* `beat` drives the run as it assembles; `focused` is the reader asking to see
   one step by itself. null means "playing or resting on the whole chain", and
   it is the initial state so the server render and no-JS readers still get the
   complete composition. */
const [focused, setFocused] = useState<number | null>(null);
```

**Verify**: `pnpm exec tsc --noEmit` → exit 0.

### Step 2: Wire selection and replay

The stage button's `onClick` (line 327) becomes:

```tsx
onClick={() => {
  setFocused(index);
  jumpTo(s.beat);
}}
```

The replay button's `onClick` (line 308) must leave focus mode so a replay
always shows the whole run assembling:

```tsx
onClick={() => {
  setFocused(null);
  play();
}}
```

Then make the current-stage marker prefer the explicit pick, replacing
line 151:

```tsx
/* An explicit pick wins; otherwise the beat says which stage we are in. */
const activeStage = focused ?? BEAT_STAGE[beat];
```

`focused` is `number | null` and `BEAT_STAGE[beat]` is a number, so `??` keeps
`activeStage` a number and exactly one stage stays marked (A11Y-8).

**Verify**: `pnpm exec tsc --noEmit` → exit 0, and
`grep -c "setFocused" components/landing/harness-run.tsx` → `3`.

### Step 3: Gate each region on the focused stage

Add one helper beside `lineOn` (near line 152):

```tsx
/* In focus mode only the picked step's region is drawn at all — a ghost of a
   step the reader did not ask for is noise, where mid-run it correctly means
   "still coming". The connectors belong to the assembled chain, so they go
   too. `hidden` (display:none), not opacity: an invisible-but-laid-out region
   would leave the same empty space the reader asked us to remove. */
const inFocus = focused !== null;
const regionOn = (stageIndex: number) =>
  !inFocus || focused === stageIndex ? "" : "hidden";
const chainOnly = inFocus ? "hidden" : "";
```

Then append the right class to each region's existing `className`, changing
nothing else about them:

- terminal wrapper (line 170): append `${regionOn(0)}`
- connector 1 (line 199): append `${chainOnly}`
- orchestrator panel (line 206): append `${regionOn(1)}`
- connector 2 (line 254): append `${chainOnly}`
- result frame (line 266): append `${regionOn(2)}`
- `design review passed` badge (line 294): append `${regionOn(2)}`

Leave every existing `ghost`, `lineOn(...)`, and `lineTransition` expression
in place — they are what the autoplay path still uses.

**Verify**: `grep -c "regionOn(" components/landing/harness-run.tsx` → `4`
(one definition plus three uses), and `pnpm exec tsc --noEmit` → exit 0.

### Step 4: Hold the column height and centre the focused region

The chain wrapper (line 168, `<div aria-hidden="true">`) must keep the
column's height and centre the single visible region when focused. Give it a
conditional class:

```tsx
<div
  aria-hidden="true"
  /* In focus mode the hidden regions leave the layout, so the wrapper would
     collapse and everything below it would jump. Reserving the run-mode height
     and centring keeps the column still (the figure measured a constant 545px
     across 320/360/768/1280 — it is width-capped at max-w-[15rem], so its text
     wraps identically at every viewport). Re-measure this if the composition
     changes. */
  className={inFocus ? "flex min-h-[521px] flex-col justify-center" : undefined}
>
```

**The 521px is a starting value you must verify, not trust.** Measure the
chain wrapper's own height in run mode (the figure's 545px includes the
`gap-2` and the figcaption) and use the measured number. Do it like this,
against a running dev server:

```js
// in a Playwright script
const h = await page.evaluate(() => {
  const fig = document.querySelector('figure[role="img"]');
  const chain = fig.querySelector('div[aria-hidden="true"]');
  return { chain: chain.getBoundingClientRect().height,
           figure: fig.getBoundingClientRect().height };
});
```

Confirm the number is identical at 320, 360, 768 and 1280 before hardcoding
it. If it is **not** identical across those widths, STOP and report — the
constancy assumption this step rests on would be false.

**Verify**: with a dev server running, measure the figure's height in the
default state and after selecting each of the three stages. All four must be
equal, at both 1280 and 360.

### Step 5: Keep the accessible name honest

The figure's `aria-label` (line 166) narrates the whole sequence. In focus
mode it describes something no longer drawn, so give each stage its own label.
Add a `figureLabel` to each `STAGES` entry:

- stage 01: `A terminal window with the typed request: make the settings page feel calmer.`
- stage 02: `A run panel: the dx-design orchestrator picks the layout and polish passes, each reading the control catalog and your DESIGN.md, then the plan is approved and the build runs.`
- stage 03: `A small finished settings screen with a display name field, a reminders field, and a Save button, under a badge reading design review passed.`

Then select it on the figure:

```tsx
aria-label={focused === null ? RUN_LABEL : STAGES[focused].figureLabel}
```

Move the existing full-sequence string into a `RUN_LABEL` const beside
`PROMPT` so the JSX stays readable. Keep its wording exactly as it is — it was
review-approved for A11Y-7.

**Verify**: `python3 plugins/dx-harness/checks/a11y-static.py app components`
→ exit 0, and `pnpm exec tsc --noEmit` → exit 0.

### Step 6: Extend the contract test

In `tests/site-contract.spec.ts`, the existing test
`"the harness run scrubs by stage and respects reduced motion"` must keep
passing unchanged — check that first, because its assertions were written
against the old behaviour:

- It asserts `design review passed` is visible **before** any stage is selected, in
  the default state. Still true.
- It then selects stage 02 and asserts the two pass rows are visible. Still
  true — stage 02 is the panel.

Add a new test after it:

```ts
test("selecting a run stage shows only that stage's graphic", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/");

  const figure = page.getByRole("img", { name: /terminal|orchestrator|settings screen/i });
  const heightOf = () =>
    page.locator('figure[role="img"]').evaluate((el) => el.getBoundingClientRect().height);

  const resting = await heightOf();

  // Stage 01: the terminal alone — no panel rows, no result badge.
  await page.getByRole("button", { name: /Your prompt/ }).click();
  await expect(page.getByText("layout pass · reads catalog + DESIGN.md")).toBeHidden();
  await expect(page.getByText("design review passed")).toBeHidden();

  // Stage 03: the result alone — the panel rows are gone.
  await page.getByRole("button", { name: /A reviewed result/ }).click();
  await expect(page.getByText("design review passed")).toBeVisible();
  await expect(page.getByText("layout pass · reads catalog + DESIGN.md")).toBeHidden();

  // Exactly one stage is ever current.
  await expect(page.locator('[aria-current="step"]')).toHaveCount(1);

  // Isolating a step must not reflow the column.
  await expect(await heightOf()).toBe(resting);
});
```

Adjust the locators to match what the page actually renders if a selector
misses — but do not weaken an assertion to make it pass. Model the test's
style on the existing reduced-motion test directly above it.

**Verify**: `pnpm test:e2e` → all pass, including the new test.

### Step 7: Full gate

Run, in order, expecting every one clean:

1. `python3 plugins/dx-harness/checks/token-audit.py app components lib`
2. `python3 plugins/dx-harness/checks/a11y-static.py app components`
3. `python3 plugins/dx-harness/checks/type-scan.py app components`
4. `python3 plugins/dx-harness/checks/contrast.py --tokens app/globals.css app components lib`
5. `python3 plugins/dx-harness/checks/content-lint.py components/landing/harness-run.tsx`
6. `pnpm exec tsc --noEmit`
7. `pnpm build`
8. `pnpm test`
9. `pnpm test:e2e`

Then commit per the git workflow above.

## Test plan

- New e2e test (step 6) covering: stage 01 isolates the terminal, stage 03
  isolates the result, exactly one `aria-current="step"`, and no column
  reflow between states.
- The existing reduced-motion scrub test is the regression net for the
  default state and must pass **unmodified**.
- No unit tests apply — the component has no extracted logic module.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` → 92 pass
- [ ] `pnpm test:e2e` → all pass, including the new isolation test
- [ ] All five `checks/` scripts exit 0
- [ ] `grep -c "setFocused" components/landing/harness-run.tsx` → 3
- [ ] `grep -c 'opacity-40' components/landing/harness-run.tsx` → 1 (the
      `ghost` const survives for the autoplay path)
- [ ] Figure height equal in the default state and after selecting each of the
      three stages, at 1280 and 360
- [ ] With JS disabled, the page still renders the complete composition
      including `design review passed`
- [ ] `git status --short` shows changes ONLY in the two in-scope files

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows either in-scope file changed since `03fecc6` and the
  "Current state" excerpts no longer match.
- The chain wrapper's run-mode height is **not** identical at 320/360/768/1280
  (step 4's constancy assumption would be false).
- Holding the column height and centring the focused region cannot both be
  done without changing the run-mode rendering.
- The existing reduced-motion scrub test needs modifying to pass — that would
  mean this change broke a shipped contract, which is a design question, not a
  test-editing question.
- Any of the seven "Properties you must not break" cannot be preserved.
- The gate fails twice on the same step after a reasonable fix attempt.

## Maintenance notes

- **Two view states now coexist**: `beat` (the run assembling) and `focused`
  (one step isolated). Anyone adding a stage must give it a `figureLabel` and
  a region mapping, or the new stage will isolate to an empty column.
- The `min-h-[…]` in step 4 is a measured constant. If the composition gains
  or loses a region, re-measure it — a stale value shows as either a jump on
  selection or dead space below the figure.
- The ghost treatment is now **autoplay-only**. If a future change makes
  ghosts appear during selection again, it re-opens the round-3 finding that
  introduced them; read `docs/decisions/landing-run-example.md` first.
- A design-review pass runs after this lands; expect findings on where the
  isolated graphic sits in the reserved column and on whether the caption
  should follow it.
