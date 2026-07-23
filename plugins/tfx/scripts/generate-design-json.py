#!/usr/bin/env python3
"""
generate-design-json.py — generate a product repo's `.tfx/design.json` from its `DESIGN.md`.

`DESIGN.md` is the human-owned per-product context file (visual parameters only, never
catalog-rule restatements); `.tfx/design.json` is its machine twin that checks and hooks
read. Spec — read it first: `docs/DESIGN-CONTEXT.md`.

The parse is deterministic (stdlib only):
  - Split `DESIGN.md` on `## ` headings; map each to a json key (Colour/Color -> colour,
    Tone weighting/Tone -> tone, Motion -> motion, Layout system -> layout_system,
    Components -> components; any other heading is slugified so nothing is dropped).
  - Strip HTML comments from the section body (guidance never reaches the json).
  - A bulleted `- key: value` line becomes a structured field: an integer literal -> int,
    a `[...]` JSON array -> list, else the string verbatim. A section with no field lines
    becomes its prose verbatim; an empty section produces no key.

Usage:
  python3 scripts/generate-design-json.py <repo-root>            # write .tfx/design.json
  python3 scripts/generate-design-json.py <repo-root> --check    # exit 2 if stale (CI)
  python3 scripts/generate-design-json.py --self-test            # pure, no external writes

Exit codes:
  0  wrote the file / it is up to date
  1  no DESIGN.md (nothing to generate — portfolio defaults apply; not a failure)
  2  --check: .tfx/design.json is stale vs DESIGN.md
"""

import argparse
import datetime
import json
import os
import re
import sys

DESIGN_MD = "DESIGN.md"
DESIGN_JSON = os.path.join(".tfx", "design.json")
GENERATED_FROM = "DESIGN.md"

# Canonical heading -> json key (lower-cased lookup). Unknown headings are slugified.
SECTION_MAP = {
    "colour": "colour",
    "color": "colour",
    "tone weighting": "tone",
    "tone": "tone",
    "motion": "motion",
    "layout system": "layout_system",
    "components": "components",
}

H2_RE = re.compile(r"^##\s+(.+?)\s*$")
FIELD_RE = re.compile(r"^\s*[-*]\s+(.+?)\s*:\s+(.+?)\s*$")
COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


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


def parse_fields(body):
    """Return the `- key: value` fields in `body`, in document order (comments pre-stripped)."""
    fields = {}
    for line in body.splitlines():
        m = FIELD_RE.match(line)
        if not m:
            continue
        key = _clean_key(m.group(1))
        if key:
            fields[key] = coerce_value(m.group(2))
    return fields


def section_value(body):
    """Structured fields if the section has any; else prose verbatim; None if empty."""
    body = strip_comments(body)
    fields = parse_fields(body)
    if fields:
        return fields
    prose = "\n".join(ln.strip() for ln in body.splitlines() if ln.strip()).strip()
    return prose or None


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


def parse_sections(text):
    """Map DESIGN.md -> {json_key: value} for every non-empty section."""
    result = {}
    for heading, body in split_sections(text):
        val = section_value(body)
        if val is not None:
            result[heading_to_key(heading)] = val
    return result


def build_document(text, *, now=None):
    """Full .tfx/design.json document: header keys, then one key per section."""
    ts = now or datetime.datetime.now(datetime.timezone.utc)
    doc = {
        "generated_from": GENERATED_FROM,
        "generated_at": ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    doc.update(parse_sections(text))
    return doc


def _without_ts(doc):
    return {k: v for k, v in doc.items() if k != "generated_at"}


def read_design_md(repo_root):
    path = os.path.join(repo_root, DESIGN_MD)
    if not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def write_design_json(repo_root, doc):
    out_dir = os.path.join(repo_root, ".tfx")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "design.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(doc, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    return out_path


def is_stale(repo_root, text):
    """True if .tfx/design.json is missing, unreadable, or differs from a fresh generation
    (ignoring the always-changing generated_at timestamp)."""
    out_path = os.path.join(repo_root, ".tfx", "design.json")
    fresh = _without_ts(build_document(text))
    if not os.path.isfile(out_path):
        return True
    try:
        with open(out_path, encoding="utf-8") as fh:
            existing = json.load(fh)
    except (ValueError, OSError):
        return True
    return _without_ts(existing) != fresh


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    if "--self-test" in argv:
        return run_self_test()

    p = argparse.ArgumentParser(
        description="Generate .tfx/design.json from a product repo's DESIGN.md."
    )
    p.add_argument("repo_root", help="product repo root (the directory containing DESIGN.md)")
    p.add_argument("--check", action="store_true",
                   help="exit 2 if .tfx/design.json is stale vs DESIGN.md; write nothing (CI)")
    p.add_argument("--self-test", action="store_true", help="run the pure self-test")
    args = p.parse_args(argv)

    text = read_design_md(args.repo_root)
    if text is None:
        print(f"no DESIGN.md at {os.path.join(args.repo_root, DESIGN_MD)} — nothing to "
              f"generate. Portfolio defaults apply (this is not a failure); add a DESIGN.md "
              f"only if this product's parameters differ from the defaults.")
        return 1

    if args.check:
        if is_stale(args.repo_root, text):
            print(f"STALE: {os.path.join(args.repo_root, DESIGN_JSON)} is out of date vs "
                  f"DESIGN.md — regenerate with: "
                  f"python3 {os.path.basename(__file__)} {args.repo_root}")
            return 2
        print(f"OK: {os.path.join(args.repo_root, DESIGN_JSON)} is up to date with DESIGN.md")
        return 0

    doc = build_document(text)
    out_path = write_design_json(args.repo_root, doc)
    n = len(_without_ts(doc)) - 1  # minus generated_from
    print(f"OK: wrote {out_path} ({n} section(s) from DESIGN.md)")
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

    # 10. build_document adds the header keys
    doc = build_document(sample)
    check("document header keys",
          doc["generated_from"] == "DESIGN.md" and "generated_at" in doc)

    # 11. missing DESIGN.md -> exit 1
    with tempfile.TemporaryDirectory() as td:
        rc = quiet(main, [td])
        check("missing DESIGN.md exits 1", rc == 1)

    # 12. generate -> exit 0, file exists, parses as json with header
    with tempfile.TemporaryDirectory() as td:
        with open(os.path.join(td, DESIGN_MD), "w", encoding="utf-8") as fh:
            fh.write(sample)
        rc = quiet(main, [td])
        out = os.path.join(td, ".tfx", "design.json")
        parsed = None
        if os.path.isfile(out):
            with open(out, encoding="utf-8") as fh:
                parsed = json.load(fh)
        check("generate exits 0", rc == 0)
        check("generate wrote parseable json",
              parsed is not None and parsed.get("generated_from") == "DESIGN.md")

        # 13. --check on a fresh file -> exit 0
        rc_fresh = quiet(main, [td, "--check"])
        check("check fresh exits 0", rc_fresh == 0)

        # 14. --check after DESIGN.md changes without regen -> exit 2 (stale)
        with open(os.path.join(td, DESIGN_MD), "a", encoding="utf-8") as fh:
            fh.write("\n## Motion\n- entrance: fade, 160ms\n")
        rc_stale = quiet(main, [td, "--check"])
        check("check stale exits 2", rc_stale == 2)

    if failures:
        for f in failures:
            print(f)
        print(f"SELF-TEST FAILED ({len(failures)} failures, {case_count} cases run)")
        return 1
    print(f"SELF-TEST OK ({case_count} cases)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
