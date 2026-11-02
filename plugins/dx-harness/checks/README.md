# Deterministic checks

Scripts that verify `check: deterministic` controls (and the deterministic half of
`hybrid` ones). Each check maps to DX-DS control ids, exits 0 on pass and 1 on
violation, and prints violations with file/line/element and the control id — verbose
on failure, silent on success.

Which controls each check decides, and what each one misses, is in
[COVERAGE.md](COVERAGE.md). It is generated from the `COVERAGE` declaration in each
script by `python3 checks/design-catalog-validate.py --write-coverage`. Run that command after you
change a declaration or add, remove, or edit a control in the catalogue. `pnpm check`
fails when the committed file does not match what the command writes. This file holds
how each check runs and how it works inside.

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
tails). `emit_error` also takes an optional `extra=` that fills the second bracket
(`[TOK-1][waiver-claimed]`), the slot `_FINDING_RE` already tolerates and discards.

**The position slot takes a cell as well as a line.** A rendered finding has a URL
and a DOM node where a static one has a file and a line, so `emit_rendered_error`
writes `ERROR <route>:<cell> [<CTL>] …` — the served path with its leading slash
(`/standards/slp-4`) and the run-matrix cell that produced it (`1280-dark`). A
leading slash is what tells the two apart, because `emit_error` is always given a
repo-relative path and never starts with one. `_FINDING_RE`'s position group is
`[^\s\[]+` rather than `\d+` so both parse; `parse_findings` reports `position` as
the raw token and `line` as an integer only where the token is digits, so a
rendered finding asserts no source line it cannot see. Writing a synthetic `1` or a
selector hash into the line slot was rejected: it asserts a location the check
cannot see, which is the failure this layer exists to remove. `emit_error` and
`_FINDING_RE` are one contract in two files — change them together.

