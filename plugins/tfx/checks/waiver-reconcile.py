#!/usr/bin/env python3
"""
Waiver reconcile — checks/waiver-reconcile.py
Reconciles the two places a TFX waiver can live so neither drifts from the
other:
  1. inline, as `tfx-waive <CTL-ID> reason="..."` comments in source/CSS;
  2. in a decision record, as a "## Waivers granted" table row with a named
     approver.

Plus the catalog tier of each control. Closes the loop `token-audit.py`
leaves open ("a human closes the decision-record loop") — but only for the
paths it is given.

Findings
────────
  ERROR <file>:<line> [<id>] inline tfx-waive on an L0 control — L0 is never
        waivable               (an L0 may never be waived, by any prefix)
  ERROR <file>:<line> [<id>] inline waiver has no recorded waiver row (named
        approver) — add it to a decision record     (orphan; L1/L2 only)
  ERROR <file>:<line> [<id>] tfx-waive references an unknown control id
        (the id is not in standards/catalog.yaml)
  NOTE  <record> [<id>] recorded waiver has no inline usage in the scanned
        source — confirm it is still needed          (stale; never an ERROR)

ERROR ⇒ exit 1. A NOTE alone keeps exit 0 — a recorded waiver looks "stale"
only relative to the source paths scanned, which may be partial; downgrading
a possibly-incomplete scan to a hard failure would be dishonest.

What this script does NOT verify
─────────────────────────────────
- Waivers in files or records OUTSIDE the scanned `--src` / `--records`
  paths. The reconciliation is only as complete as the paths given — run it
  with the same `--src` breadth as the other checks. A stale NOTE on a
  partial scan is expected, not a defect.
- Whether the recorded *reason* actually justifies the inline usage — that is
  judgment (the evaluator / a human approver), not reconciliation. This check
  reconciles presence, control id, approver-row existence, and tier only.
- L2-waiver rationale quality ("a specific, real reason") — judgment.
- The records' content is read, never edited; this check does not "fix" a
  mismatch, it reports it.

Usage
─────
  python3 checks/waiver-reconcile.py --src <path>... --records <dir>
  python3 checks/waiver-reconcile.py --repo-root <path>     # records default
  python3 checks/waiver-reconcile.py --self-test

Exit 0 silent (or only NOTEs) on a clean reconcile; exit 1 with ERROR lines
on any orphan / L0-inline / unknown-id finding.
"""

import importlib.util
import os
import re
import sys

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_PATH = os.path.join(REPO_ROOT, "standards", "catalog.yaml")
DECISIONS_DIR = os.path.join(REPO_ROOT, "docs", "decisions")

# Inline waiver syntax (CLAUDE.md "Always-on rules" / checks/README.md):
#   tfx-waive <CTL-ID> reason="..."
# Generalised to ALL control prefixes (token-audit only matches TOK/COL).
INLINE_WAIVE_RE = re.compile(
    r'tfx-waive\s+([A-Z0-9]+-\d+)(?:\s+reason="([^"]*)")?'
)


