#!/usr/bin/env python3
"""
Type scan — checks/type-scan.py
Scans UI source files for the statically-resolvable subset of TYP-1, TYP-2,
TYP-3, TYP-4, LAY-4 and TYP-6 — typography and measure violations detectable
from source text alone, without rendered layout.

Detection rules (line-local only)
──────────────────────────────────
Rule        Control   What is caught
FONT        TYP-1     A CSS `font-family:` or a Tailwind `font-[…]` arbitrary
            (L1)      value naming a typeface other than Plus Jakarta Sans or
                      Inter. The token names font-display / font-body /
                      font-sans / --font-display / --font-body are allowed.
SIZEFLOOR   TYP-2     A `font-size:` or Tailwind `text-[Npx]`/`text-[Nrem]` (rem
            (L1)      converted at ×16) with N < 14 (body floor). Labels may go
                      to 12px, so 12–13px is flagged with a note that it's only
                      a violation outside a label context (the 12/14 ambiguity
                      is in the suggest text).
LINEHEIGHT  TYP-2     An explicit numeric `line-height:` or Tailwind
            (L1)      `leading-[N]` clearly outside the 1.5–1.6 body band.
                      Conservative: only unitless / em values are judged; px
                      and percentage line-heights are NOT (needs the font size).
                      The band is BODY-scoped — line-heights inside an h1–h6 CSS
                      rule, or on a heading element, are excluded (headings run
                      tighter by design; see controls/typ-2.md).
ONSCALE     TYP-3     A `text-[Npx]`/`text-[Nrem]` or `font-size:Npx`/`Nrem`
            (L1)      whose size (rem converted at ×16) is not on the Tailwind
                      default type scale {128,96,72,60,48,36,30,24,20,18,16,14,12}.
                      A fractional-pixel size is off-scale by definition, even if
                      its rounded value happens to be in the set. The scale is
                      sourced from TYP-3's catalog `verify` field (see
                      TYPE_SCALE below) so it cannot drift.
ALLCAPS     TYP-4     A `text-transform: uppercase` declaration or an `uppercase`
            (L2)      Tailwind class (in a class/className attr or a class-list
                      string). Text is never set in all-caps, at any length;
                      genuine acronyms are literal capitals in content, not a
                      transform, so they are not matched.
MEASURE     LAY-4     A line-measure cap ALREADY WRITTEN in `ch` that runs past
            TYP-6     its control's ceiling: above 80ch for LAY-4, above 75ch for
            (both L2) TYP-6. One rule body, two thresholds, read from the two
                      controls' catalog titles so they cannot drift (see
                      MEASURE_FALLBACK below). Both ceilings are tested for every
                      cap, so a cap above 80ch reports twice, once under each id,
                      the way one font size already reports under TYP-2 and
                      TYP-3. Two findings keep the two controls independently
                      selectable with --rules and independently waivable.
                      Forms read: `max-w-[Nch]`, the arbitrary property
                      `[max-width:Nch]`, a CSS `max-width: Nch`, a JSX
                      `style={{ maxWidth: 'Nch' }}`, and a `var()` whose custom
                      property is defined in the SAME file, reported at the use
                      site. A cap below 45ch is a heading, a label or small
                      print, never running text, so it is never flagged.

What this script does NOT verify
─────────────────────────────────
- A MISSING measure cap (LAY-4 and TYP-6's other half): this is a disallow rule
  over caps already present, never a presence-requiring one. A presence-requiring
  static rule either flags every candidate element or proves nothing, because
  which block is running prose is the judgment half. An element with no cap
  produces no ERROR and no NOTE, and that silence is the contract.
- Font WEIGHTS (TYP-1's "PJS 600 / Inter 400/500/600 only" half): a weight is
  rarely co-located with the family on one line and "approved weight" needs the
  family resolved. Weight enforcement is deferred to the manual pass.
- The 12px-vs-14px floor decision (TYP-2): whether a given element is a "label"
  (12px floor) or "body" (14px floor) needs rendered context. Sizes 12–13px are
  flagged with the ambiguity noted, not asserted as definite body violations.
- Line-heights given in px or % (TYP-2): the 1.5–1.6 ratio needs the font size,
  which is rarely on the same line. Only unitless/em line-heights are judged.
- All-caps via camelCase inline style (TYP-4): `style={{textTransform:'uppercase'}}`
  in JSX is not matched — only the `text-transform: uppercase` CSS form and the
  Tailwind `uppercase` utility (as a class token) are. Rare; deferred to manual.
- A measure written in any unit but `ch` (LAY-4 / TYP-6): converting px, rem or
  a percentage to characters needs the rendered font size, which this file
  already refuses to guess for px and percentage line-heights. A numeric cap in
  another unit gets one NOTE per line, never an ERROR.
- A measure reached through a `var()` chain that leaves the file (LAY-4 /
  TYP-6): out of static reach, the same limit as a family set in a separate
  stylesheet. One NOTE per line, never an ERROR.
- Font families / sizes set in a separate stylesheet the line-local rule can't
  see, or composed from variables / class-name interpolation — out of static
  reach; the manual pass covers them.

Per-rule selection (additive)
─────────────────────────────
`--rules TYP-1,LAY-4` restricts the emitted findings to those control ids
(comma-separated; `--rules=TYP-1` also works). The six valid ids are TYP-1,
TYP-2, TYP-3, TYP-4, LAY-4 and TYP-6. Without the flag every rule runs —
unchanged default. This is the hook detect.py's curated profile uses to run
TYP-1 only, leaving the noisier TYP-2 recording-only. Unknown ids are a usage
error (exit 1); operational errors (path not found) are never filtered.

Output
──────
ERROR <file>:<line> [<CTL-ID>] <found> — suggest: <...>
NOTE  <file>:<line> <message>     (unresolvable / dynamic, never a silent pass)
Exit 0 and print nothing (or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation (NOTE lines alone do not fail).
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

# ── TYP-3 type scale ──────────────────────────────────────────────────────────
# Sourced from TYP-3's catalog `verify` field:
#   "Sizes in {128,96,72,60,48,36,30,24,20,18,16,14,12}; checks/type-scan"
# Read at runtime from standards/catalog.yaml when available (so it cannot drift
# from the catalog), with this set as the embedded fallback if the catalog can't
# be read/parsed. This is Tailwind's default type scale (text-xs … text-9xl).
TYPE_SCALE_FALLBACK = {128, 96, 72, 60, 48, 36, 30, 24, 20, 18, 16, 14, 12}

CATALOG_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "standards", "catalog.yaml",
)


def load_type_scale(path=CATALOG_PATH):
    """
    Read the allowed type-scale set from TYP-3's `verify` field in catalog.yaml:
    `Sizes in {128,96,72,60,48,36,30,24,20,18,16,14,12}; …`. Returns (set, note);
    `note` is non-None if the embedded fallback was used.
    """
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return TYPE_SCALE_FALLBACK, (
            f"NOTE type-scan: could not read {path}; using embedded TYP-3 scale"
        )
    # Find TYP-3's verify line and pull the {…} set out of it.
    idx = text.find("id: TYP-3")
    section = text[idx:] if idx != -1 else text
    m = re.search(r"verify:\s*\"[^\"]*Sizes in\s*\{([0-9,\s]+)\}", section)
    if not m:
        return TYPE_SCALE_FALLBACK, (
            f"NOTE type-scan: could not parse TYP-3 scale from {path}; using embedded set"
        )
    scale = {int(n) for n in re.findall(r"\d+", m.group(1))}
    if not scale:
        return TYPE_SCALE_FALLBACK, (
            f"NOTE type-scan: TYP-3 scale parsed empty from {path}; using embedded set"
        )
    return scale, None


# ── LAY-4 / TYP-6 measure thresholds ──────────────────────────────────────────
# Both controls cap a line measure written in `ch`, with different numbers, so
# one rule body serves both. The numbers live in the sentence a design lead
# ratifies, each control's catalog `title`, and are read from there at runtime
# for the same reason the type scale is: so they cannot drift from the catalog.
# This is the embedded fallback.
#
# LAY-4's title: "target ~66ch, never above 80ch (WCAG 1.4.8)".
# TYP-6's title: "roughly 45-75 characters per line (target 40-60)".
#
# Ordered LAY-4 first so a cap that breaks both ceilings always reports in that
# order, which keeps the emitted lines stable between runs.
MEASURE_FALLBACK = {
    "ceilings": {"LAY-4": (80, "~66ch"), "TYP-6": (75, "40-60ch")},
    # TYP-6's acceptable band starts at 45, so a cap under 45ch is a heading, a
    # label or small print rather than running text. In a ceiling-only rule the
    # floor is pure suppression and can never cause a false negative, because
    # nothing under 45 could ever exceed 75. It is measured BY VALUE and never by
    # element context: this repo has 44ch `text-sm` captions on `<p>`, so a
    # heading-tag test would leave genuine narrow running text unexempted.
    "floor": 45,
}

# The control ids the measure rule can emit, in emission order.
MEASURE_CONTROLS = ("LAY-4", "TYP-6")

_LAY4_CEILING_RE = re.compile(r"never above\s*(\d+)\s*ch", re.IGNORECASE)
_LAY4_TARGET_RE = re.compile(r"target\s*~\s*(\d+)\s*ch", re.IGNORECASE)
_TYP6_BAND_RE = re.compile(r"roughly\s*(\d+)\s*-\s*(\d+)\s*characters", re.IGNORECASE)
_TYP6_TARGET_RE = re.compile(r"target\s*(\d+)\s*-\s*(\d+)\s*\)", re.IGNORECASE)


def _catalog_title(text, ctrl_id):
    """The `title:` of one control in catalog.yaml, quotes stripped, or None.
    Scans forward from the control's own `id:` line, so the first `title:` found
    is that control's own."""
    idx = text.find(f"id: {ctrl_id}\n")
    if idx == -1:
        return None
    m = re.search(r"title:\s*(.+)", text[idx:])
    if not m:
        return None
    return m.group(1).strip().strip("'\"")


