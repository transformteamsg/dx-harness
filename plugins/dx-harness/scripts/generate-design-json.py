#!/usr/bin/env python3
"""
generate-design-json.py - generate a product repo's `.dx/design.json` from its `DESIGN.md`.

`DESIGN.md` is the human-owned per-product design language file (this product's own
decisions and deviations, never catalog-rule restatements); `.dx/design.json` is its
generated typed projection: only what the checks and the design reviewer consume, plus
`catalog_version` for staleness detection. Spec, read it first: `docs/DESIGN-CONTEXT.md`.

The parse is deterministic (stdlib only):
  - Split `DESIGN.md` on `## ` headings; map each to a json key (Essence -> essence,
    Colour/Color -> colour, Typography -> typography, Tokens -> tokens,
    Motion -> motion, Voice & Tone / Tone weighting / Tone -> tone,
    Layout system -> layout_system, Components -> components, Guardrails -> guardrails,
    Overrides -> overrides; any other heading is slugified so nothing is dropped).
  - Strip HTML comments from the section body (guidance never reaches the json).
  - A bulleted `- key: value` line becomes a structured field: an integer literal -> int,
    a `[...]` JSON array -> list, else the string verbatim. A section with field lines
    AND prose keeps both: the fields, plus the remaining prose under a reserved
    `prose` key. A section with no field lines becomes its prose verbatim; an empty
    section produces no key.
  - Guardrails: each bullet projects as one string in a list (bullets there are
    instructions, not fields, so a colon inside one never splits it).
  - Overrides: one structured line per standing override:
      - <CONTROL-ID> (<tier>): <adjusted rule> - reason: <why>[; approver: <name>]
    The generator validates every line against `standards/catalog.yaml` (ships with the
    harness beside this script): the control id must exist, the stated tier must match
    the catalogue tier, L0 lines are always rejected, L1 needs a named approver,
    L1 and L2 both need a reason, and one control id may appear on at most one line
    (duplicate lines have no deterministic meaning downstream). One rejected line
    stops the write (exit 3).
  - `catalog_version` is stamped from catalog.yaml `meta.version`; `--check` also
    flags a projection stamped against an older catalogue.

Usage:
  python3 scripts/generate-design-json.py <repo-root>            # write .dx/design.json
  python3 scripts/generate-design-json.py <repo-root> --check    # exit 2 if stale (CI)
  python3 scripts/generate-design-json.py --self-test            # pure, no external writes

Exit codes:
  0  wrote the file / it is up to date
  1  no DESIGN.md (nothing to generate - portfolio defaults apply; not a failure)
  2  --check: .dx/design.json is stale vs DESIGN.md or the catalogue version
  3  the Overrides section did not validate; nothing was written
  4  the control catalogue is missing or unreadable (a tool failure: override
     validation and catalog_version stamping were not possible)
"""

import argparse
import datetime
import json
import os
import re
import sys

DESIGN_MD = "DESIGN.md"
DESIGN_JSON = os.path.join(".dx", "design.json")
GENERATED_FROM = "DESIGN.md"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_PATH = os.path.join(os.path.dirname(SCRIPT_DIR), "standards", "catalog.yaml")

# Canonical heading -> json key (lower-cased lookup). Unknown headings are slugified.
SECTION_MAP = {
    "essence": "essence",
    "colour": "colour",
    "color": "colour",
    "typography": "typography",
    "tokens": "tokens",
    "tone weighting": "tone",
    "tone": "tone",
    "voice & tone": "tone",
    "voice and tone": "tone",
    "motion": "motion",
    "layout system": "layout_system",
    "components": "components",
    "guardrails": "guardrails",
    "overrides": "overrides",
}

H2_RE = re.compile(r"^##\s+(.+?)\s*$")
FIELD_RE = re.compile(r"^\s*[-*]\s+(.+?)\s*:\s+(.+?)\s*$")
BULLET_RE = re.compile(r"^\s*[-*]\s+(.+?)\s*$")
COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)

# Overrides line grammar: - <CONTROL-ID> (<tier>): <adjusted rule> - reason: <why>[; approver: <name>]
OVERRIDE_RE = re.compile(
    r"^\s*[-*]\s+(?P<id>[A-Z][A-Z0-9]*-\d+)\s*\((?P<tier>[^)]+)\)\s*:\s*(?P<rest>.+?)\s*$"
)
# The reason separator: a spaced hyphen (canonical) or a spaced en/em dash (legacy files).
REASON_SPLIT_RE = re.compile(r"\s+[-–—]\s+reason:\s*")
APPROVER_SPLIT_RE = re.compile(r"\s*;\s*approver:\s*")

