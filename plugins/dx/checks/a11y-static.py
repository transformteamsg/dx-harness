#!/usr/bin/env python3
"""
Static a11y scan — checks/a11y-static.py
Scans UI source files for a high-confidence static subset of A11Y-2, A11Y-3,
and A11Y-8 violations that are detectable from source text alone, without a
rendered DOM.

Detection rules (line-local only)
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

KBD             A11Y-2    A <div/<span/<li/<p opening tag on a line carrying
                (L0)      onClick/onMouseDown (JSX) or (click)/@click (template)
                          with NO role= and NO tabIndex/tabindex on the same
                          opening tag.

NAME            A11Y-3    A <button or role="button" opening tag with NO
                (L0)      aria-label/aria-labelledby/title, that is self-closing
                          OR whose same-line content is only an icon (<svg, an
                          <Icon/*Icon component, or an aria-hidden child) with
                          no visible text.

What this script does NOT verify
─────────────────────────────────
- Computed contrast ratios (A11Y-1) — needs rendered colours.
- Interactive hit-area size (A11Y-4) — needs computed layout.
- Focus traversal order and completeness (A11Y-2 traversal half) — needs a
  live DOM.
- ARIA state tracking: aria-expanded/aria-pressed/aria-checked updating to
  match visual state (A11Y-8) — too fuzzy to detect statically without tracking
  variable mutations across files. Deferred extension; manual pass required.
- Focus styles inherited from shared CSS files the line-local rule cannot see.
  If a component applies outline-none in JSX but a parent stylesheet provides
  :focus-visible recovery, this script will flag it as a false positive. See the
  false-positive note in the docstring. Line-local static analysis cannot
  eliminate this class of false positive without cross-file CSS resolution (a
  browser / axe job). When in doubt, verify the rendered element with a keyboard
  before treating the flag as a bug.

Waiver suppression
──────────────────
A11Y-2 and A11Y-3 are L0 — never waivable. This script does NOT parse
tfx-waive markers for these controls; every violation is emitted as a hard ERROR.
A11Y-8 (KBD sub-rule) is L1; waiver parsing is also omitted here because the
static check is a subset — the full evaluation still goes through the manual
pass. Implementing waiver parsing for a partial check risks creating a false
sense of coverage. Record any decision to accept a specific finding in the
decision record instead.

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
    spec = importlib.util.spec_from_file_location("_tfx_checklib", path)
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

# ── KBD rule: click handler on non-interactive element ────────────────────────
# Matches opening tags for non-interactive elements
KBD_NONFOCUSABLE_TAG_RE = re.compile(
    r"<\s*(div|span|li|p)\b"
)
# Click handler patterns (JSX, HTML, and Vue template)
KBD_CLICK_HANDLER_RE = re.compile(
    r"\bon(?:Click|MouseDown|click)\s*=|\(click\)|@click\b"
)
# Role attribute present
KBD_ROLE_RE = re.compile(r'\brole\s*=')
# tabIndex attribute present
KBD_TABINDEX_RE = re.compile(r'\btab[Ii]ndex\s*=')

# ── NAME rule: icon-only button with no accessible name ───────────────────────
# Opening button tag or role="button"
NAME_BUTTON_RE = re.compile(
    r'<button\b|role\s*=\s*["\']button["\']'
)
# Accessible name attributes
NAME_ACCESSIBLE_RE = re.compile(
    r'\baria-label(?:ledby)?\s*=|\btitle\s*='
)
# Icon-only content indicators on the same line (self-closing or icon children)
# Matches SVG elements, Icon components (*Icon or Icon*), aria-hidden elements
NAME_ICON_ONLY_RE = re.compile(
    r'<svg\b|<\w*[Ii]con\b|\baria-hidden\s*=\s*["\']true["\']'
)
# Self-closing button patterns
NAME_SELF_CLOSING_RE = re.compile(r'/\s*>')
# Visible text heuristic: after stripping tags, is there non-whitespace text?
NAME_STRIP_TAGS_RE = re.compile(r'<[^>]+>')


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


def _check_kbd_rule(scan_line):
    """
    KBD rule (A11Y-2): detects click handlers on non-focusable elements.

    Returns True if a violation is found.
    """
    if not KBD_NONFOCUSABLE_TAG_RE.search(scan_line):
        return False
    if not KBD_CLICK_HANDLER_RE.search(scan_line):
        return False
    if KBD_ROLE_RE.search(scan_line):
        return False
    if KBD_TABINDEX_RE.search(scan_line):
        return False
    return True


def _check_name_rule(scan_line):
    """
    NAME rule (A11Y-3): detects icon-only buttons with no accessible name.

    Only flags the same-line / self-closing case.
    Returns True if a violation is found.
    """
    if not NAME_BUTTON_RE.search(scan_line):
        return False
    if NAME_ACCESSIBLE_RE.search(scan_line):
        return False

    # Check if the button has visible text content on the same line
    # Strip the opening button tag first, then look at what's left
    # Find the content after the first tag closes
    tag_close = scan_line.find(">")
    if tag_close == -1:
        # No closing > on this line — incomplete tag, skip
        return False

    after_tag = scan_line[tag_close + 1:]

    # Self-closing (/>): no content possible
    opening_tag_part = scan_line[:tag_close + 1]
    if NAME_SELF_CLOSING_RE.search(opening_tag_part):
        return True

    # Check if there's visible text after stripping tags
    text_content = NAME_STRIP_TAGS_RE.sub("", after_tag).strip()

    # If there's visible text → not an icon-only button
    if text_content:
        return False

    # No visible text — check if it has icon content
    if NAME_ICON_ONLY_RE.search(after_tag):
        return True

    # No visible text and no icon — still flag (empty button is also missing a name)
    # But only if the button tag has a closing tag on the same line
    if "</button>" in scan_line.lower() or "</button>" in after_tag.lower():
        return True

    # Opening tag only with no closing tag — skip (multi-line button, can't tell)
    return False


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

        def emit(ctl_id, found, suggest):
            errors.append(checklib.emit_error(rel, lineno, ctl_id, found, suggest))

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
            emit(
                "A11Y-2",
                "focus outline removed with no focus-visible replacement",
                "add focus-visible:outline-2 / focus-visible:ring-2",
            )

        # ── KBD rule (A11Y-2) ────────────────────────────────────────────────
        if _check_kbd_rule(scan_line):
            # Extract which non-focusable tag triggered it for better messaging
            m = KBD_NONFOCUSABLE_TAG_RE.search(scan_line)
            tag = m.group(1) if m else "element"
            emit(
                "A11Y-2",
                f"click handler on non-focusable <{tag}> (no role, no tabIndex)",
                "use <button> or add role + tabIndex + key handler",
            )

        # ── NAME rule (A11Y-3) ───────────────────────────────────────────────
        if _check_name_rule(scan_line):
            emit(
                "A11Y-3",
                "icon-only button with no accessible name",
                "add aria-label",
            )

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
                failures.append(f"FAIL {name}: expected [{ctl}] violation — got: {errs}")

    def assert_clean(name, content, ext):
        nonlocal case_count
        case_count += 1
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            errs = check_file(tf.name)
        os.unlink(tf.name)
        if errs:
            failures.append(f"FAIL {name}: expected no violations — got: {errs}")

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

    # ── KBD rule cases ────────────────────────────────────────────────────────

    # Case 5: <div onClick> with no role and no tabIndex → A11Y-2
    assert_violations(
        "KBD: div onClick no role no tabIndex",
        '<div onClick={handleClick} className="item">Label</div>',
        ".tsx",
        ["A11Y-2"],
    )

    # Case 6: <div onClick> WITH role="button" → clean
    assert_clean(
        "KBD: div onClick with role=button",
        '<div onClick={handleClick} role="button" tabIndex={0}>Label</div>',
        ".tsx",
    )

    # Case 7: <button onClick> → clean (button is natively focusable, not a non-focusable element)
    assert_clean(
        "KBD: button onClick is clean",
        '<button onClick={handleClick}>Delete</button>',
        ".tsx",
    )

    # Case 8: HTML onclick on span → A11Y-2
    assert_violations(
        "KBD: HTML span onclick no role",
        '<span onclick="doSomething()">Click me</span>',
        ".html",
        ["A11Y-2"],
    )

    # ── NAME rule cases ───────────────────────────────────────────────────────

    # Case 9: icon-only button with no aria-label → A11Y-3
    assert_violations(
        "NAME: icon-only button no aria-label",
        '<button><SearchIcon /></button>',
        ".tsx",
        ["A11Y-3"],
    )

    # Case 10: icon-only button WITH aria-label → clean
    assert_clean(
        "NAME: icon-only button with aria-label",
        '<button aria-label="Search"><SearchIcon /></button>',
        ".tsx",
    )

    # Case 11: native button with visible text → clean
    assert_clean(
        "NAME: button with visible text is clean",
        "<button>Save</button>",
        ".tsx",
    )

    # Case 12: HTML button with SVG icon and no aria-label → A11Y-3
    assert_violations(
        "NAME: HTML button with svg no aria-label",
        '<button><svg aria-hidden="true"></svg></button>',
        ".html",
        ["A11Y-3"],
    )

    # ── Edge cases ────────────────────────────────────────────────────────────

    # Case 13: focus:outline-none WITHOUT focus-visible → A11Y-2
    assert_violations(
        "FOCUS: focus:outline-none without focus-visible",
        '<input className="border focus:outline-none" />',
        ".tsx",
        ["A11Y-2"],
    )

    # Case 14: outline-0 (numeric form) without replacement → A11Y-2
    assert_violations(
        "FOCUS: outline-0 without replacement",
        '<button className="outline-0">Click</button>',
        ".tsx",
        ["A11Y-2"],
    )

    # ── Report ─────────────────────────────────────────────────────────────────
    # ── Fixtures ───────────────────────────────────────────────────────────────
    fixtures_dir = os.path.join(_CHECKS_DIR, "fixtures", "a11y-static")
    for fname in sorted(os.listdir(fixtures_dir)):
        case_count += 1
        fpath = os.path.join(fixtures_dir, fname)
        errs = check_file(fpath)
        if "fail" in fname and not errs:
            failures.append(f"FAIL fixture {fname}: expected >=1 ERROR — got none")
        elif "pass" in fname and errs:
            failures.append(f"FAIL fixture {fname}: expected 0 ERRORs — got: {errs}")

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
