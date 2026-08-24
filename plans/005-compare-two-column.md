# Plan 005: Give the comparison a left-hand explanation and a right-hand slider

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: this plan is written to run **on top of plan
> 004** (`plans/004-name-the-design-harness.md`), which renames the product in
> the same two files this plan edits. Confirm plan 004's commit is your HEAD
> and that `git log --oneline -1` shows `feat(\`site\`): name the product DX
> Design Harness`. If it does not, STOP — running these out of order will
> conflict.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — the compare component is a quarantined anti-specimen carrying
  seven inline `dx-waive` markers. Halving its width changes how its chips
  crowd, and it must keep passing the suite's 320px overflow tests.
- **Depends on**: `plans/004-name-the-design-harness.md` (same files)
- **Category**: direction
- **Planned at**: written against `bd48006` for the compare-section excerpts
  below, which plan 004 does not touch; executed on top of plan 004's commit.

## Why this matters

The builder's words: "I feel 'Compare the output' part's example is too big.
Maybe put that slider interactive example on the right. But on the left, put
the section title and description what and how it is improved with what example
Skill."

Two problems in one. The comparison currently spans the full page width, so its
`aspect-[16/10]` frame renders about 800px tall on a desktop — the largest
single object on the landing page, dominating a section that is meant to be
evidence rather than the argument. And it explains itself only in a 12px
caption underneath, so a reader sees a dramatic before/after without being told
which part of the harness produced the change.

Putting the explanation on the left and the slider on the right fixes both: the
frame halves in width (so roughly 400px tall instead of 800px), and the space
that buys goes to naming what improved and which skills did it.

## Current state

The section as it stands (`app/(landing)/page.tsx` lines 222-225) — a full-width
band heading, then a full-width body:

```tsx
      <SectionHead title="Compare the output." />
      <div className="border-b border-border px-6 py-8 sm:px-10 sm:py-10">
        <SlopCompare />
      </div>
```

`SectionHead` (defined in the same file, lines 52-61) is the shared full-width
band every section uses:

```tsx
function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-b border-border bg-sheet-band px-6 py-8 sm:px-10 sm:py-10">
      <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}
```

**The two-column pattern this section should adopt already exists twice on the
page.** The hero uses it, and so does the run player
(`components/landing/harness-run.tsx`, its outer element):

```tsx
    <div className="grid border-b border-border lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center border-border px-6 py-8 max-lg:border-b sm:py-10 lg:border-r">
```

Note the border discipline: `lg:border-r` on the left cell, `max-lg:border-b`
so the seam moves when the columns stack. Match it.

`components/compare.tsx` — the comparison itself, 308 lines. What matters here:

- `SlopCompare()` at line 201 takes no props.
- The frame at roughly line 258: `className="relative mx-auto aspect-[16/10]
  w-full rounded-lg border border-border bg-surface [clip-path:inset(0_round_var(--radius))]"`.
  The `aspect-[16/10]` is what makes width drive height.
- Two text elements below the frame, currently carrying the explanation:

```tsx
      <p className="mt-2 max-w-[48ch] text-xs text-muted-foreground">
        Drag the handle — or focus it and use arrow keys.
      </p>
      <figcaption className="mt-2 max-w-[48ch] text-xs leading-normal text-muted-foreground">
        The same screen twice: what defaults produce, and what ships under the
        standard. Every chip is a control ID from the{" "}
        <Link href="/standards/catalog" className="…">catalog</Link>.
      </figcaption>
```

- The "before" panel carries seven **inline `dx-waive` markers** (SLP-1, SLP-2,
  SLP-9, SLP-4, SLP-5, CMP-5, SLP-6) because it is a deliberate anti-specimen.
  **Do not remove, move, or reword any of them.** The chips they label are the
  raw material for this plan's copy.

The violations the before panel actually demonstrates, read from the component:

