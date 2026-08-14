#!/usr/bin/env python3
"""
Token-pair contrast check — checks/contrast.py
Answers the one part of A11Y-1 that no rendered page can: do the design system's
DECLARED foreground/background token combinations clear WCAG AA? A declared pair
is a design-system statement, so it can be measured before anything renders, and
a rendered scan never sees the pairs a product intends — only the ones a page
happens to use.

Where the pairs come from
──────────────────────────
`- pairs: [["--foreground", "--background"], …]` under `## Colour` in the
product's DESIGN.md, projected into `.dx/design.json` as `colour.pairs` (a list
of two-element [foreground, background] lists) by
scripts/generate-design-json.py. Nothing declares pairs today, so this check
ships HONEST-INERT: with no pairs it grades N/A, says so in a NOTE, exits 0, and
A11Y-1 goes to manual verification. It never reports A11Y-1 as passing on the
strength of a check that had nothing to measure.

How colours resolve
────────────────────
A token map is built from a CSS file given by --tokens <file>, else `Tokens.source`
in `.dx/design.json` (product-specific; for this repo's own site,
../app/globals.css from harness/). It resolves:
  - direct hex (#rgb / #rrggbb) and the keywords white / black,
  - var(--other) chains (transitively, with cycle protection),
  - color-mix(in oklab, var(--a) <p>%, <b>) — mixed in OKLab per the CSS spec
    (https://bottosson.github.io/posts/oklab/),
  - @theme inline aliases (--color-foo: var(--bar)) so a Tailwind text-foo /
    bg-foo utility name resolves through to --bar's colour.
An unresolved token stays None and is reported via the NOTE channel — never
guessed, never silently passed. The resolver, its OKLab maths and the --tokens
flag are reused verbatim by other checks; they are a shared surface, not private
to this file.

Both resolve → ratio computed: <3.0 ERROR (fails even large text); 3.0–4.5 ERROR
noting it passes only as large text; ≥4.5 clean. A finding points at the line in
the token CSS where the foreground token is declared, so it is navigable.

Why the line-local source scan was deleted
───────────────────────────────────────────
This check used to pair a text colour and a background colour found on the same
line of source. The colour maths was sound (the Tailwind opacity compositing
added for #122 works, and its finding on this repo was a real composited pair at
4.29:1, not a self-comparison). Two limits ended it anyway, neither of them a
maths bug:
  - A line-local scan cannot see an inherited or computed background. A rule that
    set only a text colour was never a candidate, so most real pairs on a page
    were never measured — this file's own docstring called that the largest
    false-negative surface.
  - axe's `color-contrast`, run against a rendered page, answers exactly that
    question on computed colours and is strictly better at it. Two layers
    disagreeing about one L0 control is worse than one layer that is right.

What this check does NOT verify
───────────────────────────────
- Any rendered element, and any colour pairing a product uses but never
  declared. That is the rendered check's half of A11Y-1.
- Font-size-dependent large-text classification. The 3.0–4.5 band is flagged
  conservatively with a "confirm the text size" note.
- Non-text (UI component) contrast, and colour-blindness simulation.
- color-mix in any space other than oklab.

Output
──────
ERROR <tokens-css>:<line> [A11Y-1] declared pair <fg> (<hex>) on <bg> (<hex>) =
      <ratio>:1 (<band>) — suggest: <…>
NOTE  contrast: <…> — verify manually
Exit 0 and print nothing (or NOTEs only, or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any sub-AA declared pair.
"""

import importlib.util
import json
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

# This check's row in checks/a11y-rule-map.json: the controls it covers, named
# when it has nothing to measure so none of them passes silently.
LAYER = "contrast-token-pairs"

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
# Where a declaration starts, so a finding can point at the token's own line.
_DECL_START_RE = re.compile(r"(--[\w-]+)\s*:")
_VAR_RE = re.compile(r"var\(\s*(--[\w-]+)\s*\)")
_COLORMIX_RE = re.compile(
    r"color-mix\(\s*in\s+oklab\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+)\)",
    re.IGNORECASE,
)