def load_measure(path=CATALOG_PATH):
    """
    Read LAY-4's and TYP-6's measure ceilings, their targets and the 45ch floor
    out of those two controls' `title` fields in catalog.yaml. Returns
    (measure, note) in MEASURE_FALLBACK's shape; `note` is non-None if any part
    fell back, so the caller can say so once instead of scanning on a silently
    invented number.
    """
    def fallback(reason):
        return MEASURE_FALLBACK, (
            f"NOTE type-scan: {reason}; using embedded LAY-4/TYP-6 measures"
        )

    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return fallback(f"could not read {path}")

    lay4 = _catalog_title(text, "LAY-4")
    typ6 = _catalog_title(text, "TYP-6")
    if lay4 is None or typ6 is None:
        return fallback(f"could not find LAY-4/TYP-6 titles in {path}")

    lay4_ceiling = _LAY4_CEILING_RE.search(lay4)
    lay4_target = _LAY4_TARGET_RE.search(lay4)
    typ6_band = _TYP6_BAND_RE.search(typ6)
    typ6_target = _TYP6_TARGET_RE.search(typ6)
    if not (lay4_ceiling and lay4_target and typ6_band and typ6_target):
        return fallback(f"could not parse LAY-4/TYP-6 measures from {path}")

    return {
        "ceilings": {
            "LAY-4": (int(lay4_ceiling.group(1)), f"~{lay4_target.group(1)}ch"),
            "TYP-6": (int(typ6_band.group(2)),
                      f"{typ6_target.group(1)}-{typ6_target.group(2)}ch"),
        },
        "floor": int(typ6_band.group(1)),
    }, None


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


# ── SIZE (TYP-2 floor + TYP-3 on-scale) ───────────────────────────────────────
CSS_FONT_SIZE_RE = re.compile(r"font-size\s*:\s*([0-9.]+)px", re.IGNORECASE)
TW_TEXT_PX_RE = re.compile(r"\btext-\[([0-9.]+)px\]")
CSS_FONT_SIZE_REM_RE = re.compile(r"font-size\s*:\s*([0-9.]+)rem", re.IGNORECASE)
TW_TEXT_REM_RE = re.compile(r"\btext-\[([0-9.]+)rem\]")


def _check_size_rules(scan_line, type_scale):
    """TYP-2 floor + TYP-3 on-scale. Returns list of (ctl, found, suggest)."""
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
        # TYP-2: below the 14px body floor.
        if px < 14:
            if px < 12:
                hits.append((
                    "TYP-2",
                    f"font size {n_int}px below the 12px label floor ({source})",
                    "labels >= 12px, body >= 14px",
                ))
            else:
                hits.append((
                    "TYP-2",
                    f"font size {n_int}px below the 14px body floor ({source})",
                    "body >= 14px; only short labels may go to 12px",
                ))
        # TYP-3: off the published scale. A fractional-pixel size is off-scale
        # by definition, even when its rounded value happens to be in the set.
        if px != int(px) or int(px) not in type_scale:
            hits.append((
                "TYP-3",
                f"font size {n_int}px not on the Tailwind default type scale ({source})",
                f"use a scale size: {sorted(type_scale, reverse=True)}",
            ))
    return hits


# ── LINE-HEIGHT (TYP-2) ───────────────────────────────────────────────────────
# Unitless or em line-heights only (px/% need the font size — out of reach).
CSS_LINE_HEIGHT_RE = re.compile(r"line-height\s*:\s*([0-9.]+)(em)?\s*[;}]", re.IGNORECASE)
TW_LEADING_ARBITRARY_RE = re.compile(r"\bleading-\[([0-9.]+)(em)?\]")

