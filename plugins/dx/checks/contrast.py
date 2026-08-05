#!/usr/bin/env python3
"""
Static contrast scan — checks/contrast.py
Computes WCAG 2.1 text-contrast ratios (A11Y-1) for the subset that IS
statically resolvable: a foreground and a background colour set together on the
same class string or CSS rule, where both resolve to known token colours. A
sub-AA pair is flagged before render.

This is a STATIC SUBSET of A11Y-1, exactly as a11y-static.py is a subset of
A11Y-2/3/8. It does not replace the manual contrast pass or a real axe/headless
run — it closes the part of the gap that needs no rendered DOM.

How colours resolve
────────────────────
A token map is built from a CSS file given by --tokens <file> (product-specific;
for this repo's own site, ../app/globals.css from harness/). It resolves:
  - direct hex (#rgb / #rrggbb) and the keywords white / black,
  - var(--other) chains (transitively, with cycle protection),
  - color-mix(in oklab, var(--a) <p>%, <b>) — mixed in OKLab per the CSS spec
    (https://bottosson.github.io/posts/oklab/),
  - @theme inline aliases (--color-foo: var(--bar)) so a Tailwind text-foo /
    bg-foo utility resolves through to --bar's colour.
An unresolved token stays None and is reported via the NOTE channel — never
guessed, never silently passed.

What counts as a contrast candidate
────────────────────────────────────
Line-local only (same philosophy as a11y-static): a candidate needs BOTH a
foreground and a background colour on the same line —
  - Tailwind: a class string with a text-<colour> AND a bg-<colour> (bare names
    that resolve to a token colour, or arbitrary values text-[#hex] / bg-[#hex] /
    text-[var(--t)] / bg-[var(--t)]),
  - CSS / inline style: a rule or style="…" with both color: and
    background[-color]: (hex or var(--token)).
Both resolve → ratio computed: <3.0 ERROR (fails even large text); 3.0–4.5 ERROR
noting it passes only as large text; ≥4.5 clean. One/both unresolved → NOTE
("could not resolve … — verify manually"), never an ERROR or a silent pass.

What this script does NOT verify
─────────────────────────────────
- Inherited or computed backgrounds. A rule/class that sets only a text colour
  (background inherited from a parent) is NOT a candidate — the check sees no
  background to compare against, so it is skipped, not flagged. This is the
  largest false-negative surface and it is the manual / axe pass's job.
- Font-size-dependent large-text classification. The 3.0–4.5 band is flagged
  conservatively with a "confirm the text size" note; the check does not infer
  font size line-locally.
- Non-text (UI component) contrast.
- Dynamic / computed class names (clsx, template literals) beyond an arbitrary
  value it can read — reported as NOTE, never passed.
- color-mix in any space other than oklab, and multi-line CSS rules.

Output
──────
ERROR <file>:<line> [A11Y-1] text <fg> on <bg> = <ratio>:1 (<band>) — suggest: <…>
NOTE  contrast: could not resolve <…> at <file>:<line> — verify manually
Exit 0 and print nothing (or SELF-TEST OK) on success or notes-only.
Exit 1 with ERROR lines on any real contrast violation.
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

# CSS colour keywords this check resolves (kept tiny on purpose).
CSS_KEYWORDS = {"white": "#ffffff", "black": "#000000", "transparent": None}


# ── Colour maths ────────────────────────────────────────────────────────────────

def _hex_to_rgb(value):
    """'#rgb' or '#rrggbb' → (r, g, b) ints 0-255, or None if not a hex colour."""
    if not value or not value.startswith("#"):
        return None
    h = value[1:]
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        return None
    try:
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    except ValueError:
        return None


def _srgb_to_linear(c):
    """sRGB channel [0,1] → linear-light, WCAG transfer (0.03928 break)."""
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(rgb):
    r, g, b = (c / 255.0 for c in rgb)
    return (0.2126 * _srgb_to_linear(r)
            + 0.7152 * _srgb_to_linear(g)
            + 0.0722 * _srgb_to_linear(b))


def contrast_ratio(rgb_a, rgb_b):
    la, lb = relative_luminance(rgb_a), relative_luminance(rgb_b)
    lo, hi = sorted((la, lb))
    return (hi + 0.05) / (lo + 0.05)


# ── OKLab (for color-mix) ────────────────────────────────────────────────────────
# sRGB ⇄ OKLab per https://bottosson.github.io/posts/oklab/

def _srgb_to_linear_std(c):
    """Standard sRGB transfer (0.04045 break) — used for OKLab, not luminance."""
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _linear_to_srgb_std(c):
    c = max(0.0, min(1.0, c))
    return c * 12.92 if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055


def _rgb_to_oklab(rgb):
    r, g, b = (_srgb_to_linear_std(c / 255.0) for c in rgb)
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = (v ** (1 / 3) if v >= 0 else -((-v) ** (1 / 3)) for v in (l, m, s))
    return (
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    )


def _oklab_to_rgb(lab):
    L, a, b = lab
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = (v ** 3 for v in (l_, m_, s_))
    r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
    return tuple(round(_linear_to_srgb_std(c) * 255) for c in (r, g, bb))


def _mix_oklab(rgb_a, rgb_b, weight_a):
    """color-mix(in oklab, A weight_a, B) — weight_a in [0,1] applies to A."""
    la = _rgb_to_oklab(rgb_a)
    lb = _rgb_to_oklab(rgb_b)
    mixed = tuple(weight_a * x + (1 - weight_a) * y for x, y in zip(la, lb))
    return _oklab_to_rgb(mixed)


# ── Token resolver ───────────────────────────────────────────────────────────────

_DECL_RE = re.compile(r"(--[\w-]+)\s*:\s*([^;]+);")
_VAR_RE = re.compile(r"var\(\s*(--[\w-]+)\s*\)")
_COLORMIX_RE = re.compile(
    r"color-mix\(\s*in\s+oklab\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+)\)",
    re.IGNORECASE,
)


class TokenResolver:
    """Resolves --token / Tailwind-utility names to (r,g,b) from a CSS file."""

    def __init__(self, css_text=""):
        self.raw = {}        # --name -> raw value string
        self._cache = {}     # --name -> rgb or None
        if css_text:
            for name, value in _DECL_RE.findall(css_text):
                self.raw[name] = value.strip()

    def resolve(self, name, _seen=None):
        """--name → (r,g,b) or None. Cycle-safe."""
        if name in self._cache:
            return self._cache[name]
        if _seen is None:
            _seen = set()
        if name in _seen or name not in self.raw:
            return None
        _seen.add(name)
        rgb = self._resolve_value(self.raw[name], _seen)
        if not _seen - {name}:  # only memoise top-level (no partial chains)
            self._cache[name] = rgb
        return rgb

    def _resolve_value(self, value, _seen):
        value = value.strip()
        # var(--x)
        m = _VAR_RE.fullmatch(value)
        if m:
            return self.resolve(m.group(1), _seen)
        # color-mix(in oklab, A p%, B)
        cm = _COLORMIX_RE.search(value)
        if cm:
            a = self._resolve_value(cm.group(1).strip(), set(_seen))
            pct = float(cm.group(2))
            b = self._resolve_value(cm.group(3).strip(), set(_seen))
            if a is None or b is None:
                return None
            return _mix_oklab(a, b, pct / 100.0)
        # keyword
        low = value.lower()
        if low in CSS_KEYWORDS:
            kw = CSS_KEYWORDS[low]
            return _hex_to_rgb(kw) if kw else None
        # hex
        return _hex_to_rgb(value)

    def resolve_utility(self, token):
        """A Tailwind colour name (e.g. 'foreground', 'tw-blue') → (r,g,b)/None.
        Prefers the @theme alias --color-<token>, falls back to --<token>."""
        for cand in (f"--color-{token}", f"--{token}"):
            if cand in self.raw:
                rgb = self.resolve(cand)
                if rgb is not None:
                    return rgb
        return None

    def resolve_colour_expr(self, expr):
        """A CSS colour expression: #hex, var(--t), or keyword → (r,g,b)/None."""
        expr = expr.strip()
        m = _VAR_RE.search(expr)
        if m:
            return self.resolve(m.group(1))
        low = expr.lower()
        if low in CSS_KEYWORDS:
            kw = CSS_KEYWORDS[low]
            return _hex_to_rgb(kw) if kw else None
        return _hex_to_rgb(expr)