class TokenResolver:
    """Resolves --token / Tailwind-utility names to (r,g,b) from a CSS file."""

    def __init__(self, css_text=""):
        self.raw = {}         # --name -> raw value string
        self._cache = {}      # --name -> rgb or None
        self.decl_lines = {}  # --name -> 1-based line it is declared on
        if css_text:
            # Parsed over the whole text, so a declaration wrapped across lines
            # still resolves; the line index is a separate, per-line pass.
            for name, value in _DECL_RE.findall(css_text):
                self.raw[name] = value.strip()
            for lineno, line in enumerate(css_text.splitlines(), start=1):
                for m in _DECL_START_RE.finditer(line):
                    self.decl_lines.setdefault(m.group(1), lineno)

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

    def decl_line(self, name):
        """The 1-based line `--name` is declared on, or None."""
        return self.decl_lines.get(name)

    def page_base(self):
        """The page ground a translucent background composites over:
        --background, else --surface (this repo's tokens), else their @theme
        aliases. None when unresolvable — never guessed."""
        for cand in ("--background", "--surface",
                     "--color-background", "--color-surface"):
            rgb = self.resolve(cand)
            if rgb is not None:
                return rgb
        return None


# ── Alpha and compositing primitives ─────────────────────────────────────────────
# Kept with the resolver as shared colour maths (spec section 10 build target 1
# reuses this surface verbatim), not as a private helper of a pairing scan: a
# translucent token still has to be composited before it can be measured.

def _parse_tw_alpha(raw):
    """A Tailwind opacity modifier (the part after '/') → alpha in [0,1], or
    None if unparseable. Absent modifier → 1.0. Accepts bare percentages
    ('10', '2.5') and arbitrary values ('[0.06]', '[6%]')."""
    if raw is None:
        return 1.0
    s = raw
    if s.startswith("["):
        s = s[1:-1].strip()
        if s.endswith("%"):
            s = s[:-1]
        else:
            try:
                return max(0.0, min(1.0, float(s)))  # bare number is 0–1
            except ValueError:
                return None
    try:
        return max(0.0, min(1.0, float(s) / 100.0))
    except ValueError:
        return None


def _composite(rgb, alpha, base_rgb):
    """Source-over blend of `rgb` at `alpha` on an opaque `base_rgb`, in sRGB
    space (as browsers blend)."""
    return tuple(round(alpha * c + (1 - alpha) * b)
                 for c, b in zip(rgb, base_rgb))


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


def _verdict_line(rel, lineno, fg_name, fg_rgb, bg_name, bg_rgb):
    """Returns an ERROR string if the declared pair fails AA, else None. The
    file and line point at the token CSS where the foreground token is
    declared, so the finding is navigable."""
    ratio = contrast_ratio(fg_rgb, bg_rgb)
    is_error, band = _band(ratio)
    if not is_error:
        return None
    return checklib.emit_error(
        rel, lineno, "A11Y-1",
        f"declared pair {fg_name} ({_fmt_hex(fg_rgb)}) on {bg_name} "
        f"({_fmt_hex(bg_rgb)}) = {ratio:.2f}:1 ({band})",
        "use a higher-contrast token (e.g. Radix step-12 for small text), or "
        "correct the declared pair in DESIGN.md")


# ── Declared token pairs ──────────────────────────────────────────────────────

def load_design_projection(repo_root):
    """
    `<repo_root>/.dx/design.json` as a dict, or (None, reason). The projection
    is generated from DESIGN.md; a missing one is not a failure, it is a product
    that has not declared a design language yet.
    """
    path = os.path.join(repo_root, ".dx", "design.json")
    if not os.path.isfile(path):
        return None, f"no {os.path.join('.dx', 'design.json')} under {repo_root}"
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as exc:
        return None, f"could not read .dx/design.json ({exc})"
    if not isinstance(data, dict):
        return None, ".dx/design.json is not a JSON object"
    return data, None


