#!/usr/bin/env python3
"""
Slop scan (checks/slop-scan.py)
Scans UI source files for the statically-resolvable subset of SLP-1, SLP-2 and
SLP-3: the three anti-slop rules that are answerable from source text, without
a rendered page.

Detection rules
───────────────
Rule        Control   What is caught
GRADIENT    SLP-1     A gradient (CSS `linear-gradient`/`radial-gradient`/
            (L1)      `conic-gradient`, or the Tailwind gradient-direction
                      utility plus its `from-`/`via-`/`to-` stops) with AT
                      LEAST 2 stops whose resolved hue is AT OR ABOVE 255
                      degrees. One stop in band and one out never fires.
GLOW        SLP-1     A box-shadow whose blur is AT OR ABOVE 6px AND whose
            (L1)      larger offset is AT OR BELOW 2px AND whose colour is
                      saturated. All three clauses, not any.
CYANDARK    SLP-1     A dark token block (`.dark`, `[data-theme="dark"]`, or a
            (L1)      `prefers-color-scheme: dark` media statement) that sets
                      BOTH a cyan ink and a dark ground.
CLIPTEXT    SLP-2     One element carrying a background clipped to its text, a
            (L1)      transparent text fill AND a background source. Never
                      `bg-clip-padding`: the clip VALUE is matched, not the
                      `bg-clip-` prefix.
SIDETAB     SLP-3     One element with a single side at or above 3px, a radius
            (L1)      greater than 0, and the remaining sides 0 or absent.

Why the numbers are what they are
─────────────────────────────────
Keep this block. It is what stops a later reader from "simplifying" a rule that
was narrowed on purpose, after a proposed detector was tested against real code
and found to misfire.

- The hue band opens at 255 because 240 would flag the site's own section ink.
  `--casesync` #3e63dd sits at 226.04 degrees and `--sec-getting-started`
  iris-9 #5b5bd6 at exactly 240.00, and `app/globals.css` documents the section
  inks as deliberately purple-avoiding. 255 is the design lead's ruling
  (assembly, 2026-08-14), chosen over 250 and 260 for 15 degrees of clearance
  above iris-9. 260 would also have let Tailwind `violet-500` #8b5cf6 (258.31)
  through, which is a second, independent reason the ruling landed on 255.
  Do not widen this band, narrow it, or make it configurable.
- The hue is the sRGB HSL hue angle, the CSS `hsl()` hexcone hue, NOT the OKLCH
  hue. This is not a preference: OKLCH puts `--casesync` at 267.0 and
  `--sec-getting-started` at 278.3, both above 255, so an OKLCH reading of the
  same band would flag both calibration tokens and invert the whole
  calibration. Someone will reach for OKLCH on the grounds that it is the
  better space; the self-test guards against it.
- Saturation is OKLCH chroma, because HSL saturation says nothing about how
  washed out a colour is: `--demo-slop-border` on this repo resolves to
  (218, 210, 255), an HSL hue of 250.7 at 100 percent HSL saturation and a pale
  wash in fact. Every hue test is gated on chroma at or above 0.04, so a
  near-neutral colour, whose HSL hue is unstable and meaningless, never carries
  a hue.
- The blur floor exists because a hairline ring is not a glow.
  `components/ui/sidebar.tsx` draws its outline variant with
  `shadow-[0_0_0_1px_var(--sidebar-border)]`: offsets 0, blur 0, spread 1px. A
  blur-free shadow is a border drawn with a shadow.
- SLP-2 needs the syntax tree rather than a line regex, for two separate
  reasons. `components/ui/button.tsx` carries `bg-clip-padding` inside a long
  `cva` base string, so a substring match on `bg-clip-` fires wrongly. And
  `components/compare.tsx` puts `className` on one line and the gradient
  `style` on the next, so a line-local rule misses the true positive.
- SLP-3's pair requirement is what clears this repo's near-misses: a
  `border-l-2` is below the 3px floor, and `.prose blockquote`'s
  `border-left: 3px` is at the floor with no `border-radius`, so the radius
  half clears it.

Every threshold above is exact and inclusive as written. Do not round, do not
soften, do not add tolerance bands.

SLP-3 is partial: what is uncovered, and who owns it
────────────────────────────────────────────────────
The static rule reads one element's own declarations, which is why SLP-3 is
stamped `enforced: partial` rather than `enforced: script`. It cannot see:

1. A side tab assembled across the cascade, where the thick side border comes
   from a utility on the element and the radius from a parent rule or a shared
   stylesheet. Owner: the manual verify pass, and later the rendered runner.
2. A side tab assembled from a pseudo-element (`::before` with a width and a
   background) instead of a border. A static rule cannot tell a decorative
   pseudo-element bar from a layout one. Owner: the rendered runner.
3. A side tab built from a conditional class, where the thick side and the
   radius arrive on different branches of a `clsx` or template-literal
   expression this rule cannot evaluate. Owner: this script's NOTE channel
   where the branch is readable, otherwise the manual pass.
4. The judgment half: whether the treatment reads as an AI-UI side tab at all,
   versus a deliberate, well-made accent. Owner: the evaluator.

What this script does NOT verify
────────────────────────────────
- SLP-4 (nested cards) and SLP-6 (type ramp). Both need the rendered runner,
  because both ask about computed values.
- SLP-5 and SLP-7, which are judgment.
- SLP-8, which ships in the motion check.
- A colour the resolver cannot reach. It resolves direct hex (`#rgb` and
  `#rrggbb` only), the keywords `white` and `black`, `var(--other)` chains and
  `color-mix(in oklab, A p%, B)`. It does NOT parse `oklch()`, `oklab()`,
  `rgb()`, `hsl()`, `hwb()`, `lab()` or `lch()`, and it does not parse 4-digit
  or 8-digit hex, so alpha written into the hex literal arrives unresolvable.
  Every one of those is a NOTE naming the location, never a guess and never a
  silent pass.
- A Tailwind palette colour the product's own token file does not define. A
  stop utility resolves through the `@theme` alias `--color-<name>`, else
  `--<name>`; nothing else. A name with no declaration is a NOTE.
- The cyan-on-dark clause ships with no calibration evidence from this repo,
  which is light-only with no dark layer. It is built conservatively and needs
  calibrating against a dark-mode product.
- Anything in a file it is not handed. It reads no config: `detect.py` applies
  `detector.ignoreFiles` before it invokes this script, and this script scans
  the paths it is given and nothing else.

Token map
─────────
`--tokens <file>` names the product's CSS token file. Without the flag, the
same discovery `detect.py` uses applies: `app/globals.css` then `globals.css`,
walking up from the first target. With no token map a direct hex still
resolves, because it needs no map, and every `var()` colour becomes a NOTE, so
a quiet result is never mistaken for a clean one.

Output
──────
ERROR <file>:<line> [<CTL>] <found> — suggest: <...>
ERROR <file>:<line> [<CTL>][waiver-claimed] <found> — verify approver in decision record
NOTE  slop-scan: could not resolve <what> at <file>:<line>, verify manually
Exit 0 and print nothing (or NOTEs only, or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation, waiver-claimed lines included.
"""

