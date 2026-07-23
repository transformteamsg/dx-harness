#!/usr/bin/env python3
"""
Token audit — checks/token-audit.py
Scans UI source files for raw colour / off-scale spacing / off-scale radius values
that should be replaced with design tokens.

Detection rules
───────────────
Rule          Controls    What is caught
TOK-1/COL     TOK-1       Raw hex #rrggbb / #rgb / #rrggbbaa in style contexts
              COL-1/2     Raw rgb()/rgba() and hsl()/hsla() calls in style contexts
                          Raw oklch() calls in style contexts
                          Standalone CSS named colours (white|black|red|green|blue|
                            gray|grey|orange|yellow|purple) as CSS property values
              COL-1/2     Tailwind palette utility classes that bypass the semantic layer
                            e.g. bg-red-500, text-blue-600, border-gray-200
TOK-2                     margin/padding/gap/top/left/right/bottom with raw px/rem values
                            not in the shadcn default spacing scale
                            Scale: {0,1,2,4,6,8,10,12,14,16,20,24,28,32,36,40,44,48,
                                    56,64,80,96,112,128} px (rem equivalents at 16px base)
                            Passes: var(--…), auto, 0, percentages, viewport units
TOK-3                     border-radius with raw px/rem values not in
                            {0,2,4,6,8,12,16,24,9999} px

Exemptions
──────────
Token-definition blocks are exempt from all raw-value rules.  A block is:
  (a) A contiguous run of CSS custom-property declarations (--*: value;) — the
      scanner detects an open block when it sees "--<name>:" and closes it when
      it finds a non-blank line that is neither a comment nor a --*: declaration.
  (b) An explicit /* tfx-tokens */ … /* /tfx-tokens */ region.

L1 waiver handling
──────────────────
TOK and COL controls are all L1.  An inline `tfx-waive TOK-…` or `tfx-waive COL-…`
comment does NOT suppress the violation; it downgrades the output line to:
  ERROR <file>:<line> [<CTL-ID>][waiver-claimed] <found> — verify approver in decision record
and still exits 1.  Decision-record lookup is out of scope; humans close that loop.

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <nearest token or scale value>
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

# ── Spacing scale (shadcn default, px) ────────────────────────────────────────
SPACING_SCALE_PX = {
    0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48,
    56, 64, 80, 96, 112, 128
}
# rem equivalents (16px base, rounded to 4 decimal places for float comparison)
SPACING_SCALE_REM = {round(px / 16, 4) for px in SPACING_SCALE_PX}

# ── Radius scale (shadcn default, px) ─────────────────────────────────────────
RADIUS_SCALE_PX = {0, 2, 4, 6, 8, 12, 16, 24, 9999}
RADIUS_SCALE_REM = {round(px / 16, 4) for px in RADIUS_SCALE_PX}

# ── Named colours that are suspicious as CSS values ───────────────────────────
NAMED_COLOUR_RE = re.compile(
    r"(?<!['\"\w-])(white|black|red|green|blue|gray|grey|orange|yellow|purple)(?!['\"\w-])",
    re.IGNORECASE
)

# ── Raw colour regexes ─────────────────────────────────────────────────────────
HEX_COLOUR_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b")
RGB_COLOUR_RE = re.compile(r"\brgba?\s*\(")
HSL_COLOUR_RE = re.compile(r"\bhsla?\s*\(")
OKLCH_COLOUR_RE = re.compile(r"\boklch\s*\(")

# ── Spacing properties ─────────────────────────────────────────────────────────
SPACING_PROP_RE = re.compile(
    r"\b(margin(?:-(?:top|right|bottom|left|block|inline|block-start|block-end|"
    r"inline-start|inline-end))?|padding(?:-(?:top|right|bottom|left|block|inline|"
    r"block-start|block-end|inline-start|inline-end))?|gap|column-gap|row-gap|"
    r"top|left|right|bottom)\s*:",
    re.IGNORECASE
)

# ── Radius property ────────────────────────────────────────────────────────────
RADIUS_PROP_RE = re.compile(
    r"\bborder-radius(?:-(?:top-left|top-right|bottom-right|bottom-left|"
    r"start-start|start-end|end-end|end-start))?\s*:",
    re.IGNORECASE
)

# ── Tailwind palette bypass ────────────────────────────────────────────────────
TAILWIND_PALETTE_RE = re.compile(
    r'\b(bg|text|border)-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|'
    r'blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-(\d{1,3})\b'
)

# ── Arbitrary-value utility ────────────────────────────────────────────────────
# Matches bg-[…], text-[…], border-[…], ring-[…], fill-[…], stroke-[…],
# shadow-[…], from-[…], via-[…], to-[…], outline-[…], decoration-[…]
ARBITRARY_VALUE_RE = re.compile(
    r'(?:bg|text|border|ring|fill|stroke|shadow|from|via|to|outline|decoration)-\[([^\]]*)\]'
)

# Named colours that are raw (not inside var()) — for arbitrary value scanning
ARBIT_NAMED_COLOUR_RE = re.compile(
    r'(?<![\'"\w-])(white|black|red|green|blue|gray|grey|orange|yellow|purple)(?![\'"\w-])',
    re.IGNORECASE
)

# ── var() passthrough ──────────────────────────────────────────────────────────
VAR_RE = re.compile(r"var\s*\(--")

# ── Numeric value extractor ────────────────────────────────────────────────────
NUM_VAL_RE = re.compile(r"([\d.]+)\s*(px|rem)\b")

# ── Waiver marker ─────────────────────────────────────────────────────────────
WAIVER_RE = re.compile(r"tfx-waive\s+(TOK-\d+|COL-\d+)", re.IGNORECASE)

# ── Custom property declaration (token definition) ────────────────────────────
CUSTOM_PROP_RE = re.compile(r"^\s*--[\w-]+\s*:")

# ── tfx-tokens region markers ─────────────────────────────────────────────────
TFX_TOKENS_OPEN_RE = re.compile(r"/\*\s*tfx-tokens\s*\*/")
TFX_TOKENS_CLOSE_RE = re.compile(r"/\*\s*/tfx-tokens\s*\*/")


def collect_theme_color_names(css_paths, extra_names=None):
    """
    Scan CSS files for --color-<name>: declarations (Tailwind v4 @theme convention)
    and return a set of the <name> parts.  For example --color-amber-11 → 'amber-11',
    --color-tw-blue → 'tw-blue'.

    Also merges any names supplied via `extra_names` (a list of strings, e.g.
    from --allow CLI flag or a .allow file).
    """
    names = set()
    color_token_re = re.compile(r"--color-([\w-]+)\s*:")

    for path in css_paths:
        if not os.path.isfile(path):
            continue
        try:
            with open(path, encoding="utf-8", errors="replace") as fh:
                for line in fh:
                    m = color_token_re.search(line)
                    if m:
                        names.add(m.group(1))
        except OSError:
            pass

    if extra_names:
        for n in extra_names:
            n = n.strip()
            if n and not n.startswith("#"):
                names.add(n)

    return names


def load_allow_file(path):
    """Load a .allow file (one name per line, # comments).  Returns list of names."""
    names = []
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if line and not line.startswith("#"):
                    names.append(line)
    except OSError:
        pass
    return names


def nearest_spacing(value_px):
    """Return the nearest value in SPACING_SCALE_PX."""
    return min(SPACING_SCALE_PX, key=lambda s: abs(s - value_px))


def nearest_radius(value_px):
    """Return the nearest value in RADIUS_SCALE_PX."""
    return min(RADIUS_SCALE_PX, key=lambda r: abs(r - value_px))


def is_on_spacing_scale(num_str, unit):
    """Return True if the numeric value is on the spacing scale."""
    try:
        val = float(num_str)
    except ValueError:
        return True  # can't parse → don't flag
    if unit == "px":
        return round(val) in SPACING_SCALE_PX
    elif unit == "rem":
        return round(val, 4) in SPACING_SCALE_REM
    return True


def is_on_radius_scale(num_str, unit):
    """Return True if the numeric value is on the radius scale."""
    try:
        val = float(num_str)
    except ValueError:
        return True
    if unit == "px":
        return round(val) in RADIUS_SCALE_PX
    elif unit == "rem":
        return round(val, 4) in RADIUS_SCALE_REM
    return True


def parse_passes(value_fragment):
    """Return True if a CSS value fragment unconditionally passes (var/auto/0/pct/viewport)."""
    stripped = value_fragment.strip()
    if VAR_RE.search(stripped):
        return True
    if stripped in ("0", "auto", "none", "inherit", "initial", "unset", "revert"):
        return True
    if re.match(r"^0\s*(px|rem|em|%|vh|vw|vmin|vmax)?$", stripped):
        return True
    if "%" in stripped or "vh" in stripped or "vw" in stripped or "vmin" in stripped or "vmax" in stripped:
        return True
    return False


class StyleContextTracker:
    """
    Tracks whether the current line of a file is in a style context.

    Style contexts:
      - Entire .css files
      - <style>…</style> blocks in HTML/Vue/Svelte
      - style="…" attribute spans (single-line; multi-line not handled for now)
      - Tagged template literals: css`…`, styled.xxx`…`, createGlobalStyle`…`

    Also tracks token-definition blocks for exemption.
    """

    def __init__(self, file_ext):
        self.file_ext = file_ext
        self.in_style_tag = file_ext == ".css"
        self.in_template_literal = False
        self.in_tfx_tokens_region = False
        self.in_custom_prop_block = False

    def update(self, line):
        """Update state from the given raw line. Returns (in_style, in_token_def)."""
        # tfx-tokens region markers (can appear anywhere in file)
        if TFX_TOKENS_OPEN_RE.search(line):
            self.in_tfx_tokens_region = True
        if TFX_TOKENS_CLOSE_RE.search(line):
            self.in_tfx_tokens_region = False
            return (self.in_style_tag or self.in_template_literal, True)

        # HTML/Vue/Svelte: <style> tags
        if self.file_ext in (".html", ".vue", ".svelte"):
            if re.search(r"<style\b", line, re.IGNORECASE):
                self.in_style_tag = True
            if re.search(r"</style\s*>", line, re.IGNORECASE):
                self.in_style_tag = False
                return (False, False)

        # JS/TS/JSX/TSX: tagged template literals (css`...`, styled.x`...`)
        if self.file_ext in (".js", ".ts", ".jsx", ".tsx"):
            if re.search(r"\b(?:css|styled\.\w+|createGlobalStyle|injectGlobal)\s*`", line):
                self.in_template_literal = True
            if self.in_template_literal and "`" in line and not re.search(
                r"\b(?:css|styled\.\w+|createGlobalStyle|injectGlobal)\s*`", line
            ):
                # closing backtick ends the template literal
                # (simplified: treats the line with the closing ` as still in context)
                pass
            if self.in_template_literal and line.strip() == "`":
                self.in_template_literal = False

        in_style = self.in_style_tag or self.in_template_literal

        # Token-definition block tracking (only meaningful inside style contexts)
        if in_style or self.file_ext == ".css":
            if CUSTOM_PROP_RE.match(line):
                self.in_custom_prop_block = True
            else:
                stripped = line.strip()
                # Allow blank lines and comment lines inside a custom-prop block
                if stripped and not stripped.startswith("/*") and not stripped.startswith("//") and stripped != "}":
                    # If not a custom property, close the block
                    if not CUSTOM_PROP_RE.match(line):
                        self.in_custom_prop_block = False

        in_token_def = self.in_tfx_tokens_region or self.in_custom_prop_block
        return (in_style, in_token_def)


def extract_waived_ctl(line):
    """Return the control id from a tfx-waive marker, or None."""
    m = WAIVER_RE.search(line)
    if m:
        return m.group(1).upper()
    return None




def check_file(filepath, theme_names=None):
    """
    Scan a single file and return a list of error strings.
    Each string is formatted: ERROR <file>:<line> [CTL-ID] <found> — suggest: <...>

    theme_names: set of colour names licensed by the project's @theme (from
    collect_theme_color_names).  Tailwind palette utilities whose name is in this
    set are NOT flagged as COL-2 bypasses.
    """
    if theme_names is None:
        theme_names = set()
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
    ctx = StyleContextTracker(ext)
    in_block_comment = False  # tracks multi-line /* ... */ comments

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")
        in_style, in_token_def = ctx.update(line)

        # Detect inline-style attribute for HTML (single line only)
        has_inline_style_attr = bool(re.search(r'\bstyle\s*=\s*["\']', line))
        effective_style = in_style or (ext in (".html", ".vue", ".svelte") and has_inline_style_attr)

        # Detect waiver claim on this line (before comment stripping, so inline
        # waiver markers can appear in comments)
        waived_ctl = extract_waived_ctl(line)

        def emit(ctl_id, found, suggest):
            """Emit one violation line (or waiver-claimed line)."""
            if waived_ctl and waived_ctl == ctl_id:
                errors.append(
                    f"ERROR {rel}:{lineno} [{ctl_id}][waiver-claimed] {found}"
                    f" — verify approver in decision record"
                )
            else:
                errors.append(checklib.emit_error(rel, lineno, ctl_id, found, suggest))

        # ── Skip token-definition blocks ──────────────────────────────────────
        if in_token_def:
            continue

        # ── Build scan_line: strip comments so comment text is not flagged ────
        # Handle multi-line /* ... */ block comments.
        # Strategy: process the raw line character-by-character to remove spans
        # that are inside block comments.
        scan_line = checklib.strip_block_comments(line, in_block_comment)
        # Update block comment state for next line
        in_block_comment = checklib.ends_in_block_comment(line, in_block_comment)

        # Strip HTML comments (<!-- ... -->) from the scan line
        scan_line = re.sub(r"<!--.*?-->", "", scan_line)
        # Strip single-line // comments from JS/TS contexts
        if ext in (".js", ".ts", ".jsx", ".tsx"):
            scan_line = re.sub(r"//.*$", "", scan_line)

        # ── TOK-1 / COL-1 / COL-2 : raw colour checks (style contexts only) ──
        if effective_style:
            # Hex colours
            for m in HEX_COLOUR_RE.finditer(scan_line):
                emit("TOK-1", f"raw colour {m.group()}", "use a semantic token (var(--color-…))")

            # rgb/rgba
            for m in RGB_COLOUR_RE.finditer(scan_line):
                emit("TOK-1", f"raw colour {m.group().strip()}…", "use a semantic token (var(--color-…))")

            # hsl/hsla
            for m in HSL_COLOUR_RE.finditer(scan_line):
                emit("TOK-1", f"raw colour {m.group().strip()}…", "use a semantic token (var(--color-…))")

            # oklch
            for m in OKLCH_COLOUR_RE.finditer(scan_line):
                emit("TOK-1", f"raw colour {m.group().strip()}…", "use a semantic token (var(--color-…))")

            # Named colours as CSS property values
            # Must appear as a value (after a colon) or in a style attribute value
            # Look for pattern: property: ... named-colour ...
            named_col_ctx = re.sub(r"var\([^)]*\)", "", scan_line)  # strip var() refs
            named_col_ctx = re.sub(r"url\([^)]*\)", "", named_col_ctx)  # strip url()
            named_col_ctx = re.sub(r'"[^"]*"', '""', named_col_ctx)  # strip quoted strings
            named_col_ctx = re.sub(r"'[^']*'", "''", named_col_ctx)
            if re.search(r":\s*[^;{]*\b(?:white|black|red|green|blue|gray|grey|orange|yellow|purple)\b", named_col_ctx, re.IGNORECASE):
                for m in NAMED_COLOUR_RE.finditer(named_col_ctx):
                    # Make sure it's in a value context (preceded by a colon somewhere on the line)
                    before = named_col_ctx[:m.start()]
                    if ":" in before:
                        emit("TOK-1", f"named colour '{m.group()}'", "use a semantic token (var(--color-…))")

        # ── Tailwind palette bypass (all file types — applies in class= attributes and JSX) ──
        for m in TAILWIND_PALETTE_RE.finditer(scan_line):
            colour_name = m.group(2)  # e.g. 'amber', 'red'
            step = m.group(3)         # e.g. '11', '500'
            name_with_step = f"{colour_name}-{step}"  # e.g. 'amber-11'
            # Skip if either the bare name or name+step is a project-defined theme colour
            if colour_name in theme_names or name_with_step in theme_names:
                continue
            emit("COL-2", f"Tailwind palette class '{m.group()}'", "use a semantic token class (e.g. bg-primary, text-destructive)")

        # ── TOK-1 : raw colour inside arbitrary-value utilities (all file types) ──
        # e.g. bg-[color-mix(in oklab, var(--tw-blue) 88%, black)] — flags 'black'
        for arb_m in ARBITRARY_VALUE_RE.finditer(scan_line):
            inner = arb_m.group(1)
            # Skip if the bracket content is purely a var() reference
            # (e.g. bg-[var(--surface)] is fine)
            inner_no_var = re.sub(r"var\s*\(--[^)]*\)", "", inner)
            # Check for hex colours
            for m in HEX_COLOUR_RE.finditer(inner_no_var):
                emit("TOK-1", f"raw colour '{m.group()}' in arbitrary value",
                     "define it as a token and reference var(--…)")
            # Check for rgb/rgba
            for m in RGB_COLOUR_RE.finditer(inner_no_var):
                emit("TOK-1", f"raw colour '{m.group().strip()}…' in arbitrary value",
                     "define it as a token and reference var(--…)")
            # Check for hsl/hsla
            for m in HSL_COLOUR_RE.finditer(inner_no_var):
                emit("TOK-1", f"raw colour '{m.group().strip()}…' in arbitrary value",
                     "define it as a token and reference var(--…)")
            # Check for oklch
            for m in OKLCH_COLOUR_RE.finditer(inner_no_var):
                emit("TOK-1", f"raw colour '{m.group().strip()}…' in arbitrary value",
                     "define it as a token and reference var(--…)")
            # Check for standalone named colours (white, black, red, etc.)
            # Strip any var() refs from context first
            for m in ARBIT_NAMED_COLOUR_RE.finditer(inner_no_var):
                emit("TOK-1", f"raw colour '{m.group()}' in arbitrary value",
                     "define it as a token and reference var(--…)")

        # ── TOK-2 : spacing checks (style contexts only) ──────────────────────
        if effective_style:
            for prop_m in SPACING_PROP_RE.finditer(scan_line):
                # Extract the value portion after the colon
                value_start = prop_m.end()
                # Get rest of line up to ; or { or end
                rest = scan_line[value_start:]
                val_match = re.match(r"([^;{}]+)", rest)
                if not val_match:
                    continue
                value_str = val_match.group(1).strip()

                if parse_passes(value_str):
                    continue

                # Shorthand: split by spaces and check each token
                # e.g. "12px 24px" → check both
                # Remove calc() expressions
                value_str_clean = re.sub(r"calc\([^)]*\)", "0px", value_str)
                value_str_clean = re.sub(r"var\(--[^)]*\)", "0px", value_str_clean)

                parts = value_str_clean.split()
                for part in parts:
                    num_m = NUM_VAL_RE.match(part.strip())
                    if not num_m:
                        continue
                    num, unit = num_m.group(1), num_m.group(2)
                    try:
                        val_f = float(num)
                    except ValueError:
                        continue
                    if unit == "px":
                        val_px = round(val_f)
                        if val_px == 0:
                            continue
                        if val_px not in SPACING_SCALE_PX:
                            suggest_px = nearest_spacing(val_px)
                            emit("TOK-2", f"off-scale spacing {part}", f"{suggest_px}px or var(--space-…)")
                    elif unit == "rem":
                        val_px_equiv = round(val_f * 16)
                        if val_px_equiv == 0:
                            continue
                        if val_px_equiv not in SPACING_SCALE_PX:
                            suggest_px = nearest_spacing(val_px_equiv)
                            emit("TOK-2", f"off-scale spacing {part}", f"{suggest_px}px ({round(suggest_px/16,4)}rem) or var(--space-…)")

        # ── TOK-3 : border-radius checks (style contexts only) ────────────────
        if effective_style:
            for prop_m in RADIUS_PROP_RE.finditer(scan_line):
                value_start = prop_m.end()
                rest = scan_line[value_start:]
                val_match = re.match(r"([^;{}]+)", rest)
                if not val_match:
                    continue
                value_str = val_match.group(1).strip()

                if parse_passes(value_str):
                    continue

                value_str_clean = re.sub(r"calc\([^)]*\)", "0px", value_str)
                value_str_clean = re.sub(r"var\(--[^)]*\)", "0px", value_str_clean)

                # border-radius shorthand can have / for horizontal/vertical
                value_str_clean = value_str_clean.replace("/", " ")
                parts = value_str_clean.split()
                for part in parts:
                    num_m = NUM_VAL_RE.match(part.strip())
                    if not num_m:
                        continue
                    num, unit = num_m.group(1), num_m.group(2)
                    try:
                        val_f = float(num)
                    except ValueError:
                        continue
                    if unit == "px":
                        val_px = round(val_f)
                        if val_px == 0:
                            continue
                        if val_px not in RADIUS_SCALE_PX:
                            suggest_px = nearest_radius(val_px)
                            emit("TOK-3", f"off-scale radius {part}", f"{suggest_px}px or var(--radius-…)")
                    elif unit == "rem":
                        val_px_equiv = round(val_f * 16)
                        if val_px_equiv == 0:
                            continue
                        if val_px_equiv not in RADIUS_SCALE_PX:
                            suggest_px = nearest_radius(val_px_equiv)
                            emit("TOK-3", f"off-scale radius {part}", f"{suggest_px}px ({round(suggest_px/16,4)}rem) or var(--radius-…)")

    return errors


def scan_paths(paths, theme_names=None):
    """Walk the given paths (files or directories) and collect all violations."""
    if theme_names is None:
        theme_names = set()
    all_errors = []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            print(f"ERROR token-audit: path not found: {val}")
            all_errors.append(f"ERROR token-audit: path not found: {val}")
        else:
            all_errors.extend(check_file(val, theme_names))
    return all_errors


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    """
    Embedded self-test cases.  Prints SELF-TEST OK (N cases) and exits 0 on success,
    or prints failures and exits 1.
    """
    import tempfile

    failures = []
    case_count = 0

    def assert_violations(name, content, ext, expected_ctl_ids, expect_waiver_claimed=False):
        nonlocal case_count
        case_count += 1
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            errs = check_file(tf.name)
        os.unlink(tf.name)

        found_ctls = []
        for e in errs:
            # Extract [CTL-ID] or [CTL-ID][waiver-claimed]
            m = re.search(r"\[([A-Z0-9-]+)\](?:\[waiver-claimed\])?", e)
            if m:
                found_ctls.append(m.group(1))

        if expect_waiver_claimed:
            waiver_lines = [e for e in errs if "[waiver-claimed]" in e]
            if not waiver_lines:
                failures.append(f"FAIL {name}: expected waiver-claimed marker but got: {errs}")
            # Should still produce errors (exit 1 equivalent)
            if not errs:
                failures.append(f"FAIL {name}: expected errors with waiver-claimed but got none")
            return

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

    # ── Case 1: raw hex colour caught (TOK-1) ──────────────────────────────────
    assert_violations(
        "raw hex colour",
        ".foo { color: #ff0000; }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 2: rgb() caught (TOK-1) ───────────────────────────────────────────
    assert_violations(
        "rgb() colour",
        ".foo { background: rgb(255, 0, 0); }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 3: named colour caught (TOK-1) ────────────────────────────────────
    assert_violations(
        "named colour",
        ".foo { color: red; }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 4: token-block exemption holds — var() in :root is NOT flagged ────
    assert_clean(
        "token block exemption (custom property definitions)",
        ":root {\n  --color-brand: #0064FF;\n  --color-bg: #FFFFFF;\n}\n.foo { color: var(--color-brand); }\n",
        ".css"
    )

    # ── Case 5: off-scale spacing caught (TOK-2) ───────────────────────────────
    assert_violations(
        "off-scale spacing",
        ".foo { margin: 15px; }",
        ".css",
        ["TOK-2"]
    )

    # ── Case 6: on-scale spacing passes ────────────────────────────────────────
    assert_clean(
        "on-scale spacing",
        ".foo { margin: 16px; padding: 8px; gap: 24px; }",
        ".css"
    )

    # ── Case 7: off-scale radius caught (TOK-3) ────────────────────────────────
    assert_violations(
        "off-scale radius",
        ".foo { border-radius: 10px; }",
        ".css",
        ["TOK-3"]
    )

    # ── Case 8: on-scale radius passes ─────────────────────────────────────────
    assert_clean(
        "on-scale radius",
        ".foo { border-radius: 8px; }",
        ".css"
    )

    # ── Case 9: Tailwind palette class caught (COL-2) ──────────────────────────
    assert_violations(
        "tailwind palette class",
        '<button class="btn bg-red-500 text-white">Delete</button>',
        ".html",
        ["COL-2"]
    )

    # ── Case 10: waiver-claimed marker appears and still exits 1 ───────────────
    assert_violations(
        "waiver-claimed still errors",
        "/* tfx-waive TOK-1 reason=\"approved\" */ .foo { color: #ff0000; }",
        ".css",
        ["TOK-1"],
        expect_waiver_claimed=True
    )

    # ── Case 11: var() spacing passes ──────────────────────────────────────────
    assert_clean(
        "var() spacing passes",
        ".foo { margin: var(--space-4); padding: var(--spacing); }",
        ".css"
    )

    # ── Case 12: var() radius passes ───────────────────────────────────────────
    assert_clean(
        "var() radius passes",
        ".foo { border-radius: var(--radius-md); }",
        ".css"
    )

    # ── Case 13: tfx-tokens region exempt ──────────────────────────────────────
    assert_clean(
        "tfx-tokens region exemption",
        "/* tfx-tokens */\n.root { --c: #ff0000; }\n/* /tfx-tokens */\n.foo { color: var(--c); }\n",
        ".css"
    )

    # ── Case 14: hsl() caught (TOK-1) ─────────────────────────────────────────
    assert_violations(
        "hsl() colour",
        ".foo { background: hsl(200, 100%, 50%); }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 15: oklch() caught (TOK-1) ───────────────────────────────────────
    assert_violations(
        "oklch() colour",
        ".foo { color: oklch(0.7 0.15 200); }",
        ".css",
        ["TOK-1"]
    )

    # ── Case 16: non-style context — hex in HTML text not flagged ─────────────
    assert_clean(
        "hex in non-style context (HTML text)",
        "<p>The colour code #ff0000 is red.</p>",
        ".html"
    )

    # ── Case 17: inline style attribute catches hex ────────────────────────────
    assert_violations(
        "inline style attribute",
        '<div style="color: #ff0000;">text</div>',
        ".html",
        ["TOK-1"]
    )

    # ── Case 18: zero value passes spacing check ───────────────────────────────
    assert_clean(
        "zero spacing passes",
        ".foo { margin: 0; padding: 0px; }",
        ".css"
    )

    # ── Case 19: theme-defined palette name passes COL-2 ──────────────────────
    # When --color-amber-11 is defined in scanned CSS, text-amber-11 is not a bypass.
    case_count += 1
    with tempfile.NamedTemporaryFile(suffix=".tsx", mode="w", delete=False, encoding="utf-8") as tf:
        tf.write('<p className="text-amber-11">hello</p>')
        tf.flush()
        errs = check_file(tf.name, theme_names={"amber-11"})
    os.unlink(tf.name)
    if errs:
        failures.append(f"FAIL theme-defined name passes: expected no COL-2 — got: {errs}")

    # ── Case 20: undefined palette class still fails COL-2 ────────────────────
    case_count += 1
    with tempfile.NamedTemporaryFile(suffix=".tsx", mode="w", delete=False, encoding="utf-8") as tf:
        tf.write('<p className="text-amber-11">hello</p>')
        tf.flush()
        errs = check_file(tf.name, theme_names=set())  # empty allowlist
    os.unlink(tf.name)
    col2s = [e for e in errs if "[COL-2]" in e]
    if not col2s:
        failures.append(f"FAIL undefined palette fails: expected COL-2 — got: {errs}")

    # ── Case 21: single-digit undefined step now caught (digit fix) ───────────
    case_count += 1
    with tempfile.NamedTemporaryFile(suffix=".tsx", mode="w", delete=False, encoding="utf-8") as tf:
        tf.write('<p className="text-amber-3">hello</p>')
        tf.flush()
        errs = check_file(tf.name, theme_names=set())
    os.unlink(tf.name)
    col2s = [e for e in errs if "[COL-2]" in e]
    if not col2s:
        failures.append(f"FAIL single-digit step: expected COL-2 for text-amber-3 — got: {errs}")

    # ── Case 22: raw colour inside arbitrary value fails (TOK-1) ──────────────
    case_count += 1
    with tempfile.NamedTemporaryFile(suffix=".tsx", mode="w", delete=False, encoding="utf-8") as tf:
        tf.write('className="hover:bg-[color-mix(in_oklab,var(--tw-blue)_88%,black)]"')
        tf.flush()
        errs = check_file(tf.name, theme_names=set())
    os.unlink(tf.name)
    tok1s = [e for e in errs if "[TOK-1]" in e]
    if not tok1s:
        failures.append(f"FAIL arbitrary value raw colour: expected TOK-1 for black in color-mix — got: {errs}")

    # ── Case 23: var() in arbitrary value passes ───────────────────────────────
    case_count += 1
    with tempfile.NamedTemporaryFile(suffix=".tsx", mode="w", delete=False, encoding="utf-8") as tf:
        tf.write('className="bg-[var(--surface)]"')
        tf.flush()
        errs = check_file(tf.name, theme_names=set())
    os.unlink(tf.name)
    if errs:
        failures.append(f"FAIL var() in arbitrary value: expected clean — got: {errs}")

    # ── Fixtures ───────────────────────────────────────────────────────────────
    fixtures_dir = os.path.join(_CHECKS_DIR, "fixtures", "token-audit")
    theme_names_by_fixture = {"pass-theme-defined.tsx": {"amber-11", "lime-3"}}
    for fname in sorted(os.listdir(fixtures_dir)):
        case_count += 1
        fpath = os.path.join(fixtures_dir, fname)
        errs = check_file(fpath, theme_names_by_fixture.get(fname, set()))
        if "fail" in fname and not errs:
            failures.append(f"FAIL fixture {fname}: expected >=1 ERROR — got none")
        elif "pass" in fname and errs:
            failures.append(f"FAIL fixture {fname}: expected 0 ERRORs — got: {errs}")

    # ── Report ─────────────────────────────────────────────────────────────────
    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    if not args:
        print("Usage: python3 checks/token-audit.py [--allow name1,name2,...] <path>... | --self-test")
        sys.exit(1)

    if "--self-test" in args:
        run_self_test()
        return  # run_self_test calls sys.exit

    # Parse --allow <name1,name2,...> flag
    extra_allow = []
    filtered_args = []
    i = 0
    while i < len(args):
        if args[i] == "--allow" and i + 1 < len(args):
            extra_allow.extend([n.strip() for n in args[i + 1].split(",") if n.strip()])
            i += 2
        else:
            filtered_args.append(args[i])
            i += 1

    # Load .allow file if present alongside the script
    allow_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "token-audit.allow")
    extra_allow.extend(load_allow_file(allow_file))

    # Build theme allowlist from scanned CSS files + extras
    css_paths = [p for p in filtered_args if os.path.splitext(p)[1].lower() == ".css"]
    theme_names = collect_theme_color_names(css_paths, extra_allow)

    errors = scan_paths(filtered_args, theme_names)

    if errors:
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
