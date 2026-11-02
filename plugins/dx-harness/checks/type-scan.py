#!/usr/bin/env python3
"""
Type scan — checks/type-scan.py
Scans UI source files for the statically-resolvable subset of TYP-1 and TYP-3,
the typeface and type-scale controls that stay with the placeholder catalogue.
The generic typography controls are design-lint rules (see
standards/rules/typ/).

Detection rules (line-local only)
──────────────────────────────────
Rule        Control   What is caught
FONT        TYP-1     A CSS `font-family:` or a Tailwind `font-[…]` arbitrary
            (L1)      value naming a typeface other than Plus Jakarta Sans or
                      Inter. The token names font-display / font-body /
                      font-sans / --font-display / --font-body are allowed.
ONSCALE     TYP-3     A `text-[Npx]`/`text-[Nrem]` or `font-size:Npx`/`Nrem`
            (L1)      whose size (rem converted at ×16) is not on the Tailwind
                      default type scale {128,96,72,60,48,36,30,24,20,18,16,14,12}.
                      A fractional-pixel size is off-scale by definition, even if
                      its rounded value happens to be in the set. The scale is
                      sourced from TYP-3's catalog `verify` field (see
                      TYPE_SCALE below) so it cannot drift.

What this script does NOT verify
─────────────────────────────────
- Font WEIGHTS (TYP-1's "PJS 600 / Inter 400/500/600 only" half): a weight is
  rarely co-located with the family on one line and "approved weight" needs the
  family resolved. Weight enforcement is deferred to the manual pass.
- Font families / sizes set in a separate stylesheet the line-local rule can't
  see, or composed from variables / class-name interpolation — out of static
  reach; the manual pass covers them.

Per-rule selection (additive)
─────────────────────────────
`--rules TYP-1` restricts the emitted findings to those control ids
(comma-separated; `--rules=TYP-1` also works). The valid ids are TYP-1 and
TYP-3. Without the flag every rule runs. Unknown ids are a usage error
(exit 1); operational errors (path not found) are never filtered.

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <...>
NOTE  type-scan: <message>        (the TYP-3 scale fell back to the embedded set)
Exit 0 and print nothing (or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation (NOTE lines alone do not fail).
"""

# What this check decides, read by `design-catalog-validate.py --write-coverage` into
# checks/COVERAGE.md. Keep it true to the code: the design skills read the
# generated file to know what still needs a manual pass.
COVERAGE = {
    "kind": "rule",
    "controls": {
        "TYP-1": {
            "covers": (
                "A font family other than Plus Jakarta Sans and Inter, "
                "`font-mono` and `font-serif`, and a non-approved generic as "
                "the primary family"
            ),
            "misses": "Font weights",
        },
        "TYP-3": {
            "covers": (
                "Sizes off the Tailwind default type scale, read from TYP-3's "
                "catalogue entry"
            ),
            "misses": (
                "Sizes set in a stylesheet the scan cannot see, or composed "
                "from variables"
            ),
        },
    },
}