| Chip | What it shows | Which skill fixes it |
|---|---|---|
| SLP-1 gradient palette | multi-hue gradient background | Polish |
| SLP-2 gradient text | gradient fill on a heading | Polish |
| SLP-9 buzzword copy | a marketing-speak headline in the before panel | Copy |
| SLP-4 nested cards | a card inside a card | Pattern |
| SLP-5 icon tile | the icon-tile feature-card template | Pattern |
| CMP-5 two primaries | two filled buttons competing | Polish |
| SLP-6 flat hierarchy | everything at one weight | Pattern |

So the example demonstrates exactly **three** passes: Copy, Pattern, Polish.
That is the "what example Skill" the builder asked for, and it is a fact about
the component, not an invention.

`content/sections/landing.mdx` — the markdown twin, currently:

```
## Compare the output

See the same brief with and without the harness.
```

Conventions (from `CLAUDE.md` and the catalogue):

- Tokens only, no raw hex (TOK-1).
- Text floor 12px (`text-xs`); never smaller (TYP-2). Type sizes on scale (TYP-3).
- Copy: second person, active voice, sentence case, plain language. "catalog",
  never "catalogue". `content-lint.py` enforces CNT-3 (25 words per sentence)
  and SLP-9 — **it currently reports one pre-existing finding in
  `components/compare.tsx`** (the deliberate marketing-speak headline in the
  anti-specimen, which is the SLP-9 specimen itself). Capture the baseline first; your diff must add none.