checklib also loads the a11y rule map (`load_rule_map`, `layer_controls`; see
[A11y rule map](#a11y-rule-map-a11y-rule-mapjson) below), which `rendered-check.py`
reads.
Every check gets the rules that apply through checklib, with the resolution that
`scripts/in-scope-rules.py` uses, so a design skill and a check agree on which
rules apply: `rules_that_apply` for the rules, `rule_tiers` for their tiers
(with `l0_subset` on top), and `rule_categories` for `meta.categories`. No check
reads the catalogue itself. When the catalogue cannot be read, these raise
`RulesUnresolvedError`, and the check prints `ERROR <check>: could not resolve the
rules that apply` and exits 1. It never guesses a tier and reports no control as
passed. `scoped_controls` parses a record's "Controls in scope" notation into the
in-scope id set, shared by `audit-record.py` and `reaudit-scope.py`: ranges and
slash lists expand, "out of scope" excludes its whole segment (and the bullets
under an out-of-scope label), and an inline "N/A" excludes only the ids in its
own clause, so exclusion wins without unchecking the in-scope controls named
beside it. checklib has its own gate:
`python3 checks/checklib.py --self-test` → `SELF-TEST OK (116 cases)`.

### The ast-grep front end: one door, one version floor

`checklib.astgrep_scan(paths, check_name)` is the **only** way a check reaches
ast-grep. No check shells out to `ast-grep` itself, so the version floor, the
config path, the explicit file list, the JSON shape and the 0-based to 1-based
line conversion are each enforced in exactly one place. A second copy of any of
them is where the floor silently stops being enforced.

- **Provisioning.** ast-grep is a harness-side dependency reached with
  `subprocess`. The checks assume it is on `PATH` (`brew install ast-grep`, or
  `npm i -g @ast-grep/cli`), no binary is bundled, and **nothing is installed or
  configured in the repo being checked**. The repository that hosts this harness
  pins it as a devDependency for its own contributors and CI; that entry belongs to
  the site, not to the harness. The harness's
  `sgconfig.yml` and `rules/` travel with the harness and are reached with `-c`.
- **The floor is 0.44.1**, compared as a numeric tuple. A missing, unreadable or
  too-old ast-grep prints one `ERROR <check>: …` line naming the tool and the
  floor, exits 1, prints no findings, and never reports `SELF-TEST OK` or a clean
  result. ast-grep can lose an entire file's matches at exit 0, so silence is the
  failure mode the whole contract is designed against: a layer that did not run
  sends its controls to manual verification.
- **Four language buckets, because a rule is per language, not per control:**
  `css`, `html`, `tsx`, `ts`. `.vue` and `.svelte` are not ast-grep languages at
  0.44.1 and reach the html rules through `languageGlobs`; `.js` and `.jsx` alias
  to tsx; **`.ts` never does**, because a `.ts` file holding an old-style `<Foo>bar`
  assertion measurably returns zero findings at exit 0 under a tsx rule.
- **The walker does not change.** `iter_target_files` stays the single walk policy
  and the file list is handed over explicitly, because `ast-grep scan` applies
  `.gitignore` semantics when it walks a directory itself and a gitignored source
  file would be skipped in silence.
- **Rules find candidates; Python judges them.** `checks/rules/<check>/` holds one
  rule per control per language, `checks/rules/shared/` the structural rules every
  check reuses (which spans are code, which are comments, which are a style
  region), and `checks/rules/utils/` the node sets they share. A rule never carries
  a threshold, a scale value, an allowlist or an exemption. Every rule is
  `severity: warning`, so a non-zero ast-grep exit always means a real tool or
  config problem rather than a finding.
- **Embedded style contexts.** ast-grep parses a `<style>` block inside html as
  CSS on its own; `astgrep_scan` re-scans the two contexts it does not, namely a
  `style="…"` attribute and a tagged style template literal (`css`, `styled.x`,
  `createGlobalStyle`, `injectGlobal`), with the css rules, mapped back to the
  host file's line and column. This is how one set of css rules reaches all four
  style contexts, and how a multi-line `style="…"` attribute is finally covered.
- **Parity.** `checks/fixtures/parity/` is the corpus that gated the swap, with one
  recorded pre-swap output per fixture and check. See
  [`fixtures/parity/README.md`](fixtures/parity/README.md).

## A11y rule map: `a11y-rule-map.json`

One file maps every accessibility rule that `rendered-check.py` runs to exactly one
control id: `checks/a11y-rule-map.json` (JSON, not YAML, because the check scripts
are stdlib-only).

- `rules`: `"<prefix>/<rule>": "<CODE>"`, one base rule code per rule, never a list.
  The code is the base rule in `standards/rules/` whose `engine:` field names that axe
  rule. The prefix names the tool the rule belongs to: `axe/` for the rendered check,
  and `dx/` for the rendered check's own page evaluations. A rule with no row is
  reported as a misconfiguration, not attributed to a guessed code.
- `aria_prefix_control`: the base rule that an axe rule id beginning `aria-` maps to
  when it has no row of its own (WR-1c). The aria suite is resolved from the installed
  axe's `getRules()` at run time, so a rule the harness has never seen is still
  reported.
- `layers`: the base rule codes the `axe-rendered` layer covers. When the layer cannot
  run, it reads its row to name the rules going to manual verification, so a rule is
  never reported as passing by a layer that did not check it.

The tier of each code comes from its rule file through `checklib.base_rule_tiers()`.

Per-rule run behaviour stays out of the map: `target-size` being force-enabled,
`bypass` being report-only and the aria visibility demotion all live in the runner,
so the map keeps one job: rule to control.

The static accessibility checks are `design-lint` rules. See
[`procedures/design-lint.md`](../procedures/design-lint.md).

## Detector — one entry over the checks (built)

`python3 checks/detect.py [<path>...]` is the **unified entry point**: a façade that
invokes the individual check scripts below (whose rules it never changes), maps their
exit codes onto one contract, and adds a config-based ignore layer. Targets are files
or directories (recursive); the default target is `.`. This is the check surface hooks
wire to (plan 060) — "fast signal without asking an AI".

**Wired as a hook (plan 060, opt-in).** `hooks/design-hook.py` is a consented Claude
Code PostToolUse hook that runs this detector's **curated profile only** (token-audit and
TYP-1) on an edited UI file and reminds the agent on new
findings — it never blocks an edit, and its "clean" is the curated subset's clean, not
a whole-catalog pass. Off by default; install via the snippet in [`../hooks/README.md`](../hooks/README.md).

**`detect.py`'s role: hook-only, by design (plan 069).** `hooks/design-hook.py` is
`detect.py`'s only caller, and the hook itself is deliberately not shipped in the
plugin (`plugin.json` carries no `hooks` key) — it's a paste-in `settings.json`
snippet, consent by construction (see `../hooks/README.md`). `detect.py` is
deliberately **not** part of `pnpm check` or `.github/workflows/ci.yml`;
those run the individual check scripts directly (see "Wiring status" below). This is
a "keep, hook-only" decision, not a deprecation — promoting `detect.py` to the single
`pnpm check`/CI runner was considered and rejected for now.

**Exit contract (0 / 2 / 1).** `detect.py` adopts Impeccable's codes, which differ from
the per-script 0/1: **0 = clean, 2 = findings, 1 = tool failure** (a wrapped script
crashed, or `.dx/config.json` is invalid). A wrapped script's exit 1 (violations) maps
to detect's exit 2; detect reserves exit 1 for crashes and misconfiguration. A script
that exits 1 with a stderr traceback, exits with a code outside {0,1}, or exits 1 with
no parseable `ERROR` line is treated as a crash — detect fails loud rather than passing
silently.

**Profiles.** The default is the **curated, low-false-positive subset**:
`token-audit`, and `type-scan`'s **TYP-1 rule only** (via `type-scan --rules TYP-1`).
`--all` runs every page-check script: `token-audit`, `type-scan`'s full rule set (so
TYP-3 runs), and `component-manifest` (only when a `.dx/component-manifest.json`
exists; otherwise it is reported skipped). The generic controls are `design-lint`
rules, so `detect.py` runs none of them.