# TYP-2's line-height band (1.5–1.6) is BODY-scoped — controls/typ-2.md fails only on
# "line-height under 1.5 on multi-line body text". Headings correctly run tighter, so a
# line-height inside an h1–h6 rule (or on a heading element) is out of scope, not a fail.
_HEADING_SUBJECT_RE = re.compile(r"^h[1-6](?![a-z0-9-])", re.IGNORECASE)
# A heading ELEMENT is no longer found with a regex on the line: the
# type-scan-heading-element-html and -tsx rules match the opening tag, and
# ancestry says which lines it covers. The brace state machine that used to
# track "am I inside an h1 to h6 CSS rule" is gone the same way, because the
# type-scan-heading-rule-css rule hands over the enclosing rule directly.


def _selector_is_heading_only(selector_text):
    """True when every comma-group of a CSS selector targets an h1–h6 element.
    Mixed groups (e.g. '.title, h2') return False so the body member is still
    judged; @-rules and empty selectors return False."""
    sel = selector_text.strip()
    if not sel or sel.startswith("@"):
        return False
    parts = [p.strip() for p in sel.split(",") if p.strip()]
    if not parts:
        return False
    for part in parts:
        subject = re.split(r"[\s>+~]+", part)[-1]  # rightmost compound selector
        if not _HEADING_SUBJECT_RE.match(subject):
            return False
    return True


def _check_line_height_rule(scan_line, heading_context=False):
    """TYP-2 line-height: flag unitless/em values clearly outside 1.5–1.6.
    Skips heading contexts — TYP-2's band governs body copy, not headings."""
    if heading_context:
        return []
    hits = []
    candidates = []
    for m in CSS_LINE_HEIGHT_RE.finditer(scan_line):
        candidates.append((float(m.group(1)), m.group(2), "line-height"))
    for m in TW_LEADING_ARBITRARY_RE.finditer(scan_line):
        candidates.append((float(m.group(1)), m.group(2), "leading-[…]"))
    for val, unit, source in candidates:
        # px line-heights are written with 'px' so won't match (no group for px).
        # Treat unitless and em the same: a ratio.
        if val < 1.4 or val > 1.7:
            # Outside a generous band around 1.5–1.6 → flag. Within 1.4–1.7 we
            # stay quiet (close calls are advisories, not blocks).
            hits.append((
                f"body line-height {val}{unit or ''} outside 1.5-1.6 ({source})",
                "set body line-height to 1.5-1.6",
            ))
    return hits


# ── ALL-CAPS (TYP-4) ──────────────────────────────────────────────────────────
ALLCAPS_TW_RE = re.compile(r"\buppercase\b")
ALLCAPS_CSS_RE = re.compile(r"text-transform\s*:\s*uppercase", re.IGNORECASE)
STRIP_TAGS_RE = re.compile(r"<[^>]+>")
# A class / className attribute whose value may carry the `uppercase` utility
# (quoted value or a {…} JSX expression such as {cn('…')}).
CLASS_ATTR_RE = re.compile(r'class(?:Name)?\s*=\s*("[^"]*"|\'[^\']*\'|\{[^}]*\})')
# A class-list-shaped quoted string (other utility tokens present alongside) —
# catches a wrapped class list on its own line and cn('…') args with no class=.
CLASSLIST_TOKEN_RE = re.compile(
    r"\b(flex|grid|block|inline|rounded|tracking-|leading-|"
    r"px-|py-|pt-|pb-|pl-|pr-|mx-|my-|mt-|mb-|gap-|font-|"
    r"text-\[|text-(?:left|right|center)|items-|justify-|w-|h-)"
)


def _check_allcaps_rule(scan_line):
    """
    TYP-4: text is never set in all-caps. Flags a `text-transform: uppercase`
    declaration or an `uppercase` Tailwind utility — regardless of label length
    (the rule changed: short labels are no longer exempt; see HF-20 / catalog).
    The utility is matched only as a class token (inside a class/className attr
    or a class-list-shaped string), never the English word "uppercase" in
    visible text. Genuine acronyms are literal capitals in content, not a
    transform, so they are not matched. Returns (found, suggest) or None.
    """
    if ALLCAPS_CSS_RE.search(scan_line):
        return ("text-transform: uppercase — text is never set in all-caps",
                "remove the uppercase transform; use sentence case (TYP-4)")

    if not ALLCAPS_TW_RE.search(scan_line):
        return None

    # `uppercase` inside a class/className attribute value (incl. {cn('…')}).
    for m in CLASS_ATTR_RE.finditer(scan_line):
        if ALLCAPS_TW_RE.search(m.group(1)):
            return ("`uppercase` class — text is never set in all-caps",
                    "remove `uppercase`; use sentence case (TYP-4)")

    # `uppercase` inside a class-list-shaped quoted string with no class= on the
    # line (a wrapped class list, or a cn('…') argument on its own line).
    for sm in re.finditer(r'"([^"]*\buppercase\b[^"]*)"|\'([^\']*\buppercase\b[^\']*)\'', scan_line):
        inner = sm.group(1) if sm.group(1) is not None else sm.group(2)
        if inner and CLASSLIST_TOKEN_RE.search(inner):
            return ("`uppercase` class — text is never set in all-caps",
                    "remove `uppercase`; use sentence case (TYP-4)")

    return None


# ── MEASURE (LAY-4 ceiling + TYP-6 ceiling) ───────────────────────────────────
# One body, two thresholds, on the shape _check_size_rules already uses for
# TYP-2 and TYP-3. It judges caps that are ALREADY WRITTEN and never asks for one
# that is missing: a presence-requiring static rule would have to flag every
# paragraph or prove nothing, and deciding which block is running prose is the
# evaluator's half of both controls.

# The four forms a cap can be written in. The value is whichever group matched.
# The CSS declaration is the only one with no closing delimiter of its own, so it
# is the only one that has to look like a value: requiring a leading digit or a
# `var()` keeps `max-width: none`, `max-width: fit-content` and the words
# "max-width:" in prose out, none of which is a measure at all.
TW_MAX_W_ARBITRARY_RE = re.compile(r"\bmax-w-\[([^\]]+)\]")
TW_ARBITRARY_MAX_WIDTH_RE = re.compile(r"\[max-width\s*:\s*([^\]]+)\]", re.IGNORECASE)
JSX_MAX_WIDTH_RE = re.compile(
    r"\bmaxWidth\s*:\s*(?:'([^']*)'|\"([^\"]*)\"|([0-9.]+))"
)
CSS_MAX_WIDTH_RE = re.compile(
    r"max-width\s*:\s*([0-9.][^;{}\]\n]*|var\(\s*--[\w-]+\s*\))", re.IGNORECASE
)
_MEASURE_FORMS = (
    (TW_MAX_W_ARBITRARY_RE, "max-w-[…]"),
    (TW_ARBITRARY_MAX_WIDTH_RE, "[max-width:…]"),
    (JSX_MAX_WIDTH_RE, "style={{ maxWidth }}"),
    (CSS_MAX_WIDTH_RE, "CSS max-width"),
)