- The markdown twin must agree with the page.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit` | exit 0 |
| Build | `pnpm build` | "Compiled successfully" |
| Unit tests | `pnpm test` | 92 pass |
| E2E | `pnpm test:e2e` | 43 pass |
| Content lint | `python3 plugins/dx-harness/checks/content-lint.py app components content lib` | no NEW findings |
| Token audit | `python3 plugins/dx-harness/checks/token-audit.py app components lib` | exit 0 |
| A11y static | `python3 plugins/dx-harness/checks/a11y-static.py app components` | exit 0 |
| Type scan | `python3 plugins/dx-harness/checks/type-scan.py app components` | exit 0 |
| Contrast | `python3 plugins/dx-harness/checks/contrast.py --tokens app/globals.css app components lib` | exit 0 |

## Scope

**In scope**:
- `app/(landing)/page.tsx` — the compare section's markup
- `components/compare.tsx` — only the two text elements below the frame
- `content/sections/landing.mdx` — the "Compare the output" section's prose

**Out of scope** (do NOT touch):
- **Any `dx-waive` marker or anything inside the before/after panels.** The
  anti-specimen's violations are its content.
- The frame's `aspect-[16/10]`, the range input, the divider, the handle, the
  `clip-path`, and every `useRef`/`rAF` mechanic. You are re-parenting the
  component, not rebuilding it.
- `SectionHead` itself — other sections depend on it. This section stops
  calling it; the function stays.
- `components/landing/feature-figure.tsx`, `app/globals.css`,
  `components/landing/harness-run.tsx`, `tests/site-contract.spec.ts` — other
  agents' branches.

## Git workflow

- Commit on the same branch you are already on (plan 004's branch).
- One commit. Subject: `feat(\`landing\`): explain the comparison beside it, not beneath it`
- Do NOT push and do NOT open a PR.

## Steps

### Step 1: Baseline the linter

Run `python3 plugins/dx-harness/checks/content-lint.py app components content lib`
and record the output. Expect the pre-existing findings, including the
deliberate buzzword in `components/compare.tsx`.

**Verify**: baseline recorded.

### Step 2: Rebuild the section as two columns

Replace lines 222-225 of `app/(landing)/page.tsx` with a two-column grid that
matches the page's existing pattern. The section's `h2` moves into the left
cell — it remains the section heading, placed beside the evidence rather than
in a band above it.

Target shape (match the run player's border discipline exactly):

```tsx
      {/* The comparison is evidence, not the argument — so the claim and the
          three passes that produce it sit beside it, and the slider takes half
          the width instead of the whole page. */}
      <div className="grid border-b border-border lg:grid-cols-2">
        <div className="flex flex-col justify-center border-border px-6 py-8 max-lg:border-b sm:px-10 sm:py-10 lg:border-r">
          <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight text-balance text-foreground">
            Compare the output.
          </h2>
          {/* copy from step 3 goes here */}
        </div>
        <div className="flex min-w-0 flex-col justify-center px-6 py-8 sm:px-10 sm:py-10">
          <SlopCompare />
        </div>
      </div>
```

`min-w-0` on the right cell is load-bearing: without it a grid child will not
shrink below its content's intrinsic width, and the frame will push the column
wider than half.

Keep the `h2` classes identical to `SectionHead`'s so the heading stays on the
same type scale as every other section head (TYP-3).

**Verify**: `pnpm exec tsc --noEmit` → exit 0, and
`grep -c 'SectionHead title="Compare the output."' "app/(landing)/page.tsx"` → `0`.

### Step 3: Write the left column's explanation

Below the `h2`, add prose that says what improves and names the three passes
that produce it. Ground it in the chips the component actually renders — do not
invent violations it does not show.

Use this copy, which is written to pass CNT-3 (every sentence under 25 words)
and to name the three skills:

```tsx
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-pretty text-(--prose-body)">
            The same brief, run twice. Drag the handle to see what three passes
            change when they read the catalog.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            <li className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-px shrink-0">
                <InkIcon name="skills/copy" size={18} ink="var(--foreground)" idSuffix="-cmp" />
              </span>
              <span>
                <span className="font-semibold text-foreground">Copy</span> turns
                the buzzwords into plain language a teacher would use.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-px shrink-0">
                <InkIcon name="skills/pattern" size={18} ink="var(--foreground)" idSuffix="-cmp" />
              </span>
              <span>
                <span className="font-semibold text-foreground">Pattern</span> pulls
                the nested cards apart and gives the page one hierarchy.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="mt-px shrink-0">
                <InkIcon name="skills/polish" size={18} ink="var(--foreground)" idSuffix="-cmp" />
              </span>
              <span>
                <span className="font-semibold text-foreground">Polish</span> drops
                the gradients and the second primary for your own tokens.
              </span>
            </li>
          </ul>
          <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
            Every chip on the left panel is a control ID from the{" "}
            <Link
              href="/standards/catalog"
              className={`text-site-accent-text underline underline-offset-2 ${focusRing}`}
            >
              catalog
            </Link>
            .
          </p>
```

`InkIcon` is already imported in this file (line 4). The `idSuffix="-cmp"` is
**required**: these same three marks render in the skills grid with no suffix
and in the run panel with `-run`, and a duplicate SVG filter id silently strips
a mark's ink texture. `focusRing` is already defined in this file.

**Verify**: `grep -c 'idSuffix="-cmp"' "app/(landing)/page.tsx"` → `3`.

### Step 4: Slim the component's own captions

The left column now carries the explanation, so the component's figcaption
duplicates it. Keep the interaction hint with the control it describes — that
is an affordance, and it belongs beside the handle — and delete the explanatory
sentence that has moved.

In `components/compare.tsx`, keep the "Drag the handle" paragraph exactly as it
is, and reduce the `figcaption` to the accessible-name duty it still has to
carry. A `<figure>` needs a caption; make it short and non-duplicative:

```tsx
      <figcaption className="mt-2 max-w-[48ch] text-xs leading-normal text-muted-foreground">
        Default output on the left, the same screen on standard on the right.
      </figcaption>
```

The `<Link>` to the catalog moves to the left column (step 3), so remove it
here — and remove the now-unused `Link` import **only if nothing else in the
file uses it**. Check before deleting; an unused import fails lint, and a
wrongly deleted one fails the build.

**Verify**: `pnpm exec tsc --noEmit` → exit 0, and
`grep -c "Every chip is a control ID" components/compare.tsx` → `0`.

### Step 5: Update the markdown twin

In `content/sections/landing.mdx`, replace the single line under
`## Compare the output` so the twin says what the page now says. Keep it to
prose — the twin carries no markup:

```
The same brief, run twice. Three passes change it when they read the catalog:
Copy turns the buzzwords into plain language, Pattern pulls the nested cards
apart and gives the page one hierarchy, and Polish drops the gradients and the
second primary for your own tokens. Every chip is a control ID from the catalog.
```

Check each sentence against CNT-3's 25-word limit; split further if any exceeds it.

**Verify**: `python3 plugins/dx-harness/checks/content-lint.py content/sections/landing.mdx` → exit 0.

### Step 6: Measure what halving the width did

Measure rather than assume here: this step decides whether the change is
actually good. Serve the site and record, at **1280, 768, 390 and 320**:

- The frame's rendered width and height. At 1280 the frame should be roughly
  half its former width, so expect height near 400px rather than 800px.
- Whether any chip inside the before panel wraps, clips, or overlaps its
  neighbour. The chips are absolutely positioned inside a fixed-aspect frame,
  so halving the width shrinks everything proportionally — **the risk is that
  chip text becomes illegible or overflows its pill.** Capture screenshots at
  each width and read them yourself.
- `document.documentElement.scrollWidth` against `window.innerWidth` at 320
  and 390 — must be equal, no horizontal overflow.
- That the divider, the handle, and the range input still line up with the
  frame after re-parenting, and that dragging still moves the reveal.

**If chip text is illegible or clipped at any width, STOP and report the
measured sizes.** The fix would be a change inside the anti-specimen panels,
which is out of scope for this plan and needs a design decision.

**Verify**: your own reading of the screenshots at all four widths, plus the
overflow numbers.

### Step 7: Full gate

1. `python3 plugins/dx-harness/checks/token-audit.py app components lib` → exit 0
2. `python3 plugins/dx-harness/checks/a11y-static.py app components` → exit 0
3. `python3 plugins/dx-harness/checks/type-scan.py app components` → exit 0
4. `python3 plugins/dx-harness/checks/contrast.py --tokens app/globals.css app components lib` → exit 0
5. `python3 plugins/dx-harness/checks/content-lint.py app components content lib` → zero new findings against step 1
6. `pnpm exec tsc --noEmit` → exit 0
7. `pnpm build` → "Compiled successfully"
8. `pnpm test` → 92 pass
9. `pnpm test:e2e` → 43 pass

Then commit per the git workflow above.

## Test plan

- No new tests. The suite already covers the landing page's headings and the
  320/360 overflow behaviour, which is exactly what re-parenting could break.
- If an e2e assertion fails because it located the compare heading through
  `SectionHead`'s band, **STOP and report** — `tests/site-contract.spec.ts` is
  out of scope because another agent is working in it.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm exec tsc --noEmit` exits 0; `pnpm build` succeeds
- [ ] `pnpm test` 92 pass; `pnpm test:e2e` 43 pass
- [ ] All five `checks/` scripts clean, content-lint adding zero new findings
- [ ] `grep -c 'idSuffix="-cmp"' "app/(landing)/page.tsx"` → 3
- [ ] `grep -c "dx-waive" components/compare.tsx` → 7 (every marker survives)
- [ ] The `h2` "Compare the output." still renders exactly once on the page
- [ ] Frame height at 1280 is under 500px (it was near 800px)
- [ ] `scrollWidth == innerWidth` at 320 and 390
- [ ] `git status --short` shows changes only in the three in-scope files

## STOP conditions

Stop and report back (do not improvise) if:

- HEAD is not plan 004's commit.
- Chip text inside the before panel becomes illegible, clipped, or overlapping
  at any tested width — report measured sizes; fixing it means editing the
  anti-specimen, which is out of scope.
- An e2e assertion fails on the compare section's structure.
- The frame does not shrink as expected, which would mean `min-w-0` is missing
  or the grid is not applying.
- Removing the `Link` import breaks the build, meaning something else used it.
- The gate fails twice on the same step.

## Maintenance notes

- **The section no longer uses `SectionHead`.** It is the only section that
  places its `h2` in a column rather than a full-width band, which is a
  deliberate departure from the page's rhythm made on the builder's
  instruction. A design review should grade whether the rhythm break is worth
  the gain; if it is not, the fallback is to keep the band and move only the
  description and skill list into the left column.
- The three skill marks now render at four places on this page. Any new section
  using them needs its own `idSuffix`.
- The chips inside the anti-specimen are sized for a full-width frame. If the
  comparison ever moves back to full width, or shrinks further, they are the
  first thing to re-measure.