**Output.** Text mode groups each script's findings under a `── <check> ──` header and
passes through its `ERROR`/`NOTE` lines. `--json` emits
`{"findings": [{"check", "control", "file", "line", "message"}], "counts": …}` on stdout,
parsed from the scripts' `ERROR <file>:<line> [<CTL>] …` convention. An `ERROR` line that
does not carry a `[<CTL>]` bracket (operational errors like path-not-found, and
`component-manifest`'s `ERROR <file>:<line>: … (CMP-1 finding)` import-diff lines) is kept
as a **control-less finding** — captured, counted toward exit 2, and printed; never
dropped or silently passed.

**Config ignores (`.dx/config.json` at the target repo root).**

```json
{"detector": {"ignoreFiles": ["legacy/*"], "ignoreValues": ["amber-11"], "ignoreRules": ["TYP-3"]}}
```

- `ignoreFiles` — glob-filters the scanned targets (drop a legacy folder). Globs match the
  repo-relative path or basename; `*` spans `/`.
- `ignoreValues` — fed to `token-audit`'s `--allow` mechanism (licence a sanctioned
  colour name / raw value); it feeds that allowlist, it does not replace it.
- `ignoreRules` — drops configured L1/L2 control ids from the run (post-parse; L0 and
  operational, control-less findings are never dropped).

`--no-config` bypasses the file entirely. An invalid or wrong-shaped `.dx/config.json` is
a misconfiguration → exit 1.

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

**Design-context freshness.** When `.dx/design.json` exists at the target repo root and
058's generator (`scripts/generate-design-json.py`) is present, detect also runs the
generator in `--check` mode; a stale `design.json` (generator exit 2) is surfaced as a
finding (exit 2), never a crash.

