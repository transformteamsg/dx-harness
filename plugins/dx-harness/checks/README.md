# Deterministic checks

Scripts that verify `check: deterministic` controls (and the deterministic half of
`hybrid` ones). Each check maps to DX-DS control ids, exits 0 on pass and 1 on
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
tails). `emit_error` also takes an optional `extra=` that fills the second bracket
(`[A11Y-2][jsx-a11y/interactive-supports-focus]`) — the slot `_FINDING_RE` already
tolerates and discards, so a finding can name the rule that fired without changing
the line shape.

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

checklib also loads the a11y rule map (`load_rule_map`,
`layer_controls` — see [A11y rule map](#a11y-rule-map-a11y-rule-mapjson--checkseslint)
below) so the three a11y layers read one file rather than three copies of it, and
reads control tiers from the catalogue with a stdlib parse (`catalog_tiers`,
`l0_subset`) so a check can say "this one is L0 and still blocks" without PyYAML —
`waiver-reconcile.py` keeps its own yaml-based reader because it needs whole control
bodies. checklib has its own gate: `python3 checks/checklib.py --self-test` →
`SELF-TEST OK (51 cases)`.

### The ast-grep front end: one door, one version floor

`checklib.astgrep_scan(paths, check_name)` is the **only** way a check reaches
ast-grep. No check shells out to `ast-grep` itself, so the version floor, the
config path, the explicit file list, the JSON shape and the 0-based to 1-based
line conversion are each enforced in exactly one place. A second copy of any of
them is where the floor silently stops being enforced.

- **Provisioning.** ast-grep is a harness-side dependency reached with
  `subprocess`, provisioned the same way PyYAML is: a named `Install ast-grep`
  step in CI, assumed present on a dev machine (`brew install ast-grep`, or
  `npm i -g @ast-grep/cli`). No manifest declares it, no binary is bundled, and
  **nothing is installed or configured in the repo being checked**. The harness's
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

## A11y rule map: `a11y-rule-map.json` + `checks/eslint/`

One file maps every accessibility rule the harness runs to exactly one control id:
`checks/a11y-rule-map.json` (JSON, not YAML — the check scripts are stdlib-only).

- `rules` — `"<prefix>/<rule>": "<CTL>"`, one control id per rule, never a list. The
  prefix names the tool the rule belongs to: `jsx-a11y/` for the static lint layer,
  `axe/` for the rendered check, `dx/` for the rendered check's own bespoke page
  evaluations. All 31 rules in jsx-a11y's `recommended` preset have a row, so a rule
  that fires can never be silently dropped; a rule with no row is reported as a
  misconfiguration, not attributed to a guessed control.
- `aria_prefix_control` — the control every axe rule id beginning `aria-` maps to
  (A11Y-8). It is one key rather than two dozen rows because the aria suite is
  resolved from the installed axe's `getRules()` at run time: a hardcoded list drifts
  on the next axe minor, and a rule the harness has never seen would otherwise be
  dropped.
- `layers` — the control ids each layer covers (`eslint-jsx-a11y`,
  `a11y-static-focus`, `contrast-token-pairs`, `axe-rendered`). A layer that could not
  run reads its own row to name the controls going to manual verification, so a
  control is never reported as passing by a layer that did not check it.

Per-rule run behaviour stays out of the map: `target-size` being force-enabled,
`bypass` being report-only and the A11Y-8 visibility demotion all live in the runner,
so the map keeps one job — rule to control — and one reader per layer.

Four rows attribute a finding to a control the eslint layer claims **no** coverage
for: `heading-has-content` and `scope` (A11Y-7, whose static half is the separate
`structure` check), `html-has-lang` (A11Y-9) and `no-distracting-elements` (A11Y-5).
They exist so a fired rule is reported honestly; only the `layers` row states
coverage.

`checks/eslint/jsx-a11y.config.mjs` is the harness-side eslint flat config the lint
layer runs. It sits in its own subdirectory because a `.mjs` file there is invisible
to `checklib.TARGET_EXTENSIONS` and to `validate.py`'s `live_checks_count` (which
counts `checks/*.py`), so it can neither become a scan target nor move a count.

The map's integrity — every mapped control id exists in `standards/catalog.yaml`, all
31 preset rules present, one control id per rule — is asserted by
`python3 checks/a11y-eslint.py --self-test`, not by `validate.py`.

## Detector — one entry over the checks (built)

`python3 checks/detect.py [<path>...]` is the **unified entry point**: a façade that
invokes the individual check scripts below (whose rules it never changes), maps their
exit codes onto one contract, and adds a config-based ignore layer. Targets are files
or directories (recursive); the default target is `.`. This is the check surface hooks
wire to (plan 060) — "fast signal without asking an AI".

**Wired as a hook (plan 060, opt-in).** `hooks/design-hook.py` is a consented Claude
Code PostToolUse hook that runs this detector's **curated profile only** (token-audit,
contrast, a11y-static, a11y-eslint, TYP-1) on an edited UI file and reminds the agent on new
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
crashed, or `.dx/config.json` is invalid). A wrapped script's exit 1 (violations) maps
to detect's exit 2; detect reserves exit 1 for crashes and misconfiguration. A script
that exits 1 with a stderr traceback, exits with a code outside {0,1}, or exits 1 with
no parseable `ERROR` line is treated as a crash — detect fails loud rather than passing
silently.

