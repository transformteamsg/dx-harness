#!/usr/bin/env python3
"""
detect.py — one unified entry over the harness's deterministic check scripts.

A façade, not a new checker: it invokes the existing `checks/*.py` scripts (whose
rules it never changes), maps their exit codes onto one contract, and adds a
config-based ignore layer for team intent. The shape mirrors Impeccable's detector —
path/file targets, `--json`, exit codes, and a config ignore layer — the shape that
makes checks actually get run ("fast signal without asking an AI").

Profiles
────────
- default = the curated, low-false-positive subset: token-audit, contrast,
  a11y-static, and type-scan's TYP-1 rule only. The noisier rules (TYP-2 size
  floor, etc.) stay recording-only.
- `--all` = every page-check script: the curated set with type-scan's full rule set
  plus content-lint and (when a manifest exists) component-manifest.

Config ignores (`.tfx/config.json` at the target repo root)
───────────────────────────────────────────────────────────
    {"detector": {"ignoreFiles": [globs], "ignoreValues": [strings], "ignoreRules": [ids]}}
- ignoreFiles — glob-filters the scanned targets (a legacy folder).
- ignoreValues — fed to token-audit's `--allow` mechanism (a sanctioned raw value).
- ignoreRules — drops whole control ids from the run.
`--no-config` bypasses the file entirely.

Config ignores COMPLEMENT tier waivers, they never replace them: a waiver is a
per-instance control exception with a named approver; a config ignore is scan-noise
control (a legacy folder, a sanctioned raw value). Neither silences an L0.

Exit contract (Impeccable-adopted): 0 clean · 2 findings · 1 tool failure /
invalid config. This differs from the per-script 0/1: a wrapped script's exit 1
(violations) maps to detect's exit 2; detect reserves 1 for a crashed script or a
misconfiguration.

Honest enforcement: detect covers only the built checks; it never reports an unbuilt
control as passed. Per-script coverage lives in checks/README.md.

Usage
─────
    python3 checks/detect.py [<path>...]         # curated profile (default .)
    python3 checks/detect.py --all <path>...     # every page-check script
    python3 checks/detect.py --json <path>...    # machine-readable findings
    python3 checks/detect.py --no-config <path>  # ignore .tfx/config.json
    python3 checks/detect.py --tokens app/globals.css <path>   # contrast token map
    python3 checks/detect.py --self-test
"""

import argparse
import fnmatch
import json
import os
import re
import subprocess
import sys

CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))
HARNESS_ROOT = os.path.dirname(CHECKS_DIR)
GENERATOR = os.path.join(HARNESS_ROOT, "scripts", "generate-design-json.py")

# Exit contract (Impeccable-adopted).
EXIT_CLEAN = 0
EXIT_FINDINGS = 2
EXIT_FAILURE = 1

# The per-subprocess timeout (a hung script is a tool failure, not a silent pass).
CHECK_TIMEOUT = 180

# Directories never scanned during ignoreFiles expansion (mirrors the check
# scripts' own recursion, which skips vendor and build output).
PRUNE_DIRS = {"node_modules", "dist", "build", "out", "coverage", "vendor", "__pycache__"}

# Union of every wrapped check's TARGET_EXTENSIONS (content-lint adds .md/.mdx).
SCAN_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue",
                   ".svelte", ".md", ".mdx"}

# <!-- tfx-sync:L0 source=catalog -->
L0_CONTROL_IDS = frozenset({"A11Y-1", "A11Y-2", "A11Y-3", "CMP-2"})
# <!-- /tfx-sync:L0 -->

# ERROR-line convention (checks/README.md):
#   ERROR <file>:<line> [<CTL>] <message>
#   ERROR <file>:<line> [<CTL>][waiver-claimed] <message>   (token-audit)
# contrast's `ERROR <file>:<line> [A11Y-1] text …` line matches too. Operational
# ERRORs (path-not-found, unreadable file, --tokens usage) have no <file>:<line>[CTL]
# shape and are kept as control-less findings — never dropped, never a silent pass.
_FINDING_RE = re.compile(
    r"^ERROR\s+(?P<file>.+?):(?P<line>\d+)\s+"
    r"\[(?P<control>[A-Z0-9-]+)\](?:\[[^\]]*\])?\s+(?P<message>.*)$"
)

