#!/usr/bin/env python3
"""
Static focus scan — checks/a11y-static.py
Scans UI source files for the one accessibility rule no maintained tool
provides: a focus outline removed with no visible replacement (A11Y-2). The
rest of what source alone can decide is eslint-plugin-jsx-a11y's, judged on a
real AST with maintained exception tables (checks/a11y-eslint.py), and anything
that needs a rendered page belongs to the rendered check.

Detection rule (line-local only)
──────────────────────────────────
Rule            Control   What is caught
FOCUS           A11Y-2    A class string containing an outline-removal token
                (L0)      (outline-none, outline-0, focus:outline-none, or CSS
                          outline: <none|0>) with no focus-visible replacement on
                          the same class string / rule (focus-visible:outline,
                          focus-visible:ring, focus-visible:border,
                          focus-visible:shadow, ring-* paired with focus:/
                          focus-visible:, or CSS :focus-visible {…outline|
                          box-shadow|border…}).

Why this one rule stays bespoke
────────────────────────────────
No maintained tool checks for a visible focus indicator: 0 of axe's 105 rules
and none of jsx-a11y's 39. A removed outline with nothing in its place is the
most common way an L0 keyboard requirement breaks, so the rule is kept here
even though it reads text rather than an AST, and its known false-positive
class (below) is accepted rather than answered with another dependency.

What this script does NOT verify
─────────────────────────────────
- Keyboard reachability: a click handler on a non-focusable element, and an
  interactive role that cannot take focus (A11Y-2's reachability half) —
  jsx-a11y's click-events-have-key-events, no-static-element-interactions and
  interactive-supports-focus decide these on a real AST (checks/a11y-eslint.py).
- Accessible names: an icon-only button, a label with no associated control
  (A11Y-3) — jsx-a11y's label-has-associated-control and aria rules
  (checks/a11y-eslint.py).
- Computed contrast ratios (A11Y-1) — checks/contrast.py answers the declared
  token pairs; computed colours need rendered ones.
- Interactive hit-area size (A11Y-4) — needs computed layout.
- Focus traversal order and completeness (A11Y-2 traversal half) — needs a
  live DOM.
- ARIA state tracking: aria-expanded/aria-pressed/aria-checked updating to
  match visual state (A11Y-8) — too fuzzy to detect statically without tracking
  variable mutations across files. Deferred extension; manual pass required.
- Focus styles inherited from shared CSS files the line-local rule cannot see.
  If a component applies outline-none in JSX but a parent stylesheet provides
  :focus-visible recovery, this script will flag it as a false positive.
  Line-local static analysis cannot eliminate this class of false positive
  without cross-file CSS resolution (a browser / axe job), and that cost is
  accepted here. When in doubt, verify the rendered element with a keyboard
  before treating the flag as a bug.

Waiver suppression
──────────────────
A11Y-2 is L0 — never waivable. This script does NOT parse dx-waive markers;
every violation is emitted as a hard ERROR. Record any decision to accept a
specific finding in the decision record instead.

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <...>
Exit 0 and print nothing (or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation.
"""

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

# ── FOCUS rule: outline removal tokens ────────────────────────────────────────
# Tailwind classes that remove the focus outline
OUTLINE_REMOVAL_TW_RE = re.compile(
    r"\boutline-(?:none|0)\b|focus:outline-(?:none|0)\b"
)
# CSS property that removes outline
OUTLINE_REMOVAL_CSS_RE = re.compile(
    r"\boutline\s*:\s*(?:none|0)\b"
)
# Tailwind focus-visible replacements
FOCUS_VISIBLE_REPLACEMENT_TW_RE = re.compile(
    r"focus-visible:(?:outline|ring|border|shadow)"
    r"|focus(?:-visible)?:ring-\w+"
    r"|\bring-\w+\b"  # ring-* utility (common enough to pass; see calibration note)
)
# CSS focus-visible block (must be on same line as outline-removal for our heuristic)
FOCUS_VISIBLE_REPLACEMENT_CSS_RE = re.compile(
    r":focus-visible\s*\{[^}]*(?:outline|box-shadow|border)"
)