import importlib.util
import os
import re
import sys

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_checklib():
    path = os.path.join(_CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_dx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()

# ── Target extensions ──────────────────────────────────────────────────────────
TARGET_EXTENSIONS = checklib.TARGET_EXTENSIONS

# ── TYP-3 type scale ──────────────────────────────────────────────────────────
# Sourced from TYP-3's catalog `verify` field:
#   "Sizes in {128,96,72,60,48,36,30,24,20,18,16,14,12}; checks/type-scan"
# Read at runtime from the rules that apply (so it cannot drift from the
# catalog), with this set as the embedded fallback if TYP-3's verify text cannot
# be parsed. An unreadable catalogue is not a parse failure: it raises
# checklib.RulesUnresolvedError. This is Tailwind's default type scale
# (text-xs … text-9xl).
TYPE_SCALE_FALLBACK = {128, 96, 72, 60, 48, 36, 30, 24, 20, 18, 16, 14, 12}


def _rule_text(path, field):
    """{rule id: that rule's `field`} for the rules that apply. Raises
    checklib.RulesUnresolvedError when the catalogue cannot be read."""
    return {c["id"]: c.get(field) for c in checklib.rules_that_apply(path)}


def load_type_scale(path=None):
    """
    Read the allowed type-scale set from TYP-3's `verify` field:
    `Sizes in {128,96,72,60,48,36,30,24,20,18,16,14,12}; …`. Returns (set, note);
    `note` is non-None if the embedded fallback was used. Raises
    checklib.RulesUnresolvedError when the catalogue cannot be read.
    """
    where = path or "the catalog"
    verify = _rule_text(path, "verify").get("TYP-3") or ""
    m = re.search(r"Sizes in\s*\{([0-9,\s]+)\}", verify)
    if not m:
        return TYPE_SCALE_FALLBACK, (
            f"NOTE type-scan: could not parse TYP-3 scale from {where}; using embedded set"
        )
    scale = {int(n) for n in re.findall(r"\d+", m.group(1))}
    if not scale:
        return TYPE_SCALE_FALLBACK, (
            f"NOTE type-scan: TYP-3 scale parsed empty from {where}; using embedded set"
        )
    return scale, None


# ── FONT (TYP-1) ──────────────────────────────────────────────────────────────
# Allowed family tokens (case-insensitive). The product fonts plus the token
# names that resolve to them.
ALLOWED_FONT_TOKENS = (
    "plus jakarta sans", "inter", "font-display", "font-body", "font-sans",
    "--font-display", "--font-body", "var(--font-display)", "var(--font-body)",
    "inherit", "initial", "unset",
)
# Generic CSS family keywords that are not a "typeface" choice.
GENERIC_FAMILY_KEYWORDS = (
    "sans-serif", "serif", "monospace", "system-ui", "ui-sans-serif",
    "ui-monospace", "ui-serif", "cursive", "fantasy", "-apple-system",
    "blinkmacsystemfont", "segoe ui", "roboto", "helvetica", "arial",
)
# Generics that, used as the PRIMARY family, deliberately pick a non-approved
# typeface (mono/serif). The sans fallbacks (sans-serif, system-ui,
# ui-sans-serif) are the standard fallback for the approved Inter/PJS and stay
# allowed; these do not.
NON_APPROVED_PRIMARY_GENERICS = {"monospace", "serif", "ui-monospace", "ui-serif"}
CSS_FONT_FAMILY_RE = re.compile(r"font-family\s*:\s*([^;{}]+)", re.IGNORECASE)
TW_FONT_ARBITRARY_RE = re.compile(r"\bfont-\[([^\]]+)\]")
# Named Tailwind family utilities. Only the built-in non-approved *family*
# utilities are checked here (font-serif / font-mono) — NEVER the weight
# utilities (font-semibold, font-bold, …), which are not a typeface choice.
TW_FONT_NAMED_FAMILY_RE = re.compile(r"\bfont-(serif|mono)\b")


def _check_font_rule(scan_line):
    """TYP-1: returns a list of (found, suggest) for disallowed typefaces."""
    hits = []

    def judge(family_value, source):
        val = family_value.strip().strip("'\"").lower()
        if not val:
            return
        # Deliberately-non-approved generic as the PRIMARY family → flag.
        # (_check_font_rule passes only the first family to judge() for CSS,
        # so this fires only on the primary, not on a sans fallback.)
        if val in NON_APPROVED_PRIMARY_GENERICS:
            hits.append((
                f'font-family "{family_value.strip()}" ({source})',
                "use Plus Jakarta Sans (display) or Inter (body) via the font tokens",
            ))
            return
        # Generic keyword only → not a typeface choice; allow.
        if val in GENERIC_FAMILY_KEYWORDS:
            return
        # Allowed product font / token (substring match on the first family).
        for ok in ALLOWED_FONT_TOKENS:
            if ok in val:
                return
        # Dynamic / interpolated value — unresolvable, caller NOTEs it.
        if "var(" in val or "${" in val or "{" in val:
            return
        hits.append((
            f'font-family "{family_value.strip()}" ({source})',
            "use Plus Jakarta Sans (display) or Inter (body) via the font tokens",
        ))

    for m in CSS_FONT_FAMILY_RE.finditer(scan_line):
        # Judge the FIRST family in the stack (the one that wins).
        first = m.group(1).split(",")[0]
        judge(first, "CSS")
    for m in TW_FONT_ARBITRARY_RE.finditer(scan_line):
        inner = m.group(1).replace("_", " ")
        judge(inner.split(",")[0], "Tailwind font-[…]")
    for m in TW_FONT_NAMED_FAMILY_RE.finditer(scan_line):
        util = "font-" + m.group(1)
        if util in ALLOWED_FONT_TOKENS:   # a project may sanction one (see plan 045)
            continue
        hits.append((
            f"Tailwind {util} utility (resolves to the default {m.group(1)} stack, "
            f"not Plus Jakarta Sans or Inter)",
            f"use font-display/font-body, or define a --{util[5:]} token mapped to an "
            f"approved face and add '{util}' to ALLOWED_FONT_TOKENS",
        ))
    return hits


# ── SIZE (TYP-3 on-scale) ─────────────────────────────────────────────────────
CSS_FONT_SIZE_RE = re.compile(r"font-size\s*:\s*([0-9.]+)px", re.IGNORECASE)
TW_TEXT_PX_RE = re.compile(r"\btext-\[([0-9.]+)px\]")
CSS_FONT_SIZE_REM_RE = re.compile(r"font-size\s*:\s*([0-9.]+)rem", re.IGNORECASE)
TW_TEXT_REM_RE = re.compile(r"\btext-\[([0-9.]+)rem\]")


def _check_size_rules(scan_line, type_scale):
    """TYP-3 on-scale. Returns list of (ctl, found, suggest)."""
    hits = []
    sizes = []  # (px_float, source)
    for m in CSS_FONT_SIZE_RE.finditer(scan_line):
        sizes.append((float(m.group(1)), "CSS font-size"))
    for m in TW_TEXT_PX_RE.finditer(scan_line):
        sizes.append((float(m.group(1)), "text-[…px]"))
    for m in CSS_FONT_SIZE_REM_RE.finditer(scan_line):
        sizes.append((float(m.group(1)) * 16.0, "CSS font-size (rem)"))
    for m in TW_TEXT_REM_RE.finditer(scan_line):
        sizes.append((float(m.group(1)) * 16.0, "text-[…rem] (rem)"))

    for px, source in sizes:
        n_int = int(px) if px == int(px) else px
        # TYP-3: off the published scale. A fractional-pixel size is off-scale
        # by definition, even when its rounded value happens to be in the set.
        if px != int(px) or int(px) not in type_scale:
            hits.append((
                "TYP-3",
                f"font size {n_int}px not on the Tailwind default type scale ({source})",
                f"use a scale size: {sorted(type_scale, reverse=True)}",
            ))
    return hits


CHECK_NAME = "type-scan"


def check_file(filepath, type_scale=None, rules=None, candidates=None):
    """
    Scan a single file. Returns a list of ERROR / NOTE strings.
    `type_scale` is the allowed-size set; built from the catalog if omitted.
    `rules` (additive, optional): a set/iterable of control ids to keep
    (e.g. {"TYP-1"}). When None, every rule runs. When given, only findings
    whose control id is in the set are emitted. Operational errors (path not
    found, unreadable file) are never filtered by `rules`.
    `candidates`: this file's records from checklib.astgrep_scan(). Omit it and
    the file is scanned on its own; scan_paths() passes a pre-grouped list so a
    whole tree costs one ast-grep invocation.
    """
    rule_filter = set(rules) if rules is not None else None
    results = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return results

    if type_scale is None:
        type_scale, _note = load_type_scale()

    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError as exc:
        results.append(f"ERROR {filepath}: cannot read file — {exc}")
        return results

    if candidates is None:
        candidates = checklib.astgrep_scan([filepath], CHECK_NAME)

    rel = os.path.relpath(filepath)
    source = [raw.rstrip("\n") for raw in lines]
    # The candidate surface, per line: every node ast-grep offered as code, with
    # comment spans removed. A parser never offers comment text as code.
    code_by_line = checklib.surface_lines(source, candidates, ("code",))

    for lineno in range(1, len(lines) + 1):
        scan_line = code_by_line.get(lineno, "")
        hits = [("TYP-1", found, suggest) for found, suggest in _check_font_rule(scan_line)]
        hits += _check_size_rules(scan_line, type_scale)
        for ctl_id, found, suggest in hits:
            if rule_filter is None or ctl_id in rule_filter:
                results.append(checklib.emit_error(rel, lineno, ctl_id, found, suggest))

    return results


def scan_paths(paths, rules=None):
    """Walk paths, collect ERROR/NOTE lines. Prints scale-fallback NOTE once.
    `rules` (additive, optional) restricts emitted findings to those control
    ids — passed straight through to check_file.

    checklib.iter_target_files() stays the single walk policy and the file list
    is handed to ast-grep explicitly: letting ast-grep walk a directory would
    import .gitignore semantics the Python walker does not have, and a gitignored
    source file would be skipped silently.

    Raises checklib.AstGrepError when ast-grep is missing, too old or broken."""
    type_scale, scale_note = load_type_scale()
    if scale_note:
        print(scale_note)
    all_results = []
    files = []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            print(f"ERROR type-scan: path not found: {val}")
            all_results.append(f"ERROR type-scan: path not found: {val}")
        else:
            files.append(val)
    by_file = checklib.group_candidates(checklib.astgrep_scan(files, CHECK_NAME))
    for val in files:
        all_results.extend(
            check_file(val, type_scale, rules, by_file.get(os.path.realpath(val), []))
        )
    return all_results


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    # The removed controls this self-test names keep their tiers in a fixture
    # catalogue until #539 retires or narrows this check (#540).
    checklib.use_self_test_catalog()
    import tempfile

    type_scale, _note = load_type_scale()

    failures = []
    case_count = 0

    def check_file_from_string(content, ext, rules=None):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, type_scale, rules)
        os.unlink(tf.name)
        return res

    def error_ids(content, ext, rules=None):
        ids = set()
        for e in check_file_from_string(content, ext, rules):
            m = re.search(r"\[([A-Z0-9-]+)\]", e) if e.startswith("ERROR") else None
            if m:
                ids.add(m.group(1))
        return ids

    def assert_ids(name, content, ext, expected_ctl_ids, rules=None):
        nonlocal case_count
        case_count += 1
        found = error_ids(content, ext, rules)
        if found != set(expected_ctl_ids):
            failures.append(f"FAIL {name}: want ids {sorted(expected_ctl_ids)}; got: {sorted(found)}")

    # ── TYP-3 on-scale ────────────────────────────────────────────────────────
    assert_ids("SIZE: text-[13px] is off-scale", '<p className="text-[13px]">small</p>', ".tsx", {"TYP-3"})
    assert_ids("SIZE: text-[14px] is on-scale", '<p className="text-[14px]">ok</p>', ".tsx", set())
    assert_ids("SIZE: text-[15px] is off-scale", '<p className="text-[15px]">x</p>', ".tsx", {"TYP-3"})
    # A fractional pixel size is off-scale by definition.
    assert_ids("SIZE: text-[0.8rem] (12.8px) is off-scale", '<p className="text-[0.8rem]">x</p>', ".tsx", {"TYP-3"})
    assert_ids("SIZE: text-[0.875rem] (14px) is on-scale", '<p className="text-[0.875rem]">ok</p>', ".tsx", set())
    assert_ids("SIZE: CSS font-size 1.875rem (30px) is on-scale", ".h { font-size: 1.875rem; }", ".css", set())
    assert_ids("SIZE: CSS font-size 0.6875rem (11px) is off-scale", ".tiny { font-size: 0.6875rem; }", ".css", {"TYP-3"})
    # The retired TYP-2 floor no longer reports: 12px is on the scale.
    assert_ids("SIZE: CSS 12px is on-scale and not a floor finding", ".tiny { font-size: 12px; }", ".css", set())

    # ── TYP-1 fonts ───────────────────────────────────────────────────────────
    assert_ids("FONT: CSS Georgia", ".h { font-family: Georgia, serif; }", ".css", {"TYP-1"})
    assert_ids("FONT: font-display token clean", '<h1 className="font-display">Title</h1>', ".tsx", set())
    assert_ids("FONT: font-sans token clean", '<p className="font-sans">Body</p>', ".tsx", set())
    assert_ids("FONT: CSS Inter clean", ".b { font-family: 'Inter', sans-serif; }", ".css", set())
    assert_ids("FONT: CSS Plus Jakarta Sans clean",
               ".h { font-family: 'Plus Jakarta Sans', sans-serif; }", ".css", set())
    assert_ids("FONT: Tailwind font-[Comic_Sans]", '<h1 className="font-[Comic_Sans_MS]">Title</h1>', ".tsx", {"TYP-1"})
    assert_ids("FONT: Tailwind font-mono utility", '<span className="font-mono">SLP-2</span>', ".tsx", {"TYP-1"})
    assert_ids("FONT: Tailwind font-serif utility", '<p className="font-serif">x</p>', ".tsx", {"TYP-1"})
    # Weight utilities are NOT a typeface choice.
    assert_ids("FONT: font-semibold is a weight, not a family", '<p className="font-semibold">x</p>', ".tsx", set())
    assert_ids("FONT: CSS monospace primary", ".code { font-family: monospace; }", ".css", {"TYP-1"})

    # ── The retired rules stay silent ─────────────────────────────────────────
    # TYP-2's line height, TYP-4's all-caps, and the LAY-4 and TYP-6 measure are
    # design-lint rules, so this check reports none of them.
    assert_ids("RETIRED: line height, all-caps, and measure report nothing",
               '.b { line-height: 1.2; text-transform: uppercase; max-width: 90ch; }', ".css", set())

    # ── Comment stripping ─────────────────────────────────────────────────────
    assert_ids("COMMENT: commented-out off-scale size not flagged",
               "/* font-size: 9px; */ .x { color: black; }", ".css", set())
    assert_ids("COMMENT: line-commented font-[Georgia] not flagged (tsx)",
               "// className='font-[Georgia]' text-[8px]", ".tsx", set())

    # ── --rules per-rule selection ─────────────────────────────────────────────
    MULTI = ".x { font-family: Georgia; font-size: 13px; }"
    assert_ids("--rules: none runs every rule", MULTI, ".css", {"TYP-1", "TYP-3"})
    assert_ids("--rules TYP-1 only", MULTI, ".css", {"TYP-1"}, {"TYP-1"})
    assert_ids("--rules TYP-3 only", MULTI, ".css", {"TYP-3"}, {"TYP-3"})

    # parse_rules_flag: valid list, `=` form, absent, and an id this check retired.
    case_count += 1
    a1 = ["--rules", "TYP-1,TYP-3", "some/path"]
    if parse_rules_flag(a1) != {"TYP-1", "TYP-3"} or a1 != ["some/path"]:
        failures.append(f"FAIL parse_rules_flag list: got {a1}")
    case_count += 1
    a2 = ["--rules=typ-3", "p"]  # lower-case is normalised
    if parse_rules_flag(a2) != {"TYP-3"} or a2 != ["p"]:
        failures.append(f"FAIL parse_rules_flag = form: got {a2}")
    case_count += 1
    if parse_rules_flag(["p"]) is not None:
        failures.append("FAIL parse_rules_flag absent: expected None")
    for retired in ("TYP-2", "TYP-4", "LAY-4", "TYP-6"):
        case_count += 1
        try:
            parse_rules_flag(["--rules", retired, "p"])
            failures.append(f"FAIL parse_rules_flag {retired}: expected ValueError")
        except ValueError:
            pass

    # ── An unreadable catalogue raises ────────────────────────────────────────
    case_count += 1
    try:
        load_type_scale(os.path.join("no", "such", "catalog.yaml"))
        failures.append("FAIL load_type_scale: an unreadable catalog must raise, "
                        "never fall back to an embedded value")
    except checklib.RulesUnresolvedError:
        pass

    # ── Parity corpus ──────────────────────────────────────────────────────────
    # Every record in fixtures/parity/expected/ was produced by the pre-swap
    # engine and committed before the matching layer moved to ast-grep. A diff
    # here means either a fixture changed or the swap changed a decision.
    parity_failures, parity_count = checklib.parity_cases(
        CHECK_NAME, lambda path: check_file(path, type_scale)
    )
    failures.extend(parity_failures)
    case_count += parity_count

    # ── Per-rule selection over the corpus, as detect.py invokes it ────────────
    # detect.py's curated profile runs `type-scan --rules TYP-1`, so the filter
    # has to survive the swap. declaration.css trips TYP-3 and no TYP-1.
    case_count += 1
    decl = os.path.join(checklib.PARITY_DIR, "known-positive", "declaration.css")
    only1 = [r for r in check_file(decl, type_scale, {"TYP-1"}) if r.startswith("ERROR")]
    if only1:
        failures.append(f"FAIL corpus --rules TYP-1: want: []; got: {only1!r}")
    case_count += 1
    only3 = [r for r in check_file(decl, type_scale, {"TYP-3"}) if r.startswith("ERROR")]
    if len(only3) != 1 or "[TYP-3]" not in only3[0]:
        failures.append(f"FAIL corpus --rules TYP-3: want one TYP-3; got: {only3!r}")

    # ── The one place the swap sharpens the message, on purpose ────────────────
    # A multi-line html comment is a syntax node, so its text is no longer read as
    # code. Pre-swap the `<!-- … -->` strip was per line, so a size named inside a
    # multi-line comment was reported. This changes no decision about real code,
    # so it does not belong in a record made by the pre-swap engine.
    case_count += 1
    with tempfile.NamedTemporaryFile(suffix=".html", mode="w", delete=False, encoding="utf-8") as tf:
        tf.write("<!--\n  Never write font-size: 9px here.\n-->\n<p>ok</p>\n")
        tf.flush()
        res = check_file(tf.name, type_scale)
    os.unlink(tf.name)
    if res:
        failures.append(
            f"FAIL multi-line html comment is not code: want: []; got: {res!r}"
        )

    # ── The provisioning contract ─────────────────────────────────────────────
    def check_eq(name, want, got):
        nonlocal case_count
        case_count += 1
        if want != got:
            failures.append(f"FAIL {name}: want: {want!r}; got: {got!r}")

    checklib.astgrep_provisioning_cases(
        "type-scan.py",
        os.path.join("fixtures", "parity", "known-positive", "declaration.css"),
        check_eq,
    )

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────