# ── Pairing detection ─────────────────────────────────────────────────────────────

# Tailwind utilities. Arbitrary values keep the brackets so we can tell
# "clearly a colour but unresolved" (→ NOTE) from "not a colour utility" (skip).
_TW_TEXT_RE = re.compile(r"\btext-(\[[^\]]+\]|[\w-]+)")
_TW_BG_RE = re.compile(r"\bbg-(\[[^\]]+\]|[\w-]+)")
# CSS / inline declarations
_CSS_COLOR_RE = re.compile(r"(?<!-)\bcolor\s*:\s*([^;}{]+)")
_CSS_BG_RE = re.compile(r"\bbackground(?:-color)?\s*:\s*([^;}{]+)")

_NON_COLOUR_TEXT = {  # common text-* utilities that are not colours
    "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl",
    "8xl", "9xl", "left", "center", "right", "justify", "start", "end", "wrap",
    "nowrap", "balance", "pretty", "ellipsis", "clip", "transparent", "current",
}
# Keywords that are not a concrete colour — no contrast comparison is possible,
# so a pair involving one is skipped silently (not a NOTE, not an ERROR).
_NON_CONCRETE = {"inherit", "none", "transparent", "currentcolor", "unset",
                 "initial", "revert", "auto"}
_COLOUR_FUNC_RE = re.compile(r"^(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\s*\(",
                             re.IGNORECASE)


