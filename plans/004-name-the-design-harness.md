# Plan 004: Name the product "DX Design Harness" across the site

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat bd48006..HEAD -- app content components`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW — prose and metadata only, no logic
- **Depends on**: none (files are disjoint from plans 002 and 003)
- **Category**: direction
- **Planned at**: commit `bd48006`, 2026-08-17

## Why this matters

This product is the **design** harness. An engineering harness is being built
in parallel on the eng side, and the two will eventually merge into one family.
Today the site calls itself "DX Harness" and "dx-harness" everywhere, which
reads as the umbrella name for both — so a reader arriving cold cannot tell
whether this covers engineering concerns too, and the eng harness has no name
left to occupy.

The builder's decision, made explicitly: the product is **"DX Design
Harness"** in user-facing copy. That leaves room for a sibling eng harness and
a shared "DX Harness" umbrella later. Scope: the whole site in one sweep, so
no window exists where two names coexist.

**The plugin identifier does not change.** `dx-harness` is the real package
name and `/dx-harness:dx-design*` are the real command names. Renaming those
would break every install instruction and every command a reader copies. Only
prose, titles, metadata, and nav labels change.

## Current state

Every occurrence of the product name, verified by grep at `bd48006`:

```
app/layout.tsx:7:      title: { default: "DX Harness", template: "%s — DX Harness" },
app/layout.tsx:9:      "DX Harness gives your agent one front door, checkable standards,
                       and an independent reviewer before the work ships."
app/(landing)/page.tsx:13:   title: { absolute: "DX Harness — design in code with confidence" },
app/(landing)/page.tsx:15:   "DX Harness gives coding agents a shared design language, …"
app/(landing)/page.tsx:72:   label: "DX Harness",            ← the middle COLLABORATORS figure
app/(landing)/page.tsx:280:  DX Harness bridges human judgment and agent execution. …
app/(landing)/page.tsx:305:  DX Harness bridges your direction and judgment with your agent's …
content/sections/landing.mdx:2:   title: DX Harness — design in code with confidence
content/sections/landing.mdx:3:   description: DX Harness gives coding agents a shared design language, …
content/sections/landing.mdx:52:  … reviewed interface. DX Design calls the right ones for you.
content/sections/landing.mdx:68:  DX Harness bridges human judgment and agent execution. …
```

Nav and brand labels, which render the lowercase slug:

```tsx
// app/(landing)/layout.tsx:56 — inside the home Link, after <DxdMark />
              dx-harness
```

```tsx
// components/topbar.tsx:26-27
              <span className="sm:hidden">dx</span>
              <span className="hidden sm:inline">dx-harness</span>
```

Two further prose surfaces:

```tsx
// app/(docs)/overview/page.tsx:47
        dx-harness turns product intent, design decisions, and checkable standards into a
        workflow every team can use. …
```

```
content/sections/home.mdx:2:   title: dx-harness
```

One **stale, conflicting** statement that this plan must reconcile rather than
leave contradicting the new name:

```
content/getting-started/guardrails.mdx:18:
  <Check>**Design checks.** A design harness that flags UI which breaks the
  design standard. On a dx-harness repo that's [dx-harness](/harness/install);
  a DXD harness is on the way.</Check>