VALID_RULES = {"TYP-1", "TYP-3"}


def parse_rules_flag(args):
    """Additive `--rules TYP-1,TYP-3` (or `--rules=TYP-1`) against this script's
    own `VALID_RULES`. See `checklib.parse_rules_flag` for the shared
    implementation every `*-scan.py` --rules flag parses through."""
    return checklib.parse_rules_flag(args, VALID_RULES)


def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: python3 checks/type-scan.py "
              "[--rules TYP-1,TYP-3] <path>... | --self-test")
        sys.exit(1)
    if "--self-test" in args:
        try:
            run_self_test()
        except checklib.AstGrepError as exc:
            # A layer that did not run never reports SELF-TEST OK.
            exc.report()
            sys.exit(1)
        return
    try:
        rules = parse_rules_flag(args)
    except ValueError as exc:
        print(f"ERROR type-scan: {exc}")
        sys.exit(1)
    if not args:
        print("Usage: python3 checks/type-scan.py "
              "[--rules TYP-1,TYP-3] <path>... | --self-test")
        sys.exit(1)
    try:
        results = scan_paths(args, rules)
    except checklib.RulesUnresolvedError as exc:
        print(exc.line("type-scan"))
        sys.exit(1)
    except checklib.AstGrepError as exc:
        # One ERROR line, exit 1, no findings printed. Never a clean result:
        # ast-grep can lose a whole file's matches at exit 0, so a check that
        # could not run must say so and send its controls to manual verification.
        exc.report()
        sys.exit(1)
    errors = [r for r in results if r.startswith("ERROR")]
    for r in results:
        print(r)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