def _looks_like_colour(expr):
    """A best-effort 'is this CSS value a concrete colour?' for arbitrary values.
    Lengths (14px, 1.5rem) and other non-colour utilities return False so they
    are not mistaken for unresolved colours."""
    s = expr.strip()
    if not s or s.lower() in _NON_CONCRETE:
        return False
    if s.startswith("#") or "var(" in s or _COLOUR_FUNC_RE.match(s):
        return True
    return s.lower() in CSS_KEYWORDS


def _classify_tw_value(raw, resolver):
    """raw is the captured group after text-/bg-. Returns
    ('colour', rgb) | ('unresolved', label) | None (not a colour utility)."""
    if raw.startswith("["):
        inner = raw[1:-1]
        if not _looks_like_colour(inner):
            return None  # arbitrary length / position / image — not a colour
        rgb = resolver.resolve_colour_expr(inner)
        if rgb is not None:
            return ("colour", rgb)
        return ("unresolved", f"arbitrary value {raw}")
    if raw in _NON_COLOUR_TEXT:
        return None
    rgb = resolver.resolve_utility(raw)
    if rgb is not None:
        return ("colour", rgb)
    return None  # bare name that is not a known colour token — not a candidate


def _fmt_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def _band(ratio):
    """Returns (is_error, band_text) for a computed ratio."""
    if ratio < 3.0:
        return True, "below 4.5:1"
    if ratio < 4.5:
        return True, ("passes only as large text ≥24px / 18.66px bold — "
                      "confirm the text size")
    return False, "clears 4.5:1"


def _verdict_line(rel, lineno, fg_rgb, bg_rgb):
    """Returns an ERROR string if the pair fails AA, else None."""
    ratio = contrast_ratio(fg_rgb, bg_rgb)
    is_error, band = _band(ratio)
    if not is_error:
        return None
    return checklib.emit_error(
        rel, lineno, "A11Y-1",
        f"text {_fmt_hex(fg_rgb)} on {_fmt_hex(bg_rgb)} = {ratio:.2f}:1 ({band})",
        "use a higher-contrast token (e.g. Radix step-12 for small text)")


def _check_line(scan_line, rel, lineno, resolver):
    """Returns a list of ERROR/NOTE strings for one line."""
    out = []

    # ── Tailwind class-string pairing ─────────────────────────────────────────
    tm = _TW_TEXT_RE.search(scan_line)
    bm = _TW_BG_RE.search(scan_line)
    if tm and bm:
        fg = _classify_tw_value(tm.group(1), resolver)
        bg = _classify_tw_value(bm.group(1), resolver)
        if fg and bg:
            if fg[0] == "colour" and bg[0] == "colour":
                err = _verdict_line(rel, lineno, fg[1], bg[1])
                if err:
                    out.append(err)
            elif "unresolved" in (fg[0], bg[0]):
                bad = [x[1] for x in (fg, bg) if x[0] == "unresolved"]
                out.append(f"NOTE  contrast: could not resolve {', '.join(bad)} "
                           f"at {rel}:{lineno} — verify manually")

    # ── CSS / inline-style pairing ────────────────────────────────────────────
    cm = _CSS_COLOR_RE.search(scan_line)
    bgm = _CSS_BG_RE.search(scan_line)
    if cm and bgm:
        fg_expr, bg_expr = cm.group(1).strip(), bgm.group(1).strip()
        # A non-concrete keyword (inherit/none/…) means no colour is set here →
        # not a contrast candidate, skip silently.
        if fg_expr.lower() in _NON_CONCRETE or bg_expr.lower() in _NON_CONCRETE:
            return out
        fg_rgb = resolver.resolve_colour_expr(fg_expr)
        bg_rgb = resolver.resolve_colour_expr(bg_expr)
        if fg_rgb is not None and bg_rgb is not None:
            err = _verdict_line(rel, lineno, fg_rgb, bg_rgb)
            if err:
                out.append(err)
        else:
            unresolved = []
            if fg_rgb is None:
                unresolved.append(f"color: {cm.group(1).strip()}")
            if bg_rgb is None:
                unresolved.append(f"background: {bgm.group(1).strip()}")
            out.append(f"NOTE  contrast: could not resolve {', '.join(unresolved)} "
                       f"at {rel}:{lineno} — verify manually")
    return out