TRACEBACK_MARKER = "Traceback (most recent call last)"


class ConfigError(Exception):
    """Raised for a malformed `.tfx/config.json` — a misconfiguration (exit 1)."""


# ── Config ───────────────────────────────────────────────────────────────────────

def load_config(repo_root, no_config=False):
    """Read `<repo_root>/.tfx/config.json`'s `detector` block. Returns a dict with
    ignoreFiles / ignoreValues / ignoreRules (each a list of strings). Missing file
    → empty ignores. `--no-config` → empty ignores. Malformed file → ConfigError."""
    empty = {"ignoreFiles": [], "ignoreValues": [], "ignoreRules": []}
    if no_config:
        return dict(empty)
    path = os.path.join(repo_root, ".tfx", "config.json")
    if not os.path.isfile(path):
        return dict(empty)
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (ValueError, OSError) as exc:
        raise ConfigError(f"invalid .tfx/config.json: {exc}")
    if not isinstance(data, dict):
        raise ConfigError(".tfx/config.json must be a JSON object")
    det = data.get("detector", {})
    if not isinstance(det, dict):
        raise ConfigError('.tfx/config.json "detector" must be an object')
    out = dict(empty)
    for key in ("ignoreFiles", "ignoreValues", "ignoreRules"):
        val = det.get(key, [])
        if val is None:
            val = []
        if not isinstance(val, list) or not all(isinstance(x, str) for x in val):
            raise ConfigError(f".tfx/config.json detector.{key} must be a list of strings")
        out[key] = val
    return out


# ── Targets ────────────────────────────────────────────────────────────────────

def find_repo_root(target):
    """Walk up from `target` to the nearest dir holding `.git` or `.tfx`; fall back
    to the target dir (or its parent for a file), then cwd."""
    p = os.path.abspath(target)
    if os.path.isfile(p):
        p = os.path.dirname(p)
    cur = p
    while True:
        if os.path.isdir(os.path.join(cur, ".git")) or os.path.isfile(os.path.join(cur, ".git")) \
                or os.path.isdir(os.path.join(cur, ".tfx")):
            return cur
        parent = os.path.dirname(cur)
        if parent == cur:
            break
        cur = parent
    return p if os.path.isdir(p) else os.getcwd()


def is_ignored(path, globs, repo_root):
    """True if `path` matches any ignore glob (matched against its repo-relative
    path and its basename). fnmatch's `*` spans `/`, so `legacy/*` and `*.min.css`
    both work."""
    if not globs:
        return False
    ap = os.path.abspath(path)
    try:
        rel = os.path.relpath(ap, repo_root)
    except ValueError:
        rel = path
    base = os.path.basename(path)
    for g in globs:
        if fnmatch.fnmatch(rel, g) or fnmatch.fnmatch(base, g) or fnmatch.fnmatch(path, g):
            return True
    return False


def expand_targets(paths, ignore_globs, repo_root):
    """Expand dir targets into a flat file list and drop ignoreFiles matches. Only
    called when ignoreFiles is set — otherwise the raw targets are passed straight
    through (each script recurses itself).

    Directory targets are walked with PRUNE_DIRS (vendor/build dirs) and dot-dirs
    pruned, and only files whose extension is in SCAN_EXTENSIONS are kept — this
    keeps the expanded argv well under ARG_MAX on real repos. Explicit file targets
    (the os.path.isfile branch) pass through unfiltered: a user who names a file
    gets it scanned regardless of extension."""
    files = []
    for p in paths:
        if os.path.isfile(p):
            files.append(p)
        elif os.path.isdir(p):
            for root, dirs, fnames in os.walk(p):
                dirs[:] = [d for d in dirs
                           if not d.startswith(".") and d not in PRUNE_DIRS]
                for fn in sorted(fnames):
                    if os.path.splitext(fn)[1].lower() in SCAN_EXTENSIONS:
                        files.append(os.path.join(root, fn))
        else:
            files.append(p)  # let the script report the missing path
    return [f for f in files if not is_ignored(f, ignore_globs, repo_root)]