CH_VALUE_RE = re.compile(r"^([0-9]+(?:\.[0-9]+)?)\s*ch$", re.IGNORECASE)
# A number in some other unit, or no unit at all. A unitless number is a length
# too: React appends px to a numeric style value, and CSS reads a bare 0 as a
# length. Either way it is not `ch`, so it gets a note and never a finding.
NUMERIC_UNIT_RE = re.compile(r"^[0-9]+(?:\.[0-9]+)?\s*[a-z%]*$", re.IGNORECASE)
VAR_REF_RE = re.compile(r"^var\(\s*(--[\w-]+)\s*\)$")
CUSTOM_PROP_DECL_RE = re.compile(r"(--[\w-]+)\s*:\s*([^;{}\n]+)")


def custom_properties(measure_by_line):
    """
    {--name: raw value} for every custom property written on the measure surface
    of one file. This is what makes `max-width: var(--measure)` judgeable: the
    definition and the use site are usually different lines, and a cap is
    reported at the use site. Cross-file chains stay out of reach, which is the
    limit this file already documents for families set in a separate stylesheet.
    Later definitions win, matching contrast.py's resolver.
    """
    props = {}
    for _lineno, text in sorted(measure_by_line.items()):
        for name, value in CUSTOM_PROP_DECL_RE.findall(text):
            props[name] = value.strip()
    return props


def _resolve_measure(value, custom_props, seen=None):
    """
    Classify one written cap. Returns (kind, payload):
      "ch"          a float, the measure in characters
      "unit"        the raw text, a number in a unit that is not `ch`
      "unresolved"  the raw text, a var() this file does not define
      "dynamic"     the raw text, anything else (a keyword, calc(), an
                    interpolation), which is not a measure, so nothing is said
                    about it
    Cycle-safe, like contrast.py's resolver.
    """
    raw = value.strip().strip("'\"")
    flat = re.sub(r"\s+", " ", raw).strip()
    # `!important` changes the cascade, not the measure, so it is dropped before
    # the value is read rather than making a plain 70ch cap unjudgeable.
    flat = re.sub(r"\s*!\s*important$", "", flat, flags=re.IGNORECASE).strip()
    m = CH_VALUE_RE.match(flat)
    if m:
        return "ch", float(m.group(1))
    var = VAR_REF_RE.match(flat)
    if var:
        name = var.group(1)
        seen = set() if seen is None else seen
        if name in seen or name not in custom_props:
            return "unresolved", flat
        seen.add(name)
        kind, payload = _resolve_measure(custom_props[name], custom_props, seen)
        # A var() that resolves to something unjudgeable is still reported at the
        # use site, in the use site's own words.
        return (kind, payload) if kind == "ch" else (kind, flat)
    if NUMERIC_UNIT_RE.match(flat):
        return "unit", flat
    return "dynamic", flat


def measure_candidates(scan_line):
    """
    Every cap written on one line, as (value, source label), left to right.
    A form that contains another wins: `[max-width:70ch]` is one cap written as a
    Tailwind arbitrary property, not a Tailwind arbitrary property plus the CSS
    declaration inside it, so the enclosing match is kept and the enclosed one is
    dropped.
    """
    matches = []
    for regex, label in _MEASURE_FORMS:
        for m in regex.finditer(scan_line):
            value = next((g for g in m.groups() if g is not None), None)
            if value is not None:
                matches.append((m.start(), m.end(), value, label))
    matches.sort(key=lambda item: (item[0], -item[1]))
    out = []
    covered = -1
    for start, end, value, label in matches:
        if start < covered:
            continue
        covered = end
        out.append((value, label))
    return out


def _check_measure_rules(scan_line, measure, custom_props):
    """
    LAY-4 + TYP-6. Returns (hits, notes): `hits` is a list of
    (ctl, found, suggest) triples, `notes` holds at most one message.

    Both ceilings are tested for every cap, so a cap above 80ch reports under
    LAY-4 and under TYP-6, exactly as one font size reports under TYP-2 and
    TYP-3 today. Each ceiling is exclusive: both controls fail ABOVE their number
    ("never above 80ch", "well past ~75ch"), not at it.

    At most one note per line, so a stylesheet full of px max-widths cannot flood
    the report. A note never changes the exit code, which keeps this file's rule
    that an unresolvable case is neither a silent pass nor a block.
    """
    hits = []
    notes = []
    for value, source in measure_candidates(scan_line):
        kind, payload = _resolve_measure(value, custom_props)
        if kind == "unit":
            if not notes:
                notes.append(
                    f'max-width "{payload}" is not written in ch, so the LAY-4 and '
                    f"TYP-6 measure ceilings cannot be judged here ({source}); "
                    f"check the rendered measure"
                )
            continue
        if kind == "unresolved":
            if not notes:
                notes.append(
                    f'max-width "{payload}" is not defined in this file, so the '
                    f"LAY-4 and TYP-6 measure ceilings cannot be judged here "
                    f"({source}); check the rendered measure"
                )
            continue
        if kind != "ch":
            continue
        ch = payload
        # Below TYP-6's band floor this is a heading, a label or small print, not
        # running text. Suppression only: nothing under the floor could exceed
        # either ceiling, so this can never hide a violation.
        if ch < measure["floor"]:
            continue
        shown = int(ch) if ch == int(ch) else ch
        for ctl in MEASURE_CONTROLS:
            ceiling, target = measure["ceilings"][ctl]
            if ch > ceiling:
                hits.append((
                    ctl,
                    f"max-width {shown}ch exceeds the {ceiling}ch ceiling ({source})",
                    f"cap the measure at {ceiling}ch (target {target})",
                ))
    return hits, notes


CHECK_NAME = "type-scan"


def heading_context_lines(candidates):
    """
    The 1-based lines where TYP-2's line-height band does not apply, because they
    sit inside an h1 to h6 CSS rule or on a heading element. Ancestry answers it
    now; the hand-rolled CSS brace state machine is gone.

    Which selectors count as heading-only stays in Python: ast-grep 0.44.1's rule
    fields cannot express "the rightmost compound selector of every comma group",
    so _selector_is_heading_only() reads the selector text ast-grep hands over.
    The innermost rule containing a line wins, matching the old tracker.
    """
    state = {}
    enclosing = [c for c in candidates if c["surface"] == "heading-rule"]
    enclosing.sort(key=lambda c: c["end_line"] - c["line"], reverse=True)
    for cand in enclosing:
        is_heading = _selector_is_heading_only(cand["text"].split("{", 1)[0])
        for lineno in range(cand["line"], cand["end_line"] + 1):
            state[lineno] = is_heading
    for cand in candidates:
        if cand["surface"] == "heading-element":
            for lineno in range(cand["line"], cand["end_line"] + 1):
                state[lineno] = True
    return {lineno for lineno, is_heading in state.items() if is_heading}