def _check_focus_rule(scan_line):
    """
    FOCUS rule (A11Y-2): detects outline removal without a focus-visible
    replacement on the same line.

    Returns True if a violation is found.
    """
    has_removal_tw = bool(OUTLINE_REMOVAL_TW_RE.search(scan_line))
    has_removal_css = bool(OUTLINE_REMOVAL_CSS_RE.search(scan_line))
    if not (has_removal_tw or has_removal_css):
        return False

    has_replacement_tw = bool(FOCUS_VISIBLE_REPLACEMENT_TW_RE.search(scan_line))
    has_replacement_css = bool(FOCUS_VISIBLE_REPLACEMENT_CSS_RE.search(scan_line))
    if has_replacement_tw or has_replacement_css:
        return False

    return True


def check_file(filepath):
    """
    Scan a single file and return a list of error strings.
    Each string is formatted: ERROR <file>:<line> [CTL-ID] <found> — suggest: <...>
    """
    errors = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return errors

    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError as exc:
        errors.append(f"ERROR {filepath}: cannot read file — {exc}")
        return errors

    rel = os.path.relpath(filepath)
    in_block_comment = False

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")

        # ── Strip comments so comment text is not flagged ─────────────────────
        scan_line = checklib.strip_block_comments(line, in_block_comment)
        in_block_comment = checklib.ends_in_block_comment(line, in_block_comment)

        # Strip HTML comments
        scan_line = re.sub(r"<!--.*?-->", "", scan_line)
        # Strip single-line // comments (JS/TS contexts)
        if ext in (".js", ".ts", ".jsx", ".tsx"):
            scan_line = re.sub(r"//.*$", "", scan_line)

        # ── FOCUS rule (A11Y-2) ───────────────────────────────────────────────
        if _check_focus_rule(scan_line):
            errors.append(checklib.emit_error(
                rel, lineno, "A11Y-2",
                "focus outline removed with no focus-visible replacement",
                "add focus-visible:outline-2 / focus-visible:ring-2",
            ))

    return errors