# ── Profile / check selection ─────────────────────────────────────────────────

def build_check_specs(all_profile, allow_values=None, tokens_file=None):
    """Return the ordered list of check specs for the chosen profile. Each spec:
    {"name", "args" (script + flags, before targets), "mode"}. mode "targets"
    appends the scanned targets; mode "manifest" runs against `.tfx/component-
    manifest.json`."""
    allow = list(allow_values or [])
    specs = []

    ta = ["token-audit.py"]
    if allow:
        ta += ["--allow", ",".join(allow)]
    specs.append({"name": "token-audit", "args": ta, "mode": "targets"})

    co = ["contrast.py"]
    if tokens_file:
        co += ["--tokens", tokens_file]
    specs.append({"name": "contrast", "args": co, "mode": "targets"})

    specs.append({"name": "a11y-static", "args": ["a11y-static.py"], "mode": "targets"})

    if all_profile:
        # Full rule set — TYP-2 (and the rest) run.
        specs.append({"name": "type-scan", "args": ["type-scan.py"], "mode": "targets"})
        specs.append({"name": "content-lint", "args": ["content-lint.py"], "mode": "targets"})
        specs.append({"name": "component-manifest",
                      "args": ["component-manifest.py"], "mode": "manifest"})
    else:
        # Curated: TYP-1 only — TYP-2 and the noisier rules stay recording-only.
        specs.append({"name": "type-scan",
                      "args": ["type-scan.py", "--rules", "TYP-1"], "mode": "targets"})

    return specs


# ── Subprocess classification + parsing ─────────────────────────────────────────

def classify_run(returncode, stdout, stderr):
    """Map a wrapped script's outcome to ('clean'|'findings'|'crash', error_lines).

    - traceback on stderr, or any exit code outside {0,1} → crash (detect exit 1).
    - exit 0 → clean.
    - exit 1 with ERROR lines → findings (detect exit 2).
    - exit 1 with NO ERROR lines and no traceback → crash: fail loud, never a
      silent pass (a script exits 1 only on ERROR by convention, so this is
      anomalous)."""
    if stderr and TRACEBACK_MARKER in stderr:
        return ("crash", [])
    if returncode == 0:
        return ("clean", [])
    if returncode == 1:
        errs = [ln for ln in stdout.splitlines() if ln.startswith("ERROR")]
        if not errs:
            return ("crash", [])
        return ("findings", errs)
    return ("crash", [])


def parse_findings(check_name, error_lines):
    """Parse ERROR lines into structured findings. A line matching the
    `<file>:<line> [CTL]` convention yields a control finding; any other ERROR line
    (operational) is kept as a control-less finding — never dropped."""
    out = []
    for ln in error_lines:
        m = _FINDING_RE.match(ln)
        if m:
            out.append({
                "check": check_name,
                "control": m.group("control"),
                "file": m.group("file"),
                "line": int(m.group("line")),
                "message": m.group("message").strip(),
            })
        else:
            msg = ln[len("ERROR"):].strip() if ln.startswith("ERROR") else ln.strip()
            out.append({
                "check": check_name,
                "control": None,
                "file": None,
                "line": None,
                "message": msg,
            })
    return out


def effective_ignore_rules(ignore_rules):
    """Return configured rules that may be ignored; catalog L0 controls never may."""
    return set(ignore_rules) - L0_CONTROL_IDS