import importlib.util
import math
import os
import re
import sys

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_module(filename, name):
    path = os.path.join(_CHECKS_DIR, filename)
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_module("checklib.py", "_dx_checklib")
# The colour resolver is reused, not reimplemented: one OKLab mixer, one
# var()/color-mix arm, one hex parser. Two scripts holding two copies of that
# maths is how they drift. contrast.py owns it; this script imports it.
#
# The underscore-prefixed pieces (`_resolve_value`, `_rgb_to_oklab`,
# `_parse_tw_alpha`, `_composite`) are part of that reused surface, not private
# details of a pairing scan: `resolve_colour_expr` does not handle color-mix, and
# a translucent stop still has to be composited before its hue means anything.
# contrast.py's own docstring names them as the surface another build reuses.
contrast = _load_module("contrast.py", "_dx_contrast")

CHECK_NAME = "slop-scan"
TARGET_EXTENSIONS = checklib.TARGET_EXTENSIONS

# ── Calibrated thresholds ─────────────────────────────────────────────────────
# See the "Why the numbers are what they are" block above before touching any
# of these. Each one is a ruling, not a guess.
HUE_BAND_DEG = 255.0            # at or above, inclusive
MIN_STOPS_IN_BAND = 2           # at least 2 stops of the SAME gradient
GLOW_BLUR_FLOOR_PX = 6.0        # at or above, inclusive
GLOW_OFFSET_CEILING_PX = 2.0    # at or below, inclusive
SIDE_BORDER_FLOOR_PX = 3.0      # at or above, inclusive
CHROMA_FLOOR = 0.04             # OKLCH chroma: below this a hue is meaningless

# The cyan-on-dark clause has no calibration evidence from this repo, so both
# of its numbers are deliberately conservative: a narrow band around true cyan
# (180 degrees), and a ground dark enough that no light theme can reach it.
CYAN_BAND_DEG = (170.0, 200.0)
DARK_GROUND_LUMINANCE = 0.10

# rem and em convert on a declared 16px root so every threshold compares
# against one unit. A unit the parser does not know resolves to None, which
# means absent, which means the threshold cannot be met. Never guess a length.
ROOT_FONT_PX = 16.0

WAIVER_RE = re.compile(r"dx-waive\s+([A-Z0-9]+-\d+)", re.IGNORECASE)


# ── Colour maths on top of the shared resolver ────────────────────────────────

def hsl_hue(rgb):
    """
    The sRGB HSL hue angle in degrees, the CSS `hsl()` hexcone hue. None for an
    achromatic colour, which has no hue at all.

    This is the space the 255-degree band is calibrated in. See the docstring:
    an OKLCH reading inverts the calibration.
    """
    r, g, b = (c / 255.0 for c in rgb)
    high, low = max(r, g, b), min(r, g, b)
    span = high - low
    if span == 0:
        return None
    if high == r:
        sextant = ((g - b) / span) % 6
    elif high == g:
        sextant = (b - r) / span + 2
    else:
        sextant = (r - g) / span + 4
    return (sextant * 60.0) % 360.0


def oklch_chroma(rgb):
    """OKLCH chroma, hypot(a, b) of the OKLab triple. The measure of 'saturated'."""
    _lightness, a, b = contrast._rgb_to_oklab(rgb)
    return math.hypot(a, b)


def is_saturated(rgb):
    """True when a colour carries enough chroma for its hue to mean anything."""
    return oklch_chroma(rgb) >= CHROMA_FLOOR


def rgb_at_hue(hue):
    """A fully saturated sRGB triple at `hue` degrees. The self-test uses it to
    stand on the band boundary exactly, where a hand-picked hex cannot."""
    sextant = (hue % 360.0) / 60.0
    ramp = 1 - abs(sextant % 2 - 1)
    wheel = [(1, ramp, 0), (ramp, 1, 0), (0, 1, ramp),
             (0, ramp, 1), (ramp, 0, 1), (1, 0, ramp)]
    return tuple(round(channel * 255) for channel in wheel[int(sextant) % 6])


def in_hue_band(rgb):
    """True when a colour sits at or above the 255-degree band AND is saturated."""
    if not is_saturated(rgb):
        return False
    hue = hsl_hue(rgb)
    return hue is not None and hue >= HUE_BAND_DEG


# ── Small text parsers ────────────────────────────────────────────────────────

def split_top_level(text, sep=","):
    """Split on `sep` at bracket depth 0, ignoring separators inside quotes."""
    out, buf, depth, quote = [], [], 0, None
    for char in text:
        if quote is not None:
            buf.append(char)
            if char == quote:
                quote = None
            continue
        if char in "\"'`":
            quote = char
            buf.append(char)
            continue
        if char in "([{":
            depth += 1
        elif char in ")]}":
            depth = max(0, depth - 1)
        if char == sep and depth == 0:
            out.append("".join(buf))
            buf = []
        else:
            buf.append(char)
    out.append("".join(buf))
    return out


def matching_paren(text, open_index):
    """The index of the `)` closing the `(` at `open_index`, or None."""
    depth, quote = 0, None
    for i in range(open_index, len(text)):
        char = text[i]
        if quote is not None:
            if char == quote:
                quote = None
            continue
        if char in "\"'":
            quote = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth == 0:
                return i
    return None


def first_token(text):
    """The leading token of `text`: a whole `name(...)` call, else the first word."""
    text = text.strip()
    if not text:
        return ""
    call = re.match(r"[A-Za-z_-][\w-]*\(", text)
    if call:
        close = matching_paren(text, call.end() - 1)
        if close is not None:
            return text[:close + 1]
    return text.split()[0]


_LENGTH_RE = re.compile(r"^([+-]?(?:\d+\.?\d*|\.\d+))(px|rem|em)?$", re.IGNORECASE)


def parse_length_px(token):
    """
    A CSS length in px, or None when the parser cannot turn it into one. A
    unit it does not know (`%`, `vw`, `calc()`, a bare variable) is None, which
    the rules read as absent rather than as a guessed number.
    """
    m = _LENGTH_RE.match(token.strip())
    if not m:
        return None
    value = float(m.group(1))
    unit = (m.group(2) or "").lower()
    if unit in ("rem", "em"):
        return value * ROOT_FONT_PX
    if unit == "px":
        return value
    return value if value == 0 else None


def utility_base(token):
    """
    A Tailwind utility with its variant prefixes removed: the text after the
    last `:` at bracket depth 0, so `data-[side=left]:border-l` reads as
    `border-l` and `[&_svg:not([class*='size-'])]:size-4` is not mangled.
    """
    depth, cut = 0, -1
    for i, char in enumerate(token):
        if char in "([{":
            depth += 1
        elif char in ")]}":
            depth = max(0, depth - 1)
        elif char == ":" and depth == 0:
            cut = i
    return token[cut + 1:]


def class_tokens(text):
    """Every whitespace-separated utility in `text`, variant prefixes removed."""
    return [utility_base(tok) for tok in re.split(r"[\s\"'`{}]+", text) if tok]


# ── Inline style declarations, wherever they are written ──────────────────────

_STYLE_ATTR_RE = re.compile(r"\bstyle\s*=\s*")
_CAMEL_RE = re.compile(r"(?<!^)(?=[A-Z])")


def _kebab(name):
    """`backgroundImage` -> `background-image`; `WebkitBackgroundClip` -> `-webkit-background-clip`."""
    name = name.strip().strip("\"'")
    if not name:
        return ""
    kebab = _CAMEL_RE.sub("-", name).lower()
    if kebab.startswith("webkit-") or kebab.startswith("moz-") or kebab.startswith("ms-"):
        kebab = "-" + kebab
    return kebab