def declared_pairs(design):
    """
    The declared foreground/background pairs from the projection's
    `colour.pairs`. Returns (pairs, malformed): pairs is a list of (fg, bg)
    token-name tuples, malformed holds every entry that was not a two-name
    list, so a typo is reported rather than dropped.
    """
    colour = design.get("colour") if isinstance(design, dict) else None
    raw = colour.get("pairs") if isinstance(colour, dict) else None
    if not isinstance(raw, list):
        return [], []
    pairs, malformed = [], []
    for entry in raw:
        if isinstance(entry, list) and len(entry) == 2 \
                and all(isinstance(x, str) and x.strip() for x in entry):
            pairs.append((entry[0].strip(), entry[1].strip()))
        else:
            malformed.append(entry)
    return pairs, malformed


def tokens_source(design, repo_root):
    """`Tokens.source` from the projection, resolved against the repo root, or
    None. The --tokens flag wins over it; detect.py's auto-discovery is the
    third path."""
    tokens = design.get("tokens") if isinstance(design, dict) else None
    src = tokens.get("source") if isinstance(tokens, dict) else None
    if not isinstance(src, str) or not src.strip():
        return None
    cand = src.strip()
    if not os.path.isabs(cand):
        cand = os.path.join(repo_root, cand)
    return cand if os.path.isfile(cand) else None


def resolve_token(resolver, name):
    """A declared token name → (r,g,b) or None. `--foo` resolves as a custom
    property; a bare `foo` resolves as a Tailwind utility name (the @theme
    alias), so both spellings a product might declare are accepted."""
    if name.startswith("--"):
        return resolver.resolve(name)
    return resolver.resolve_utility(name)


def check_pairs(pairs, resolver, tokens_rel):
    """
    Grade every declared pair. Returns a list of ERROR/NOTE strings: an ERROR
    for a pair that fails AA, a NOTE for a token that does not resolve (never a
    guess, and never a silent pass).
    """
    out = []
    for fg_name, bg_name in pairs:
        fg_rgb = resolve_token(resolver, fg_name)
        bg_rgb = resolve_token(resolver, bg_name)
        unresolved = [n for n, rgb in ((fg_name, fg_rgb), (bg_name, bg_rgb))
                      if rgb is None]
        if unresolved:
            out.append(f"NOTE  contrast: declared pair [{fg_name}, {bg_name}] could "
                       f"not resolve {', '.join(unresolved)} in {tokens_rel or 'any token file'} "
                       f"— that pair goes to manual verification")
            continue
        lineno = (resolver.decl_line(fg_name) or resolver.decl_line(bg_name) or 1)
        err = _verdict_line(tokens_rel or "(tokens)", lineno,
                            fg_name, fg_rgb, bg_name, bg_rgb)
        if err:
            out.append(err)
    return out


def inert_notes(reason, controls):
    """The honest-inert report: nothing was declared, so the check grades N/A
    and says which controls go to manual verification instead of passing."""
    verb = "goes" if len(controls) == 1 else "go"
    return [
        f"NOTE  contrast: no declared foreground/background token pairs — {reason}",
        "NOTE  contrast: grade A11Y-1 N/A for this check and verify it by hand "
        "(declare `- pairs: [[\"--fg\", \"--bg\"], …]` under `## Colour` in DESIGN.md "
        "to switch it on)",
        f"NOTE  contrast: {', '.join(controls)} {verb} to manual verification "
        f"(not reported as passing); A11Y-1 is L0 and blocks until verified by "
        f"some path",
    ]


def find_design_root(start):
    """The nearest ancestor of `start` holding a `.dx` directory (where the
    projection lives), else `start` itself. detect.py always passes
    --repo-root; this is the fallback for a bare command line."""
    cur = os.path.abspath(start)
    if os.path.isfile(cur):
        cur = os.path.dirname(cur)
    probe = cur
    while True:
        if os.path.isdir(os.path.join(probe, ".dx")):
            return probe
        parent = os.path.dirname(probe)
        if parent == probe:
            return cur
        probe = parent