def apply_ignore_rules(findings, ignore_rules):
    """Drop non-L0 findings named in ignoreRules. Control-less (operational)
    findings are never dropped — an operational error is not a rule."""
    ig = effective_ignore_rules(ignore_rules)
    return [f for f in findings if f["control"] not in ig]


def compute_exit(findings, crashed):
    """0 clean · 2 findings · 1 tool failure. A crash wins over findings."""
    if crashed:
        return EXIT_FAILURE
    if findings:
        return EXIT_FINDINGS
    return EXIT_CLEAN


# ── Runner ─────────────────────────────────────────────────────────────────────

def _run_subprocess(argv):
    try:
        proc = subprocess.run(argv, capture_output=True, text=True, timeout=CHECK_TIMEOUT)
        return proc.returncode, proc.stdout, proc.stderr
    except subprocess.TimeoutExpired:
        return 1, "", f"{TRACEBACK_MARKER}\nTimeoutExpired after {CHECK_TIMEOUT}s"
    except OSError as exc:
        return 1, "", f"{TRACEBACK_MARKER}\n{exc}"


def run_checks(specs, targets, ignore_rules, repo_root):
    """Run each spec, classify, parse, filter. Returns (results, findings, crashed)."""
    results = []
    all_findings = []
    crashed = []
    for spec in specs:
        name = spec["name"]
        if spec["mode"] == "manifest":
            manifest = os.path.join(repo_root, ".tfx", "component-manifest.json")
            if not os.path.isfile(manifest):
                results.append({"name": name, "kind": "skipped",
                                "reason": "no .tfx/component-manifest.json",
                                "error_lines": [], "note_lines": [], "findings": []})
                continue
            argv = [sys.executable, os.path.join(CHECKS_DIR, spec["args"][0]),
                    manifest, repo_root]
        else:
            script = os.path.join(CHECKS_DIR, spec["args"][0])
            argv = [sys.executable, script] + spec["args"][1:] + list(targets)

        rc, out, err = _run_subprocess(argv)
        kind, error_lines = classify_run(rc, out, err)
        note_lines = [ln for ln in out.splitlines() if ln.startswith("NOTE")]

        if kind == "crash":
            crashed.append((name, (err or out).strip().splitlines()[-1] if (err or out).strip() else f"exit {rc}"))
            results.append({"name": name, "kind": "crash", "reason": f"exit {rc}",
                            "error_lines": error_lines, "note_lines": note_lines,
                            "findings": [], "stderr": err})
            continue

        findings = apply_ignore_rules(parse_findings(name, error_lines), ignore_rules)
        all_findings.extend(findings)
        results.append({"name": name, "kind": kind, "error_lines": error_lines,
                        "note_lines": note_lines, "findings": findings})
    return results, all_findings, crashed


def run_generator_check(repo_root, findings, results):
    """If `.tfx/design.json` exists and the 058 generator is present, run it in
    `--check` mode. Staleness (exit 2) is a finding, never a crash."""
    design_json = os.path.join(repo_root, ".tfx", "design.json")
    if not os.path.isfile(design_json) or not os.path.isfile(GENERATOR):
        return
    rc, out, _err = _run_subprocess([sys.executable, GENERATOR, repo_root, "--check"])
    msg = out.strip().splitlines()[0] if out.strip() else f"generator exit {rc}"
    if rc == 2:
        f = {"check": "design-json", "control": None,
             "file": os.path.relpath(design_json, repo_root), "line": None,
             "message": msg}
        findings.append(f)
        results.append({"name": "design-json", "kind": "findings",
                        "error_lines": [f"ERROR {msg}"], "note_lines": [], "findings": [f]})
    elif rc == 0:
        results.append({"name": "design-json", "kind": "clean",
                        "error_lines": [], "note_lines": [], "findings": []})
    else:
        # No DESIGN.md or an unexpected code: surface as a note, never a crash.
        results.append({"name": "design-json", "kind": "clean",
                        "error_lines": [], "note_lines": [f"NOTE  design-json: {msg}"],
                        "findings": []})