**Profiles.** The default is the **curated, low-false-positive subset**:
`token-audit`, `contrast`, `a11y-static`, `a11y-eslint`, and `type-scan`'s **TYP-1 rule
only** (via `type-scan --rules TYP-1`). The noisier rules — TYP-2 size floor and the rest — stay
recording-only. `--all` runs every page-check script: the curated set with `type-scan`'s
full rule set (so TYP-2 runs), plus `content-lint` and `component-manifest` (the latter
only when a `.dx/component-manifest.json` exists; otherwise it is reported skipped).

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
{"detector": {"ignoreFiles": ["legacy/*"], "ignoreValues": ["amber-11"], "ignoreRules": ["TYP-2"]}}
```

- `ignoreFiles` — glob-filters the scanned targets (drop a legacy folder). Globs match the
  repo-relative path or basename; `*` spans `/`.
- `ignoreValues` — fed to `token-audit`'s `--allow` mechanism (licence a sanctioned
  colour name / raw value); it feeds that allowlist, it does not replace it.
- `ignoreRules` — drops configured L1/L2 control ids from the run (post-parse; L0 and
  operational, control-less findings are never dropped).

`--no-config` bypasses the file entirely. An invalid or wrong-shaped `.dx/config.json` is
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

**Design-context freshness.** When `.dx/design.json` exists at the target repo root and
058's generator (`scripts/generate-design-json.py`) is present, detect also runs the
generator in `--check` mode; a stale `design.json` (generator exit 2) is surfaced as a
finding (exit 2), never a crash.

**Self-test:** `python3 checks/detect.py --self-test` → `SELF-TEST OK (79 cases)` — profile
selection, the 0/2/1 exit mapping (incl. curated excluding TYP-2 / `--all` including it),
each ignore type, invalid-config → exit 1, `ERROR`-line parsing (both the static
`<file>:<line>` and the rendered `<route>:<cell>` shape, at both of `_FINDING_RE`'s call
sites), and the JSON shape. The
wrapped scripts are not invoked in the self-test (it exercises detect's own pure logic);
their behaviour is proven by their own `--self-test`s and a real-corpus run over
`docs/loop-run/`.

## Validator (built)

`python3 checks/validate.py` — validates `standards/catalog.yaml` against the schema in `standards/README.md`: field presence and allowed values, tier→waiver pairing, `detail:` file existence, detail-frontmatter ↔ catalog consistency, a `gap:` reason on every `deterministic`/`hybrid` control that is effectively manual (or a temporary entry on the shrink-only `GAP_GRANDFATHERED` allowance list in `validate.py`), and that every control ID referenced in skills/docs exists in the catalog. Exit 0 on pass, exit 1 with `ERROR` lines on failure. This is the repo's verification baseline — run it before committing any `standards/` change.

The validator also enforces two **fragment-parity** sub-checks via `<!-- dx-sync:… -->` markers: `[L0-SYNC]` (the inline "Non-negotiables (L0)" lists in `CLAUDE.md` and `design/SKILL.md` must equal the catalog's `tier: L0` set) and `[SLP9-SYNC]` (the `copy` buzzword summary must be a subset of the canonical list in `standards/controls/slp-9.md`). See [docs/SYNC.md](../docs/SYNC.md). A third check, `[COUNT-SYNC]`, needs no markers: every "`<N> controls`", "`<N> skills`", "`<N> check scripts`", or "`<N> checks built`" claim in `README.md` **and `docs/index.html`** must equal the live count it claims — the catalog's control count, the number of `.claude/skills/*/SKILL.md` dirs, or `checks/*.py` minus `validate.py` minus `checklib.py` — so an added, removed, or renamed control/skill/check fails the build until the prose is updated. A fourth, `[WIRING-SYNC]`, verifies every `enforced: script|partial` claim actually runs in prebuild or CI (or is on the `WIRING_EXEMPT` allowlist below). A fifth, `[SKILL-SYNC]`, verifies every control id named under `.claude/skills/**` or `.claude/agents/**` exists in the catalog (no ghost ids), and every catalog id is named in at least one skill/agent file or sits on the `SKILL_WIRING_GRANDFATHERED` allowlist in `validate.py` (no silent orphans) — see `docs/SYNC.md`. A sixth, `[LAY-SYNC]`, verifies the inline layout-controls list in `design/SKILL.md`, `evaluator.md`, and `layout/SKILL.md` each equal the catalog's `LAY-*` id set — see `docs/SYNC.md`.

**Self-test:** `python3 checks/validate.py --self-test` → `SELF-TEST OK (109 cases)`.

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
"verified manually" is an auditable claim rather than a prose blob). Exit 0 with
`OK: N records audited` on pass; exit 1 with `ERROR <file>: <message>` lines on
failure. This is the record-audit layer of the eval workflow (`evals/README.md`);
hook-ready for V1 (PostToolUse on `docs/decisions/*` edits).

**Self-test:** `python3 checks/audit-record.py --self-test` → `SELF-TEST OK (21 cases)`.

Pass `--repo-root <path>` to audit a consumer repo's `docs/decisions/` (the default roots at the harness).

## A11y lint — jsx-a11y `recommended` (built — static subset)

`python3 checks/a11y-eslint.py [--repo-root <dir>] <path>...` — runs
eslint-plugin-jsx-a11y's maintained `recommended` preset (31 of its 39 rules) over a
target repo's `.js`/`.jsx`/`.mjs`/`.cjs`/`.ts`/`.tsx` source and prints every finding
under the control id its rule maps to. Exit 0 silent (or NOTEs only) on pass; exit 1
with `ERROR` lines on any violation.

**Nothing is installed or configured in the target repo.** The preset is switched on
from `checks/eslint/jsx-a11y.config.mjs` with `--no-config-lookup` and the target root
as CWD, so the target's own eslint config never loads and never changes the result: no
config file, no plugin entry, no dependency, no lockfile change. eslint, the plugin and
a TypeScript-capable parser are resolved from the **target's** `node_modules` —
directly, or through a package that declares them, because pnpm keeps a transitive
dependency out of the target root. `eslint-config-next` already carries all three.

**Coverage:** A11Y-2 (`click-events-have-key-events`, `no-static-element-interactions`,
`interactive-supports-focus`, `no-noninteractive-element-interactions`,
`mouse-events-have-key-events`, `no-noninteractive-tabindex`, `tabindex-no-positive`,
`anchor-is-valid`, `no-autofocus`, `no-access-key`), A11Y-3
(`label-has-associated-control`, `autocomplete-valid`), A11Y-6 (`alt-text`,
`img-redundant-alt`, `anchor-has-content`, `iframe-has-title`, `media-has-caption`),
A11Y-8 (the aria suite). Every one of those controls keeps a manual remainder, so none
of them reaches `enforced: script`.

**Why the preset, not all 39.** The maintainers' preset encodes real ARIA exceptions.
Measured on this repo: 1 finding under `recommended` against 8 under all 39, and all 7
extras are deliberately suppressed — 6 by rules the preset disables
(`prefer-tag-over-role` ×2, `control-has-associated-label` ×3, `label-has-for` ×1) and
1 by a rule the preset keeps but calibrates with its own options
(`no-noninteractive-tabindex`, exempted for `role="tabpanel"`). The preset's severities
and per-rule options are used verbatim; no rule outside it is enabled.

**Findings name the rule:** `ERROR <file>:<line> [<CTL>][jsx-a11y/<rule>] <message> —
suggest: fix per jsx-a11y/<rule>`, formatted by `checklib.emit_error`, so a finding
traces back to its row in `a11y-rule-map.json`.

**Static-subset caveat — what this layer does NOT verify:**

- Contrast (A11Y-1) — `contrast.py` answers declared token pairs; computed colours need
  a rendered page.
- A visible focus indicator (A11Y-2's focus half) — no eslint or axe rule exists, which
  is why `a11y-static.py`'s FOCUS rule stays bespoke.
- Focus traversal order (A11Y-2), cross-file `htmlFor`/`id` association (A11Y-3),
  informative-versus-decorative judgment (A11Y-6), closed overlays and ARIA state
  changes (A11Y-8).
- Anything a rendered DOM is needed for: that is the rendered check's half.

**A layer that did not run does not silently pass.** When eslint or the plugin cannot
be resolved, when the TypeScript parser is missing and `.ts`/`.tsx` files were in
scope (the run then covers `.js`/`.jsx` only), or when eslint cannot parse a file, the
check says so and names A11Y-2, A11Y-3, A11Y-6 and A11Y-8 as going to manual
verification, adding that A11Y-2 and A11Y-3 are L0 and block until verified by some
path. The coverage gap is an operational `ERROR` (exit 1), followed by explanatory
`NOTE`s where applicable, so `detect.py` cannot grade an incomplete run clean. A rule
that fires with no row in the map, an unreadable map, an eslint crash and a timeout are
operational `ERROR`s too. These lines carry no `<file>:<line> [<CTL>]` shape, so the
detector keeps them as control-less findings. When the given paths contain no lintable
source at all, the layer prints a NOTE and exits 0 because it had nothing in scope.

**Self-test:** `python3 checks/a11y-eslint.py --self-test` → `SELF-TEST OK (41 cases)`
(includes the `fixtures/a11y-eslint/` pass/fail files, and `preset-disabled-pass.tsx`
which proves the three rules the maintainers switch off stay off). The fixture cases
need the target toolchain; where it cannot be resolved they assert the honest skip path
instead, so the case count never depends on the environment.

## A11y focus scan (built — one bespoke rule)

`python3 checks/a11y-static.py <path>...` — scans `.css`, `.html`, `.jsx`, `.tsx`, `.js`, `.ts`, `.vue`, and `.svelte` files for the one accessibility rule no maintained tool provides: a focus outline removed with no visible replacement. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

**Rule:**

- **FOCUS (A11Y-2, L0):** A class string or CSS rule containing an outline-removal token (`outline-none`, `outline-0`, `focus:outline-none`, or CSS `outline: none/0`) with no focus-visible replacement (`focus-visible:outline`, `focus-visible:ring`, `focus-visible:border`, `focus-visible:shadow`, or CSS `:focus-visible { … outline|box-shadow|border … }`) on the same line.

**Why one rule.** 0 of axe's 105 rules and none of jsx-a11y's 39 check for a visible focus indicator, so FOCUS stays bespoke. The KBD rule (a click handler on a non-focusable element) and the NAME rule (an icon-only button with no accessible name) were **deleted** because their line-local regexes could not make reliable ARIA judgments. jsx-a11y's maintained preset replaces KBD and checks label association, but deliberately leaves `control-has-associated-label` disabled; icon-only accessible-name judgment therefore stays rendered/manual. This check no longer covers A11Y-3 at all, and covers only the focus half of A11Y-2.

**Static-subset caveat — what this script does NOT verify:**

- Keyboard reachability (A11Y-2's reachability half) — `a11y-eslint`'s `click-events-have-key-events`, `no-static-element-interactions` and `interactive-supports-focus`.
- Label association (part of A11Y-3) — `a11y-eslint`'s `label-has-associated-control`. Icon-only accessible names remain rendered/manual because the preset leaves `control-has-associated-label` disabled.
- Computed contrast ratios (A11Y-1) — `contrast.py` answers the declared token pairs; computed colours need rendered ones.
- Interactive hit-area size (A11Y-4) — needs computed layout.
- Focus traversal order and completeness (A11Y-2 traversal half) — needs a live DOM.
- ARIA state tracking — `aria-expanded`/`aria-pressed`/`aria-checked` updating to match visual state (A11Y-8 state half) — cannot be detected statically without cross-file variable mutation tracking. Deferred; manual pass required.
- Focus styles provided by a shared stylesheet: if `outline-none` appears in JSX but the `:focus-visible` recovery lives in a separate CSS file, the FOCUS rule will flag it. Cross-file CSS resolution needs a browser or axe-core, and this false-positive class is **accepted** rather than answered with a new dependency (`stylelint-a11y` was declined). Confirm the rendered element with a keyboard before treating a flag as a bug.

**Waiver suppression:** A11Y-2 is L0 — never waivable. This script does not parse `dx-waive` markers; every violation is a hard ERROR.

**Self-test:** `python3 checks/a11y-static.py --self-test` → `SELF-TEST OK (14 cases)` (includes the `fixtures/a11y-static/` pass/fail files, a case proving the deleted rules leave no coverage claim behind, and two that hold the docstring's load-bearing paragraphs in place).

## Contrast on declared token pairs (built — honest-inert)

`python3 checks/contrast.py [--tokens <globals.css>] [--repo-root <dir>]` — answers the
one part of A11Y-1 no rendered page can: do the design system's **declared** foreground
and background token combinations clear WCAG AA? A declared pair is a design-system
statement, measurable before anything renders; a rendered scan only ever sees the pairings
a page happens to use. Exit 0 on pass or NOTEs-only; exit 1 with `ERROR` lines on any
sub-AA declared pair.

**Where the pairs come from:** `- pairs: [["--foreground", "--background"], …]` under
`## Colour` in the product's DESIGN.md, projected into `.dx/design.json` as
`colour.pairs` by `scripts/generate-design-json.py` (its existing `- key: [json array]`
parse already handles it — the generator needed no change). Each name resolves as a
custom property (`--foo`) or as a Tailwind utility name (`foo`, through the `@theme`
alias).

**Honest-inert until pairs are declared.** Nothing declares pairs today, so with no
`colour.pairs` (or no `.dx/design.json` at all) the check grades A11Y-1 **N/A**, prints a
control-less operational `ERROR`, exits 1, and names A11Y-1 as going to manual
verification — adding that A11Y-1 is L0 and blocks until verified by some path. The
error keeps `detect.py` from grading the incomplete run clean. It never reports A11Y-1
as passing on the strength of a check that had nothing to measure. Same shape as CMP-1 with
`coverage: "complete"` and IDN-1/IDN-2 with the approved-asset registry.

**Token resolution (`--tokens <file>`, else `Tokens.source` in `.dx/design.json`):** the
colour map is built from a product's CSS token file (for this repo's own site,
`../app/globals.css` from `harness/`). It resolves direct hex, `var(--other)` chains
(transitively, cycle-safe), `color-mix(in oklab, var(--a) p%, <b>)` (mixed in OKLab per
the CSS spec), and `@theme inline` aliases (`--color-foo: var(--bar)`). An unresolved
token stays unresolved — never guessed: the pair becomes an operational `ERROR` naming
the token and goes to manual verification. A malformed declared pair is an operational
ERROR for the same reason. `detect.py`'s auto-discovery of `app/globals.css` still
supplies `--tokens` when it runs the check.

**Thresholds (unchanged):** ratio `< 3.0` → ERROR (fails even large text);
`3.0 ≤ ratio < 4.5` → ERROR noting it passes only as large text (≥24px / 18.66px bold —
confirm the size); `≥ 4.5` → clean. A finding points at the line in the token CSS where
the foreground token is declared, so it is navigable:
`ERROR app/globals.css:42 [A11Y-1] declared pair --foreground (#18181b) on --tw-blue
(#0064ff) = 3.60:1 (below 4.5:1) — suggest: …`.

**What replaced the line-local source scan, and why.** The old ERROR path paired a text
colour and a background colour found on the same line of source. Its colour maths was
sound — the Tailwind opacity compositing added for #122 works, and its last finding on
this repo was a real composited pair at 4.29:1, not a colour compared with itself. Two
limits ended it anyway: a line-local scan **cannot see an inherited or computed
background** (a rule setting only a text colour was never a candidate, which this file's
own docstring called the largest false-negative surface), and axe's `color-contrast` on a
rendered page answers that question on computed colours and is strictly better at it. Two
layers disagreeing about one L0 control is worse than one layer that is right. Deleted
with it: the Tailwind and CSS pairing regexes, `_classify_tw_value`, `_looks_like_colour`,
`_check_line`, `check_file` and `scan_paths`. **Kept:** `TokenResolver` (with `resolve`,
`_resolve_value`, `resolve_utility`, `resolve_colour_expr`, `page_base`), the OKLab
`color-mix` maths, `_parse_tw_alpha`, `_composite`, `_band`, `_verdict_line` and the
`--tokens` flag — the resolver surface another build reuses verbatim.

**What this check does NOT verify:**

- **Any rendered element**, and any pairing a product uses but never declared. That is the
  rendered check's half of A11Y-1.
- **Font-size-dependent large-text classification.** The 3.0–4.5 band is flagged
  conservatively with a "confirm the text size" note.
- **Non-text (UI component) contrast**, and `color-mix` in spaces other than `oklab`.

Path arguments are no longer scanned. A path on the command line only locates the repo
root (and says so in a `NOTE`); `detect.py` passes `--repo-root` instead of targets.

**Self-test:** `python3 checks/contrast.py --self-test` → `SELF-TEST OK (45 cases)`
(path-independent; builds throwaway product repos in a tempdir). It includes a case
asserting the resolver surface survives, and one proving a source file holding a
deliberately bad pairing is not scanned.

## Rendered check — axe on the open page (built — rendered subset)

`python3 checks/rendered-check.py [--session <name>] [--url <url>] [--viewports 360,1280]
[--themes auto|light|dark|both] [--json]` — runs axe against a page that is **already
open**, plus the harness's own page evaluations for the rules no maintained tool
provides. This is the rendered half of the accessibility stack; the static half is
`a11y-eslint` and `a11y-static` above. Exit 0 on a clean run or NOTEs only; exit 1 with
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
| `1280-reduced-motion` | 1280 | default | `reduced-motion` | A11Y-5 only |

Each cell scrolls to the document end in viewport-height steps and back to the top
before axe runs, because axe skips what is outside the viewport. `target-size` is
enabled **by name** — axe ships it off, Lighthouse re-enables it, and A11Y-4 has no other
coverage — and the run names its rules rather than taking a `runOnly` tag shortcut,
which would silently drop mapped ones. The aria suite comes from the installed axe's
`getRules()` at run time, so a rule the harness has never seen is still reported under
A11Y-8 with no harness edit. Where a product has no dark mode (no theme toggle, no
`.dark` or `[data-theme="dark"]` layer), the dark cells record `N/A, product has no dark
mode` — the same truthful outcome verify records, never a pass.

**Coverage.** A11Y-1 (`color-contrast`, both themes), A11Y-3 (`label`), A11Y-4
(`target-size`), A11Y-5 (the reduced-motion evaluation), A11Y-6 (`image-alt`,
`svg-img-alt`), A11Y-7 (`list`, `listitem`, `heading-order`), A11Y-8 (the aria suite),
A11Y-9 (`document-title`, `html-has-lang`), A11Y-10 (`bypass`, report-only). Every one
of them keeps a manual remainder **and** depends on a URL being available, so none of
them reaches `enforced: script`.

**Three buckets, not two.** Violations become `ERROR` lines and exit 1. Passes are
counted once per cell and never printed per node, because a per-node pass list invites
reading "axe found nothing" as "this control is met". `incomplete` is the third bucket:
it rides the `NOTE` channel, naming the control, the rule and the DOM node as an item
for the manual accessibility pass. It gates nothing and is dropped by nothing. Two more
things land there. An A11Y-8 finding on markup a person cannot currently reach —
`hidden`, `aria-hidden="true"`, `display: none` or `visibility: hidden` on the node or an
ancestor — is demoted rather than gated on, which is what "visible components only"
means for a runner that clicks nothing. And `bypass` is report-only, so A11Y-10 never
contributes to a non-zero exit; skip-link-first confirmation stays with the manual pass.
Where every rule mapped to a control came back `inapplicable`, that control records N/A
with the reason.

**The finding line names a page and a cell.** `ERROR <route>:<cell> [<CTL>][<rule>] …` —
see the position-slot paragraph under `checklib.py` above.

**The `data-dx-waive` DOM marker.** The rendered analogue of the inline `dx-waive`
comment, for a layer whose findings have no source file to carry one:

```html
<div data-dx-waive="SLP-4 SLP-6 reason=quarantined anti-specimen">
```

The runner skips that element's subtree for the named controls only. It is element
scoped permanently — a per-URL ignore list would exempt a whole page and hide real
regressions elsewhere on it, a register-scoped exemption would make a permanent blind
spot, and it never becomes a `detector.ignoreRules`, `ignoreFiles` or `ignoreValues`
entry. Grammar: one or more uppercase `[A-Z0-9]+-\d+` ids, then the literal `reason=`,
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
  refuses an L0 waiver, and the DOM form must not become the way around it. An unknown
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
useless. A11Y-1 and A11Y-3 are L0 and still block until verified by some path.

**Static-subset caveat — what this check does NOT verify:**

- **A visible focus indicator (A11Y-2).** 0 of axe's 105 rules check for one, which is
  why `a11y-static.py`'s FOCUS rule stays bespoke. This check claims no part of A11Y-2.
- **A11Y-11**, which needs interaction. It stays fully evaluator and manual.
- **Anything behind an interaction.** The runner clicks nothing, hovers nothing and
  opens nothing, so closed overlays, state changes and traversal order stay with the
  evaluator by construction.
- **Whether an animation is *essential*** (A11Y-5's judgment half), whether an image is
  informative or decorative (A11Y-6), whether a heading is descriptive (A11Y-7), and
  whether an SPA updates its title per view (A11Y-9).

**The harness-side Node dependency.** `@axe-core/playwright` (which brings its own
`axe-core`) and `playwright-core` are declared in `plugins/dx-harness/package.json` and
installed into the plugin's own `node_modules` with `npm install --prefix <plugin dir>`.
**Nothing is installed into the repo being checked** — the site's `package.json` and
lockfile are untouched, and the generated lockfile is gitignored, exactly like the global
ast-grep install. A missing driver dependency is the layer-did-not-run case above, not a
crash.

**Not wired into prebuild or CI, and not exempted either.** It needs an open page, and
neither `package.json` nor `ci.yml` has one, so `[WIRING-SYNC]` cannot be satisfied by it
— but the check also claims no control's `script:` field yet, so there is nothing for
`[WIRING-SYNC]` to ask about and a `WIRING_EXEMPT` entry today would be a **dead
exemption**, which is itself an ERROR (`validate.py`: an exempted script no longer
claimed by any control). The `script:` fields and the `enforced:` labels are #162's, and
the exemptions land in the same commit as the claims. The decided values this check hands
to that recount: A11Y-1, A11Y-3, A11Y-4, A11Y-5, A11Y-6, A11Y-7, A11Y-8, A11Y-9 and
A11Y-10 all stay or become `enforced: partial` with `checks/rendered-check.py` added to
`script:`; **none reaches `script`**, because every one of them depends on a URL being
available and every one keeps a manual remainder. A11Y-5 in particular stays `partial`
and gains both keys, which it has neither of today.

**Self-test:** `python3 checks/rendered-check.py --self-test` → `SELF-TEST OK (141
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

`python3 checks/content-lint.py <path>...` — scans `.mdx`, `.md`, `.tsx`, `.jsx`, `.ts`, `.js`, `.vue`, `.svelte`, `.css`, and `.html` files for the statically-resolvable subset of CNT-1, CNT-3, CNT-5, CNT-6, CNT-13, and the deterministic (lint) half of SLP-9. Accepts files or directories (recursive). Exit 0 silent on pass; exit 1 with `ERROR` lines on failure.

**Single-source word lists:** the SLP-9 buzzword, AI-vocabulary, filler, and chatbot-artifact lists are **read at runtime** from `standards/controls/slp-9.md` (resolved relative to the check, from the `<!-- dx-sync:slp9-buzzwords -->` marked span and the named bullets in "How to verify") — never embedded as a third copy, so the lint and the catalog cannot diverge. The CNT-5 device-verb list is read the same way from `cnt-5.md` (`<!-- dx-sync:cnt5-verbs -->`), the CNT-6 opener/filler lists from `cnt-6.md` (`<!-- dx-sync:cnt6-openers -->`, `<!-- dx-sync:cnt6-filler -->`), and the CNT-13 spelling maps from `cnt-13.md` (`<!-- dx-sync:cnt13-usuk -->`, `<!-- dx-sync:cnt13-typos -->`). If a file cannot be found or parsed, the check falls back to a small embedded copy and prints a `NOTE` saying so — never silently.

**Scope: what a rule body ever sees.** Code and markup lines go through two passes before any CNT rule runs, which is what keeps the prose rules off Tailwind class names.

1. **Mask.** Class values, style values, class-builder calls (`cn`, `clsx`, `classNames`, `twMerge`, `cva`), known stylesheet/query tagged templates (`css`, `styled.*`, `gql`, `graphql`, `sql`, `keyframes`, `createGlobalStyle`, `injectGlobal`), module paths, equality and `case` operands, and non-rendering attribute values (`key`, `id`, `htmlFor`, `href`, `src`, `to`, `type`, `role`, `name`, `data-*`, and identifier-valued `aria-*` attributes) are replaced by spaces of the same length. Human-readable ARIA strings and templates with unknown or localisation/rendering tags remain in scope. Offsets survive, so the line a finding names survives. A class value cannot reach a rule body by any route: attribute, object key, builder argument, Vue or Svelte `class:` directive, template literal, or a value the formatter wrapped across lines. In `.css` the same applies to an at-rule prelude, so an `@media (orientation: landscape)` condition and an `@apply` class list are not read as prose.
2. **Extract.** What is left is collected as strings tagged with an origin: `jsx_text` (an element's text child), `prop:<name>` (a rendering prop, by allowlist: `title`, `label`, `aria-label`, `aria-braillelabel`, `aria-brailleroledescription`, `aria-description`, `aria-placeholder`, `aria-roledescription`, `aria-valuetext`, `placeholder`, `alt`, `description`, `heading`, `subtitle`, `caption`, `summary`, `legend`, `tooltip`, `helperText`, `errorMessage`, `emptyMessage`, `confirmLabel`, `cancelLabel`), `template_segment` (one static run of a template literal, split on `${…}`), `literal` (a bare string literal anywhere else), or `mdx_prose`. Markdown keeps its prose-line path unchanged.

The SLP-9 half scans the masked **line**, not only the extracted strings: a buzzword in a shipped identifier is still a tell, and masking is what removes its class-name findings. CNT-1's raw-code half reads the origin, and only runs where an all-caps token cannot be a wordmark (see its rule below).

**Rules:**

- **SLP-9 (L2, lint half):** a word-boundaried, case-insensitive hit on the buzzword or AI-vocabulary list; a hit on the filler or chatbot-artifact phrase lists; or two or more em dashes inside one sentence. Markdown table rows (lines starting `|`) are skipped for the em-dash rule — those dashes are structural per SLP-9's "Do not flag" list.
- **CNT-3 (L2):** a user-facing string (any origin above) or MDX/MD prose line whose longest sentence exceeds 25 words. Words either side of an interpolation are never joined into one sentence.
- **CNT-1 (L1):** a user-facing string that is *only* a raw error code (`ERR_SYNC_500`, `0x…`, an all-caps token), or the bare literal "Something went wrong" with no actionable next step on the same or next line. Conservative — when unsure, does not flag. The raw-code half runs on origins `literal` and `mdx_prose` only, where "this string is nothing but a code" is decidable; in rendered text an all-caps token is as likely a wordmark, a badge or an acronym, so the full error anatomy stays with the evaluator. The "Something went wrong" half is unambiguous prose and runs on every origin.
- **CNT-5 (L2):** a device-bound action verb (click/tap/swipe and inflections) inside a multi-word user-facing string or MDX prose line. Bare event names and identifiers (`onClick`, `addEventListener("click", …)`) are not copy and are not flagged.
- **CNT-6 (L2):** a sentence-*initial* empty opener ("There is", "There are", "It is", "This is") or a safe-subset filler word (just, really, very, please) in a multi-word user-facing string or MDX prose line. "In order to" is deliberately NOT in the CNT-6 lists — SLP-9's filler-phrase rule owns it, so one token never fires two controls. A template segment that follows an interpolation is not a sentence start, so the opener rule skips its first sentence and checks the rest.
- **CNT-13 (L2):** a US spelling or common misspelling in a multi-word user-facing string or MDX prose line, read from `cnt-13.md`, with the British or corrected spelling as the suggestion. A bare one-word identifier is not flagged.

**Static-subset caveat — what this script does NOT verify:**

- Strings built by concatenation, and an imported constant used as copy (`<h1>{TITLE}</h1>`) — unresolvable at the use site; the constant is linted at its definition site instead, as origin `literal`. A template literal IS linted, per static segment; the interpolated expression itself never is.
- Whether a string is truly user-facing vs. an internal label, key, or fixture — class values, style values, module paths and non-rendering attribute values are masked outright (see Scope above); past that, conservative heuristics, and coordinate / SVG-path data (mostly numeric tokens) is excluded.
- A text child or attribute value that no line in the file completes — the scanner carries a construct across lines, but a file whose tags or quotes do not balance is extracted from as far as the scanner can model it and no further. It never falls back to scanning the whole line, because whole-line scanning is the false-positive bug it replaced.
- Class or text in `.html` `<script>` and `<style>` blocks, and prose in `.css` beyond the at-rule masking — the SLP-9 line scan still reads them; no CNT rule does.
- CNT-7 (descriptive copy leads with its purpose) — judgment (evaluator); split from CNT-3.
- SLP-9's structural-tell *evaluator* half — negative parallelism, forced triads, copula avoidance, significance inflation, redundant label/helper pairs, em-dash clustering across a paragraph — all judgment (evaluator).
- CNT-1's full "what happened → what it means → what to do next" anatomy — judgment (evaluator); the script only catches the raw-code-only and bare-"Something went wrong" cases.
- CNT-5's harder half — "press" and "see", ambiguous link text ("click here", "read more"), and confirming a hit is a UI instruction rather than incidental prose — judgment (evaluator).
- CNT-6's harder half — "such", "that", droppable articles/conjunctions ("a", "the", "and"), and the clarity exception on every hit ("only if it does not reduce clarity") — judgment (evaluator).

**Self-test:** `python3 checks/content-lint.py --self-test` → `SELF-TEST OK (87 cases)` (includes the `fixtures/content-lint/` pass/fail files, the runtime-coupling case, and the loud-fallback case).

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

**Matching engine:** candidates come from ast-grep through `checklib.astgrep_scan`
(see "The ast-grep front end" above). The type scale, both floors, the line-height
band and per-rule selection are unchanged Python. TYP-2's band stays body-scoped,
but ancestry answers "am I inside an `h1` to `h6` rule" now, which retired the
hand-rolled CSS brace state machine and the heading-tag line regex.

**Self-test:** `python3 checks/type-scan.py --self-test` → `SELF-TEST OK (73 cases)` (includes the `fixtures/parity/` corpus and the ast-grep provisioning contract).

## Component manifest (built)

`python3 checks/component-manifest.py <manifest.json> [<source-root>]` — validates a product's `.dx/component-manifest.json` against the DX SPEC (`docs/spikes/component-manifest/SPEC.md`): required keys, enum values, date format. Exit 0 silent on pass; exit 1 with one `ERROR` line per violation.

**CMP-1 import-diff — only when `coverage: "complete"`:** the diff flags any component import in changed source that resolves outside the manifest. When `coverage` is `"partial"` (or absent) the diff stays **off** and the script reports `partial manifest — diff not run` — a team that declares complete coverage is asserting the manifest is reliable enough to diff against.

**What this script does NOT verify:** re-exports and barrel files can produce false-positive diff hits when an import resolves through a barrel that isn't the manifest's import path; if you hit these, downgrade to `coverage: "partial"` and the diff stays off (same trust lesson as `token-audit`). The manifest is only as complete as the product keeps it — a stale manifest passes schema validation but misses new components.

**Self-test:** `python3 checks/component-manifest.py --self-test` → `SELF-TEST OK (11 cases)`.

Planned for V1 (remaining):

| Check | Controls | Approach |
|---|---|---|
| ~~`contrast`~~ | ~~A11Y-1~~ | ✅ built — `contrast` grades the declared token pairs before anything renders; `rendered-check` runs axe `color-contrast` on the open page in both themes. axe's `incomplete` items (a background image, a gradient) stay manual |
| ~~`focus`~~ | ~~A11Y-2~~ | ✅ built (static subset) — `a11y-static` covers FOCUS (outline removal), `a11y-eslint` covers keyboard reachability (`click-events-have-key-events`, `no-static-element-interactions`, `interactive-supports-focus`); traversal order and hit-area still need a rendered DOM |
| ~~`labels`~~ | ~~A11Y-3~~ | ✅ built (static subset) — `a11y-eslint` covers `label-has-associated-control` and `autocomplete-valid`; placeholder-only label and cross-file `htmlFor`/`id` association still need a rendered DOM |
| ~~`targets`~~ | ~~A11Y-4~~ | ✅ built (rendered) — `rendered-check` runs axe `target-size`, force-enabled, at 360 and 1280 |
| ~~`reduced-motion`~~ | ~~A11Y-5~~ | ✅ built (rendered) — `rendered-check`'s one reduced-motion cell reports what still moves under the emulation; whether an animation is *essential* stays with the evaluator |
| ~~`alt-scan`~~ | ~~A11Y-6~~ | ✅ built (static subset) — `a11y-eslint` covers `alt-text`, `img-redundant-alt`, `anchor-has-content`, `iframe-has-title`, `media-has-caption`; the informative-versus-decorative judgment and every non-JSX image stay manual |
| `structure` | A11Y-7 (deterministic half) | Heading-hierarchy walk; lists/tables/groups are semantic elements |
| ~~`nrv`~~ | ~~A11Y-8 (deterministic half)~~ | ✅ built (static subset) — `a11y-eslint` covers the aria suite (`aria-props`, `aria-role`, `role-has-required-aria-props`, `role-supports-aria-props`, `no-redundant-roles`, the role-conversion rules); ARIA state tracking (aria-expanded/pressed/checked) is the deferred extension — too fuzzy statically, manual pass required |
| ~~`token-audit`~~ | ~~TOK-1..3, COL-1..2~~ | ✅ built |
| ~~`type-scan`~~ | ~~TYP-1..4~~ | ✅ built (static subset) — `type-scan` covers TYP-1 (font families), TYP-2 (size floor + unitless line-height), TYP-3 (on-scale, scale sourced from the catalog), TYP-4 (no all-caps, acronyms exempt); font *weights*, the label-vs-body floor decision, and px/% line-heights still need rendered context |
| `cmp-scan` | CMP-2, CMP-3, CMP-9 (deterministic halves) | Enumerate destructive actions and assert a consequence surface + undo/confirm exists; enumerate async actions and assert loading/success/error states exist and are reachable; find `dangerouslySetInnerHTML`/`v-html` on cross-user content and check for a sanitiser in the render path |
| ~~`content-lint`~~ | ~~CNT-1, CNT-3, CNT-5, CNT-6, CNT-13, SLP-9 (deterministic half)~~ | ✅ built (static subset) — `content-lint` covers CNT-1 (raw codes), CNT-3 (sentence length), CNT-5 (device verbs, from `cnt-5.md`), CNT-6 (sentence-initial empty openers + safe filler subset, from `cnt-6.md`), CNT-13 (US spellings and common misspellings, from `cnt-13.md`), and the SLP-9 lint lists (read live from `standards/controls/slp-9.md`) + em-dash chains; the SLP-9 structural-tell evaluator half, CNT-7 (lead-with-purpose, split from CNT-3), and the CNT-5/CNT-6/CNT-13 judgment halves stay evaluator |
| `motion` | MOT-1, MOT-2, SLP-8 | Animation durations within 100–300ms, standard easing, none decorative on critical paths; motion values resolve to the declared motion token set; no bounce/elastic/overshoot easing |
| `identity` | IDN-1, IDN-2 | Logo/lockup files resolve to the approved asset library and product icons to the approved icon family; no inline redraws |
| `slop-scan` | SLP-1..3 | Stylesheet/DOM scan: purple-violet gradient palettes, cyan-on-dark theming, glow accents, gradient text, thick side-tab borders on rounded cards |
| `slop-rendered` | SLP-4, SLP-6 | Rendered checks, because both need a real page: nested cards in the rendered tree, and the adjacent type-scale ratio actually used |

Wiring (V1): run as a PostToolUse hook on file edits during the implement phase
(fast subset: token-audit, type-scan, content-lint) and as the verify-phase gate
(full suite). L0 failures block; L1 failures loop the agent back to implement.

Wiring status (plan 069): `package.json` prebuild and `.github/workflows/ci.yml` both
run the same Python gate: `validate.py --self-test`, `validate.py`,
`checklib.py --self-test`, `token-audit.py --self-test`, `type-scan.py --self-test`,
`token-audit.py` over `app components lib`, `a11y-static.py`, and `type-scan.py` over
`app components`. CI adds an `Install ast-grep` step beside `Install PyYAML`, because
the checks layer reaches ast-grep with `subprocess`; the three `--self-test` runs are
what put the ast-grep provisioning contract and the `fixtures/parity/` corpus in the
gate rather than leaving them to a dev machine.
`type-scan` was wired in once its tree went clean (plan 068's Tailwind default type
scale migration removed the sub-14px `text-[11/12/13px]` labels and tight
`leading-[…]` headings it flagged).

`content-lint.py`, `contrast.py`, and `component-manifest.py` stay **manual** — each is
on the `WIRING_EXEMPT` list in `checks/validate.py`, with a one-line reason. Per the
harness rule "never wire a failing check into the build," `content-lint` surfaces
pre-existing long-sentence (CNT-3) and filler-word (CNT-6) prose in `content/` and is
not wired until that content is fixed or waived. `contrast` is exempt for a different
reason since it became a token-pair check: it is **honest-inert** until a product
declares `colour.pairs` in DESIGN.md, and this repo declares none, so it emits an
operational ERROR that blocks for manual A11Y-1 verification. Build wiring is deferred
to the catalogue recount; the design verification path runs it through `detect.py` now.
`component-manifest` targets a product's
`.dx/component-manifest.json`, which this repo (the harness/site itself) does not
have — wiring it here would have nothing to check.

`rendered-check.py` is **not wired**, and it is deliberately **not** on `WIRING_EXEMPT`
either, for both of the reasons that can make an exemption wrong. It cannot run in
prebuild or CI at all, because it needs a page that is already open and neither has one —
`[WIRING-SYNC]` can never be satisfied by a rendered check. And no control names it in a
`script:` field yet (the A11Y recount is a separate change), so an exemption today would
be a **dead exemption**, which is itself an error. The exemption and the `script:` claim
have to land in the same commit. Run it from verify's step 3, with the capture session
still open, or from `dx-design-critique` against a URL the person supplies.

`a11y-eslint.py` is **not wired** either, for the second of those two reasons: no control
names it in a `script:` field yet, so `[WIRING-SYNC]` has nothing to ask of it. It stays
unwired on its own merit too: on this tree the layer reports one finding,
`jsx-a11y/interactive-supports-focus` at `components/diagrams/orbit-loop.tsx:319`
("Elements with the 'tablist' interactive role must be focusable"), on a tablist whose
tabs carry the roving `tabIndex` and whose arrow keys are handled on the container. That
belongs to the manual A11Y-2 pass, and per the harness rule a failing check is never
wired into the build. Run it from the design skills' verify step
(`skills/design/dx-design-execute/verify.md`) and through `detect.py`'s curated profile.

The `[WIRING-SYNC]` check in `validate.py` now enforces this list: a control claiming
`enforced: script|partial` via a `script:` field must run in prebuild or CI, or be on
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