def check_file(filepath, resolver):
    """Scan a single file; return a list of ERROR/NOTE strings."""
    out = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return out
    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except OSError as exc:
        return [f"ERROR {filepath}: cannot read file — {exc}"]

    rel = os.path.relpath(filepath)
    in_block_comment = False
    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")
        scan_line = checklib.strip_block_comments(line, in_block_comment)
        in_block_comment = checklib.ends_in_block_comment(line, in_block_comment)
        scan_line = re.sub(r"<!--.*?-->", "", scan_line)
        if ext in (".js", ".ts", ".jsx", ".tsx"):
            scan_line = re.sub(r"//.*$", "", scan_line)
        out.extend(_check_line(scan_line, rel, lineno, resolver))
    return out


def scan_paths(paths, resolver):
    all_out = []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            all_out.append(f"ERROR contrast: path not found: {val}")
        else:
            all_out.extend(check_file(val, resolver))
    return all_out


# ── Self-test ──────────────────────────────────────────────────────────────────

# A small token set mirroring app/globals.css (the real fixture source).
_SELF_TEST_TOKENS = """
:root {
  --surface: #ffffff;
  --foreground: #18181b;
  --tw-blue: #0064ff;
  --tw-blue-hover: color-mix(in oklab, var(--tw-blue) 88%, black);
  --success-9: #46a758;
  --success: #2a7e3b;
  --success-subtle: color-mix(in oklab, var(--success-9) 8%, var(--surface));
}
@theme inline {
  --color-surface: var(--surface);
  --color-foreground: var(--foreground);
  --color-tw-blue: var(--tw-blue);
  --color-success: var(--success);
  --color-success-subtle: var(--success-subtle);
}
"""