# ── Output ───────────────────────────────────────────────────────────────────────

def build_json_report(findings, results, crashed, profile, exit_code):
    by_control = {}
    by_check = {}
    for f in findings:
        c = f["control"] or "(operational)"
        by_control[c] = by_control.get(c, 0) + 1
        by_check[f["check"]] = by_check.get(f["check"], 0) + 1
    return {
        "findings": findings,
        "counts": {
            "total": len(findings),
            "by_control": by_control,
            "by_check": by_check,
            "checks_run": [r["name"] for r in results if r["kind"] != "skipped"],
            "checks_skipped": [r["name"] for r in results if r["kind"] == "skipped"],
            "crashed": [name for name, _ in crashed],
        },
        "profile": profile,
        "exit": exit_code,
    }


def print_text_report(findings, results, crashed, ignore_rules):
    ig = effective_ignore_rules(ignore_rules)
    for r in results:
        if r["kind"] == "skipped":
            print(f"── {r['name']}: skipped ({r['reason']}) ──")
            continue
        shown = []
        for ln in r["error_lines"]:
            m = _FINDING_RE.match(ln)
            if m and m.group("control") in ig:
                continue  # dropped by ignoreRules
            shown.append(ln)
        if shown or r["note_lines"] or r["kind"] == "crash":
            print(f"── {r['name']} ──")
            for ln in shown:
                print(ln)
            for ln in r["note_lines"]:
                print(ln)
            if r["kind"] == "crash":
                tail = (r.get("stderr") or "").strip().splitlines()
                print(f"CRASH {r['name']}: {tail[-1] if tail else r.get('reason', '')}")
    n_run = len([r for r in results if r["kind"] != "skipped"])
    if crashed:
        print(f"detect: {len(crashed)} check(s) crashed — {', '.join(n for n, _ in crashed)} "
              f"(exit 1). {len(findings)} finding(s) collected before the failure.")
    elif findings:
        print(f"detect: {len(findings)} finding(s) across {n_run} check(s) (exit 2).")
    else:
        print(f"detect: clean — {n_run} check(s), no findings (exit 0).")


# ── Entry ──────────────────────────────────────────────────────────────────────

def find_tokens_file(explicit, repo_root):
    if explicit:
        return explicit
    for cand in (os.path.join(repo_root, "app", "globals.css"),
                 os.path.join(repo_root, "globals.css")):
        if os.path.isfile(cand):
            return cand
    return None


def run(argv):
    parser = argparse.ArgumentParser(
        prog="detect.py", add_help=True,
        description="Unified detector over the harness's deterministic checks.")
    parser.add_argument("targets", nargs="*", default=["."],
                        help="files/dirs to scan (default: .)")
    parser.add_argument("--all", action="store_true",
                        help="run every page-check script (not just the curated subset)")
    parser.add_argument("--json", action="store_true", help="emit JSON on stdout")
    parser.add_argument("--no-config", action="store_true",
                        help="ignore .tfx/config.json")
    parser.add_argument("--tokens", metavar="CSS",
                        help="token CSS file for contrast (default: auto-discover app/globals.css)")
    args = parser.parse_args(argv)

    targets = args.targets or ["."]
    repo_root = find_repo_root(targets[0])

    try:
        config = load_config(repo_root, no_config=args.no_config)
    except ConfigError as exc:
        # Invalid config is a misconfiguration → exit 1.
        if args.json:
            print(json.dumps({"findings": [], "counts": {"total": 0},
                              "error": str(exc), "exit": EXIT_FAILURE}, indent=2))
        else:
            print(f"ERROR detect: {exc}")
        return EXIT_FAILURE

    ignore_files = config["ignoreFiles"]
    ignore_values = config["ignoreValues"]
    ignore_rules = config["ignoreRules"]

    # Only expand + filter targets when ignoreFiles is set; else pass raw targets.
    scan_targets = expand_targets(targets, ignore_files, repo_root) if ignore_files else list(targets)

    tokens_file = find_tokens_file(args.tokens, repo_root)
    specs = build_check_specs(args.all, allow_values=ignore_values, tokens_file=tokens_file)

    results, findings, crashed = run_checks(specs, scan_targets, ignore_rules, repo_root)
    run_generator_check(repo_root, findings, results)

    exit_code = compute_exit(findings, crashed)

    if args.json:
        print(json.dumps(build_json_report(findings, results, crashed,
                                           "all" if args.all else "curated", exit_code),
                         indent=2, ensure_ascii=False))
    else:
        print_text_report(findings, results, crashed, ignore_rules)
    return exit_code