# A declaration is an identifier that follows a `;`, a `{` or a `}`. Anchoring
# on those three characters is what lets one scanner read a whole rule, a whole
# media block and a bare `style="…"` attribute alike: a selector never carries a
# colon in that position, so `:root {` and `@media (prefers-color-scheme: dark)`
# contribute no declarations of their own.
_DECL_SCAN_RE = re.compile(r"[;{}]\s*(-{0,2}[A-Za-z][\w-]*)\s*:\s*([^;{}]*)")


def parse_declarations(css_text):
    """(property, value) pairs from CSS text at any brace depth, comments removed."""
    body = re.sub(r"/\*.*?\*/", " ", css_text, flags=re.DOTALL)
    return [
        (m.group(1).lower(), m.group(2).strip())
        for m in _DECL_SCAN_RE.finditer(";" + body)
    ]


def element_declarations(text):
    """
    The declarations an element sets inline, from a `style="…"` attribute or a
    `style={{…}}` object. camelCase keys are normalised to kebab-case so one
    set of property names serves CSS, html and JSX alike.
    """
    out = []
    for m in _STYLE_ATTR_RE.finditer(text):
        i = m.end()
        while i < len(text) and text[i].isspace():
            i += 1
        if i >= len(text):
            continue
        if text[i] in "\"'":
            quote = text[i]
            end = text.find(quote, i + 1)
            if end == -1:
                continue
            out.extend(parse_declarations(text[i + 1:end]))
        elif text[i] == "{":
            close = _matching_brace(text, i)
            if close is None:
                continue
            inner = text[i + 1:close].strip()
            if inner.startswith("{"):
                inner_close = _matching_brace(inner, 0)
                if inner_close is None:
                    continue
                inner = inner[1:inner_close]
            for chunk in split_top_level(inner, ","):
                if ":" not in chunk:
                    continue
                key, _, value = chunk.partition(":")
                prop = _kebab(key)
                if prop:
                    out.append((prop, _unquote(value.strip().strip(",").strip())))
    return out


def _unquote(value):
    """A JS style-object value without its surrounding quotes, so a length in it
    reads as a length rather than as an unparseable token."""
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'`":
        return value[1:-1]
    return value


def _matching_brace(text, open_index):
    depth, quote = 0, None
    for i in range(open_index, len(text)):
        char = text[i]
        if quote is not None:
            if char == quote:
                quote = None
            continue
        if char in "\"'`":
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return i
    return None


# ── Colour expressions ────────────────────────────────────────────────────────

def resolve_expr(resolver, expr):
    """
    A CSS colour expression to (r, g, b), or None when it cannot be reached.
    Goes through contrast.py's resolver: the var() chain, the OKLab color-mix
    arm, the two keywords and `#rgb`/`#rrggbb` hex. Nothing else resolves, and
    nothing else is guessed.
    """
    if resolver is None or not expr:
        return None
    return resolver._resolve_value(expr, set())


def resolve_tailwind_colour(resolver, value):
    """
    A Tailwind colour value to ((r, g, b) or None, alpha or None). `value` is
    the part after `from-`/`via-`/`to-`, so it is an arbitrary `[#hex]`, a
    custom-property shorthand `(--token)`, or a palette name with an optional
    `/alpha` modifier.
    """
    alpha_raw = None
    if "/" in value and not value.startswith("["):
        value, _, alpha_raw = value.partition("/")
    alpha = contrast._parse_tw_alpha(alpha_raw)
    if value.startswith("[") and value.endswith("]"):
        return resolve_expr(resolver, value[1:-1].replace("_", " ")), alpha
    if value.startswith("(") and value.endswith(")"):
        return resolve_expr(resolver, f"var({value[1:-1]})"), alpha
    if resolver is None:
        return None, alpha
    return resolver.resolve_utility(value), alpha


def composite_stop(resolver, rgb, alpha):
    """
    A translucent stop, source-over blended onto the page ground before its hue
    is taken. Measuring the raw token instead reports the full-strength hue of
    a colour that renders as a pale wash, which is how a false SLP-1 is born.
    Returns (rgb, ok): ok is False when the ground cannot be resolved, which
    routes to a NOTE rather than to a guess.
    """
    if rgb is None or alpha is None:
        return None, alpha is not None
    if alpha >= 1.0:
        return rgb, True
    ground = resolver.page_base() if resolver is not None else None
    if ground is None:
        return None, False
    return contrast._composite(rgb, alpha, ground), True


# ── Gradients ─────────────────────────────────────────────────────────────────

_GRADIENT_FUNC_RE = re.compile(
    r"(?<![\w-])((?:repeating-)?(?:linear|radial|conic)-gradient)\s*\(", re.IGNORECASE
)
_TW_GRADIENT_DIR_RE = re.compile(
    r"(?<![\w-])bg-(?:gradient-to-|linear-|radial|conic)", re.IGNORECASE
)
_TW_STOP_RE = re.compile(
    r"(?<![\w-])(?:from|via|to)-(\[[^\]]*\]|\([^)]*\)|[A-Za-z][\w.-]*(?:/[\w.\[\]%]+)?)(?![\w-])"
)
# The first argument of a gradient is a direction, a shape or an interpolation
# hint often enough that it needs naming; none of these is a colour stop.
_NON_STOP_LEADS = {
    "to", "at", "in", "from", "circle", "ellipse",
    "closest-side", "closest-corner", "farthest-side", "farthest-corner",
}
_ANGLE_OR_POSITION_RE = re.compile(
    r"^[+-]?[\d.]+(deg|grad|rad|turn|%|px|rem|em|vw|vh)?$", re.IGNORECASE
)


def gradient_stop_exprs(args_text):
    """
    The ordered colour expressions of one gradient's argument list. Angles,
    shapes, positions and interpolation hints are discarded; only what is left
    can be a stop.
    """
    exprs = []
    for part in split_top_level(args_text, ","):
        token = first_token(part)
        if not token:
            continue
        low = token.lower()
        if low in _NON_STOP_LEADS or _ANGLE_OR_POSITION_RE.match(token):
            continue
        exprs.append(token)
    return exprs


def find_css_gradients(text):
    """(offset, func, [colour expression]) for every gradient function in `text`."""
    out = []
    for m in _GRADIENT_FUNC_RE.finditer(text):
        open_index = m.end() - 1
        close_index = matching_paren(text, open_index)
        if close_index is None:
            continue
        args = text[open_index + 1:close_index]
        out.append((m.start(), m.group(1).lower(), gradient_stop_exprs(args)))
    return out


def find_tailwind_gradient(text):
    """
    (offset, "tw-utility", [stop value]) for a Tailwind gradient, or None.

    The direction utility is required. Without it a bare `from-` reads as
    ordinary prose ("from-scratch"), and a detector that treats prose as a
    colour stop is a detector nobody keeps.
    """
    direction = _TW_GRADIENT_DIR_RE.search(text)
    if direction is None:
        return None
    stops = []
    for m in _TW_STOP_RE.finditer(text):
        value = m.group(1)
        bare = value[1:-1] if value.startswith("[") and value.endswith("]") else value
        if re.match(r"^[\d.]+%?$", bare):
            continue  # a position stop (from-0%), not a colour
        stops.append(value)
    if not stops:
        return None
    return (direction.start(), "tw-utility", stops)


