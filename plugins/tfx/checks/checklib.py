"""
Shared scaffolding for the harness/checks/*.py scripts: comment stripping,
the source-file walker, the ERROR line format, and the self-test tail.

`checks/` is not a Python package (no `__init__.py`, filenames use hyphens),
so scripts import this module by path with the same importlib snippet
`waiver-reconcile.py` already uses for `audit-record.py`:

    import importlib.util, os
    _CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))
    def _load_checklib():
        path = os.path.join(_CHECKS_DIR, "checklib.py")
        spec = importlib.util.spec_from_file_location("_tfx_checklib", path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    checklib = _load_checklib()

Rule logic stays in each script; this module holds only the scaffolding that
was duplicated across them.
"""

import os
import sys

# The 8 extensions the general lint-style checks scan. content-lint.py scans
# prose too and keeps its own, larger set — it uses iter_target_files() with
# extensions=<its own set>, not this default.
TARGET_EXTENSIONS = {".css", ".html", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte"}

# Unified, stricter skip policy (component-manifest.py's set). Most scripts
# previously skipped only dotdirs and would have descended into node_modules
# if pointed at a repo root; iter_target_files() now skips both everywhere.
SKIP_DIRS = {"node_modules", ".git", ".next", "dist", "out"}


def strip_block_comments(line, in_comment):
    """
    Return a version of `line` with /* ... */ block-comment spans replaced by
    nothing. `in_comment` is True if the previous line ended inside a block
    comment.
    """
    result = []
    i = 0
    n = len(line)
    while i < n:
        if in_comment:
            end = line.find("*/", i)
            if end == -1:
                break
            else:
                i = end + 2
                in_comment = False
        else:
            start = line.find("/*", i)
            if start == -1:
                result.append(line[i:])
                break
            else:
                result.append(line[i:start])
                i = start + 2
                in_comment = True
    return "".join(result)


def ends_in_block_comment(line, in_comment):
    """Return True if `line` ends inside a /* ... */ block comment."""
    i = 0
    n = len(line)
    while i < n:
        if in_comment:
            end = line.find("*/", i)
            if end == -1:
                return True
            i = end + 2
            in_comment = False
        else:
            start = line.find("/*", i)
            if start == -1:
                return False
            i = start + 2
            in_comment = True
    return in_comment


def iter_target_files(paths, extensions=TARGET_EXTENSIONS, skip_dirs=SKIP_DIRS):
    """
    Walk `paths` (files or directories) and yield ("file", path) for every
    file matching `extensions`, or ("missing", path) for a path that is
    neither a file nor a directory. Skips dotdirs and `skip_dirs` (not just
    dotdirs, the previous per-script policy) when descending directories.
    """
    for p in paths:
        if os.path.isfile(p):
            if os.path.splitext(p)[1].lower() in extensions:
                yield ("file", p)
        elif os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                dirs[:] = [
                    d for d in dirs if not d.startswith(".") and d not in skip_dirs
                ]
                for fname in sorted(files):
                    if os.path.splitext(fname)[1].lower() in extensions:
                        yield ("file", os.path.join(root, fname))
        else:
            yield ("missing", p)


def emit_error(rel, lineno, ctl, found, suggest):
    """The canonical `ERROR {rel}:{lineno} [{ctl}] {found} — suggest: {suggest}`
    line. detect.py's `_FINDING_RE` reverse-parses this exact shape — change
    them together."""
    return f"ERROR {rel}:{lineno} [{ctl}] {found} — suggest: {suggest}"


def report_self_test(failures, case_count):
    """
    Print the `SELF-TEST OK (N cases)` / `SELF-TEST FAILED (…)` lines and
    exit with the same codes every check script uses today (0 clean, 1 on
    any failure). Does not return.
    """
    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        sys.exit(1)
    print(f"SELF-TEST OK ({case_count} cases)")
    sys.exit(0)


def _self_test():
    failures = []
    case_count = 0

    def check(name, cond):
        nonlocal case_count
        case_count += 1
        if not cond:
            failures.append(f"FAIL {name}")

    # ── strip_block_comments / ends_in_block_comment ────────────────────────
    check(
        "strip: no comment",
        strip_block_comments("const x = 1;", False) == "const x = 1;",
    )
    check(
        "strip: single-line block comment",
        strip_block_comments("a /* comment */ b", False) == "a  b",
    )
    check(
        "strip: unterminated block comment truncates line",
        strip_block_comments("a /* start of comment", False) == "a ",
    )
    check(
        "strip: continuation line inside comment",
        strip_block_comments("still inside */ after", True) == " after",
    )
    check(
        "strip: continuation line, comment never ends",
        strip_block_comments("still inside, no end", True) == "",
    )
    check(
        "strip: two block comments on one line",
        strip_block_comments("a /*x*/ b /*y*/ c", False) == "a  b  c",
    )
    check("ends: no comment stays false", ends_in_block_comment("plain line", False) is False)
    check(
        "ends: unterminated comment carries state",
        ends_in_block_comment("a /* start", False) is True,
    )
    check(
        "ends: terminated comment clears state",
        ends_in_block_comment("still open */ then closed", True) is False,
    )
    check(
        "ends: continuation line stays open",
        ends_in_block_comment("no terminator here", True) is True,
    )

    # ── iter_target_files: skip policy + extension filter ───────────────────
    import tempfile

    with tempfile.TemporaryDirectory() as td:
        os.makedirs(os.path.join(td, "node_modules", "pkg"))
        os.makedirs(os.path.join(td, ".git"))
        os.makedirs(os.path.join(td, "app"))
        with open(os.path.join(td, "node_modules", "pkg", "x.tsx"), "w") as fh:
            fh.write("x")
        with open(os.path.join(td, ".git", "y.tsx"), "w") as fh:
            fh.write("y")
        with open(os.path.join(td, "app", "page.tsx"), "w") as fh:
            fh.write("z")
        with open(os.path.join(td, "app", "notes.md"), "w") as fh:
            fh.write("md")

        found = [
            (kind, os.path.relpath(val, td))
            for kind, val in iter_target_files([td])
        ]
        files_found = {v for k, v in found if k == "file"}
        check(
            "walker: skips node_modules",
            not any("node_modules" in v for v in files_found),
        )
        check("walker: skips .git", not any(".git" in v for v in files_found))
        check(
            "walker: finds matching extension under a normal dir",
            os.path.join("app", "page.tsx") in files_found,
        )
        check(
            "walker: excludes non-target extension",
            os.path.join("app", "notes.md") not in files_found,
        )

        missing = list(iter_target_files([os.path.join(td, "does-not-exist")]))
        check(
            "walker: missing path yields ('missing', path), not an exception",
            missing == [("missing", os.path.join(td, "does-not-exist"))],
        )

    # ── emit_error ────────────────────────────────────────────────────────────
    check(
        "emit_error: canonical shape",
        emit_error("app/page.tsx", 12, "TYP-2", "font size 12px", "use >= 14px")
        == "ERROR app/page.tsx:12 [TYP-2] font size 12px — suggest: use >= 14px",
    )

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        sys.exit(1)
    print(f"SELF-TEST OK ({case_count} cases)")
    sys.exit(0)


if __name__ == "__main__":
    if "--self-test" in sys.argv[1:]:
        _self_test()
    else:
        print("Usage: python3 checks/checklib.py --self-test")
        sys.exit(1)