**Self-test:** `python3 checks/detect.py --self-test` → `SELF-TEST OK (83 cases)` — profile
selection, the 0/2/1 exit mapping (incl. curated excluding TYP-3 / `--all` including it),
each ignore type, invalid-config → exit 1, `ERROR`-line parsing (both the static
`<file>:<line>` and the rendered `<route>:<cell>` shape, at both of `_FINDING_RE`'s call
sites), and the JSON shape. The
wrapped scripts are not invoked in the self-test (it exercises detect's own pure logic);
their behaviour is proven by their own `--self-test`s and a real-corpus run over
`docs/loop-run/`.

## Validator (built)

`python3 checks/design-catalog-validate.py` — validates `standards/catalog.yaml` against the schema in `standards/README.md`: field presence and allowed values, tier→waiver pairing, `detail:` file existence, detail-frontmatter ↔ catalog consistency, a `gap:` reason on every `deterministic`/`hybrid` control that is effectively manual (or a temporary entry on the shrink-only `GAP_GRANDFATHERED` allowance list in `design-catalog-validate.py`), and that every control ID referenced in skills/docs exists in the catalog. Exit 0 on pass, exit 1 with `ERROR` lines on failure. This is the repo's verification baseline — run it before committing any `standards/` change.

The validator also enforces a **fragment-parity** sub-check via `<!-- dx-sync:… -->` markers: `[SLP9-SYNC]` (the `copy` buzzword summary must be a subset of the canonical list in `standards/controls/slp-9.md`). No skill restates the L0 floor or the layout controls, so neither has a parity check: a skill takes both from the in-scope list. A second check, `[COUNT-SYNC]`, needs no markers: every "`<N> controls`", "`<N> skills`", "`<N> check scripts`", or "`<N> checks built`" claim in `README.md` **and `docs/index.html`** must equal the live count it claims — the catalog's control count, the number of `.claude/skills/*/SKILL.md` dirs, or `checks/*.py` minus `design-catalog-validate.py` minus `checklib.py` — so an added, removed, or renamed control/skill/check fails the build until the prose is updated. A third, `[WIRING-SYNC]`, verifies every `enforced: script|partial` claim actually runs from a `package.json` script or CI (or is on the `WIRING_EXEMPT` allowlist below). A fourth, `[SKILL-SYNC]`, verifies every control id named under `.claude/skills/**` or `.claude/agents/**` exists in the catalog (no ghost ids), and every catalog id is named in at least one skill/agent file or sits on the `SKILL_WIRING_GRANDFATHERED` allowlist in `design-catalog-validate.py` (no silent orphans) — see `docs/SYNC.md`.

The validator also checks each file under `standards/rules/`, per [ADR-0002](../../../docs/adr/0002-rule-categories-and-file-names.md). A file must sit in a category folder, such as `bd/` or `cmp/`, and a rule file must take its kebab-case slug as its name. A file named by its code, such as `BD-1a.md`, fails, and the error names the file. A category folder can also hold `README.md` and `MAPPING.md`, and `redirects.yaml` sits at the top. In `redirects.yaml`, each code under `codes` must have a row in the `MAPPING.md` of its category. A control under `notMoved` needs a reason and no codes. Each generic control in `catalog.yaml` needs an entry under `codes` or `notMoved`, and the error names a control that has neither. The 13 placeholder controls and the 12 controls that port in full need no entry. With no `standards/rules/` folder, the check has nothing to read and passes.

**Self-test:** `python3 checks/design-catalog-validate.py --self-test` → `SELF-TEST OK (142 cases)`.

**Enforcement coverage (`enforced:` / `script:`).** Two OPTIONAL per-control catalog
fields make the built/unbuilt boundary machine-readable instead of living in prose
that drifts: `enforced` (`script` | `partial` | `manual` | `evaluator`) and `script`
(repo-relative path or list of paths to the covering script(s)). Absent `enforced`
defaults to `manual` for `deterministic`/`hybrid` controls and `evaluator` for
`judgment` controls — a `judgment` control's evaluator-verified half is not a gap.
`design-catalog-validate.py` enforces the pairing (`script:` requires `enforced: script|partial`;
every `script:` path must exist on disk; `enforced: evaluator` only on
`judgment`/`hybrid` controls). `python3 checks/design-catalog-validate.py --coverage` prints the
live table (id · tier · check · enforced[defaulted] · script) and a summary count —
this **replaces hand-maintained gap lists**, which drift as controls are added (see
`standards/README.md` §Enforcement).


## Token audit (built)

`python3 checks/token-audit.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for raw colour values, off-scale spacing, and off-scale border-radius that should be replaced with design tokens. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

Every violation suggests the nearest scale value or token pattern. What this check misses is in [COVERAGE.md](COVERAGE.md).

**Token-definition exemption:** raw values inside a `:root { --*: … }` custom-property block or a `/* dx-tokens */` … `/* /dx-tokens */` region are exempt — tokens must be defined somewhere.

**Project-token awareness (COL-2):** The scanner reads `--color-<name>: …` declarations from the CSS files it scans (Tailwind v4 `@theme` convention) to build an allowlist of *theme-defined* colour names (e.g. `--color-amber-11` licences `text-amber-11`). A Tailwind palette class whose name is in the allowlist is **not** flagged as a COL-2 bypass. Pass additional names via `--allow name1,name2,…` or a `checks/token-audit.allow` file (one name per line, `#` comments). Without an explicit allowlist the scanner flags all palette classes.

**Arbitrary-value scanning (TOK-1):** In addition to style-context raw colours, the scanner checks the bracket contents of Tailwind arbitrary-value utilities (`bg-[…]`, `text-[…]`, `border-[…]`, etc.) for raw colour on **all** line types (not just style contexts). A raw hex, rgb/rgba, hsl, oklch, or standalone named colour (white, black, red, …) inside the brackets — excluding `var(--…)` references — emits `[TOK-1] raw colour '…' in arbitrary value`. For example, `hover:bg-[color-mix(in_oklab,var(--tw-blue)_88%,black)]` flags `black`.

**L1 waiver behaviour:** TOK and COL are all L1; an inline `dx-waive TOK-…` or `dx-waive COL-…` comment does NOT suppress the violation. It downgrades the output line to `ERROR …:[line] [CTL-ID][waiver-claimed] … — verify approver in decision record` and still exits 1. The scanner never silences L1 violations; a human closes the decision-record loop.

**Peer-radius-consistency (TOK-3):** The scanner checks on-scale and concentric nesting per element, but cannot compare peer elements (cross-element). Peer-radius-consistency is **judgment-only** — the evaluator carries consistency against the product's Card/`--radius` anchor.

**Matching engine:** candidates come from ast-grep through `checklib.astgrep_scan`
(see "The ast-grep front end" above). The design-scale policy, the exemption
machinery and the L1 waiver downgrade are unchanged Python. A style context is a
syntax-tree position now, not a regex tracker, so a multi-line `style="…"`
attribute is covered and comment text is never read as code.

**Self-test:** `python3 checks/token-audit.py --self-test` → `SELF-TEST OK (57 cases)` (includes the `fixtures/token-audit/` pass/fail files, the `fixtures/parity/` corpus, and the ast-grep provisioning contract).

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
"verified manually" is an auditable claim rather than a prose blob), the ledger has
a row for **every control in "Controls in scope"** (the scope notation is parsed
by `checklib.scoped_controls`: ranges and slash lists expand, and a control a
record rules out with "N/A" or "out of scope" is not demanded back as scope;
**a ledger row is read with the same notation**, through
`checklib.control_ids_in`, so a `TOK-1..3` or `SLP-5/6/11` row covers every
control it names rather than only the first; extra rows for reviewer-added
findings are allowed; until the scope manifest ships the checked set is the full
in-scope set, so a review that stops early fails here), and **no L0 control's
ledger row is `unverified`** (L0 has no waiver, so it gets no quiet exit either —
the same row on an L1/L2 control stays legal; a grouped row expands here too, so
`CMP-1..2` cannot hide the L0 behind the L1). Exit 0 with
`OK: N records audited` on pass; exit 1 with `ERROR <file>: <message>` lines on
failure. This is the record-audit layer of the eval workflow (`evals/README.md`);
hook-ready for V1 (PostToolUse on `docs/decisions/*` edits).

