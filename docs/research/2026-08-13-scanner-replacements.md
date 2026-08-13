# Off-the-shelf replacements for the four bespoke scanners

Research note resolving [issue #116](https://github.com/transformteamsg/dx-harness/issues/116).
Date: 2026-08-13. Status: research only — no code changed.

**Question.** What off-the-shelf, deterministic tooling could replace or narrow the DX
harness's bespoke check scripts, and what would each cost?

Every claim below is cited to a primary source (official docs, the tool's own repo, the
npm registry) or to a file:line in this repo. Package sizes come from
`registry.npmjs.org/<pkg>/latest` (`dist.unpackedSize`, `fileCount`, `dependencies`),
fetched 2026-08-13.

---

## Bottom line

| Scanner | Controls claimed | Recommendation | Decidable now? |
|---|---|---|---|
| `a11y-static.py` + `contrast.py` | A11Y-1/2/3/8 | **Narrow sharply, then layer.** Delete the KBD and NAME rules (jsx-a11y does them properly, already installed). Delete `contrast.py`'s ERROR path (it is provably wrong). **Keep** the FOCUS rule — axe has no rule for it. Add a rendered-DOM tier. | **Needs an owner decision** — see §6 |
| `content-lint.py` | CNT-1/3/5/6/9/12/13, SLP-9 | **Narrow, and invert.** Vale owns the rule bodies (~85%, much of it near-verbatim off the shelf); the script shrinks to a string extractor (~15%) because Vale reads only *comments* from `.tsx`. Stop running prose rules over raw TSX — that is where its false positives come from. | Decidable now |
| `type-scan.py` | TYP-1/2/3/4 | **Keep.** Nothing off-the-shelf can read Tailwind utilities out of JSX. Stylelint sees CSS files only. | Decidable now |
| `token-audit.py` | TOK-1/2/3, COL-1/2 | **Keep**, optionally add stylelint for the `.css` files only. Same reason as `type-scan.py`. | Decidable now |

The headline finding is not about any tool. It is that **the harness already has
`axe-core@4.12.1` and `eslint-plugin-jsx-a11y@6.10.2` installed** and uses almost none of
either. See §2.

---

## 1. The baseline the replacements must beat

`plugins/dx-harness/checks/` is 13 scripts, 9,258 lines. The five in scope are 3,972 of
them (43%):

| Script | Lines |
|---|---|
| `content-lint.py` | 1,240 |
| `token-audit.py` | 866 |
| `type-scan.py` | 746 |
| `contrast.py` | 623 |
| `a11y-static.py` | 497 |

**Cost profile, measured.** `python3 checks/detect.py app components lib --json` runs in
**0.27s**. The scripts import only the Python standard library — `argparse`, `fnmatch`,
`importlib.util`, `json`, `os`, `re`, `subprocess`, `sys`, `typing`. No pip install, no
`node_modules`, no browser, no network. `validate.py` alone needs `pyyaml`.

This matters more than it looks. The harness runs against **product repos it does not
own** — `detect.py` takes `--repo-root <path>`, and `waiver-reconcile.py` /
`reaudit-scope.py` accept it explicitly "for consumer repos; the catalog tiers always come
from the harness" (`plugins/dx-harness/checks/README.md:221`). The current design's real
achievement is that it needs **nothing installed in the target repo**. Any replacement has
to preserve that or pay for breaking it.

None of the candidate tools are installed on this machine — `command -v vale stylelint
pa11y axe lighthouse cspell textlint` returns nothing. Every option below is a net-new
install.

---

## 2. What is already installed (correcting the ticket)

The ticket states: *"Playwright is installed, axe-core / pa11y / eslint-plugin-jsx-a11y are
not."* **The second half is wrong.**

```
$ pnpm why axe-core
axe-core@4.12.1
└─┬ eslint-plugin-jsx-a11y@6.10.2
  └─┬ eslint-config-next@15.5.19
    └── dx-harness@0.1.0 (devDependencies)
```

Both are present transitively via `eslint-config-next`. But almost none of it is switched
on. Extracting the published tarball of `eslint-config-next@15.5.19` shows it enables
exactly **6** jsx-a11y rules, all at `warn` (`package/index.js:67-78`):

```
jsx-a11y/alt-text, aria-props, aria-proptypes,
aria-unsupported-elements, role-has-required-aria-props, role-supports-aria-props
```

Confirmed live: `npx eslint --print-config components/ui/button.tsx` reports the same 6.

The plugin ships **39 rules**; `recommended` enables 31 of them (34 listed, 3 set to
`off`). **The rules that would cover A11Y-2 and A11Y-3 are among the 33 that are off**:

| Off today | Covers |
|---|---|
| `click-events-have-key-events` | A11Y-2 (the KBD rule's job) |
| `no-static-element-interactions` | A11Y-2 |
| `interactive-supports-focus` | A11Y-2 |
| `label-has-associated-control` | A11Y-3 |
| `anchor-is-valid`, `heading-has-content`, … | A11Y-6/7 |
| `lang` | A11Y-9 — and note this one is **not in `recommended` either** |

### Measured: what turning them on finds

Running the full jsx-a11y `recommended` set against `app/` and `components/` — a repo
whose own `a11y-static.py` reports **zero** findings — produces **1** finding:

```
components/diagrams/orbit-loop.tsx
  319:7  error  Elements with the 'tablist' interactive role must be focusable
                jsx-a11y/interactive-supports-focus
```

That is arguably a false positive (an ARIA `tablist` uses roving tabindex; the tabs are
focusable, the container needn't be). But the *low* number is the point: the maintainers'
curated defaults encode real ARIA exceptions. Their `no-noninteractive-tabindex` ships as:

```json
["error", {"tags":[],"roles":["tabpanel"],"allowExpressionValues":true}]
```

— i.e. `role="tabpanel" tabIndex={0}` is explicitly allowed, which is exactly what
`orbit-loop.tsx:380` does and exactly what the ARIA Authoring Practices call for. Running
**all 39** rules instead of `recommended` produces 8 findings, 5 of them from rules the
maintainers deliberately disable (`control-has-associated-label`, `label-has-for`,
`prefer-tag-over-role`). 497 lines of regex has no equivalent of that calibration.

---

## 3. Accessibility — `a11y-static.py` + `contrast.py`

### 3.1 What the scripts admit about themselves

`a11y-static.py` documents its own false positives. Verbatim, `a11y-static.py:40-46`:

> Focus styles inherited from shared CSS files the line-local rule cannot see.
> If a component applies outline-none in JSX but a parent stylesheet provides
> `:focus-visible` recovery, this script will flag it as a false positive. See the
> false-positive note in the docstring. **Line-local static analysis cannot
> eliminate this class of false positive without cross-file CSS resolution (a
> browser / axe job).** When in doubt, verify the rendered element with a keyboard
> before treating the flag as a bug.

The script names its own replacement. Its "does NOT verify" list (`a11y-static.py:31-39`)
concedes contrast, hit-area, focus traversal order, and ARIA state tracking.

There is a second, undocumented failure mode — a deliberate false *negative*.
`a11y-static.py:99`:

```python
r"|\bring-\w+\b"  # ring-* utility (common enough to pass; see calibration note)
```

Any `ring-` token anywhere on the line suppresses the FOCUS finding, whether or not it is
attached to a focus variant. Similarly the KBD rule (`a11y-static.py:166-174`) is
suppressed by the mere presence of `role=` — including `role="presentation"` — and never
checks for a key handler at all. And the NAME rule gives up entirely on multi-line
elements (`a11y-static.py:220-221`).

### 3.2 Measured: `contrast.py` is wrong

Run against this repo, `contrast.py` emits exactly one ERROR and zero NOTEs:

```
ERROR components/ui/button.tsx:19 [A11Y-1] text #ce2c31 on #ce2c31 = 1.00:1 (below 4.5:1)
```

A 1.00:1 ratio means it resolved foreground and background to the *same colour*. The line
(`components/ui/button.tsx:19`) is:

```
"bg-destructive/10 text-destructive hover:bg-destructive/20 …"
```

The background is `destructive` at **10% opacity**; the foreground is `destructive` at
100%. `contrast.py` ignores the `/10` alpha modifier and compares `#ce2c31` to itself.
`grep -n "alpha\|opacity\|/10\|slash" checks/contrast.py` returns **zero matches** — there
is no alpha handling in the file at all.

So on the harness's own repo, `contrast.py`'s precision is **0 of 1**. Its single finding
is a false positive, produced by a limitation its own docstring does not list.

This is not a bug to patch. Alpha compositing requires knowing what is painted *behind* the
element, which is a rendered-DOM property. axe-core treats exactly this case as
undecidable — `fgAlpha`: *"Element's foreground color could not be determined because of
alpha transparency"*
([color-contrast.json](https://github.com/dequelabs/axe-core/blob/develop/lib/checks/color/color-contrast.json)).
axe returns "incomplete"; `contrast.py` guessed, and guessed wrong.

### 3.3 The static-versus-rendered split, all 11 controls

**S** = decidable on source · **R** = needs a rendered DOM · **R+** = needs a rendered DOM
*plus interaction*.

| # | Control | Verdict | Why | Best off-the-shelf |
|---|---|---|---|---|
| 1 | Contrast 4.5:1 / 3:1 | **R** (token pairs are S) | Needs computed style, stacking context, alpha. The 3:1 **UI-component** half has **no rule in any tool surveyed** | axe `color-contrast` in a real browser |
| 2 | Keyboard reachable + **visible focus** | reach **S/R**, indicator **R** | **axe has no rule for a focus indicator at all** (0 of 105 rules mention focus-visible/outline) | jsx-a11y `click-events-have-key-events`, `interactive-supports-focus` + stylelint `a11y/no-outline-none` |
| 3 | Programmatic + visible label | **S** same-file, **R** cross-component | `htmlFor`↔`id` across two files is statically unresolvable | jsx-a11y `label-has-associated-control` + axe `label` |
| 4 | Target ≥24px (44 mobile) | **R, hard** | Pure layout geometry | axe `target-size` (**disabled by default**) |
| 5 | prefers-reduced-motion | **S — the only fully static control** | A CSS authoring fact. **No DOM tool checks it** | `@double-great/stylelint-a11y` `a11y/media-prefers-reduced-motion` |
| 6 | Text alternatives | **S** literal, **R** computed | `aria-labelledby` chains aren't source-visible | jsx-a11y `alt-text` + axe `image-alt`, `svg-img-alt` |
| 7 | Semantic structure | **R** mostly | `<ul>` and `<li>` may live in different components; heading order is whole-page | axe `list`, `heading-order` + IBM `fieldset_legend_valid` |
| 8 | Custom components expose name/role/value | **R+** | jsx-a11y can't see through a component; axe can't see a *closed* dialog | axe `aria-*` suite, after driving the component open |
| 9 | Title + lang | **R** | `document.title` may be set by the router at runtime | axe `document-title`, `html-has-lang` |
| 10 | Bypass blocks | **R** | Whole-page property composed across layout files | axe `bypass` (**review-only, never hard-fails**); IBM `skip_main_exists` is stronger |
| 11 | Async announced + focus managed | **R+** | Needs to observe a live-region mutation and focus movement over time | **Nothing off-the-shelf** |

**Counts: genuinely static → 1 (A11Y-5), with partial static value in 2, 3, 6. Rendered
required → 1, 4, 7, 9, 10 outright; 2, 8, 11 need rendering plus interaction.**

A source-only scanner can honestly cover about **1.5 of 11 controls**. The 497-line
scanner is structurally checking things it cannot see. That is the finding — not the
choice of tool.

### 3.4 Candidates

**axe-core** — 105 rules, **3.11 MB unpacked, 30 files, zero runtime dependencies**. Its
README claims *"on average 57% of WCAG issues"* automatically and *"It returns zero false
positives (bugs notwithstanding)"*
([README](https://github.com/dequelabs/axe-core/blob/develop/README.md)). It buys that by
routing ambiguity to `incomplete` — *"nodes [that] could neither be determined to
definitively pass or definitively fail"*
([API.md](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)). Two limits that
matter here:

- *"Axe does not test hidden regions, such as inactive menus or modal windows"* (API.md).
  Most A11Y-8 and A11Y-11 defects live in exactly those.
- *"Currently the `color-contrast` rule is known not to work with JSDOM"* (README) — which
  rules out any jsdom shortcut for A11Y-1.

`color-contrast` returns `incomplete` for 14 distinct reasons including `bgImage`,
`bgGradient`, `fgAlpha`, `bgOverlap`, `pseudoContent`, and `outsideViewport`. **Gating CI
on `violations.length === 0` will pass pages with real contrast failures**; `outsideViewport`
alone means you must scroll or use a tall viewport or most of the page goes unevaluated.

Verified locally against the installed copy: `target-size` **is disabled by default**
(`axe._audit.rules.find(r => r.id === 'target-size').enabled === false`), and 9 rules ship
disabled overall. Lighthouse re-enables `target-size` explicitly
([source](https://github.com/GoogleChrome/lighthouse/blob/main/core/gather/gatherers/accessibility.js)),
a useful signal that it is production-ready.

**eslint-plugin-jsx-a11y** — already installed. Its own README states the split plainly:

> This plugin does a static evaluation of the JSX to spot accessibility issues in React
> apps. Because it **only catches errors in static code**, use it in combination with
> `@axe-core/react` to test the accessibility of the rendered DOM.

That is the recommended architecture, from the tool itself.

**`@axe-core/playwright`** — 47 KB, 7 files, one dependency (`axe-core`), peer
`playwright-core`. Playwright is already a devDependency here (`@playwright/test@1.61.1`)
and `playwright.config.ts` already runs a `webServer` on `127.0.0.1:3000`. Browser download
is ~648 MB for all three engines, or ~281 MB with
`npx playwright install --only-shell` ([docs](https://playwright.dev/docs/browsers)).

**`@double-great/stylelint-a11y`** — 154 KB, 53 files, peer `stylelint >=16`. The **only**
tool surveyed with a `prefers-reduced-motion` rule (A11Y-5), plus `a11y/no-outline-none`
and `a11y/selector-pseudo-class-focus` for A11Y-2's focus half. Source-level, no browser,
config can live outside the target repo. Best constraint-fit of anything here. Limit: it
sees CSS files only — Tailwind utilities and inline styles are invisible to it.

**IBM equal-access** — ~160 rules, 6.04 MB, drives Puppeteer. Uniquely has
`style_focus_visible`, `element_tabbable_visible/unobscured` (A11Y-2),
`target_spacing_sufficient` (A11Y-4, implements the SC 2.5.8 spacing exception), and
`input_fields_grouped` / `fieldset_legend_valid` (A11Y-7 form grouping — no other tool has
these). Its own docs ship `potentialviolation` / `recommendation` levels and a baseline
mechanism *"for managing false positives"*. Worth a second-opinion pass, not a gate.

**Rejected.** *pa11y-ci* — config-in-repo by default, *"tests URLs only — not source
files"*, and its engine ceiling is axe's anyway. *Lighthouse* — 18.98 MB, and it **disables
14 axe rules** including `nested-interactive` and `scrollable-region-focusable`, so it is
strictly weaker than calling axe directly. *html-validate* — good rules, no browser,
out-of-tree config, but **no JSX/TSX transformer exists**
([transformers](https://html-validate.org/usage/transformers.html)), so it needs emitted
HTML, where axe is better. *jest-axe* — requires writing tests into a repo you don't own;
disqualified by the constraint, and contrast doesn't work in jsdom anyway.

### 3.5 Recommendation

**Narrow the bespoke scripts hard, then layer.**

- **Delete** the KBD and NAME rules from `a11y-static.py`. `click-events-have-key-events`,
  `no-static-element-interactions`, `interactive-supports-focus` and
  `label-has-associated-control` do the same jobs on a real AST, with maintained ARIA
  exception tables, from a plugin already on disk.
- **Delete** `contrast.py`'s ERROR path. §3.2 shows it is wrong on this repo, and the
  failure class is unfixable statically. Its *token-pair* idea is worth keeping in some
  form — "do the design system's declared fg/bg token combinations pass?" is a real,
  answerable, source-level question, and axe cannot answer it. But that is a different
  check from scanning component lines.
- **Keep the FOCUS rule.** This is the surprise. **axe-core has no rule for a visible
  focus indicator** — 0 of 105. The bespoke rule covers something no rendered-DOM tool
  does. Fix its documented false positive by replacing the line-local regex with
  `@double-great/stylelint-a11y`'s `a11y/no-outline-none` + `selector-pseudo-class-focus`
  for CSS files, keeping the Tailwind-class half bespoke.
- **Add a rendered tier**, gated on a URL being available. §4 covers where the DOM comes
  from.

The tiering:

- **Tier 1 — always runs, nothing installed in the target repo.** `eslint
  --no-config-lookup --config <harness>/eslint.config.mjs`, plus `stylelint --config
  <harness>/stylelint.config.mjs`. ~1 MB, no browser, seconds. Covers A11Y-5 fully and
  A11Y-2/3/6/8 partially, labelled honestly as partial.
- **Tier 2 — runs when a URL is supplied.** Playwright + `@axe-core/playwright`, with
  `target-size` explicitly enabled, at two viewports, scrolled, reporting `violations` and
  `incomplete` in **separate buckets**. Covers 1, 4, 7, 9, 10 and the snapshot half of 2,
  6, 8.
- **Tier 3 — opt-in, needs a bootable app.** Playwright interaction scripts for A11Y-8
  (open each overlay, re-run axe) and A11Y-11. No tool does this; it stays bespoke, but as
  Playwright assertions rather than regex.

---

## 4. Where the rendered DOM comes from

This is the crux for a repo the harness does not own.

| Option | Cost | Fails when | Verdict |
|---|---|---|---|
| **A. Deployed / preview URL** | ~0 setup + chromium-headless-shell (~281 MB, cached once) | No public deploy; auth walls; URL unknown to the harness; tests `main` not the branch | **Cheapest, highest fidelity when available.** The harness should *ask* for a URL, not infer one |
| **B. Build a static export** | Full `install` (network, lockfile risk, postinstall scripts from an untrusted repo) + framework-specific export | App isn't statically exportable — server components, auth, dynamic routes. Very common | Expensive and brittle; also gives un-hydrated HTML, so A11Y-8/11 stay invisible |
| **C. Dev server + Playwright** | B's cost plus port allocation, readiness polling, teardown, env/secrets | Repo needs a DB or API keys | Highest fidelity, highest cost. **Only option that reaches A11Y-8 and A11Y-11** |
| **D. jsdom render** | Requires the target repo's test setup | Always, under this constraint. And contrast doesn't run in jsdom | **Disqualified** |

**The asymmetry to design around:** B–D all require executing the target repo's toolchain,
the exact coupling the harness avoids. A requires nothing from the repo but is not always
available.

**The cost is lower than it looks**, because the harness already opens a browser. The
verify phase (`plugins/dx-harness/skills/design/dx-design/verify.md:20-48`) already
requires rendering and screenshotting at 360/768/1280 via `agent-browser`, Claude-in-Chrome,
or "the local Playwright fallback". **Adding `axe.run()` at the moment the page is already
open and already at the target viewport is close to free.** That, not the install size, is
the real argument for Tier 2.

---

## 5. The other three scanners

### 5.1 `content-lint.py` → **narrow**

**Measured false-positive rate.** 45 findings on this repo (19 CNT-3, 13 CNT-6, 5 SLP-9, 5
CNT-5, 2 CNT-1, 1 CNT-13). Spot-checking found at least 6 clear false positives — **13%**,
on the repo the harness holds up as exemplary:

| Finding | Reality |
|---|---|
| `catalog-browser.tsx:34 [CNT-1] raw error code "INPUT"` ×2 | The line is `tag === "INPUT" \|\| tag === "TEXTAREA"` — a DOM `tagName` comparison, not copy |
| `sidebar.tsx:682 [CNT-3] sentence of 30 words` | The "sentence" is a **Tailwind class string** |
| `tooltip.tsx:53 [CNT-3] sentence of 33 words` | Same |
| `colour.mdx:9 [CNT-13] spelling "Colors"` | The text is **"Radix Colors"** — a product name |
| `compare.tsx:74 [SLP-9] buzzword "Revolutionise"` | A deliberately quarantined anti-specimen carrying `dx-waive SLP-9` on the line above. `grep -n "dx-waive" checks/content-lint.py` returns **nothing** — the script has no waiver handling at all |

**Root cause, and it is structural.** `content-lint.py:112-114` sets
`TARGET_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte",
".mdx", ".md"}`. It runs prose rules over TypeScript source. A prose linter that parses
Markdown/MDX properly cannot produce the class-string or `tagName` false positives, because
it never looks there.

**Vale** is the right rule engine and it satisfies the constraint cleanly. Config discovery
order is `--config` flag → `VALE_CONFIG_PATH` env var → `.vale.ini` walking up from cwd →
global config ([.vale.ini docs](https://docs.vale.sh/topics/.vale.ini)); `StylesPath` may be
absolute and is separately overridable via `VALE_STYLES_PATH`
([StylesPath](https://docs.vale.sh/keys/stylespath)); `--no-global` suppresses the global
config ([CLI](https://docs.vale.sh/topics/cli)). **So both config and styles can live
entirely in the harness — nothing is committed into the target repo.** It ships as a single
Go binary with no external dependencies for basic functionality.

**But there is a hard limit that shapes the whole recommendation.** Vale parses Markdown,
**MDX** (native since v3.18.0), HTML, AsciiDoc and reStructuredText as markup — and for
source code it reads **comments only**, across 24 languages, with TypeScript listed as
`.ts, .tsx` ([code format docs](https://docs.vale.sh/formats/code.md)). **JSX text nodes,
string literals, `aria-label`s and error-message constants are invisible to it.** MDX has a
related limit: *"nothing inside `<Component>...</Component>` is linted"*
([MDX format](https://docs.vale.sh/formats/mdx.md)).

So Vale cannot simply be pointed at a React repo and replace the scanner. The seam that
rescues it: `--ext` and `--path` assign a pseudo-extension and a real file path to
**stdin**, so a thin extractor can pipe strings out of TSX as pseudo-Markdown and still get
alerts carrying true file locations.

**Off-the-shelf rules that already are these controls.** Several are near-verbatim:

| Control | Existing rule | Gap |
|---|---|---|
| CNT-5 device verbs | [`Microsoft/UIVerbs.yml`](https://github.com/errata-ai/Microsoft/blob/master/Microsoft/UIVerbs.yml) — already excludes `right-click`/`double-click` | Add `tap`, `press` tokens |
| CNT-3 length | [`Microsoft/SentenceLength.yml`](https://github.com/errata-ai/Microsoft/blob/master/Microsoft/SentenceLength.yml) (`occurrence`, `scope: sentence`) | Retune `max: 30` → `25` |
| CNT-12 sentence case | [`Microsoft/Headings.yml`](https://github.com/errata-ai/Microsoft/blob/master/Microsoft/Headings.yml) — `capitalization`, `match: $sentence`, `exceptions` list | Supply the proper-noun list |
| CNT-9 acronyms | [`Google/Acronyms.yml`](https://github.com/errata-ai/Google/blob/master/Google/Acronyms.yml) — a `conditional` check, exactly "defined on first use" | None |
| CNT-6 filler | `Microsoft.Wordiness`, `Google.Jargon`, write-good's weasel/adverb rules | None |
| SLP-9 AI tells | [`tbhb/vale-ai-tells`](https://github.com/tbhb/vale-ai-tells) (78 rules, MIT, active), [`JMill/deslop`](https://github.com/JMill/deslop) (34), [`vale-signs-of-ai-writing`](https://github.com/ammil-industries/vale-signs-of-ai-writing) | Covers buzzwords, negative parallelism, em-dash overuse, filler |
| CNT-13 spelling | Vale defaults to **American** English; better handled by [cspell](https://cspell.org/docs/dictionaries) with `--locale en-GB` and `--config <harness>/cspell.json --no-config-search` | None |

Vale's `capitalization` check settles a question the ticket left open: **CNT-12 is not
inherently bespoke.** The computation is deterministic (`match: $sentence`, `threshold`
default 0.8); the proper-noun list is knowledge you supply — which is exactly what would
have fixed the "Radix Colors" false positive above.

**What no deterministic tool can do**, and where the script should stop claiming partial
coverage:

| Control | Deterministic share | Why the rest is irreducible |
|---|---|---|
| CNT-1 error messages | ~20% | "States what to do next" requires judging whether a remedy is present, actionable, and correct *for that error* |
| CNT-6 droppable words | ~80% | "Droppable articles/conjunctions" requires a meaning-preservation test |
| CNT-9 clear copy | mixed | Acronyms 100%; "one idea per sentence" is judgment — comma counts measure something adjacent, not the thing |
| SLP-9 label/helper pairs | **0%** | Comparing two adjacent UI strings for semantic redundancy is not a prose problem. No prose linter models a label/helper pair |

Roughly **60–65% of this control set is genuinely deterministic**, and off-the-shelf tooling
already implements most of that. The remaining third is irreducibly semantic.

**Recommendation: narrow, don't replace — and invert what the script is for.**
`content-lint.py`'s durable value is the ~15% that *finds the strings* in TSX; its
replaceable value is the ~85% of regex rule bodies.

1. Vale as the rule engine, config and styles in the harness, invoked with `--config
   --no-global` and an absolute `StylesPath`. Adopt Microsoft + Google + an AI-tells package.
2. Keep a thin Python extractor for TSX copy, piped via `vale --stdin --ext=.md
   --path=<real/path>`. This is the only way to reach JSX string literals.
3. Stop running prose rules over raw `.tsx` text. That single change removes the
   class-string and `tagName` false-positive classes measured above.
4. Set levels deliberately: **only `error` sets a non-zero exit code** in Vale, so on repos
   the harness doesn't own, ship most rules as `warning`/`suggestion`.
5. Route CNT-1, CNT-9's "one idea", CNT-6's "droppable", and SLP-9's label/helper pairs to
   the evaluator and drop the "partial" deterministic claim on them.

**The catalog-coupling cost is real.** `content-lint.py:9-14` reads its word lists from
`standards/controls/*.md` at runtime "so the lint and the catalog can never diverge". Vale
styles would need generating from those files to preserve that guarantee.

**Rejected.** *LanguageTool* — needs a JVM and a long-lived server; the public API caps at
20 requests/IP/minute and explicitly says *"do not send automated requests"*
([API limits](https://dev.languagetool.org/public-http-api)), and AI-based rules are
cloud-only. *alex* — inclusive-language only; touches none of these controls; last pushed
2024-11-27. *retext* — a library with no first-class CLI (using it means rebuilding a
bespoke scanner with borrowed word lists), and `retext-simplify` has been idle ~3 years.
*textlint* — workable, but rule resolution needs `--rules-base-directory`, which its own
docs list as **experimental**, and most of the ecosystem is Japanese-specific.

**Cost:** one Go binary, no runtime deps, no browser, config outside the target repo.

### 5.2 `type-scan.py` → **keep**

The controls are TYP-1 (typeface), TYP-2 (size floor, line-height), TYP-3 (on-scale sizes),
TYP-4 (all-caps). In this codebase, all of these are expressed as **Tailwind utility
classes inside JSX `className` strings**.

**Stylelint cannot see them.** Its `--config` can point outside the target repo and
`--config-basedir` resolves plugin paths ([CLI docs](https://stylelint.io/user-guide/cli/)),
so the constraint is satisfiable — but its documented file types are `.css`, `.scss`,
`.sass`, and it has no native support for class names in JSX. A CSS linter pointed at a
Tailwind codebase sees `app/globals.css` and essentially nothing else.

`eslint-plugin-tailwindcss` is the obvious alternative and it **fails the constraint
directly**. For Tailwind v4 it must resolve the target repo's CSS-based theme config, and
its own tracker documents this breaking:
[#428 "Could not resolve tailwindcss at TailwindUtils.loadConfigV4"](https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/428),
[#418 "Cannot resolve default tailwindcss config path"](https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/418).
Tailwind v4 dropped `tailwind.config.js` for CSS-first `@theme`, and the plugin needs to
load the target's theme to know which classes are valid. That is a build-coupled dependency
on a repo the harness does not own.

**Recommendation: keep.** `type-scan.py` currently reports **zero** findings on this repo,
and its docstring is unusually honest about its limits (`type-scan.py:40-55` concedes font
weights, the 12-vs-14px label ambiguity, px/% line-heights, and camelCase inline styles).
This is the one scanner where bespoke regex is genuinely the reasonable answer, because the
thing being checked is a string in a JSX attribute and no mature tool reads those against a
design scale.

### 5.3 `token-audit.py` → **keep**

Same argument, same evidence. TOK-1 (raw hex), TOK-2 (spacing scale), TOK-3 (radius scale),
COL-1/2 are checked against Tailwind utility classes and CSS values. Reports **zero**
findings on this repo.

The design-token ecosystem does not help: Style Dictionary, Terrazzo, and the W3C Design
Tokens format are **build/generation** tools, not usage linters. They emit tokens; they do
not tell you that `bg-red-500` bypassed the semantic layer.

Stylelint's `color-no-hex` and `declaration-property-value-allowed-list`, plus
`stylelint-declaration-strict-value`, genuinely cover TOK-1 **for `.css` files**. That is a
narrow but real win, and worth taking if `.css` files are a meaningful surface in target
repos. It does nothing for the JSX half, which is where the violations actually live.

**Recommendation: keep.** Optionally add stylelint scoped to `.css` only, as a
belt-and-braces layer with an out-of-tree config. Do not attempt to replace the JSX scan.

---

## 6. Decidable now vs. needs an owner decision

**Decidable now — no further input needed:**

1. `type-scan.py` and `token-audit.py`: **keep**. Nothing off-the-shelf reads Tailwind
   utilities out of JSX; the alternatives are build-coupled to repos the harness doesn't own.
2. `content-lint.py`: **stop running prose rules over raw `.tsx`/`.ts` text.** This
   eliminates the largest measured false-positive class, with or without Vale. (UI copy in
   TSX still needs checking — but via extraction, not by treating the file as prose.)
3. `contrast.py`: **its ERROR path is provably wrong** (§3.2) and should not gate anything
   until alpha is handled — which cannot be done statically.
4. **Turn on the jsx-a11y rules already installed.** Zero install cost. `recommended`
   produces 1 finding on this repo.

**Needs a decision from the harness owners:**

1. **Does the harness take on a rendered-DOM tier at all?** This is the real question behind
   the ticket. It is the only way to reach A11Y-1, 4, 7, 9, 10 honestly. The install is
   modest (`@axe-core/playwright` 47 KB + axe-core 3.11 MB; Playwright already present;
   ~281 MB browser with `--only-shell`), and the harness *already opens a browser during
   verify*. The cost is not bytes — it is **owning the question of where the URL comes
   from** for a repo the harness doesn't control.
2. **If yes: which DOM source?** Option A (ask for a URL) is cheap and should probably be
   the only supported path initially. B and C mean executing an untrusted repo's toolchain.
3. **How are axe's `incomplete` results treated?** They cannot be ignored (that hides real
   failures) and cannot be gated on (too noisy). This needs a policy — probably a third
   report bucket feeding the manual pass, mirroring the existing `NOTE` channel.
4. **Is `a11y-static.py`'s FOCUS rule worth keeping bespoke?** It covers something axe has
   no rule for. Keeping it means keeping a known false-positive class; replacing the CSS
   half with `stylelint-a11y` fixes that but adds a dependency.
5. **Does Vale's config-generation cost outweigh the false-positive reduction?** Keeping
   the catalog-coupling guarantee means generating Vale styles from
   `standards/controls/*.md` — real work.

---

## 7. Sources

**In-repo:** `plugins/dx-harness/checks/a11y-static.py:31-46,99,166-174,220-221` ·
`checks/contrast.py:39-52` · `checks/content-lint.py:9-14,50-81,112-114` ·
`checks/type-scan.py:40-55` · `checks/token-audit.py:1-45` · `checks/README.md:221` ·
`checks/detect.py:1-60` · `skills/design/dx-design/verify.md:5-48` ·
`components/ui/button.tsx:19` · `components/catalog-browser.tsx:34` ·
`components/compare.tsx:72-74` · `content/foundations/colour.mdx:9` · `eslint.config.mjs` ·
`package.json` · `playwright.config.ts`

**axe-core:** [README](https://github.com/dequelabs/axe-core/blob/develop/README.md) ·
[API.md](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md) ·
[rule-descriptions.md](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) ·
[color-contrast.json](https://github.com/dequelabs/axe-core/blob/develop/lib/checks/color/color-contrast.json) ·
[target-size.json](https://github.com/dequelabs/axe-core/blob/develop/lib/rules/target-size.json) ·
[API documentation](https://www.deque.com/axe/core-documentation/api-documentation/)

**ESLint / jsx-a11y:**
[jsx-a11y README](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/README.md) ·
[ESLint CLI](https://eslint.org/docs/latest/use/command-line-interface) ·
[flat config](https://eslint.org/docs/latest/use/configure/configuration-files)

**Other a11y tools:**
[@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md) ·
[Playwright browsers](https://playwright.dev/docs/browsers) ·
[stylelint-a11y](https://github.com/double-great/stylelint-a11y) ·
[IBM equal-access rules](https://github.com/IBMa/equal-access/tree/master/accessibility-checker-engine/src/v4/rules) ·
[pa11y-ci](https://github.com/pa11y/pa11y-ci/blob/main/README.md) ·
[Lighthouse a11y gatherer](https://github.com/GoogleChrome/lighthouse/blob/main/core/gather/gatherers/accessibility.js) ·
[html-validate transformers](https://html-validate.org/usage/transformers.html)

**Prose tooling:**
[Vale .vale.ini](https://docs.vale.sh/topics/.vale.ini) ·
[Vale CLI](https://docs.vale.sh/topics/cli) ·
[Vale StylesPath](https://docs.vale.sh/keys/stylespath) ·
[Vale formats](https://docs.vale.sh/formats) ·
[Vale code format](https://docs.vale.sh/formats/code.md) ·
[Vale MDX format](https://docs.vale.sh/formats/mdx.md) ·
[Vale capitalization](https://docs.vale.sh/checks/capitalization) ·
[Vale FAQ](https://docs.vale.sh/guides/faq.md) ·
[Microsoft/UIVerbs.yml](https://github.com/errata-ai/Microsoft/blob/master/Microsoft/UIVerbs.yml) ·
[Microsoft/SentenceLength.yml](https://github.com/errata-ai/Microsoft/blob/master/Microsoft/SentenceLength.yml) ·
[Microsoft/Headings.yml](https://github.com/errata-ai/Microsoft/blob/master/Microsoft/Headings.yml) ·
[Google/Acronyms.yml](https://github.com/errata-ai/Google/blob/master/Google/Acronyms.yml) ·
[tbhb/vale-ai-tells](https://github.com/tbhb/vale-ai-tells) ·
[JMill/deslop](https://github.com/JMill/deslop) ·
[cspell dictionaries](https://cspell.org/docs/dictionaries) ·
[cspell getting started](https://cspell.org/docs/getting-started) ·
[LanguageTool public API limits](https://dev.languagetool.org/public-http-api) ·
[textlint CLI](https://github.com/textlint/textlint/blob/master/docs/cli.md) ·
[write-good](https://github.com/btford/write-good) ·
[proselint](https://github.com/amperser/proselint) ·
[alex](https://github.com/get-alex/alex)

**CSS / token tooling:**
[stylelint CLI](https://stylelint.io/user-guide/cli/) ·
[eslint-plugin-tailwindcss #428](https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/428) ·
[eslint-plugin-tailwindcss #418](https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/418)
