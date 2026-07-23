# Deterministic checks

Scripts that verify `check: deterministic` controls (and the deterministic half of
`hybrid` ones). Each check maps to TFX-DS control ids, exits 0 on pass and 1 on
violation, and prints violations with file/line/element and the control id — verbose
on failure, silent on success.

## Shared scaffolding: `checklib.py` (plan 071)

`checklib.py` holds what used to be duplicated across the check scripts: the
`/* … */` comment stripper, the source-file walker (`iter_target_files`, which
skips `node_modules`/`.git`/`.next`/`dist`/`out` as well as dotdirs — one unified,
stricter policy, not the mixed dotdir-only/stricter split that existed before), the
canonical `ERROR <file>:<line> [<CTL>] <found> — suggest: <…>` line
(`emit_error` — `detect.py`'s `_FINDING_RE` reverse-parses this exact shape),
and the `SELF-TEST OK/FAILED (N cases)` report tail. `checks/` is not a Python
package, so each script imports it by path with the same importlib snippet
`waiver-reconcile.py` already used for `audit-record.py`. A few pieces keep
their own formatting where they genuinely differ (`token-audit.py`'s
`[waiver-claimed]` variant, `component-manifest.py` and `detect.py`'s self-test
tails). checklib has its own gate: `python3 checks/checklib.py --self-test` →
`SELF-TEST OK (16 cases)`.

## Detector — one entry over the checks (built)

`python3 checks/detect.py [<path>...]` is the **unified entry point**: a façade that
invokes the individual check scripts below (whose rules it never changes), maps their
exit codes onto one contract, and adds a config-based ignore layer. Targets are files
or directories (recursive); the default target is `.`. This is the check surface hooks
wire to (plan 060) — "fast signal without asking an AI".

**Wired as a hook (plan 060, opt-in).** `hooks/design-hook.py` is a consented Claude
Code PostToolUse hook that runs this detector's **curated profile only** (token-audit,
contrast, a11y-static, TYP-1) on an edited UI file and reminds the agent on new
findings — it never blocks an edit, and its "clean" is the curated subset's clean, not
a whole-catalog pass. Off by default; install via the snippet in [`../hooks/README.md`](../hooks/README.md).

**`detect.py`'s role: hook-only, by design (plan 069).** `hooks/design-hook.py` is
`detect.py`'s only caller, and the hook itself is deliberately not shipped in the
plugin (`plugin.json` carries no `hooks` key) — it's a paste-in `settings.json`
snippet, consent by construction (see `../hooks/README.md`). `detect.py` is
deliberately **not** part of `package.json` prebuild or `.github/workflows/ci.yml`;
those run the individual check scripts directly (see "Wiring status" below). This is
a "keep, hook-only" decision, not a deprecation — promoting `detect.py` to the single
prebuild/CI runner was considered and rejected for now.

**Exit contract (0 / 2 / 1).** `detect.py` adopts Impeccable's codes, which differ from
the per-script 0/1: **0 = clean, 2 = findings, 1 = tool failure** (a wrapped script
crashed, or `.tfx/config.json` is invalid). A wrapped script's exit 1 (violations) maps
to detect's exit 2; detect reserves exit 1 for crashes and misconfiguration. A script
that exits 1 with a stderr traceback, exits with a code outside {0,1}, or exits 1 with
no parseable `ERROR` line is treated as a crash — detect fails loud rather than passing
silently.

**Profiles.** The default is the **curated, low-false-positive subset**:
`token-audit`, `contrast`, `a11y-static`, and `type-scan`'s **TYP-1 rule only** (via
`type-scan --rules TYP-1`). The noisier rules — TYP-2 size floor and the rest — stay
recording-only. `--all` runs every page-check script: the curated set with `type-scan`'s
full rule set (so TYP-2 runs), plus `content-lint` and `component-manifest` (the latter
only when a `.tfx/component-manifest.json` exists; otherwise it is reported skipped).

**Output.** Text mode groups each script's findings under a `── <check> ──` header and
passes through its `ERROR`/`NOTE` lines. `--json` emits
`{"findings": [{"check", "control", "file", "line", "message"}], "counts": …}` on stdout,
parsed from the scripts' `ERROR <file>:<line> [<CTL>] …` convention. An `ERROR` line that
does not carry a `[<CTL>]` bracket (operational errors like path-not-found, and
`component-manifest`'s `ERROR <file>:<line>: … (CMP-1 finding)` import-diff lines) is kept
as a **control-less finding** — captured, counted toward exit 2, and printed; never
dropped or silently passed.

**Config ignores (`.tfx/config.json` at the target repo root).**

```json
{"detector": {"ignoreFiles": ["legacy/*"], "ignoreValues": ["amber-11"], "ignoreRules": ["TYP-2"]}}
```

- `ignoreFiles` — glob-filters the scanned targets (drop a legacy folder). Globs match the
  repo-relative path or basename; `*` spans `/`.
- `ignoreValues` — fed to `token-audit`'s `--allow` mechanism (licence a sanctioned
  colour name / raw value); it feeds that allowlist, it does not replace it.
