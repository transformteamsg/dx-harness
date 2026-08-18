#!/usr/bin/env python3
"""
Motion scan — checks/motion-scan.py
Scans UI source files for the statically-resolvable half of MOT-1 (duration and
easing) and for SLP-8 (bounce or elastic easing).

One script for all the motion rules, not one per control: one walk, one file
set, one exemption path. Splitting them would duplicate token-audit.py's
exemption machinery twice, which is the reason they are one build target.

Detection rules
───────────────
Rule        Control   What is caught
DURATION    MOT-1     A literal animation duration outside the 100-300ms band,
            (L2)      anchored to a duration property, a duration utility or a
                      `duration:` key. Seven forms, listed under "Forms" below.
                      A token reference is never band-judged, and a zero
                      duration never fires, because zero means no motion and
                      that is the reduced-motion idiom.
ALLPROPS    MOT-1     `transition-all`. It animates whatever happens to change,
            (L2)      including layout properties, so the animated set cannot be
                      reasoned about.
EASING      SLP-8     A cubic-bezier whose y control points fall outside 0 to 1,
            (L1)      a spring config with no explicit `bounce` or `damping`, a
                      spring whose `bounce` is above 0, and the named overshoot
                      utilities (ease-back, ease-elastic, ease-bounce,
                      animate-bounce).

Forms, and why the band is applied per form
────────────────────────────────────────────
A unitless number means different things in different places, so the form
decides how it is read and nothing else:

  tw-utility     `duration-200`         N is milliseconds
  tw-arbitrary   `duration-[250ms]`     read the unit, normalise to ms
  tw-var         `duration-(--motion-fast)`  a token reference, never judged
  css-longhand   `transition-duration: 250ms`, `animation-duration:`
  css-shorthand  `transition: opacity 250ms ease-out`, `animation:`
  inline-style   `style={{ transitionDuration: "250ms" }}`, `animationDuration`
  js-config      `transition={{ duration: 0.25 }}`  SECONDS, not milliseconds

The js-config form is the one that would go wrong silently: a `duration:` key in
a motion/react transition object is seconds, so reading it as milliseconds would
flag every correct value in a repo that uses the library.

Anchoring matters more than the parsing. Every form above is anchored to a
duration property, a duration utility or a `duration:` key, so a bare `600ms`
literal is never a hit on its own. Without that anchor a component that renders
the motion token table as display copy reports a violation for every row it
prints, and no vendored-file filter would cover it.

Exemptions
──────────
Token-definition blocks, through the exemption machinery token-audit.py owns and
this script imports rather than copies (TokenDefTracker plus parse_passes). That
is what keeps MOT-1 quiet about `--motion-story: 600ms`, which is deliberately
outside the band: whether a token's own value is in band is decided at its
definition, and the definition sits in the exempt block.

Vendored files are NOT handled here. There is no `components/ui` string, no
shadcn allowlist and no per-file branch in this file, by design: suppression is
the file layer's job, through `detector.ignoreFiles` in the scanned repo's
`.dx/config.json`, which detect.py applies before this script is ever invoked.
Invoke this script directly on a vendored file and it reports the finding, which
is how you can tell the rule body carries no special case.

What this script does NOT verify
─────────────────────────────────
- MOT-1's judgment half: whether motion is decorative, and whether it sits on a
  critical path. Neither is marked in source. The evaluator carries both, by
  design and not as a gap.
- Whether a `stiffness`/`damping` pair actually overshoots. That is physics on
  values the source may not fully give, so SLP-8 reports and never blocks.
- A spring config inside a `.vue` or `.svelte` `<script>` block, which reaches
  ast-grep as html raw text rather than as JavaScript.
- Reduced-motion behaviour, which the rendered runner covers for A11Y-5.

MOT-2 is not here, and no flag turns it on
───────────────────────────────────────────
MOT-2 (motion values come from the declared token set) is `status: proposed`.
The harness does not enforce a rule a design lead has not ratified, so no MOT-2
matcher ships in any form: not behind a flag, not commented out, not registered
and disabled. `VALID_RULES` holds MOT-1 and SLP-8 only, so `--rules MOT-2` is a
usage error. MOT-2's coverage rests on the `gap:` reason it carries in the
catalogue.

Recorded here so the next reader does not re-derive them, two of MOT-2's three
`fails_when` clauses are matchable and one is not:

  1. a raw duration or cubic-bezier literal in component code where the token
     set exists: matchable
  2. a surface that animates but declares no motion token set: matchable
  3. the narrative tier (--motion-story) used on interface or task UI: NOT
     matchable, because it needs the surface class, which source does not mark.
     That clause is why MOT-2 is `check: hybrid`.

Ratification makes this additive, not a restructure: add two matcher functions,
two RULES entries, two exempt-file entries inside line_is_exempt() (the declared
code mirror lib/motion.ts and its drift test), one display-copy predicate, and
the id in VALID_RULES.

Per-rule selection (additive)
─────────────────────────────
`--rules MOT-1` restricts the emitted findings to those control ids
(comma-separated; `--rules=MOT-1` also works). Without the flag every rule runs.
Unknown ids are a usage error (exit 1); operational errors (path not found) are
never filtered.

Output
──────
ERROR <file>:<line> [MOT-1] <found> — suggest: <...>
NOTE  <file>:<line> [SLP-8] <what was found>, verify manually
Exit 0 and print nothing (or SELF-TEST OK) on success.
Exit 1 with ERROR lines on any violation. SLP-8 emits no ERROR line under any
input, so it never affects an exit code: a check never blocks on a guess.
"""