def check_file(filepath, type_scale=None, rules=None, candidates=None, measure=None):
    """
    Scan a single file. Returns a list of ERROR / NOTE strings.
    `type_scale` is the allowed-size set; built from the catalog if omitted.
    `measure` is LAY-4's and TYP-6's ceilings plus the 45ch floor, in
    MEASURE_FALLBACK's shape; read from the catalog if omitted.
    `rules` (additive, optional): a set/iterable of control ids to keep
    (e.g. {"TYP-1"}). When None, every rule runs (unchanged default). When
    given, only findings whose control id is in the set are emitted — the
    per-rule selection detect.py's curated profile needs. Operational errors
    (path not found, unreadable file) are never filtered by `rules`.
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
    if measure is None:
        measure, _measure_note = load_measure()

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
    # comment spans removed. A parser never offers comment text as code, so the
    # block-comment tracker, the <!-- --> strip and the // strip are all gone.
    code_by_line = checklib.surface_lines(source, candidates, ("code",))
    heading_lines = heading_context_lines(candidates)
    # The measure candidates sit on their own surface so the four typography
    # rules keep reading exactly the spans they read before this rule landed.
    measure_by_line = checklib.surface_lines(source, candidates, ("measure",))
    # Whole-file, because a cap and the custom property it points at are usually
    # on different lines.
    measure_props = custom_properties(measure_by_line)
    # Skipped outright when --rules selects neither measure control, so the
    # curated `--rules TYP-1` profile detect.py runs prints exactly what it
    # printed before, notes included.
    measure_selected = rule_filter is None or bool(rule_filter & set(MEASURE_CONTROLS))

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")

        def emit(ctl_id, found, suggest):
            if rule_filter is not None and ctl_id not in rule_filter:
                return
            results.append(checklib.emit_error(rel, lineno, ctl_id, found, suggest))

        def note(msg):
            results.append(f"NOTE {rel}:{lineno} {msg}")

        scan_line = code_by_line.get(lineno, "")

        # TYP-1 fonts
        for found, suggest in _check_font_rule(scan_line):
            emit("TYP-1", found, suggest)

        # TYP-2 size floor + TYP-3 on-scale
        for ctl, found, suggest in _check_size_rules(scan_line, type_scale):
            emit(ctl, found, suggest)

        # TYP-2 line-height is body-scoped, so ancestry decides heading context.
        for found, suggest in _check_line_height_rule(
            scan_line, lineno in heading_lines
        ):
            emit("TYP-2", found, suggest)

        # TYP-4 all-caps
        ac = _check_allcaps_rule(scan_line)
        if ac is not None:
            emit("TYP-4", ac[0], ac[1])

        # LAY-4 + TYP-6 measure: one body, two ceilings, caps already present.
        if measure_selected:
            measure_hits, measure_notes = _check_measure_rules(
                measure_by_line.get(lineno, ""), measure, measure_props
            )
            for ctl, found, suggest in measure_hits:
                emit(ctl, found, suggest)
            for msg in measure_notes:
                note(msg)

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
    measure, measure_note = load_measure()
    if measure_note:
        print(measure_note)
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
            check_file(val, type_scale, rules,
                       by_file.get(os.path.realpath(val), []), measure)
        )
    return all_results


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    import tempfile

    type_scale, _note = load_type_scale()
    measure, _measure_note = load_measure()

    failures = []
    case_count = 0

    def run(content, ext):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, type_scale, measure=measure)
        os.unlink(tf.name)
        return res

    def check_file_from_string(content, ext, rules):
        with tempfile.NamedTemporaryFile(suffix=ext, mode="w", delete=False, encoding="utf-8") as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, type_scale, rules, measure=measure)
        os.unlink(tf.name)
        return res

    def assert_violations(name, content, ext, expected_ctl_ids):
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        found = []
        for e in res:
            m = re.search(r"\[([A-Z0-9-]+)\]", e)
            if m:
                found.append(m.group(1))
        for ctl in expected_ctl_ids:
            if ctl not in found:
                failures.append(f"FAIL {name}: expected [{ctl}] — got: {res}")

    def assert_clean(name, content, ext):
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        errs = [r for r in res if r.startswith("ERROR")]
        if errs:
            failures.append(f"FAIL {name}: expected no ERROR — got: {errs}")

    def assert_ids(name, content, ext, expected_ctl_ids):
        """The EXACT set of control ids reported. assert_violations only proves
        an id is present, which cannot express "TYP-6 fired and LAY-4 did not",
        the two-threshold case this rule exists for."""
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        found = set()
        for e in res:
            if not e.startswith("ERROR"):
                continue
            m = re.search(r"\[([A-Z0-9-]+)\]", e)
            if m:
                found.add(m.group(1))
        if found != set(expected_ctl_ids):
            failures.append(
                f"FAIL {name}: want ids {sorted(expected_ctl_ids)}; got: {res}"
            )

    def assert_silent(name, content, ext):
        """No output at all, not even a NOTE. A missing cap and a sub-45ch cap
        both have to be this quiet: anything printed there would be the
        presence-requiring half neither control's static rule may build."""
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        if res:
            failures.append(f"FAIL {name}: want no output; got: {res!r}")

    # ── TYP-2 size floor + TYP-3 on-scale ─────────────────────────────────────
    # text-[13px] is below the 14px floor AND off-scale → TYP-2 + TYP-3.
    assert_violations("SIZE: text-[13px] below floor",
                      '<p className="text-[13px]">small</p>', ".tsx", ["TYP-2", "TYP-3"])
    # text-[14px] is on-scale and at the floor → clean.
    assert_clean("SIZE: text-[14px] clean", '<p className="text-[14px]">ok</p>', ".tsx")
    # text-[15px] is on the floor (>=14) but OFF the scale → TYP-3 only.
    assert_violations("SIZE: text-[15px] off-scale only",
                      '<p className="text-[15px]">ok size, off scale</p>', ".tsx", ["TYP-3"])
    # CSS font-size: 10px is below the 12px label floor.
    assert_violations("SIZE: CSS 10px below label floor",
                      ".tiny { font-size: 10px; }", ".css", ["TYP-2"])
    # text-[0.8rem] (12.8px) is fractional → off-scale (TYP-3) and below the
    # 14px body floor but above the 12px label floor (TYP-2).
    assert_violations("SIZE: text-[0.8rem] fractional off-scale",
                      '<p className="text-[0.8rem]">small</p>', ".tsx", ["TYP-2", "TYP-3"])
    # text-[0.875rem] = 14px exactly → on-scale, at the body floor → clean.
    assert_clean("SIZE: text-[0.875rem] (14px) clean",
                 '<p className="text-[0.875rem]">ok</p>', ".tsx")
    # CSS font-size: 1.875rem = 30px exactly → on the Tailwind scale → clean.
    assert_clean("SIZE: CSS font-size 1.875rem (30px) clean",
                 ".h { font-size: 1.875rem; }", ".css")
    # CSS font-size: 0.6875rem = 11px → below the new 12px label floor AND
    # off the new scale → TYP-2 + TYP-3.
    assert_violations("SIZE: CSS font-size 0.6875rem (11px) below floor and off-scale",
                      ".tiny { font-size: 0.6875rem; }", ".css", ["TYP-2", "TYP-3"])

    # ── TYP-1 fonts ───────────────────────────────────────────────────────────
    assert_violations("FONT: CSS Georgia",
                      ".h { font-family: Georgia, serif; }", ".css", ["TYP-1"])
    assert_clean("FONT: font-display token clean",
                 '<h1 className="font-display">Title</h1>', ".tsx")
    assert_clean("FONT: font-sans token clean",
                 '<p className="font-sans">Body</p>', ".tsx")
    assert_clean("FONT: CSS Inter clean",
                 ".b { font-family: 'Inter', sans-serif; }", ".css")
    assert_clean("FONT: CSS Plus Jakarta Sans clean",
                 ".h { font-family: 'Plus Jakarta Sans', sans-serif; }", ".css")
    assert_violations("FONT: Tailwind font-[Comic_Sans]",
                      '<h1 className="font-[Comic_Sans_MS]">Title</h1>', ".tsx", ["TYP-1"])
    # Named family utilities font-mono / font-serif are non-approved → TYP-1.
    assert_violations("FONT: Tailwind font-mono utility",
                      '<span className="font-mono text-[12px]">SLP-2</span>', ".tsx", ["TYP-1"])
    assert_violations("FONT: Tailwind font-serif utility",
                      '<p className="font-serif">x</p>', ".tsx", ["TYP-1"])
    # Weight utilities are NOT a typeface choice → never flagged by TYP-1.
    assert_clean("FONT: font-semibold is a WEIGHT not a family",
                 '<p className="font-semibold">x</p>', ".tsx")
    assert_clean("FONT: font-medium weight clean",
                 '<p className="font-medium">x</p>', ".tsx")
    # A non-approved generic as the PRIMARY CSS family → TYP-1.
    # (An approved face with a sans-serif fallback stays clean — covered by
    # "FONT: CSS Inter clean" above.)
    assert_violations("FONT: CSS monospace primary",
                      ".code { font-family: monospace; }", ".css", ["TYP-1"])

    # ── TYP-2 line-height ─────────────────────────────────────────────────────
    assert_violations("LINEHEIGHT: 1.2 too tight",
                      ".b { line-height: 1.2; }", ".css", ["TYP-2"])
    assert_clean("LINEHEIGHT: 1.5 clean", ".b { line-height: 1.5; }", ".css")
    assert_clean("LINEHEIGHT: 1.6 clean", ".b { line-height: 1.6; }", ".css")
    # TYP-2 is body-scoped: heading line-heights run tighter and are not judged.
    assert_clean("LINEHEIGHT: heading 1.2 same-line clean",
                 "h1 { line-height: 1.2; }", ".css")
    assert_clean("LINEHEIGHT: heading multi-line 1.25 clean",
                 "h1 {\n  line-height: 1.25;\n}", ".css")
    assert_clean("LINEHEIGHT: descendant heading rule clean",
                 ".card h2 {\n  line-height: 1.1;\n}", ".css")
    # A non-heading body rule spanning lines still flags.
    assert_violations("LINEHEIGHT: body multi-line 1.2 still flags",
                      ".lead {\n  line-height: 1.2;\n}", ".css", ["TYP-2"])
    # A mixed group (body + heading) is not treated as heading-only → still flags.
    assert_violations("LINEHEIGHT: mixed group still flags",
                      ".lead, h2 {\n  line-height: 1.2;\n}", ".css", ["TYP-2"])
    # Tailwind leading-[N]: heading element excluded, body element flagged.
    assert_clean("LINEHEIGHT: leading-[] on a heading element clean",
                 '<h1 className="leading-[1.1]">Title</h1>', ".tsx")
    assert_violations("LINEHEIGHT: leading-[] on a body element flags",
                      '<p className="leading-[1.2]">x</p>', ".tsx", ["TYP-2"])

    # ── TYP-4 all-caps (no all-caps at all — even short labels; HF-20) ──────────
    assert_violations(
        "ALLCAPS: uppercase on a long sentence",
        '<p className="uppercase">This entire running sentence is in upper case</p>',
        ".tsx", ["TYP-4"],
    )
    assert_violations(
        "ALLCAPS: uppercase on a short label is now a violation",
        '<span className="uppercase">NEW</span>', ".tsx", ["TYP-4"],
    )
    assert_violations(
        "ALLCAPS: uppercase in a wrapped className string",
        '          "block flex-1 rounded-md px-1 py-1.5 font-semibold uppercase tracking-wider",',
        ".tsx", ["TYP-4"],
    )
    assert_violations(
        "ALLCAPS: text-transform uppercase in CSS",
        ".eyebrow { text-transform: uppercase; }", ".css", ["TYP-4"],
    )
    assert_clean(
        "ALLCAPS: the word 'uppercase' in body text is not a utility",
        '<p>Type your initials in uppercase</p>', ".tsx",
    )
    assert_clean(
        "ALLCAPS: an acronym in content is fine (not a transform)",
        '<span className="font-semibold">MOE</span>', ".tsx",
    )
    assert_clean(
        "ALLCAPS: text-transform capitalize is allowed",
        ".name { text-transform: capitalize; }", ".css",
    )

    # ── LAY-4 + TYP-6 measure (one body, two ceilings) ─────────────────────────
    # The rule that separates this build from TYP-5's accepted gap: running text
    # with no cap written anywhere says nothing at all, not even a NOTE.
    assert_silent("MEASURE: no cap at all is never flagged",
                  '<p className="text-base">Running body copy with no cap.</p>', ".tsx")
    # 70ch is this repo's own measure and clears both ceilings.
    assert_silent("MEASURE: 70ch clears both ceilings",
                  '<p className="max-w-[70ch]">body</p>', ".tsx")
    # Above both ceilings → one finding per control, from one rule body.
    assert_ids("MEASURE: 85ch breaks both ceilings",
               '<p className="max-w-[85ch]">body</p>', ".tsx", {"LAY-4", "TYP-6"})
    # The two-threshold case: 78 is above TYP-6's 75 and at or below LAY-4's 80.
    assert_ids("MEASURE: 78ch is TYP-6 only",
               '<p className="max-w-[78ch]">body</p>', ".tsx", {"TYP-6"})
    # Each ceiling is exclusive: both controls fail ABOVE their number, not at it.
    assert_ids("MEASURE: exactly 80ch is TYP-6 only, never LAY-4",
               '<p className="max-w-[80ch]">body</p>', ".tsx", {"TYP-6"})
    assert_silent("MEASURE: exactly 75ch is clean",
                  '<p className="max-w-[75ch]">body</p>', ".tsx")
    # Below 45ch is a heading, a label or small print, never running text.
    assert_silent("MEASURE: 30ch heading is never flagged",
                  '<h2 className="max-w-[30ch]">Title</h2>', ".tsx")
    # The floor is by VALUE, not by element: this is the shape components/illo.tsx
    # and components/compare.tsx already use, a 44ch caption on a <p>.
    assert_silent("MEASURE: 44ch text-sm caption is never flagged",
                  '<p className="max-w-[44ch] text-sm">caption</p>', ".tsx")
    # The highest cap in this repo is in CSS, so the CSS form has to stay
    # reachable or the zero-findings calibration proves nothing.
    assert_silent("MEASURE: .prose 70ch in CSS is clean",
                  ".prose { max-width: 70ch; line-height: 1.5; }", ".css")
    assert_ids("MEASURE: .prose 85ch in CSS breaks both",
               ".prose { max-width: 85ch; line-height: 1.5; }", ".css",
               {"LAY-4", "TYP-6"})
    # !important changes the cascade, not the measure.
    assert_ids("MEASURE: 85ch !important still breaks both",
               ".prose { max-width: 85ch !important; }", ".css", {"LAY-4", "TYP-6"})
    assert_silent("MEASURE: 70ch !important is still clean",
                  ".prose { max-width: 70ch !important; }", ".css")
    # The Tailwind arbitrary-property form, and the JSX inline style object.
    assert_ids("MEASURE: [max-width:85ch] arbitrary property breaks both",
               '<p className="[max-width:85ch]">body</p>', ".tsx",
               {"LAY-4", "TYP-6"})
    assert_ids("MEASURE: style={{ maxWidth }} breaks both",
               "<div style={{ maxWidth: '85ch' }}>body</div>", ".tsx",
               {"LAY-4", "TYP-6"})
    # A cap is judged wherever CSS is written, not only in a .css file: an html
    # style attribute, an html <style> block and a styled-components body all
    # reach the same rule through the shared style-region re-scan.
    assert_ids("MEASURE: an html style attribute breaks both",
               '<p style="max-width: 90ch">body</p>', ".html", {"LAY-4", "TYP-6"})
    assert_ids("MEASURE: an html <style> block breaks both",
               "<style>\n  .prose { max-width: 88ch; }\n</style>\n", ".html",
               {"LAY-4", "TYP-6"})
    assert_ids("MEASURE: a styled-components body breaks both",
               "const Prose = styled.div`\n  max-width: 88ch;\n`;\n", ".tsx",
               {"LAY-4", "TYP-6"})
    # One cap over both ceilings is exactly two lines. Counting them is what
    # proves the enclosing form wins over the CSS declaration inside it, rather
    # than one cap being read twice.
    case_count += 1
    dedupe = [r for r in run('<p className="[max-width:85ch]">x</p>', ".tsx")
              if r.startswith("ERROR")]
    if len(dedupe) != 2:
        failures.append(f"FAIL MEASURE: one cap is two findings, not more: {dedupe!r}")

    # A same-file var() is resolved and reported at the USE site, never at the
    # definition line: the definition alone is a token, not a cap.
    case_count += 1
    var_over = run(":root {\n  --measure: 90ch;\n}\n\n.prose {\n  max-width: var(--measure);\n}\n", ".css")
    var_lines = sorted({int(re.search(r":(\d+) ", r).group(1))
                        for r in var_over if r.startswith("ERROR")})
    var_ids = {re.search(r"\[([A-Z0-9-]+)\]", r).group(1)
               for r in var_over if r.startswith("ERROR")}
    if var_lines != [6] or var_ids != {"LAY-4", "TYP-6"}:
        failures.append(
            f"FAIL MEASURE var(): want both ids on line 6 only; got: {var_over!r}"
        )
    assert_silent("MEASURE: a same-file var() at 66ch is clean",
                  ":root {\n  --measure: 66ch;\n}\n\n.prose {\n  max-width: var(--measure);\n}\n",
                  ".css")
    # A custom property with no cap consuming it is a token, not a cap.
    assert_silent("MEASURE: a bare --measure definition is a token, not a cap",
                  ":root { --measure: 90ch; }", ".css")

    # Unresolvable cases are one NOTE per line and never an ERROR, so they
    # neither block nor pass in silence.
    def assert_one_note(name, content, ext):
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        errs = [r for r in res if r.startswith("ERROR")]
        notes = [r for r in res if r.startswith("NOTE")]
        if errs or len(notes) != 1:
            failures.append(f"FAIL {name}: want exactly one NOTE and no ERROR; got: {res!r}")

    assert_one_note("MEASURE: a px cap is a NOTE, never an ERROR",
                    ".prose { max-width: 1200px; }", ".css")
    assert_one_note("MEASURE: a cross-file var() is a NOTE, never an ERROR",
                    ".prose { max-width: var(--measure); }", ".css")
    # A unitless number in a JSX style object is px, so it is a length in the
    # wrong unit rather than a value the rule can read.
    assert_one_note("MEASURE: a unitless maxWidth is a NOTE, never an ERROR",
                    "<div style={{ maxWidth: 960 }}>body</div>", ".tsx")
    # Two unresolvable caps on one line still print one NOTE, so a stylesheet of
    # px max-widths cannot flood the report.
    assert_one_note("MEASURE: two unresolvable caps on a line are still one NOTE",
                    '<div className="max-w-[720px] [max-width:960px]">x</div>', ".tsx")

    # ── Comment stripping ─────────────────────────────────────────────────────
    assert_clean("COMMENT: commented-out small size not flagged",
                 "/* font-size: 9px; */ .x { color: black; }", ".css")
    assert_clean("COMMENT: line-commented font-[Georgia] not flagged (tsx)",
                 "// className='font-[Georgia]' text-[8px]", ".tsx")
    assert_silent("COMMENT: a commented-out 90ch cap is not a cap (tsx)",
                  '// <p className="max-w-[90ch]">x</p>', ".tsx")
    assert_silent("COMMENT: a commented-out 90ch cap is not a cap (css)",
                  "/* .prose { max-width: 90ch; } */ .x { color: black; }", ".css")

    # ── --rules per-rule selection (additive; detect.py's curated profile) ──────
    # A CSS rule that trips TYP-1 (font), TYP-2 (size floor), and TYP-3 (off-scale).
    MULTI = ".x { font-family: Georgia; font-size: 13px; }"

    def rule_ids(content, ext, rules):
        nonlocal case_count
        case_count += 1
        res = check_file_from_string(content, ext, rules)
        ids = []
        for e in res:
            if not e.startswith("ERROR"):
                continue
            m = re.search(r"\[([A-Z0-9-]+)\]", e)
            if m:
                ids.append(m.group(1))
        return set(ids)

    # rules=None → every rule runs (baseline for the filtered comparisons).
    all_ids = rule_ids(MULTI, ".css", None)
    if not {"TYP-1", "TYP-2", "TYP-3"} <= all_ids:
        failures.append(f"FAIL --rules baseline: expected TYP-1/2/3 — got {all_ids}")
    # Curated selection: rules={TYP-1} keeps TYP-1, DROPS the noisier TYP-2/TYP-3.
    only1 = rule_ids(MULTI, ".css", {"TYP-1"})
    if only1 != {"TYP-1"}:
        failures.append(f"FAIL --rules TYP-1 only: expected {{TYP-1}} — got {only1}")
    # A different single rule filters the other way.
    only2 = rule_ids(MULTI, ".css", {"TYP-2"})
    if only2 != {"TYP-2"}:
        failures.append(f"FAIL --rules TYP-2 only: expected {{TYP-2}} — got {only2}")
    # A two-rule set keeps exactly those two.
    two = rule_ids(MULTI, ".css", {"TYP-1", "TYP-3"})
    if two != {"TYP-1", "TYP-3"}:
        failures.append(f"FAIL --rules TYP-1,TYP-3: expected both — got {two}")

    # The two measure ids are independently selectable, which is the property
    # that keeps LAY-4 and TYP-6 two controls sharing one rule body rather than
    # one merged control.
    CAP = '<p className="max-w-[85ch]">body</p>'
    only_lay4 = rule_ids(CAP, ".tsx", {"LAY-4"})
    if only_lay4 != {"LAY-4"}:
        failures.append(f"FAIL --rules LAY-4 only: want {{LAY-4}}; got {only_lay4}")
    only_typ6 = rule_ids(CAP, ".tsx", {"TYP-6"})
    if only_typ6 != {"TYP-6"}:
        failures.append(f"FAIL --rules TYP-6 only: want {{TYP-6}}; got {only_typ6}")
    # detect.py's curated profile runs `--rules TYP-1`, so a cap must be silent
    # under it: the two new L2 rules ride `--all` and nothing else changes.
    case_count += 1
    curated = [r for r in check_file_from_string(CAP, ".tsx", {"TYP-1"})]
    if curated:
        failures.append(f"FAIL --rules TYP-1 over a cap: want no output; got {curated!r}")

    # parse_rules_flag: valid list, `=` form, unknown id, missing value.
    case_count += 1
    a1 = ["--rules", "TYP-1,TYP-3", "some/path"]
    if parse_rules_flag(a1) != {"TYP-1", "TYP-3"} or a1 != ["some/path"]:
        failures.append(f"FAIL parse_rules_flag list: got {a1}")
    case_count += 1
    a2 = ["--rules=typ-2", "p"]  # lower-case is normalised
    if parse_rules_flag(a2) != {"TYP-2"} or a2 != ["p"]:
        failures.append(f"FAIL parse_rules_flag = form: got {a2}")
    case_count += 1
    if parse_rules_flag(["p"]) is not None:
        failures.append("FAIL parse_rules_flag absent: expected None")
    case_count += 1
    try:
        parse_rules_flag(["--rules", "TYP-9", "p"])
        failures.append("FAIL parse_rules_flag unknown: expected ValueError")
    except ValueError:
        pass
    # The two measure ids joined VALID_RULES; nothing else did.
    case_count += 1
    a3 = ["--rules", "LAY-4,TYP-6", "p"]
    if parse_rules_flag(a3) != {"LAY-4", "TYP-6"} or a3 != ["p"]:
        failures.append(f"FAIL parse_rules_flag measure ids: got {a3}")
    case_count += 1
    try:
        parse_rules_flag(["--rules", "LAY-5", "p"])
        failures.append("FAIL parse_rules_flag LAY-5: expected ValueError")
    except ValueError:
        pass

    # ── The measure thresholds come from the catalog, not from this file ───────
    # load_type_scale()'s precedent: the numbers a design lead ratified are read
    # at runtime so they cannot drift. A parse failure falls back loudly.
    case_count += 1
    live_measure, live_note = load_measure()
    if live_note is not None or live_measure != {
        "ceilings": {"LAY-4": (80, "~66ch"), "TYP-6": (75, "40-60ch")},
        "floor": 45,
    }:
        failures.append(
            f"FAIL measure thresholds: want 80/75/45 read from the catalog; "
            f"got {live_measure!r} note={live_note!r}"
        )
    case_count += 1
    missing_measure, missing_note = load_measure(os.path.join("no", "such", "catalog.yaml"))
    if missing_measure != MEASURE_FALLBACK or missing_note is None:
        failures.append(
            "FAIL measure thresholds: an unreadable catalog must fall back and say so"
        )

    # ── Parity corpus ──────────────────────────────────────────────────────────
    # Every record in fixtures/parity/expected/ was produced by the pre-swap
    # engine and committed before the matching layer moved to ast-grep. A diff
    # here means either a fixture changed or the swap changed a decision.
    parity_failures, parity_count = checklib.parity_cases(
        CHECK_NAME, lambda path: check_file(path, type_scale, measure=measure)
    )
    failures.extend(parity_failures)
    case_count += parity_count

    # ── Per-rule selection over the corpus, as detect.py invokes it ────────────
    # detect.py's curated profile runs `type-scan --rules TYP-1`, so the filter
    # has to survive the swap. declaration.css trips TYP-2 and TYP-3 and no TYP-1.
    case_count += 1
    decl = os.path.join(checklib.PARITY_DIR, "known-positive", "declaration.css")
    only1 = [r for r in check_file(decl, type_scale, {"TYP-1"}, measure=measure) if r.startswith("ERROR")]
    if only1:
        failures.append(f"FAIL corpus --rules TYP-1: want: []; got: {only1!r}")
    case_count += 1
    only3 = [r for r in check_file(decl, type_scale, {"TYP-3"}, measure=measure) if r.startswith("ERROR")]
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
        res = check_file(tf.name, type_scale, measure=measure)
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