- `ignoreRules` — drops configured L1/L2 control ids from the run (post-parse; L0 and
  operational, control-less findings are never dropped).

`--no-config` bypasses the file entirely. An invalid or wrong-shaped `.tfx/config.json` is
a misconfiguration → exit 1. `--tokens <css>` overrides the contrast token map (default:
auto-discover `app/globals.css` under the repo root).

**Config ignores complement tier waivers — they never replace them.** A waiver is a
per-instance control exception with a named approver (the tier-waiver system); a config
ignore is scan-noise control — a legacy folder detect should not walk, or a raw value the
team has sanctioned. Neither silences an L0: an L0 ID in `ignoreRules` is ignored, so its
findings remain visible and the detector remains non-zero. L1/L2 IDs may still be filtered
as scan noise. Use a waiver to *except* a control instance; use a config ignore to *quiet
scan noise*.

**Honest enforcement still binds.** `detect.py` runs only the checks that are built (the
curated or `--all` set). It never reports an unbuilt or un-run control as "passed" — read
its output as "the built checks found nothing", not "the design is compliant". Per-control
coverage and the always-manual gaps are in the sections below.

**Design-context freshness.** When `.tfx/design.json` exists at the target repo root and
058's generator (`scripts/generate-design-json.py`) is present, detect also runs the
generator in `--check` mode; a stale `design.json` (generator exit 2) is surfaced as a
finding (exit 2), never a crash.