def run(repo_root, tokens_file=None):
    """Run the token-pair check. Returns (exit_code, output_lines)."""
    try:
        controls = checklib.layer_controls(LAYER)
    except checklib.RuleMapError as exc:
        return 1, [f"ERROR contrast: {exc}"]

    design, reason = load_design_projection(repo_root)
    if design is None:
        return 0, inert_notes(reason, controls)

    pairs, malformed = declared_pairs(design)
    out = [f"NOTE  contrast: ignoring a malformed colour.pairs entry {entry!r} "
           f"— each entry is a [foreground, background] pair of token names"
           for entry in malformed]
    if not pairs:
        return 0, out + inert_notes("colour.pairs is absent or empty in "
                                    ".dx/design.json", controls)

    tokens_file = tokens_file or tokens_source(design, repo_root)
    css_text = ""
    if tokens_file:
        try:
            with open(tokens_file, encoding="utf-8", errors="replace") as fh:
                css_text = fh.read()
        except OSError as exc:
            return 1, out + [f"ERROR contrast: cannot read the token file "
                             f"{tokens_file} — {exc}"]
    else:
        out.append("NOTE  contrast: no token CSS file given or declared "
                   "(--tokens <css>, or Tokens.source in DESIGN.md); only literal "
                   "colours will resolve")

    resolver = TokenResolver(css_text)
    tokens_rel = os.path.relpath(tokens_file) if tokens_file else None
    out.extend(check_pairs(pairs, resolver, tokens_rel))
    errors = [o for o in out if o.startswith("ERROR")]
    return (1 if errors else 0), out


# ── Self-test ──────────────────────────────────────────────────────────────────