VALID_RULES = {"TYP-1", "TYP-2", "TYP-3", "TYP-4", "LAY-4", "TYP-6"}


def parse_rules_flag(args):
    """Additive `--rules TYP-1,LAY-4` (or `--rules=TYP-1`). Removes the flag from
    `args` in place; returns the rule-id set (or None when absent). Raises
    ValueError on an unknown/empty rule id so the caller can fail as a usage
    error — the default (no flag) runs every rule, unchanged."""
    rules = None
    i = 0
    while i < len(args):
        a = args[i]
        val = None
        if a == "--rules":
            if i + 1 >= len(args):
                raise ValueError("--rules needs a comma-separated control-id list")
            val = args[i + 1]
            del args[i:i + 2]
        elif a.startswith("--rules="):
            val = a[len("--rules="):]
            del args[i]
        else:
            i += 1
            continue
        ids = {r.strip().upper() for r in val.split(",") if r.strip()}
        if not ids:
            raise ValueError("--rules needs at least one control id")
        unknown = ids - VALID_RULES
        if unknown:
            raise ValueError(
                f"--rules: unknown id(s) {sorted(unknown)}; valid: {sorted(VALID_RULES)}"
            )
        rules = ids if rules is None else (rules | ids)
    return rules


def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: python3 checks/type-scan.py "
              "[--rules TYP-1,TYP-2,TYP-3,TYP-4,LAY-4,TYP-6] <path>... | --self-test")
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
              "[--rules TYP-1,TYP-2,TYP-3,TYP-4,LAY-4,TYP-6] <path>... | --self-test")
        sys.exit(1)
    try:
        results = scan_paths(args, rules)
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