def main():
    argv = sys.argv[1:]
    if "--self-test" in argv:
        sys.exit(run_self_test())
    sys.exit(run(argv))


# ── Self-test (pure — no real check subprocesses) ────────────────────────────────

def run_self_test():
    import contextlib
    import io
    import tempfile

    failures = []
    n = 0

    def check(name, cond):
        nonlocal n
        n += 1
        if not cond:
            failures.append(f"FAIL {name}")

    # 1. Profile selection — curated set + membership.
    curated = build_check_specs(False)
    names_c = [s["name"] for s in curated]
    check("curated has the four low-FP checks",
          {"token-audit", "contrast", "a11y-static", "type-scan"} <= set(names_c))
    check("curated excludes content-lint / component-manifest",
          "content-lint" not in names_c and "component-manifest" not in names_c)

    # 2. type-scan curated runs TYP-1 only (TYP-2 excluded).
    ts_c = next(s for s in curated if s["name"] == "type-scan")
    check("curated type-scan restricts to TYP-1",
          "--rules" in ts_c["args"] and "TYP-1" in ts_c["args"])

    # 3. --all includes content-lint + component-manifest and full type-scan.
    allp = build_check_specs(True)
    names_a = [s["name"] for s in allp]
    check("--all adds content-lint + component-manifest",
          "content-lint" in names_a and "component-manifest" in names_a)
    ts_a = next(s for s in allp if s["name"] == "type-scan")
    check("--all type-scan is unrestricted (TYP-2 runs)", "--rules" not in ts_a["args"])

    # 4. ignoreValues feeds token-audit --allow.
    with_allow = build_check_specs(False, allow_values=["amber-11", "sky-9"])
    ta = next(s for s in with_allow if s["name"] == "token-audit")
    check("ignoreValues -> token-audit --allow",
          "--allow" in ta["args"] and "amber-11,sky-9" in ta["args"])

    # 5. Exit-code mapping.
    check("exit clean", compute_exit([], []) == EXIT_CLEAN == 0)
    check("exit findings", compute_exit([{"control": "TOK-1"}], []) == EXIT_FINDINGS == 2)
    check("exit crash wins over findings",
          compute_exit([{"control": "TOK-1"}], [("token-audit", "boom")]) == EXIT_FAILURE == 1)

    # 6. classify_run — the script exit → kind mapping.
    check("classify exit 0 -> clean", classify_run(0, "", "")[0] == "clean")
    fk, lines = classify_run(1, "ERROR a.tsx:3 [TOK-1] raw hex — suggest: token\n", "")
    check("classify exit 1 + ERROR -> findings", fk == "findings" and len(lines) == 1)
    check("classify traceback -> crash",
          classify_run(1, "", "Traceback (most recent call last)\nValueError")[0] == "crash")
    check("classify exit 2 -> crash", classify_run(2, "boom", "")[0] == "crash")
    check("classify exit 1 no-ERROR -> crash (fail loud)",
          classify_run(1, "NOTE something\n", "")[0] == "crash")

    # 7. ERROR-line parsing — all wrapped formats.
    p1 = parse_findings("token-audit", ["ERROR app/x.tsx:12 [TOK-1] raw hex '#fff' — suggest: use a token"])
    check("parse standard finding",
          p1[0]["control"] == "TOK-1" and p1[0]["file"] == "app/x.tsx" and p1[0]["line"] == 12)
    p2 = parse_findings("token-audit", ["ERROR a.css:4 [TOK-1][waiver-claimed] raw hex — verify approver"])
    check("parse waiver-claimed variant", p2[0]["control"] == "TOK-1" and p2[0]["line"] == 4)
    p3 = parse_findings("contrast", ["ERROR b.html:9 [A11Y-1] text #777 on #fff = 3.9:1 (large only) — suggest: darken"])
    check("parse contrast A11Y-1", p3[0]["control"] == "A11Y-1" and p3[0]["line"] == 9)
    p4 = parse_findings("token-audit", ["ERROR token-audit: path not found: nope/"])
    check("parse operational ERROR (control-less, kept)",
          p4[0]["control"] is None and "path not found" in p4[0]["message"])

    # 8. NOTE is not an ERROR/finding (classify keeps exit clean, not findings).
    check("NOTE-only stdout on exit 0 is clean",
          classify_run(0, "NOTE  contrast: could not resolve … — verify manually\n", "")[0] == "clean")

    # 9. ignoreRules drops L1/L2 findings only; L0 and operational findings remain.
    fs = [{"check": "a", "control": "A11Y-2", "file": "x", "line": 1, "message": "m"},
          {"check": "a", "control": "CMP-2", "file": "y", "line": 2, "message": "m"},
          {"check": "a", "control": "TYP-2", "file": "z", "line": 3, "message": "m"},
          {"check": "a", "control": None, "file": None, "line": None, "message": "op"}]
    ignored = ["TYP-2", "A11Y-2", "CMP-2"]
    kept = apply_ignore_rules(fs, ignored)
    check("ignoreRules drops L1 TYP-2", not any(f["control"] == "TYP-2" for f in kept))
    check("ignoreRules keeps L0 A11Y-2", any(f["control"] == "A11Y-2" for f in kept))
    check("ignoreRules keeps L0 CMP-2", any(f["control"] == "CMP-2" for f in kept))
    check("ignoreRules never drops operational", any(f["control"] is None for f in kept))
    check("effective ignores exclude every L0 control",
          not (effective_ignore_rules(list(L0_CONTROL_IDS) + ["TYP-2"]) & L0_CONTROL_IDS))

    text_results = [{
        "name": "a11y-static",
        "kind": "findings",
        "error_lines": [
            "ERROR app/x.tsx:1 [A11Y-2] focus state missing",
            "ERROR app/x.tsx:2 [TYP-2] text size too small",
        ],
        "note_lines": [],
        "findings": kept,
    }]
    text_output = io.StringIO()
    with contextlib.redirect_stdout(text_output):
        print_text_report(kept, text_results, [], ["A11Y-2", "TYP-2"])
    rendered = text_output.getvalue()
    check("text report keeps ignored L0 A11Y-2 and hides L1 TYP-2",
          "[A11Y-2]" in rendered and "[TYP-2]" not in rendered)

    # 10. ignoreFiles glob filtering.
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, "legacy"))
        os.makedirs(os.path.join(td, "app"))
        keep_f = os.path.join(td, "app", "page.tsx")
        drop_f = os.path.join(td, "legacy", "old.css")
        open(keep_f, "w").close()
        open(drop_f, "w").close()
        got = expand_targets([td], ["legacy/*"], td)
        rels = {os.path.relpath(f, td) for f in got}
        check("ignoreFiles drops legacy/*", "legacy/old.css" not in rels)
        check("ignoreFiles keeps app/page.tsx", "app/page.tsx" in rels)
        got2 = expand_targets([td], ["*.css"], td)
        rels2 = {os.path.relpath(f, td) for f in got2}
        check("ignoreFiles *.css glob drops the css", "legacy/old.css" not in rels2)

    # 10b. Vendor dirs (PRUNE_DIRS) are never walked even for scan extensions.
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, "node_modules", "pkg"))
        os.makedirs(os.path.join(td, "src"))
        open(os.path.join(td, "node_modules", "pkg", "index.js"), "w").close()
        open(os.path.join(td, "src", "page.tsx"), "w").close()
        got = expand_targets([td], ["legacy/*"], td)
        rels = {os.path.relpath(f, td) for f in got}
        check("prune keeps src/page.tsx", "src/page.tsx" in rels)
        check("prune drops node_modules .js",
              not any(r.startswith("node_modules") for r in rels))

    # 10c. Non-scan extensions are filtered out of dir expansion.
    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, "src"))
        open(os.path.join(td, "src", "notes.txt"), "w").close()
        open(os.path.join(td, "src", "page.tsx"), "w").close()
        got = expand_targets([td], ["legacy/*"], td)
        rels = {os.path.relpath(f, td) for f in got}
        check("extension filter keeps src/page.tsx", "src/page.tsx" in rels)
        check("extension filter drops src/notes.txt", "src/notes.txt" not in rels)

    # 10d. An explicit file target survives regardless of extension (isfile branch).
    with tempfile.TemporaryDirectory() as td:
        weird = os.path.join(td, "weird.xyz")
        open(weird, "w").close()
        got = expand_targets([weird], ["legacy/*"], td)
        check("explicit non-scan file target survives expansion", weird in got)

    # 11. Config loading.
    with tempfile.TemporaryDirectory() as td:
        check("no config file -> empty ignores", load_config(td) == {
            "ignoreFiles": [], "ignoreValues": [], "ignoreRules": []})
        os.makedirs(os.path.join(td, ".tfx"))
        cfg = os.path.join(td, ".tfx", "config.json")
        with open(cfg, "w", encoding="utf-8") as fh:
            json.dump({"detector": {"ignoreFiles": ["legacy/*"], "ignoreRules": ["TYP-2"]}}, fh)
        loaded = load_config(td)
        check("valid config parsed", loaded["ignoreFiles"] == ["legacy/*"] and loaded["ignoreRules"] == ["TYP-2"])
        check("--no-config bypasses a present config",
              load_config(td, no_config=True) == {"ignoreFiles": [], "ignoreValues": [], "ignoreRules": []})
        # invalid JSON -> ConfigError
        with open(cfg, "w", encoding="utf-8") as fh:
            fh.write("{ not json")
        raised = False
        try:
            load_config(td)
        except ConfigError:
            raised = True
        check("invalid JSON -> ConfigError (exit 1)", raised)
        # wrong-typed field -> ConfigError
        with open(cfg, "w", encoding="utf-8") as fh:
            json.dump({"detector": {"ignoreFiles": "not-a-list"}}, fh)
        raised2 = False
        try:
            load_config(td)
        except ConfigError:
            raised2 = True
        check("wrong-typed ignoreFiles -> ConfigError", raised2)

    # 12. JSON report shape — findings keys + counts.
    findings = [{"check": "a11y-static", "control": "A11Y-2", "file": "x.html",
                 "line": 3, "message": "focus removed"}]
    results = [{"name": "a11y-static", "kind": "findings"},
               {"name": "component-manifest", "kind": "skipped"}]
    report = build_json_report(findings, results, [], "curated", EXIT_FINDINGS)
    parsed = json.loads(json.dumps(report))  # must be JSON-serialisable
    check("json has findings + counts", "findings" in parsed and "counts" in parsed)
    check("json finding has the 5 keys",
          set(parsed["findings"][0]) == {"check", "control", "file", "line", "message"})
    check("json counts total", parsed["counts"]["total"] == 1)
    check("json counts by_control", parsed["counts"]["by_control"].get("A11Y-2") == 1)
    check("json records skipped check", "component-manifest" in parsed["counts"]["checks_skipped"])

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {n} cases run)")
        return 1
    print(f"SELF-TEST OK ({n} cases)")
    return 0


if __name__ == "__main__":
    main()