def run_self_test():
    import tempfile

    failures = []
    case_count = 0
    resolver = TokenResolver(_SELF_TEST_TOKENS)

    def _run(content, ext):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False,
                                         encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            name = tf.name
        try:
            return check_file(name, resolver)
        finally:
            os.unlink(name)

    def _split(out):
        return ([o for o in out if o.startswith("ERROR")],
                [o for o in out if o.startswith("NOTE")])

    def assert_violations(name, content, ext, expected_ctl_ids):
        nonlocal case_count
        case_count += 1
        errs, _ = _split(_run(content, ext))
        found = []
        for e in errs:
            m = re.search(r"\[([A-Z0-9-]+)\]", e)
            if m:
                found.append(m.group(1))
        for ctl in expected_ctl_ids:
            if ctl not in found:
                failures.append(f"FAIL {name}: expected [{ctl}] — got: {errs}")

    def assert_clean(name, content, ext):
        nonlocal case_count
        case_count += 1
        errs, notes = _split(_run(content, ext))
        if errs or notes:
            failures.append(f"FAIL {name}: expected clean — got: {errs + notes}")

    def assert_note(name, content, ext):
        nonlocal case_count
        case_count += 1
        errs, notes = _split(_run(content, ext))
        if errs:
            failures.append(f"FAIL {name}: expected NOTE not ERROR — got: {errs}")
        if not notes:
            failures.append(f"FAIL {name}: expected a NOTE — got none")

    def assert_ratio(name, fg_hex, bg_hex, expected, tol=0.1):
        nonlocal case_count
        case_count += 1
        got = contrast_ratio(_hex_to_rgb(fg_hex), _hex_to_rgb(bg_hex))
        if abs(got - expected) > tol:
            failures.append(f"FAIL {name}: ratio {got:.3f} vs expected {expected} "
                            f"(tol {tol})")

    def assert_resolves(name, token, expected_hex, tol=4):
        nonlocal case_count
        case_count += 1
        rgb = resolver.resolve(token)
        if rgb is None:
            failures.append(f"FAIL {name}: {token} did not resolve")
            return
        exp = _hex_to_rgb(expected_hex)
        if any(abs(a - b) > tol for a, b in zip(rgb, exp)):
            failures.append(f"FAIL {name}: {token} → {_fmt_hex(rgb)} "
                            f"vs ~{expected_hex}")

    # ── ratio maths ────────────────────────────────────────────────────────────
    assert_ratio("avatar fail #18181b on #0064ff", "#18181b", "#0064ff", 3.60)
    assert_ratio("known-good #ffffff on #18181b", "#ffffff", "#18181b", 17.7, tol=0.2)

    # ── token resolution (incl. color-mix in oklab) ─────────────────────────────
    assert_resolves("surface keyword", "--surface", "#ffffff")
    assert_resolves("tw-blue direct", "--tw-blue", "#0064ff")
    # success-subtle = 8% grass-9 on white → a very light green tint
    assert_resolves("success-subtle color-mix", "--success-subtle", "#f1f7f1", tol=6)

    # ── Tailwind pairings ───────────────────────────────────────────────────────
    # The avatar fail (triggering bug): text-foreground on bg-tw-blue → ≈3.60
    assert_violations(
        "avatar: text-foreground on bg-tw-blue",
        '<AvatarFallback className="bg-tw-blue text-foreground">JS</AvatarFallback>',
        ".tsx", ["A11Y-1"],
    )
    # Unambiguous known-good: white on near-black surface inverse → clean
    assert_clean(
        "clean: text-surface on bg-foreground",
        '<div className="bg-foreground text-surface px-2">Tag</div>',
        ".tsx",
    )
    # text-sm is a size utility, not a colour → not a candidate even with bg
    assert_clean(
        "text-sm with bg is not a contrast candidate",
        '<p className="text-sm bg-surface">copy</p>',
        ".tsx",
    )

    # ── CSS / color-mix pairing ─────────────────────────────────────────────────
    # success step-11 text on success-subtle tint → ≥4.5 → clean (globals comment)
    assert_clean(
        "css: success on success-subtle clears AA",
        ".badge { color: var(--success); background-color: var(--success-subtle); }",
        ".css",
    )

    # ── genuine sub-AA functional pair (HF-9 evidence band ≈4.25) ────────────────
    # explicit hexes: a mid-grey text on white computes to ≈4.23 → ERROR + note
    assert_violations(
        "sub-AA functional pair ≈4.23 (large-text band)",
        ".chip { color: #7b7b7b; background-color: #ffffff; }",
        ".css", ["A11Y-1"],
    )
    assert_ratio("the ≈4.23 oracle", "#7b7b7b", "#ffffff", 4.23, tol=0.05)

    # ── unresolvable → NOTE, never silent pass, never false ERROR ────────────────
    assert_note(
        "unresolvable: arbitrary unknown var fg with known bg",
        '<div className={clsx("text-[var(--unknownToken)]", "bg-surface")}>x</div>',
        ".tsx",
    )
    assert_note(
        "unresolvable: css var not in token map (both present)",
        ".x { color: var(--mystery-ink); background: #ffffff; }",
        ".css",
    )

    # ── only one colour present → not a candidate, skipped silently ──────────────
    assert_clean(
        "single colour (bg only) is not a candidate",
        ".prose code { background: var(--muted); padding: 1px 4px; }",
        ".css",
    )

    # ── comment stripping ────────────────────────────────────────────────────────
    assert_clean(
        "commented-out bad pair is not flagged",
        "/* .bad { color: #18181b; background: #0064ff; } */",
        ".css",
    )

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    if "--self-test" in args:
        run_self_test()
        return

    tokens_file = None
    if "--tokens" in args:
        i = args.index("--tokens")
        try:
            tokens_file = args[i + 1]
        except IndexError:
            print("ERROR contrast: --tokens needs a CSS file argument")
            sys.exit(1)
        args = args[:i] + args[i + 2:]

    if not args:
        print("Usage: python3 checks/contrast.py --tokens <globals.css> <path>... "
              "| --self-test")
        sys.exit(1)

    css_text = ""
    if tokens_file:
        try:
            with open(tokens_file, encoding="utf-8", errors="replace") as fh:
                css_text = fh.read()
        except OSError as exc:
            print(f"ERROR contrast: cannot read --tokens {tokens_file} — {exc}")
            sys.exit(1)
    else:
        print("NOTE  contrast: no --tokens file given; only #hex / arbitrary-value "
              "pairs will resolve. Pass --tokens <globals.css> to resolve named tokens.")
    resolver = TokenResolver(css_text)

    out = scan_paths(args, resolver)
    errors = [o for o in out if o.startswith("ERROR")]
    notes = [o for o in out if o.startswith("NOTE")]
    for line in out:
        print(line)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