# ── Box shadows ───────────────────────────────────────────────────────────────

_TW_SHADOW_RE = re.compile(r"(?<![\w-])shadow-\[")
_GLOBAL_KEYWORDS = {"none", "inherit", "initial", "unset", "revert", "revert-layer"}


def split_whitespace_top_level(text):
    """Whitespace-separated tokens, keeping a `name(...)` call in one piece."""
    out, buf, depth = [], [], 0
    for char in text:
        if char in "([{":
            depth += 1
        elif char in ")]}":
            depth = max(0, depth - 1)
        if char.isspace() and depth == 0:
            if buf:
                out.append("".join(buf))
                buf = []
        else:
            buf.append(char)
    if buf:
        out.append("".join(buf))
    return out


def parse_shadow(value):
    """
    One comma-separated box-shadow into
    (offset_x_px, offset_y_px, blur_px, spread_px, colour_expr), or None when
    the lengths cannot be read. `inset` is dropped: an inset glow is still a
    glow.
    """
    tokens = [t for t in split_whitespace_top_level(value) if t.lower() != "inset"]
    if not tokens:
        return None
    lengths, colour_parts = [], []
    for token in tokens:
        px = parse_length_px(token)
        if px is not None and len(lengths) < 4 and not colour_parts:
            lengths.append(px)
        else:
            colour_parts.append(token)
    if len(lengths) < 2:
        return None
    offset_x, offset_y = lengths[0], lengths[1]
    blur = lengths[2] if len(lengths) > 2 else 0.0
    spread = lengths[3] if len(lengths) > 3 else 0.0
    return (offset_x, offset_y, blur, spread, " ".join(colour_parts).strip())


def find_shadow_values(text, is_css):
    """
    (offset, raw value) for every box-shadow value in `text`. In CSS that is
    the declaration's value; in a class list it is each `shadow-[…]` arbitrary
    value, with Tailwind's underscores restored to spaces.
    """
    out = []
    if is_css:
        for prop, value in parse_declarations(text):
            if prop in ("box-shadow", "-webkit-box-shadow"):
                out.append((text.find(value) if value in text else 0, value))
        return out
    for m in _TW_SHADOW_RE.finditer(text):
        open_index = m.end() - 1
        depth, close_index = 0, None
        for i in range(open_index, len(text)):
            if text[i] == "[":
                depth += 1
            elif text[i] == "]":
                depth -= 1
                if depth == 0:
                    close_index = i
                    break
        if close_index is None:
            continue
        out.append((m.start(), text[open_index + 1:close_index].replace("_", " ")))
    return out


# ── Borders and radii ─────────────────────────────────────────────────────────

SIDES = ("top", "right", "bottom", "left")
_LOGICAL_SIDE = {
    "inline-start": "left", "inline-end": "right",
    "block-start": "top", "block-end": "bottom",
}
_TW_SIDE = {"t": ("top",), "r": ("right",), "b": ("bottom",), "l": ("left",),
            "s": ("left",), "e": ("right",),
            "x": ("left", "right"), "y": ("top", "bottom")}
# Tailwind's border-width scale is px-valued, so the number in the class name
# IS the pixel count; a bare `border` is 1px. This is a lookup, never
# arithmetic on some other scale.
_TW_BARE_BORDER_PX = 1.0


class BorderBox:
    """One element's border widths and whether it carries a radius at all."""

    def __init__(self):
        self.sides = {side: None for side in SIDES}
        self.radius_positive = False
        self.radius_zero = False

    def set_side(self, side, px):
        self.sides[side] = px

    def set_all(self, px):
        for side in SIDES:
            self.sides[side] = px

    def note_radius(self, px, present):
        """`px` None with `present` True means a radius token this parser cannot
        turn into px. SLP-3 only needs 'greater than 0', so a clearly present
        radius counts as greater than 0."""
        if px is not None:
            if px > 0:
                self.radius_positive = True
            else:
                self.radius_zero = True
        elif present:
            self.radius_positive = True

    def side_tab(self):
        """
        (side, px) when this element is a side tab: exactly one side at or above
        3px, every other side 0 or absent, and a radius greater than 0. None
        otherwise. All three clauses, judged element-local.
        """
        if not self.radius_positive:
            return None
        known = [(side, px) for side, px in self.sides.items() if px is not None]
        thick = [(side, px) for side, px in known if px >= SIDE_BORDER_FLOOR_PX]
        if len(thick) != 1:
            return None
        side, px = thick[0]
        if any(other_px != 0 for other, other_px in known if other != side):
            return None
        return (side, px)


def _read_border_declarations(box, declarations):
    for prop, value in declarations:
        if prop.startswith("border-radius") or (
            prop.startswith("border-") and prop.endswith("-radius")
        ):
            first = first_token(value)
            box.note_radius(parse_length_px(first), bool(first))
            continue
        if prop == "border-width":
            widths = [parse_length_px(t) for t in split_whitespace_top_level(value)]
            if len(widths) == 1:
                box.set_all(widths[0])
            elif len(widths) >= 4:
                for side, px in zip(SIDES, widths[:4]):
                    box.set_side(side, px)
            elif len(widths) == 2:
                box.set_side("top", widths[0])
                box.set_side("bottom", widths[0])
                box.set_side("right", widths[1])
                box.set_side("left", widths[1])
            elif len(widths) == 3:
                box.set_side("top", widths[0])
                box.set_side("right", widths[1])
                box.set_side("left", widths[1])
                box.set_side("bottom", widths[2])
            continue
        if prop == "border":
            box.set_all(_leading_width(value))
            continue
        m = re.match(r"^border-([a-z-]+?)(-width)?$", prop)
        if not m:
            continue
        name = _LOGICAL_SIDE.get(m.group(1), m.group(1))
        if name in SIDES:
            box.set_side(name, _leading_width(value))


def _leading_width(value):
    """The width of a `border`/`border-<side>` shorthand: its first length."""
    for token in split_whitespace_top_level(value):
        px = parse_length_px(token)
        if px is not None:
            return px
    return None


_TW_BORDER_RE = re.compile(r"^border(?:-(t|r|b|l|s|e|x|y))?(?:-(.+))?$")
_TW_ROUNDED_RE = re.compile(r"^rounded(?:-(.+))?$")


def _read_border_classes(box, tokens):
    for token in tokens:
        rounded = _TW_ROUNDED_RE.match(token)
        if rounded:
            suffix = rounded.group(1)
            if suffix is None:
                box.note_radius(None, True)
                continue
            tail = suffix.rsplit("-", 1)[-1] if "-" in suffix else suffix
            if tail == "none":
                box.note_radius(0.0, True)
            elif tail.startswith("[") and tail.endswith("]"):
                box.note_radius(parse_length_px(tail[1:-1].replace("_", " ")), True)
            else:
                box.note_radius(None, True)
            continue
        border = _TW_BORDER_RE.match(token)
        if not border:
            continue
        side_key, value = border.group(1), border.group(2)
        targets = _TW_SIDE.get(side_key, SIDES)
        if value is None:
            for side in targets:
                box.set_side(side, _TW_BARE_BORDER_PX)
            continue
        if value.startswith("[") and value.endswith("]"):
            px = parse_length_px(value[1:-1].replace("_", " "))
        elif re.match(r"^\d+(\.\d+)?$", value):
            px = float(value)
        else:
            continue  # a colour utility (border-transparent), not a width
        if px is not None:
            for side in targets:
                box.set_side(side, px)