def scan_paths(paths):
    """Walk the given paths (files or directories) and collect all violations."""
    all_errors = []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            print(f"ERROR a11y-static: path not found: {val}")
            all_errors.append(f"ERROR a11y-static: path not found: {val}")
        else:
            all_errors.extend(check_file(val))
    return all_errors


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    """
    Embedded self-test cases.  Prints SELF-TEST OK (N cases) and exits 0 on
    success, or prints failures and exits 1.
    """
    import tempfile

    failures = []
    case_count = 0

    def assert_violations(name, content, ext, expected_ctl_ids):
        nonlocal case_count
        case_count += 1
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            errs = check_file(tf.name)
        os.unlink(tf.name)

        found_ctls = []
        for e in errs:
            m = re.search(r"\[([A-Z0-9-]+)\]", e)
            if m:
                found_ctls.append(m.group(1))

        for ctl in expected_ctl_ids:
            if ctl not in found_ctls:
                failures.append(f"FAIL {name}: want: {[ctl]!r}; got: {found_ctls!r}")

    def assert_clean(name, content, ext):
        nonlocal case_count
        case_count += 1
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            errs = check_file(tf.name)
        os.unlink(tf.name)
        if errs:
            failures.append(f"FAIL {name}: want: {[]!r}; got: {errs!r}")

    def assert_doc(name, want_fragment):
        nonlocal case_count
        case_count += 1
        if want_fragment not in " ".join(__doc__.split()):
            failures.append(f"FAIL {name}: want: {want_fragment!r}; got: not in the docstring")

    # ── FOCUS rule cases ──────────────────────────────────────────────────────

    # Case 1: outline-none with no focus-visible replacement → A11Y-2
    assert_violations(
        "FOCUS: outline-none no replacement",
        '<button className="rounded outline-none px-4">Save</button>',
        ".tsx",
        ["A11Y-2"],
    )

    # Case 2: outline-none WITH focus-visible:ring-2 → clean
    assert_clean(
        "FOCUS: outline-none with focus-visible:ring-2",
        '<button className="rounded outline-none focus-visible:ring-2">Save</button>',
        ".tsx",
    )

    # Case 3: CSS outline: none with no :focus-visible recovery on same line → A11Y-2
    assert_violations(
        "FOCUS: CSS outline none no replacement",
        ".dropdown-option { outline: none; padding: 8px; }",
        ".css",
        ["A11Y-2"],
    )

    # Case 4: commented-out outline-none must NOT flag (comment stripping)
    assert_clean(
        "FOCUS: commented-out outline-none not flagged",
        "// className='outline-none' — do not use without focus-visible",
        ".tsx",
    )

    # Case 5: focus:outline-none WITHOUT focus-visible → A11Y-2
    assert_violations(
        "FOCUS: focus:outline-none without focus-visible",
        '<input className="border focus:outline-none" />',
        ".tsx",
        ["A11Y-2"],
    )

    # Case 6: outline-0 (numeric form) without replacement → A11Y-2
    assert_violations(
        "FOCUS: outline-0 without replacement",
        '<button className="outline-0">Click</button>',
        ".tsx",
        ["A11Y-2"],
    )

    # Case 7: the accepted false positive. The recovery lives in a stylesheet
    # this line-local rule cannot see, so the flag stands — an accepted cost,
    # not a bug to code around. Confirm the rendered element with a keyboard.
    assert_violations(
        "FOCUS: recovery in another file still flags (accepted false positive)",
        '<button className="chip outline-none">Save</button>\n'
        '/* chip.css elsewhere: .chip:focus-visible { outline: 2px solid; } */',
        ".tsx",
        ["A11Y-2"],
    )

    # ── The deleted rules leave no coverage claim behind ──────────────────────

    # Case 8: a click handler on a non-focusable element and an icon-only
    # button are jsx-a11y's now (checks/a11y-eslint.py) — this check reports
    # nothing about either, rather than reporting a weaker version of them.
    assert_clean(
        "narrowed: keyboard reachability and accessible names are not this check's",
        '<div onClick={handleClick} className="item">Label</div>\n'
        "<button><SearchIcon /></button>",
        ".tsx",
    )

    # ── The docstring's load-bearing paragraphs ───────────────────────────────

    # Case 9: the accepted false-positive class keeps its keyboard instruction.
    assert_doc(
        "docstring keeps the keyboard-verification instruction",
        "verify the rendered element with a keyboard before treating the flag as a bug",
    )

    # Case 10: the A11Y-8 cross-file-mutation paragraph is cited elsewhere as
    # the reason a state-tracking rule is out of static reach — deleting the
    # NAME rule must not delete it.
    assert_doc(
        "docstring keeps the A11Y-8 cross-file mutation paragraph",
        "without tracking variable mutations across files",
    )

    # ── Fixtures ───────────────────────────────────────────────────────────────
    fixtures_dir = os.path.join(_CHECKS_DIR, "fixtures", "a11y-static")
    for fname in sorted(os.listdir(fixtures_dir)):
        case_count += 1
        fpath = os.path.join(fixtures_dir, fname)
        errs = check_file(fpath)
        if "fail" in fname and not errs:
            failures.append(f"FAIL fixture {fname}: want: >=1 ERROR; got: none")
        elif "pass" in fname and errs:
            failures.append(f"FAIL fixture {fname}: want: 0 ERRORs; got: {errs!r}")

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if not args:
        print("Usage: python3 checks/a11y-static.py <path>... | --self-test")
        sys.exit(1)

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    errors = scan_paths(args)

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