# ── Reuse audit-record's table parser (do not rewrite it) ─────────────────────
def _load_audit_record():
    """Import parse_table_rows / column_index / split_sections / find_section
    from the sibling audit-record.py by path (its filename has a hyphen, and
    its main() is guarded by `if __name__ == '__main__'`, so importing it does
    not run anything)."""
    path = os.path.join(CHECKS_DIR, "audit-record.py")
    spec = importlib.util.spec_from_file_location("_tfx_audit_record", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_AR = _load_audit_record()
parse_table_rows = _AR.parse_table_rows
column_index = _AR.column_index


# ── Reuse checklib's walker ────────────────────────────────────────────────────
def _load_checklib():
    path = os.path.join(CHECKS_DIR, "checklib.py")
    spec = importlib.util.spec_from_file_location("_tfx_checklib", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_checklib()
# Reuse a11y-static's source-file extension set so the same tree is scanned.
TARGET_EXTENSIONS = checklib.TARGET_EXTENSIONS
split_sections = _AR.split_sections
find_section = _AR.find_section


# ── Step 1: collect the three inputs ──────────────────────────────────────────
def _iter_source_files(src_paths):
    """Yield every TARGET_EXTENSIONS file under the given files/dirs.
    Silently skips non-existent paths here; main() reports them."""
    for kind, val in checklib.iter_target_files(src_paths, TARGET_EXTENSIONS):
        if kind == "file":
            yield val


def find_inline_waivers(src_paths):
    """Return [(file, line, ctl_id, reason)] for every inline `tfx-waive`.

    Inline waivers ARE comments, so comment text is NOT stripped — the marker
    is matched directly wherever it appears.
    """
    found = []
    for path in _iter_source_files(src_paths):
        try:
            with open(path, encoding="utf-8", errors="replace") as fh:
                lines = fh.readlines()
        except OSError:
            continue
        for lineno, raw in enumerate(lines, start=1):
            for m in INLINE_WAIVE_RE.finditer(raw):
                ctl_id = m.group(1)
                reason = m.group(2) if m.group(2) is not None else ""
                found.append((path, lineno, ctl_id, reason))
    return found


def find_recorded_waivers(records):
    """Return [(record, ctl_id, tier, approver)] for every non-placeholder
    waiver row across the given record files. A row counts only when column 0
    holds a control id (matching `^[A-Z0-9]+-\\d+$`) — TEMPLATE-style empty /
    descriptive placeholder rows are ignored."""
    recorded = []
    for record in records:
        try:
            with open(record, encoding="utf-8") as fh:
                text = fh.read()
        except OSError:
            continue
        sections = split_sections(text)
        body = find_section(sections, "Waivers granted")
        if body is None:
            continue
        header, rows = parse_table_rows(body)
        tier_idx = column_index(header, "tier", 1)
        approver_idx = column_index(header, "approver", 3)
        for row in rows:
            control = row[0].strip() if len(row) > 0 else ""
            if not re.match(r"^[A-Z0-9]+-\d+$", control):
                continue  # empty / placeholder / descriptive row — not a waiver
            tier = row[tier_idx].strip() if len(row) > tier_idx else ""
            approver = row[approver_idx].strip() if len(row) > approver_idx else ""
            recorded.append((record, control, tier, approver))
    return recorded


def catalog_tiers(catalog_path=CATALOG_PATH):
    """Parse standards/catalog.yaml → {control_id: tier}."""
    import yaml

    with open(catalog_path, encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    tiers = {}
    for control in data.get("controls", []):
        cid = control.get("id")
        if cid:
            tiers[cid] = str(control.get("tier", "")).upper()
    return tiers


# ── Step 2: reconcile + emit ───────────────────────────────────────────────────
def reconcile(inline_waivers, recorded_waivers, tiers, rel=None):
    """Reconcile the three inputs. Returns (errors, notes) — lists of strings.

    rel: optional fn(path) -> display path for source files / records.
    """
    if rel is None:
        rel = lambda p: p

    recorded_ids = {ctl for (_rec, ctl, _t, _a) in recorded_waivers}
    inline_ids = {ctl for (_f, _ln, ctl, _r) in inline_waivers}

    errors = []
    notes = []

    # Inline-driven findings: L0, unknown-id, orphan.
    for path, lineno, ctl_id, _reason in inline_waivers:
        loc = f"{rel(path)}:{lineno}"
        tier = tiers.get(ctl_id)
        if tier is None:
            errors.append(
                f"ERROR {loc} [{ctl_id}] tfx-waive references an unknown "
                f"control id"
            )
            continue
        if tier == "L0":
            errors.append(
                f"ERROR {loc} [{ctl_id}] inline tfx-waive on an L0 control — "
                f"L0 is never waivable"
            )
            continue  # L0 already errored — do not also report it as an orphan
        if ctl_id not in recorded_ids:
            errors.append(
                f"ERROR {loc} [{ctl_id}] inline waiver has no recorded waiver "
                f"row (named approver) — add it to a decision record"
            )

    # Record-driven finding: stale (recorded but no inline usage) — NOTE only.
    for record, ctl_id, _tier, _approver in recorded_waivers:
        if ctl_id not in inline_ids:
            notes.append(
                f"NOTE {rel(record)} [{ctl_id}] recorded waiver has no inline "
                f"usage in the scanned source — confirm it is still needed"
            )

    return errors, notes


# ── Self-test ──────────────────────────────────────────────────────────────────
def run_self_test():
    """Embedded self-test. Prints SELF-TEST OK (N cases) and exits 0 on
    success; prints failures and exits 1. Builds temp source + record files;
    reads the REAL standards/catalog.yaml for tiers (read-only, like
    audit-record's path-referencing cases)."""
    import tempfile

    failures = []
    case_count = 0

    tiers = catalog_tiers()  # real catalog, read-only

    def write_temp(content, suffix):
        tf = tempfile.NamedTemporaryFile(
            suffix=suffix, mode="w", delete=False, encoding="utf-8"
        )
        tf.write(content)
        tf.flush()
        tf.close()
        return tf.name

    record_template = """\
# Design decision record — self-test

## Waivers granted

| Control | Tier | Reason | Approver | Where recorded |
|---------|------|--------|----------|----------------|
{rows}
"""

    def run_case(name, src_content, record_rows, expect_errors, expect_notes):
        """src_content: str source (.tsx). record_rows: list of '| ... |'
        markdown rows (or empty for a placeholder-only table). Asserts which
        substrings appear in errors / notes."""
        nonlocal case_count
        case_count += 1
        src = write_temp(src_content, ".tsx")
        rows = "\n".join(record_rows) if record_rows else "| | | | | placeholder |"
        rec = write_temp(record_template.format(rows=rows), ".md")
        try:
            inline = find_inline_waivers([src])
            recorded = find_recorded_waivers([rec])
            errors, notes = reconcile(inline, recorded, tiers)
        finally:
            os.unlink(src)
            os.unlink(rec)
        for sub in expect_errors:
            if not any(sub in e for e in errors):
                failures.append(
                    f"FAIL {name}: expected an ERROR containing {sub!r} — "
                    f"got errors={errors} notes={notes}"
                )
        for sub in expect_notes:
            if not any(sub in n for n in notes):
                failures.append(
                    f"FAIL {name}: expected a NOTE containing {sub!r} — "
                    f"got errors={errors} notes={notes}"
                )
        return errors, notes

    def assert_clean(name, src_content, record_rows):
        errors, notes = run_case(name, src_content, record_rows, [], [])
        if errors or notes:
            failures.append(
                f"FAIL {name}: expected clean — got errors={errors} "
                f"notes={notes}"
            )

    # Case 1: inline tfx-waive A11Y-1 (L0) → L0 error.
    run_case(
        "L0 inline waiver",
        '<div className="x">{/* tfx-waive A11Y-1 reason="x" */}</div>',
        [],
        expect_errors=["[A11Y-1] inline tfx-waive on an L0 control"],
        expect_notes=[],
    )

    # Case 2: inline tfx-waive TOK-1 (L1) WITH a matching record row → clean.
    assert_clean(
        "TOK-1 inline with matching record row",
        '<div className="x">{/* tfx-waive TOK-1 reason="x" */}</div>',
        ["| TOK-1 | L1 | reason | Reza Ilmi (user) | this record |"],
    )

    # Case 3: inline tfx-waive TOK-1 with NO record row → orphan ERROR.
    run_case(
        "TOK-1 inline orphan (no record row)",
        '<div className="x">{/* tfx-waive TOK-1 reason="x" */}</div>',
        [],
        expect_errors=["[TOK-1] inline waiver has no recorded waiver row"],
        expect_notes=[],
    )

    # Case 4: record row for TOK-2 with no inline usage → stale NOTE, exit 0.
    case_count += 1
    _src = write_temp("<div>no waivers here</div>", ".tsx")
    _rec = write_temp(
        record_template.format(
            rows="| TOK-2 | L1 | reason | Reza Ilmi (user) | this record |"
        ),
        ".md",
    )
    try:
        inline = find_inline_waivers([_src])
        recorded = find_recorded_waivers([_rec])
        errors, notes = reconcile(inline, recorded, tiers)
        exit_code = 1 if errors else 0
    finally:
        os.unlink(_src)
        os.unlink(_rec)
    if not any("[TOK-2] recorded waiver has no inline usage" in n for n in notes):
        failures.append(
            f"FAIL stale recorded waiver: expected a TOK-2 NOTE — got "
            f"errors={errors} notes={notes}"
        )
    if errors:
        failures.append(
            f"FAIL stale recorded waiver: expected no ERROR — got {errors}"
        )
    if exit_code != 0:
        failures.append(
            f"FAIL stale recorded waiver: expected exit 0 (NOTE alone) — "
            f"got exit {exit_code}"
        )

    # Case 5: inline tfx-waive ZZZ-9 (unknown id) → unknown-id ERROR; exit 1.
    case_count += 1
    _src = write_temp(
        '<div>{/* tfx-waive ZZZ-9 reason="x" */}</div>', ".tsx"
    )
    _rec = write_temp(
        record_template.format(rows="| | | | | placeholder |"), ".md"
    )
    try:
        inline = find_inline_waivers([_src])
        recorded = find_recorded_waivers([_rec])
        errors, notes = reconcile(inline, recorded, tiers)
        exit_code = 1 if errors else 0
    finally:
        os.unlink(_src)
        os.unlink(_rec)
    if not any(
        "[ZZZ-9] tfx-waive references an unknown control id" in e
        for e in errors
    ):
        failures.append(
            f"FAIL unknown-id: expected a ZZZ-9 unknown-id ERROR — got "
            f"errors={errors}"
        )
    if exit_code != 1:
        failures.append(
            f"FAIL unknown-id: expected exit 1 (any ERROR ⇒ exit 1) — "
            f"got exit {exit_code}"
        )

    # Case 6: placeholder/empty record row → ignored (no false stale NOTE).
    case_count += 1
    _src = write_temp("<div>nothing</div>", ".tsx")
    _rec = write_temp(
        record_template.format(rows="| | | | | inline `tfx-waive` / this record |"),
        ".md",
    )
    try:
        inline = find_inline_waivers([_src])
        recorded = find_recorded_waivers([_rec])
        errors, notes = reconcile(inline, recorded, tiers)
    finally:
        os.unlink(_src)
        os.unlink(_rec)
    if recorded:
        failures.append(
            f"FAIL placeholder row ignored: expected no recorded waivers — "
            f"got {recorded}"
        )
    if errors or notes:
        failures.append(
            f"FAIL placeholder row ignored: expected clean — got "
            f"errors={errors} notes={notes}"
        )

    # Case 7: reason="" omitted entirely still matches (bare tfx-waive TOK-1).
    run_case(
        "bare inline waiver without reason",
        "/* tfx-waive TOK-1 */",
        [],
        expect_errors=["[TOK-1] inline waiver has no recorded waiver row"],
        expect_notes=[],
    )

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────
def main():
    args = sys.argv[1:]

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    # Parse flags: --repo-root <path>, --src <path>..., --records <dir>.
    repo_root = REPO_ROOT
    src_paths = []
    records_dir = None
    i = 0
    while i < len(args):
        if args[i] == "--repo-root" and i + 1 < len(args):
            repo_root = os.path.abspath(args[i + 1])
            i += 2
        elif args[i] == "--src":
            i += 1
            while i < len(args) and not args[i].startswith("--"):
                src_paths.append(args[i])
                i += 1
        elif args[i] == "--records" and i + 1 < len(args):
            records_dir = args[i + 1]
            i += 2
        else:
            # Bare positional → treat as a source path (lenient).
            src_paths.append(args[i])
            i += 1

    # Records default: <repo-root>/docs/decisions (skip TEMPLATE.md).
    if records_dir is None:
        records_dir = os.path.join(repo_root, "docs", "decisions")
    if not os.path.isdir(records_dir):
        records = []
    else:
        records = sorted(
            os.path.join(records_dir, f)
            for f in os.listdir(records_dir)
            if f.endswith(".md") and f != "TEMPLATE.md"
        )

    # Catalog: resolve relative to the harness checks dir (tiers are the
    # harness's, regardless of which consumer repo's source is scanned).
    tiers = catalog_tiers()

    # Report missing source paths, like a11y-static does.
    path_errors = []
    for p in src_paths:
        if not os.path.exists(p):
            path_errors.append(f"ERROR waiver-reconcile: path not found: {p}")

    inline_waivers = find_inline_waivers(src_paths)
    recorded_waivers = find_recorded_waivers(records)
    errors, notes = reconcile(inline_waivers, recorded_waivers, tiers)
    errors = path_errors + errors

    for line in errors:
        print(line)
    for line in notes:
        print(line)

    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