```

Conventions (from `CLAUDE.md`):

- Content lives in `content/`, page chrome in `components/`. Both are in scope
  here because the product name appears in both.
- Copy: second person, active voice, sentence case, plain language.
- SLP-9 applies to all prose; `content-lint.py` enforces it. Watch CNT-3 (25
  words per sentence) and CNT-13 (British spelling: "colour", "catalogue" is
  **wrong** here — this repo uses "catalog" as a deliberate carve-out).
- `content/sections/landing.mdx` is the markdown twin of the landing page: the
  two must stay in agreement.

## Commands you will need

Run from the repo root. A fresh worktree has no `node_modules` — install first.

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `pnpm install` | exit 0 |
| Typecheck | `pnpm exec tsc --noEmit` | exit 0 |
| Build (verifies MDX parses) | `pnpm build` | "Compiled successfully" |
| Unit tests | `pnpm test` | 92 pass |
| E2E | `pnpm test:e2e` | 43 pass |
| Content lint | `python3 plugins/dx-harness/checks/content-lint.py app components content lib` | no NEW findings (see note) |
| Other checks | `python3 plugins/dx-harness/checks/token-audit.py app components lib`, `a11y-static.py app components`, `type-scan.py app components` | exit 0 |

**Note on `content-lint.py`**: it already reports 8 pre-existing findings at
`bd48006` in files this plan does not touch (`app/(landing)/layout.tsx`,
`components/catalog-browser.tsx`, `components/compare.tsx`,
`components/ui/sidebar.tsx`, `components/ui/tooltip.tsx`,
`components/landing/blueprint.tsx`, `lib/loop.test.ts`). Capture that baseline
**before** you edit anything, and confirm at the end that your diff adds none.

## Scope

**In scope**:
- `app/layout.tsx` — site metadata
- `app/(landing)/page.tsx` — landing metadata, the `COLLABORATORS` label, two prose paragraphs
- `app/(landing)/layout.tsx` — nav brand label
- `app/(docs)/overview/page.tsx` — one prose paragraph
- `components/topbar.tsx` — brand label
- `content/sections/landing.mdx` — frontmatter and prose
- `content/sections/home.mdx` — frontmatter title
- `content/getting-started/guardrails.mdx` — the stale "a DXD harness is on the way" line

**Out of scope** (do NOT touch):
- **Any install command, plugin id, or command name**: `/plugin install
  dx-harness@dx-harness`, `/plugin marketplace add transformteamsg/dx-harness`,
  `/dx-harness:dx-design*`, and every `github.com/transformteamsg/dx-harness`
  URL stay **exactly** as they are. These are real identifiers.
- `components/landing/feature-figure.tsx`, `app/globals.css`,
  `components/landing/harness-run.tsx`, `tests/site-contract.spec.ts` — other
  agents are working in these on separate branches.
- Generic "the harness" prose in docs pages (`content/sections/harness.mdx`,
  `for-agents.mdx`, `how-to-read.mdx`, `governance/changes.mdx`,
  `guidelines/data-viz.mdx`, `getting-started/plan.mdx`). On a site whose
  subject is the design harness, "the harness" reads correctly, and
  find-and-replacing it to "the design harness" would bloat sentences past
  CNT-3 and read as nervous over-qualification. Only the surfaces listed in
  scope carry the *product name*.
- `plugins/` — the plugin's own files are not the website.

## Git workflow

- You are on a dedicated branch in a dedicated worktree — commit there.
- One commit. Subject:
  `feat(\`site\`): name the product DX Design Harness`
- Do NOT push and do NOT open a PR.

## Steps

### Step 1: Capture the content-lint baseline

Run `python3 plugins/dx-harness/checks/content-lint.py app components content lib`
and save the full output. You will diff against it in step 8. Expect 8
findings, none in your in-scope files.

**Verify**: you have the baseline recorded.

### Step 2: Site and page metadata

`app/layout.tsx` lines 7 and 9:

```tsx
  title: { default: "DX Design Harness", template: "%s — DX Design Harness" },
```

and the description becomes: `"The DX Design Harness gives your agent one front
door, checkable standards, and an independent reviewer before the work ships."`

`app/(landing)/page.tsx` lines 13 and 15:

```tsx
  title: { absolute: "DX Design Harness — design in code with confidence" },
```

and the description becomes: `"The DX Design Harness gives coding agents a
shared design language, the right skills for each task, and a review before the
work returns to you."`

**Verify**: `grep -c '"DX Harness' app/layout.tsx "app/(landing)/page.tsx"` → `0`.

### Step 3: Landing prose and the collaborator label

`app/(landing)/page.tsx`:

- line 72, the middle `COLLABORATORS` entry: `label: "DX Design Harness",`.
  This label renders under a small ink mark in a three-column row, so keep it
  short — do not add words around it.
- line 280: `DX Harness bridges human judgment…` → `The DX Design Harness
  bridges human judgment and agent execution. …` (keep the rest of the
  sentence as-is).
- line 305: same treatment — `The DX Design Harness bridges your direction and
  judgment with your agent's …`.

Check both prose lines still read as sentences after the article is added, and
that neither crosses 25 words (CNT-3).

**Verify**: `grep -c "DX Design Harness" "app/(landing)/page.tsx"` → `4`.

### Step 4: The hero paragraph names the harness explicitly

The landing hero currently reads "A design harness gives your coding agent a
shared design language, …" — an indefinite "a design harness", which describes
a category rather than naming this product. Change the opening to name it:

> The DX Design Harness gives your coding agent a shared design language, the
> right skills for each task, and a review before the work comes back to you.

Apply the same wording in **both** places it appears: the JSX hero paragraph in
`app/(landing)/page.tsx` and the matching line in
`content/sections/landing.mdx`. The two must agree word for word.

**Verify**: `grep -c "The DX Design Harness gives your coding agent" "app/(landing)/page.tsx" content/sections/landing.mdx` → each file reports `1`.

### Step 5: The markdown twin

`content/sections/landing.mdx`:

- line 2: `title: DX Design Harness — design in code with confidence`
- line 3: description matching step 2's landing description exactly.
- line 52: `DX Design calls the right ones for you.` → `The DX Design Harness
  calls the right ones for you.` ("DX Design" alone is the orchestrator skill's
  name, so leaving it here reads as the skill rather than the product.)
- line 68: `DX Harness bridges human judgment…` → `The DX Design Harness
  bridges human judgment…`, matching step 3.

**Verify**: `grep -c "DX Harness" content/sections/landing.mdx` → `0`;
`grep -c "DX Design Harness" content/sections/landing.mdx` → `4`.

### Step 6: Nav and brand labels

These render the lowercase slug beside the mark. Change the visible label only.

`app/(landing)/layout.tsx` line 56: `dx-harness` → `dx-design-harness`.

`components/topbar.tsx` lines 26-27: keep the two-breakpoint structure and
change the wide label:

```tsx
              <span className="sm:hidden">dx</span>
              <span className="hidden sm:inline">dx-design-harness</span>
```

The narrow-viewport `dx` stays as-is — it is a space-constrained abbreviation.
After this change, check at 320px and 360px that the topbar does not overflow
or wrap awkwardly: `dx-design-harness` is 6 characters longer than what it
replaces, and it sits in a row with a version chip. **If it overflows or forces
a wrap that breaks the bar's alignment, STOP and report the measured widths**
rather than shrinking type below the 12px floor (TYP-2) or dropping the chip.

**Verify**: `grep -c "dx-design-harness" "app/(landing)/layout.tsx" components/topbar.tsx` → each reports `1`; and no horizontal overflow at 320/360 (measure `document.documentElement.scrollWidth` against `window.innerWidth` on a page that renders the topbar).

### Step 7: The docs overview and the two remaining content files

`app/(docs)/overview/page.tsx` line 47: `dx-harness turns product intent, …` →
`The DX Design Harness turns product intent, design decisions, and checkable
standards into a workflow every team can use.` Keep the following sentence
unchanged.

`content/sections/home.mdx` line 2: `title: dx-harness` → `title: DX Design
Harness`.

`content/getting-started/guardrails.mdx` line 18 is stale — it promises "a DXD
harness is on the way" while pointing at this product as though it were something else.
Rewrite the sentence so it names this product and drops the obsolete promise,
keeping the `<Check>` wrapper, the bold lead-in, and the
`[…](/harness/install)` link. Target shape:

> **Design checks.** A design harness that flags UI which breaks the design
> standard. On this repo that is the [DX Design Harness](/harness/install).

**Verify**: `grep -c "DXD harness is on the way" content/getting-started/guardrails.mdx` → `0`.

### Step 8: Full gate and the lint diff

Run, expecting each clean:

1. `python3 plugins/dx-harness/checks/token-audit.py app components lib` → exit 0
2. `python3 plugins/dx-harness/checks/a11y-static.py app components` → exit 0
3. `python3 plugins/dx-harness/checks/type-scan.py app components` → exit 0
4. `python3 plugins/dx-harness/checks/content-lint.py app components content lib`
   → compare against your step-1 baseline; **your diff must add zero new
   findings.** If it adds any, fix the wording rather than accepting it.
5. `pnpm exec tsc --noEmit` → exit 0
6. `pnpm build` → "Compiled successfully" (this is what proves the MDX parses)
7. `pnpm test` → 92 pass
8. `pnpm test:e2e` → 43 pass

Then a final guard that no identifier was caught by a careless replace:

```
grep -rn "dx-design-harness@\|install dx-design-harness\|marketplace add transformteamsg/dx-design-harness\|/dx-design-harness:" app content components
```

→ must return **nothing**. Any hit means an install command or command name was
renamed and must be reverted.

Then commit per the git workflow above.

## Test plan

- No new tests. `pnpm build` is the MDX gate; `pnpm test:e2e` is the regression
  net — note that `tests/site-contract.spec.ts` asserts landing headings and
  copy, so if any e2e assertion fails on a string you changed, **STOP and
  report it** rather than editing the test: that file is out of scope because
  another agent is working in it.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rc "DX Harness" app content components` → 0 in every file
- [ ] `grep -rn "dx-harness" app content components` returns **only** install
      commands, `/dx-harness:` command names, and `github.com/transformteamsg/dx-harness` URLs
- [ ] `pnpm build` succeeds; `pnpm test` 92 pass; `pnpm test:e2e` 43 pass
- [ ] `tsc --noEmit`, token-audit, a11y-static, type-scan all exit 0
- [ ] `content-lint.py` adds zero findings against the step-1 baseline
- [ ] No horizontal overflow at 320 and 360 on a page rendering the topbar
- [ ] `git status --short` shows changes only in the eight in-scope files

## STOP conditions

Stop and report back (do not improvise) if:

- The drift check shows an in-scope file changed since `bd48006` and the
  excerpts no longer match.
- The longer nav label overflows or breaks the topbar at 320 or 360 — report
  measured widths and let the reviewer decide between abbreviating, hiding the
  version chip, or a different breakpoint.
- An e2e assertion fails on a string you changed (the test file is out of
  scope).
- `content-lint.py` reports a new finding you cannot resolve without changing
  the agreed name.
- You find a product-name occurrence outside the eight in-scope files — report
  it, do not silently widen scope.

## Maintenance notes

- **The name and the identifier are deliberately different now.** The product
  is "DX Design Harness"; the plugin remains `dx-harness`. Anyone editing
  install docs must keep the identifier literal.
- When the eng harness lands, the umbrella question reopens: "DX Harness" is
  now free to become the family name, with this product and the eng harness as
  siblings. This plan deliberately did not claim it.
- Generic "the harness" prose in docs was left alone on purpose. If the eng
  harness ever ships onto this same site, those pages need a second pass —
  that is the point at which the qualification becomes load-bearing.
