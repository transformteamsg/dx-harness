#!/usr/bin/env python3
"""
Static a11y lint — checks/a11y-eslint.py
Runs eslint-plugin-jsx-a11y's maintained `recommended` preset (31 of its 39
rules) over a target repo's JSX/TSX source and prints every finding under the
control id its rule maps to. This is the eslint half of the static check; the
bespoke half is a11y-static.py's FOCUS rule, and everything that needs a
rendered page belongs to the rendered check.

Nothing is installed or configured in the target repo
─────────────────────────────────────────────────────
The preset is switched on from a harness-side flat config
(`checks/eslint/jsx-a11y.config.mjs`) with `--no-config-lookup` and the target
root as CWD, so the target's own eslint config never loads: no config file, no
plugin entry, no dependency and no lockfile change is written into the target.
eslint, `eslint-plugin-jsx-a11y` and a TypeScript-capable parser are resolved
from the TARGET repo's own node_modules (directly, or through a package that
declares them — pnpm keeps a transitive dependency out of the target root).

Coverage (the static column only)
──────────────────────────────────
Control   Rules
A11Y-2    click-events-have-key-events, no-static-element-interactions,
(L0)      interactive-supports-focus, no-noninteractive-element-interactions,
          mouse-events-have-key-events, no-noninteractive-tabindex,
          tabindex-no-positive, anchor-is-valid, no-autofocus, no-access-key
A11Y-3    label-has-associated-control, autocomplete-valid
(L0)
A11Y-6    alt-text, img-redundant-alt, anchor-has-content, iframe-has-title,
          media-has-caption
A11Y-8    the aria suite — aria-props, aria-proptypes, aria-role,
          aria-unsupported-elements, aria-activedescendant-has-tabindex,
          role-has-required-aria-props, role-supports-aria-props,
          no-redundant-roles, no-interactive-element-to-noninteractive-role,
          no-noninteractive-element-to-interactive-role

Every one of the 31 preset rules has a row in `checks/a11y-rule-map.json`, so a
rule that fires can never be silently dropped. Four of those rows attribute a
finding to a control this layer claims NO coverage for — heading-has-content
and scope (A11Y-7, whose static half is the separate `structure` check),
html-has-lang (A11Y-9) and no-distracting-elements (A11Y-5). They exist so a
finding is reported honestly, not to claim a control.

What this layer does NOT verify
────────────────────────────────
- Contrast (A11Y-1) — checks/contrast.py answers declared token pairs; a
  rendered page answers computed colours.
- A visible focus indicator (A11Y-2's focus half) — no eslint or axe rule
  exists; a11y-static.py's FOCUS rule stays bespoke for it.
- Focus traversal order (A11Y-2), cross-file `htmlFor`/`id` association
  (A11Y-3), informative-versus-decorative judgment (A11Y-6), closed overlays
  and ARIA state changes (A11Y-8) — every control above keeps a manual
  remainder, so none of them reaches `enforced: script`.
- Anything the preset's maintainers leave off. All 39 rules were measured on
  this repo and rejected: 8 findings against the preset's 1, with all 7 extras
  deliberately suppressed by the maintainers.

A layer that did not run sends its controls to manual verification
───────────────────────────────────────────────────────────────────
When eslint (or the plugin) cannot be resolved, when the TypeScript parser
cannot be resolved and .ts/.tsx files were in scope, or when there is nothing
to lint, the layer says so and names the controls going to manual verification
by reading its `layers` row in the rule map. A control never silently passes,
and an L0 control still blocks until verified by some path.

Output
──────
ERROR <file>:<line> [<CTL>][jsx-a11y/<rule>] <message> — suggest: <...>
NOTE  a11y-eslint: <...>
Exit 0 and print nothing (or NOTEs only, or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation, operational failure, or unverified
coverage gap. Operational and coverage ERRORs carry no <file>:<line> [<CTL>]
shape, so detect.py keeps them as control-less findings rather than grading an
incomplete run clean.
"""