**Self-test:** `python3 checks/detect.py --self-test` → `SELF-TEST OK (43 cases)` — profile
selection, the 0/2/1 exit mapping (incl. curated excluding TYP-2 / `--all` including it),
each ignore type, invalid-config → exit 1, `ERROR`-line parsing, and the JSON shape. The
wrapped scripts are not invoked in the self-test (it exercises detect's own pure logic);
their behaviour is proven by their own `--self-test`s and a real-corpus run over
`docs/loop-run/`.

## Validator (built)

`python3 checks/validate.py` — validates `standards/catalog.yaml` against the schema in `standards/README.md`: field presence and allowed values, tier→waiver pairing, `detail:` file existence, detail-frontmatter ↔ catalog consistency, and that every control ID referenced in skills/docs exists in the catalog. Exit 0 on pass, exit 1 with `ERROR` lines on failure. This is the repo's verification baseline — run it before committing any `standards/` change.

The validator also enforces two **fragment-parity** sub-checks via `<!-- tfx-sync:… -->` markers: `[L0-SYNC]` (the inline "Non-negotiables (L0)" lists in `CLAUDE.md` and `design/SKILL.md` must equal the catalog's `tier: L0` set) and `[SLP9-SYNC]` (the `copy` buzzword summary must be a subset of the canonical list in `standards/controls/slp-9.md`). See [docs/SYNC.md](../docs/SYNC.md). A third check, `[COUNT-SYNC]`, needs no markers: every "`<N> controls`", "`<N> skills`", "`<N> check scripts`", or "`<N> checks built`" claim in `README.md` **and `docs/index.html`** must equal the live count it claims — the catalog's control count, the number of `.claude/skills/*/SKILL.md` dirs, or `checks/*.py` minus `validate.py` minus `checklib.py` — so an added, removed, or renamed control/skill/check fails the build until the prose is updated. A fourth, `[WIRING-SYNC]`, verifies every `enforced: script|partial` claim actually runs in prebuild or CI (or is on the `WIRING_EXEMPT` allowlist below). A fifth, `[SKILL-SYNC]`, verifies every control id named under `.claude/skills/**` or `.claude/agents/**` exists in the catalog (no ghost ids), and every catalog id is named in at least one skill/agent file or sits on the `SKILL_WIRING_GRANDFATHERED` allowlist in `validate.py` (no silent orphans) — see `docs/SYNC.md`. A sixth, `[LAY-SYNC]`, verifies the inline layout-controls list in `design/SKILL.md`, `evaluator.md`, and `layout/SKILL.md` each equal the catalog's `LAY-*` id set — see `docs/SYNC.md`.

**Self-test:** `python3 checks/validate.py --self-test` → `SELF-TEST OK (63 cases)`.

**Enforcement coverage (`enforced:` / `script:`).** Two OPTIONAL per-control catalog
fields make the built/unbuilt boundary machine-readable instead of living in prose
that drifts: `enforced` (`script` | `partial` | `manual` | `evaluator`) and `script`
(repo-relative path or list of paths to the covering script(s)). Absent `enforced`
defaults to `manual` for `deterministic`/`hybrid` controls and `evaluator` for
`judgment` controls — a `judgment` control's evaluator-verified half is not a gap.
`validate.py` enforces the pairing (`script:` requires `enforced: script|partial`;
every `script:` path must exist on disk; `enforced: evaluator` only on
`judgment`/`hybrid` controls). `python3 checks/validate.py --coverage` prints the
live table (id · tier · check · enforced[defaulted] · script) and a summary count —
this **replaces hand-maintained gap lists**, which drift as controls are added (see
`standards/README.md` §Enforcement).


## Token audit (built)

`python3 checks/token-audit.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for raw colour values, off-scale spacing, and off-scale border-radius that should be replaced with design tokens. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

**Coverage:** TOK-1 (raw hex/rgb/hsl/oklch/named-colour in style contexts, plus raw colour inside Tailwind arbitrary-value utilities e.g. `bg-[…]` — see below), TOK-2 (off-scale spacing — shadcn default scale), TOK-3 (off-scale border-radius), COL-2 (Tailwind palette utility classes bypassing the semantic layer; COL-1 partial — palette bypass only, product-primary resolution is judgment). Suggests the nearest scale value or token pattern on every violation.

**Token-definition exemption:** raw values inside a `:root { --*: … }` custom-property block or a `/* tfx-tokens */` … `/* /tfx-tokens */` region are exempt — tokens must be defined somewhere.

**Project-token awareness (COL-2):** The scanner reads `--color-<name>: …` declarations from the CSS files it scans (Tailwind v4 `@theme` convention) to build an allowlist of *theme-defined* colour names (e.g. `--color-amber-11` licences `text-amber-11`). A Tailwind palette class whose name is in the allowlist is **not** flagged as a COL-2 bypass. Pass additional names via `--allow name1,name2,…` or a `checks/token-audit.allow` file (one name per line, `#` comments). Without an explicit allowlist the scanner flags all palette classes.

**Arbitrary-value scanning (TOK-1):** In addition to style-context raw colours, the scanner checks the bracket contents of Tailwind arbitrary-value utilities (`bg-[…]`, `text-[…]`, `border-[…]`, etc.) for raw colour on **all** line types (not just style contexts). A raw hex, rgb/rgba, hsl, oklch, or standalone named colour (white, black, red, …) inside the brackets — excluding `var(--…)` references — emits `[TOK-1] raw colour '…' in arbitrary value`. For example, `hover:bg-[color-mix(in_oklab,var(--tw-blue)_88%,black)]` flags `black`.

**L1 waiver behaviour:** TOK and COL are all L1; an inline `tfx-waive TOK-…` or `tfx-waive COL-…` comment does NOT suppress the violation. It downgrades the output line to `ERROR …:[line] [CTL-ID][waiver-claimed] … — verify approver in decision record` and still exits 1. The scanner never silences L1 violations; a human closes the decision-record loop.

**Peer-radius-consistency (TOK-3):** The scanner checks on-scale and concentric nesting per element, but cannot compare peer elements (cross-element). Peer-radius-consistency is **judgment-only** — the evaluator carries consistency against the product's Card/`--radius` anchor.

**Self-test:** `python3 checks/token-audit.py --self-test` → `SELF-TEST OK (29 cases)` (includes the `fixtures/token-audit/` pass/fail files).

## Audit record (built)

`python3 checks/audit-record.py [<record.md>...]` — audits design decision records
(`docs/decisions/*.md`) for process compliance. With no arguments, audits every
record except `TEMPLATE.md`. Asserts per record: required sections present
(substring-tolerant headings), `**Run type:**` header or an explicit operator-proxy
note, ≥ 3 numbered done-criteria in the sprint contract, the evaluator verdict
pasted verbatim (heuristic: a `VERDICT:` line AND a `QUALITY GRADES` block — a
paraphrase lacks both), waiver rows carry a non-empty approver and never a waived
L0, plan approval names an approver or records operator proxy, every referenced
`docs/` path exists on disk, the Ratchet section is non-empty ("no proposal —
nothing uncovered" counts), a CMP-1-in-scope record carries exactly one fixed-form
CMP-1 verdict line, and the Verify verdict carries a **verification ledger** (a
`| Control | Method | Evidence |` table — each method is `script` / `manual` /
`unverified`, and a `manual` or `unverified` row must state its evidence/reason, so
"verified manually" is an auditable claim rather than a prose blob). Exit 0 with
`OK: N records audited` on pass; exit 1 with `ERROR <file>: <message>` lines on
failure. This is the record-audit layer of the eval workflow (`evals/README.md`);
hook-ready for V1 (PostToolUse on `docs/decisions/*` edits).

**Self-test:** `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (21 cases)`.

Pass `--repo-root <path>` to audit a consumer repo's `docs/decisions/` (the default roots at the harness).

## A11y static scan (built — static subset)

`python3 checks/a11y-static.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for three high-confidence a11y violations that are detectable from source text alone, without a rendered DOM. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

**Rules:**

- **FOCUS (A11Y-2, L0):** A class string or CSS rule containing an outline-removal token (`outline-none`, `outline-0`, `focus:outline-none`, or CSS `outline: none/0`) with no focus-visible replacement (`focus-visible:outline`, `focus-visible:ring`, `focus-visible:border`, `focus-visible:shadow`, or CSS `:focus-visible { … outline|box-shadow|border … }`) on the same line.
- **KBD (A11Y-2, L0):** A `<div`, `<span`, `<li`, or `<p` opening tag carrying a click handler (`onClick`, `onMouseDown`, `onclick`, `(click)`, `@click`) with no `role=` and no `tabIndex`/`tabindex` on the same tag.
- **NAME (A11Y-3, L0):** A `<button` or `role="button"` tag with no `aria-label`, `aria-labelledby`, or `title`, that is self-closing or whose same-line content is only an icon (`<svg`, a `*Icon` component, or an `aria-hidden` child) with no visible text. Only flags the same-line / self-closing case.

**Static-subset caveat — what this script does NOT verify:**

- Computed contrast ratios (A11Y-1) — needs rendered colours.
- Interactive hit-area size (A11Y-4) — needs computed layout.
- Focus traversal order and completeness (A11Y-2 traversal half) — needs a live DOM.
- ARIA state tracking — `aria-expanded`/`aria-pressed`/`aria-checked` updating to match visual state (A11Y-8 state half) — cannot be detected statically without cross-file variable mutation tracking. Deferred; manual pass required.
- Focus styles provided by a shared stylesheet: if `outline-none` appears in JSX but the `:focus-visible` recovery lives in a separate CSS file, the FOCUS rule will flag it. Cross-file CSS resolution needs a browser or axe-core.

**Waiver suppression:** A11Y-2 and A11Y-3 are L0 — never waivable. This script does not parse `tfx-waive` markers; every violation is a hard ERROR.

**Self-test:** `python3 checks/a11y-static.py --self-test` → `SELF-TEST OK (18 cases)` (includes the `fixtures/a11y-static/` pass/fail files).

## Contrast scan (built — static subset)

`python3 checks/contrast.py --tokens <globals.css> <path>...` — computes WCAG 2.1 text-contrast ratios (A11Y-1) for the subset that is statically resolvable: a foreground and a background colour set together on the **same line** (class string or CSS rule) where both resolve to known token colours. This is the static half of A11Y-1 that needs no rendered DOM — the complement to `a11y-static.py`, whose docstring lists contrast as out of scope. Scans the same extensions as `a11y-static.py`. Exit 0 on pass or NOTEs-only; exit 1 with `ERROR` lines on any sub-AA pair.

**Token resolution (`--tokens <file>`):** the colour map is built from a product's CSS token file (for this repo's own site, `../app/globals.css` from `harness/`). It resolves direct hex, `var(--other)` chains (transitively, cycle-safe), `color-mix(in oklab, var(--a) p%, <b>)` (mixed in OKLab per the CSS spec), and `@theme inline` aliases (`--color-foo: var(--bar)`) so a Tailwind `text-foo`/`bg-foo` utility resolves through. An unresolved token stays unresolved — never guessed.

**What counts as a candidate (line-local):** a `text-<colour>` **and** a `bg-<colour>` on the same Tailwind class string (bare names that resolve to a token colour, or arbitrary `text-[#hex]`/`bg-[var(--t)]`), or a CSS rule / `style="…"` with both `color:` and `background[-color]:`.

**Thresholds:** ratio `< 3.0` → ERROR (fails even large text); `3.0 ≤ ratio < 4.5` → ERROR noting it passes only as large text (≥24px / 18.66px bold — confirm the size); `≥ 4.5` → clean.

**Unresolvable, never silent:** when a candidate pair is detected but a colour can't be resolved (unknown token, dynamic/`clsx` arbitrary value), the check emits a `NOTE … — verify manually` and exits 0 — it never passes silently and never raises a false ERROR.

**Static-subset caveat — what this script does NOT verify:**

- **Inherited / computed backgrounds.** A rule or class that sets only a text colour (background inherited from a parent) is **not** a candidate — there is no background to compare against, so it is skipped, not flagged. This is the largest false-negative surface and remains the manual / axe pass's job.
- **Font-size-dependent large-text classification.** The 3.0–4.5 band is flagged conservatively with a "confirm the text size" note; the check does not infer font size line-locally.
- **Non-text (UI component) contrast**, `color-mix` in spaces other than `oklab`, multi-line CSS rules, and dynamic class names beyond an arbitrary value it can read.

**Self-test:** `python3 checks/contrast.py --self-test` → `SELF-TEST OK (15 cases)` (path-independent; uses inline temp fixtures).

## Waiver reconcile (built)

`python3 checks/waiver-reconcile.py --src <path>... --records <dir>` — reconciles the two places a waiver can live so neither drifts from the other: inline `tfx-waive <CTL-ID> reason="..."` comments in source/CSS (the syntax `token-audit` defines, here generalised to **all** control prefixes), the "## Waivers granted" table rows in decision records (`docs/decisions/*.md`, skipping `TEMPLATE.md`), and the control's catalog tier. It reuses `audit-record.py`'s `parse_table_rows` / `column_index` / `split_sections` / `find_section` (imported by path, never rewritten). Accepts `--repo-root <path>` (records default to `<repo-root>/docs/decisions`) for consumer repos; the catalog tiers always come from the harness. Exit 0 on a clean reconcile (or NOTEs only); exit 1 on any ERROR.

**ERROR (exit 1) vs NOTE (exit 0):**

- **ERROR — inline tfx-waive on an L0 control** (any prefix): L0 is never waivable, so an inline waiver on `A11Y-1/2/3` or `CMP-2` is always a hard failure. This generalises the L0-never rule beyond the TOK/COL controls `token-audit` already guards.
- **ERROR — orphan inline waiver:** an inline `tfx-waive <id>` (L1/L2) with no matching recorded waiver row for `<id>` in any scanned record — claimed in code, never approved in a record. Add it to a decision record with a named approver.
- **ERROR — unknown control id:** a `tfx-waive` whose id is not in `standards/catalog.yaml`.
- **NOTE — stale recorded waiver:** a recorded waiver row for `<id>` with no inline `tfx-waive <id>` in the scanned source — confirm it is still needed. A **NOTE, not an ERROR**, because the source set scanned may be partial: a recorded waiver looks "stale" only relative to the `--src` paths given, and a partial scan must never be turned into a false hard failure.

A row counts as a recorded waiver only when column 0 holds a control id (`^[A-Z0-9]+-\d+$`); TEMPLATE-style empty / descriptive placeholder rows are ignored, so they raise no false stale NOTE.

**What this script does NOT verify:** waivers in files or records outside the scanned `--src` / `--records` paths (the reconciliation is only as complete as the paths given — run it with the same `--src` breadth as the other checks); whether the recorded *reason* actually justifies the inline usage (judgment — the approver / evaluator); L2-waiver rationale quality. It reads the records; it never edits them.

This closes the loop `token-audit.py` leaves open ("a human closes the decision-record loop") — but only for the scanned paths.

**Self-test:** `python3 checks/waiver-reconcile.py --self-test` → `SELF-TEST OK (7 cases)`.

## Reaudit scope (built)

`python3 checks/reaudit-scope.py <CTL-ID>` (or `--category <name>`) — a **read-only query, not a gate**. When a control is added or tightened, already-shipped surfaces are silently out of date "until re-audited"; this answers "which decision records should I re-audit now that control X changed?" It reads two sources, both read-only: `standards/catalog.yaml` `meta.categories` (each control's category = `meta.categories[id.split("-")[0]]`) and the `## Controls in scope` sections of `docs/decisions/*.md` (skipping `TEMPLATE.md`). It reuses `audit-record.py`'s `split_sections` / `find_section` (imported by path, never rewritten). Accepts `--repo-root <path>` to query a consumer repo's `docs/decisions/`; the category map always comes from the harness catalog.

**What it computes:**

- **Directly in scope** — records whose in-scope set contains the target id. For a *changed* control these explicitly used it and must be re-checked against the new clause.
- **Same-category candidates** — records that list any control sharing the target's category but do **not** list the target id. For a *new* control these surfaces are in the affected domain. They are framed as **candidates to confirm**, not proven-affected — confirm each actually uses the affected pattern. `--category <name>` (a prefix like `COL` or the human name `Colour`) treats every control of that category as the target set.

**Honest limit:** it reasons over **recorded** surfaces (decision records — the harness's ledger of what shipped), **not** the product repo's live code. When the records are complete, the re-audit set is complete; when records are missing, so is the set. Keep records current.

**Exit codes:** exit 0 whenever the query runs — **including an empty result set** (no records matched is a valid answer). Exit 1 only on a usage error: an unknown control id, an unknown `--category`, or a missing records directory.

**Self-test:** `python3 checks/reaudit-scope.py --self-test` → `SELF-TEST OK (8 cases)`.

## Content lint (built — static subset)

`python3 checks/content-lint.py <path>...` — scans `.mdx`, `.md`, `.tsx`, `.jsx`, `.ts`, `.js`, `.vue`, `.svelte`, `.css`, and `.html` files for the statically-resolvable subset of CNT-1, CNT-3, CNT-5, CNT-6, and the deterministic (lint) half of SLP-9. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

**Single-source word lists:** the SLP-9 buzzword, AI-vocabulary, filler, and chatbot-artifact lists are **read at runtime** from `standards/controls/slp-9.md` (resolved relative to the check, from the `<!-- tfx-sync:slp9-buzzwords -->` marked span and the named bullets in "How to verify") — never embedded as a third copy, so the lint and the catalog cannot diverge. The CNT-5 device-verb list is read the same way from `cnt-5.md` (`<!-- tfx-sync:cnt5-verbs -->`), and the CNT-6 opener/filler lists from `cnt-6.md` (`<!-- tfx-sync:cnt6-openers -->`, `<!-- tfx-sync:cnt6-filler -->`). If a file cannot be found or parsed, the check falls back to a small embedded copy and prints a `NOTE` saying so — never silently.

**Rules:**

- **SLP-9 (L2, lint half):** a word-boundaried, case-insensitive hit on the buzzword or AI-vocabulary list; a hit on the filler or chatbot-artifact phrase lists; or two or more em dashes inside one sentence. Markdown table rows (lines starting `|`) are skipped for the em-dash rule — those dashes are structural per SLP-9's "Do not flag" list.
- **CNT-3 (L2):** a user-facing string literal (in code) or MDX/MD prose line whose longest sentence exceeds 25 words.
- **CNT-1 (L1):** a user-facing string that is *only* a raw error code (`ERR_SYNC_500`, `0x…`, an all-caps token), or the bare literal "Something went wrong" with no actionable next step on the same or next line. Conservative — when unsure, does not flag.
- **CNT-5 (L2):** a device-bound action verb (click/tap/swipe and inflections) inside a multi-word user-facing string or MDX prose line. Bare event names and identifiers (`onClick`, `addEventListener("click", …)`) are not copy and are not flagged.
- **CNT-6 (L2):** a sentence-*initial* empty opener ("There is", "There are", "It is", "This is") or a safe-subset filler word (just, really, very, please) in a multi-word user-facing string or MDX prose line. "In order to" is deliberately NOT in the CNT-6 lists — SLP-9's filler-phrase rule owns it, so one token never fires two controls.

**Static-subset caveat — what this script does NOT verify:**

- Non-literal / interpolated strings (`{var}`, template `${…}`, concatenation) — out of static reach; not flagged and not passed silently; the manual / evaluator pass covers them.
- Whether a string is truly user-facing vs. an internal label, key, className, or path — conservative heuristics; coordinate / SVG-path data (mostly numeric tokens) is excluded.
- CNT-7 (descriptive copy leads with its purpose) — judgment (evaluator); split from CNT-3.
- SLP-9's structural-tell *evaluator* half — negative parallelism, forced triads, copula avoidance, significance inflation, redundant label/helper pairs, em-dash clustering across a paragraph — all judgment (evaluator).
- CNT-1's full "what happened → what it means → what to do next" anatomy — judgment (evaluator); the script only catches the raw-code-only and bare-"Something went wrong" cases.
- CNT-5's harder half — "press" and "see", ambiguous link text ("click here", "read more"), and confirming a hit is a UI instruction rather than incidental prose — judgment (evaluator).
- CNT-6's harder half — "such", "that", droppable articles/conjunctions ("a", "the", "and"), and the clarity exception on every hit ("only if it does not reduce clarity") — judgment (evaluator).

**Self-test:** `python3 checks/content-lint.py --self-test` → `SELF-TEST OK (44 cases)`.

## Type scan (built — static subset)

`python3 checks/type-scan.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for the statically-resolvable subset of TYP-1, TYP-2, TYP-3, and TYP-4. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure (`NOTE` lines for unresolvable cases do not, on their own, fail the run).

**Rules:**

- **TYP-1 fonts (L1):** a CSS `font-family:` or Tailwind `font-[…]` arbitrary value naming a typeface other than Plus Jakarta Sans or Inter; the named Tailwind family utilities `font-mono` / `font-serif` (which resolve to a third default typeface stack — but **never** the weight utilities `font-semibold` / `font-bold` / …, which are not a typeface choice); and a non-approved generic — `monospace` / `serif` / `ui-monospace` / `ui-serif` — used as the **primary** CSS `font-family`. Allowed: the token names `font-display` / `font-body` / `font-sans` / `--font-display` / `--font-body`, the sans fallbacks `sans-serif` / `system-ui` / `ui-sans-serif`, and any utility a project sanctions by adding it to `ALLOWED_FONT_TOKENS`.
- **TYP-2 size floor (L1):** a `font-size:` or `text-[Npx]`/`text-[Nrem]` with `N < 14` (rem values are converted at ×16 before judging). The suggest text carries the 12/14 ambiguity (labels may go to 12px; body floor is 14px) since label-vs-body context needs rendered layout.
- **TYP-2 line-height (L1):** an explicit unitless / em `line-height:` or `leading-[N]` clearly outside the 1.5–1.6 body band (judged with a generous 1.4–1.7 tolerance). px / % line-heights are NOT judged — the ratio needs the font size.
- **TYP-3 on-scale (L1):** a `text-[Npx]`/`text-[Nrem]` or `font-size:Npx`/`Nrem` whose size (rem converted at ×16) is not on the **Tailwind default type scale `{128,96,72,60,48,36,30,24,20,18,16,14,12}`**. A fractional-pixel size is off-scale by definition, even when its rounded value happens to be in the set. The scale is read at runtime from TYP-3's catalog `verify` field (`Sizes in {…}; checks/type-scan`) so it cannot drift; the same set is the embedded fallback if the catalog can't be read.
- **TYP-4 all-caps (L2):** a `text-transform: uppercase` declaration or an `uppercase` Tailwind utility (matched as a class token — inside a class/className attr or a class-list-shaped string). Text is never set in all-caps, at any length — short labels included (HF-20). The English word "uppercase" in body text, and genuine acronyms (literal capitals, not a transform), are not flagged.

**TYP-3 scope decision:** TYP-3 **is** implemented (the preferred path) — the allowed scale is sourced live from the catalog `verify` field, not invented.

**Static-subset caveat — what this script does NOT verify:**

- Font *weights* (TYP-1's "PJS 600 / Inter 400/500/600" half) — weight is rarely co-located with the family and "approved weight" needs the family resolved; deferred to the manual pass.
- The 12px-vs-14px floor *decision* (TYP-2) — whether an element is a label (12px floor) or body (14px floor) needs rendered context; 12–13px is flagged with the ambiguity noted, not asserted as a definite body violation.
- Line-heights given in px or % (TYP-2) — the ratio needs the font size, rarely on the same line.
- All-caps set via camelCase inline style (TYP-4) — `style={{textTransform:'uppercase'}}` in JSX is not matched; only the CSS `text-transform: uppercase` form and the Tailwind `uppercase` utility are.
- Fonts / sizes set in a separate stylesheet the line-local rule can't see, or composed from variables / class-name interpolation — out of static reach.

**Self-test:** `python3 checks/type-scan.py --self-test` → `SELF-TEST OK (46 cases)`.

## Component manifest (built)

`python3 checks/component-manifest.py <manifest.json> [<source-root>]` — validates a product's `.tfx/component-manifest.json` against the TFX SPEC (`docs/spikes/component-manifest/SPEC.md`): required keys, enum values, date format. Exit 0 silent on pass; exit 1 with one `ERROR` line per violation.

**CMP-1 import-diff — only when `coverage: "complete"`:** the diff flags any component import in changed source that resolves outside the manifest. When `coverage` is `"partial"` (or absent) the diff stays **off** and the script reports `partial manifest — diff not run` — a team that declares complete coverage is asserting the manifest is reliable enough to diff against.

**What this script does NOT verify:** re-exports and barrel files can produce false-positive diff hits when an import resolves through a barrel that isn't the manifest's import path; if you hit these, downgrade to `coverage: "partial"` and the diff stays off (same trust lesson as `token-audit`). The manifest is only as complete as the product keeps it — a stale manifest passes schema validation but misses new components.

**Self-test:** `python3 checks/component-manifest.py --self-test` → `SELF-TEST OK (11 cases)`.

Planned for V1 (remaining):

| Check | Controls | Approach |
|---|---|---|
| `contrast` | A11Y-1 | axe-core contrast scan: 4.5:1 body, 3:1 large text + UI components |
| ~~`focus`~~ | ~~A11Y-2~~ | ✅ built (static subset) — `a11y-static` covers FOCUS (outline removal) + KBD (click on non-focusable element); traversal order and hit-area still need a rendered DOM |
| ~~`labels`~~ | ~~A11Y-3~~ | ✅ built (static subset) — `a11y-static` covers NAME (icon-only button without aria-label); placeholder-only label and multi-line label association still need a rendered DOM |
| `targets` | A11Y-4 | Computed hit area of interactive elements ≥ 24×24 CSS px |
| `reduced-motion` | A11Y-5 | With prefers-reduced-motion set, non-essential animation does not run |
| `alt-scan` | A11Y-6 | Every img/svg/icon has a text alternative or is marked decorative |
| `structure` | A11Y-7 (deterministic half) | Heading-hierarchy walk; lists/tables/groups are semantic elements |
| ~~`nrv`~~ | ~~A11Y-8 (deterministic half)~~ | ✅ built (static subset) — `a11y-static` covers KBD (non-focusable click handler without role/name); ARIA state tracking (aria-expanded/pressed/checked) is the deferred extension — too fuzzy statically, manual pass required |
| `title-lang` | A11Y-9 | Descriptive document title present; html lang attribute set |
| `skip-link` | A11Y-10 | Skip-to-main first focusable, or main/nav landmarks present |
| `announce` | A11Y-11 (deterministic half) | Each async state surface has live-region role XOR focus-target wiring |
| ~~`token-audit`~~ | ~~TOK-1..3, COL-1..2~~ | ✅ built |
| ~~`type-scan`~~ | ~~TYP-1..4~~ | ✅ built (static subset) — `type-scan` covers TYP-1 (font families), TYP-2 (size floor + unitless line-height), TYP-3 (on-scale, scale sourced from the catalog), TYP-4 (no all-caps, acronyms exempt); font *weights*, the label-vs-body floor decision, and px/% line-heights still need rendered context |
| `destructive` | CMP-2 (deterministic half) | Enumerate destructive actions; assert consequence surface + undo/confirm exists |
| `async-states` | CMP-3 (deterministic half) | Enumerate async actions; assert loading/success/error states exist and are reachable |
| ~~`content-lint`~~ | ~~CNT-1, CNT-3, CNT-5, CNT-6, SLP-9 (deterministic half)~~ | ✅ built (static subset) — `content-lint` covers CNT-1 (raw codes), CNT-3 (sentence length), CNT-5 (device verbs, from `cnt-5.md`), CNT-6 (sentence-initial empty openers + safe filler subset, from `cnt-6.md`), and the SLP-9 lint lists (read live from `standards/controls/slp-9.md`) + em-dash chains; the SLP-9 structural-tell evaluator half, CNT-7 (lead-with-purpose, split from CNT-3), and the CNT-5/CNT-6 judgment halves stay evaluator |
| `motion` | MOT-1, SLP-8 | Animation durations within 100–300ms, standard easing, none decorative on critical paths; no bounce/elastic/overshoot easing |
| `identity` | IDN-1 | Logo/lockup files resolve to the approved asset library; no inline redraws |
| `slop-scan` | SLP-1..4 | Stylesheet/DOM scan: purple-violet gradient palettes, cyan-on-dark theming, glow accents, gradient text, thick side-tab borders on rounded cards, nested cards |
| `slop-layout` | SLP-5..7 | Layout heuristics: identical-card grids / icon-tile templates, adjacent type-scale ratio < 1.25, a single spacing value used uniformly |

Wiring (V1): run as a PostToolUse hook on file edits during the implement phase
(fast subset: token-audit, type-scan, content-lint) and as the verify-phase gate
(full suite). L0 failures block; L1 failures loop the agent back to implement.

Wiring status (plan 069): `package.json` prebuild and `.github/workflows/ci.yml` both
run the same Python gate — `validate.py --self-test`, `validate.py`, `token-audit.py`
over `app components lib`, `a11y-static.py`, and `type-scan.py` over `app components`.
`type-scan` was wired in once its tree went clean (plan 068's Tailwind default type
scale migration removed the sub-14px `text-[11/12/13px]` labels and tight
`leading-[…]` headings it flagged).

`content-lint.py`, `contrast.py`, and `component-manifest.py` stay **manual** — each is
on the `WIRING_EXEMPT` list in `checks/validate.py`, with a one-line reason: per the
harness rule "never wire a failing check into the build," `content-lint` surfaces
pre-existing long-sentence (CNT-3) and filler-word (CNT-6) prose in `content/`, and
`contrast` surfaces a pre-existing sub-AA pair in `components/ui/button.tsx` (A11Y-1);
neither is wired until that content is fixed or waived. `component-manifest` targets a
product's `.tfx/component-manifest.json`, which this repo (the harness/site itself)
does not have — wiring it here would have nothing to check.

The `[WIRING-SYNC]` check in `validate.py` now enforces this list: a control claiming
`enforced: script|partial` via a `script:` field must run in prebuild or CI, or be on
`WIRING_EXEMPT` with a reason — the exemption list above is exactly, and only, what
`WIRING_EXEMPT` says. Stamping a control `enforced: script` without wiring the script
or adding an exemption now fails validation; that friction is the point.

Waiver handling: checks must respect inline `tfx-waive <CTL-ID> reason="..."`
comments for L2 controls only — a waiver on an L0/L1 control is itself reported as a
violation unless it appears in the decision record with a named approver (L1; L0 is
never waivable).