OVERRIDE_GRAMMAR = "- <CONTROL-ID> (<tier>): <adjusted rule> - reason: <why>[; approver: <name>]"


class OverridesError(ValueError):
    """Raised when the Overrides section has a rejected line; carries every error."""

    def __init__(self, errors):
        super().__init__("; ".join(errors))
        self.errors = list(errors)


def strip_comments(text):
    """Remove HTML comment blocks (multi-line included)."""
    return COMMENT_RE.sub("", text)


def slugify(heading):
    s = re.sub(r"[^a-z0-9]+", "_", heading.strip().lower()).strip("_")
    return s or "section"


def heading_to_key(heading):
    return SECTION_MAP.get(heading.strip().lower()) or slugify(heading)


def coerce_value(raw):
    """Coerce a field value: int literal -> int, JSON array -> list, else string verbatim."""
    s = raw.strip()
    if re.fullmatch(r"-?\d+", s):
        return int(s)
    if s.startswith("[") and s.endswith("]"):
        try:
            v = json.loads(s)
            if isinstance(v, list):
                return v
        except ValueError:
            pass
    return s


def _clean_key(k):
    return k.strip().strip("`*").strip()


def field_lines(body):
    """Every `- key: value` bullet in `body` as a (key, value) pair, in document
    order, repeats included (comments pre-stripped). `parse_fields` collapses these
    into a dict; a consumer that must see how many times a key was written, or which
    one came first, reads them here."""
    pairs = []
    for line in body.splitlines():
        m = FIELD_RE.match(line)
        if not m:
            continue
        key = _clean_key(m.group(1))
        if key:
            pairs.append((key, coerce_value(m.group(2))))
    return pairs


def parse_fields(body):
    """The `- key: value` fields in `body` as a dict (comments pre-stripped). A key
    written twice keeps its last value; `field_lines` is where both survive."""
    return dict(field_lines(body))


def _is_field_line(line):
    m = FIELD_RE.match(line)
    return bool(m and _clean_key(m.group(1)))


def section_value(body):
    """Structured fields, prose, or both. A mixed section keeps its fields AND its
    prose (the prose lands under a reserved `prose` key); fields-only stays a dict;
    prose-only stays a string; empty produces no key (None)."""
    body = strip_comments(body)
    fields = parse_fields(body)
    prose = "\n".join(
        ln.strip() for ln in body.splitlines() if ln.strip() and not _is_field_line(ln)
    ).strip()
    if fields and prose:
        out = dict(fields)
        out["prose"] = prose
        return out
    if fields:
        return fields
    return prose or None


def guardrails_value(body):
    """Guardrail bullets project as a list of strings (a colon inside a bullet never
    splits it into a field). A bullet-less section falls back to prose."""
    body = strip_comments(body)
    bullets = []
    for ln in body.splitlines():
        m = BULLET_RE.match(ln)
        if m:
            bullets.append(m.group(1))
    if bullets:
        return bullets
    prose = "\n".join(ln.strip() for ln in body.splitlines() if ln.strip()).strip()
    return prose or None