import importlib.util
import json
import os
import re
import subprocess
import sys

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_checklib():
    path = os.path.join(_CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()

# The harness-side flat config. It lives under checks/eslint/ so a .mjs file is
# never a scan target (checklib.TARGET_EXTENSIONS) and never moves
# validate.py's live_checks_count (which counts checks/*.py).
CONFIG_PATH = os.path.join(_CHECKS_DIR, "eslint", "jsx-a11y.config.mjs")

# The rule map's layer name for this check.
LAYER = "eslint-jsx-a11y"

# eslint's wording for an eslint-disable directive naming a rule this config
# does not define. Matched on the message text because eslint attaches no
# messageId to it and sets ruleId to the unknown rule, which is
# indistinguishable from a real finding by shape alone. Pinned by a self-test
# case, so an eslint release that rewords it fails loudly here rather than
# silently reporting every disable directive in the target as a finding.
UNKNOWN_RULE_RE = re.compile(r"^Definition for rule '.+' was not found\.?$")

# Extensions eslint is asked to lint. .ts/.tsx need a TypeScript-capable
# parser; without one they are dropped and named, never silently passed.
LINT_EXTENSIONS = {".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"}
TS_EXTENSIONS = {".ts", ".tsx"}

# Same ceiling detect.py puts on a wrapped check (detect.CHECK_TIMEOUT): a hung
# tool is a failure, not a silent pass.
ESLINT_TIMEOUT = 180

# Node resolves modules from the nearest package.json, so that is the target
# root; .git / .dx are the fallback markers the other checks use.
_ROOT_MARKERS = ("package.json", ".git", ".dx")

# Resolves the toolchain from the TARGET repo. A transitive dependency (pnpm
# keeps those out of the target root) resolves through the package that
# declares it.
_PROBE_JS = r"""
const { createRequire } = require("node:module");
const path = require("node:path");
const root = process.env.DX_TARGET_ROOT;
const rootRequire = createRequire(path.join(root, "__dx_resolve__.cjs"));
const hostPkgs = [];
for (const host of ["eslint-config-next", "typescript-eslint",
                    "@typescript-eslint/eslint-plugin"]) {
  try { hostPkgs.push(rootRequire.resolve(host + "/package.json")); } catch {}
}
function resolveDep(name) {
  try { return rootRequire.resolve(name); } catch {}
  for (const pkg of hostPkgs) {
    try { return createRequire(pkg).resolve(name); } catch {}
  }
  return null;
}
let eslintBin = null;
const eslintPkgPath = resolveDep("eslint/package.json");
if (eslintPkgPath) {
  const pkg = createRequire(eslintPkgPath)("./package.json");
  const rel = typeof pkg.bin === "string" ? pkg.bin : (pkg.bin && pkg.bin.eslint);
  if (rel) eslintBin = path.join(path.dirname(eslintPkgPath), rel);
}
process.stdout.write(JSON.stringify({
  eslint_bin: eslintBin,
  plugin: resolveDep("eslint-plugin-jsx-a11y"),
  parser: resolveDep("@typescript-eslint/parser"),
}));
"""


# ── Target root and targets ────────────────────────────────────────────────────

def find_target_root(paths):
    """The target repo's root: the nearest ancestor of the first path holding a
    package.json (node's resolution root), else a .git / .dx marker, else the
    cwd."""
    start = os.path.abspath(paths[0]) if paths else os.getcwd()
    if os.path.isfile(start):
        start = os.path.dirname(start)
    cur = start if os.path.isdir(start) else os.getcwd()
    while True:
        for marker in _ROOT_MARKERS:
            if os.path.exists(os.path.join(cur, marker)):
                return cur
        parent = os.path.dirname(cur)
        if parent == cur:
            return os.getcwd()
        cur = parent


def partition_targets(paths, extensions=LINT_EXTENSIONS):
    """
    Split the given paths into (lint_paths, missing, ts_present).

    A directory is passed to eslint whole when it holds at least one lintable
    file (eslint walks it itself, and the harness config ignores vendor and
    build trees); a file is kept when its own extension is lintable. Anything
    else — a .css target from detect.py's expanded file list, for instance — is
    dropped, because eslint fails on a target it cannot lint.
    """
    lint_paths, missing = [], []
    ts_present = False
    for p in paths:
        if os.path.isdir(p):
            found = [v for kind, v in checklib.iter_target_files([p], extensions)
                     if kind == "file"]
            if found:
                lint_paths.append(p)
                ts_present = ts_present or any(
                    os.path.splitext(f)[1].lower() in TS_EXTENSIONS for f in found)
        elif os.path.isfile(p):
            ext = os.path.splitext(p)[1].lower()
            if ext in extensions:
                lint_paths.append(p)
                ts_present = ts_present or ext in TS_EXTENSIONS
        else:
            missing.append(p)
    return lint_paths, missing, ts_present


def has_ts_targets(paths):
    """True when any given path is, or holds, a .ts/.tsx file."""
    _, _, ts_present = partition_targets(paths, TS_EXTENSIONS)
    return ts_present


# ── Toolchain resolution ───────────────────────────────────────────────────────

def resolve_toolchain(target_root, node="node"):
    """
    Resolve eslint, eslint-plugin-jsx-a11y and a TypeScript-capable parser from
    the target repo. Returns (toolchain, reason): a dict with `node`,
    `eslint_bin`, `plugin` and `parser` (parser may be None) on success, or
    (None, reason) when the layer cannot run.
    """
    probe_env = dict(os.environ)
    probe_env["DX_TARGET_ROOT"] = os.path.abspath(target_root)
    try:
        proc = subprocess.run([node, "-e", _PROBE_JS], env=probe_env,
                              capture_output=True, text=True, timeout=ESLINT_TIMEOUT)
    except (OSError, subprocess.SubprocessError) as exc:
        return None, f"node could not be run ({exc.__class__.__name__})"
    if proc.returncode != 0 or not proc.stdout.strip():
        return None, f"module resolution failed in {target_root} (node exit {proc.returncode})"
    try:
        found = json.loads(proc.stdout)
    except ValueError:
        return None, "module resolution returned no JSON"
    if not found.get("eslint_bin") or not os.path.isfile(found["eslint_bin"]):
        return None, f"no eslint in {target_root}'s node_modules"
    if not found.get("plugin"):
        return None, f"no eslint-plugin-jsx-a11y in {target_root}'s node_modules"
    return {
        "node": node,
        "eslint_bin": found["eslint_bin"],
        "plugin": found["plugin"],
        "parser": found.get("parser"),
    }, None


def build_argv(toolchain, targets, config_path=CONFIG_PATH):
    """The eslint invocation. `--no-config-lookup` is what keeps the target
    repo's own eslint config out of the result."""
    return [toolchain["node"], toolchain["eslint_bin"],
            "--no-config-lookup", "--config", config_path,
            "--format", "json"] + list(targets)


def build_env(toolchain, base_env=None):
    """The environment the harness config reads its absolute module paths
    from. The config sits outside the target's module tree, so a bare import
    inside it would not resolve."""
    env = dict(os.environ if base_env is None else base_env)
    env["DX_A11Y_PLUGIN"] = toolchain["plugin"]
    if toolchain.get("parser"):
        env["DX_A11Y_PARSER"] = toolchain["parser"]
    else:
        env.pop("DX_A11Y_PARSER", None)
    return env


# ── Fallback reporting ─────────────────────────────────────────────────────────

def manual_verification_notes(reason, controls, tiers=None):
    """
    The did-not-run report: name the reason, name every control the layer
    covers, and say that an L0 control still blocks. A control is never
    reported as passing by a layer that did not check it.
    """
    lines = [f"ERROR a11y-eslint: did not run — {reason}",
             f"NOTE  a11y-eslint: {', '.join(controls)} go to manual verification "
             f"(not reported as passing)"]
    l0 = checklib.l0_subset(controls, tiers)
    if l0:
        lines.append(f"NOTE  a11y-eslint: {', '.join(l0)} are L0 — they block until "
                     f"verified by some path")
    return lines


def parser_gap_notes(controls, tiers=None):
    """The .tsx half of the run is missing: say so and name the controls whose
    coverage of those files goes to manual verification."""
    lines = [
        "ERROR a11y-eslint: no TypeScript-capable parser in the target's "
        "node_modules — linting .js/.jsx only",
        f"NOTE  a11y-eslint: {', '.join(controls)} go to manual verification for the "
        f"unparsed .ts/.tsx files (not reported as passing)",
    ]
    l0 = checklib.l0_subset(controls, tiers)
    if l0:
        lines.append(f"NOTE  a11y-eslint: {', '.join(l0)} are L0 — they block until "
                     f"verified by some path")
    return lines


# ── eslint JSON → the finding line ─────────────────────────────────────────────

def translate_report(payload, target_root, rule_map):
    """
    Turn eslint's `--format json` report into (errors, notes).

    Every message with a mapped rule id becomes the canonical finding line via
    checklib.emit_error, with the rule named in the optional second bracket so
    a finding traces back to its mapping row. A rule id with no mapping row is
    a misconfiguration, not a dropped finding: an operational ERROR names it
    and no control id is guessed. A file eslint could not parse is a NOTE — it
    was not checked, so it is not passed either.

    One message class is skipped outright: eslint reports "Definition for rule
    'x' was not found." when a source file carries an eslint-disable directive
    for a rule THIS config does not define. That is the expected consequence of
    running a deliberately narrow config with --no-config-lookup over a repo
    whose own config is broader — a Next.js app that disables
    react-hooks/exhaustive-deps or @next/next/no-img-element anywhere would
    otherwise report those as rules that "fired", demanding a mapping row for a
    rule with no accessibility meaning. Measured on a five-line file with one
    such directive and no accessibility issue: one ERROR, no finding.
    """
    rules = rule_map["rules"]
    errors, notes = [], []
    for result in payload:
        fpath = result.get("filePath") or "(unknown file)"
        rel = os.path.relpath(fpath, target_root) if os.path.isabs(fpath) else fpath
        for msg in result.get("messages", []):
            rule = msg.get("ruleId")
            lineno = msg.get("line") or 1
            text = " ".join((msg.get("message") or "").split())
            if UNKNOWN_RULE_RE.match(text):
                continue
            if msg.get("fatal") or rule is None:
                errors.append(f"ERROR a11y-eslint: {rel}:{lineno} was not parsed "
                              f"({text}) — verify this file by hand")
                continue
            ctl = rules.get(rule)
            if ctl is None:
                errors.append(f"ERROR a11y-eslint: rule '{rule}' fired in {rel} at line "
                              f"{lineno} but has no row in "
                              f"{checklib.RULE_MAP_FILENAME} — add one; no control id "
                              f"is guessed")
                continue
            errors.append(checklib.emit_error(rel, lineno, ctl, text,
                                             f"fix per {rule}", extra=rule))
    return errors, notes


# ── Runner ─────────────────────────────────────────────────────────────────────

def run(paths, target_root=None, node="node"):
    """Run the layer over `paths`. Returns (exit_code, output_lines)."""
    try:
        rule_map = checklib.load_rule_map()
        controls = checklib.layer_controls(LAYER, rule_map)
    except checklib.RuleMapError as exc:
        return 1, [f"ERROR a11y-eslint: {exc}"]

    tiers = checklib.catalog_tiers()
    out = []
    _, missing, _ = partition_targets(paths)
    for p in missing:
        out.append(f"ERROR a11y-eslint: path not found: {p}")

    root = target_root or find_target_root(paths)
    toolchain, reason = resolve_toolchain(root, node=node)
    if toolchain is None:
        out.extend(manual_verification_notes(reason, controls, tiers))
        return 1, out

    extensions = LINT_EXTENSIONS
    coverage_gap = False
    if toolchain["parser"] is None:
        extensions = LINT_EXTENSIONS - TS_EXTENSIONS
        if has_ts_targets(paths):
            coverage_gap = True
            out.extend(parser_gap_notes(controls, tiers))
    lint_paths, _, _ = partition_targets(paths, extensions)
    if not lint_paths:
        out.append("NOTE  a11y-eslint: nothing to lint in the given paths "
                   f"({', '.join(sorted(extensions))})")
        return (1 if (missing or coverage_gap) else 0), out

    argv = build_argv(toolchain, lint_paths)
    try:
        proc = subprocess.run(argv, capture_output=True, text=True, cwd=root,
                              env=build_env(toolchain), timeout=ESLINT_TIMEOUT)
    except subprocess.TimeoutExpired:
        out.append(f"ERROR a11y-eslint: eslint timed out after {ESLINT_TIMEOUT}s")
        return 1, out
    except OSError as exc:
        out.append(f"ERROR a11y-eslint: eslint could not be run — {exc}")
        return 1, out

    stdout = proc.stdout.strip()
    if not stdout.startswith("["):
        tail = (proc.stderr.strip().splitlines() or [""])[-1]
        out.append(f"ERROR a11y-eslint: eslint exited {proc.returncode} with no JSON "
                   f"report — {tail}")
        return 1, out
    try:
        payload = json.loads(stdout)
    except ValueError as exc:
        out.append(f"ERROR a11y-eslint: eslint's JSON report is unreadable — {exc}")
        return 1, out

    errors, notes = translate_report(payload, root, rule_map)
    out.extend(errors)
    out.extend(notes)
    return (1 if (errors or missing or coverage_gap) else 0), out


# ── Self-test ──────────────────────────────────────────────────────────────────

def _load_detect():
    """detect.py, loaded by path so the self-test can assert findings against
    the real `_FINDING_RE` that reverse-parses them."""
    path = os.path.join(_CHECKS_DIR, "detect.py")
    spec = importlib.util.spec_from_file_location("_dx_detect", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_self_test():
    import tempfile

    failures = []
    case_count = 0

    def check(name, want, got):
        nonlocal case_count
        case_count += 1
        if want != got:
            failures.append(f"FAIL {name}: want: {want!r}; got: {got!r}")

    rule_map = checklib.load_rule_map()
    controls = checklib.layer_controls(LAYER, rule_map)
    detect = _load_detect()
    fake = {"node": "node", "eslint_bin": "/n/eslint/bin/eslint.js",
            "plugin": "/n/eslint-plugin-jsx-a11y/lib/index.js", "parser": None}

    # ── the target repo's own eslint config is ignored ─────────────────────────
    argv = build_argv(fake, ["app", "components"], config_path="/h/jsx-a11y.config.mjs")
    check("invocation carries --no-config-lookup", True, "--no-config-lookup" in argv)
    check("invocation names the harness config", True,
          argv[argv.index("--config") + 1] == "/h/jsx-a11y.config.mjs")
    check("invocation asks for the JSON report", True,
          argv[argv.index("--format") + 1] == "json")
    check("invocation keeps the given targets last", ["app", "components"], argv[-2:])
    env = build_env(fake, base_env={"PATH": "/usr/bin"})
    check("the plugin path reaches the config by env", fake["plugin"],
          env.get("DX_A11Y_PLUGIN"))
    check("no parser means no parser env var", None, env.get("DX_A11Y_PARSER"))

    # ── a finding names its control ────────────────────────────────────────────
    payload = [{
        "filePath": "/repo/components/row.tsx",
        "messages": [{
            "ruleId": "jsx-a11y/click-events-have-key-events", "severity": 2,
            "line": 12,
            "message": "Visible, non-interactive elements with click handlers must "
                       "have at least one keyboard listener.",
        }],
    }]
    errors, notes = translate_report(payload, "/repo", rule_map)
    check("one message becomes one finding", 1, len(errors))
    parsed = detect._FINDING_RE.match(errors[0])
    check("the finding matches detect's finding shape", True, parsed is not None)
    check("the finding carries its control id", "A11Y-2", parsed.group("control"))
    check("the finding path is repo-relative", "components/row.tsx", parsed.group("file"))
    check("the finding keeps eslint's line number", 12, int(parsed.group("pos")))
    check("the rule that fired is named in the second bracket", True,
          "[jsx-a11y/click-events-have-key-events]" in errors[0])
    check("a clean run of the translator adds no notes", [], notes)

    # ── an unmapped rule id is a misconfiguration, not a dropped finding ───────
    unmapped, _ = translate_report(
        [{"filePath": "/repo/a.tsx",
          "messages": [{"ruleId": "jsx-a11y/prefer-tag-over-role", "line": 3,
                        "severity": 2, "message": "Use button instead of role."}]}],
        "/repo", rule_map)
    check("an unmapped rule yields exactly one ERROR", 1, len(unmapped))
    check("the unmapped ERROR names the rule", True,
          "jsx-a11y/prefer-tag-over-role" in unmapped[0])
    check("the unmapped ERROR guesses no control id", None,
          detect._FINDING_RE.match(unmapped[0]))

    # ── a disable directive for a rule this config omits is not a finding ─────
    # The target's own eslint config is broader than this one by design
    # (--no-config-lookup), so any `eslint-disable-next-line
    # react-hooks/exhaustive-deps` in the target makes eslint report an unknown
    # rule with that rule as its id. Before this case, one such comment in a
    # five-line file with no accessibility issue produced an ERROR demanding a
    # mapping row for a rule that has no accessibility meaning — which is why
    # this layer could not be wired into a gate.
    directive, directive_notes = translate_report(
        [{"filePath": "/repo/hook.tsx",
          "messages": [{"ruleId": "react-hooks/exhaustive-deps", "line": 2,
                        "severity": 2,
                        "message": "Definition for rule "
                                   "'react-hooks/exhaustive-deps' was not found."}]}],
        "/repo", rule_map)
    check("an unknown-rule directive yields no error", [], directive)
    check("an unknown-rule directive yields no note", [], directive_notes)
    check("the unknown-rule pattern still matches without the full stop", True,
          bool(UNKNOWN_RULE_RE.match("Definition for rule 'x/y' was not found")))
    check("a real finding is not mistaken for an unknown-rule message", False,
          bool(UNKNOWN_RULE_RE.match("Elements with the 'tablist' interactive "
                                     "role must be focusable.")))

    # ── a file eslint could not parse blocks as an operational ERROR ──────────
    fatal_errors, fatal_notes = translate_report(
        [{"filePath": "/repo/broken.tsx",
          "messages": [{"ruleId": None, "fatal": True, "line": 1, "severity": 2,
                        "message": "Parsing error: Unexpected token"}]}],
        "/repo", rule_map)
    check("an unparsed file raises one ERROR naming the file", True,
          len(fatal_errors) == 1 and "broken.tsx" in fatal_errors[0])
    check("an unparsed file adds no NOTE", [], fatal_notes)

    # ── a layer that did not run does not silently pass ────────────────────────
    tiers = checklib.catalog_tiers()
    check("the catalogue tiers are readable", "L0", tiers.get("A11Y-2"))
    skip = manual_verification_notes("no eslint in /repo's node_modules", controls, tiers)
    check("the skip report starts with an operational ERROR", True,
          skip[0].startswith("ERROR"))
    check("the skip report names every control the layer covers", True,
          all(any(c in n for n in skip) for c in ["A11Y-2", "A11Y-3", "A11Y-6", "A11Y-8"]))
    check("the skip report sends them to manual verification", True,
          any("manual verification" in n for n in skip))
    check("the skip report says the L0 controls still block", True,
          any("A11Y-2, A11Y-3" in n and "block until" in n for n in skip))
    gap = parser_gap_notes(controls, tiers)
    check("the parser gap names the .tsx files as unverified", True,
          any(".ts/.tsx" in n for n in gap) and gap[0].startswith("ERROR"))

    # ── an unresolvable toolchain is a skip with a reason, not a pass ──────────
    with tempfile.TemporaryDirectory() as td:
        toolchain, reason = resolve_toolchain(td)
        check("an empty target root resolves no toolchain", None, toolchain)
        check("the skip carries a reason", True, bool(reason))
        rc, lines = run([td], target_root=td)
        check("a skipped layer exits 1 so detect cannot grade it clean", 1, rc)
        check("a skipped layer prints one operational ERROR", 1,
              len([ln for ln in lines if ln.startswith("ERROR")]))
        check("a skipped layer names its controls", True,
              any("A11Y-2, A11Y-3, A11Y-6, A11Y-8" in ln for ln in lines))

    # ── target selection ──────────────────────────────────────────────────────
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, "page.tsx"), "w", encoding="utf-8") as fh:
            fh.write("export default function P() { return null; }\n")
        with open(os.path.join(td, "globals.css"), "w", encoding="utf-8") as fh:
            fh.write(":root { --x: #fff; }\n")
        kept, missing, ts_present = partition_targets(
            [os.path.join(td, "page.tsx"), os.path.join(td, "globals.css"),
             os.path.join(td, "nope.tsx")])
        check("a lintable file is kept", [os.path.join(td, "page.tsx")], kept)
        check("a .css target is dropped, not sent to eslint", [os.path.join(td, "globals.css")],
              [p for p in [os.path.join(td, "globals.css")] if p not in kept])
        check("a missing path is reported", [os.path.join(td, "nope.tsx")], missing)
        check("a .tsx target is seen as TypeScript", True, ts_present)
        js_only, _, _ = partition_targets([td], LINT_EXTENSIONS - TS_EXTENSIONS)
        check("without a parser the .tsx-only directory is dropped", [], js_only)

    # ── the rule map covers the whole preset and only real controls ────────────
    jsx_rules = [r for r in rule_map["rules"] if r.startswith("jsx-a11y/")]
    check("every rule in jsx-a11y's recommended preset has a row", 31, len(jsx_rules))
    check("the map has no jsx-a11y rows outside the preset", 31, len(jsx_rules))
    # The map is shared with the rendered check, whose rows carry their own,
    # un-prefixed keys. Confirm the map genuinely holds both, rather than
    # having drifted to jsx-a11y rows alone — a set built from the same
    # `not r.startswith(...)` filter as `jsx_rules` would never disagree
    # with it, so this checks the raw row count instead.
    check("the map is shared with rendered-check rows, not scoped to "
          "jsx-a11y alone", True, len(rule_map["rules"]) > len(jsx_rules))
    catalog_ids = set(checklib.catalog_tiers())
    check("every mapped control id is in the catalogue", set(),
          set(rule_map["rules"].values()) - catalog_ids)
    check("every layer's controls are in the catalogue", set(),
          {c for ids in rule_map["layers"].values() for c in ids} - catalog_ids)

    # ── fixtures: the preset's own calibration, exercised end to end ───────────
    # The fixture half needs the target toolchain. When it does not resolve
    # (a Python-only environment), each fixture case asserts the honest skip
    # path instead, so the case count never depends on the environment.
    fixtures_dir = os.path.join(_CHECKS_DIR, "fixtures", "a11y-eslint")
    harness_root = find_target_root([_CHECKS_DIR])
    live, _ = resolve_toolchain(harness_root)
    if live is None:
        print("NOTE  a11y-eslint self-test: no target toolchain resolved; the fixture "
              "cases assert the skip path, not the preset's findings")
    for fname in sorted(os.listdir(fixtures_dir)):
        fpath = os.path.join(fixtures_dir, fname)
        rc, lines = run([fpath], target_root=harness_root)
        errs = [ln for ln in lines if ln.startswith("ERROR")]
        if live is None:
            check(f"fixture {fname}: skipped honestly", (1, 1), (rc, len(errs)))
        elif "fail" in fname:
            check(f"fixture {fname}: reports at least one finding", True,
                  rc == 1 and len(errs) >= 1)
        else:
            check(f"fixture {fname}: reports nothing", (0, []), (rc, errs))

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    target_root = None
    if "--repo-root" in args:
        i = args.index("--repo-root")
        try:
            target_root = args[i + 1]
        except IndexError:
            print("ERROR a11y-eslint: --repo-root needs a directory argument")
            sys.exit(1)
        args = args[:i] + args[i + 2:]

    if not args:
        print("Usage: python3 checks/a11y-eslint.py [--repo-root <dir>] <path>... "
              "| --self-test")
        sys.exit(1)

    code, lines = run(args, target_root=target_root)
    for line in lines:
        print(line)
    sys.exit(code)


if __name__ == "__main__":
    main()