# ── SLP-2 clip / fill / background source ─────────────────────────────────────

_TW_BG_SOURCE_RE = re.compile(r"(?<![\w-])bg-[\[(]")
_JS_BG_PROPS = ("background", "background-image")


def _clip_is_text(declarations, tokens):
    """
    True when the element clips its background to its TEXT. The clip value is
    what is matched, never the `bg-clip-` prefix, so `bg-clip-padding` can
    never be mistaken for it.
    """
    if "bg-clip-text" in tokens:
        return True
    for prop, value in declarations:
        if prop in ("background-clip", "-webkit-background-clip"):
            if value.strip().strip("\"'").lower() == "text":
                return True
    return False


def _fill_is_transparent(declarations, tokens):
    if "text-transparent" in tokens:
        return True
    for prop, value in declarations:
        if prop == "color" and value.strip().strip("\"'").lower() == "transparent":
            return True
    return False


def _has_background_source(text, declarations, tokens):
    if _GRADIENT_FUNC_RE.search(text) or _TW_GRADIENT_DIR_RE.search(text):
        return True
    if _TW_BG_SOURCE_RE.search(text):
        return True
    for prop, _value in declarations:
        if prop in _JS_BG_PROPS:
            return True
    return False


# ── Cyan on dark ──────────────────────────────────────────────────────────────

_INK_NAME_RE = re.compile(r"(foreground|text|ink|accent|primary|ring|link)", re.IGNORECASE)
_GROUND_NAME_RE = re.compile(
    r"(background|surface|card|popover|sidebar|canvas|page)", re.IGNORECASE
)


def _is_cyan(rgb):
    if not is_saturated(rgb):
        return False
    hue = hsl_hue(rgb)
    return hue is not None and CYAN_BAND_DEG[0] <= hue <= CYAN_BAND_DEG[1]


def _cyan_on_dark(resolver, declarations):
    """
    (ink property, ground property) when ONE dark token block sets both a cyan
    ink and a dark ground, else None. Both halves in the same block is the
    whole narrowing: a cyan accent on a light theme is not the AI dark look.
    """
    cyan_ink = None
    dark_ground = None
    for prop, value in declarations:
        rgb = resolve_expr(resolver, first_token(value))
        if rgb is None:
            continue
        if cyan_ink is None and (prop == "color" or _INK_NAME_RE.search(prop)) \
                and _is_cyan(rgb):
            cyan_ink = prop
        if dark_ground is None and (
            prop in ("background", "background-color") or _GROUND_NAME_RE.search(prop)
        ) and contrast.relative_luminance(rgb) <= DARK_GROUND_LUMINANCE:
            dark_ground = prop
    if cyan_ink is not None and dark_ground is not None:
        return (cyan_ink, dark_ground)
    return None


# ── Findings ──────────────────────────────────────────────────────────────────

class Findings:
    """Collects ERROR and NOTE lines, deduplicated and reported in file order."""

    def __init__(self, rel, source_lines):
        self.rel = rel
        self.source_lines = source_lines
        self._errors = {}
        self._notes = {}

    def _waived(self, lineno, ctl):
        """The inline `dx-waive <CTL>` convention, read from the RAW source line
        because the parser has no comments in it. An L1 waiver downgrades the
        line and the run still exits 1: the check never silences an L1."""
        if 1 <= lineno <= len(self.source_lines):
            m = WAIVER_RE.search(self.source_lines[lineno - 1])
            if m and m.group(1).upper() == ctl:
                return True
        return False

    def error(self, lineno, ctl, found, suggest):
        key = (lineno, ctl, found)
        if key in self._errors:
            return
        if self._waived(lineno, ctl):
            # The downgraded variant token-audit.py defines, character for
            # character: the tail is the approver reminder, not a `suggest:`.
            self._errors[key] = (
                f"ERROR {self.rel}:{lineno} [{ctl}][waiver-claimed] {found}"
                f" — verify approver in decision record"
            )
        else:
            self._errors[key] = checklib.emit_error(
                self.rel, lineno, ctl, found, suggest)

    def note(self, lineno, what):
        key = (lineno, what)
        if key in self._notes:
            return
        self._notes[key] = (
            f"NOTE  {CHECK_NAME}: could not resolve {what} at "
            f"{self.rel}:{lineno}, verify manually"
        )

    def lines(self):
        rows = [(key[0], 0, line) for key, line in self._errors.items()]
        rows += [(key[0], 1, line) for key, line in self._notes.items()]
        rows.sort(key=lambda row: (row[0], row[1], row[2]))
        return [row[2] for row in rows]


def _line_of(cand, text, offset):
    """The 1-based line an offset inside a candidate's text falls on."""
    return cand["line"] + text.count("\n", 0, offset)


# ── The three rules ───────────────────────────────────────────────────────────

def _check_gradient(cand, resolver, out):
    text = cand["text"]
    found = find_css_gradients(text)
    tw = find_tailwind_gradient(text)
    if tw is not None:
        found.append(tw)
    for offset, func, stops in found:
        lineno = _line_of(cand, text, offset)
        in_band = 0
        for stop in stops:
            if func == "tw-utility":
                rgb, alpha = resolve_tailwind_colour(resolver, stop)
            else:
                rgb, alpha = resolve_expr(resolver, stop), 1.0
            if rgb is None or alpha is None:
                out.note(lineno, f"gradient stop '{stop}'")
                continue
            rgb, ok = composite_stop(resolver, rgb, alpha)
            if not ok or rgb is None:
                out.note(lineno, f"the page ground behind gradient stop '{stop}'")
                continue
            if in_hue_band(rgb):
                in_band += 1
        if in_band >= MIN_STOPS_IN_BAND:
            out.error(
                lineno, "SLP-1",
                f"{func} with {in_band} stops at or above {HUE_BAND_DEG:.0f} degrees "
                f"(purple/violet gradient palette)",
                "use one product colour, or a neutral ramp; a two-stop purple "
                "gradient is the default AI aesthetic")


def _check_glow(cand, resolver, out, is_css):
    text = cand["text"]
    for offset, value in find_shadow_values(text, is_css):
        lineno = _line_of(cand, text, offset)
        for piece in split_top_level(value, ","):
            piece = piece.strip()
            if not piece or piece.lower() in _GLOBAL_KEYWORDS:
                continue
            parsed = parse_shadow(piece)
            if parsed is None:
                out.note(lineno, f"the lengths of box-shadow '{piece}'")
                continue
            offset_x, offset_y, blur, _spread, colour_expr = parsed
            # Geometry first, then the colour. A hairline ring fails on blur, so
            # its colour is never asked for and never becomes a NOTE.
            if blur < GLOW_BLUR_FLOOR_PX:
                continue
            if max(abs(offset_x), abs(offset_y)) > GLOW_OFFSET_CEILING_PX:
                continue
            if not colour_expr:
                continue
            rgb = resolve_expr(resolver, colour_expr)
            if rgb is None:
                out.note(lineno, f"box-shadow colour '{colour_expr}'")
                continue
            if not is_saturated(rgb):
                continue
            out.error(
                lineno, "SLP-1",
                f"glow accent: box-shadow blur {blur:g}px at offset "
                f"{max(abs(offset_x), abs(offset_y)):g}px in a saturated colour",
                "drop the glow, or use an elevation shadow with a real offset "
                "and a neutral colour")