import importlib.util
import os
import re
import sys

_CHECKS_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_by_path(module_name, filename):
    """
    Load a checks/ module by path. `checks/` is not a Python package and the
    filenames use hyphens, so this is the import route the layer already uses
    (waiver-reconcile.py loads audit-record.py the same way). Both modules guard
    main() behind `if __name__ == "__main__"`, so importing runs nothing.
    """
    path = os.path.join(_CHECKS_DIR, filename)
    spec = importlib.util.spec_from_file_location(module_name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


checklib = _load_by_path("_dx_checklib", "checklib.py")
# The exemption machinery is imported, never copied and never edited. This file
# defines no custom-property-block tracker, no dx-tokens region matcher and no
# var() passthrough of its own.
token_audit = _load_by_path("_dx_token_audit", "token-audit.py")

CHECK_NAME = "motion-scan"
TARGET_EXTENSIONS = checklib.TARGET_EXTENSIONS

# MOT-1's band, inclusive at both ends. Both ends fire: below 100ms a transition
# reads as a jump, above 300ms it reads as a wait. MOT-1's fails_when names only
# the upper end, but its verify string and the control's own detail file give the
# band, and the lower end is half of it.
DURATION_BAND_MS = (100, 300)

# ── MOT-1 matchers ────────────────────────────────────────────────────────────

# `transition-all` as a class token. `(?<![\w-])` lets a variant prefix through
# (hover:transition-all) while keeping a longer word out.
TRANSITION_ALL_RE = re.compile(r"(?<![\w-])transition-all(?![\w-])")

# Tailwind `duration-200`. The negative lookbehind keeps `--motion-duration-200`
# and similar compound names out; the lookahead keeps `duration-200ms` (not a
# real utility) from being read as 200.
TW_DURATION_RE = re.compile(r"(?<![\w-])duration-(\d+)(?![\w-])")

# Tailwind `duration-[250ms]`, the arbitrary-value form.
TW_DURATION_ARBITRARY_RE = re.compile(r"(?<![\w-])duration-\[([^\]]+)\]")

# CSS longhand. Read separately from the shorthand so a shorthand regex never has
# to exclude it.
CSS_DURATION_LONGHAND_RE = re.compile(
    r"(?<![\w-])(?:transition|animation)-duration\s*:\s*([^;{}]+)", re.IGNORECASE
)

# CSS shorthand. `transition-duration` cannot match here, because the property
# name is followed by a hyphen rather than a colon.
CSS_DURATION_SHORTHAND_RE = re.compile(
    r"(?<![\w-])(?:transition|animation)\s*:\s*([^;{}]+)", re.IGNORECASE
)

# The camelCase inline-style keys, read exactly like the CSS longhand.
INLINE_STYLE_DURATION_RE = re.compile(
    r"(?<![\w-])(?:transitionDuration|animationDuration)\s*:\s*([^,;{}]+)"
)

# A JS animation config's `duration:` key. The unit group is optional, and its
# absence is what makes the value seconds. Case-sensitive on purpose: the
# motion/react key is spelled `duration`, and matching case-insensitively would
# read a shouty `DURATION:` constant in an unrelated config as one.
JS_DURATION_RE = re.compile(
    r"""(?<![\w-])duration\s*:\s*['"]?\s*(\d+(?:\.\d+)?)\s*(ms|s)?\b"""
)

# A time value inside a CSS value fragment.
TIME_VALUE_RE = re.compile(r"(?<![\w.])(\d+(?:\.\d+)?)\s*(ms|s)(?![\w-])", re.IGNORECASE)

# An identifier-valued duration is never band-judged: MOT-1's band applies to
# literals at the use site, and whether a token's own value is in band is decided
# at its definition. This spots the Tailwind CSS-variable shorthand
# `duration-(--motion-fast)`, which token-audit's parse_passes does not know
# about because it is not a var() call. Recognising it belongs at this call site,
# not as an edit to token-audit.py.
TW_DURATION_VAR_RE = re.compile(r"(?<![\w-])duration-\(\s*--[\w-]+\s*\)")

# ── SLP-8 matchers ────────────────────────────────────────────────────────────

CUBIC_BEZIER_RE = re.compile(
    r"cubic-bezier\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)",
    re.IGNORECASE,
)

# The named overshoot set, spelled out. Matching the bare word "bounce" would
# report prose and test data that mention it without easing anything.
NAMED_OVERSHOOT_RE = re.compile(
    r"(?<![\w-])(ease-(?:back|elastic|bounce)|animate-bounce)(?![\w-])", re.IGNORECASE
)

SPRING_BOUNCE_RE = re.compile(r"(?<![\w-])bounce\s*:\s*(-?\d+(?:\.\d+)?)")
SPRING_DAMPING_RE = re.compile(r"(?<![\w-])damping\s*:")
SPRING_BOUNCE_KEY_RE = re.compile(r"(?<![\w-])bounce\s*:")

DURATION_SUGGEST = (
    "use a motion duration token (--motion-fast, --motion-base, --motion-slow)"
)
TRANSITION_ALL_SUGGEST = (
    "name the properties that transition (transition-colors, transition-transform)"
)


def normalise_ms(value, unit, form):
    """
    Normalise one parsed duration to milliseconds, or return None when the form
    gives no reading. `unit` is "ms", "s" or None for a unitless number, and the
    form is what tells a unitless number apart: a Tailwind utility counts in
    milliseconds, a JS animation config counts in seconds.
    """
    try:
        val = float(value)
    except (TypeError, ValueError):
        return None
    if unit:
        unit = unit.lower()
    if unit == "ms":
        return val
    if unit == "s":
        return val * 1000.0
    if form == "tw-utility":
        return val
    if form == "js-config":
        return val * 1000.0
    return None


def format_ms(ms):
    """Render a normalised duration without a pointless trailing zero."""
    if float(ms).is_integer():
        return f"{int(ms)}ms"
    return f"{ms:g}ms"


def out_of_band(ms):
    """
    True when a duration violates MOT-1's band. Zero is never a violation: zero
    means no motion, which is how a reduced-motion branch is written, and
    token-audit's parse_passes already treats 0 as an unconditional pass.
    """
    if ms is None or ms == 0:
        return False
    low, high = DURATION_BAND_MS
    return ms < low or ms > high


def _duration_finding(ms):
    """One MOT-1 duration violation, or None when the value is fine."""
    if not out_of_band(ms):
        return None
    low, high = DURATION_BAND_MS
    return (
        "error",
        "MOT-1",
        f"duration {format_ms(ms)} outside the {low}-{high}ms band",
        DURATION_SUGGEST,
    )


def _css_value_findings(value, form):
    """Every out-of-band duration literal inside one CSS value fragment."""
    out = []
    # A var() reference is a token reference, so it is never band-judged. Scrub
    # it before anything else, or a shorthand carrying a token easing reads as
    # one big pass and hides the literal duration next to it.
    scrubbed = re.sub(r"var\s*\(\s*--[^)]*\)", " ", value)
    shorthand = form == "css-shorthand"
    for part in scrubbed.split(","):
        # parse_passes is token-audit's value-level exemption, reused rather
        # than rewritten: 0, auto, none, inherit and the rest pass outright. A
        # shorthand is never one value, so this whole-fragment test belongs to
        # the longhand forms only.
        if not shorthand and token_audit.parse_passes(part):
            continue
        times = list(TIME_VALUE_RE.finditer(part))
        # In a transition or animation shorthand the FIRST time is the duration
        # and the second is the delay. A long delay is not a MOT-1 violation:
        # the control bounds how long motion runs, not how long it waits.
        if shorthand:
            times = times[:1]
        for m in times:
            finding = _duration_finding(normalise_ms(m.group(1), m.group(2), form))
            if finding:
                out.append(finding)
    return out


def mot_1_findings(scan_line, ctx):
    """
    MOT-1's two firing conditions over one line of candidate text: a
    `transition-all`, and a literal duration outside the band.

    A rule is one function over (scan_line, ctx) returning zero or more
    findings, so ratifying another control adds a function and a RULES entry
    rather than new plumbing.
    """
    out = []

    if TRANSITION_ALL_RE.search(scan_line):
        out.append(("error", "MOT-1", "transition-all", TRANSITION_ALL_SUGGEST))

    # A token reference is never band-judged, in either of its two spellings.
    # Blank the Tailwind CSS-variable shorthand out of the line first, so the
    # numeric-utility matcher cannot read the token name as a value.
    line = TW_DURATION_VAR_RE.sub(" ", scan_line)

    for m in TW_DURATION_RE.finditer(line):
        finding = _duration_finding(normalise_ms(m.group(1), None, "tw-utility"))
        if finding:
            out.append(finding)

    for m in TW_DURATION_ARBITRARY_RE.finditer(line):
        inner = m.group(1)
        if token_audit.parse_passes(inner):
            continue
        tm = TIME_VALUE_RE.fullmatch(inner.strip())
        if not tm:
            continue
        finding = _duration_finding(normalise_ms(tm.group(1), tm.group(2), "tw-arbitrary"))
        if finding:
            out.append(finding)

    for m in CSS_DURATION_LONGHAND_RE.finditer(line):
        out.extend(_css_value_findings(m.group(1), "css-longhand"))

    for m in CSS_DURATION_SHORTHAND_RE.finditer(line):
        out.extend(_css_value_findings(m.group(1), "css-shorthand"))

    for m in INLINE_STYLE_DURATION_RE.finditer(line):
        out.extend(_css_value_findings(m.group(1), "inline-style"))

    # A JS animation config counts in seconds. CSS has no bare `duration`
    # property, so the form is off in a stylesheet and cannot misread a value
    # there.
    if ctx["ext"] != ".css":
        for m in JS_DURATION_RE.finditer(line):
            finding = _duration_finding(
                normalise_ms(m.group(1), m.group(2), "js-config")
            )
            if finding:
                out.append(finding)

    return out


def slp_8_findings(scan_line, ctx):
    """
    SLP-8's line-local half: a cubic-bezier that overshoots, and the named
    overshoot utilities. Every finding is a NOTE. SLP-8 emits no ERROR line
    under any input, because whether a curve reads as bounce on a real surface
    is a judgment, and a check never blocks on a guess.
    """
    out = []

    for m in CUBIC_BEZIER_RE.finditer(scan_line):
        y1, y2 = float(m.group(2)), float(m.group(4))
        if y1 < 0 or y1 > 1 or y2 < 0 or y2 > 1:
            out.append(
                ("note", "SLP-8",
                 f"{m.group(0)} has a y control point outside 0 to 1, which overshoots",
                 None)
            )

    for m in NAMED_OVERSHOOT_RE.finditer(scan_line):
        out.append(("note", "SLP-8", f"overshoot easing '{m.group(1)}'", None))

    return out


def slp_8_spring_finding(text):
    """
    SLP-8's whole-node half: one spring config, read as an object rather than a
    line, because a config written across several lines answers "does it declare
    bounce or damping" wrongly one line at a time. Returns a finding or None.
    """
    bounce = SPRING_BOUNCE_RE.search(text)
    if bounce is not None:
        try:
            value = float(bounce.group(1))
        except ValueError:
            value = None
        if value is not None and value > 0:
            return (
                "note", "SLP-8",
                f"spring config with bounce {bounce.group(1)}, which overshoots",
                None,
            )
        return None
    if SPRING_BOUNCE_KEY_RE.search(text) or SPRING_DAMPING_RE.search(text):
        # A declared bounce or damping is an author decision on the record, so
        # there is nothing left to guess about.
        return None
    return (
        "note", "SLP-8",
        "spring config with no explicit bounce or damping value",
        None,
    )


# The rule table, keyed by control id. A control is a row here, so adding one is
# adding a row rather than threading a new call through the walk. MOT-2 has no
# row, and will not have one before a design lead ratifies it.
RULES = {
    "MOT-1": mot_1_findings,
    "SLP-8": slp_8_findings,
}


def line_is_exempt(tracker, raw_line, in_style):
    """
    The one exemption gate, called for every line before any rule runs, so an
    exempted line is never matched by anything.

    Today it carries one branch: the token-definition block, which is what keeps
    MOT-1 quiet about the `:root` run defining `--motion-story: 600ms` and the
    two `--ease-*` beziers. The tracker is stateful, so this has to be called on
    every line rather than only on candidate lines.

    When MOT-2 is ratified, its file-level exemptions (the declared code mirror
    lib/motion.ts and its drift test) go inside this function, not at the call
    sites.
    """
    return tracker.update(raw_line, in_style)


def spring_candidates(candidates):
    """
    The innermost spring-config nodes. A `{ transition: { type: "spring" } }`
    matches at both levels; the inner object is the config, and reporting the
    outer one too would double every finding.
    """
    springs = [c for c in candidates if c["surface"] == "spring-config"]
    out = []
    for cand in springs:
        outer = (cand["line"], cand["column"], cand["end_line"], cand["end_column"])
        contains_another = False
        for other in springs:
            if other is cand:
                continue
            inner = (other["line"], other["column"], other["end_line"], other["end_column"])
            if (outer[0], outer[1]) <= (inner[0], inner[1]) and \
               (inner[2], inner[3]) <= (outer[2], outer[3]):
                contains_another = True
                break
        if not contains_another:
            out.append(cand)
    return out


def check_file(filepath, rules=None, candidates=None):
    """
    Scan a single file. Returns a list of ERROR / NOTE strings.

    `rules` (additive, optional): a set of control ids to keep (e.g. {"MOT-1"}).
    When None every rule runs. Operational errors are never filtered by it.
    `candidates`: this file's records from checklib.astgrep_scan(). Omit it and
    the file is scanned on its own; scan_paths() passes a pre-grouped list so a
    whole tree costs one ast-grep invocation.
    """
    rule_filter = set(rules) if rules is not None else None
    results = []
    ext = os.path.splitext(filepath)[1].lower()
    if ext not in TARGET_EXTENSIONS:
        return results

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
    code_by_line = checklib.surface_lines(source, candidates, ("code",))
    style_lines = token_audit.style_region_lines(candidates)
    tracker = token_audit.TokenDefTracker(ext)
    ctx = {"ext": ext, "path": filepath}

    springs_by_line = {}
    for cand in spring_candidates(candidates):
        springs_by_line.setdefault(cand["line"], []).append(cand["text"])

    seen = set()

    def record(lineno, finding):
        kind, ctl, found, suggest = finding
        if rule_filter is not None and ctl not in rule_filter:
            return
        key = (lineno, kind, ctl, found)
        if key in seen:
            return
        seen.add(key)
        if kind == "error":
            results.append(checklib.emit_error(rel, lineno, ctl, found, suggest))
        else:
            results.append(f"NOTE {rel}:{lineno} [{ctl}] {found}, verify manually")

    for lineno, raw_line in enumerate(lines, start=1):
        line = raw_line.rstrip("\n")
        if line_is_exempt(tracker, line, lineno in style_lines):
            continue

        scan_line = code_by_line.get(lineno, "")
        if scan_line.strip():
            for ctl in sorted(RULES):
                for finding in RULES[ctl](scan_line, ctx):
                    record(lineno, finding)

        for text in springs_by_line.get(lineno, ()):
            finding = slp_8_spring_finding(text)
            if finding:
                record(lineno, finding)

    return results


def scan_paths(paths, rules=None):
    """
    Walk paths, collect ERROR / NOTE lines. `rules` is passed straight through.

    checklib.iter_target_files() stays the single walk policy and the file list
    is handed to ast-grep explicitly: letting ast-grep walk a directory would
    import .gitignore semantics the Python walker does not have, and a gitignored
    source file would be skipped silently.

    Raises checklib.AstGrepError when ast-grep is missing, too old or broken.
    """
    all_results = []
    files = []
    for kind, val in checklib.iter_target_files(paths, TARGET_EXTENSIONS):
        if kind == "missing":
            print(f"ERROR {CHECK_NAME}: path not found: {val}")
            all_results.append(f"ERROR {CHECK_NAME}: path not found: {val}")
        else:
            files.append(val)
    by_file = checklib.group_candidates(checklib.astgrep_scan(files, CHECK_NAME))
    for val in files:
        all_results.extend(
            check_file(val, rules, by_file.get(os.path.realpath(val), []))
        )
    return all_results


# ── Self-test ──────────────────────────────────────────────────────────────────

def run_self_test():
    import shutil
    import tempfile

    failures = []
    case_count = 0

    def run(content, ext, rules=None):
        with tempfile.NamedTemporaryFile(
            suffix=ext, mode="w", delete=False, encoding="utf-8"
        ) as tf:
            tf.write(content)
            tf.flush()
            res = check_file(tf.name, rules)
        os.unlink(tf.name)
        return res

    def assert_error(name, content, ext, expected_ctl, needle=None):
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        errs = [r for r in res if r.startswith("ERROR")]
        hit = [e for e in errs if f"[{expected_ctl}]" in e
               and (needle is None or needle in e)]
        if not hit:
            failures.append(
                f"FAIL {name}: expected an [{expected_ctl}] ERROR"
                f"{'' if needle is None else ' naming ' + needle}; got: {res}"
            )

    def assert_note_only(name, content, ext, needle=None):
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        errs = [r for r in res if r.startswith("ERROR")]
        notes = [r for r in res if r.startswith("NOTE")]
        if errs:
            failures.append(f"FAIL {name}: expected no ERROR; got: {errs}")
        wanted = [n for n in notes if "[SLP-8]" in n and n.endswith("verify manually")
                  and (needle is None or needle in n)]
        if not wanted:
            failures.append(f"FAIL {name}: expected an SLP-8 NOTE; got: {res}")

    def assert_clean(name, content, ext):
        nonlocal case_count
        case_count += 1
        res = run(content, ext)
        if res:
            failures.append(f"FAIL {name}: expected silence; got: {res}")

    # ── MOT-1: transition-all ─────────────────────────────────────────────────
    assert_error("transition-all in a className is an error",
                 '<div className="transition-all duration-200" />', ".tsx",
                 "MOT-1", "transition-all")
    assert_error("transition-all behind a variant prefix still fires",
                 '<div className="hover:transition-all" />', ".tsx", "MOT-1")
    assert_clean("a named transition property is fine",
                 '<div className="transition-colors duration-200" />', ".tsx")

    # ── MOT-1: both ends of the band fire ─────────────────────────────────────
    assert_error("duration-500 is over the band",
                 '<div className="transition-opacity duration-500" />', ".tsx",
                 "MOT-1", "500ms")
    assert_error("duration-50 is under the band",
                 '<div className="transition-opacity duration-50" />', ".tsx",
                 "MOT-1", "50ms")
    assert_clean("duration-200 is in band",
                 '<div className="transition-opacity duration-200" />', ".tsx")
    assert_clean("duration-100 sits on the lower bound",
                 '<div className="transition-opacity duration-100" />', ".tsx")
    assert_clean("duration-300 sits on the upper bound",
                 '<div className="transition-opacity duration-300" />', ".tsx")
    # Zero means no motion, which is how a reduced-motion branch is written.
    assert_clean("duration-0 never fires",
                 '<div className="transition-opacity duration-0" />', ".tsx")

    # ── MOT-1: the other duration forms ───────────────────────────────────────
    assert_error("an arbitrary duration value is read for its unit",
                 '<div className="duration-[0.5s]" />', ".tsx", "MOT-1", "500ms")
    assert_clean("an in-band arbitrary duration value is fine",
                 '<div className="duration-[250ms]" />', ".tsx")
    assert_error("a CSS longhand duration is banded",
                 ".fade { transition-duration: 500ms; }", ".css", "MOT-1", "500ms")
    assert_error("a CSS animation-duration is banded",
                 ".spin { animation-duration: 2s; }", ".css", "MOT-1", "2000ms")
    assert_error("a CSS shorthand duration is banded",
                 ".fade { transition: opacity 450ms ease-out; }", ".css",
                 "MOT-1", "450ms")
    assert_clean("an in-band CSS shorthand is fine",
                 ".fade { transition: opacity 200ms ease-out; }", ".css")
    # A token easing beside a literal duration must not swallow the duration.
    assert_error("a token easing does not hide an out-of-band duration",
                 ".fade { transition: opacity 500ms var(--ease-out); }", ".css",
                 "MOT-1", "500ms")
    # The second time in a shorthand is the delay. MOT-1 bounds how long motion
    # runs, not how long it waits, so a long delay is not a violation.
    assert_clean("a long delay in a shorthand is not a duration",
                 ".fade { transition: opacity 200ms 500ms ease-out; }", ".css")
    assert_error("the duration still fires when a delay follows it",
                 ".fade { transition: opacity 500ms 100ms ease-out; }", ".css",
                 "MOT-1", "500ms")
    # Each comma-separated component of a shorthand is its own transition.
    assert_error("each comma-separated transition is banded on its own",
                 ".fade { transition: opacity 200ms, transform 800ms; }", ".css",
                 "MOT-1", "800ms")
    assert_error("an inline-style duration is banded",
                 '<div style={{ transitionDuration: "500ms" }} />', ".tsx",
                 "MOT-1", "500ms")
    assert_clean("an in-band inline-style duration is fine",
                 '<div style={{ transitionDuration: "200ms" }} />', ".tsx")

    # ── MOT-1: seconds are read as seconds in a JS animation config ───────────
    assert_error("a JS config duration is seconds",
                 'const t = { transition: 1, duration: 0.5 };', ".ts",
                 "MOT-1", "500ms")
    assert_clean("an in-band JS config duration is fine",
                 '<m.div transition={{ duration: 0.2 }} />', ".tsx")
    assert_clean("a zero JS config duration is the reduced-motion branch",
                 '<m.div transition={reduced ? { duration: 0 } : { duration: 0.2 }} />',
                 ".tsx")

    # ── MOT-1: a token reference is never band-judged ─────────────────────────
    assert_clean("the Tailwind CSS-variable duration shorthand is a token reference",
                 '<div className="transition-colors duration-(--motion-fast)" />',
                 ".tsx")
    assert_clean("a var() duration is a token reference",
                 ".fade { transition-duration: var(--motion-slow); }", ".css")
    assert_clean("an identifier duration is a token reference",
                 '<m.div transition={{ duration: DUR.base }} />', ".tsx")

    # ── MOT-1: anchoring, which is what keeps display copy quiet ──────────────
    # A component that renders the motion token table prints 600ms as copy. No
    # vendored-file filter covers that file, so the anchor is the only thing
    # standing between the check and four false positives.
    assert_clean("a bare ms literal is not a hit without its anchor",
                 'const ROWS = [{ token: "--motion-story", ms: "600ms", '
                 'duration: DUR.story }];', ".ts")

    # ── MOT-1: the token-definition block never fires ─────────────────────────
    # --motion-story is deliberately outside the band. Whether a token's value is
    # in band is decided at its definition, and the definition is exempt.
    assert_clean("the :root motion token block is exempt",
                 ":root {\n  --motion-fast: 120ms;\n  --motion-base: 200ms;\n"
                 "  --motion-slow: 300ms;\n  --motion-story: 600ms;\n"
                 "  --ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);\n}", ".css")

    # ── SLP-8: notes, never errors ────────────────────────────────────────────
    assert_note_only("an unclear spring config is a note",
                     '<m.div transition={{ type: "spring", stiffness: 300 }} />',
                     ".tsx", "no explicit bounce or damping")
    assert_note_only("a stiffness key alone is a spring config",
                     'const t = { stiffness: 300, mass: 1 };', ".ts",
                     "no explicit bounce or damping")
    assert_note_only("a positive bounce is a note",
                     '<m.div transition={{ type: "spring", bounce: 0.4 }} />',
                     ".tsx", "bounce 0.4")
    assert_clean("a damped spring config is silence, not a pass claim",
                 '<m.div transition={{ type: "spring", stiffness: 300, '
                 'damping: 30 }} />', ".tsx")
    assert_clean("a zero bounce is silence",
                 '<m.div transition={{ type: "spring", bounce: 0 }} />', ".tsx")
    assert_note_only("a multi-line spring config is read as one object",
                     'const t = {\n  type: "spring",\n  stiffness: 300,\n};',
                     ".ts", "no explicit bounce or damping")
    assert_clean("a multi-line spring config that declares damping is silence",
                 'const t = {\n  type: "spring",\n  stiffness: 300,\n'
                 '  damping: 30,\n};', ".ts")
    assert_note_only("a cubic-bezier with y above 1 overshoots",
                     ".pop { transition-timing-function: cubic-bezier(0.5, 1.6, 0.5, 1); }",
                     ".css", "outside 0 to 1")
    assert_note_only("a cubic-bezier with a negative y overshoots",
                     ".pop { transition-timing-function: cubic-bezier(0.5, -0.4, 0.5, 1); }",
                     ".css", "outside 0 to 1")
    assert_clean("an in-range cubic-bezier is silence",
                 ".ok { transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }",
                 ".css")
    assert_note_only("a named overshoot utility is a note",
                     '<div className="transition-transform duration-200 ease-bounce" />',
                     ".tsx", "ease-bounce")
    # The bare word is prose or test data, not an easing. Matching it would
    # report the catalogue's own fails_when text.
    assert_clean("the word bounce on its own is not an easing",
                 'const q = { fails_when: ["Bounce easing on entrance"], q: "bounce" };',
                 ".ts")

    # ── SLP-8 never blocks a run ──────────────────────────────────────────────
    case_count += 1
    res = run('<m.div transition={{ type: "spring", stiffness: 300 }} />', ".tsx")
    if [r for r in res if r.startswith("ERROR")] or not res:
        failures.append(f"FAIL SLP-8 alone never yields an ERROR: got: {res}")

    # ── MOT-2 stays off ───────────────────────────────────────────────────────
    # A fixture violating both of MOT-2's matchable clauses: a raw 350ms literal
    # in component code where the token set exists, and a surface that animates
    # while declaring no motion token set.
    case_count += 1
    mot2_bait = (
        '<div className="transition-colors" style={{ transitionDuration: "350ms" }} />'
    )
    res = run(mot2_bait, ".tsx")
    if [r for r in res if "[MOT-2]" in r]:
        failures.append(f"FAIL MOT-2 is never reported: got: {res}")
    case_count += 1
    if "MOT-2" in VALID_RULES:
        failures.append("FAIL MOT-2 is not a valid --rules id")

    # ── Per-rule selection ────────────────────────────────────────────────────
    case_count += 1
    both = '<div className="transition-all ease-bounce" />'
    only_mot1 = run(both, ".tsx", {"MOT-1"})
    if [r for r in only_mot1 if "[SLP-8]" in r] or not [r for r in only_mot1 if "[MOT-1]" in r]:
        failures.append(f"FAIL --rules MOT-1 keeps MOT-1 only: got: {only_mot1}")
    case_count += 1
    only_slp8 = run(both, ".tsx", {"SLP-8"})
    if [r for r in only_slp8 if "[MOT-1]" in r] or not [r for r in only_slp8 if "[SLP-8]" in r]:
        failures.append(f"FAIL --rules SLP-8 keeps SLP-8 only: got: {only_slp8}")

    # parse_rules_flag: valid list, `=` form, absent, unknown id, MOT-2.
    case_count += 1
    a1 = ["--rules", "MOT-1,SLP-8", "some/path"]
    if parse_rules_flag(a1) != {"MOT-1", "SLP-8"} or a1 != ["some/path"]:
        failures.append(f"FAIL parse_rules_flag list: got {a1}")
    case_count += 1
    a2 = ["--rules=mot-1", "p"]
    if parse_rules_flag(a2) != {"MOT-1"} or a2 != ["p"]:
        failures.append(f"FAIL parse_rules_flag = form: got {a2}")
    case_count += 1
    if parse_rules_flag(["p"]) is not None:
        failures.append("FAIL parse_rules_flag absent: expected None")
    case_count += 1
    try:
        parse_rules_flag(["--rules", "MOT-2", "p"])
        failures.append("FAIL --rules MOT-2 is a usage error while MOT-2 is proposed")
    except ValueError as exc:
        if "MOT-2" not in str(exc) or "MOT-1" not in str(exc):
            failures.append(f"FAIL --rules MOT-2 names the id and the valid set: {exc}")

    # ── The rule body carries no vendored-path special case ───────────────────
    # Suppression is the file layer's job (detector.ignoreFiles), so a vendored
    # path handed to this script directly still reports. Verifiable by
    # inspection too: the source names no vendored directory.
    case_count += 1
    src = open(os.path.abspath(__file__), encoding="utf-8").read()
    # The rule body: this file with the module docstring and the self-test cut
    # away, so an assertion cannot satisfy itself by quoting what it forbids.
    body = src.split('"""', 2)[-1].split("def run_self_test", 1)[0]
    if "components/ui" in body or "shadcn" in body:
        failures.append("FAIL the rule body names a vendored path")
    case_count += 1
    vendored = os.path.join("components", "ui")
    tmpdir = tempfile.mkdtemp(prefix="motion-scan-vendored-")
    os.makedirs(os.path.join(tmpdir, vendored), exist_ok=True)
    vpath = os.path.join(tmpdir, vendored, "button.tsx")
    with open(vpath, "w", encoding="utf-8") as fh:
        fh.write('export const cls = "transition-all";\n')
    vres = [r for r in check_file(vpath) if r.startswith("ERROR")]
    if not vres:
        failures.append("FAIL a vendored path handed in directly still reports")
    shutil.rmtree(tmpdir, ignore_errors=True)

    # ── The exemption machinery is imported, not duplicated ───────────────────
    # This file defines no custom-property-block tracker, no token-region matcher
    # and no value-passthrough of its own; it calls token-audit's.
    case_count += 1
    defines_own = any(
        marker in body for marker in
        ("class TokenDefTracker", "CUSTOM_PROP_RE =", "DX_TOKENS_OPEN_RE =",
         "def parse_passes")
    )
    uses_imported = (
        "token_audit.TokenDefTracker(" in body
        and "token_audit.parse_passes(" in body
        and "token_audit.style_region_lines(" in body
    )
    if defines_own or not uses_imported:
        failures.append("FAIL the exemption machinery is imported, never copied")

    # ── Fixtures ──────────────────────────────────────────────────────────────
    # fail-* expects at least one ERROR; pass-* expects total silence; note-*
    # expects at least one NOTE and no ERROR. Every exclusion this check makes
    # has a pass-* or note-* fixture standing behind it.
    fixtures_dir = os.path.join(_CHECKS_DIR, "fixtures", CHECK_NAME)
    for fname in sorted(os.listdir(fixtures_dir)):
        case_count += 1
        fpath = os.path.join(fixtures_dir, fname)
        res = check_file(fpath)
        errs = [r for r in res if r.startswith("ERROR")]
        notes = [r for r in res if r.startswith("NOTE")]
        if fname.startswith("fail-"):
            if not errs:
                failures.append(f"FAIL fixture {fname}: expected >=1 ERROR; got none")
        elif fname.startswith("note-"):
            if errs or not notes:
                failures.append(
                    f"FAIL fixture {fname}: expected NOTE lines and no ERROR; got: {res}"
                )
        elif fname.startswith("pass-"):
            if res:
                failures.append(f"FAIL fixture {fname}: expected silence; got: {res}")
        else:
            failures.append(
                f"FAIL fixture {fname}: name it fail-, pass- or note- so the "
                f"self-test knows what to assert"
            )

    # ── The provisioning contract ─────────────────────────────────────────────
    def check_eq(name, want, got):
        nonlocal case_count
        case_count += 1
        if want != got:
            failures.append(f"FAIL {name}: want: {want!r}; got: {got!r}")

    checklib.astgrep_provisioning_cases(
        "motion-scan.py",
        os.path.join("fixtures", CHECK_NAME, "fail-transition-all.tsx"),
        check_eq,
    )

    checklib.report_self_test(failures, case_count)


# ── Entry point ────────────────────────────────────────────────────────────────

# MOT-2 is absent by design, so `--rules MOT-2` fails as a usage error rather
# than silently matching nothing. Ratification adds the id here.
VALID_RULES = {"MOT-1", "SLP-8"}

USAGE = (
    "Usage: python3 checks/motion-scan.py [--rules MOT-1,SLP-8] "
    "<path>... | --self-test"
)


def parse_rules_flag(args):
    """Additive `--rules MOT-1,SLP-8` (or `--rules=MOT-1`). Removes the flag from
    `args` in place; returns the rule-id set (or None when absent). Raises
    ValueError on an unknown or empty rule id so the caller can fail as a usage
    error; the default (no flag) runs every rule."""
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
    try:
        rules = parse_rules_flag(args)
    except ValueError as exc:
        print(f"ERROR {CHECK_NAME}: {exc}")
        sys.exit(1)
    if not args:
        print(USAGE)
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
    # NOTE lines alone never fail a run: SLP-8 reports and the reviewer judges.
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