def parse_overrides(body):
    """Parse the Overrides section (comments pre-stripped). Returns (items, errors).
    Enforces the line grammar and the stated tier's field rules: L0 is always
    rejected, L1 needs an approver, L1 and L2 both need a reason. One control id
    may appear on at most one line: duplicates are rejected, because downstream
    consumers keep one adjusted rule per control and two lines would have no
    deterministic meaning."""
    items, errors = [], []
    seen = set()
    for raw in body.splitlines():
        line = raw.strip()
        if not line:
            continue
        m = OVERRIDE_RE.match(line)
        if not m:
            errors.append(
                f'cannot parse the override line "{line}". '
                f"Use: {OVERRIDE_GRAMMAR}"
            )
            continue
        cid = m.group("id")
        tier = m.group("tier").strip().upper()
        rest = m.group("rest").strip()

        if cid in seen:
            errors.append(
                f"{cid} appears on more than one override line. Keep one line per "
                f"control: merge the adjusted rules into a single line."
            )
            continue
        seen.add(cid)

        parts = REASON_SPLIT_RE.split(rest, maxsplit=1)
        rule = parts[0].strip()
        reason = approver = None
        if len(parts) == 2:
            tail = parts[1].strip()
            ap = APPROVER_SPLIT_RE.split(tail, maxsplit=1)
            reason = ap[0].strip() or None
            if len(ap) == 2:
                approver = ap[1].strip() or None

        if tier == "L0":
            errors.append(
                f"{cid} is an L0 control and can never be overridden. Remove this "
                f"line. If the rule seems wrong, start a rule proposal."
            )
            continue
        if tier not in ("L1", "L2"):
            errors.append(
                f'{cid}: "{tier}" is not a tier. State the control\'s catalogue '
                f"tier (L1 or L2)."
            )
            continue
        if tier == "L1" and not approver:
            errors.append(
                f"{cid} is L1: a standing override needs a named approver. "
                f"Add `; approver: <name>`."
            )
            continue
        if not reason:
            errors.append(
                f"{cid} is {tier}: a standing override needs a reason. "
                f"Add `- reason: <why>`."
            )
            continue

        item = {"control": cid, "tier": tier, "rule": rule, "reason": reason}
        if approver:
            item["approver"] = approver
        items.append(item)
    return items, errors


def validate_against_catalog(items, controls):
    """Check every override's control id exists in the catalogue and its stated tier
    matches the catalogue tier. Returns a list of error strings."""
    errors = []
    for it in items:
        cat_tier = controls.get(it["control"])
        if cat_tier is None:
            errors.append(
                f'unknown control id "{it["control"]}": it is not in '
                f"standards/catalog.yaml. Check the id there and fix the line."
            )
        elif cat_tier == "L0":
            errors.append(
                f"{it['control']} is an L0 control and can never be overridden. "
                f"Remove this line. If the rule seems wrong, start a rule proposal."
            )
        elif cat_tier != it["tier"]:
            errors.append(
                f"{it['control']} is tier {cat_tier} in standards/catalog.yaml, "
                f"not {it['tier']}. State the catalogue tier."
            )
    return errors


def load_catalog(path=None):
    """Line-parse `standards/catalog.yaml` (stdlib only, no PyYAML): meta.version plus
    a {control id: tier} map. Raises OSError when the file is unreadable."""
    path = path or CATALOG_PATH
    version = None
    controls = {}
    in_meta = False
    current = None
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            if re.match(r"^meta:\s*$", line):
                in_meta = True
                continue
            if re.match(r"^\S", line):
                in_meta = False
            if in_meta and version is None:
                mv = re.match(r"""\s+version:\s*["']?([^"'#\n]+?)["']?\s*$""", line)
                if mv:
                    version = mv.group(1).strip()
            mid = re.match(r"\s*-\s+id:\s*([A-Z][A-Z0-9]*-\d+)\s*$", line)
            if mid:
                current = mid.group(1)
                controls.setdefault(current, None)
                continue
            mt = re.match(r"\s+tier:\s*(L\d)\b", line)
            if mt and current:
                controls[current] = mt.group(1)
    return {"version": version, "controls": controls}


def split_sections(text):
    """Yield (heading, body) for every `## ` section. h1 and h3+ are ignored."""
    sections = []
    heading = None
    lines = []
    for line in text.splitlines():
        m = H2_RE.match(line)
        if m:
            if heading is not None:
                sections.append((heading, "\n".join(lines)))
            heading = m.group(1).strip()
            lines = []
        elif heading is not None:
            lines.append(line)
    if heading is not None:
        sections.append((heading, "\n".join(lines)))
    return sections


def parse_sections(text, controls=None):
    """Map DESIGN.md -> {json_key: value} for every non-empty section. Raises
    OverridesError (carrying every error) when an Overrides line is rejected;
    pass `controls` (a {control id: tier} map) to also validate ids and tiers
    against the catalogue."""
    result = {}
    errors = []
    for heading, body in split_sections(text):
        key = heading_to_key(heading)
        if key == "overrides":
            items, errs = parse_overrides(strip_comments(body))
            errors.extend(errs)
            if controls is not None:
                errors.extend(validate_against_catalog(items, controls))
            if items:
                result["overrides"] = items
        elif key == "guardrails":
            val = guardrails_value(body)
            if val is not None:
                result["guardrails"] = val
        else:
            val = section_value(body)
            if val is not None:
                result[key] = val
    if errors:
        raise OverridesError(errors)
    return result