**Self-test:** `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (33 cases)`.

Pass `--repo-root <path>` to audit a consumer repo's `docs/decisions/` (the default roots at the harness).

## Rendered check — axe on the open page (built — rendered subset)

`python3 checks/rendered-check.py [--session <name>] [--url <url>] [--viewports 360,1280]
[--themes auto|light|dark|both] [--json]` — runs axe against a page that is **already
open**, plus the harness's own page evaluations for the rules no maintained tool
provides. The static accessibility checks are `design-lint` rules. Exit 0 on a clean
run or NOTEs only; exit 1 with
`ERROR` lines on any violation or malformed waiver marker.

**The harness never boots the target app.** No dev server, no static export, no jsdom,
in any code path. `playwright.config.ts`'s `webServer` block at the site root is the
site's own end-to-end config; this check neither reuses nor imitates it. It launches no
browser either: the design loop's capture step already opens one (`skills/design/
dx-design-execute/verify.md` step 2), so the check attaches to that session over CDP,
drives it, and hands it back. A standalone run — `dx-design-critique`, or a re-audit
walked from `reaudit-scope.py` — asks the person for a URL of a surface that is already
serving, and drives the same open session to it.

The runner asks the capture CLI for its **live session list first**, and only then for
that session's CDP endpoint. Measured on agent-browser 0.29.1, asking for the endpoint
of a session that does not exist creates it, browser and all — the list is what keeps
"attaches to an open page" true rather than aspirational.

**The run matrix, fixed.** 360 and 1280 x each supported theme, plus exactly one
reduced-motion cell at 1280 in the default theme:

| Cell | Viewport | Theme | Media | What it decides |
|---|---|---|---|---|
| `360-light` | 360 | light | default | `target-size`, `color-contrast`, all mapped rules |
| `1280-light` | 1280 | light | default | all mapped rules |
| `360-dark` | 360 | dark | default | `color-contrast` in dark, all mapped rules |
| `1280-dark` | 1280 | dark | default | `color-contrast` in dark, all mapped rules |
| `1280-reduced-motion` | 1280 | default | `reduced-motion` | A11Y-5a only |

Each cell scrolls to the document end in viewport-height steps and back to the top
before axe runs, because axe skips what is outside the viewport. `target-size` is
enabled **by name** — axe ships it off, Lighthouse re-enables it, and WO-18a has no other
coverage — and the run names its rules rather than taking a `runOnly` tag shortcut,
which would silently drop mapped ones. The aria suite comes from the installed axe's
`getRules()` at run time, so a rule the harness has never seen is still reported under
WR-1c with no harness edit. Where a product has no dark mode (no theme toggle, no
`.dark` or `[data-theme="dark"]` layer), the dark cells record `N/A, product has no dark
mode` — the same truthful outcome verify records, never a pass.

What this check misses is in [COVERAGE.md](COVERAGE.md).

**Three buckets, not two.** Violations become `ERROR` lines and exit 1. Passes are
counted once per cell and never printed per node, because a per-node pass list invites
reading "axe found nothing" as "this control is met". `incomplete` is the third bucket:
it rides the `NOTE` channel, naming the control, the rule and the DOM node as an item
for the manual accessibility pass. It gates nothing and is dropped by nothing. Two more
things land there. An aria finding (WR-1b or WR-1c) on markup a person cannot currently reach —
`hidden`, `aria-hidden="true"`, `display: none` or `visibility: hidden` on the node or an
ancestor — is demoted rather than gated on, which is what "visible components only"
means for a runner that clicks nothing. And `bypass` is report-only, so WO-7a never
contributes to a non-zero exit; skip-link-first confirmation stays with the manual pass.
Where every rule mapped to a control came back `inapplicable`, that control records N/A
with the reason.

**The finding line names a page, a cell, a base rule, and its tier.**
`ERROR <route>:<cell> [<CODE>][<rule>] <tier>: …` — see the position-slot paragraph
under `checklib.py` above.

**The `data-dx-waive` DOM marker.** The rendered analogue of the inline `dx-waive`
comment, for a layer whose findings have no source file to carry one:

```html
<div data-dx-waive="CMP-13a TYP-7a reason=quarantined anti-specimen">
```

The runner skips that element's subtree for the named controls only. It is element
scoped permanently — a per-URL ignore list would exempt a whole page and hide real
regressions elsewhere on it, a register-scoped exemption would make a permanent blind
spot, and it never becomes a `detector.ignoreRules`, `ignoreFiles` or `ignoreValues`
entry. Grammar: one or more base rule codes, `[A-Z0-9]+-\d+[a-z]?`, then the literal `reason=`,
then free text to the end of the value. No quotes around the reason (the inline form's
`reason="…"` cannot survive inside a JSX attribute that is itself double quoted), and the
reason is **required** where it is optional inline, because a rendered waiver has no
surrounding comment to explain itself. A nested marker's ids union with the enclosing
one's for that inner subtree; they never replace them.

Two deliberate divergences, said out loud so the conventions do not drift silently:

- **It suppresses where the inline marker downgrades.** `token-audit`'s inline waiver on
  an L1 control prints `[CTL][waiver-claimed]` and still exits 1. A downgrade here would
  still fail this repo on its own teaching exhibit, which is the problem the marker
  exists to solve.
- **An L0 id in a marker is an ERROR and suppresses nothing.** The inline path already
  refuses an L0 waiver, and the DOM form must not become the way around it. A removed
  catalogue code, such as A11Y-1, is an ERROR that names the base rules `redirects.yaml`
  maps it to. An unknown
  id, a missing reason and an unparseable value are each their own ERROR too, and a
  broken marker suppresses nothing rather than guessing which way to fail. Every
  honoured marker prints a `NOTE` naming the element, the ids and the reason.

It ships **wired**, not merely defined: `waiver-reconcile.py` reads the attribute as a
second authored form, so a DOM waiver on an L1 control needs its "## Waivers granted"
row exactly as an inline one does — which is what `standards/schema.json`'s tier-to-waiver
pairing requires of an L1 control.

**A layer that did not run does not silently pass.** No session, no such session, an
unprovisioned driver, a refused CDP connection or an axe that threw are all the same
class: `NOTE` lines naming the failure and every control going to manual verification,
then **exit 0**. That shape is forced by `detect.py`, which reads exit 1 with no `ERROR`
line as a crash — reporting an uncovered layer as harness breakage would be worse than
useless. The note names the L0 base rules it covers, such as WR-1a, which still block
until verified by some path.

**The harness-side Node dependency.** `@axe-core/playwright` (which brings its own
`axe-core`) and `playwright-core` are declared in `plugins/dx-harness/package.json` and
installed into the plugin's own `node_modules` with `npm install --prefix <plugin dir>`.
**Nothing is installed into the repo being checked** — the site's `package.json` and
lockfile are untouched, and the generated lockfile is gitignored, exactly like the global
ast-grep install. A missing driver dependency is the layer-did-not-run case above, not a
crash.

**Not wired into `pnpm check` or CI, and not exempted either.** It needs an open page, and
neither `package.json` nor `ci.yml` has one, so `[WIRING-SYNC]` cannot be satisfied by it
— but the check also claims no control's `script:` field yet, so there is nothing for
`[WIRING-SYNC]` to ask about and a `WIRING_EXEMPT` entry today would be a **dead
exemption**, which is itself an ERROR (`design-catalog-validate.py`: an exempted script no longer
claimed by any control). The `script:` fields and the `enforced:` labels are #162's, and
the exemptions land in the same commit as the claims. The decided values this check hands
to that recount: A11Y-1, A11Y-3, A11Y-4, A11Y-5, A11Y-6, A11Y-7, A11Y-8, A11Y-9 and
A11Y-10 all stay or become `enforced: partial` with `checks/rendered-check.py` added to
`script:`; **none reaches `script`**, because every one of them depends on a URL being
available and every one keeps a manual remainder. A11Y-5 in particular stays `partial`
and gains both keys, which it has neither of today.

**Self-test:** `python3 checks/rendered-check.py --self-test` → `SELF-TEST OK (175
cases)` — the matrix, the job the driver reads, the finding shape against `detect.py`'s
real `_FINDING_RE`, the three buckets, the marker grammar and its four error cases, the
did-not-run paths, and a set of cases that read the driver's source with its comments
stripped and fail if a browser launch, a `newPage`, a `newContext`, a `webServer` or a
click ever appears in the code. It spawns no browser and needs none.

## Waiver reconcile (built)

`python3 checks/waiver-reconcile.py --src <path>... --records <dir>` — reconciles the places a waiver can live so none drifts from the others: inline `dx-waive <CTL-ID> reason="..."` comments in source/CSS (the syntax `token-audit` defines, here generalised to **all** control prefixes), the rendered check's `data-dx-waive="<CTL-ID>... reason=<text>"` DOM attribute as authored in source, the "## Waivers granted" table rows in decision records (`docs/decisions/*.md`, skipping `TEMPLATE.md`), and the control's catalog tier. It reuses `audit-record.py`'s `parse_table_rows` / `column_index` / `split_sections` / `find_section` (imported by path, never rewritten). Accepts `--repo-root <path>` (records default to `<repo-root>/docs/decisions`) for consumer repos; the catalog tiers always come from the harness. Exit 0 on a clean reconcile (or NOTEs only); exit 1 on any ERROR.

**ERROR (exit 1) vs NOTE (exit 0):**

- **ERROR — inline dx-waive on an L0 control** (any prefix): L0 is never waivable, so an inline waiver on `A11Y-1/2/3` or `CMP-2` is always a hard failure. This generalises the L0-never rule beyond the TOK/COL controls `token-audit` already guards.
- **ERROR — orphan inline waiver:** an inline `dx-waive <id>` (L1/L2) with no matching recorded waiver row for `<id>` in any scanned record — claimed in code, never approved in a record. Add it to a decision record with a named approver.
- **ERROR — unknown control id:** a `dx-waive` whose id is not in `standards/catalog.yaml`.
- **NOTE — stale recorded waiver:** a recorded waiver row for `<id>` with no inline `dx-waive <id>` in the scanned source — confirm it is still needed. A **NOTE, not an ERROR**, because the source set scanned may be partial: a recorded waiver looks "stale" only relative to the `--src` paths given, and a partial scan must never be turned into a false hard failure.

A row counts as a recorded waiver only when column 0 holds a control id (`^[A-Z0-9]+-\d+$`); TEMPLATE-style empty / descriptive placeholder rows are ignored, so they raise no false stale NOTE.

**What this script does NOT verify:** waivers in files or records outside the scanned `--src` / `--records` paths (the reconciliation is only as complete as the paths given — run it with the same `--src` breadth as the other checks); whether the recorded *reason* actually justifies the inline usage (judgment — the approver / evaluator); L2-waiver rationale quality. It reads the records; it never edits them.

This closes the loop `token-audit.py` leaves open ("a human closes the decision-record loop") — but only for the scanned paths.

**Self-test:** `python3 checks/waiver-reconcile.py --self-test` → `SELF-TEST OK (11 cases)`
(the last four cover the rendered check's `data-dx-waive` attribute: an orphan with no
record row, the same marker with its row, two ids on one attribute reconciling
separately, and an L0 id refused).

## Reaudit scope (built)

`python3 checks/reaudit-scope.py <CTL-ID>` (or `--category <name>`) — a **read-only query, not a gate**. When a control is added or tightened, already-shipped surfaces are silently out of date "until re-audited"; this answers "which decision records should I re-audit now that control X changed?" It reads two sources, both read-only: `standards/catalog.yaml` `meta.categories` (each control's category = `meta.categories[id.split("-")[0]]`) and the `## Controls in scope` sections of `docs/decisions/*.md` (skipping `TEMPLATE.md`, and reading each section with `checklib.scoped_controls`, so an N/A or out-of-scope mention does not count as scope). It reuses `audit-record.py`'s `split_sections` / `find_section` (imported by path, never rewritten). Accepts `--repo-root <path>` to query a consumer repo's `docs/decisions/`; the category map always comes from the harness catalog.

**What it computes:**

- **Directly in scope** — records whose in-scope set contains the target id. For a *changed* control these explicitly used it and must be re-checked against the new clause.
- **Same-category candidates** — records that list any control sharing the target's category but do **not** list the target id. For a *new* control these surfaces are in the affected domain. They are framed as **candidates to confirm**, not proven-affected — confirm each actually uses the affected pattern. `--category <name>` (a prefix like `COL` or the human name `Colour`) treats every control of that category as the target set.

**Honest limit:** it reasons over **recorded** surfaces (decision records — the harness's ledger of what shipped), **not** the product repo's live code. When the records are complete, the re-audit set is complete; when records are missing, so is the set. Keep records current.

**Exit codes:** exit 0 whenever the query runs — **including an empty result set** (no records matched is a valid answer). Exit 1 only on a usage error: an unknown control id, an unknown `--category`, or a missing records directory.

**Self-test:** `python3 checks/reaudit-scope.py --self-test` → `SELF-TEST OK (8 cases)`.

## Type scan (built — static subset)

`python3 checks/type-scan.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for the statically-resolvable subset of TYP-1 and TYP-3, the typeface and type-scale controls that stay with the placeholder catalogue. Accepts files or directories (recursive). Exit 0 on pass; exit 1 with `ERROR` lines on failure. The generic typography controls (TYP-2, TYP-4, TYP-6, and LAY-4) are `design-lint` rules in `standards/rules/typ/`.

**Rules:**

- **TYP-1 fonts (L1):** a CSS `font-family:` or Tailwind `font-[…]` arbitrary value naming a typeface other than Plus Jakarta Sans or Inter; the named Tailwind family utilities `font-mono` / `font-serif` (which resolve to a third default typeface stack — but **never** the weight utilities `font-semibold` / `font-bold` / …, which are not a typeface choice); and a non-approved generic — `monospace` / `serif` / `ui-monospace` / `ui-serif` — used as the **primary** CSS `font-family`. Allowed: the token names `font-display` / `font-body` / `font-sans` / `--font-display` / `--font-body`, the sans fallbacks `sans-serif` / `system-ui` / `ui-sans-serif`, and any utility a project sanctions by adding it to `ALLOWED_FONT_TOKENS`.
- **TYP-3 on-scale (L1):** a `text-[Npx]`/`text-[Nrem]` or `font-size:Npx`/`Nrem` whose size (rem converted at ×16) is not on the **Tailwind default type scale `{128,96,72,60,48,36,30,24,20,18,16,14,12}`**. A fractional-pixel size is off-scale by definition, even when its rounded value happens to be in the set. The scale is read at runtime from TYP-3's catalog `verify` field (`Sizes in {…}; checks/type-scan`) so it cannot drift; the same set is the embedded fallback if that field cannot be parsed. A catalog that cannot be read stops the check with an `ERROR` and exit 1.

What this check misses is in [COVERAGE.md](COVERAGE.md).

**Matching engine:** candidates come from ast-grep through `checklib.astgrep_scan`
(see "The ast-grep front end" above). The type scale and per-rule selection are Python.

**Per-rule selection:** `--rules` accepts `TYP-1` and `TYP-3`. `detect.py`'s curated
implement-phase profile runs `--rules TYP-1`.

**Self-test:** `python3 checks/type-scan.py --self-test` → `SELF-TEST OK (59 cases)` (includes the `fixtures/parity/` corpus and the ast-grep provisioning contract).

## Component manifest (built)

`python3 checks/component-manifest.py <manifest.json> [<source-root>]` — validates a product's `.dx/component-manifest.json` against the DX SPEC (`docs/spikes/component-manifest/SPEC.md`): required keys, enum values, date format. Exit 0 silent on pass; exit 1 with one `ERROR` line per violation.

**CMP-1 import-diff — only when `coverage: "complete"`:** the diff flags any component import in changed source that resolves outside the manifest. When `coverage` is `"partial"` (or absent) the diff stays **off** and the script reports `partial manifest — diff not run` — a team that declares complete coverage is asserting the manifest is reliable enough to diff against.

What this check misses is in [COVERAGE.md](COVERAGE.md).

**Self-test:** `python3 checks/component-manifest.py --self-test` → `SELF-TEST OK (11 cases)`.

Wiring (V1): run as a PostToolUse hook on file edits during the implement phase
(fast subset: token-audit, type-scan) and as the verify-phase gate (full suite).
L0 failures block; L1 failures loop the agent back to implement.

Wiring status: `pnpm check` runs `design-catalog-validate.py`. Each script's
`--self-test` run is in `test:checks`, which `pnpm test` calls, so CI runs the
self-tests in its `Test` step. CI gets ast-grep from the pinned devDependency and
PyYAML from its `Install PyYAML` step, because the checks layer reaches both with
`subprocess`; the self-tests are what put the ast-grep provisioning contract and the
`fixtures/parity/` corpus in CI rather than leaving them to a dev machine.

`component-manifest.py` stays **manual**. It is on the `WIRING_EXEMPT` list in
`checks/design-catalog-validate.py`, with a one-line reason: it targets a product's
`.dx/component-manifest.json`, which this repo (the harness itself) does not have, so
wiring it here would have nothing to check.

`rendered-check.py` is **not wired**. It cannot run in `pnpm check` or CI, because it
needs a page that is already open and neither has one, so `[WIRING-SYNC]` can never be
satisfied by a rendered check. It stays until `design-lint` can open a live page. Run
it from verify's step 3, with the capture session still open, or from
`dx-design-critique` against a URL the person supplies.

The `[WIRING-SYNC]` check in `design-catalog-validate.py` now enforces this list: a control claiming
`enforced: script|partial` via a `script:` field must run from a `package.json` script or CI, or be on
`WIRING_EXEMPT` with a reason — the exemption list above is exactly, and only, what
`WIRING_EXEMPT` says. Stamping a control `enforced: script` without wiring the script
or adding an exemption now fails validation; that friction is the point.

Waiver handling: checks must respect inline `dx-waive <CTL-ID> reason="..."`
comments for L2 controls only — and the rendered check's element-scoped
`data-dx-waive="<CTL-ID>... reason=<text>"` DOM attribute on the same terms, except that
it suppresses its subtree outright where the inline form downgrades, and refuses an L0 id
outright rather than reporting it as claimed (see "Rendered check" above) — a waiver on
an L0/L1 control is itself reported as a
violation unless it appears in the decision record with a named approver (L1; L0 is
never waivable).