# A small token set mirroring app/globals.css (the real fixture source).
_SELF_TEST_TOKENS = """:root {
  --surface: #ffffff;
  --foreground: #18181b;
  --tw-blue: #0064ff;
  --tw-blue-hover: color-mix(in oklab, var(--tw-blue) 88%, black);
  --success-9: #46a758;
  --success: #2a7e3b;
  --success-subtle: color-mix(in oklab, var(--success-9) 8%, var(--surface));
  --destructive: #b91c1c;
  --muted-foreground: #7b7b7b;
}
@theme inline {
  --color-surface: var(--surface);
  --color-foreground: var(--foreground);
  --color-tw-blue: var(--tw-blue);
  --color-success: var(--success);
  --color-success-subtle: var(--success-subtle);
  --color-destructive: var(--destructive);
}
"""


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
    resolver = TokenResolver(_SELF_TEST_TOKENS)
    detect = _load_detect()

    def check(name, want, got):
        nonlocal case_count
        case_count += 1
        if want != got:
            failures.append(f"FAIL {name}: want: {want!r}; got: {got!r}")

    def assert_ratio(name, fg_hex, bg_hex, expected, tol=0.1):
        nonlocal case_count
        case_count += 1
        got = contrast_ratio(_hex_to_rgb(fg_hex), _hex_to_rgb(bg_hex))
        if abs(got - expected) > tol:
            failures.append(f"FAIL {name}: want: {expected!r} (tol {tol}); "
                            f"got: {round(got, 3)!r}")

    def assert_resolves(name, token, expected_hex, tol=4):
        nonlocal case_count
        case_count += 1
        rgb = resolver.resolve(token)
        if rgb is None:
            failures.append(f"FAIL {name}: want: ~{expected_hex!r}; got: unresolved")
            return
        exp = _hex_to_rgb(expected_hex)
        if any(abs(a - b) > tol for a, b in zip(rgb, exp)):
            failures.append(f"FAIL {name}: want: ~{expected_hex!r}; "
                            f"got: {_fmt_hex(rgb)!r}")

    def write_repo(td, pairs=None, tokens=_SELF_TEST_TOKENS, extra_design=None,
                   source_file=None):
        """A throwaway product repo: a token CSS file, an optional
        .dx/design.json declaring pairs, and an optional source file the check
        must not scan."""
        if tokens is not None:
            with open(os.path.join(td, "tokens.css"), "w", encoding="utf-8") as fh:
                fh.write(tokens)
        if pairs is not None or extra_design is not None:
            os.makedirs(os.path.join(td, ".dx"), exist_ok=True)
            design = {"colour": {"primary": "--tw-blue"}}
            if pairs is not None:
                design["colour"]["pairs"] = pairs
            if extra_design:
                design.update(extra_design)
            with open(os.path.join(td, ".dx", "design.json"), "w", encoding="utf-8") as fh:
                json.dump(design, fh)
        if source_file:
            with open(os.path.join(td, "bad.tsx"), "w", encoding="utf-8") as fh:
                fh.write(source_file)

    # ── ratio maths (unchanged oracles) ────────────────────────────────────────
    assert_ratio("avatar fail #18181b on #0064ff", "#18181b", "#0064ff", 3.60)
    assert_ratio("known-good #ffffff on #18181b", "#ffffff", "#18181b", 17.7, tol=0.2)
    assert_ratio("the ≈4.23 oracle", "#7b7b7b", "#ffffff", 4.23, tol=0.05)

    # ── the resolver survives the deletion, and #156 reuses this surface ───────
    for attr in ("resolve", "_resolve_value", "resolve_utility",
                 "resolve_colour_expr", "page_base"):
        check(f"TokenResolver keeps {attr}", True,
              callable(getattr(resolver, attr, None)))
    assert_resolves("surface keyword", "--surface", "#ffffff")
    assert_resolves("tw-blue direct", "--tw-blue", "#0064ff")
    # success-subtle = 8% grass-9 on white → a very light green tint
    assert_resolves("success-subtle color-mix in oklab", "--success-subtle",
                    "#f1f7f1", tol=6)
    check("resolve_utility reads the @theme alias", (0, 100, 255),
          resolver.resolve_utility("tw-blue"))
    check("resolve_colour_expr reads var()", (255, 255, 255),
          resolver.resolve_colour_expr("var(--surface)"))
    check("resolve_colour_expr reads a hex", (0, 100, 255),
          resolver.resolve_colour_expr("#0064ff"))
    check("page_base falls back to --surface", (255, 255, 255), resolver.page_base())
    check("an unknown token stays unresolved, never guessed", None,
          resolver.resolve("--no-such-token"))
    check("a declaration carries its line number", 3, resolver.decl_line("--foreground"))
    check("_parse_tw_alpha reads a bare percentage", 0.1, _parse_tw_alpha("10"))
    check("_parse_tw_alpha reads an arbitrary value", 0.06, _parse_tw_alpha("[0.06]"))
    check("_composite blends source-over in sRGB", (128, 128, 128),
          _composite((0, 0, 0), 0.5, (255, 255, 255)))

    # ── a declared pair that fails AA is reported ──────────────────────────────
    with tempfile.TemporaryDirectory() as td:
        write_repo(td, pairs=[["--foreground", "--tw-blue"]])
        rc, lines = run(td, tokens_file=os.path.join(td, "tokens.css"))
        errs = [ln for ln in lines if ln.startswith("ERROR")]
        check("a sub-AA declared pair exits 1", 1, rc)
        check("it is one ERROR", 1, len(errs))
        parsed = detect._FINDING_RE.match(errs[0]) if errs else None
        check("the finding matches detect's finding shape", True, parsed is not None)
        check("the finding carries A11Y-1", "A11Y-1",
              parsed.group("control") if parsed else None)
        check("the finding names both declared tokens", True,
              bool(errs) and "--foreground" in errs[0] and "--tw-blue" in errs[0])
        check("the finding carries the computed ratio", True,
              bool(errs) and "3.60:1" in errs[0])
        check("the finding points at the token file", True,
              bool(parsed) and parsed.group("file").endswith("tokens.css"))

    # ── a declared pair that clears AA is silent ───────────────────────────────
    with tempfile.TemporaryDirectory() as td:
        write_repo(td, pairs=[["--foreground", "--surface"]])
        rc, lines = run(td, tokens_file=os.path.join(td, "tokens.css"))
        check("a passing declared pair exits 0", 0, rc)
        check("a passing declared pair prints nothing", [], lines)

    # ── nothing is reported about a rendered element or a source file ──────────
    with tempfile.TemporaryDirectory() as td:
        write_repo(td, pairs=[["--foreground", "--surface"]],
                   source_file='<div className="bg-tw-blue text-foreground">x</div>\n'
                               ".chip { color: #ce2c31; background: #f6e5e6; }\n")
        rc, lines = run(td, tokens_file=os.path.join(td, "tokens.css"))
        check("a source file with a bad pairing is not scanned", (0, []), (rc, lines))

    # ── an unresolvable declared token is a NOTE, never a guess ────────────────
    with tempfile.TemporaryDirectory() as td:
        write_repo(td, pairs=[["--mystery-ink", "--surface"]])
        rc, lines = run(td, tokens_file=os.path.join(td, "tokens.css"))
        check("an unresolvable token exits 0", 0, rc)
        check("an unresolvable token raises no ERROR", [],
              [ln for ln in lines if ln.startswith("ERROR")])
        check("the NOTE names the token that did not resolve", True,
              any(ln.startswith("NOTE") and "--mystery-ink" in ln for ln in lines))

    # ── a malformed pairs entry is reported, not dropped ───────────────────────
    with tempfile.TemporaryDirectory() as td:
        write_repo(td, pairs=[["--foreground"], ["--foreground", "--surface"]])
        rc, lines = run(td, tokens_file=os.path.join(td, "tokens.css"))
        check("a malformed entry does not fail the run", 0, rc)
        check("a malformed entry is named in a NOTE", True,
              any("malformed colour.pairs entry" in ln for ln in lines))

    # ── honest-inert: nothing declared means N/A, never a pass ─────────────────
    check("the layer's controls come from the rule map", ["A11Y-1"],
          checklib.layer_controls(LAYER))
    with tempfile.TemporaryDirectory() as td:
        write_repo(td)  # token file, no .dx/design.json
        rc, lines = run(td, tokens_file=os.path.join(td, "tokens.css"))
        check("no design.json exits 0", 0, rc)
        check("no design.json prints only NOTEs", True,
              bool(lines) and all(ln.startswith("NOTE") for ln in lines))
        check("the inert report grades A11Y-1 N/A", True,
              any("A11Y-1 N/A" in ln for ln in lines))
        check("the inert report sends A11Y-1 to manual verification", True,
              any("manual verification" in ln and "A11Y-1" in ln for ln in lines))
        check("the inert report says A11Y-1 is L0 and blocks", True,
              any("L0 and blocks" in ln for ln in lines))
    with tempfile.TemporaryDirectory() as td:
        write_repo(td, pairs=[])
        rc, lines = run(td, tokens_file=os.path.join(td, "tokens.css"))
        check("an empty colour.pairs is honest-inert too", (0, True),
              (rc, any("A11Y-1 N/A" in ln for ln in lines)))

    # ── the token CSS file: --tokens wins, Tokens.source is the fallback ───────
    with tempfile.TemporaryDirectory() as td:
        write_repo(td, pairs=[["--foreground", "--tw-blue"]],
                   extra_design={"tokens": {"source": "tokens.css"}})
        rc, lines = run(td)  # no --tokens: Tokens.source supplies the file
        check("Tokens.source supplies the token file", 1, rc)
        check("the pair resolved through Tokens.source", True,
              any("3.60:1" in ln for ln in lines))
        with open(os.path.join(td, "other.css"), "w", encoding="utf-8") as fh:
            fh.write(":root { --foreground: #ffffff; --tw-blue: #000000; }\n")
        rc2, lines2 = run(td, tokens_file=os.path.join(td, "other.css"))
        check("--tokens wins over Tokens.source", (0, []), (rc2, lines2))

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

    repo_root = None
    if "--repo-root" in args:
        i = args.index("--repo-root")
        try:
            repo_root = args[i + 1]
        except IndexError:
            print("ERROR contrast: --repo-root needs a directory argument")
            sys.exit(1)
        args = args[:i] + args[i + 2:]

    notes = []
    if args:
        # The check no longer scans source files, so a path argument cannot
        # change the result. Say so rather than appearing to have scanned it.
        notes.append("NOTE  contrast: path arguments are not scanned — this check "
                     "grades the token pairs declared in DESIGN.md; the first path "
                     "only locates the repo root")
        if repo_root is None:
            repo_root = find_design_root(args[0])

    if repo_root is None:
        repo_root = os.getcwd()

    code, lines = run(repo_root, tokens_file=tokens_file)
    for line in notes + lines:
        print(line)
    sys.exit(code)


if __name__ == "__main__":
    main()