def _check_cyan_on_dark(cand, resolver, out):
    hit = _cyan_on_dark(resolver, parse_declarations(cand["text"]))
    if hit is None:
        return
    ink, ground = hit
    out.error(
        cand["line"], "SLP-1",
        f"cyan-on-dark theming: a dark token block sets '{ink}' to a cyan ink "
        f"and '{ground}' to a dark ground",
        "theme the dark mode from the product's own colours; cyan on near-black "
        "is the default AI dark look")


def _check_clip_text(cand, out, is_css):
    text = cand["text"]
    if is_css:
        declarations = parse_declarations(text)
        tokens = []
    else:
        declarations = element_declarations(text)
        tokens = class_tokens(text)
    if not _clip_is_text(declarations, tokens):
        return
    if not _fill_is_transparent(declarations, tokens):
        return
    if not _has_background_source(text, declarations, tokens):
        return
    out.error(
        cand["line"], "SLP-2",
        "gradient text: a background clipped to text with a transparent fill",
        "set the text in a solid token colour; gradient text is unreadable at "
        "small sizes and is the default AI headline treatment")


def _check_side_tab(cand, out, is_css):
    text = cand["text"]
    box = BorderBox()
    if is_css:
        _read_border_declarations(box, parse_declarations(text))
    else:
        _read_border_declarations(box, element_declarations(text))
        _read_border_classes(box, class_tokens(text))
    hit = box.side_tab()
    if hit is None:
        return
    side, px = hit
    out.error(
        cand["line"], "SLP-3",
        f"side-tab accent: {px:g}px {side} border on a rounded container with "
        f"no other border",
        "carry the accent with a heading, an icon or spacing; a thick side "
        "border on a rounded card is the most recognisable AI-UI tell")


# ── File scan ─────────────────────────────────────────────────────────────────

def check_file(filepath, resolver=None, candidates=None):
    """
    Scan a single file. Returns a list of ERROR / NOTE strings.

    `resolver` is a contrast.TokenResolver built from the product's token CSS.
    Without one, every `var()` colour is unresolvable, which is a NOTE per stop
    rather than a pass.
    `candidates`: this file's records from checklib.astgrep_scan(). Omit it and
    the file is scanned on its own; scan_paths() passes a pre-grouped list so a
    whole tree costs one ast-grep invocation.
    """
    results = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return results

    try:
        with open(filepath, encoding="utf-8", errors="replace") as fh:
            source = fh.read().splitlines()
    except OSError as exc:
        results.append(f"ERROR {filepath}: cannot read file — {exc}")
        return results

    if candidates is None:
        candidates = checklib.astgrep_scan([filepath], CHECK_NAME)

    out = Findings(os.path.relpath(filepath), source)
    for cand in candidates:
        context = (cand.get("metadata") or {}).get("context")
        # A candidate found by re-scanning an embedded style region is CSS, and
        # so is anything the css rules matched. Everything else is a class list.
        is_css = cand.get("surface") == "style"
        if context == "gradient":
            _check_gradient(cand, resolver, out)
        elif context == "shadow":
            _check_glow(cand, resolver, out, is_css)
        elif context == "dark-block":
            _check_cyan_on_dark(cand, resolver, out)
        elif context == "clip":
            _check_clip_text(cand, out, is_css)
        elif context == "side-border":
            _check_side_tab(cand, out, is_css)
    results.extend(out.lines())
    return results


def find_tokens_file(explicit, start):
    """
    The product's token CSS: `--tokens` wins, else `app/globals.css` then
    `globals.css`, walking up from `start`. Same names and same order as
    detect.py's discovery, so both front ends read the same file.
    """
    if explicit:
        return explicit
    here = os.path.abspath(start)
    if os.path.isfile(here):
        here = os.path.dirname(here)
    while True:
        for cand in (os.path.join(here, "app", "globals.css"),
                     os.path.join(here, "globals.css")):
            if os.path.isfile(cand):
                return cand
        parent = os.path.dirname(here)
        if parent == here:
            return None
        here = parent


def build_resolver(tokens_file):
    """
    (TokenResolver, note). With no readable token map the resolver is empty
    rather than absent: a direct hex still resolves, because it needs no map,
    and every `var()` resolves to None, which is a NOTE per stop. The returned
    note says the run had no map, so a quiet result is never mistaken for a
    clean one.
    """
    if tokens_file is None:
        return contrast.TokenResolver(""), (
            f"NOTE  {CHECK_NAME}: no token map found (--tokens <css>, or "
            f"app/globals.css beside the target), so var() colours cannot "
            f"resolve; verify colour findings manually"
        )
    try:
        with open(tokens_file, encoding="utf-8") as fh:
            css = fh.read()
    except OSError as exc:
        return contrast.TokenResolver(""), (
            f"NOTE  {CHECK_NAME}: could not read the token map {tokens_file} "
            f"({exc}), so var() colours cannot resolve; verify colour findings "
            f"manually"
        )
    return contrast.TokenResolver(css), None


def scan_paths(paths, tokens_file=None):
    """
    Walk paths, collect ERROR/NOTE lines.

    checklib.iter_target_files() stays the single walk policy and the file list
    is handed to ast-grep explicitly: letting ast-grep walk a directory would
    import .gitignore semantics the Python walker does not have, and a
    gitignored source file would be skipped silently.

    Raises checklib.AstGrepError when ast-grep is missing, too old or broken.
    """
    resolver, note = build_resolver(find_tokens_file(tokens_file, paths[0] if paths else "."))
    results = [note] if note else []
    files = []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            results.append(f"ERROR {CHECK_NAME}: path not found: {val}")
        else:
            files.append(val)
    by_file = checklib.group_candidates(checklib.astgrep_scan(files, CHECK_NAME))
    for val in files:
        results.extend(
            check_file(val, resolver, by_file.get(os.path.realpath(val), []))
        )
    return results


# ── Self-test ─────────────────────────────────────────────────────────────────

# The calibration tokens, the anti-specimen tokens and the two grounds the
# compositing arm needs. `--demo-slop-glow` is deliberately unresolvable:
# `transparent` maps to None, so the whole color-mix does too, which is the
# live case for the NOTE channel.
_SELF_TEST_TOKENS = """:root {
  --background: #fafafa;
  --surface: #ffffff;
  --tw-blue: #0064ff;
  --casesync: #3e63dd;
  --sec-getting-started: #5b5bd6;
  --sidebar-border: #e4e4e7;
  --demo-slop-grad-a: #7c3aed;
  --demo-slop-grad-b: #a21caf;
  --demo-slop-border: color-mix(in oklab, var(--demo-slop-grad-a) 25%, var(--surface));
  --demo-slop-glow: color-mix(in oklab, var(--demo-slop-grad-a) 35%, transparent);
  --violet-500: #8b5cf6;
  --purple-500: #a855f7;
  --cyan-ink: #22d3ee;
  --near-black: #0b0f14;
}
"""