def build_document(text, *, now=None, catalog=None):
    """Full .dx/design.json document: header keys (with catalog_version stamped from
    catalog.yaml meta.version), then one key per section. Raises OverridesError when
    the Overrides section is rejected."""
    if catalog is None:
        catalog = load_catalog()
    ts = now or datetime.datetime.now(datetime.timezone.utc)
    doc = {
        "generated_from": GENERATED_FROM,
        "generated_at": ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    if catalog.get("version"):
        doc["catalog_version"] = catalog["version"]
    doc.update(parse_sections(text, controls=catalog.get("controls")))
    return doc


def _without_ts(doc):
    return {k: v for k, v in doc.items() if k != "generated_at"}


def read_design_md(repo_root):
    path = os.path.join(repo_root, DESIGN_MD)
    if not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def read_design_json(repo_root):
    path = os.path.join(repo_root, ".dx", "design.json")
    if not os.path.isfile(path):
        return None
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (ValueError, OSError):
        return None


def write_design_json(repo_root, doc):
    out_dir = os.path.join(repo_root, ".dx")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "design.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(doc, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    return out_path


def is_stale(repo_root, text, catalog=None):
    """True if .dx/design.json is missing, unreadable, or differs from a fresh
    generation (ignoring the always-changing generated_at timestamp). A stale
    catalog_version differs from the fresh stamp, so it counts as stale too."""
    fresh = _without_ts(build_document(text, catalog=catalog))
    existing = read_design_json(repo_root)
    if existing is None:
        return True
    return _without_ts(existing) != fresh


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if "--self-test" in argv:
        return run_self_test()

    p = argparse.ArgumentParser(
        description="Generate .dx/design.json from a product repo's DESIGN.md."
    )
    p.add_argument("repo_root", help="product repo root (the directory containing DESIGN.md)")
    p.add_argument("--check", action="store_true",
                   help="exit 2 if .dx/design.json is stale vs DESIGN.md; write nothing (CI)")
    p.add_argument("--self-test", action="store_true", help="run the pure self-test")
    args = p.parse_args(argv)

    text = read_design_md(args.repo_root)
    if text is None:
        print(f"no DESIGN.md at {os.path.join(args.repo_root, DESIGN_MD)} — nothing to "
              f"generate. Portfolio defaults apply (this is not a failure); add a DESIGN.md "
              f"only if this product's parameters differ from the defaults.")
        return 1

    try:
        catalog = load_catalog()
    except OSError as exc:
        print(f"cannot read the control catalogue at {CATALOG_PATH}: {exc}. "
              f"Override validation and catalog_version stamping need it; "
              f"fix the harness install and rerun.")
        return 4

    if args.check:
        try:
            stale = is_stale(args.repo_root, text, catalog=catalog)
        except OverridesError as exc:
            for e in exc.errors:
                print(f"ERROR overrides: {e}")
            print(f"REJECTED: the Overrides section in {DESIGN_MD} did not validate. "
                  f"Fix the lines above, then regenerate.")
            return 3
        if stale:
            existing = read_design_json(args.repo_root) or {}
            stamped = existing.get("catalog_version")
            current = catalog.get("version")
            if stamped and current and stamped != current:
                print(f"STALE: {os.path.join(args.repo_root, DESIGN_JSON)} is stamped "
                      f"catalog_version {stamped}, but the catalogue is now {current}. "
                      f"Regenerate to re-stamp: "
                      f"python3 {os.path.basename(__file__)} {args.repo_root}")
            else:
                print(f"STALE: {os.path.join(args.repo_root, DESIGN_JSON)} is out of date vs "
                      f"DESIGN.md — regenerate with: "
                      f"python3 {os.path.basename(__file__)} {args.repo_root}")
            return 2
        print(f"OK: {os.path.join(args.repo_root, DESIGN_JSON)} is up to date with DESIGN.md")
        return 0

    try:
        doc = build_document(text, catalog=catalog)
    except OverridesError as exc:
        for e in exc.errors:
            print(f"ERROR overrides: {e}")
        print(f"REJECTED: the Overrides section in {DESIGN_MD} did not validate; "
              f"{DESIGN_JSON} was not written. Fix the lines above, then regenerate.")
        return 3
    out_path = write_design_json(args.repo_root, doc)
    n = len([k for k in doc if k not in ("generated_from", "generated_at", "catalog_version")])
    print(f"OK: wrote {out_path} ({n} section(s) from DESIGN.md, "
          f"catalog_version {doc.get('catalog_version', 'unstamped')})")
    return 0


# ── Self-test (pure — filesystem writes confined to a TemporaryDirectory) ────────

def run_self_test():
    import contextlib
    import io
    import tempfile

    failures = []
    case_count = 0

    def check(name, cond):
        nonlocal case_count
        case_count += 1
        if not cond:
            failures.append(f"FAIL {name}")

    def quiet(fn, *a, **k):
        with contextlib.redirect_stdout(io.StringIO()):
            return fn(*a, **k)

    def overrides_errors(text, controls=None):
        try:
            parse_sections(text, controls=controls)
        except OverridesError as exc:
            return exc.errors
        return []

    sample = (
        "# DESIGN.md — Test\n\n"
        "## Colour\n"
        "<!-- SECRET_COMMENT_TOKEN must never reach the json -->\n"
        "- primary: --tw-blue #0064FF\n\n"
        "## Tone weighting\n"
        "Follows content §6. Product: neutral, steady.\n\n"
        "## Layout system\n"
        "- columns: 12\n"
        "- gutter: space-4\n"
        "- breakpoints: [360, 768, 1280]\n"
        "- maxContentWidth: 1280px\n\n"
        "## Frobnicator\n"
        "- x: 1\n"
    )
    sections = parse_sections(sample)

    expected = {
        "colour": {"primary": "--tw-blue #0064FF"},
        "tone": "Follows content §6. Product: neutral, steady.",
        "layout_system": {
            "columns": 12,
            "gutter": "space-4",
            "breakpoints": [360, 768, 1280],
            "maxContentWidth": "1280px",
        },
        "frobnicator": {"x": 1},
    }

    # 1. roundtrip: whole parse matches the expected structure
    check("roundtrip parse matches expected", sections == expected)

    # 2. structured colour: hex/token string preserved verbatim
    check("colour primary preserved", sections["colour"]["primary"] == "--tw-blue #0064FF")

    # 3. number coercion: integer literal -> int
    check("columns coerced to int", sections["layout_system"]["columns"] == 12
          and isinstance(sections["layout_system"]["columns"], int))

    # 4. array coercion: [..] -> list
    check("breakpoints coerced to list",
          sections["layout_system"]["breakpoints"] == [360, 768, 1280]
          and isinstance(sections["layout_system"]["breakpoints"], list))

    # 5. token string with unit is NOT coerced to a number
    check("maxContentWidth stays string", sections["layout_system"]["maxContentWidth"] == "1280px")

    # 6. prose fallback: a section with no field lines is a string
    check("tone is prose string", isinstance(sections["tone"], str))

    # 7. HTML comments never reach the json
    check("comment stripped from output", "SECRET_COMMENT_TOKEN" not in json.dumps(sections))

    # 8. unknown heading is slugified, not dropped
    check("unknown heading slugified", sections.get("frobnicator") == {"x": 1})

    # 9. section omission: only present sections produce keys
    only_colour = parse_sections("## Colour\n- primary: x\n")
    check("section omission", only_colour == {"colour": {"primary": "x"}})

    # 10. build_document adds the header keys and stamps catalog_version
    fake_catalog = {"version": "9.9", "controls": {"TOK-1": "L1", "MOT-1": "L2",
                                                   "CMP-7": "L2", "A11Y-1": "L0"}}
    doc = build_document(sample, catalog=fake_catalog)
    check("document header keys",
          doc["generated_from"] == "DESIGN.md" and "generated_at" in doc)
    check("catalog_version stamped from meta.version", doc.get("catalog_version") == "9.9")

    # 10b. mixed section: fields AND prose both survive (the fields-OR-prose fix)
    mixed = ("## Components\n"
             "- manifest: .dx/component-manifest.json\n"
             "Buttons pair a solid primary with a ghost secondary.\n")
    got = parse_sections(mixed)["components"]
    check("mixed section keeps its fields", got.get("manifest") == ".dx/component-manifest.json")
    check("mixed section keeps its prose",
          got.get("prose") == "Buttons pair a solid primary with a ghost secondary.")

    # 10c. new heading map: Essence / Typography / Tokens / Voice & Tone
    named = parse_sections("## Essence\nCalm tools.\n\n## Voice & Tone\nSteady.\n\n"
                           "## Typography\n- base: 16/24\n\n## Tokens\n- prefix: --tw-\n")
    check("essence maps to essence", named.get("essence") == "Calm tools.")
    check("voice & tone maps to tone", named.get("tone") == "Steady.")
    check("typography and tokens map", named.get("typography") == {"base": "16/24"}
          and named.get("tokens") == {"prefix": "--tw-"})

    # 10d. guardrails: bullets with colons stay whole strings in a list
    guard = parse_sections("## Guardrails\n"
                           "- Check the manifest first.\n"
                           "- Marks are load-bearing: never truncate them.\n")
    check("guardrails project as a list",
          guard.get("guardrails") == ["Check the manifest first.",
                                      "Marks are load-bearing: never truncate them."])

    # ── Overrides parsing and tier validation ─────────────────────────────────
    controls = fake_catalog["controls"]

    # 15. a valid L2 line (reason, no approver) parses
    ok_l2 = parse_sections(
        "## Overrides\n"
        "- MOT-1 (L2): entrances may run to 240ms on full-page loads "
        "- reason: staged hydration causes pop-in at 160ms\n",
        controls=controls)
    check("valid L2 override parses", ok_l2.get("overrides") == [{
        "control": "MOT-1", "tier": "L2",
        "rule": "entrances may run to 240ms on full-page loads",
        "reason": "staged hydration causes pop-in at 160ms"}])

    # 16. a valid L1 line (reason + approver) parses
    ok_l1 = parse_sections(
        "## Overrides\n"
        "- TOK-1 (L1): the print stylesheet may use raw hex "
        "- reason: print targets have no token layer; approver: J. Tan\n",
        controls=controls)
    check("valid L1 override parses", ok_l1.get("overrides") == [{
        "control": "TOK-1", "tier": "L1",
        "rule": "the print stylesheet may use raw hex",
        "reason": "print targets have no token layer",
        "approver": "J. Tan"}])

    # 17. legacy em-dash separator before reason: still accepted
    dash = parse_sections(
        "## Overrides\n"
        "- MOT-1 (L2): entrances may run to 240ms — reason: staged hydration\n",
        controls=controls)
    check("em-dash reason separator accepted",
          dash["overrides"][0]["reason"] == "staged hydration")

    # 18. an L0 line is always rejected
    errs = overrides_errors("## Overrides\n- A11Y-1 (L0): softer contrast - reason: brand\n",
                            controls=controls)
    check("L0 override rejected", any("can never be overridden" in e for e in errs))

    # 18b. an L0 control mislabeled with another tier is still rejected
    errs = overrides_errors("## Overrides\n- A11Y-1 (L2): softer contrast - reason: brand\n",
                            controls=controls)
    check("mislabeled L0 control rejected", any("can never be overridden" in e for e in errs))

    # 19. L1 without an approver is rejected
    errs = overrides_errors("## Overrides\n- TOK-1 (L1): raw hex in print - reason: no tokens\n",
                            controls=controls)
    check("L1 without approver rejected", any("named approver" in e for e in errs))

    # 20. L2 without a reason is rejected
    errs = overrides_errors("## Overrides\n- MOT-1 (L2): entrances may run to 240ms\n",
                            controls=controls)
    check("L2 without reason rejected", any("needs a reason" in e for e in errs))

    # 21. an unknown control id is rejected with a catalogue pointer
    errs = overrides_errors("## Overrides\n- ZZZ-9 (L2): whatever - reason: because\n",
                            controls=controls)
    check("unknown control id rejected",
          any('unknown control id "ZZZ-9"' in e and "catalog.yaml" in e for e in errs))

    # 22. a stated tier that contradicts the catalogue is rejected
    errs = overrides_errors("## Overrides\n- CMP-7 (L1): calendar variant "
                            "- reason: term model; approver: J. Tan\n",
                            controls=controls)
    check("tier mismatch rejected", any("tier L2" in e and "not L1" in e for e in errs))

    # 23. a malformed line names itself and shows the grammar
    errs = overrides_errors("## Overrides\nnot an override line\n", controls=controls)
    check("malformed line rejected with grammar",
          any("cannot parse" in e and "<CONTROL-ID>" in e for e in errs))

    # 23b. duplicate control ids are rejected (no deterministic meaning downstream)
    errs = overrides_errors("## Overrides\n"
                            "- MOT-1 (L2): entrances to 240ms - reason: hydration\n"
                            "- MOT-1 (L2): entrances to 200ms - reason: contradicts\n",
                            controls=controls)
    check("duplicate control id rejected",
          any("more than one override line" in e for e in errs))
    check("duplicate rejection names the control", any("MOT-1" in e for e in errs))

    # 24. errors collect: every bad line is reported, not just the first
    errs = overrides_errors("## Overrides\n"
                            "- A11Y-1 (L0): x - reason: y\n"
                            "- MOT-1 (L2): no reason here\n",
                            controls=controls)
    check("all rejected lines reported", len(errs) == 2)

    # 25. the real catalogue parses: version present, A11Y-1 is L0
    real = load_catalog()
    check("real catalogue has a version", bool(real.get("version")))
    check("real catalogue maps A11Y-1 to L0", real["controls"].get("A11Y-1") == "L0")

    # 11. missing DESIGN.md -> exit 1
    with tempfile.TemporaryDirectory() as td:
        rc = quiet(main, [td])
        check("missing DESIGN.md exits 1", rc == 1)

    # 12. generate -> exit 0, file exists, parses as json with header + version stamp
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, DESIGN_MD), "w", encoding="utf-8") as fh:
            fh.write(sample)
        rc = quiet(main, [td])
        out = os.path.join(td, ".dx", "design.json")
        parsed = None
        if os.path.isfile(out):
            with open(out, encoding="utf-8") as fh:
                parsed = json.load(fh)
        check("generate exits 0", rc == 0)
        check("generate wrote parseable json",
              parsed is not None and parsed.get("generated_from") == "DESIGN.md")
        check("generate stamped catalog_version",
              parsed is not None and parsed.get("catalog_version") == real["version"])

        # 13. --check on a fresh file -> exit 0
        rc_fresh = quiet(main, [td, "--check"])
        check("check fresh exits 0", rc_fresh == 0)

        # 14. --check after DESIGN.md changes without regen -> exit 2 (stale)
        with open(os.path.join(td, DESIGN_MD), "a", encoding="utf-8") as fh:
            fh.write("\n## Motion\n- entrance: fade, 160ms\n")
        rc_stale = quiet(main, [td, "--check"])
        check("check stale exits 2", rc_stale == 2)

    # 26. --check flags a projection stamped against an older catalogue
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, DESIGN_MD), "w", encoding="utf-8") as fh:
            fh.write(sample)
        quiet(main, [td])
        out = os.path.join(td, ".dx", "design.json")
        with open(out, encoding="utf-8") as fh:
            stamped = json.load(fh)
        stamped["catalog_version"] = "0.0-older"
        with open(out, "w", encoding="utf-8") as fh:
            json.dump(stamped, fh)
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            rc_drift = main([td, "--check"])
        check("check catalogue drift exits 2", rc_drift == 2)
        check("drift message names both versions",
              "0.0-older" in buf.getvalue() and "re-stamp" in buf.getvalue())

    # 27. a rejected override -> exit 3, nothing written
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, DESIGN_MD), "w", encoding="utf-8") as fh:
            fh.write("## Overrides\n- A11Y-1 (L0): softer contrast - reason: brand\n")
        rc_bad = quiet(main, [td])
        check("rejected override exits 3", rc_bad == 3)
        check("rejected override writes nothing",
              not os.path.isfile(os.path.join(td, ".dx", "design.json")))

    # 28. an unreadable catalogue -> exit 4 (a tool failure, distinguishable
    # from exit 1's benign no-DESIGN.md so detect.py can propagate it)
    global CATALOG_PATH
    saved_catalog_path = CATALOG_PATH
    try:
        with tempfile.TemporaryDirectory() as td:
            with open(os.path.join(td, DESIGN_MD), "w", encoding="utf-8") as fh:
                fh.write(sample)
            CATALOG_PATH = os.path.join(td, "no-such-catalog.yaml")
            check("unreadable catalogue exits 4 on generate", quiet(main, [td]) == 4)
            check("unreadable catalogue exits 4 on --check",
                  quiet(main, [td, "--check"]) == 4)
    finally:
        CATALOG_PATH = saved_catalog_path

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        return 1
    print(f"SELF-TEST OK ({case_count} cases)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