def run_self_test():
    import tempfile

    resolver = contrast.TokenResolver(_SELF_TEST_TOKENS)
    failures = []
    case_count = 0

    def check_eq(name, want, got):
        nonlocal case_count
        case_count += 1
        if want != got:
            failures.append(f"FAIL {name}: want: {want!r}; got: {got!r}")

    def scan(content, ext):
        with tempfile.NamedTemporaryFile(
            suffix=ext, mode="w", delete=False, encoding="utf-8"
        ) as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, resolver)
        os.unlink(tf.name)
        return res

    def controls(results):
        found = []
        for line in results:
            m = re.search(r"^ERROR \S+ \[([A-Z0-9-]+)\]", line)
            if m:
                found.append(m.group(1))
        return sorted(found)

    def assert_controls(name, content, ext, want):
        nonlocal case_count
        case_count += 1
        got = controls(scan(content, ext))
        if got != sorted(want):
            failures.append(f"FAIL {name}: want: {sorted(want)!r}; got: {got!r}")

    def assert_notes(name, content, ext, want_note_count):
        nonlocal case_count
        case_count += 1
        res = scan(content, ext)
        notes = [r for r in res if r.startswith("NOTE")]
        errs = [r for r in res if r.startswith("ERROR")]
        if len(notes) != want_note_count or errs:
            failures.append(
                f"FAIL {name}: want {want_note_count} NOTE and no ERROR; "
                f"got notes: {notes!r}, errors: {errs!r}")

    # ── The hue is the sRGB HSL hue, not the OKLCH hue ─────────────────────────
    # These six numbers are the calibration the 255-degree ruling rests on. If a
    # later reader swaps the colour space, every one of them moves and this
    # block is where it fails.
    check_eq("hue: --casesync #3e63dd is 226.04, below the band",
             226.0, round(hsl_hue((0x3e, 0x63, 0xdd)), 0))
    check_eq("hue: --sec-getting-started iris-9 #5b5bd6 is exactly 240.00",
             240.0, round(hsl_hue((0x5b, 0x5b, 0xd6)), 2))
    check_eq("hue: violet-500 #8b5cf6 is 258.31, so 260 would have let it through",
             258.31, round(hsl_hue((0x8b, 0x5c, 0xf6)), 2))
    check_eq("hue: violet-600 #7c3aed is 262.12",
             262.12, round(hsl_hue((0x7c, 0x3a, 0xed)), 2))
    check_eq("hue: purple-500 #a855f7 is 270.74",
             270.74, round(hsl_hue((0xa8, 0x55, 0xf7)), 2))
    check_eq("hue: fuchsia-700 #a21caf is 294.69",
             294.69, round(hsl_hue((0xa2, 0x1c, 0xaf)), 2))
    check_eq("band: both calibration tokens sit below 255",
             (False, False),
             (in_hue_band((0x3e, 0x63, 0xdd)), in_hue_band((0x5b, 0x5b, 0xd6))))
    check_eq("band: the canonical AI purples sit inside it",
             (True, True, True),
             (in_hue_band((0x8b, 0x5c, 0xf6)), in_hue_band((0x7c, 0x3a, 0xed)),
              in_hue_band((0xa8, 0x55, 0xf7))))
    check_eq("band: a colour at exactly 255.0 degrees is in band, inclusive",
             True, in_hue_band(rgb_at_hue(255.0)))
    check_eq("band: an achromatic colour has no hue at all",
             None, hsl_hue((0x80, 0x80, 0x80)))
    # --demo-slop-border reads as HSL saturation 100 percent and is a pale wash
    # in fact, which is why the gate is OKLCH chroma and not HSL saturation.
    wash = resolver.resolve("--demo-slop-border")
    check_eq("chroma: the pale wash resolves and is gated out despite its hue",
             (True, False), (wash is not None, in_hue_band(wash)))

    # ── SLP-1 gradient palette ────────────────────────────────────────────────
    assert_controls(
        "SLP-1: two stops both in band fires",
        ".g { background: linear-gradient(135deg, var(--demo-slop-grad-a), "
        "var(--demo-slop-grad-b)); }", ".css", ["SLP-1"])
    assert_controls(
        "SLP-1: one stop in band and one out does not fire",
        ".g { background: linear-gradient(135deg, var(--demo-slop-grad-a), "
        "var(--tw-blue)); }", ".css", [])
    assert_controls(
        "SLP-1: the two calibration tokens stay clear (a 240 band would flag them)",
        ".g { background: linear-gradient(90deg, var(--casesync), "
        "var(--sec-getting-started)); }", ".css", [])
    assert_controls(
        "SLP-1: a gradient written in tsx fires the same way",
        'const G = "linear-gradient(135deg, #7c3aed, #a21caf)";', ".ts", ["SLP-1"])
    assert_controls(
        "SLP-1: a Tailwind stop triple fires through the @theme alias",
        '<div className="bg-linear-to-r from-violet-500 to-purple-500" />',
        ".tsx", ["SLP-1"])
    assert_controls(
        "SLP-1: a from- word in prose is not a colour stop",
        "<p>Everything here is built from-scratch, to-order.</p>", ".tsx", [])
    assert_controls(
        "SLP-1: a radial gradient counts, and its shape is not a stop",
        ".g { background: radial-gradient(circle at center, #7c3aed 0%, "
        "#a855f7 100%); }", ".css", ["SLP-1"])

    # ── SLP-1 glow ────────────────────────────────────────────────────────────
    assert_controls(
        "SLP-1: the hairline ring at blur 0 is a border, not a glow",
        '<button className="shadow-[0_0_0_1px_var(--sidebar-border)]" />',
        ".tsx", [])
    assert_controls(
        "SLP-1: blur 10px at offset 2px in a saturated colour is a glow",
        '<span className="shadow-[0_2px_10px_var(--demo-slop-grad-a)]" />',
        ".tsx", ["SLP-1"])
    assert_controls(
        "SLP-1: both glow boundaries are inclusive (blur 6px, offset 2px)",
        ".b { box-shadow: 0 2px 6px var(--demo-slop-grad-a); }", ".css", ["SLP-1"])
    assert_controls(
        "SLP-1: blur 5px is below the floor",
        ".b { box-shadow: 0 2px 5px var(--demo-slop-grad-a); }", ".css", [])
    assert_controls(
        "SLP-1: offset 3px is above the ceiling, so it is elevation not glow",
        ".b { box-shadow: 0 3px 10px var(--demo-slop-grad-a); }", ".css", [])
    assert_controls(
        "SLP-1: a neutral shadow colour is not saturated",
        ".b { box-shadow: 0 2px 10px #808080; }", ".css", [])

    # ── SLP-1 cyan on dark ────────────────────────────────────────────────────
    assert_controls(
        "SLP-1: a dark block setting both the cyan ink and the dark ground fires",
        ".dark { --foreground: var(--cyan-ink); --background: var(--near-black); }",
        ".css", ["SLP-1"])
    assert_controls(
        "SLP-1: a dark block with only the dark ground does not fire",
        ".dark { --foreground: #ffffff; --background: var(--near-black); }",
        ".css", [])
    assert_controls(
        "SLP-1: a cyan ink outside any dark block does not fire",
        ":root { --sec-products: var(--cyan-ink); }", ".css", [])

    # ── SLP-2 gradient text ───────────────────────────────────────────────────
    assert_controls(
        "SLP-2: bg-clip-padding never matches (the live cva base string)",
        'const button = cva("inline-flex rounded-lg border border-transparent '
        'bg-clip-padding text-sm font-medium");', ".ts", [])
    assert_controls(
        "SLP-2: className and the gradient style on different lines still fires",
        "export function T() {\n  return (\n    <span\n"
        '      className="bg-clip-text text-sm font-medium text-transparent"\n'
        "      style={{ backgroundImage: SLOP_GRADIENT }}\n"
        "    >\n      Term 3 broadcast\n    </span>\n  );\n}\n", ".tsx", ["SLP-2"])
    assert_controls(
        "SLP-2: a clip with no transparent fill does not fire",
        '<span className="bg-clip-text text-sm" style={{ background: "url(x)" }} />',
        ".tsx", [])
    assert_controls(
        "SLP-2: a transparent fill with no clip does not fire",
        '<span className="text-transparent bg-linear-to-r from-violet-500" />',
        ".tsx", [])
    assert_controls(
        "SLP-2: the CSS spelling fires on the same three clauses",
        ".title { background-image: linear-gradient(90deg, #7c3aed, #a21caf); "
        "-webkit-background-clip: text; background-clip: text; "
        "color: transparent; }", ".css", ["SLP-1", "SLP-2"])
    assert_controls(
        "SLP-2: background-clip: padding-box is never gradient text",
        ".chip { background-clip: padding-box; color: transparent; "
        "background: var(--surface); }", ".css", [])

    # ── SLP-3 side-tab borders ────────────────────────────────────────────────
    assert_controls(
        "SLP-3: one side at 3px with no radius does not fire (the blockquote)",
        ".prose blockquote { border-left: 3px solid var(--tw-blue); "
        "padding-left: 16px; }", ".css", [])
    assert_controls(
        "SLP-3: the same rule with a radius does fire, so the pair is pinned",
        ".prose blockquote { border-left: 3px solid var(--tw-blue); "
        "border-radius: 8px; padding-left: 16px; }", ".css", ["SLP-3"])
    assert_controls(
        "SLP-3: border-l-2 is below the 3px floor and carries no radius",
        '<div className="-ml-px block border-l-2 py-1 pr-2" />', ".tsx", [])
    assert_controls(
        "SLP-3: border-l-4 on a rounded card is the side tab",
        '<div className="rounded-lg border-l-4 border-l-casesync p-4" />',
        ".tsx", ["SLP-3"])
    assert_controls(
        "SLP-3: a hairline on the other three sides clears the pair requirement",
        '<div className="rounded-lg border border-border border-l-4 p-4" />',
        ".tsx", [])
    assert_controls(
        "SLP-3: border-x-4 sets two sides, so it is not a side tab",
        '<div className="rounded-lg border-x-4 p-4" />', ".tsx", [])
    assert_controls(
        "SLP-3: rounded-none is a radius of 0, not a present radius",
        '<div className="rounded-none border-l-4 p-4" />', ".tsx", [])
    assert_controls(
        "SLP-3: an inline style side tab is read off the element too",
        '<div style={{ borderLeft: "4px solid red", borderRadius: "8px" }} />',
        ".tsx", ["SLP-3"])

    # ── The NOTE channel: never a guess, never a silent pass ───────────────────
    assert_notes(
        "NOTE: an unresolvable color-mix stop is named, not guessed",
        ".g { background: linear-gradient(90deg, var(--demo-slop-glow), "
        "var(--demo-slop-glow)); }", ".css", 1)
    assert_notes(
        "NOTE: an oklch() colour the resolver cannot parse is named",
        ".g { background: linear-gradient(90deg, oklch(0.6 0.2 300), "
        "oklch(0.5 0.2 310)); }", ".css", 2)
    assert_notes(
        "NOTE: an 8-digit hex is unresolvable, so alpha in the literal is named",
        ".g { background: linear-gradient(90deg, #a855f766, #7c3aed66); }",
        ".css", 2)
    assert_notes(
        "NOTE: a glow colour that will not resolve is named once geometry clears",
        '<span className="shadow-[0_2px_10px_var(--demo-slop-glow)]" />',
        ".tsx", 1)
    assert_notes(
        "NOTE: a box-shadow whose lengths are a bare variable is named",
        ".b { box-shadow: var(--shadow-md); }", ".css", 1)

    # A run with no token map still resolves a direct hex, resolves no var(),
    # and says so rather than passing quietly.
    case_count += 1
    bare, bare_note = build_resolver(None)
    got_bare = (
        resolve_expr(bare, "#7c3aed"),
        resolve_expr(bare, "var(--demo-slop-grad-a)"),
        "no token map found" in (bare_note or ""),
    )
    if got_bare != ((0x7c, 0x3a, 0xed), None, True):
        failures.append(
            f"FAIL no token map resolves hex, not var(), and says so: "
            f"got: {got_bare!r}")

    # ── The L1 waiver convention: downgraded, still an ERROR ──────────────────
    case_count += 1
    waived = scan(
        ".g { /* dx-waive SLP-1 reason=\"anti-specimen\" */ "
        "background: linear-gradient(135deg, #7c3aed, #a21caf); }", ".css")
    waived_errs = [r for r in waived if r.startswith("ERROR")]
    if (len(waived_errs) != 1
            or "[SLP-1][waiver-claimed]" not in waived_errs[0]
            or not waived_errs[0].endswith("verify approver in decision record")):
        failures.append(
            f"FAIL waiver-claimed still errors: want one downgraded SLP-1 line; "
            f"got: {waived_errs!r}")

    # ── Fixtures ──────────────────────────────────────────────────────────────
    fixtures_dir = os.path.join(_CHECKS_DIR, "fixtures", "slop-scan")
    fixture_resolver, _ = build_resolver(
        os.path.join(fixtures_dir, "pass-tokens.css"))
    for fname in sorted(os.listdir(fixtures_dir)):
        case_count += 1
        errs = [r for r in check_file(os.path.join(fixtures_dir, fname),
                                      fixture_resolver) if r.startswith("ERROR")]
        if fname.startswith("fail") and not errs:
            failures.append(f"FAIL fixture {fname}: expected >=1 ERROR, got none")
        elif fname.startswith("pass") and errs:
            failures.append(f"FAIL fixture {fname}: expected 0 ERRORs, got: {errs}")

    # ── The provisioning contract ─────────────────────────────────────────────
    checklib.astgrep_provisioning_cases(
        "slop-scan.py",
        os.path.join("fixtures", "slop-scan", "fail.css"),
        check_eq,
    )

    checklib.report_self_test(failures, case_count)


# ── Entry point ───────────────────────────────────────────────────────────────

USAGE = "Usage: python3 checks/slop-scan.py [--tokens <file>] <path>... | --self-test"


def main():
    args = sys.argv[1:]
    if not args:
        print(USAGE)
        sys.exit(1)
    if "--self-test" in args:
        try:
            run_self_test()
        except checklib.AstGrepError as exc:
            # A layer that did not run never reports SELF-TEST OK.
            exc.report()
            sys.exit(1)
        return

    tokens_file = None
    if "--tokens" in args:
        i = args.index("--tokens")
        if i + 1 >= len(args):
            print(f"ERROR {CHECK_NAME}: --tokens needs a CSS file argument")
            sys.exit(1)
        tokens_file = args[i + 1]
        args = args[:i] + args[i + 2:]
        if not os.path.isfile(tokens_file):
            print(f"ERROR {CHECK_NAME}: --tokens file not found: {tokens_file}")
            sys.exit(1)
    if not args:
        print(USAGE)
        sys.exit(1)

    try:
        results = scan_paths(args, tokens_file)
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
